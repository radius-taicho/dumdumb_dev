/**
 * 多言語対応のための翻訳ユーティリティ
 */

// 注文履歴ページの翻訳
export const orderHistoryTranslations = {
  ja: {
    pageTitle: "お買い物履歴",
    pageDescription: "DumDumbでのお買い物履歴",
    noOrdersMessage: "お買い物履歴がまだないよ...",
    backToItems: "アイテム一覧へ戻る",
    otherItems: "他",
    quantity: "点",
    orderDate: "注文日",
    deliveryDate: "お届け日",
    totalQuantity: "合計",
    viewDetails: "注文詳細を見る",
    recommendations: "dumdumbからのおすすめ",
    sizeLabel: "サイズなし",
  },
  zh: {
    pageTitle: "购买历史",
    pageDescription: "DumDumb的购买历史",
    noOrdersMessage: "没有购买历史",
    backToItems: "返回アイテム列表",
    otherItems: "其他",
    quantity: "件",
    orderDate: "订购日",
    deliveryDate: "送货日",
    totalQuantity: "总计",
    viewDetails: "查看订单详情",
    recommendations: "DumDumb的推荐アイテム",
    sizeLabel: "无尺寸",
  },
  ko: {
    pageTitle: "구매 내역",
    pageDescription: "DumDumb 구매 내역",
    noOrdersMessage: "구매 내역이 없습니다",
    backToItems: "상품 목록으로 돌아가기",
    otherItems: "외",
    quantity: "개",
    orderDate: "주문일",
    deliveryDate: "배송일",
    totalQuantity: "합계",
    viewDetails: "주문 상세 보기",
    recommendations: "DumDumb의 추천 상품",
    sizeLabel: "사이즈 없음",
  },
  th: {
    pageTitle: "ประวัติการซื้อ",
    pageDescription: "ประวัติการซื้อที่ DumDumb",
    noOrdersMessage: "ไม่มีประวัติการซื้อ",
    backToItems: "กลับไปที่รายการสินค้า",
    otherItems: "อื่นๆ",
    quantity: "ชิ้น",
    orderDate: "วันที่สั่งซื้อ",
    deliveryDate: "วันที่จัดส่ง",
    totalQuantity: "รวม",
    viewDetails: "ดูรายละเอียดคำสั่งซื้อ",
    recommendations: "สินค้าแนะนำจาก DumDumb",
    sizeLabel: "ไม่มีขนาด",
  },
  en: {
    pageTitle: "Purchase History",
    pageDescription: "Your purchase history at DumDumb",
    noOrdersMessage: "No purchase history found",
    backToItems: "Back to items",
    otherItems: "others",
    quantity: "items",
    orderDate: "Order Date",
    deliveryDate: "Delivery Date",
    totalQuantity: "Total",
    viewDetails: "View Order Details",
    recommendations: "Recommended from DumDumb",
    sizeLabel: "No size",
  },
};

