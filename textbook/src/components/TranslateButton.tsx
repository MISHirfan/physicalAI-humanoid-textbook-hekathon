import React, { useState } from 'react';
import { useTranslation } from './TranslationProvider';
import { FaLanguage, FaSpinner } from 'react-icons/fa';

interface TranslateButtonProps {
  text: string;
  targetLanguage?: string;
  sourceLanguage?: string;
  domain?: string;
  context?: string;
  onTranslationComplete?: (result: any) => void;
  className?: string;
  children?: React.ReactNode;
}

export const TranslateButton: React.FC<TranslateButtonProps> = ({
  text,
  targetLanguage = 'ur',
  sourceLanguage = 'en',
  domain,
  context,
  onTranslationComplete,
  className = '',
  children
}) => {
  const { translateText, translateTechnical, translateWithContext, isLoading } = useTranslation();
  const [isTranslated, setIsTranslated] = useState(false);
  const [translatedText, setTranslatedText] = useState<string>('');

  const handleTranslate = async () => {
    if (!text.trim()) return;

    let result;
    if (context) {
      result = await translateWithContext(text, targetLanguage, context);
    } else if (domain) {
      result = await translateTechnical(text, targetLanguage, domain);
    } else {
      result = await translateText(text, targetLanguage, sourceLanguage);
    }

    if (result.success && result.translation) {
      setTranslatedText(result.translation);
      setIsTranslated(true);
      onTranslationComplete?.(result);
    }
  };

  const handleToggle = () => {
    if (isTranslated) {
      setIsTranslated(false);
    } else {
      handleTranslate();
    }
  };

  return (
    <div className={`translate-button-container ${className}`}>
      <button
        onClick={handleToggle}
        disabled={isLoading || !text.trim()}
        className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        title={isTranslated ? "Show original" : `Translate to ${targetLanguage.toUpperCase()}`}
      >
        {isLoading ? (
          <FaSpinner className="animate-spin" />
        ) : (
          <FaLanguage />
        )}
        <span className="text-sm">
          {isTranslated ? 'Show Original' : 'Translate'}
        </span>
      </button>
      
      {isTranslated && translatedText && (
        <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Translation ({targetLanguage.toUpperCase()}):</div>
          <div className="text-sm" dir={targetLanguage === 'ur' ? 'rtl' : 'ltr'}>
            {translatedText}
          </div>
        </div>
      )}
    </div>
  );
};
