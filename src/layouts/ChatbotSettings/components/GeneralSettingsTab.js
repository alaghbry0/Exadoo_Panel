// src/layouts/ChatbotSettings/components/GeneralSettingsTab.js
import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Slider from "@mui/material/Slider";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Skeleton from "@mui/material/Skeleton";
import Fade from "@mui/material/Fade";
import Paper from "@mui/material/Paper";

// Icons
import SaveIcon from "@mui/icons-material/Save";
import RobotIcon from "@mui/icons-material/SmartToy";
import MessageIcon from "@mui/icons-material/Message";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import TuneIcon from "@mui/icons-material/Tune";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import CancelIcon from "@mui/icons-material/Cancel";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import { updateChatbotSettings, rebuildEmbeddings as rebuildEmbeddingsAPI } from "services/api";

function GeneralSettingsTab({
  settings: initialSettings,
  setSettings: setParentSettings,
  showSuccessMessage,
  showErrorMessage,
}) {
  const [settings, setSettings] = useState({
    name: "",
    system_instructions: "",
    welcome_message: "",
    fallback_message: "",
    temperature: 0.1,
    max_tokens: 500,
    faq_questions: [],
  });
  const [saving, setSaving] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);

  // --- FAQ State ---
  const [addingFAQ, setAddingFAQ] = useState(false);
  const [newFAQ, setNewFAQ] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedFAQText, setEditedFAQText] = useState("");

  // --- Efecto para procesar los datos iniciales ---
  useEffect(() => {
    if (!initialSettings) return;

    let processedFaqQuestions = [];

    if (initialSettings.faq_questions) {
      // تعامل مع سلسلة JSON
      if (typeof initialSettings.faq_questions === "string") {
        try {
          // تنظيف السلسلة من الـ escapes الزائدة وتحليلها
          const cleanedString = initialSettings.faq_questions.replace(/\\/g, "");
          // استخراج المصفوفة من داخل السلسلة
          const jsonStart = cleanedString.indexOf("[");
          const jsonEnd = cleanedString.lastIndexOf("]") + 1;
          if (jsonStart >= 0 && jsonEnd > jsonStart) {
            const jsonArray = cleanedString.substring(jsonStart, jsonEnd);
            processedFaqQuestions = JSON.parse(jsonArray);
          }
        } catch (error) {
          console.error("خطأ في تحليل faq_questions:", error);
          // محاولة ثانية باستخدام JSON.parse مباشرة
          try {
            processedFaqQuestions = JSON.parse(initialSettings.faq_questions);
          } catch (e) {
            console.error("فشلت المحاولة الثانية:", e);
          }
        }
      } else if (Array.isArray(initialSettings.faq_questions)) {
        // إذا كانت بالفعل مصفوفة
        processedFaqQuestions = initialSettings.faq_questions;
      }
    }

    setSettings({
      ...initialSettings,
      faq_questions: processedFaqQuestions,
    });
    setParentSettings({
      ...initialSettings,
      faq_questions: processedFaqQuestions,
    });
  }, [initialSettings, setParentSettings]);

  // Manejo de cambios en los campos
  const handleChange = (field, value) => {
    const updatedSettings = {
      ...settings,
      [field]: value,
    };
    setSettings(updatedSettings);
    setParentSettings(updatedSettings);
  };

  // Cambio en el slider de temperatura
  const handleTemperatureChange = (_, value) => {
    handleChange("temperature", value);
  };

  // Cambio en el slider de tokens máximos
  const handleMaxTokensChange = (_, value) => {
    handleChange("max_tokens", value);
  };

  // Reconstruir embeddings
  const handleRebuildEmbeddings = async () => {
    setRebuilding(true);
    try {
      await rebuildEmbeddingsAPI();
      showSuccessMessage("تم إعادة بناء قاعدة المعرفة بنجاح");
    } catch (error) {
      console.error("Error rebuilding embeddings:", error);
      showErrorMessage("حدث خطأ أثناء إعادة بناء قاعدة المعرفة");
    } finally {
      setRebuilding(false);
    }
  };

  // --- Funciones para manejar FAQ (como array simple) ---

  // Añadir nueva pregunta
  const handleAddFAQ = () => {
    if (newFAQ.trim()) {
      const updatedFAQs = [...settings.faq_questions, newFAQ.trim()];
      handleChange("faq_questions", updatedFAQs);
      setNewFAQ("");
      setAddingFAQ(false);
    }
  };

  // Preparar para editar una pregunta
  const handleEditFAQ = (index) => {
    setEditingIndex(index);
    setEditedFAQText(settings.faq_questions[index]);
  };

  // Cancelar la edición
  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditedFAQText("");
  };

  // Actualizar una pregunta después de editarla
  const handleUpdateFAQ = () => {
    if (editedFAQText.trim() && editingIndex !== null) {
      const updatedFAQs = [...settings.faq_questions];
      updatedFAQs[editingIndex] = editedFAQText.trim();
      handleChange("faq_questions", updatedFAQs);
      handleCancelEdit();
    }
  };

  // Eliminar una pregunta
  const handleDeleteFAQ = (index) => {
    if (window.confirm("هل أنت متأكد من حذف هذا السؤال الشائع؟")) {
      const updatedFAQs = settings.faq_questions.filter((_, i) => i !== index);
      handleChange("faq_questions", updatedFAQs);
      if (editingIndex === index) {
        handleCancelEdit();
      }
    }
  };

  // Guardar todos los ajustes
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // تحويل المصفوفة إلى سلسلة JSON إذا لم تكن بالفعل
      const settingsToSave = {
        ...settings,
        faq_questions: Array.isArray(settings.faq_questions)
          ? JSON.stringify(settings.faq_questions)
          : settings.faq_questions,
      };

      await updateChatbotSettings(settingsToSave);
      showSuccessMessage("تم حفظ الإعدادات بنجاح");
    } catch (error) {
      console.error("Error saving settings:", error);
      let errorMessage = "حدث خطأ أثناء حفظ الإعدادات";
      if (error.response?.data?.message) errorMessage = error.response.data.message;
      showErrorMessage(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Textos descriptivos para los sliders
  const temperatureValueText = (value) => `${value !== undefined ? value.toFixed(1) : "0.0"}`;
  const maxTokensValueText = (value) => `${value}`;

  // Mostrar loader mientras carga
  if (!settings) {
    return (
      <MDBox p={3} display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </MDBox>
    );
  }

  return (
    <MDBox p={3}>
      <Grid container spacing={3}>
        {/* --- Basic Settings Card --- */}
        <Grid item xs={12}>
          <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)", mb: 3, overflow: "visible" }}>
            <CardContent>
              <MDBox display="flex" alignItems="center" mb={2}>
                <RobotIcon color="primary" sx={{ mr: 1 }} />
                <MDTypography variant="subtitle1" fontWeight="medium">
                  الإعدادات الأساسية للبوت
                </MDTypography>
                <Tooltip title="إعدادات البوت الأساسية التي تحدد سلوكه وشخصيته">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </MDBox>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={3}>
                {/* حقل اسم البوت */}
                <Grid item xs={12} md={6}>
                  <MDBox mb={2}>
                    <MDTypography
                      variant="caption"
                      color="text"
                      display="block"
                      fontWeight="medium"
                      mb={1}
                    >
                      اسم البوت
                    </MDTypography>
                    <TextField
                      fullWidth
                      value={settings.name || ""}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="أدخل اسم البوت"
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <RobotIcon fontSize="small" color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                    />
                  </MDBox>
                </Grid>

                {/* حقل تعليمات النظام */}
                <Grid item xs={12}>
                  <MDBox mb={2}>
                    <MDTypography
                      variant="caption"
                      color="text"
                      display="block"
                      fontWeight="medium"
                      mb={1}
                    >
                      تعليمات النظام
                    </MDTypography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      value={settings.system_instructions || ""}
                      onChange={(e) => handleChange("system_instructions", e.target.value)}
                      placeholder="أدخل تعليمات النظام والشخصية التي سيتبعها البوت..."
                      variant="outlined"
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1, display: "block" }}
                    >
                      تحدد هذه التعليمات شخصية البوت وأسلوبه في الرد والقواعد التي سيتبعها.
                    </Typography>
                  </MDBox>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* --- Messages Card --- */}
        <Grid item xs={12}>
          <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)", mb: 3, overflow: "visible" }}>
            <CardContent>
              <MDBox display="flex" alignItems="center" mb={2}>
                <MessageIcon color="primary" sx={{ mr: 1 }} />
                <MDTypography variant="subtitle1" fontWeight="medium">
                  إعدادات الرسائل
                </MDTypography>
                <Tooltip title="إعدادات الرسائل التي سيستخدمها البوت في التفاعل مع المستخدمين">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </MDBox>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={3}>
                {/* رسالة الترحيب */}
                <Grid item xs={12} md={6}>
                  <MDBox mb={2}>
                    <MDTypography
                      variant="caption"
                      color="text"
                      display="block"
                      fontWeight="medium"
                      mb={1}
                    >
                      رسالة الترحيب
                    </MDTypography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      value={settings.welcome_message || ""}
                      onChange={(e) => handleChange("welcome_message", e.target.value)}
                      placeholder="أدخل رسالة الترحيب..."
                      variant="outlined"
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1, display: "block" }}
                    >
                      تظهر عند بدء محادثة جديدة.
                    </Typography>
                  </MDBox>
                </Grid>
                {/* رسالة الاحتياط */}
                <Grid item xs={12} md={6}>
                  <MDBox mb={2}>
                    <MDTypography
                      variant="caption"
                      color="text"
                      display="block"
                      fontWeight="medium"
                      mb={1}
                    >
                      رسالة الاحتياطية
                    </MDTypography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      value={settings.fallback_message || ""}
                      onChange={(e) => handleChange("fallback_message", e.target.value)}
                      placeholder="أدخل الرسالة عندما لا يعرف البوت الإجابة..."
                      variant="outlined"
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1, display: "block" }}
                    >
                      تستخدم عند عدم العثور على إجابة.
                    </Typography>
                  </MDBox>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* --- Advanced Settings Card --- */}
        <Grid item xs={12}>
          <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)", mb: 3, overflow: "visible" }}>
            <CardContent>
              <MDBox display="flex" alignItems="center" mb={2}>
                <TuneIcon color="primary" sx={{ mr: 1 }} />
                <MDTypography variant="subtitle1" fontWeight="medium">
                  الإعدادات المتقدمة
                </MDTypography>
                <Tooltip title="إعدادات متقدمة تؤثر على أداء وسلوك البوت">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </MDBox>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={3}>
                {/* درجة الحرارة */}
                <Grid item xs={12} md={6}>
                  <MDBox mb={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <MDTypography variant="caption" color="text" fontWeight="medium">
                        درجة الإبداعية (Temperature)
                      </MDTypography>
                      <Chip
                        label={temperatureValueText(settings.temperature)}
                        size="small"
                        color="primary"
                        sx={{ fontWeight: "bold", minWidth: "45px" }}
                      />
                    </Box>
                    <Slider
                      value={typeof settings.temperature === "number" ? settings.temperature : 0}
                      onChange={handleTemperatureChange}
                      aria-labelledby="temperature-slider"
                      getAriaValueText={temperatureValueText}
                      valueLabelDisplay="auto"
                      step={0.1}
                      marks={[
                        { value: 0, label: "0.0" },
                        { value: 0.5, label: "0.5" },
                        { value: 1, label: "1.0" },
                      ]}
                      min={0}
                      max={1}
                      sx={{ "& .MuiSlider-thumb": { width: "16px", height: "16px" } }}
                    />
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Typography variant="caption" color="text.secondary">
                        محدد أكثر
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        إبداعي أكثر
                      </Typography>
                    </Box>
                  </MDBox>
                </Grid>
                {/* الحد الأقصى للتوكنات */}
                <Grid item xs={12} md={6}>
                  <MDBox mb={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <MDTypography variant="caption" color="text" fontWeight="medium">
                        الحد الأقصى للتوكينات (Max Tokens)
                      </MDTypography>
                      <Chip
                        label={maxTokensValueText(settings.max_tokens)}
                        size="small"
                        color="primary"
                        sx={{ fontWeight: "bold", minWidth: "45px" }}
                      />
                    </Box>
                    <Slider
                      value={typeof settings.max_tokens === "number" ? settings.max_tokens : 100}
                      onChange={handleMaxTokensChange}
                      aria-labelledby="max-tokens-slider"
                      getAriaValueText={maxTokensValueText}
                      valueLabelDisplay="auto"
                      step={50}
                      marks={[
                        { value: 100, label: "100" },
                        { value: 500, label: "500" },
                        { value: 1000, label: "1000" },
                      ]}
                      min={100}
                      max={1000}
                      sx={{ "& .MuiSlider-thumb": { width: "16px", height: "16px" } }}
                    />
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Typography variant="caption" color="text.secondary">
                        إجابات أقصر
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        إجابات أطول
                      </Typography>
                    </Box>
                  </MDBox>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* --- FAQ Questions Card (String Array Logic) --- */}
        <Grid item xs={12}>
          <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)", mb: 3 }}>
            <CardContent>
              {/* Header */}
              <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center">
                  <HelpOutlineIcon color="primary" sx={{ mr: 1 }} />
                  <MDTypography variant="subtitle1" fontWeight="medium">
                    الأسئلة الشائعة
                  </MDTypography>
                  <Tooltip title="الأسئلة التي سيتعلمها البوت مسبقًا ليجيب عليها مباشرة">
                    <IconButton size="small" sx={{ ml: 1 }}>
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                {/* إظهار زر الإضافة فقط إذا لم نكن نضيف أو نعدل */}
                {!addingFAQ && editingIndex === null && (
                  <MDButton
                    variant="outlined"
                    color="info"
                    startIcon={<AddIcon />}
                    onClick={() => setAddingFAQ(true)}
                    sx={{ borderRadius: "8px" }}
                  >
                    إضافة سؤال
                  </MDButton>
                )}
              </MDBox>
              <Divider sx={{ my: 2 }} />

              {/* --- نموذج إضافة سؤال جديد --- */}
              {addingFAQ && (
                <Paper
                  sx={{ p: 2, mb: 3, borderRadius: "8px", border: "1px solid rgba(0,0,0,0.12)" }}
                >
                  <MDTypography variant="subtitle2" gutterBottom>
                    إضافة سؤال جديد
                  </MDTypography>
                  <TextField
                    fullWidth
                    autoFocus
                    placeholder="اكتب السؤال هنا..."
                    value={newFAQ}
                    onChange={(e) => setNewFAQ(e.target.value)}
                    size="small"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" }, mb: 2 }}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && newFAQ.trim()) {
                        handleAddFAQ();
                      }
                    }}
                  />
                  <Box display="flex" justifyContent="flex-end" gap={1}>
                    <MDButton
                      variant="text"
                      color="secondary"
                      onClick={() => {
                        setAddingFAQ(false);
                        setNewFAQ("");
                      }}
                    >
                      إلغاء
                    </MDButton>
                    <MDButton
                      variant="contained"
                      color="info"
                      onClick={handleAddFAQ}
                      disabled={!newFAQ.trim()}
                      sx={{ borderRadius: "6px" }}
                    >
                      إضافة
                    </MDButton>
                  </Box>
                </Paper>
              )}

              {/* --- قائمة الأسئلة الشائعة --- */}
              {Array.isArray(settings.faq_questions) &&
              settings.faq_questions.length === 0 &&
              !addingFAQ ? (
                // عرض رسالة عند عدم وجود أسئلة وعدم فتح نموذج الإضافة
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    textAlign: "center",
                    border: "1px dashed rgba(0,0,0,0.12)",
                    borderRadius: "8px",
                  }}
                >
                  <HelpOutlineIcon
                    sx={{ fontSize: 60, color: "text.secondary", opacity: 0.3, mb: 2 }}
                  />
                  <MDTypography variant="h6" gutterBottom>
                    لا توجد أسئلة مضافة بعد
                  </MDTypography>
                  <MDTypography
                    variant="body2"
                    sx={{ maxWidth: 500, mx: "auto", mb: 3, color: "text.secondary" }}
                  >
                    أضف الأسئلة المتداولة هنا لتدريب البوت عليها.
                  </MDTypography>
                  <MDButton
                    variant="contained"
                    color="info"
                    startIcon={<AddIcon />}
                    onClick={() => setAddingFAQ(true)}
                    sx={{ borderRadius: "6px" }}
                  >
                    إضافة السؤال الأول
                  </MDButton>
                </Paper>
              ) : (
                // عرض قائمة الأسئلة أو نموذج التعديل
                <Box>
                  {Array.isArray(settings.faq_questions) &&
                    settings.faq_questions.map((question, index) => (
                      <Fade in key={index}>
                        <Paper
                          sx={{
                            p: 2,
                            mb: 2,
                            borderRadius: "8px",
                            position: "relative",
                            border:
                              editingIndex === index ? "1px solid" : "1px solid rgba(0,0,0,0.12)",
                            borderColor:
                              editingIndex === index ? "primary.main" : "rgba(0,0,0,0.12)",
                          }}
                        >
                          {editingIndex === index ? (
                            // --- وضع التعديل ---
                            <>
                              <TextField
                                fullWidth
                                multiline
                                autoFocus
                                placeholder="تعديل السؤال"
                                value={editedFAQText}
                                onChange={(e) => setEditedFAQText(e.target.value)}
                                size="small"
                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" }, mb: 2 }}
                              />
                              <Box display="flex" justifyContent="flex-end" gap={1}>
                                <MDButton
                                  variant="text"
                                  color="secondary"
                                  onClick={handleCancelEdit}
                                  startIcon={<CancelIcon />}
                                >
                                  إلغاء
                                </MDButton>
                                <MDButton
                                  variant="contained"
                                  color="info"
                                  onClick={handleUpdateFAQ}
                                  disabled={!editedFAQText.trim() || editedFAQText === question}
                                  sx={{ borderRadius: "6px" }}
                                  startIcon={<SaveIcon />}
                                >
                                  حفظ التعديل
                                </MDButton>
                              </Box>
                            </>
                          ) : (
                            // --- وضع العرض ---
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <MDTypography
                                variant="body2"
                                sx={{ marginRight: 1, whiteSpace: "pre-wrap" }}
                              >
                                {typeof question === "object" && question.question
                                  ? question.question
                                  : question}
                              </MDTypography>
                              <Box sx={{ flexShrink: 0 }}>
                                <Tooltip title="تعديل السؤال">
                                  <IconButton
                                    size="small"
                                    color="info"
                                    onClick={() => handleEditFAQ(index)}
                                    sx={{ mr: 0.5 }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="حذف السؤال">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteFAQ(index)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          )}
                        </Paper>
                      </Fade>
                    ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* --- Rebuild Embeddings Card --- */}
        <Grid item xs={12}>
          <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)", mb: 3, overflow: "visible" }}>
            <CardContent>
              <MDBox display="flex" alignItems="center" mb={2}>
                <RefreshIcon color="warning" sx={{ mr: 1 }} />
                <MDTypography variant="subtitle1" fontWeight="medium">
                  إعادة بناء قاعدة المعرفة
                </MDTypography>
                <Tooltip title="إعادة بناء قاعدة المعرفة (embeddings) بعد تعديل المحتوى أو الأسئلة الشائعة">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </MDBox>
              <Divider sx={{ my: 2 }} />
              <Box p={2}>
                <MDTypography variant="body2" color="text.secondary" mb={3}>
                  يُنصح بإعادة بناء قاعدة المعرفة بعد إجراء تغييرات كبيرة على الأسئلة الشائعة أو
                  المستندات المصدر لضمان دقة إجابات البوت. قد تستغرق هذه العملية بعض الوقت.
                </MDTypography>
                <MDButton
                  variant="outlined"
                  color="warning"
                  onClick={handleRebuildEmbeddings}
                  disabled={rebuilding}
                  startIcon={
                    rebuilding ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />
                  }
                  sx={{ borderRadius: "6px" }}
                >
                  {rebuilding ? "جاري إعادة البناء..." : "إعادة بناء قاعدة المعرفة"}
                </MDButton>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* --- Save Button (Fixed at Bottom) --- */}
      <Box
        sx={{
          position: "sticky",
          bottom: 20,
          backgroundColor: "rgba(255, 255, 255, 0.9)", // خلفية شبه شفافة
          backdropFilter: "blur(8px)",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
          borderRadius: "12px",
          padding: "16px",
          display: "flex",
          justifyContent: "center",
          margin: "24px auto 0 auto", // هوامش لضمان عدم التداخل مع المحتوى
          width: "fit-content",
          zIndex: 1100, // Z-index أعلى
        }}
      >
        <MDButton
          variant="gradient"
          color="info"
          onClick={handleSaveSettings}
          disabled={saving || rebuilding} // تعطيل الحفظ أثناء إعادة البناء أيضًا
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          sx={{ px: 4, py: 1.2, borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
        >
          {saving ? "جاري الحفظ..." : "حفظ جميع الإعدادات"}
        </MDButton>
      </Box>
    </MDBox>
  );
}

export default GeneralSettingsTab;
