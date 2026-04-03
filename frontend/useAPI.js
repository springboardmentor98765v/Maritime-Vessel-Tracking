// src/hooks/useAPI.js
// Reusable hook with loading + error states
// PDF says: handle loading state + error state

import { useState, useEffect } from "react";

const useAPI = (apiFunction, dependencies = []) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction();
      setData(result);
    } catch (err) {
      // ── No silent failures ──
      setError(
        err.response?.data?.error ||
        err.message ||
        "Something went wrong"
      );
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
};

export default useAPI;