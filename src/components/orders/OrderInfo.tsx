import React from 'react';

// 住所情報の型定義
export interface AddressDetails {
  zipCode: string;
  address: string;
  building: string;
  name: string;
}

interface OrderInfoProps {
  addressDetails: AddressDetails;
  paymentMethod: string;
  maskedCardNumber?: string;
  orderId: string;
  itemSubtotal: number;
  tax: number;
  shippingFee: number;
  orderTotal: number;
  translations: {
    deliveryAddress: string;
    paymentInfo: string;
    paymentMethod: string;
    cardNumber: string;
    orderId: string;
    purchaseSummary: string;
    subtotal: string;
    tax: string;
    shippingFee: string;
    totalAmount: string;
    printPage: string;
  };
}

/**
 * 注文情報（お届け先、支払い、明細）を表示するコンポーネント
 */
const OrderInfo: React.FC<OrderInfoProps> = ({
  addressDetails,
  paymentMethod,
  maskedCardNumber,
  orderId,
  itemSubtotal,
  tax,
  shippingFee,
  orderTotal,
  translations
}) => {
  return (
    <div className="border rounded-lg p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* お届け先 */}
        <div>
          <h2 className="font-semibold mb-4">{translations.deliveryAddress}</h2>
          <p>{addressDetails.name}</p>
          <p>{addressDetails.zipCode}</p>
          <p>{addressDetails.address}</p>
          {addressDetails.building && <p>{addressDetails.building}</p>}
        </div>

        {/* お支払い情報 */}
        <div>
          <h2 className="font-semibold mb-4">{translations.paymentInfo}</h2>
          <p>{translations.paymentMethod}{paymentMethod}</p>
          {maskedCardNumber && <p>{translations.cardNumber}{maskedCardNumber}</p>}
          <p className="text-xs text-gray-500 mt-2">
            {translations.orderId}{orderId.substring(0, 8)}...
          </p>
        </div>

        {/* 購入明細 */}
        <div>
          <h2 className="font-semibold mb-4">{translations.purchaseSummary}</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <p>{translations.subtotal}</p>
              <p>¥{itemSubtotal.toLocaleString()}</p>
            </div>
            <div className="flex justify-between">
              <p>{translations.tax}</p>
              <p>¥{tax.toLocaleString()}</p>
            </div>
            <div className="flex justify-between">
              <p>{translations.shippingFee}</p>
              <p>¥{shippingFee.toLocaleString()}</p>
            </div>
            <div className="flex justify-between font-semibold">
              <p>{translations.totalAmount}</p>
              <p>¥{orderTotal.toLocaleString()}</p>
            </div>
          </div>

          {/* 領収書リンク */}
          <div className="mt-4 text-right">
            <button
              onClick={() => window.print()}
              className="text-orange-500 hover:text-orange-600"
            >
              {translations.printPage}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 住所文字列をパースして構造化する
 * @param addressString 住所文字列
 * @returns 構造化された住所情報
 */
export const parseAddress = (addressString: string): AddressDetails => {
  // 例: 〒123-4567 東京都渋谷区渋谷1-1-1 サンプルマンション101号室 山田 太郎
  const parts = addressString.split(/\s+/);
  
  // 基本構造を想定
  let zipCode = '';
  let address = '';
  let building = '';
  let name = '';
  
  if (parts.length >= 1 && parts[0].startsWith('〒')) {
    zipCode = parts[0];
  }
  
  if (parts.length >= 2) {
    // 最後の部分を名前として扱う
    name = parts[parts.length - 1];
    
    // 残りの部分をアドレスとして扱う
    if (parts.length >= 3) {
      // 中間部分が建物名として解釈できるかチェック
      const middleParts = parts.slice(1, parts.length - 1);
      
      if (middleParts.length >= 2) {
        // 最後から2番目の部分を建物名として扱う可能性
        const possibleBuilding = middleParts[middleParts.length - 1];
        
        // 建物名っぽい特徴を持っているか（マンション、ハイツなど）
        if (/マンション|ハイツ|アパート|ビル|コーポ|号室/.test(possibleBuilding)) {
          building = possibleBuilding;
          address = middleParts.slice(0, middleParts.length - 1).join(' ');
        } else {
          address = middleParts.join(' ');
        }
      } else {
        address = middleParts.join(' ');
      }
    }
  }
  
  return {
    zipCode,
    address,
    building,
    name
  };
};

export default OrderInfo;
