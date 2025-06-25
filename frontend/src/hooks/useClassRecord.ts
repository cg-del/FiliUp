import { useState, useEffect, useCallback } from 'react';
import { quizService, ClassRecordMatrix } from '@/lib/services/quizService';
import { useErrorHandler } from './useErrorHandler';

export interface UseClassRecordReturn {
  classRecordData: ClassRecordMatrix | null;
  loading: boolean;
  error: string | null;
  refreshData: () => void;
}

export const useClassRecord = (quizType?: string): UseClassRecordReturn => {
  const [classRecordData, setClassRecordData] = useState<ClassRecordMatrix | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useErrorHandler();

  const fetchClassRecord = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await quizService.getClassRecordMatrix(quizType && quizType !== 'all' ? quizType : undefined);
      setClassRecordData(data);
    } catch (err) {
      const appError = handleError(err, { 
        showToast: false, // Don't show toast since we're displaying error in the UI
        customMessage: 'Failed to fetch class record data' 
      });
      setError(appError.message || 'Failed to fetch class record data');
      console.error('Class record fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [handleError, quizType]);

  const refreshData = useCallback(() => {
    fetchClassRecord();
  }, [fetchClassRecord]);

  useEffect(() => {
    fetchClassRecord();
  }, [fetchClassRecord]);

  return {
    classRecordData,
    loading,
    error,
    refreshData,
  };
}; 