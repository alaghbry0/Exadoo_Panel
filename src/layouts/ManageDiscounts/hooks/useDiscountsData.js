// src/hooks/useDiscountsData.js

import { useState, useEffect, useCallback } from "react";
import { getDiscounts, getSubscriptionData, getSubscriptionPlans } from "services/api";

export function useDiscountsData() {
  const [data, setData] = useState({
    discounts: [],
    subscriptionTypes: [],
    availablePlans: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [discountsData, subsData, plansData] = await Promise.all([
        getDiscounts(),
        getSubscriptionData(true),
        getSubscriptionPlans(),
      ]);

      setData({
        discounts: discountsData || [],
        subscriptionTypes: subsData.flatMap((group) => group.subscription_types) || [],
        availablePlans: plansData || [],
      });
    } catch (err) {
      setError("Failed to load data. Please try again.");
      console.error("Fetch data error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // إعادة تسمية fetchData إلى refreshData لتوضيح الغرض منها عند استدعائها من المكون
  return { ...data, loading, error, refreshData: fetchData };
}
