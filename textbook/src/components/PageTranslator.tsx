import React, { useState, useEffect } from 'react';
import { useTranslation } from './TranslationProvider';
import { FaLanguage, FaTimes, FaSpinner, FaCheck } from 'react-icons/fa';

interface PageTranslatorProps {
  className?: string;
  onTranslationComplete?: (translatedContent: string) => void;
}

export const PageTranslator: React.FC<PageTranslatorProps> = ({ 
  className = '',
  onTranslationComplete 
}) => {
  const { translateText, isLoading } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('ur');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');

  useEffect(() => {
    // Extract page content when component mounts
    const extractPageContent = () => {
      const mainContent = document.querySelector('main') || 
                          document.querySelector('.markdown') || 
                          document.querySelector('article') ||
                          document.body;
      
      if (mainContent) {
        const textContent = mainContent.innerText || mainContent.textContent || '';
        setOriginalContent(textContent);
      }
    };

    extractPageContent();
  }, []);

  const handleTranslatePage = async () => {
    if (!originalContent.trim()) return;

    setIsTranslating(true);
    setTranslatedContent('');

    try {
      // Split content into manageable chunks (paragraphs)
      const paragraphs = originalContent.split('\n\n').filter(p => p.trim().length > 0);
      const translatedParagraphs: string[] = [];

      for (const paragraph of paragraphs) {
        if (paragraph.trim().length > 0) {
          const result = await translateText(paragraph.trim(), targetLanguage, 'en');
          if (result.success && result.translation) {
            translatedParagraphs.push(result.translation);
          } else {
            translatedParagraphs.push(paragraph); // Fallback to original
          }
        }
      }

      const fullTranslation = translatedParagraphs.join('\n\n');
      setTranslatedContent(fullTranslation);
      
      if (onTranslationComplete) {
        onTranslationComplete(fullTranslation);
      }
    } catch (error) {
      console.error('Page translation failed:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTranslatedContent('');
  };

  const handleReplacePage = () => {
    if (translatedContent) {
      const mainContent = document.querySelector('main') || 
                          document.querySelector('.markdown') || 
                          document.querySelector('article');
      
      if (mainContent) {
        mainContent.innerHTML = `<div class="translated-content" style="direction: ${targetLanguage === 'ur' ? 'rtl' : 'ltr'}; text-align: ${targetLanguage === 'ur' ? 'right' : 'left'};">${translatedContent.replace(/\n\n/g, '</p><p>').replace(/^/, '<p>').replace(/$/, '</p>')}</div>`;
      }
      handleClose();
    }
  };

  const languages = [
    { code: 'ur', name: 'Urdu', dir: 'rtl' },
    { code: 'hi', name: 'Hindi', dir: 'ltr' },
    { code: 'ar', name: 'Arabic', dir: 'rtl' },
    { code: 'bn', name: 'Bengali', dir: 'ltr' },
    { code: 'ta', name: 'Tamil', dir: 'ltr' },
    { code: 'te', name: 'Telugu', dir: 'ltr' },
    { code: 'mr', name: 'Marathi', dir: 'ltr' },
    { code: 'gu', name: 'Gujarati', dir: 'ltr' },
    { code: 'pa', name: 'Punjabi', dir: 'ltr' },
  ];

  return (
    <div className={`page-translator ${className}`}>
      {/* Translate Page Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 z-50"
        title="Translate this page"
      >
        <FaLanguage className="text-lg" />
        <span className="font-medium">Translate Page</span>
      </button>

      {/* Translation Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                  <FaLanguage className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Page Translator</h3>
                  <p className="text-sm text-gray-600">Translate the entire page content</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
                title="Close"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Language Selection */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Target Language
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setTargetLanguage(lang.code)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        targetLanguage === lang.code
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="font-medium">{lang.name}</div>
                      <div className="text-xs text-gray-500">{lang.code.toUpperCase()}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleTranslatePage}
                  disabled={isTranslating || !originalContent.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 font-semibold"
                >
                  {isTranslating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Translating Page...
                    </>
                  ) : (
                    <>
                      <FaLanguage />
                      Translate Page
                    </>
                  )}
                </button>
                <button
                  onClick={handleClose}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>

              {/* Translation Result */}
              {translatedContent && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      <FaCheck className="text-green-500" />
                      Translation Complete
                    </h4>
                    <button
                      onClick={handleReplacePage}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold flex items-center gap-2"
                    >
                      <FaCheck />
                      Replace Page Content
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <div 
                      className="text-gray-800 leading-relaxed"
                      dir={targetLanguage === 'ur' ? 'rtl' : 'ltr'}
                      style={{ textAlign: targetLanguage === 'ur' ? 'right' : 'left' }}
                    >
                      {translatedContent}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Click "Replace Page Content" to translate the current page
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
