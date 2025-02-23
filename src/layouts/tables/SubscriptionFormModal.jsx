import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import { DatePicker } from "@mui/lab";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";

const SubscriptionFormModal = ({
  open,
  onClose,
  onSubmit,
  initialValues = {},
  subscriptionTypes = [],
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    telegram_id: "",
    full_name: "",
    username: "",
    subscription_type_id: "",
    expiry_date: null,
  });

  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setFormData({
        telegram_id: initialValues.telegram_id || "",
        full_name: initialValues.full_name || "",
        username: initialValues.username || "",
        subscription_type_id: initialValues.subscription_type_id || "",
        expiry_date: initialValues.expiry_date ? new Date(initialValues.expiry_date) : null,
      });
    } else {
      // إعادة تعيين النموذج عند فتحه للإضافة
      setFormData({
        telegram_id: "",
        full_name: "",
        username: "",
        subscription_type_id: "",
        expiry_date: null,
      });
    }
  }, [initialValues, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, expiry_date: date });
  };

  const handleSubmit = () => {
    // تحقق بسيط من صحة البيانات (يمكن استبداله بمكتبة تحقق متقدمة مثل Formik أو React Hook Form)
    if (
      !formData.telegram_id ||
      !formData.full_name ||
      !formData.username ||
      !formData.subscription_type_id ||
      !formData.expiry_date
    ) {
      alert("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    // ضبط وقت التاريخ الافتراضي: ضبط الساعات والدقائق إلى قيمة افتراضية (00:00:01.600)
    const date = new Date(formData.expiry_date);
    date.setHours(0, 0, 1, 600);
    const processedData = {
      ...formData,
      expiry_date: date.toISOString(), // يتم إرسال التاريخ بصيغة ISO للـ API
    };
    onSubmit(processedData);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>{isEdit ? "تعديل الاشتراك" : "إضافة اشتراك جديد"}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Telegram ID"
            name="telegram_id"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.telegram_id}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Full Name"
            name="full_name"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.full_name}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Username"
            name="username"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.username}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Subscription Type"
            name="subscription_type_id"
            select
            fullWidth
            variant="outlined"
            value={formData.subscription_type_id}
            onChange={handleChange}
          >
            {subscriptionTypes.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </TextField>
          <DatePicker
            label="Expiry Date"
            value={formData.expiry_date}
            onChange={handleDateChange}
            renderInput={(params) => (
              <TextField margin="dense" fullWidth variant="outlined" {...params} />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary">
            إلغاء
          </Button>
          <Button onClick={handleSubmit} color="primary">
            {isEdit ? "تحديث" : "إضافة"}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default SubscriptionFormModal;
