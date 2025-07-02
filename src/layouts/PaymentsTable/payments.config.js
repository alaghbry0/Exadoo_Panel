// src/layouts/payments/payments.config.js

export const INITIAL_FILTERS = {
  page: 1,
  page_size: 20,
  sort_by: "created_at",
  sort_order: "desc",
  status: "all",
  payment_method: "all",
  start_date: null, // 💡 استخدام null للتواريخ
  end_date: null, // 💡 استخدام null للتواريخ
};

// ✅ --- هذا الكائن سيحدد أي الأعمدة مرئية عند تحميل الصفحة لأول مرة ---
export const INITIAL_VISIBLE_COLUMNS = {
  // أعمدة أساسية (مرئية)
  full_name: true,
  amount: true,
  payment_method: true,
  created_at: true, // 💡 غيرت processed_at إلى created_at ليكون أهم
  status: true,

  // أعمدة ثانوية (مخفية افتراضيًا)
  username: true,
  telegram_id: true,
  subscription_type_name: true,
  plan_name: true,
  amount_received: true,
  payment_token: false,
  tx_hash: false,
  processed_at: false,
  error_message: false,
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
  { Header: "المبلغ", accessor: "amount", align: "right" },
  { Header: "المبلغ المستلم", accessor: "amount_received", align: "right" },
  { Header: "رمز الدفع", accessor: "payment_token", align: "left" },
  { Header: "طريقة الدفع", accessor: "payment_method", align: "center" },
  { Header: "تاريخ الإنشاء", accessor: "created_at", align: "center" }, // 💡 إضافة created_at
  { Header: "الحالة", accessor: "status", align: "center" },
  { Header: "نوع الاشتراك", accessor: "subscription_type_name", align: "left" },
  { Header: "الخطة", accessor: "plan_name", align: "left" },
  // الأعمدة التي يمكن إظهارها

  { Header: "رقم العملية", accessor: "tx_hash", align: "left" },
  { Header: "تاريخ المعالجة", accessor: "processed_at", align: "center" },
  { Header: "رسالة الخطأ", accessor: "error_message", align: "left" },
];
