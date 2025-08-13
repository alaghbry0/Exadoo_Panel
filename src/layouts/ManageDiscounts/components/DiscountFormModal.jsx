import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Box,
  Card,
  Switch,
  IconButton,
  Tooltip,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import { createDiscount, updateDiscount } from "services/api";

function TierRow({ tier, index, onTierChange, onRemoveTier, canRemove }) {
  return (
    <Grid container spacing={2} sx={{ mb: 2, alignItems: "center" }}>
      <Grid item xs={12} sm={2.5}>
        <TextField
          label={`Discount Value (%)`}
          type="number"
          value={tier.discount_value ?? ""}
          onChange={(e) => onTierChange(index, "discount_value", e.target.value)}
          fullWidth
          required
        />
      </Grid>
      <Grid item xs={12} sm={2.5}>
        <TextField
          label="Max Slots"
          type="number"
          value={tier.max_slots ?? ""}
          onChange={(e) => onTierChange(index, "max_slots", e.target.value)}
          fullWidth
          required
        />
      </Grid>
      <Grid item xs={12} sm={3}>
        <FormControlLabel
          control={
            <Checkbox
              checked={tier.display_fake_count || false}
              onChange={(e) => onTierChange(index, "display_fake_count", e.target.checked)}
            />
          }
          label={
            <Box display="flex" alignItems="center">
              Fake Count
              <Tooltip title="Display a limited number of slots to the user, even if more are available, to create urgency.">
                <InfoOutlinedIcon sx={{ ml: 0.5, fontSize: "1rem", color: "text.secondary" }} />
              </Tooltip>
            </Box>
          }
        />
      </Grid>
      <Grid item xs={14} sm={2.5}>
        <TextField
          label="Fake Value"
          type="number"
          value={tier.fake_count_value ?? ""}
          onChange={(e) => onTierChange(index, "fake_count_value", e.target.value)}
          fullWidth
          disabled={!tier.display_fake_count}
          helperText={tier.display_fake_count ? "Max slots show" : ""}
        />
      </Grid>
      <Grid item xs={12} sm={1.5} display="flex" justifyContent="flex-end">
        <Tooltip title="Remove Tier">
          <span>
            <IconButton onClick={() => onRemoveTier(index)} disabled={!canRemove}>
              <RemoveCircleOutlineIcon color={!canRemove ? "disabled" : "error"} />
            </IconButton>
          </span>
        </Tooltip>
      </Grid>
    </Grid>
  );
}

