import { useState } from "react";

export function usePalmistry() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Placeholder logic
  return { data, loading, error };
} 