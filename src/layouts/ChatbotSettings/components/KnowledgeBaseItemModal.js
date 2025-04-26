// src/layouts/ChatbotSettings/components/KnowledgeBaseItemModal.js
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  Chip,
  IconButton,
  Grid,
  Divider,
  Box,
  CircularProgress,
  Typography,
  InputAdornment,
  Paper,
  Fade,
  Card,
  Tooltip,
  CardContent,
} from "@mui/material";

// Icons
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import TitleIcon from "@mui/icons-material/Title";
import CategoryIcon from "@mui/icons-material/Category";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import AddIcon from "@mui/icons-material/Add";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";

import { addKnowledgeItem, updateKnowledgeItem, fetchKnowledgeBase } from "services/api";

function KnowledgeBaseItemModal({
  open,
  onClose,
  item,
  isEdit,
  categories,
  knowledgeBase,
  setKnowledgeBase,
  showSuccessMessage,
  showErrorMessage,
}) {
  // State for form fields
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    tags: [],
  });
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);

  // استمع للتغييرات في العنصر المحدد
  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || "",
        content: item.content || "",
        category: item.category || "",
        tags: item.tags || [],
      });
    } else {
      setFormData({
        title: "",
        content: "",
        category: "",
        tags: [],
      });
    }
    setErrors({});
    setTagInput("");
  }, [item, open]);

  // التحقق من صحة النموذج
  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "العنوان مطلوب";
    if (!formData.content.trim()) newErrors.content = "المحتوى مطلوب";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // تحديث حقول النموذج
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // إضافة علامة جديدة
  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !formData.tags.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmed],
      }));
      setTagInput("");
    }
  };

  // حذف علامة
  const handleDeleteTag = (tagToDelete) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToDelete),
    }));
  };

  // حفظ العنصر
  const handleSave = async () => {
    if (validateForm()) {
      setSaving(true);
      try {
        if (isEdit && item) {
          await updateKnowledgeItem(item.id, formData);
          showSuccessMessage("تم تحديث العنصر بنجاح");
        } else {
          await addKnowledgeItem(formData);
          showSuccessMessage("تم إضافة العنصر بنجاح");
        }

        // إعادة تحميل قاعدة المعرفة
        const refreshedData = await fetchKnowledgeBase({
          page: knowledgeBase.page,
          per_page: knowledgeBase.per_page,
        });

        // معالجة البيانات قبل تعيين الحالة
        const processedRefreshedItems =
          refreshedData.items?.map((item) => ({
            ...item,
            category: item.category || "عام",
            tags: Array.isArray(item.tags) ? item.tags : [],
          })) || [];

        // قم بتعيين الحالة بالبيانات المعالجة
        setKnowledgeBase({
          items: processedRefreshedItems,
          total: refreshedData.total || 0,
          page: refreshedData.page || 1,
          per_page: refreshedData.per_page || 10,
          pages: refreshedData.pages || 1,
        });

        onClose();
      } catch (error) {
        console.error("Error saving knowledge item:", error);
        showErrorMessage(isEdit ? "حدث خطأ أثناء تحديث العنصر" : "حدث خطأ أثناء إضافة العنصر");
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      dir="rtl"
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        },
      }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          p={2}
          sx={{
            backgroundColor: "#f8fafc",
            borderBottom: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <MDTypography variant="h6" fontWeight="medium" display="flex" alignItems="center">
            {isEdit ? (
              <>
                <EditIcon sx={{ mr: 1 }} fontSize="small" />
                تعديل عنصر في قاعدة المعرفة
              </>
            ) : (
              <>
                <AddIcon sx={{ mr: 1 }} fontSize="small" />
                إضافة عنصر جديد إلى قاعدة المعرفة
              </>
            )}
          </MDTypography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            size="small"
            sx={{
              backgroundColor: "rgba(0,0,0,0.04)",
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.08)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 3 }}>
        <Fade in={open} timeout={300}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <MDBox mb={1} display="flex" alignItems="center">
                <TitleIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                <MDTypography variant="subtitle2">عنوان العنصر</MDTypography>
              </MDBox>
              <TextField
                fullWidth
                placeholder="أدخل عنوانًا وصفيًا"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                error={!!errors.title}
                helperText={errors.title}
                required
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TitleIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <MDBox mb={1} display="flex" alignItems="center">
                <CategoryIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                <MDTypography variant="subtitle2">الفئة</MDTypography>
              </MDBox>
              <Autocomplete
                freeSolo
                options={categories || []}
                value={formData.category}
                onChange={(_, newValue) => handleChange("category", newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="اختر أو أضف فئة جديدة"
                    variant="outlined"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <CategoryIcon fontSize="small" color="action" />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                      },
                    }}
                  />
                )}
                sx={{
                  "& .MuiAutocomplete-tag": {
                    backgroundColor: "rgba(25, 118, 210, 0.08)",
                    borderRadius: "6px",
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <MDBox
                mb={2}
                mt={1}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box display="flex" alignItems="center">
                  <LocalOfferIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                  <MDTypography variant="subtitle2">العلامات</MDTypography>
                </Box>
                <Tooltip title="أضف علامات لتسهيل البحث والتصنيف">
                  <IconButton size="small">
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </MDBox>

              <Box display="flex" alignItems="center" mb={2}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="أضف علامات للمساعدة في تصنيف المحتوى"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocalOfferIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                    },
                  }}
                />
                <MDButton
                  variant="contained"
                  color="info"
                  size="small"
                  onClick={handleAddTag}
                  startIcon={<AddIcon />}
                  sx={{
                    ml: 1,
                    minWidth: "80px",
                    height: "40px",
                    borderRadius: "8px",
                    boxShadow: "0 3px 5px rgba(0,0,0,0.1)",
                  }}
                >
                  إضافة
                </MDButton>
              </Box>

              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: "8px",
                  minHeight: "60px",
                  backgroundColor: formData.tags.length > 0 ? "transparent" : "rgba(0,0,0,0.01)",
                  borderStyle: formData.tags.length > 0 ? "solid" : "dashed",
                }}
              >
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {formData.tags.length > 0 ? (
                    formData.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        onDelete={() => handleDeleteTag(tag)}
                        color="primary"
                        variant="outlined"
                        size="small"
                        sx={{
                          borderRadius: "6px",
                          "& .MuiChip-label": { px: 1.5 },
                          "& .MuiChip-deleteIcon": {
                            width: "16px",
                            height: "16px",
                            "&:hover": {
                              color: "error.main",
                            },
                          },
                        }}
                      />
                    ))
                  ) : (
                    <MDTypography variant="caption" color="text" sx={{ opacity: 0.7 }}>
                      لم يتم إضافة أي علامات بعد
                    </MDTypography>
                  )}
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <MDBox
                mb={1}
                mt={1}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box display="flex" alignItems="center">
                  <TextSnippetIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                  <MDTypography variant="subtitle2">محتوى العنصر</MDTypography>
                </Box>
                <Tooltip title="المحتوى الذي سيتم استخدامه في قاعدة معرفة البوت">
                  <IconButton size="small">
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </MDBox>

              <TextField
                fullWidth
                multiline
                rows={8}
                placeholder="أدخل محتوى العنصر هنا... (معلومات مفصلة يستخدمها البوت للإجابة على استفسارات المستخدمين)"
                value={formData.content}
                onChange={(e) => handleChange("content", e.target.value)}
                error={!!errors.content}
                helperText={errors.content}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  },
                }}
              />

              <Card
                variant="outlined"
                sx={{
                  mt: 2,
                  backgroundColor: "rgba(25, 118, 210, 0.04)",
                  border: "1px solid rgba(25, 118, 210, 0.1)",
                  borderRadius: "8px",
                }}
              >
                <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Box display="flex" alignItems="flex-start">
                    <InfoOutlinedIcon color="info" fontSize="small" sx={{ mr: 1, mt: 0.4 }} />
                    <Typography variant="caption" color="text.secondary">
                      هذا المحتوى سيتم استخدامه لإثراء قاعدة معرفة البوت وتحسين إجاباته. كلما كان
                      المحتوى أكثر تفصيلاً ودقة، زادت جودة إجابات البوت.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Fade>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
        <MDButton
          variant="outlined"
          color="secondary"
          onClick={onClose}
          sx={{
            borderRadius: "8px",
            px: 3,
          }}
        >
          إلغاء
        </MDButton>
        <MDButton
          variant="gradient"
          color="info"
          onClick={handleSave}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          sx={{
            borderRadius: "8px",
            boxShadow: "0 4px 10px rgba(25, 118, 210, 0.2)",
            px: 3,
            "&:hover": {
              boxShadow: "0 6px 14px rgba(25, 118, 210, 0.25)",
            },
          }}
        >
          {isEdit ? "تحديث العنصر" : "إضافة العنصر"}
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

export default KnowledgeBaseItemModal;
