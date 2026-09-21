// Hook to fetch individual tool data from comprehensive profile
import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';

interface ToolData {
  [key: string]: any;
}

interface ToolMetadata {
  toolName: string;
  userId: string;
  generatedAt: string;
  dataQuality: 'high' | 'medium' | 'low';
  source: string;
}

interface UseToolDataResult {
  data: ToolData | null;
  metadata: ToolMetadata | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useToolData(toolName: string): UseToolDataResult {
  const { user } = useAuth();
  const [data, setData] = useState<ToolData | null>(null);
  const [metadata, setMetadata] = useState<ToolMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchToolData = async () => {
    if (!user?.uid || !toolName) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/tools/data?userId=${user.uid}&toolName=${toolName}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setMetadata(result.metadata);
      } else {
        setError(result.error || 'Failed to fetch tool data');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tool data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchToolData();
  }, [user?.uid, toolName]);

  return {
    data,
    metadata,
    isLoading,
    error,
    refetch: fetchToolData
  };
}

// Hook to get all available tools for a user
interface AvailableTool {
  name: string;
  hasData: boolean;
  hasError: boolean;
  dataKeys: string[];
  metadata: any;
}

interface UseAvailableToolsResult {
  tools: AvailableTool[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAvailableTools(): UseAvailableToolsResult {
  const { user } = useAuth();
  const [tools, setTools] = useState<AvailableTool[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailableTools = async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/tools/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user.uid }),
      });
      
      const result = await response.json();

      if (result.success) {
        setTools(result.tools);
      } else {
        setError(result.error || 'Failed to fetch available tools');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch available tools');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableTools();
  }, [user?.uid]);

  return {
    tools,
    isLoading,
    error,
    refetch: fetchAvailableTools
  };
}
