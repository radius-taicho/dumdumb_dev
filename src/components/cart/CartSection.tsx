import React, { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";
import { CartItemType } from "@/types/cart";

interface CartSectionProps {
  cartItems: CartItemType[];
  initialQuantities: { [key: string]: number };
}

export const CartSection: React.FC<CartSectionProps> = ({
  cartItems: initialCartItems,
  initialQuantities,
}) => {
  const [cartItems, setCartItems] = useState<CartItemType[]>(initialCartItems);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>(
    initialQuantities
  );
  const [isScrolled, setIsScrolled] = useState(false);

  // カート合計の計算
  const cartTotal = cartItems.reduce(
    (total, item) =>
      total + Number(item.item.price) * (quantities[item.id] || 1),
    0
  );

  // カート内のアイテム総数を計算
  const totalItemCount = Object.values(quantities).reduce(
    (sum, qty) => sum + qty,
    0
  );

  // スクロールイベントハンドラ
  useEffect(() => {
    const handleScroll = () => {
      const cartSection = document.getElementById("cart-section");
      if (cartSection) {
        const rect = cartSection.getBoundingClientRect();
        // カートセクションが画面上部から出始めたらスクロール状態に
        setIsScrolled(rect.top < 0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // 数量減少ハンドラ
  const handleQuantityDecrease = async (id: string) => {
    if (quantities[id] > 1) {
      try {
        const newQuantity = quantities[id] - 1;

        // APIを呼び出して数量を更新
        const response = await fetch("/api/cart/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cartItemId: id,
            quantity: newQuantity,
          }),
        });

        if (response.ok) {
          setQuantities({
            ...quantities,
            [id]: newQuantity,
          });
        } else {
          toast.error("数量の更新に失敗しました");
        }
      } catch (error) {
        console.error("Error updating quantity:", error);
        toast.error("数量の更新中にエラーが発生しました");
      }
    }
  };

  // 数量増加ハンドラ
  const handleQuantityIncrease = async (id: string) => {
    try {
      const cartItem = cartItems.find((item) => item.id === id);
      if (!cartItem) return;

      const newQuantity = quantities[id] + 1;

      // 在庫チェック
      const itemResponse = await fetch(`/api/items/${cartItem.itemId}`);
      if (!itemResponse.ok) {
        toast.error("アイテム情報の取得に失敗しました");
        return;
      }

      const itemData = await itemResponse.json();

      // サイズ別在庫チェック
      let hasEnoughInventory = false;
      if (itemData.hasSizes && cartItem.size) {
        const sizeInventory =
          itemData.itemSizes.find((s: any) => s.size === cartItem.size)
            ?.inventory || 0;
        hasEnoughInventory = sizeInventory >= newQuantity;
      } else {
        hasEnoughInventory = itemData.inventory >= newQuantity;
      }

      if (!hasEnoughInventory) {
        toast.error("在庫が不足しています");
        return;
      }

      // APIを呼び出して数量を更新
      const response = await fetch("/api/cart/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartItemId: id,
          quantity: newQuantity,
        }),
      });

      if (response.ok) {
        setQuantities({
          ...quantities,
          [id]: newQuantity,
        });
      } else {
        toast.error("数量の更新に失敗しました");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("数量の更新中にエラーが発生しました");
    }
  };

  // カートアイテム削除ハンドラ
  const handleRemoveItem = async (id: string) => {
    try {
      const response = await fetch("/api/cart/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartItemId: id,
        }),
      });

      if (response.ok) {
        // 成功したらカートアイテムリストから削除
        setCartItems(cartItems.filter((item) => item.id !== id));
        // 数量も削除
        const newQuantities = { ...quantities };
        delete newQuantities[id];
        setQuantities(newQuantities);

        toast.success("アイテムをカートから削除しました");
      } else {
        toast.error("アイテムの削除に失敗しました");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("アイテムの削除中にエラーが発生しました");
    }
  };

  return (
    <div id="cart-section" className="mb-12 relative">
      <h1 className="text-2xl font-bold mb-6">カートアイテム</h1>
      {cartItems.length > 0 ? (
        <div className="flex flex-col md:flex-row gap-4">
          {/* 左側フレーム：アイテム情報と数量調整 */}
          <div className="border rounded-lg p-6 flex-grow">
            <div className="space-y-8">
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  quantity={quantities[item.id] || 1}
                  onRemove={handleRemoveItem}
                  onQuantityDecrease={handleQuantityDecrease}
                  onQuantityIncrease={handleQuantityIncrease}
                />
              ))}
            </div>
          </div>

          {/* 右側フレーム：小計と購入ボタン */}
          <CartSummary
            totalItemCount={totalItemCount}
            cartTotal={cartTotal}
            isScrolled={isScrolled}
          />
        </div>
      ) : (
        <div className="text-center py-8 border rounded-lg">
          <p className="text-gray-500 mb-4">カートにアイテムはまだないよ...</p>
          <Link
            href="/"
            className="text-orange-500 hover:text-orange-600 underline"
          >
            ショッピングを始める
          </Link>
        </div>
      )}
    </div>
  );
};
