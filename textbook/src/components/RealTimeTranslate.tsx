import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from './TranslationProvider';
import { FaLanguage, FaSpinner, FaCopy, FaVolumeUp } from 'react-icons/fa';

interface RealTimeTranslateProps {
  onTranslationUpdate?: (original: string, translated: string) => void;
  placeholder?: string;
  targetLanguage?: string;
  className?: string;
  isMobile?: boolean;
}

export const RealTimeTranslate: React.FC<RealTimeTranslateProps> = ({
  onTranslationUpdate,
  placeholder = "Start typing to translate...",
  targetLanguage = 'ur',
  className = '',
  isMobile = false
}) => {
  const { translateText, isLoading } = useTranslation();
  const [originalText, setOriginalText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);
  const translationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Real-time translation with debounce
  useEffect(() => {
    if (translationTimeoutRef.current) {
      clearTimeout(translationTimeoutRef.current);
    }

    if (originalText.trim() && showTranslation) {
      setIsTranslating(true);
      
      translationTimeoutRef.current = setTimeout(async () => {
        const result = await translateText(originalText, targetLanguage);
        if (result.success && result.translation) {
          setTranslatedText(result.translation);
          onTranslationUpdate?.(originalText, result.translation);
        }
        setIsTranslating(false);
      }, 800); // 800ms debounce
    } else {
      setTranslatedText('');
      setIsTranslating(false);
    }

    return () => {
      if (translationTimeoutRef.current) {
        clearTimeout(translationTimeoutRef.current);
      }
    };
  }, [originalText, targetLanguage, showTranslation, translateText, onTranslationUpdate]);

  const handleCopyTranslation = () => {
    navigator.clipboard.writeText(translatedText);
  };

  const handleSpeakTranslation = () => {
    if ('speechSynthesis' in window && translatedText) {
      const utterance = new SpeechSynthesisUtterance(translatedText);
      utterance.lang = targetLanguage === 'ur' ? 'ur-IN' : targetLanguage;
      speechSynthesis.speak(utterance);
    }
  };

  const handleClear = () => {
    setOriginalText('');
    setTranslatedText('');
  };

  return (
    <div className={`real-time-translate ${className}`}>
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${isMobile ? 'mx-2' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FaLanguage className="text-blue-500" />
            <span className="font-medium text-sm">Real-time Translation</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className={`px-2 py-1 text-xs rounded ${
                showTranslation 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {showTranslation ? 'Translation ON' : 'Translation OFF'}
            </button>
          </div>
        </div>

        {/* Input Section */}
        <div className="p-3">
          <textarea
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            placeholder={placeholder}
            className={`w-full p-2 border border-gray-300 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isMobile ? 'text-base' : 'text-sm'}`}
            rows={isMobile ? 6 : 4}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              {originalText.length} characters
            </span>
            <button
              onClick={handleClear}
              className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Translation Section */}
        {showTranslation && (originalText.trim() || translatedText) && (
          <div className={`border-t border-gray-200 p-3 ${isMobile ? 'p-2' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Translation ({targetLanguage.toUpperCase()})
              </span>
              {translatedText && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyTranslation}
                    className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
                    title="Copy translation"
                  >
                    <FaCopy className="text-xs" />
                  </button>
                  <button
                    onClick={handleSpeakTranslation}
                    className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
                    title="Speak translation"
                  >
                    <FaVolumeUp className="text-xs" />
                  </button>
                </div>
              )}
            </div>
            
            {isTranslating ? (
              <div className="flex items-center gap-2 text-gray-500">
                <FaSpinner className="animate-spin" />
                <span className="text-sm">Translating...</span>
              </div>
            ) : translatedText ? (
              <div 
                className={`p-2 bg-gray-50 rounded text-sm ${isMobile ? 'text-base' : ''}`}
                dir={targetLanguage === 'ur' ? 'rtl' : 'ltr'}
              >
                {translatedText}
              </div>
            ) : originalText.trim() ? (
              <div className="text-sm text-gray-500 italic">
                Translation will appear here...
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
