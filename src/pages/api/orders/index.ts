import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe/server";
import Stripe from "stripe";
import { Size } from "@prisma/client";
import { sendOrderConfirmationEmail } from "@/lib/email/order-confirmation";

type Data = {
  success: boolean;
  order?: any;
  error?: string;
  clientSecret?: string;
  requiresAction?: boolean;
  paymentIntentId?: string;
  debug?: any; // デバッグ情報を追加
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method Not Allowed" });
  }

  // セッションを取得して認証チェック
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ success: false, error: "Not authenticated" });
  }

  try {
    const {
      addressId,
      paymentMethodId,
      deliveryDate,
      deliveryTimeSlot,
      items,
      subtotal,
      shippingFee,
      tax,
      total,
    } = req.body;

    console.log("注文処理開始:", {
      userId: session.user.id,
      items: items.map((item) => ({
        itemId: item.itemId,
        size: item.size,
        quantity: item.quantity,
      })),
    });

    // 必須フィールドのバリデーション
    if (!addressId) {
      return res
        .status(400)
        .json({ success: false, error: "お届け先が選択されていません" });
    }

    if (!paymentMethodId) {
      return res
        .status(400)
        .json({ success: false, error: "支払い方法が選択されていません" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "アイテム情報が見つかりません" });
    }

    // 支払い方法を取得
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId },
    });

    if (!paymentMethod) {
      return res
        .status(400)
        .json({ success: false, error: "支払い方法が見つかりません" });
    }

    // 住所を取得
    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      return res
        .status(400)
        .json({ success: false, error: "お届け先が見つかりません" });
    }

    // ユーザー情報を取得（stripeCustomerId を含む）
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, name: true, stripeCustomerId: true },
    });

    const userId = session.user.id;

    // 在庫確認（先に一度確認しておく）
    let inventoryCheckResult;
    try {
      inventoryCheckResult = await checkInventory(items);
      console.log("在庫確認結果:", inventoryCheckResult);
    } catch (inventoryError) {
      console.error("在庫確認エラー:", inventoryError);
      return res.status(400).json({
        success: false,
        error: inventoryError.message,
        debug: inventoryError.details || undefined,
      });
    }

    // 支払い処理（決済方法によって異なる）
    if (
      paymentMethod.type === "CREDIT_CARD" &&
      paymentMethod.stripePaymentMethodId
    ) {
      // Stripe決済処理
      let paymentIntentId = null;
      let clientSecret = null;
      let requiresAction = false;

      try {
        console.log(
          `決済処理開始 - PaymentMethodID: ${paymentMethod.stripePaymentMethodId}`
        );

        // ユーザーのStripeカスタマーID取得・作成
        let stripeCustomerId = user?.stripeCustomerId;
        console.log(`既存のStripeカスタマーID: ${stripeCustomerId}`);

        // Stripeカスタマーがまだない場合は作成
        if (!stripeCustomerId && user?.email) {
          console.log("新規カスタマーを作成します");
          const customer = await stripe.customers.create({
            email: user.email,
            name: user.name || undefined,
            metadata: {
              userId: userId,
            },
          });

          stripeCustomerId = customer.id;
          console.log(`新規カスタマーID: ${stripeCustomerId}`);

          // ユーザーにStripeカスタマーIDを保存
          await prisma.user.update({
            where: { id: userId },
            data: { stripeCustomerId: customer.id },
          });
        }

        if (!stripeCustomerId) {
          return res.status(400).json({
            success: false,
            error:
              "ユーザー情報が正しく設定されていないため、決済を処理できません。",
          });
        }

        // ユーザーに関連付けられた全ての支払い方法を取得
        const customerPaymentMethods =
          await stripe.customers.listPaymentMethods(stripeCustomerId, {
            type: "card",
          });

        console.log(
          `既存の支払い方法数: ${customerPaymentMethods.data.length}`
        );

        // データベースから取得した支払い方法がカスタマーに存在するか確認
        const existingPaymentMethod = customerPaymentMethods.data.find(
          (pm) => pm.id === paymentMethod.stripePaymentMethodId
        );

        // 支払い方法の処理
        let paymentMethodIdToUse = paymentMethod.stripePaymentMethodId;

        // 既存の支払い方法がない場合
        if (!existingPaymentMethod) {
          console.log(
            "支払い方法がカスタマーに関連付けられていません。再アタッチを試みます。"
          );

          try {
            // 先に既存の支払い方法をデタッチする試み
            try {
              console.log(
                `支払い方法をデタッチします: ${paymentMethodIdToUse}`
              );
              await stripe.paymentMethods.detach(paymentMethodIdToUse);
              console.log("デタッチ成功");
            } catch (detachError) {
              console.log(
                "デタッチ中にエラーが発生しました（無視して続行）:",
                detachError instanceof Error
                  ? detachError.message
                  : String(detachError)
              );
            }

            // カスタマーに支払い方法をアタッチ
            console.log(`支払い方法を ${stripeCustomerId} に関連付けます`);
            await stripe.paymentMethods.attach(paymentMethodIdToUse, {
              customer: stripeCustomerId,
            });
            console.log("アタッチ成功");
          } catch (attachError) {
            console.error("支払い方法のアタッチに失敗しました:", attachError);

            // クライアントシークレットを返して新しいカード入力を促す
            const setupIntent = await stripe.setupIntents.create({
              customer: stripeCustomerId,
              payment_method_types: ["card"],
            });

            return res.status(400).json({
              success: false,
              error:
                "支払い方法に問題があります。新しいカード情報を入力してください。",
              clientSecret: setupIntent.client_secret,
              requiresAction: true,
            });
          }
        } else {
          console.log(
            `支払い方法がカスタマーに既に存在します: ${existingPaymentMethod.id}`
          );
        }

        // JPYは小数点を持たない通貨なので、整数に変換
        const amountInYen = Math.round(total);

        // アプリのドメイン（環境変数から取得するか、デフォルト値を使用）
        const appDomain =
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        console.log(
          `支払い処理実行 - 金額: ${amountInYen}円, 顧客ID: ${stripeCustomerId}`
        );

        // PaymentIntentの作成 - 必ずcustomerを指定
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountInYen,
          currency: "jpy",
          customer: stripeCustomerId,
          payment_method: paymentMethodIdToUse,
          confirm: true,
          return_url: `${appDomain}/checkout/complete`,
          automatic_payment_methods: {
            enabled: true,
            allow_redirects: "never",
          },
          metadata: {
            userId: session.user.id,
            addressId: addressId,
            orderType: "ecommerce",
          },
          receipt_email: user?.email || undefined,
        });

        console.log(
          `PaymentIntent作成成功 - ID: ${paymentIntent.id}, ステータス: ${paymentIntent.status}`
        );

        // 決済ステータスに応じた処理
        if (paymentIntent.status === "succeeded") {
          // 支払い成功の場合、在庫を減らし、注文を作成し、カートをクリアする
          console.log("決済成功 - トランザクション処理開始");

          let order;
          try {
            // すべての操作をトランザクション内で行う
            order = await prisma.$transaction(
              async (tx) => {
                // 1. 在庫確認（もう一度最新の状態を確認）
                console.log("トランザクション内での在庫再確認");
                const inventoryStatus = await validateInventoryInTransaction(
                  tx,
                  items
                );
                console.log("トランザクション内での在庫状態:", inventoryStatus);

                // 2. 在庫を減らす
                console.log("在庫減算処理開始");
                await decreaseInventory(tx, items);
                console.log("在庫減算完了");

                // 3. 注文を作成
                console.log("注文データ作成");
                const newOrder = await createOrderWithTransaction(
                  tx,
                  session.user.id,
                  address,
                  items,
                  total,
                  paymentIntent.id
                );
                console.log("注文データ作成完了: ID=", newOrder.id);

                // カートクリア
                console.log("カートクリア処理");
                await clearCartWithTransaction(tx, session.user.id);
                console.log("カートクリア完了");

                return newOrder;
              },
              {
                timeout: 10000, // タイムアウトを10秒に設定
              }
            );

            console.log("トランザクション処理成功");

            // 注文確認メールを送信
            try {
              console.log("注文確認メール送信開始");
              await sendOrderConfirmationEmail(order, user);
              console.log("注文確認メール送信完了");
            } catch (emailError) {
              // メール送信の失敗はユーザーフローを中断しない
              console.error("注文確認メール送信エラー:", emailError);
            }
          } catch (txError) {
            console.error("トランザクション処理エラー:", txError);

            // 在庫不足などの具体的なエラーメッセージをクライアントに返す
            let errorMessage = "注文処理中にエラーが発生しました。";
            let details = undefined;

            if (txError instanceof Error) {
              errorMessage = txError.message;
              details = (txError as any).details;
            }

            return res.status(400).json({
              success: false,
              error: errorMessage,
              debug: details,
            });
          }

          return res.status(201).json({
            success: true,
            order,
          });
        } else if (paymentIntent.status === "requires_action") {
          // 追加認証が必要な場合
          console.log("追加認証が必要です - クライアントに認証を依頼します");
          return res.status(200).json({
            success: true,
            requiresAction: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
          });
        } else {
          // その他の状態（処理中、失敗など）
          console.log(`想定外の決済ステータス: ${paymentIntent.status}`);
          return res.status(400).json({
            success: false,
            error: `決済処理に失敗しました: ${paymentIntent.status}`,
          });
        }
      } catch (stripeError) {
        console.error("Stripe決済エラー:", stripeError);

        // Stripeエラーの詳細な処理
        let errorMessage =
          "クレジットカード決済に失敗しました。カード情報をご確認ください。";

        if (stripeError instanceof Stripe.errors.StripeError) {
          // 特定のエラーコードに対する詳細なメッセージ
          if (stripeError.code === "payment_intent_authentication_failure") {
            errorMessage =
              "カード認証に失敗しました。別のカードをお試しいただくか、カード発行会社にお問い合わせください。";
          } else if (stripeError.code === "card_declined") {
            errorMessage =
              "カードが拒否されました。別のカードをお試しください。";
          } else if (stripeError.code === "expired_card") {
            errorMessage =
              "カードの有効期限が切れています。別のカードをお試しください。";
          } else if (
            stripeError.code === "payment_method_unattached_customer"
          ) {
            errorMessage =
              "支払い方法が正しく設定されていません。別の支払い方法をお試しください。";
          }
        }

        return res.status(400).json({
          success: false,
          error: errorMessage,
        });
      }
    } else if (
      paymentMethod.type === "AmazonPay" &&
      paymentMethod.amazonPayId
    ) {
      // Amazon Pay処理（将来的な実装用）
      console.log("Amazon Pay処理: ", paymentMethod.amazonPayId);

      let order;
      try {
        // 注文データを作成（トランザクションで在庫減少とセットで行う）
        order = await prisma.$transaction(async (tx) => {
          // 1. 在庫確認（もう一度最新の状態を確認）
          await validateInventoryInTransaction(tx, items);

          // 2. 在庫を減らす
          await decreaseInventory(tx, items);

          // 3. 注文を作成
          const newOrder = await createOrderWithTransaction(
            tx,
            session.user.id,
            address,
            items,
            total,
            `amazon_pay_${paymentMethod.amazonPayId}`
          );

          // 4. カートをクリア
          await clearCartWithTransaction(tx, session.user.id);

          return newOrder;
        });
      } catch (txError) {
        console.error("トランザクション処理エラー:", txError);
        return res.status(400).json({
          success: false,
          error:
            txError instanceof Error
              ? txError.message
              : "注文処理中にエラーが発生しました",
        });
      }

      // 注文確認メールを送信
      try {
        console.log("注文確認メール送信開始");
        await sendOrderConfirmationEmail(order, user);
        console.log("注文確認メール送信完了");
      } catch (emailError) {
        // メール送信の失敗はユーザーフローを中断しない
        console.error("注文確認メール送信エラー:", emailError);
      }

      return res.status(201).json({ success: true, order });
    } else if (paymentMethod.type === "OTHER") {
      // その他の支払い方法の処理
      console.log("その他の支払い方法の処理");

      let order;
      try {
        // 注文データを作成（トランザクションで在庫減少とセットで行う）
        order = await prisma.$transaction(async (tx) => {
          // 1. 在庫確認（もう一度最新の状態を確認）
          await validateInventoryInTransaction(tx, items);

          // 2. 在庫を減らす
          await decreaseInventory(tx, items);

          // 3. 注文を作成
          const newOrder = await createOrderWithTransaction(
            tx,
            session.user.id,
            address,
            items,
            total,
            `other_payment_${new Date().getTime()}`
          );

          // 4. カートをクリア
          await clearCartWithTransaction(tx, session.user.id);

          return newOrder;
        });
      } catch (txError) {
        console.error("トランザクション処理エラー:", txError);
        return res.status(400).json({
          success: false,
          error:
            txError instanceof Error
              ? txError.message
              : "注文処理中にエラーが発生しました",
        });
      }

      return res.status(201).json({ success: true, order });
    } else {
      return res.status(400).json({
        success: false,
        error: "対応していない支払い方法です",
      });
    }
  } catch (error) {
    console.error("Order creation error:", error);
    return res.status(500).json({
      success: false,
      error: "注文処理中にエラーが発生しました",
      debug: process.env.NODE_ENV === "development" ? String(error) : undefined,
    });
  }
}

