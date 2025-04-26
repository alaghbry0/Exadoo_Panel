// src/layouts/ChatbotSettings/components/KnowledgeBaseTab.js
import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Tooltip from "@mui/material/Tooltip";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Badge from "@mui/material/Badge";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Fade from "@mui/material/Fade";
import Divider from "@mui/material/Divider";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import DataObjectIcon from "@mui/icons-material/DataObject";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import CategoryIcon from "@mui/icons-material/Category";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DataTable from "examples/Tables/DataTable";

import { format } from "date-fns";
import { fetchKnowledgeBase, fetchKnowledgeItem, deleteKnowledgeItem } from "services/api";

function KnowledgeBaseTab({
  knowledgeBase,
  setKnowledgeBase,
  categories,
  setCategories,
  showSuccessMessage,
  showErrorMessage,
  setCurrentItem,
  setIsEditMode,
  setModalOpen,
  currentTab,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshAnimation, setRefreshAnimation] = useState(false);

  // Load knowledge base on component mount or tab change
  useEffect(() => {
    loadKnowledgeBase();
  }, []);

  useEffect(() => {
    if (currentTab === 1) {
      loadKnowledgeBase();
    }
  }, [currentTab]);

  // Load knowledge base data with proper response handling
  const loadKnowledgeBase = async (page = 1, perPage = 10) => {
    setLoading(true);
    setRefreshAnimation(true);
    try {
      const response = await fetchKnowledgeBase({
        page,
        per_page: perPage,
        query: searchQuery,
        category: categoryFilter,
      });
      console.log("🔍 fetchKnowledgeBase response:", response);

      // If using axios, actual data may be on response.data
      const data = response.data ?? response;

      // Ensure items is an array
      const rawItems = Array.isArray(data.items) ? data.items : [];

      // Process items for missing fields
      const processedItems = rawItems.map((item) => ({
        ...item,
        category: item.category || "عام",
        tags: Array.isArray(item.tags) ? item.tags : [],
      }));

      // Update state once
      setKnowledgeBase({
        items: processedItems,
        total: data.total || 0,
        page: data.page || page,
        per_page: data.per_page || perPage,
        pages: data.pages || 1,
      });

      // Update categories set
      if (processedItems.length > 0) {
        const newCategories = new Set(categories);
        processedItems.forEach((item) => {
          if (item.category) newCategories.add(item.category);
        });
        setCategories(newCategories);
      }
    } catch (error) {
      console.error("Error loading knowledge base:", error);
      showErrorMessage("حدث خطأ أثناء تحميل قاعدة المعرفة");
      setKnowledgeBase((prev) => ({
        ...prev,
        items: [],
      }));
    } finally {
      setTimeout(() => {
        setRefreshAnimation(false);
        setLoading(false);
      }, 600); // للتحميل السلس
    }
  };

  // Search handler
  const handleSearch = () => {
    loadKnowledgeBase(1, knowledgeBase.per_page);
  };

  // Page change handler
  const handlePageChange = (page) => {
    loadKnowledgeBase(page, knowledgeBase.per_page);
  };

  // Add new item
  const handleAddItem = () => {
    setCurrentItem(null);
    setIsEditMode(false);
    setModalOpen(true);
  };

  // Edit existing item
  const handleEditItem = async (itemId) => {
    try {
      const response = await fetchKnowledgeItem(itemId);
      // افترض أن response == axios.get(...)
      const itemData = response.data ?? response;
      console.log("itemData for editing:", itemData);
      setCurrentItem(itemData);
      setIsEditMode(true);
      setModalOpen(true);
    } catch (error) {
      console.error("Error loading item:", error);
      showErrorMessage("حدث خطأ أثناء تحميل العنصر");
    }
  };

  // Delete item
  const handleDeleteItem = async (itemId) => {
    if (window.confirm("هل أنت متأكد من حذف هذا العنصر؟")) {
      try {
        await deleteKnowledgeItem(itemId);
        showSuccessMessage("تم حذف العنصر بنجاح");
        loadKnowledgeBase(knowledgeBase.page, knowledgeBase.per_page);
      } catch (error) {
        console.error("Error deleting item:", error);
        showErrorMessage("حدث خطأ أثناء حذف العنصر");
      }
    }
  };

  // Table columns definition
  const knowledgeColumns = [
    { Header: "العنوان", accessor: "title", width: "30%", align: "right" },
    { Header: "الفئة", accessor: "category", width: "15%", align: "center" },
    { Header: "العلامات", accessor: "tags", width: "25%", align: "center" },
    { Header: "آخر تحديث", accessor: "updated_at", width: "15%", align: "center" },
    { Header: "الإجراءات", accessor: "actions", width: "15%", align: "center" },
  ];

  // Table rows
  const knowledgeRows = (knowledgeBase.items || []).map((item) => ({
    title: (
      <MDTypography variant="body2" fontWeight="medium">
        {item.title}
      </MDTypography>
    ),
    category: (
      <Chip
        label={item.category}
        color="info"
        variant="outlined"
        size="small"
        sx={{
          fontWeight: 500,
          "& .MuiChip-label": { px: 1.5 },
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      />
    ),
    tags: (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, justifyContent: "center" }}>
        {item.tags.length > 0 ? (
          item.tags.slice(0, 3).map((tag, idx) => (
            <Chip
              key={idx}
              label={tag}
              size="small"
              sx={{
                fontSize: "0.7rem",
                backgroundColor: "rgba(85, 105, 255, 0.1)",
                color: "#3b5fe2",
                borderRadius: "4px",
                "& .MuiChip-label": { px: 1 },
              }}
            />
          ))
        ) : (
          <MDTypography variant="caption" color="text">
            لا توجد علامات
          </MDTypography>
        )}
        {item.tags.length > 3 && (
          <Chip
            label={`+${item.tags.length - 3}`}
            size="small"
            variant="outlined"
            sx={{
              borderRadius: "4px",
              minWidth: "36px",
            }}
          />
        )}
      </Box>
    ),
    updated_at: format(new Date(item.updated_at), "yyyy/MM/dd HH:mm"),
    actions: (
      <MDBox display="flex" justifyContent="center">
        <Tooltip title="تحرير العنصر">
          <IconButton
            color="info"
            size="small"
            onClick={() => handleEditItem(item.id)}
            sx={{
              mr: 1,
              "&:hover": {
                backgroundColor: "rgba(49, 130, 206, 0.1)",
              },
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="حذف العنصر">
          <IconButton
            color="error"
            size="small"
            onClick={() => handleDeleteItem(item.id)}
            sx={{
              "&:hover": {
                backgroundColor: "rgba(236, 64, 122, 0.1)",
              },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </MDBox>
    ),
  }));

  return (
    <MDBox p={3}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)", mb: 3, overflow: "visible" }}>
            <CardContent>
              <MDBox display="flex" alignItems="center" mb={2}>
                <LibraryBooksIcon color="primary" sx={{ mr: 1 }} />
                <MDTypography variant="subtitle1" fontWeight="medium">
                  قاعدة المعرفة
                </MDTypography>
                <Tooltip title="هذه القسم يحتوي على المعلومات التي يستخدمها البوت للإجابة على استفسارات المستخدمين">
                  <IconButton size="small" sx={{ ml: 1 }}>
                    <InfoOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </MDBox>

              <Divider sx={{ my: 2 }} />

              <MDBox
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                gap={2}
              >
                <MDBox display="flex" alignItems="center" gap={2} flex={1}>
                  <TextField
                    label="البحث في قاعدة المعرفة"
                    variant="outlined"
                    fullWidth
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                      },
                    }}
                  />
                  <TextField
                    select
                    label="تصفية حسب الفئة"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{
                      minWidth: 200,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CategoryIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  >
                    <MenuItem value="">الكل</MenuItem>
                    {[...categories].map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </TextField>
                </MDBox>

                <MDButton
                  variant="gradient"
                  color="success"
                  startIcon={<AddIcon />}
                  onClick={handleAddItem}
                  sx={{
                    borderRadius: "8px",
                    boxShadow: "0 4px 10px rgba(76, 175, 80, 0.2)",
                    "&:hover": {
                      boxShadow: "0 6px 12px rgba(76, 175, 80, 0.25)",
                    },
                  }}
                >
                  إضافة عنصر جديد
                </MDButton>
              </MDBox>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <CardContent>
              {loading ? (
                <Fade in={loading}>
                  <MDBox display="flex" flexDirection="column" gap={2}>
                    {[...Array(5)].map((_, i) => (
                      <Skeleton
                        key={i}
                        variant="rectangular"
                        height={60}
                        sx={{ borderRadius: "8px" }}
                      />
                    ))}
                  </MDBox>
                </Fade>
              ) : knowledgeBase.items.length === 0 ? (
                <Fade in={!loading}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      textAlign: "center",
                      border: "1px dashed rgba(0, 0, 0, 0.12)",
                      borderRadius: "8px",
                    }}
                  >
                    <DataObjectIcon
                      sx={{ fontSize: 60, color: "text.secondary", opacity: 0.3, mb: 2 }}
                    />
                    <MDTypography variant="h5" color="text" gutterBottom>
                      لم يتم العثور على أي عناصر
                    </MDTypography>
                    <MDTypography
                      variant="body2"
                      color="text"
                      sx={{ maxWidth: "500px", mx: "auto", mb: 3 }}
                    >
                      يمكنك إضافة عناصر جديدة إلى قاعدة المعرفة لتحسين قدرات البوت على الإجابة على
                      استفسارات المستخدمين
                    </MDTypography>
                    <MDButton
                      variant="outlined"
                      color="info"
                      onClick={handleAddItem}
                      startIcon={<AddIcon />}
                      sx={{
                        borderRadius: "8px",
                        px: 3,
                        py: 1,
                        fontSize: "0.9rem",
                      }}
                    >
                      إضافة أول عنصر
                    </MDButton>
                  </Paper>
                </Fade>
              ) : (
                <Fade in={!loading}>
                  <Box>
                    <Badge
                      badgeContent={knowledgeBase.total}
                      color="primary"
                      max={999}
                      sx={{
                        "& .MuiBadge-badge": {
                          fontSize: "0.8rem",
                          borderRadius: "8px",
                          px: 1,
                        },
                        display: "block",
                        mb: 2,
                      }}
                    >
                      <MDTypography variant="button" color="text">
                        إجمالي العناصر
                      </MDTypography>
                    </Badge>

                    <DataTable
                      table={{ columns: knowledgeColumns, rows: knowledgeRows }}
                      isSorted={false}
                      entriesPerPage={{
                        defaultValue: knowledgeBase.per_page,
                        entries: [5, 10, 15, 20, 25],
                        canChange: true,
                      }}
                      showTotalEntries
                      pagination
                      totalCount={knowledgeBase.total}
                      page={knowledgeBase.page}
                      totalPages={knowledgeBase.pages}
                      onPageChange={handlePageChange}
                      sx={{
                        "& .MuiTableRow-root:hover": {
                          backgroundColor: "rgba(0, 0, 0, 0.02)",
                        },
                      }}
                    />
                  </Box>
                </Fade>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </MDBox>
  );
}

export default KnowledgeBaseTab;
