import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

interface TranslationResult {
  success: boolean;
  translation: string | null;
  source_lang: string;
  target_lang: string;
  original_text: string;
  cached: boolean;
  error?: string;
}

interface TranslationContextType {
  translateText: (text: string, targetLang: string, sourceLang?: string) => Promise<TranslationResult>;
  translateBatch: (texts: string[], targetLang: string, sourceLang?: string) => Promise<TranslationResult[]>;
  translateTechnical: (text: string, targetLang: string, domain?: string) => Promise<TranslationResult>;
  translateWithContext: (text: string, targetLang: string, context: string) => Promise<TranslationResult>;
  getSupportedLanguages: () => Promise<Record<string, string>>;
  getCacheStats: () => Promise<any>;
  clearCache: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:8000';

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translateText = useCallback(async (
    text: string, 
    targetLang: string, 
    sourceLang = 'en'
  ): Promise<TranslationResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/rag/translate`, {
        text,
        target_language: targetLang,
        source_language: sourceLang
      });
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Translation failed';
      setError(errorMessage);
      return {
        success: false,
        translation: null,
        source_lang: sourceLang,
        target_lang: targetLang,
        original_text: text,
        cached: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const translateBatch = useCallback(async (
    texts: string[], 
    targetLang: string, 
    sourceLang = 'en'
  ): Promise<TranslationResult[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/rag/translate/batch`, {
        texts,
        target_language: targetLang,
        source_language: sourceLang
      });
      
      return response.data.results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Batch translation failed';
      setError(errorMessage);
      return texts.map(text => ({
        success: false,
        translation: null,
        source_lang: sourceLang,
        target_lang: targetLang,
        original_text: text,
        cached: false,
        error: errorMessage
      }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const translateTechnical = useCallback(async (
    text: string, 
    targetLang: string, 
    domain = 'general'
  ): Promise<TranslationResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/rag/translate/technical`, {
        text,
        target_language: targetLang,
        domain
      });
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Technical translation failed';
      setError(errorMessage);
      return {
        success: false,
        translation: null,
        source_lang: 'en',
        target_lang: targetLang,
        original_text: text,
        cached: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const translateWithContext = useCallback(async (
    text: string, 
    targetLang: string, 
    context: string
  ): Promise<TranslationResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/rag/translate/context`, {
        text,
        target_language: targetLang,
        context
      });
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Context translation failed';
      setError(errorMessage);
      return {
        success: false,
        translation: null,
        source_lang: 'en',
        target_lang: targetLang,
        original_text: text,
        cached: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSupportedLanguages = useCallback(async (): Promise<Record<string, string>> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/rag/translate/languages`);
      return response.data.languages;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch languages';
      setError(errorMessage);
      return {};
    }
  }, []);

  const getCacheStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/rag/translate/cache`);
      return response.data.stats;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cache stats';
      setError(errorMessage);
      return null;
    }
  }, []);

  const clearCache = useCallback(async () => {
    try {
      await axios.delete(`${API_BASE_URL}/rag/translate/cache`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear cache';
      setError(errorMessage);
    }
  }, []);

  const value: TranslationContextType = {
    translateText,
    translateBatch,
    translateTechnical,
    translateWithContext,
    getSupportedLanguages,
    getCacheStats,
    clearCache,
    isLoading,
    error
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
