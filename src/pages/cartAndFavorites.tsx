import React, { useEffect } from "react";
import { NextPage, GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import { CartSection } from "@/components/cart/CartSection";
import { FavoritesSection } from "@/components/cart/FavoritesSection";
import { RecommendedItems } from "@/components/cart/RecommendedItems";
import { CartItemType, FavoriteItemType } from "@/types/cart";

// ページのprops型
type CartAndFavoritesPageProps = {
  cartItems: CartItemType[];
  favoriteItems: FavoriteItemType[];
  error?: string;
};

const CartAndFavoritesPage: NextPage<CartAndFavoritesPageProps> = ({
  cartItems,
  favoriteItems,
  error,
}) => {
  const router = useRouter();
  const { data: session } = useSession();

  // ページ初期表示時、ハートボタンからの遷移時にお気に入りセクションにスクロール
  useEffect(() => {
    // ルートクエリの確認
    if (router.query.section === "favorites") {
      const favoritesSection = document.getElementById("favorites-section");
      if (favoritesSection) {
        // ヘッダー分の高さを考慮してスクロール位置を調整
        const yOffset = -72; // ヘッダー高さ + 余白
        const y =
          favoritesSection.getBoundingClientRect().top +
          window.pageYOffset +
          yOffset;

        window.scrollTo({ top: y, behavior: "auto" });
      }
    }
  }, [router.query]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">エラーが発生しました</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <a href="/" className="text-orange-500 hover:underline">
          ホームに戻る
        </a>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>カートとお気に入り | DumDumb</title>
        <meta
          name="description"
          content="DumDumbのカートとお気に入りアイテム"
        />
      </Head>
      <div className="container mx-auto px-4 py-8">
        {/* カートアイテムセクション */}
        <CartSection
          cartItems={cartItems}
          initialQuantities={cartItems.reduce(
            (acc, item) => ({ ...acc, [item.id]: item.quantity }),
            {}
          )}
        />

        {/* お気に入りアイテムセクション */}
        <FavoritesSection favoriteItems={favoriteItems} />

        {/* おすすめアイテムセクション */}
        <RecommendedItems cartItems={cartItems} favoriteItems={favoriteItems} />
      </div>
    </>
  );
};

// サーバーサイドでカートデータとお気に入りデータを取得
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      props: {
        cartItems: [],
        favoriteItems: [],
      },
    };
  }

  try {
    const userId = session.user.id;

    // ユーザーのカートを取得
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            item: {
              include: {
                // 1対多関係の代わりに多対多関係を使用
                characters: {
                  include: {
                    character: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // ユーザーのお気に入りを取得
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        item: {
          include: {
            // 1対多関係の代わりに多対多関係を使用
            characters: {
              include: {
                character: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // BigInt型をJSON化するために文字列に変換
    const serializedCartItems = cart?.items
      ? JSON.parse(
          JSON.stringify(cart.items, (key, value) =>
            typeof value === "bigint" ? value.toString() : value
          )
        )
      : [];

    const serializedFavorites = JSON.parse(
      JSON.stringify(favorites, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    // キャラクター情報を変換して正しい形式にする
    const cartItemsWithFormattedCharacters = serializedCartItems.map((item) => {
      const formattedCharacters = item.item.characters.map((ic) => ({
        id: ic.character.id,
        name: ic.character.name,
      }));

      return {
        ...item,
        item: {
          ...item.item,
          characters: formattedCharacters,
        },
      };
    });

    const favoriteItemsWithFormattedCharacters = serializedFavorites.map(
      (favorite) => {
        const formattedCharacters = favorite.item.characters.map((ic) => ({
          id: ic.character.id,
          name: ic.character.name,
        }));

        return {
          ...favorite,
          item: {
            ...favorite.item,
            characters: formattedCharacters,
          },
        };
      }
    );

    return {
      props: {
        cartItems: cartItemsWithFormattedCharacters,
        favoriteItems: favoriteItemsWithFormattedCharacters,
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      props: {
        cartItems: [],
        favoriteItems: [],
        error: "データの取得中にエラーが発生しました",
      },
    };
  }
};

export default CartAndFavoritesPage;
