import { sendEmail, createEmailTemplate } from "../sendgrid";

export type OrderItem = {
  itemId: string;
  quantity: number;
  price: number;
  size?: string | null;
  item?: {
    name?: string;
    price?: number;
  };
};

export type Order = {
  id: string;
  totalAmount: number;
  subtotal?: number;
  shippingFee?: number;
  tax?: number;
  createdAt: Date | string;
  address: string;
  items: OrderItem[];
};

export type User = {
  email: string;
  name?: string;
};

/**
 * 注文確認メールのHTMLコンテンツを生成する
 */
export function generateOrderConfirmationEmail(
  order: Order,
  user: User
): string {
  // アイテムリストのHTML生成
  const itemsHtml = order.items
    .map((item) => {
      const itemName = item.item?.name || "アイテム名なし";
      const itemPrice = Number(item.price || item.item?.price || 0);
      const itemTotal = itemPrice * item.quantity;

      return `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${itemName}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${
          item.size || "-"
        }</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">¥${itemPrice.toLocaleString()}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${
          item.quantity
        }</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">¥${itemTotal.toLocaleString()}</td>
      </tr>
    `;
    })
    .join("");

  // 注文日時のフォーマット
  const orderDate = new Date(order.createdAt).toLocaleString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // 小計、送料、合計の計算
  const subtotal =
    order.subtotal ||
    order.items.reduce((sum, item) => {
      return sum + Number(item.price || 0) * item.quantity;
    }, 0);

  const shippingFee = order.shippingFee || 0;
  const tax = order.tax || Math.floor(subtotal * 0.1); // 10%の消費税
  const total = order.totalAmount;

  // メール本文HTML
  const emailContent = `
    <div>
      <h2 style="color: #f97316; margin-top: 0;">ご注文ありがとうございます</h2>
      
      <p>お客様のご注文を承りました。以下がご注文の詳細です。</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <p><strong>注文番号:</strong> ${order.id}</p>
        <p><strong>注文日時:</strong> ${orderDate}</p>
      </div>
      
      <h3 style="border-bottom: 2px solid #f97316; padding-bottom: 10px;">注文内容</h3>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f5f5f5;">
            <th style="padding: 10px; text-align: left;">アイテム名</th>
            <th style="padding: 10px; text-align: center;">サイズ</th>
            <th style="padding: 10px; text-align: right;">価格</th>
            <th style="padding: 10px; text-align: center;">数量</th>
            <th style="padding: 10px; text-align: right;">小計</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <table style="width: 100%;">
          <tr>
            <td style="padding: 5px;">小計</td>
            <td style="padding: 5px; text-align: right;">¥${subtotal.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 5px;">消費税</td>
            <td style="padding: 5px; text-align: right;">¥${tax.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 5px;">送料</td>
            <td style="padding: 5px; text-align: right;">¥${shippingFee.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 5px;"><strong>合計</strong></td>
            <td style="padding: 5px; text-align: right;"><strong>¥${total.toLocaleString()}</strong></td>
          </tr>
        </table>
      </div>
      
      <h3 style="border-bottom: 2px solid #f97316; padding-bottom: 10px;">お届け先情報</h3>
      <p>${order.address}</p>
      
      <div style="margin-top: 30px; background-color: #fff8f3; padding: 15px; border-radius: 4px;">
        <p>ご注文に関するご不明な点がございましたら、お気軽にお問い合わせください。</p>
      </div>
    </div>
  `;

  // メールテンプレートに本文を挿入
  return createEmailTemplate(emailContent);
}

/**
 * 注文確認メールを送信する関数
 */
export async function sendOrderConfirmationEmail(
  order: Order,
  user: User
): Promise<boolean> {
  const subject = `DumDumb - ご注文確認 [注文番号: ${order.id}]`;
  const htmlContent = generateOrderConfirmationEmail(order, user);

  return await sendEmail({
    to: user.email,
    subject,
    html: htmlContent,
  });
}
