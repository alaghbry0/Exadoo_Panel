import React, { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { getTermsConditions, updateTermsConditions } from "services/api"; // تأكد أن هذا المسار صحيح

function TermsConditionsSettings() {
  const [terms, setTerms] = useState([]);
  const [newTerm, setNewTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchTermsConditions = async () => {
    setLoading(true);
    setError(""); // مسح الأخطاء السابقة عند كل جلب جديد
    setSuccess(""); // مسح رسائل النجاح السابقة
    try {
      const response = await getTermsConditions(); // افترض أن response هو { id: ..., terms_array: "...", ... }

      let parsedTerms = [];
      // تحقق من وجود response و response.terms_array
      if (response && response.terms_array) {
        if (Array.isArray(response.terms_array)) {
          // إذا كانت terms_array بالفعل مصفوفة (وهو ليس الحال لديك الآن ولكن جيد للتحقق)
          parsedTerms = response.terms_array;
        } else if (typeof response.terms_array === "string") {
          // إذا كانت terms_array سلسلة نصية، قم بتحليلها
          try {
            parsedTerms = JSON.parse(response.terms_array);
            // تحقق إضافي للتأكد من أن الناتج هو مصفوفة فعلاً
            if (!Array.isArray(parsedTerms)) {
              console.error("Parsed terms_array is not an array:", parsedTerms);
              setError(
                "فشل تحميل الشروط: تنسيق بيانات غير صالح من الخادم (الناتج بعد التحليل ليس مصفوفة)."
              );
              parsedTerms = []; // ارجع إلى مصفوفة فارغة إذا كان التحليل لا ينتج مصفوفة
            }
          } catch (parseError) {
            console.error(
              "Error parsing terms_array:",
              parseError,
              "Raw data:",
              response.terms_array
            );
            setError("فشل تحميل الشروط: لم يتمكن من تحليل البيانات من الخادم.");
            parsedTerms = []; // ارجع إلى مصفوفة فارغة عند خطأ التحليل
          }
        } else {
          // إذا كانت terms_array موجودة ولكنها ليست سلسلة نصية ولا مصفوفة
          console.warn(
            "terms_array is of an unexpected type:",
            typeof response.terms_array,
            response.terms_array
          );
          setError("فشل تحميل الشروط: نوع بيانات غير متوقع للشروط.");
        }
      } else if (response && Array.isArray(response.terms)) {
        // كحل بديل إذا كانت البيانات تأتي أحيانًا في response.terms
        // هذا الجزء كان موجودًا في الكود الأصلي وقد يكون مفيدًا إذا كان الخادم يرسل البيانات بطرق مختلفة
        parsedTerms = response.terms;
      } else {
        // إذا لم يتم العثور على terms_array أو terms في الاستجابة
        console.warn("No terms data (terms_array or terms) found in response:", response);
        // يمكن ترك setError هنا فارغًا والسماح بعرض رسالة "لا توجد شروط"
        // أو وضع رسالة خطأ إذا كان من المتوقع دائمًا وجود بيانات
      }

      setTerms(parsedTerms);
    } catch (err) {
      console.error("Error fetching terms and conditions:", err);
      setError("فشل تحميل الشروط والأحكام. يرجى المحاولة مرة أخرى.");
      setTerms([]); // تأكد من أنها مصفوفة فارغة عند الخطأ
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTermsConditions();
  }, []);

  const handleAddTerm = () => {
    if (!newTerm.trim()) return;
    // تأكد من أن terms هي مصفوفة قبل الإضافة
    const currentTerms = Array.isArray(terms) ? terms : [];
    setTerms([...currentTerms, newTerm.trim()]);
    setNewTerm("");
  };

  const handleRemoveTerm = (index) => {
    const updatedTerms = [...terms];
    updatedTerms.splice(index, 1);
    setTerms(updatedTerms);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updatedTerms = [...terms];
    [updatedTerms[index], updatedTerms[index - 1]] = [updatedTerms[index - 1], updatedTerms[index]];
    setTerms(updatedTerms);
  };

  const handleMoveDown = (index) => {
    if (index === terms.length - 1) return;
    const updatedTerms = [...terms];
    [updatedTerms[index], updatedTerms[index + 1]] = [updatedTerms[index + 1], updatedTerms[index]];
    setTerms(updatedTerms);
  };

  const handleSaveTerms = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      // تأكد من أن terms هي مصفوفة قبل الإرسال
      const termsToSend = Array.isArray(terms) ? terms : [];
      await updateTermsConditions(termsToSend); // يجب أن تتوقع هذه الدالة مصفوفة
      setSuccess("تم حفظ الشروط والأحكام بنجاح!");
    } catch (err) {
      console.error("Error saving terms and conditions:", err);
      setError("فشل حفظ الشروط والأحكام. يرجى المحاولة مرة أخرى.");
    } finally {
      setSaving(false);
    }
  };

  // معالجة تحذير تداخل DOM: <p> داخل <p>
  // اجعل MDTypography داخل ListItemText يعرض span بدلاً من p
  // أو استخدم primaryTypographyProps مباشرة مع ListItemText

  return (
    <Card>
      <MDBox p={3}>
        <MDTypography variant="h6" fontWeight="medium" mb={2}>
          إعدادات الشروط والأحكام
        </MDTypography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <MDBox mb={3}>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="شرط أو حكم جديد"
                value={newTerm}
                onChange={(e) => setNewTerm(e.target.value)}
                placeholder="أدخل شرطًا أو حكمًا جديدًا"
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: "flex", alignItems: "center" }}>
              <MDButton
                variant="gradient"
                color="info"
                onClick={handleAddTerm}
                disabled={!newTerm.trim()}
                fullWidth
              >
                إضافة شرط
              </MDButton>
            </Grid>
          </Grid>
        </MDBox>

        <Divider sx={{ my: 2 }} />

        <MDTypography variant="subtitle2" fontWeight="medium" mb={2}>
          الشروط والأحكام الحالية
        </MDTypography>

        {loading ? (
          <MDBox display="flex" justifyContent="center" p={3}>
            <CircularProgress color="info" />
          </MDBox>
        ) : !Array.isArray(terms) ? ( // هذا الشرط يجب أن يصبح أقل احتمالاً للتحقق مع التعديلات
          <MDBox p={2} textAlign="center">
            <Alert severity="warning">
              تنسيق بيانات الشروط غير صالح. قد تحتاج إلى إعادة تحميل الصفحة أو التحقق من الخادم.
            </Alert>
          </MDBox>
        ) : terms.length === 0 ? (
          <MDBox p={2} textAlign="center">
            <MDTypography variant="body2" color="text.secondary">
              {" "}
              {/* استخدم text.secondary بدلاً من "text" */}
              لم يتم إضافة أي شروط وأحكام حتى الآن.
            </MDTypography>
          </MDBox>
        ) : (
          <List sx={{ bgcolor: "background.paper", borderRadius: 1 }}>
            {terms.map((term, index) => (
              <React.Fragment key={index}>
                {index > 0 && <Divider component="li" />}
                <ListItem
                  alignItems="flex-start"
                  secondaryAction={
                    <MDBox display="flex">
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        sx={{ mr: 0.5 }}
                        title="نقل لأعلى"
                      >
                        <Icon fontSize="small">arrow_upward</Icon>
                      </IconButton>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === terms.length - 1}
                        sx={{ mr: 0.5 }}
                        title="نقل لأسفل"
                      >
                        <Icon fontSize="small">arrow_downward</Icon>
                      </IconButton>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleRemoveTerm(index)}
                        color="error"
                        title="حذف"
                      >
                        <Icon fontSize="small">delete</Icon>
                      </IconButton>
                    </MDBox>
                  }
                >
                  <ListItemText
                    primary={
                      // الحل لتحذير تداخل DOM: استخدم component="span"
                      // أو إذا كان color="dark" خاص بـ MDTypography ولا يمكن تطبيقه عبر primaryTypographyProps
                      <MDTypography
                        component="span"
                        variant="body2"
                        fontWeight="medium"
                        color="text.primary"
                      >
                        {/*  
                          إذا كان "dark" لونًا مخصصًا في MDTypography، احتفظ به.
                          إذا كان يجب أن يكون لون نص قياسي، استخدم "text.primary" أو "text.secondary".
                          بافتراض أن "dark" يقصد به لون نص أساسي داكن.
                        */}
                        {`${index + 1}. ${String(term)}`} {/* تأكد أن term يعامل كسلسلة نصية */}
                      </MDTypography>
                    }
                    // طريقة بديلة:
                    // primary={`${index + 1}. ${String(term)}`}
                    // primaryTypographyProps={{
                    //   component: "span", // لتجنب <p> داخل <p>
                    //   variant: "body2",
                    //   fontWeight: "medium",
                    //   color: "text.primary" // أو sx: { color: 'yourCustomDarkColor' }
                    // }}
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}

        <MDBox mt={3} display="flex" justifyContent="flex-end">
          <MDButton
            variant="gradient"
            color="success"
            onClick={handleSaveTerms}
            disabled={saving || loading || !Array.isArray(terms) || terms.length === 0}
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {saving ? "جارٍ الحفظ..." : "حفظ الشروط والأحكام"}
          </MDButton>
        </MDBox>
      </MDBox>
    </Card>
  );
}

export default TermsConditionsSettings;