// 在庫確認の関数（トランザクション外）
async function checkInventory(items) {
  const results = [];
  const validSizes = ["S", "M", "L", "XL", "XXL"];

  for (const item of items) {
    console.log(
      `在庫確認処理 - アイテムID: ${item.itemId}, サイズ: ${item.size}, 数量: ${item.quantity}`
    );

    // サイズのバリデーション
    if (item.size && !validSizes.includes(item.size)) {
      const error = new Error(`無効なサイズが指定されました: ${item.size}`);
      (error as any).details = { invalidSize: item.size, itemId: item.itemId };
      throw error;
    }

    const product = await prisma.item.findUnique({
      where: { id: item.itemId },
      include: { itemSizes: true },
    });

    if (!product) {
      const error = new Error(`アイテムID ${item.itemId} が見つかりません`);
      (error as any).details = { missingItemId: item.itemId };
      throw error;
    }

    // アイテム情報をログに記録
    const productInfo = {
      id: product.id,
      name: product.name,
      inventory: product.inventory,
      hasSizes: product.hasSizes,
      availableSizes: product.itemSizes.map((s) => ({
        size: s.size,
        inventory: s.inventory,
      })),
    };

    console.log(`アイテム情報:`, JSON.stringify(productInfo));
    results.push(productInfo);

    // サイズ指定がある場合はサイズごとの在庫をチェック
    if (item.size) {
      const sizeStock = product.itemSizes.find((s) => s.size === item.size);

      if (!sizeStock) {
        const error = new Error(
          `アイテムID ${item.itemId} のサイズ ${item.size} が見つかりません`
        );
        (error as any).details = {
          itemId: item.itemId,
          itemName: product.name,
          requestedSize: item.size,
          availableSizes: product.itemSizes.map((s) => s.size),
        };
        throw error;
      }

      if (sizeStock.inventory < item.quantity) {
        const error = new Error(
          `アイテム「${product.name}」のサイズ ${item.size} の在庫が不足しています。現在の在庫: ${sizeStock.inventory}`
        );
        (error as any).details = {
          itemId: item.itemId,
          itemName: product.name,
          size: item.size,
          requestedQuantity: item.quantity,
          availableQuantity: sizeStock.inventory,
        };
        throw error;
      }
    } else if (product.hasSizes) {
      // サイズ管理しているアイテムなのにサイズ指定がない
      const error = new Error(
        `アイテム「${product.name}」にはサイズの指定が必要です`
      );
      (error as any).details = {
        itemId: item.itemId,
        itemName: product.name,
        hasSizes: true,
        availableSizes: product.itemSizes.map((s) => s.size),
      };
      throw error;
    } else {
      // サイズ指定がない場合はアイテム全体の在庫をチェック
      if (product.inventory < item.quantity) {
        const error = new Error(
          `アイテム「${product.name}」の在庫が不足しています。現在の在庫: ${product.inventory}`
        );
        (error as any).details = {
          itemId: item.itemId,
          itemName: product.name,
          requestedQuantity: item.quantity,
          availableQuantity: product.inventory,
        };
        throw error;
      }
    }
  }

  return results;
}

