export const INITIAL_FILTERS_INCOMING = {
  page: 1,
  page_size: 20,
  processed: "all", // 'all', 'true', 'false'
  start_date: "",
  end_date: "",
};

export const INITIAL_VISIBLE_COLUMNS_INCOMING = {
  txhash: true,
  sender_address: true,
  amount: true,
  payment_token: true,
  processed: true,
  received_at: true,
  memo: false,
  // txhash_base64: false, // يمكنك إضافته إذا أردت عرضه
};

export const PROCESSED_STATUS_OPTIONS = [
  { value: "all", label: "جميع الحالات" },
  { value: "true", label: "معالجة" },
  { value: "false", label: "غير معالجة" },
];

// الأعمدة الأساسية لجدول incoming_transactions
export const BASE_COLUMNS_CONFIG_INCOMING = [
  { Header: "TX Hash", accessor: "txhash", align: "left" },
  { Header: "عنوان المرسل", accessor: "sender_address", align: "left" },
  { Header: "المبلغ", accessor: "amount", align: "right" },
  { Header: "رمز الدفع", accessor: "payment_token", align: "left" },
  { Header: "معالجة؟", accessor: "processed", align: "center" },
  { Header: "تاريخ الاستلام", accessor: "received_at", align: "left" },
  { Header: "ملاحظة (Memo)", accessor: "memo", align: "left" },
  // { Header: "TX Hash Base64", accessor: "txhash_base64", align: "left" },
];
