// src/layouts/payments/payments.config.js

export const INITIAL_FILTERS = {
  page: 1,
  page_size: 20,
  status: "all",
  payment_method: "all",
  date_from: "",
  date_to: "",
};

export const INITIAL_VISIBLE_COLUMNS = {
  full_name: true,
  username: true,
  telegram_id: false,
  payment_token: false,
  tx_hash: false,
  amount: true,
  amount_received: true,
  payment_method: true,
  processed_at: true,
  error_message: false,
  status: true,
  subscription_type_name: true, // إضافة عمود نوع الاشتراك بحيث يكون مرئيًا افتراضيًا
};

export const STATUS_OPTIONS = [
  { value: "all", label: "جميع الحالات" },
  { value: "completed", label: "مكتملة" },
  { value: "pending", label: "قيد الانتظار" },
  { value: "failed", label: "فاشلة" },
  { value: "processing", label: "قيد المعالجة" },
];

export const PAYMENT_METHOD_OPTIONS = [
  { value: "all", label: "جميع الطرق" },
  { value: "credit_card", label: "بطاقة ائتمان" },
  { value: "bank_transfer", label: "تحويل بنكي" },
  { value: "paypal", label: "PayPal" },
  { value: "crypto", label: "عملات رقمية" },
];

// الأعمدة الأساسية
export const BASE_COLUMNS_CONFIG = [
  { Header: "الاسم الكامل", accessor: "full_name", align: "left" },
  { Header: "اسم المستخدم", accessor: "username", align: "left" },
  { Header: "معرف تيليجرام", accessor: "telegram_id", align: "left" },
  { Header: "رمز الدفع", accessor: "payment_token", align: "left" },
  { Header: "رقم العملية", accessor: "tx_hash", align: "left" },
  { Header: "المبلغ", accessor: "amount", align: "right" },
  { Header: "المبلغ المستلم", accessor: "amount_received", align: "right" },
  { Header: "طريقة الدفع", accessor: "payment_method", align: "left" },
  { Header: "تاريخ المعالجة", accessor: "processed_at", align: "left" },
  { Header: "رسالة الخطأ", accessor: "error_message", align: "left" },
  { Header: "الحالة", accessor: "status", align: "center" },
  { Header: "نوع الاشتراك", accessor: "subscription_type_name", align: "left" }, // إضافة عمود نوع الاشتراك
];