// トランザクション内での在庫確認（より厳密なチェック）
async function validateInventoryInTransaction(tx, items) {
  const results = [];

  for (const item of items) {
    const product = await tx.item.findUnique({
      where: { id: item.itemId },
      include: { itemSizes: true },
    });

    if (!product) {
      throw new Error(`アイテムID ${item.itemId} が見つかりません`);
    }

    // サイズ指定がある場合はサイズごとの在庫をチェック
    if (item.size) {
      const sizeStock = product.itemSizes.find((s) => s.size === item.size);

      if (!sizeStock) {
        throw new Error(
          `アイテムID ${item.itemId} のサイズ ${item.size} が見つかりません`
        );
      }

      // トランザクション内での厳密なチェック - 他の同時購入がないか確認するため
      if (sizeStock.inventory < item.quantity) {
        throw new Error(
          `アイテム「${product.name}」のサイズ ${item.size} の在庫が不足しています。現在の在庫: ${sizeStock.inventory}`
        );
      }

      results.push({
        itemId: product.id,
        name: product.name,
        size: item.size,
        requestedQuantity: item.quantity,
        availableQuantity: sizeStock.inventory,
      });
    } else {
      // サイズ指定がない場合はアイテム全体の在庫をチェック
      if (product.inventory < item.quantity) {
        throw new Error(
          `アイテム「${product.name}」の在庫が不足しています。現在の在庫: ${product.inventory}`
        );
      }

      results.push({
        itemId: product.id,
        name: product.name,
        requestedQuantity: item.quantity,
        availableQuantity: product.inventory,
      });
    }
  }

  return results;
}

