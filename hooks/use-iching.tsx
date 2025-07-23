import { useState } from "react";

export function useIChing() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Placeholder logic
  return { data, loading, error };
} 