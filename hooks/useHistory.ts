"use client";
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from './use-auth';
import { getAskHistory, AskHistory } from '@/lib/firebase';

export function useHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<AskHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const refreshHistory = useCallback(async () => {
    if (!user?.uid) {
      setHistory([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const userHistory = await getAskHistory(user.uid);
      setHistory(userHistory);
    } catch (err) {
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  const getQuestionType = useCallback((question: string) => {
    const lowerQuestion = question.toLowerCase();
    if (lowerQuestion.includes('love') || lowerQuestion.includes('relationship')) return 'Love';
    if (lowerQuestion.includes('money') || lowerQuestion.includes('career') || lowerQuestion.includes('job')) return 'Career';
    if (lowerQuestion.includes('health') || lowerQuestion.includes('body')) return 'Health';
    if (lowerQuestion.includes('travel') || lowerQuestion.includes('journey')) return 'Travel';
    return 'General';
  }, []);

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === "all" || 
        getQuestionType(item.question).toLowerCase().includes(filterType.toLowerCase());
      return matchesSearch && matchesFilter;
    });
  }, [history, searchTerm, filterType, getQuestionType]);

  const formatDate = useCallback((timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }, []);

  const getTypeColor = useCallback((type: string) => {
    switch (type) {
      case 'Love':
        return { bg: 'bg-pink-500/20', text: 'text-pink-300', border: 'border-pink-500/30' };
      case 'Career':
        return { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30' };
      case 'Health':
        return { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/30' };
      case 'Travel':
        return { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30' };
      default:
        return { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/30' };
    }
  }, []);

  return {
    history,
    filteredHistory,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    getQuestionType,
    formatDate,
    getTypeColor,
    refreshHistory,
  };
} 