// 注文詳細ページの翻訳
export const orderDetailTranslations = {
  ja: {
    pageTitle: "お買い物履歴詳細",
    pageDescription: "注文番号 #{orderId} の詳細情報",
    loading: "読み込み中...",
    backToOrders: "注文一覧に戻る",
    deliveryAddress: "お届け先",
    paymentInfo: "お支払い情報",
    paymentMethod: "支払い方法: ",
    cardNumber: "カード番号: ",
    orderId: "注文ID: ",
    purchaseSummary: "購入明細",
    subtotal: "アイテムの小計",
    tax: "消費税",
    shippingFee: "送料",
    totalAmount: "ご請求額",
    printPage: "このページを印刷",
    purchasedItems: "購入アイテム一覧",
    orderDate: "注文日",
    deliveryDate: "お届け日",
    sizeLabel: "サイズなし",
    recommendations: "dumdumbからのオススメ",
    backToOrderList: "注文一覧へ戻る",
    creditCard: "クレジットカード",
    amazonPay: "Amazon Pay",
    otherPayment: "その他の支払い方法",
  },
  zh: {
    pageTitle: "购买详情",
    pageDescription: "订单号 #{orderId} 的详细信息",
    loading: "加载中...",
    backToOrders: "返回订单列表",
    deliveryAddress: "送货地址",
    paymentInfo: "支付信息",
    paymentMethod: "支付方式: ",
    cardNumber: "卡号: ",
    orderId: "订单ID: ",
    purchaseSummary: "购买摘要",
    subtotal: "アイテム小计",
    tax: "消费税",
    shippingFee: "运费",
    totalAmount: "应付金额",
    printPage: "打印此页",
    purchasedItems: "已购アイテム列表",
    orderDate: "订购日",
    deliveryDate: "送货日",
    sizeLabel: "无尺寸",
    recommendations: "DumDumb的推荐アイテム",
    backToOrderList: "返回订单列表",
    creditCard: "信用卡",
    amazonPay: "Amazon Pay",
    otherPayment: "其他支付方式",
  },
  ko: {
    pageTitle: "구매 내역 상세",
    pageDescription: "주문 번호 #{orderId}의 상세 정보",
    loading: "로딩 중...",
    backToOrders: "주문 목록으로 돌아가기",
    deliveryAddress: "배송지",
    paymentInfo: "결제 정보",
    paymentMethod: "결제 방법: ",
    cardNumber: "카드 번호: ",
    orderId: "주문 ID: ",
    purchaseSummary: "구매 내역",
    subtotal: "상품 소계",
    tax: "소비세",
    shippingFee: "배송비",
    totalAmount: "청구액",
    printPage: "이 페이지 인쇄",
    purchasedItems: "구매 상품 목록",
    orderDate: "주문일",
    deliveryDate: "배송일",
    sizeLabel: "사이즈 없음",
    recommendations: "DumDumb의 추천 상품",
    backToOrderList: "주문 목록으로 돌아가기",
    creditCard: "신용카드",
    amazonPay: "Amazon Pay",
    otherPayment: "기타 결제 방법",
  },
  th: {
    pageTitle: "รายละเอียดประวัติการซื้อ",
    pageDescription: "ข้อมูลรายละเอียดของคำสั่งซื้อ #{orderId}",
    loading: "กำลังโหลด...",
    backToOrders: "กลับไปที่รายการคำสั่งซื้อ",
    deliveryAddress: "ที่อยู่ในการจัดส่ง",
    paymentInfo: "ข้อมูลการชำระเงิน",
    paymentMethod: "วิธีการชำระเงิน: ",
    cardNumber: "หมายเลขบัตร: ",
    orderId: "รหัสคำสั่งซื้อ: ",
    purchaseSummary: "สรุปการซื้อ",
    subtotal: "ยอดรวมสินค้า",
    tax: "ภาษีมูลค่าเพิ่ม",
    shippingFee: "ค่าจัดส่ง",
    totalAmount: "ยอดที่ต้องชำระ",
    printPage: "พิมพ์หน้านี้",
    purchasedItems: "รายการสินค้าที่ซื้อ",
    orderDate: "วันที่สั่งซื้อ",
    deliveryDate: "วันที่จัดส่ง",
    sizeLabel: "ไม่มีขนาด",
    recommendations: "สินค้าแนะนำจาก DumDumb",
    backToOrderList: "กลับไปที่รายการคำสั่งซื้อ",
    creditCard: "บัตรเครดิต",
    amazonPay: "Amazon Pay",
    otherPayment: "วิธีการชำระเงินอื่นๆ",
  },
  en: {
    pageTitle: "Purchase History Details",
    pageDescription: "Order details for order #{orderId}",
    loading: "Loading...",
    backToOrders: "Back to orders",
    deliveryAddress: "Delivery Address",
    paymentInfo: "Payment Information",
    paymentMethod: "Payment Method: ",
    cardNumber: "Card Number: ",
    orderId: "Order ID: ",
    purchaseSummary: "Purchase Summary",
    subtotal: "Item Subtotal",
    tax: "Tax",
    shippingFee: "Shipping Fee",
    totalAmount: "Total Amount",
    printPage: "Print this page",
    purchasedItems: "Purchased Items",
    orderDate: "Order Date",
    deliveryDate: "Delivery Date",
    sizeLabel: "No size",
    recommendations: "Recommended from DumDumb",
    backToOrderList: "Back to order list",
    creditCard: "Credit Card",
    amazonPay: "Amazon Pay",
    otherPayment: "Other Payment Method",
  },
};

/**
 * ブラウザの言語設定から言語コードを取得する
 * 現在のプロジェクトで対応している言語のみを返す
 */
export const getBrowserLanguage = (): string => {
  try {
    if (typeof window === "undefined") return "ja"; // サーバーサイドではデフォルトを返す

    const fullLang = navigator.language.toLowerCase();
    const primaryLang = fullLang.split("-")[0];

    // 対応言語かチェック
    const supportedLanguages = ["ja", "zh", "ko", "th", "en"];
    if (supportedLanguages.includes(primaryLang)) {
      return primaryLang;
    }

    return "ja"; // デフォルトは日本語
  } catch (error) {
    return "ja";
  }
};

/**
 * 言語コードに基づいて翻訳テキストを取得する
 * @param translationSet 翻訳セット（orderHistoryTranslationsなど）
 * @param language 言語コード
 */
export const getTranslation = (translationSet: any, language: string) => {
  return translationSet[language] || translationSet.en;
};
