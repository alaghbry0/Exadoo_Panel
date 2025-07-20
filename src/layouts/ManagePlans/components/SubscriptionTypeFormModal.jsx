// src/layouts/ManagePlans/components/SubscriptionTypeFormModal.jsx

// ------------------- Imports -------------------
import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Checkbox,
  FormControlLabel,
  IconButton,
  Tooltip,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Box,
  Alert,
  Slider,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { useSnackbar } from "notistack";

// Components
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import FeaturesInput from "./FeaturesInput";

// API and ImageKit
import { createSubscriptionType, updateSubscriptionType, getImageKitSignature } from "services/api";
import ImageKit from "imagekit-javascript";

// ------------------- Helper Functions & Constants (Outside Component) -------------------
const parseJsonSafe = (data) => {
  if (Array.isArray(data)) return data;
  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const INITIAL_FORM_DATA = {
  name: "",
  mainChannelId: "",
  mainChannelName: "",
  secondaryChannels: [{ channel_id: "", channel_name: "" }],
  features: [],
  termsAndConditions: [],
  isActive: true,
  groupId: "",
  sortOrder: 0,
  isRecommended: false,
  description: "",
  sendInvites: false,
  // description: "", // إذا كنت ستضيف حقل وصف
};

const INITIAL_IMAGE_TRANSFORM_SETTINGS = {
  blur: 0,
  quality: 85,
  width: null,
  height: null,
};

const IMAGEKIT_PUBLIC_KEY = process.env.REACT_APP_IMAGEKIT_PUBLIC_KEY;
const IMAGEKIT_URL_ENDPOINT = process.env.REACT_APP_IMAGEKIT_URL_ENDPOINT;

let imagekit = null;
if (IMAGEKIT_PUBLIC_KEY && IMAGEKIT_URL_ENDPOINT) {
  imagekit = new ImageKit({
    publicKey: IMAGEKIT_PUBLIC_KEY,
    urlEndpoint: IMAGEKIT_URL_ENDPOINT,
  });
} else {
  console.error("ImageKit PublicKey or URLEndpoint is not defined. Image upload disabled.");
}

const extractTransformSettingsFromUrl = (url) => {
  const defaultSettings = { ...INITIAL_IMAGE_TRANSFORM_SETTINGS };
  if (!url || !url.includes("?tr=")) return { baseUrl: url, settings: defaultSettings };

  const parts = url.split("?tr=");
  const baseUrl = parts[0];
  const transformString = parts[1];

  if (transformString) {
    transformString.split(",").forEach((param) => {
      const [key, value] = param.split("-");
      if (key === "bl") defaultSettings.blur = Math.min(100, parseInt(value, 10) * 10);
      else if (key === "q") defaultSettings.quality = parseInt(value, 10);
      else if (key === "w") defaultSettings.width = parseInt(value, 10);
      else if (key === "h") defaultSettings.height = parseInt(value, 10);
    });
  }
  return { baseUrl, settings: defaultSettings };
};

const buildTransformedUrl = (baseUrlToTransform, settings) => {
  if (!baseUrlToTransform) return null;
  let transformations = [];
  if (settings.width) transformations.push(`w-${settings.width}`);
  if (settings.height) transformations.push(`h-${settings.height}`);
  if (settings.width && settings.height) transformations.push(`c-at_max`);
  if (settings.quality && settings.quality < 100) transformations.push(`q-${settings.quality}`);
  if (settings.blur && settings.blur > 0) {
    const ikBlur = Math.max(1, Math.round(settings.blur / 10));
    transformations.push(`bl-${ikBlur}`);
  }
  return transformations.length > 0
    ? `${baseUrlToTransform}?tr=${transformations.join(",")}`
    : baseUrlToTransform;
};

const getInitialFormDataState = (initialData, isEditMode, parseJsonFn) => {
  if (isEditMode && initialData) {
    const mainChData = initialData.linked_channels?.find((ch) => ch.is_main);
    const secChs = initialData.linked_channels?.filter((ch) => !ch.is_main) || [];
    return {
      name: initialData.name || "",
      mainChannelId: initialData.main_channel_id?.toString() || "",
      mainChannelName:
        mainChData?.channel_name ||
        initialData.main_channel_name ||
        `Main Channel for ${initialData.name || ""}`,
      secondaryChannels:
        secChs.length > 0
          ? secChs.map((ch) => ({ ...ch, channel_id: ch.channel_id.toString() }))
          : [{ channel_id: "", channel_name: "" }],
      features: parseJsonFn(initialData.features),
      termsAndConditions: parseJsonFn(initialData.terms_and_conditions),
      isActive: initialData.is_active ?? true,
      groupId: initialData.group?.id?.toString() || initialData.group_id?.toString() || "",
      sortOrder: initialData.sort_order ?? 0,
      isRecommended: initialData.is_recommended ?? false,
      description: initialData.description || "",
      sendInvites: initialData.send_invites_for_new_channels ?? false,
      // description: initialData.description || "", // إذا كنت ستضيف حقل وصف
    };
  }
  return { ...INITIAL_FORM_DATA, secondaryChannels: [{ channel_id: "", channel_name: "" }] };
};

const getInitialImageRelatedStates = (initialData, isEditMode, extractTransformSettingsFn) => {
  if (isEditMode && initialData) {
    const { baseUrl, settings } = extractTransformSettingsFn(initialData.image_url || "");
    return {
      baseImageUrl: baseUrl,
      imageTransformSettings: settings,
      currentImageFileId: initialData.image_file_id || "",
    };
  }
  return {
    baseImageUrl: "",
    imageTransformSettings: { ...INITIAL_IMAGE_TRANSFORM_SETTINGS },
    currentImageFileId: "",
  };
};

// ====================================================================================
// ========================== MODIFIED prepareApiPayload ============================
// ====================================================================================
const prepareApiPayload = (formData, imageDetails, isEditMode) => {
  const parsedMainChannelId = parseInt(formData.mainChannelId.trim(), 10);
  const finalSecondaryChannels = formData.secondaryChannels
    .map((ch) => ({
      channel_id: ch.channel_id?.toString().trim()
        ? parseInt(ch.channel_id.toString().trim(), 10)
        : null,
      channel_name: ch.channel_name?.trim() || null,
    }))
    .filter((ch) => ch.channel_id !== null && !isNaN(ch.channel_id));

  if (finalSecondaryChannels.some((ch) => ch.channel_id === parsedMainChannelId)) {
    throw new Error("Secondary channel ID cannot be the same as the Main Channel ID.");
  }

  const payload = {
    name: formData.name.trim(),
    main_channel_id: parsedMainChannelId,
    // الخادم يقرأ main_channel_name_input لذا يجب إرساله.
    main_channel_name:
      formData.mainChannelName?.trim() || `Main Channel for ${formData.name.trim() || "Type"}`,
    secondary_channels: finalSecondaryChannels,
    features: formData.features.filter((f) => f.trim()),
    terms_and_conditions: formData.termsAndConditions.filter((t) => t.trim()),
    group_id: formData.groupId ? parseInt(formData.groupId, 10) : null,
    sort_order: parseInt(formData.sortOrder, 10) || 0, // الخادم يتوقع sort_order
    is_active: formData.isActive, // الخادم يتوقع is_active
    is_recommended: formData.isRecommended, // الخادم يتوقع is_recommended
    description: formData.description.trim() || null,
    image_url: imageDetails.finalImageUrlToSave,
    image_file_id: imageDetails.deleteImageFlag ? null : imageDetails.uploadedFileId,
    delete_image: imageDetails.deleteImageFlag,
  };

  // أضف الحقل description إذا كان الخادم يتوقعه وموجود في formData
  // if (formData.description !== undefined && formData.description !== null) {
  //   payload.description = formData.description.trim() || null;
  // }
  // حاليًا كود الخادم الذي أرفقته يقرأ: description = data.get("description")

  if (isEditMode) {
    // الخادم يتوقع send_invites_for_new_channels
    payload.send_invites_for_new_channels = formData.sendInvites;
  }

  return payload;
};
// ====================================================================================
// ====================================================================================
// ====================================================================================

// ------------------- Component -------------------
function SubscriptionTypeFormModal({
  open,
  onClose,
  onSuccess,
  mode = "add",
  initialData = null,
  availableGroups = [],
}) {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState(() =>
    getInitialFormDataState(initialData, mode === "edit", parseJsonSafe)
  );
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const initialImageStates = getInitialImageRelatedStates(
    initialData,
    mode === "edit",
    extractTransformSettingsFromUrl
  );
  const [baseImageUrl, setBaseImageUrl] = useState(initialImageStates.baseImageUrl);
  const [currentImageFileId, setCurrentImageFileId] = useState(
    initialImageStates.currentImageFileId
  );
  const [imageTransformSettings, setImageTransformSettings] = useState(
    initialImageStates.imageTransformSettings
  );

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [deleteImageFlag, setDeleteImageFlag] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const isEditMode = mode === "edit";

  useEffect(() => {
    if (open) {
      setFormData(getInitialFormDataState(initialData, isEditMode, parseJsonSafe));
      const imgStates = getInitialImageRelatedStates(
        initialData,
        isEditMode,
        extractTransformSettingsFromUrl
      );
      setBaseImageUrl(imgStates.baseImageUrl);
      setImageTransformSettings(imgStates.imageTransformSettings);
      setCurrentImageFileId(imgStates.currentImageFileId);

      setSelectedFile(null);
      setImagePreview(null);
      setDeleteImageFlag(false);
      setErrors({});
      setIsUploading(false);
    }
  }, [open, isEditMode, initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleTransformSettingChange = (name, value) => {
    setImageTransformSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSecondaryChannelChange = (index, field, value) => {
    setFormData((prev) => {
      const newChannels = [...prev.secondaryChannels];
      newChannels[index][field] = value;
      return { ...prev, secondaryChannels: newChannels };
    });
  };

  const handleAddSecondaryChannel = () => {
    setFormData((prev) => ({
      ...prev,
      secondaryChannels: [...prev.secondaryChannels, { channel_id: "", channel_name: "" }],
    }));
  };

  const handleRemoveSecondaryChannel = (index) => {
    setFormData((prev) => {
      const newChannels = prev.secondaryChannels.filter((_, i) => i !== index);
      return {
        ...prev,
        secondaryChannels:
          newChannels.length > 0 ? newChannels : [{ channel_id: "", channel_name: "" }],
      };
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "اسم النوع مطلوب";
    if (!formData.mainChannelId.trim() || isNaN(parseInt(formData.mainChannelId.trim(), 10))) {
      newErrors.mainChannelId = "معرّف القناة الرئيسية مطلوب وصالح";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        enqueueSnackbar("الملف كبير جدًا. الحد الأقصى 5 ميجابايت.", { variant: "error" });
        return;
      }
      if (!file.type.startsWith("image/")) {
        enqueueSnackbar("نوع ملف غير صالح. الرجاء اختيار صورة.", { variant: "error" });
        return;
      }
      setSelectedFile(file);
      setDeleteImageFlag(false);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setDeleteImageFlag(true);
  };

  const handleUndoRemoveImage = () => {
    setDeleteImageFlag(false);
  };

  const handleSubmit = async () => {
    if (!validate() || isSaving || isUploading) return;

    setIsSaving(true);
    let finalImageUrlToSave = null;
    let uploadedFileIdResult = currentImageFileId;

    try {
      if (selectedFile && !deleteImageFlag) {
        if (!imagekit) {
          enqueueSnackbar("لم يتم تهيئة ImageKit. لا يمكن رفع الصورة.", { variant: "error" });
          setIsSaving(false);
          return;
        }
        setIsUploading(true);
        try {
          const signatureData = await getImageKitSignature();
          const uploadResponse = await imagekit.upload({
            file: selectedFile,
            fileName: selectedFile.name,
            token: signatureData.token,
            expire: signatureData.expire,
            signature: signatureData.signature,
            folder: "/subscription_type_images/",
            useUniqueFileName: true,
          });
          const newBaseUrl = uploadResponse.url.split("?")[0];
          finalImageUrlToSave = buildTransformedUrl(newBaseUrl, imageTransformSettings);
          uploadedFileIdResult = uploadResponse.fileId;
          enqueueSnackbar("تم رفع الصورة بنجاح!", { variant: "info", autoHideDuration: 2000 });
        } catch (uploadError) {
          console.error("ImageKit Upload Error:", uploadError);
          enqueueSnackbar(uploadError.message || "فشل رفع الصورة.", { variant: "error" });
          setIsUploading(false);
          setIsSaving(false);
          return;
        } finally {
          setIsUploading(false);
        }
      } else if (!deleteImageFlag && baseImageUrl) {
        finalImageUrlToSave = buildTransformedUrl(baseImageUrl, imageTransformSettings);
      }

      const imageDetailsForPayload = {
        finalImageUrlToSave,
        uploadedFileId: uploadedFileIdResult,
        deleteImageFlag,
      };
      // استخدام دالة prepareApiPayload المعدلة
      const dataPayload = prepareApiPayload(formData, imageDetailsForPayload, isEditMode);

      const response = isEditMode
        ? await updateSubscriptionType(initialData.id, dataPayload)
        : await createSubscriptionType(dataPayload);

      enqueueSnackbar(`تم ${isEditMode ? "تحديث" : "إنشاء"} نوع الاشتراك بنجاح!`, {
        variant: "success",
      });
      onSuccess(response);
      onClose();
    } catch (error) {
      console.error(`Error ${isEditMode ? "updating" : "creating"} subscription type:`, error);
      enqueueSnackbar(
        error.response?.data?.error ||
          error.message ||
          `فشل ${isEditMode ? "تحديث" : "إنشاء"} نوع الاشتراك.`,
        { variant: "error" }
      );
    } finally {
      setIsSaving(false);
    }
  };

  const modalPreviewUrl = imagePreview
    ? imagePreview
    : buildTransformedUrl(baseImageUrl, imageTransformSettings);

  return (
    <Dialog
      open={open}
      onClose={isSaving || isUploading ? undefined : onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{ sx: { borderRadius: "12px" } }}
    >
      <DialogTitle sx={{ pb: 1, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
        <MDTypography variant="h5" fontWeight="bold">
          {isEditMode ? "تعديل نوع الاشتراك" : "إضافة نوع اشتراك جديد"}
        </MDTypography>
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <MDBox component="form" noValidate sx={{ mt: 1 }}>
          <Grid container spacing={3}>
            {/* --- عمود للمعلومات الأساسية والتنظيم --- */}
            <Grid item xs={12} md={6}>
              <MDTypography variant="subtitle1" fontWeight="medium" sx={{ mb: 1.5 }}>
                المعلومات الأساسية
              </MDTypography>
              <MDInput
                sx={{ mb: 2 }}
                label="اسم النوع *"
                name="name"
                fullWidth
                required
                value={formData.name}
                error={!!errors.name}
                helperText={errors.name}
                onChange={handleChange}
                disabled={isSaving || isUploading}
                variant="outlined"
              />
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        disabled={isSaving || isUploading}
                      />
                    }
                    label={<MDTypography variant="body2">نشط</MDTypography>}
                  />
                </Grid>
                <Grid item>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="isRecommended"
                        checked={formData.isRecommended}
                        onChange={handleChange}
                        disabled={isSaving || isUploading}
                      />
                    }
                    label={<MDTypography variant="body2">موصى به</MDTypography>}
                  />
                </Grid>
              </Grid>
              <MDTypography variant="subtitle1" fontWeight="medium" sx={{ mt: 2.5, mb: 1.5 }}>
                التنظيم والعرض
              </MDTypography>
              <FormControl
                fullWidth
                variant="outlined"
                disabled={isSaving || isUploading}
                sx={{ mb: 2 }}
              >
                <InputLabel id="group-select-label">تعيين إلى مجموعة</InputLabel>
                <Select
                  labelId="group-select-label"
                  name="groupId"
                  value={formData.groupId}
                  onChange={handleChange}
                  label="تعيين إلى مجموعة"
                >
                  <MenuItem value="">
                    <em>بدون مجموعة</em>
                  </MenuItem>
                  {availableGroups.map((group) => (
                    <MenuItem key={group.id} value={group.id.toString()}>
                      {group.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <MDInput
                sx={{ mb: 2 }}
                label="ترتيب الفرز"
                name="sortOrder"
                type="number"
                fullWidth
                value={formData.sortOrder}
                onChange={handleChange}
                disabled={isSaving || isUploading}
                variant="outlined"
                inputProps={{ min: 0 }}
              />
              <MDInput
                sx={{ mt: 2 }}
                label="الوصف (اختياري)"
                name="description"
                fullWidth
                multiline
                rows={4}
                value={formData.description}
                onChange={handleChange}
                disabled={isSaving || isUploading}
                variant="outlined"
                placeholder="أدخل وصفًا موجزًا لنوع الاشتراك..."
              />
            </Grid>

            {/* --- عمود للصورة والتحويلات --- */}
            <Grid item xs={12} md={6}>
              <MDTypography variant="subtitle1" fontWeight="medium" sx={{ mb: 1.5 }}>
                صورة الاشتراك وخيارات العرض
              </MDTypography>
              <Box sx={{ border: "1px dashed #ccc", p: 2, borderRadius: 1 }}>
                <Box textAlign="center" mb={2}>
                  {isUploading && <CircularProgress size={24} sx={{ mb: 1 }} />}
                  {!isUploading && modalPreviewUrl && !deleteImageFlag && (
                    <MDBox
                      mb={2}
                      sx={{
                        width: "100%",
                        maxWidth: "250px",
                        border: "1px solid #ddd",
                        p: 0.5,
                        borderRadius: "4px",
                        mx: "auto",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={modalPreviewUrl}
                        alt="معاينة"
                        style={{
                          width: "100%",
                          height: "auto",
                          display: "block",
                          borderRadius: "2px",
                        }}
                      />
                    </MDBox>
                  )}
                  {deleteImageFlag && !selectedFile && (
                    <Alert severity="warning" sx={{ mb: 1, justifyContent: "center" }}>
                      سيتم حذف الصورة عند الحفظ.
                    </Alert>
                  )}
                  <input
                    accept="image/*"
                    style={{ display: "none" }}
                    id="sub-type-img-upload"
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    disabled={isSaving || isUploading || !imagekit}
                  />
                  <label htmlFor="sub-type-img-upload">
                    <MDButton
                      variant="outlined"
                      color="info"
                      component="span"
                      startIcon={<PhotoCamera />}
                      disabled={isSaving || isUploading || !imagekit}
                      sx={{ mr: 1, mb: 1, textTransform: "none" }}
                    >
                      {selectedFile
                        ? "تغيير الصورة"
                        : baseImageUrl && !deleteImageFlag
                        ? "استبدال الصورة"
                        : "رفع صورة"}
                    </MDButton>
                  </label>
                  {(baseImageUrl || selectedFile) && !deleteImageFlag && (
                    <MDButton
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteForeverIcon />}
                      onClick={handleRemoveImage}
                      disabled={isSaving || isUploading || !imagekit}
                      sx={{ mb: 1, textTransform: "none" }}
                    >
                      إزالة
                    </MDButton>
                  )}
                  {deleteImageFlag && (
                    <MDButton
                      variant="text"
                      color="secondary"
                      onClick={handleUndoRemoveImage}
                      disabled={isSaving || isUploading || !imagekit}
                      sx={{ ml: 1, mb: 1, textTransform: "none" }}
                    >
                      تراجع
                    </MDButton>
                  )}
                  {!imagekit && (
                    <MDTypography variant="caption" color="error" display="block" mt={1}>
                      لم يتم تكوين ImageKit. الرفع معطل.
                    </MDTypography>
                  )}
                </Box>
                <Divider sx={{ my: 2 }} />
                <MDTypography variant="subtitle2" fontWeight="regular" mb={1}>
                  إعدادات عرض الصورة:
                </MDTypography>

                <MDTypography variant="caption" display="block" mb={0.5}>
                  جودة العرض ({imageTransformSettings.quality}%)
                </MDTypography>
                <Slider
                  name="quality"
                  value={imageTransformSettings.quality}
                  onChange={(e, val) => handleTransformSettingChange("quality", val)}
                  aria-labelledby="quality-slider"
                  valueLabelDisplay="auto"
                  step={5}
                  marks
                  min={20}
                  max={100}
                  disabled={
                    isSaving || isUploading || (!baseImageUrl && !selectedFile) || deleteImageFlag
                  }
                  sx={{ mb: 1 }}
                />
                <MDTypography
                  variant="caption"
                  color="textSecondary"
                  display="block"
                  sx={{ mb: 2, fontSize: "0.75rem" }}
                >
                  جودة عرض الصورة. قيمة أقل تعني حجم ملف أصغر وتحميل أسرع، لكن بجودة أقل. (موصى به:
                  75-90%)
                </MDTypography>

                <MDTypography variant="caption" display="block" mb={0.5}>
                  مستوى الضبابية ({imageTransformSettings.blur}%)
                </MDTypography>
                <Slider
                  name="blur"
                  value={imageTransformSettings.blur}
                  onChange={(e, val) => handleTransformSettingChange("blur", val)}
                  aria-labelledby="blur-slider"
                  valueLabelDisplay="auto"
                  step={5}
                  marks
                  min={0}
                  max={100}
                  disabled={
                    isSaving || isUploading || (!baseImageUrl && !selectedFile) || deleteImageFlag
                  }
                  sx={{ mb: 1 }}
                />
                <MDTypography
                  variant="caption"
                  color="textSecondary"
                  display="block"
                  sx={{ mb: 2, fontSize: "0.75rem" }}
                >
                  إضافة تأثير ضبابي للصورة. (0% يعني بدون ضبابية)
                </MDTypography>

                <Grid container spacing={2} alignItems="flex-start">
                  <Grid item xs={12} sm={6}>
                    <MDInput
                      label="العرض (بكسل)"
                      name="width"
                      type="number"
                      fullWidth
                      value={imageTransformSettings.width || ""}
                      onChange={(e) =>
                        handleTransformSettingChange(
                          "width",
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                      disabled={
                        isSaving ||
                        isUploading ||
                        (!baseImageUrl && !selectedFile) ||
                        deleteImageFlag
                      }
                      variant="standard"
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                    <MDTypography
                      variant="caption"
                      color="textSecondary"
                      display="block"
                      sx={{ mt: 0.5, fontSize: "0.75rem" }}
                    >
                      العرض المطلوب للصورة. اتركه فارغًا للحجم الأصلي.
                    </MDTypography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <MDInput
                      label="الارتفاع (بكسل)"
                      name="height"
                      type="number"
                      fullWidth
                      value={imageTransformSettings.height || ""}
                      onChange={(e) =>
                        handleTransformSettingChange(
                          "height",
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                      disabled={
                        isSaving ||
                        isUploading ||
                        (!baseImageUrl && !selectedFile) ||
                        deleteImageFlag
                      }
                      variant="standard"
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                    <MDTypography
                      variant="caption"
                      color="textSecondary"
                      display="block"
                      sx={{ mt: 0.5, fontSize: "0.75rem" }}
                    >
                      الارتفاع المطلوب. سيتم الحفاظ على نسبة الأبعاد إذا تم تحديد العرض والارتفاع
                      معًا.
                    </MDTypography>
                  </Grid>
                </Grid>
                <MDTypography variant="caption" color="textSecondary" display="block" mt={2}>
                  ملاحظة: هذه الإعدادات تُطبق على رابط الصورة لتحديد كيفية عرضها. الصورة الأصلية
                  المرفوعة يتم تحسينها بشكل أساسي عند الرفع.
                </MDTypography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              {" "}
              <Divider sx={{ my: 1 }} />{" "}
            </Grid>

            {/* --- قسم إعدادات القنوات --- */}
            <Grid item xs={12}>
              <MDTypography variant="subtitle1" fontWeight="medium" sx={{ mb: 1.5 }}>
                إعدادات القنوات
              </MDTypography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <MDInput
                label="معرّف القناة الرئيسية *"
                name="mainChannelId"
                type="number"
                fullWidth
                required
                value={formData.mainChannelId}
                error={!!errors.mainChannelId}
                helperText={errors.mainChannelId}
                onChange={handleChange}
                disabled={isSaving || isUploading}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MDInput
                label="اسم القناة الرئيسية"
                name="mainChannelName"
                fullWidth
                value={formData.mainChannelName}
                onChange={handleChange}
                disabled={isSaving || isUploading}
                variant="outlined"
                placeholder={`افتراضيًا "القناة الرئيسية لـ ${formData.name || "النوع"}"`}
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 1.5 }}>
              {" "}
              <Divider />{" "}
            </Grid>
            <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
              <MDTypography variant="subtitle2" fontWeight="medium">
                القنوات الثانوية
              </MDTypography>
              <Tooltip title="إضافة قناة ثانوية">
                <span>
                  <IconButton
                    onClick={handleAddSecondaryChannel}
                    color="primary"
                    size="small"
                    disabled={isSaving || isUploading}
                  >
                    <AddCircleOutlineIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Grid>
            {formData.secondaryChannels.map((channel, index) => (
              <React.Fragment key={`sec-ch-${index}`}>
                <Grid item xs={12} sm={5.5}>
                  <MDInput
                    label={`معرّف القناة الثانوية ${index + 1}`}
                    type="number"
                    fullWidth
                    value={channel.channel_id}
                    onChange={(e) =>
                      handleSecondaryChannelChange(index, "channel_id", e.target.value)
                    }
                    disabled={isSaving || isUploading}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={5.5}>
                  <MDInput
                    label={`اسم القناة الثانوية ${index + 1}`}
                    fullWidth
                    value={channel.channel_name}
                    onChange={(e) =>
                      handleSecondaryChannelChange(index, "channel_name", e.target.value)
                    }
                    disabled={isSaving || isUploading}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={1}
                  display="flex"
                  alignItems="center"
                  justifyContent="flex-end"
                >
                  <Tooltip title="إزالة القناة">
                    <span>
                      <IconButton
                        onClick={() => handleRemoveSecondaryChannel(index)}
                        color="error"
                        size="small"
                        disabled={
                          (formData.secondaryChannels.length === 1 &&
                            !channel.channel_id &&
                            !channel.channel_name) ||
                          isSaving ||
                          isUploading
                        }
                      >
                        <RemoveCircleOutlineIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Grid>
              </React.Fragment>
            ))}
            {isEditMode && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="sendInvites"
                      checked={formData.sendInvites}
                      onChange={handleChange}
                      disabled={isSaving || isUploading}
                    />
                  }
                  label={
                    <MDTypography variant="body2">
                      {" "}
                      إرسال روابط دعوة للقنوات الثانوية الجديدة{" "}
                    </MDTypography>
                  }
                />
              </Grid>
            )}

            {/* --- قسم التفاصيل الإضافية --- */}
            <Grid item xs={12} sx={{ mt: 1.5 }}>
              {" "}
              <Divider />{" "}
            </Grid>
            <Grid item xs={12} sx={{ mt: 0.5 }}>
              <MDTypography variant="subtitle1" fontWeight="medium" sx={{ mb: 1.5 }}>
                تفاصيل إضافية
              </MDTypography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <MDTypography variant="subtitle2" fontWeight="medium" sx={{ mb: 0.5 }}>
                المميزات
              </MDTypography>
              <FeaturesInput
                value={formData.features}
                onChange={(v) => setFormData((p) => ({ ...p, features: v }))}
                label="ميزة"
                placeholder="أدخل ميزة..."
                disabled={isSaving || isUploading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MDTypography variant="subtitle2" fontWeight="medium" sx={{ mb: 0.5 }}>
                الشروط والأحكام
              </MDTypography>
              <FeaturesInput
                value={formData.termsAndConditions}
                onChange={(v) => setFormData((p) => ({ ...p, termsAndConditions: v }))}
                label="شرط"
                placeholder="أدخل شرط أو حكم..."
                disabled={isSaving || isUploading}
              />
            </Grid>
          </Grid>
        </MDBox>
      </DialogContent>
      <DialogActions
        sx={{ px: 3, pb: 2, pt: 2, borderTop: (theme) => `1px solid ${theme.palette.divider}` }}
      >
        <MDButton
          onClick={isSaving || isUploading ? undefined : onClose}
          color="secondary"
          variant="text"
          disabled={isSaving || isUploading}
        >
          إلغاء
        </MDButton>
        <MDButton
          onClick={handleSubmit}
          color="info"
          variant="gradient"
          disabled={isSaving || isUploading || !imagekit}
          startIcon={
            isSaving || isUploading ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {isSaving
            ? isEditMode
              ? "جاري الحفظ..."
              : "جاري الإنشاء..."
            : isUploading
            ? "جاري الرفع..."
            : isEditMode
            ? "حفظ التغييرات"
            : "إضافة النوع"}
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

export default SubscriptionTypeFormModal;