// 在庫を減らす関数（トランザクション内で使用）
async function decreaseInventory(tx, items) {
  for (const item of items) {
    const product = await tx.item.findUnique({
      where: { id: item.itemId },
      include: { itemSizes: true },
    });

    if (!product) {
      throw new Error(`アイテムID ${item.itemId} が見つかりません`);
    }

    // サイズ指定がある場合はサイズごとの在庫を減らす
    if (item.size) {
      const sizeStock = product.itemSizes.find((s) => s.size === item.size);

      if (!sizeStock) {
        throw new Error(
          `アイテムID ${item.itemId} のサイズ ${item.size} が見つかりません`
        );
      }

      if (sizeStock.inventory < item.quantity) {
        throw new Error(
          `アイテム「${product.name}」のサイズ ${item.size} の在庫が不足しています。現在の在庫: ${sizeStock.inventory}`
        );
      }

      // サイズの在庫を減らす - トランザクション内での更新
      await tx.itemSize.update({
        where: { id: sizeStock.id },
        data: { inventory: sizeStock.inventory - item.quantity },
      });

      console.log(
        `サイズ在庫を更新: アイテム=${product.name}, サイズ=${
          item.size
        }, 更新前=${sizeStock.inventory}, 更新後=${
          sizeStock.inventory - item.quantity
        }`
      );
    }

    // アイテム全体の在庫も減らす（サイズがあってもなくても）
    if (product.inventory < item.quantity) {
      throw new Error(
        `アイテム「${product.name}」の在庫が不足しています。現在の在庫: ${product.inventory}`
      );
    }

    // アイテム全体の在庫を減らす - トランザクション内での更新
    await tx.item.update({
      where: { id: item.itemId },
      data: { inventory: product.inventory - item.quantity },
    });

    console.log(
      `アイテム在庫を更新: アイテム=${product.name}, 更新前=${
        product.inventory
      }, 更新後=${product.inventory - item.quantity}`
    );
  }
}