function DiscountFormModal({
  open,
  onClose,
  onSuccess,
  initialData,
  subscriptionTypes,
  availablePlans,
}) {
  const { enqueueSnackbar } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filteredPlans, setFilteredPlans] = useState([]);

  const defaultTier = {
    tier_order: 1,
    discount_value: "",
    max_slots: "",
    display_fake_count: false,
    fake_count_value: "",
  };
  const defaultState = {
    name: "",
    description: "",
    is_tiered: false,
    discount_type: "percentage",
    discount_value: "",
    max_users: "",
    applicable_to_subscription_type_id: "",
    applicable_to_subscription_plan_id: "",
    start_date: null,
    end_date: null,
    is_active: true,
    lock_in_price: false,
    lose_on_lapse: false,
    target_audience: "all_new",
    price_lock_duration_months: "",
    tiers: [defaultTier],
  };

  const [formData, setFormData] = useState(defaultState);
  const mode = initialData ? "edit" : "add";

  useEffect(() => {
    if (open) {
      if (initialData) {
        // ⭐ الحل النهائي: تحليل سلسلة tiers النصية وتحويلها إلى مصفوفة
        let parsedTiers = [defaultTier];
        if (initialData.tiers) {
          if (typeof initialData.tiers === "string") {
            try {
              const tiersFromString = JSON.parse(initialData.tiers);
              if (Array.isArray(tiersFromString) && tiersFromString.length > 0) {
                parsedTiers = tiersFromString;
              }
            } catch (e) {
              console.error("Failed to parse tiers JSON string:", e);
              // إذا فشل التحليل، سيتم استخدام القيمة الافتراضية
            }
          } else if (Array.isArray(initialData.tiers) && initialData.tiers.length > 0) {
            parsedTiers = initialData.tiers;
          }
        }

        const finalState = {
          ...defaultState,
          ...initialData,
          name: initialData.name || "",
          description: initialData.description || "",
          discount_value: initialData.discount_value ?? "",
          max_users: initialData.max_users ?? "",
          applicable_to_subscription_type_id: initialData.applicable_to_subscription_type_id || "",
          applicable_to_subscription_plan_id: initialData.applicable_to_subscription_plan_id || "",
          price_lock_duration_months: initialData.price_lock_duration_months ?? "",
          start_date: initialData.start_date ? dayjs(initialData.start_date) : null,
          end_date: initialData.end_date ? dayjs(initialData.end_date) : null,
          tiers: parsedTiers, // استخدم المصفوفة التي تم تحليلها هنا
        };
        setFormData(finalState);

        const typeId = initialData.applicable_to_subscription_type_id || "";
        setFilteredPlans(
          typeId ? availablePlans.filter((p) => p.subscription_type_id === typeId) : []
        );
      } else {
        setFormData(defaultState);
        setFilteredPlans([]);
      }
    }
  }, [initialData, open, availablePlans]);

  const handleChange = (e, toggleValue) => {
    const name = e.target.name;
    if (name === "is_tiered" && toggleValue !== null) {
      setFormData((prev) => {
        const isSwitchingToTiered = toggleValue === true;
        const currentTiersAreInvalid = !Array.isArray(prev.tiers) || prev.tiers.length === 0;
        if (isSwitchingToTiered && currentTiersAreInvalid) {
          return { ...prev, is_tiered: true, tiers: [defaultTier] };
        }
        return { ...prev, is_tiered: toggleValue };
      });
      return;
    }
    const { value, type, checked } = e.target;
    const inputValue = type === "checkbox" || type === "switch" ? checked : value;
    if (name === "applicable_to_subscription_type_id") {
      setFormData((prev) => ({
        ...prev,
        applicable_to_subscription_type_id: inputValue,
        applicable_to_subscription_plan_id: "",
      }));
      setFilteredPlans(
        inputValue ? availablePlans.filter((p) => p.subscription_type_id === inputValue) : []
      );
    } else {
      setFormData((prev) => ({ ...prev, [name]: inputValue }));
    }
  };

  const handleTierChange = (index, field, value) => {
    setFormData((prev) => {
      if (!Array.isArray(prev.tiers)) return prev;
      const newTiers = prev.tiers.map((tier, i) => {
        if (i === index) {
          return { ...tier, [field]: value };
        }
        return tier;
      });
      return { ...prev, tiers: newTiers };
    });
  };

  const addTier = () => {
    setFormData((prev) => {
      const currentTiers = Array.isArray(prev.tiers) ? prev.tiers : [];
      return {
        ...prev,
        tiers: [...currentTiers, { ...defaultTier, tier_order: currentTiers.length + 1 }],
      };
    });
  };

  const removeTier = (index) => {
    setFormData((prev) => {
      if (!Array.isArray(prev.tiers) || prev.tiers.length <= 1) {
        return prev;
      }
      const newTiers = prev.tiers
        .filter((_, i) => i !== index)
        .map((tier, idx) => ({ ...tier, tier_order: idx + 1 }));
      return { ...prev, tiers: newTiers };
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let commonData = {
        name: formData.name,
        description: formData.description,
        is_active: formData.is_active,
        target_audience: formData.target_audience,
        applicable_to_subscription_type_id: formData.applicable_to_subscription_type_id || null,
        applicable_to_subscription_plan_id: formData.applicable_to_subscription_plan_id || null,
        start_date: formData.start_date ? formData.start_date.toISOString() : null,
        end_date: formData.end_date ? formData.end_date.toISOString() : null,
        lose_on_lapse: formData.lose_on_lapse,
      };

      let dataToSubmit;
      if (formData.is_tiered) {
        const tiersToSubmit = Array.isArray(formData.tiers) ? formData.tiers : [];
        dataToSubmit = {
          ...commonData,
          is_tiered: true,
          lock_in_price: formData.lock_in_price,
          price_lock_duration_months: formData.price_lock_duration_months
            ? parseInt(formData.price_lock_duration_months, 10)
            : null,
          tiers: tiersToSubmit.map((t) => ({
            tier_order: t.tier_order,
            discount_value: parseFloat(t.discount_value),
            max_slots: parseInt(t.max_slots, 10),
            display_fake_count: t.display_fake_count,
            fake_count_value:
              t.display_fake_count && t.fake_count_value ? parseInt(t.fake_count_value, 10) : null,
          })),
        };
      } else {
        dataToSubmit = {
          ...commonData,
          is_tiered: false,
          discount_type: formData.discount_type,
          discount_value: parseFloat(formData.discount_value),
          max_users: formData.max_users ? parseInt(formData.max_users, 10) : null,
          lock_in_price: formData.lock_in_price,
        };
      }

      if (mode === "edit") {
        await updateDiscount(initialData.id, dataToSubmit);
        enqueueSnackbar("Discount updated successfully!", { variant: "success" });
      } else {
        await createDiscount(dataToSubmit);
        enqueueSnackbar("Discount created successfully!", { variant: "success" });
      }
      onSuccess();
    } catch (err) {
      console.error("Failed to save discount:", err);
      enqueueSnackbar(err.response?.data?.error || "An error occurred.", { variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>{mode === "edit" ? "Edit Discount" : "Create New Discount"}</DialogTitle>
        <DialogContent dividers sx={{ p: 3, bgcolor: "#f5f5f5" }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card sx={{ p: 2 }}>
                <MDTypography variant="h6">Basic Information</MDTypography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={8}>
                    <TextField
                      name="name"
                      label="Discount Name"
                      value={formData.name}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.is_active}
                          onChange={handleChange}
                          name="is_active"
                        />
                      }
                      label="Discount is Active"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="description"
                      label="Description"
                      value={formData.description}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={2}
                    />
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <MDTypography variant="h6">Discount Type</MDTypography>
                <ToggleButtonGroup
                  color="info"
                  value={formData.is_tiered}
                  exclusive
                  onChange={(e, val) => handleChange({ target: { name: "is_tiered" } }, val)}
                  sx={{ mt: 1 }}
                >
                  <ToggleButton value={false}>Standard</ToggleButton>
                  <ToggleButton value={true}>Tiered</ToggleButton>
                </ToggleButtonGroup>
              </Card>
            </Grid>

            <Grid item xs={12}>
              {formData.is_tiered ? (
                <Card sx={{ p: 2 }}>
                  <MDTypography variant="h6">Tiered Discount Settings</MDTypography>
                  <Box sx={{ mt: 2 }}>
                    {Array.isArray(formData.tiers) &&
                      formData.tiers.map((tier, index) => (
                        <TierRow
                          key={index}
                          tier={tier}
                          index={index}
                          onTierChange={handleTierChange}
                          onRemoveTier={removeTier}
                          canRemove={formData.tiers.length > 1}
                        />
                      ))}
                    <MDButton
                      onClick={addTier}
                      variant="outlined"
                      color="info"
                      startIcon={<AddCircleOutlineIcon />}
                    >
                      Add Tier
                    </MDButton>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <MDTypography variant="h6" sx={{ mb: 1 }}>
                    Price Lock Rules
                  </MDTypography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.lock_in_price}
                            onChange={handleChange}
                            name="lock_in_price"
                          />
                        }
                        label="Lock-in price for the user"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="price_lock_duration_months"
                        label="Lock Duration (Months)"
                        value={formData.price_lock_duration_months}
                        onChange={handleChange}
                        type="number"
                        fullWidth
                        disabled={!formData.lock_in_price}
                        helperText="Optional. Leave empty for permanent lock."
                      />
                    </Grid>
                  </Grid>
                </Card>
              ) : (
                <Card sx={{ p: 2 }}>
                  <MDTypography variant="h6">Standard Discount Settings</MDTypography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Select
                          name="discount_type"
                          value={formData.discount_type}
                          label="Type"
                          onChange={handleChange}
                        >
                          <MenuItem value="percentage">Percentage</MenuItem>
                          <MenuItem value="fixed_amount">Fixed Amount</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        name="discount_value"
                        label="Value"
                        value={formData.discount_value}
                        onChange={handleChange}
                        type="number"
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        name="max_users"
                        label="Max Users"
                        value={formData.max_users}
                        onChange={handleChange}
                        type="number"
                        fullWidth
                        helperText="Optional. Leave empty for unlimited."
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.lock_in_price}
                            onChange={handleChange}
                            name="lock_in_price"
                          />
                        }
                        label="Lock-in price for the user."
                      />
                    </Grid>
                  </Grid>
                </Card>
              )}
            </Grid>

            <Grid item xs={12}>
              <Card sx={{ p: 2 }}>
                <MDTypography variant="h6">Application Rules</MDTypography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Target Audience</InputLabel>
                      <Select
                        name="target_audience"
                        value={formData.target_audience}
                        label="Target Audience"
                        onChange={handleChange}
                      >
                        <MenuItem value="all_new">All New Subscribers</MenuItem>
                        <MenuItem value="existing_subscribers">Existing Subscribers</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.lose_on_lapse}
                          onChange={handleChange}
                          name="lose_on_lapse"
                        />
                      }
                      label="User loses discount if subscription expires."
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Applicable to Type</InputLabel>
                      <Select
                        name="applicable_to_subscription_type_id"
                        value={formData.applicable_to_subscription_type_id}
                        onChange={handleChange}
                        label="Applicable to Type"
                      >
                        <MenuItem value="">
                          <em>Any Type</em>
                        </MenuItem>
                        {subscriptionTypes.map((type) => (
                          <MenuItem key={type.id} value={type.id}>
                            {type.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth disabled={!formData.applicable_to_subscription_type_id}>
                      <InputLabel>Applicable to Plan (Optional)</InputLabel>
                      <Select
                        name="applicable_to_subscription_plan_id"
                        value={formData.applicable_to_subscription_plan_id}
                        onChange={handleChange}
                        label="Applicable to Plan (Optional)"
                      >
                        <MenuItem value="">
                          <em>Any Plan in Type</em>
                        </MenuItem>
                        {filteredPlans.map((plan) => (
                          <MenuItem key={plan.id} value={plan.id}>
                            {plan.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DateTimePicker
                      label="Start Date (Optional)"
                      value={formData.start_date}
                      onChange={(d) => handleChange({ target: { name: "start_date", value: d } })}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DateTimePicker
                      label="End Date (Optional)"
                      value={formData.end_date}
                      onChange={(d) => handleChange({ target: { name: "end_date", value: d } })}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: "16px 24px" }}>
          <MDButton onClick={onClose} color="secondary">
            Cancel
          </MDButton>
          <MDButton onClick={handleSubmit} variant="contained" color="info" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </MDButton>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}

export default DiscountFormModal;
