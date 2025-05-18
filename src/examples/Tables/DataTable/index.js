import { useMemo, useEffect, useState } from "react";

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// react-table components
import { useTable, usePagination, useGlobalFilter, useAsyncDebounce, useSortBy } from "react-table";

// @mui material components
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Icon from "@mui/material/Icon";
import Autocomplete from "@mui/material/Autocomplete";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDPagination from "components/MDPagination";

// Material Dashboard 2 React example components
import DataTableHeadCell from "examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "examples/Tables/DataTable/DataTableBodyCell";

function DataTable({
  entriesPerPage,
  canSearch,
  showTotalEntries,
  table,
  pagination, // { variant, color }
  isSorted,
  noEndBorder,
  // Props جديدة/معدلة لـ manual pagination
  manualPagination, // Boolean: هل التنقل يدوي (من الخادم)؟
  pageCount: controlledPageCount, // العدد الإجمالي للصفحات من الخادم
  page: controlledPageIndex, // الصفحة الحالية (0-indexed) من الخادم
  onPageChange, // دالة تُستدعى عند تغيير الصفحة (تمرر رقم الصفحة الجديد 0-indexed)
  onEntriesPerPageChange, // دالة تُستدعى عند تغيير عدد الإدخالات لكل صفحة
}) {
  const { columns, rows: data } = table; // rows من table هي بيانات الصفحة الحالية فقط

  // إذا كان التنقل يدويًا، فإننا لا نريد لـ usePagination أن يحاول حساب الصفحات
  // بناءً على البيانات المحدودة التي نمررها له.
  // نمرر له pageCount الذي حصلنا عليه من الخادم.
  const tableInstance = useTable(
    {
      columns,
      data, // هذه هي بيانات الصفحة الحالية فقط
      initialState: {
        pageIndex: manualPagination ? controlledPageIndex : 0, // استخدم الصفحة المتحكم بها إذا كان التنقل يدويًا
        pageSize: entriesPerPage.defaultValue || 10,
      },
      manualPagination: manualPagination, // أخبر react-table أن التنقل يدوي
      pageCount: manualPagination ? controlledPageCount : undefined, // أخبر react-table بالعدد الإجمالي للصفحات
    },
    useGlobalFilter,
    useSortBy,
    usePagination // لا يزال مطلوبًا للوصول إلى gotoPage, setPageSize إلخ.
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows, // rows هنا هي نفس data التي مررناها (بيانات الصفحة الحالية)
    page, // page هنا ستكون هي نفسها rows في حالة manualPagination إذا كان pageCount = 1
    // pageOptions, // لا نعتمد على هذه بشكل مباشر لعرض الأزرار في manualPagination
    // canPreviousPage, // سنحسبها بناءً على controlledPageIndex
    // canNextPage, // سنحسبها بناءً على controlledPageIndex
    // gotoPage, // سنستخدم onPageChange
    // nextPage, // سنستخدم onPageChange
    // previousPage, // سنستخدم onPageChange
    setPageSize,
    setGlobalFilter,
    state: { pageIndex: internalPageIndex, pageSize, globalFilter }, // internalPageIndex هو ما يعتقده usePagination
  } = tableInstance;

  // استخدم القيم المتحكم بها إذا كان التنقل يدويًا
  const currentPageIndex = manualPagination ? controlledPageIndex : internalPageIndex;
  const totalPages = manualPagination ? controlledPageCount : tableInstance.pageOptions.length;

  const canGoPreviousPage = currentPageIndex > 0;
  const canGoNextPage = currentPageIndex < totalPages - 1;

  // Set the default value for the entries per page when component mounts
  useEffect(() => {
    if (entriesPerPage.defaultValue) {
      setPageSize(entriesPerPage.defaultValue);
      if (manualPagination && onEntriesPerPageChange) {
        // إذا كان التنقل يدويًا، أبلغ المكون الأصلي بتغيير حجم الصفحة أيضًا
        // onEntriesPerPageChange(entriesPerPage.defaultValue); // قد يسبب حلقة إذا لم يتم التعامل معه بحذر
      }
    }
  }, [entriesPerPage.defaultValue, setPageSize, manualPagination, onEntriesPerPageChange]);

  const handleSetEntriesPerPage = (value) => {
    const newPageSize = parseInt(value, 10);
    setPageSize(newPageSize); // لـ react-table الداخلي
    if (manualPagination && onEntriesPerPageChange) {
      onEntriesPerPageChange(newPageSize); // أبلغ المكون الأصلي
    } else if (!manualPagination) {
      // إذا كان التنقل داخليًا، انتقل إلى الصفحة الأولى عند تغيير حجم الصفحة
      tableInstance.gotoPage(0);
    }
  };

  // Render the paginations
  const renderCustomPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    // منطق لعرض أرقام الصفحات (يمكن تحسينه لعرض "..." للصفحات الكثيرة)
    // مثال بسيط:
    const MAX_PAGES_SHOWN = 5; // أقصى عدد أزرار صفحات تظهر
    let startPage = Math.max(0, currentPageIndex - Math.floor(MAX_PAGES_SHOWN / 2));
    let endPage = Math.min(totalPages - 1, startPage + MAX_PAGES_SHOWN - 1);

    if (endPage - startPage + 1 < MAX_PAGES_SHOWN) {
      startPage = Math.max(0, endPage - MAX_PAGES_SHOWN + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <MDPagination
          item
          key={i}
          onClick={() => (manualPagination ? onPageChange(i) : tableInstance.gotoPage(i))}
          active={currentPageIndex === i}
        >
          {i + 1}
        </MDPagination>
      );
    }
    // يمكنك إضافة "..." هنا إذا لزم الأمر

    return pageNumbers;
  };

  // Search input value state
  const [search, setSearch] = useState(globalFilter);

  // Search input state handle
  const onSearchChangeDebounced = useAsyncDebounce((value) => {
    // إذا كان البحث يدويًا أيضًا (لم يتم تطبيقه هنا)، ستحتاج لتمرير هذا للخارج
    setGlobalFilter(value || undefined);
  }, 100);

  // A function that sets the sorted value for the table
  const setSortedValue = (column) => {
    let sortedValue;
    if (isSorted && column.isSorted) {
      sortedValue = column.isSortedDesc ? "desc" : "asce";
    } else if (isSorted) {
      sortedValue = "none";
    } else {
      sortedValue = false;
    }
    return sortedValue;
  };

  // معلومات الإدخالات المعروضة
  // في حالة manualPagination، rows.length هو عدد سجلات الصفحة الحالية (pageSizeApi)
  // و totalRecords يجب أن يأتيك من props إذا أردت عرضه بشكل دقيق
  // حاليًا، `DataTable` لا يتلقى `totalRecords` كـ prop.
  // `PaymentsPage` هو الذي يعرض "إجمالي السجلات".
  // يمكننا تعديل هذا ليكون أكثر دقة إذا مررنا totalRecords
  const entriesStart = currentPageIndex * pageSize + 1;
  const entriesEnd = Math.min(
    (currentPageIndex + 1) * pageSize,
    data.length + currentPageIndex * pageSize
  ); // هذا صحيح لبيانات الصفحة الحالية
  // إذا أردت عرض "of totalRecords" هنا، ستحتاج لـ totalRecords prop.

  return (
    <TableContainer sx={{ boxShadow: "none" }}>
      {/* --- قسم التحكم في عدد الإدخالات والبحث --- */}
      {(entriesPerPage || canSearch) && (
        <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
          {entriesPerPage && (
            <MDBox display="flex" alignItems="center">
              <Autocomplete
                disableClearable
                value={pageSize.toString()}
                options={
                  entriesPerPage.options
                    ? entriesPerPage.options.map((o) => o.toString())
                    : ["10", "20", "50"]
                }
                onChange={(event, newValue) => {
                  handleSetEntriesPerPage(newValue);
                }}
                size="small"
                sx={{ width: "5rem" }}
                renderInput={(params) => <MDInput {...params} />}
              />
              <MDTypography variant="caption" color="secondary">
                entries per page
              </MDTypography>
            </MDBox>
          )}
          {canSearch && ( // البحث هنا هو بحث react-table الداخلي
            <MDBox width="12rem" ml="auto">
              <MDInput
                placeholder="Search..."
                value={search || ""}
                size="small"
                fullWidth
                onChange={({ currentTarget }) => {
                  setSearch(currentTarget.value);
                  onSearchChangeDebounced(currentTarget.value);
                }}
              />
            </MDBox>
          )}
        </MDBox>
      )}

      {/* --- الجدول --- */}
      <Table {...getTableProps()}>
        <MDBox component="thead">
          {headerGroups.map((headerGroup) => (
            <TableRow key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <DataTableHeadCell
                  key={column.id}
                  {...column.getHeaderProps(isSorted && column.getSortByToggleProps())}
                  width={column.width ? column.width : "auto"}
                  align={column.align ? column.align : "left"}
                  sorted={setSortedValue(column)}
                >
                  {column.render("Header")}
                </DataTableHeadCell>
              ))}
            </TableRow>
          ))}
        </MDBox>
        <TableBody {...getTableBodyProps()}>
          {page.map((row, i) => {
            // page هنا هي صفوف الصفحة الحالية من react-table
            prepareRow(row);
            return (
              <TableRow key={row.id || i} {...row.getRowProps()}>
                {row.cells.map((cell) => (
                  <DataTableBodyCell
                    key={cell.id}
                    noBorder={noEndBorder && i === page.length - 1}
                    align={cell.column.align ? cell.column.align : "left"}
                    {...cell.getCellProps()}
                  >
                    {cell.render("Cell")}
                  </DataTableBodyCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* --- قسم التنقل --- */}
      <MDBox
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        p={totalPages <= 1 && !showTotalEntries ? 0 : 3}
      >
        {showTotalEntries &&
          data.length > 0 && ( // أظهر فقط إذا كانت هناك بيانات
            <MDBox mb={{ xs: 3, sm: 0 }}>
              <MDTypography variant="button" color="secondary" fontWeight="regular">
                {/* هذا النص يعتمد على totalRecords الكلي الذي يجب أن يمرر */}
                Showing {entriesStart} to {entriesEnd} of{" "}
                {manualPagination
                  ? controlledPageIndex * pageSize + data.length
                  : tableInstance.rows.length}{" "}
                entries
                {/* إذا أردت عرض الإجمالي الحقيقي، ستحتاج لتمرير totalRecords من PaymentsPage */}
              </MDTypography>
            </MDBox>
          )}
        {totalPages > 1 && (
          <MDPagination
            variant={pagination.variant ? pagination.variant : "gradient"}
            color={pagination.color ? pagination.color : "info"}
          >
            {canGoPreviousPage && (
              <MDPagination
                item
                onClick={() =>
                  manualPagination
                    ? onPageChange(currentPageIndex - 1)
                    : tableInstance.previousPage()
                }
              >
                <Icon sx={{ fontWeight: "bold" }}>chevron_left</Icon>
              </MDPagination>
            )}
            {/* {renderPagination.length > 6 ? ( ... ) : renderPagination}  */}
            {/* استبدل هذا بـ renderCustomPagination */}
            {renderCustomPagination()}
            {canGoNextPage && (
              <MDPagination
                item
                onClick={() =>
                  manualPagination ? onPageChange(currentPageIndex + 1) : tableInstance.nextPage()
                }
              >
                <Icon sx={{ fontWeight: "bold" }}>chevron_right</Icon>
              </MDPagination>
            )}
          </MDPagination>
        )}
      </MDBox>
    </TableContainer>
  );
}

DataTable.defaultProps = {
  entriesPerPage: { defaultValue: 10, options: [10, 20, 50, 100] }, // تأكد أن options موجودة
  canSearch: false,
  showTotalEntries: true,
  pagination: { variant: "gradient", color: "info" },
  isSorted: true,
  noEndBorder: false,
  manualPagination: false, // القيمة الافتراضية
  pageCount: 0,
  page: 0,
};

DataTable.propTypes = {
  entriesPerPage: PropTypes.shape({
    // تم تعديل الشكل ليتضمن options
    defaultValue: PropTypes.number,
    options: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  }),
  canSearch: PropTypes.bool,
  showTotalEntries: PropTypes.bool,
  table: PropTypes.shape({
    columns: PropTypes.arrayOf(PropTypes.object).isRequired,
    rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  }).isRequired,
  pagination: PropTypes.shape({
    variant: PropTypes.oneOf(["contained", "gradient"]),
    color: PropTypes.oneOf([
      "primary",
      "secondary",
      "info",
      "success",
      "warning",
      "error",
      "dark",
      "light",
    ]),
  }),
  isSorted: PropTypes.bool,
  noEndBorder: PropTypes.bool,
  // Props جديدة لـ manual pagination
  manualPagination: PropTypes.bool,
  pageCount: PropTypes.number, // العدد الإجمالي للصفحات
  page: PropTypes.number, // الصفحة الحالية (0-indexed)
  onPageChange: PropTypes.func,
  onEntriesPerPageChange: PropTypes.func,
};

export default DataTable;