// 注文データを作成する関数（トランザクション版）
async function createOrderWithTransaction(
  tx,
  userId,
  address,
  items,
  total,
  paymentReferenceId
) {
  return await tx.order.create({
    data: {
      userId: userId,
      totalAmount: total,
      paymentReferenceId: paymentReferenceId,
      address: `${address.postalCode} ${address.prefecture}${address.city}${
        address.line1
      } ${address.line2 || ""} ${address.name}`,
      items: {
        create: items.map((item) => ({
          itemId: item.itemId,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
        })),
      },
    },
    include: {
      items: true,
    },
  });
}

// カートをクリアする関数（トランザクション版）
async function clearCartWithTransaction(tx, userId) {
  const cart = await tx.cart.findUnique({
    where: { userId: userId },
  });

  if (cart) {
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
  }
}

// 注文データを作成する関数（従来版 - 互換性のために残す）
async function createOrder(userId, address, items, total, paymentReferenceId) {
  return await prisma.order.create({
    data: {
      userId: userId,
      totalAmount: total,
      paymentReferenceId: paymentReferenceId,
      address: `${address.postalCode} ${address.prefecture}${address.city}${
        address.line1
      } ${address.line2 || ""} ${address.name}`,
      items: {
        create: items.map((item) => ({
          itemId: item.itemId,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
        })),
      },
    },
    include: {
      items: true,
    },
  });
}

// カートをクリアする関数（従来版 - 互換性のために残す）
async function clearCart(userId) {
  const cart = await prisma.cart.findUnique({
    where: { userId: userId },
  });

  if (cart) {
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
  }
}
