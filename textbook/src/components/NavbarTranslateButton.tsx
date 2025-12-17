import React, { useState } from 'react';
import { useTranslation } from './TranslationProvider';
import { FaLanguage, FaTimes, FaSpinner } from 'react-icons/fa';

export default function NavbarTranslateButton() {
  const { translateText, isLoading } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('ur');

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    const result = await translateText(inputText, targetLanguage);
    if (result.success && result.translation) {
      setTranslatedText(result.translation);
    }
  };

  const handleClear = () => {
    setInputText('');
    setTranslatedText('');
  };

  const handleClose = () => {
    setIsOpen(false);
    handleClear();
  };

  return (
    <>
      {/* Translate Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
        title="Quick Translate"
      >
        <FaLanguage className="text-blue-500" />
        <span className="hidden sm:inline">Translate</span>
      </button>

      {/* Translation Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <FaLanguage className="text-blue-500" />
                <h3 className="font-semibold text-gray-800">Quick Translate</h3>
              </div>
              <button
                onClick={handleClose}
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                title="Close"
              >
                <FaTimes />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Language Selection */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">To:</span>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ur">Urdu</option>
                  <option value="hi">Hindi</option>
                  <option value="ar">Arabic</option>
                  <option value="bn">Bengali</option>
                  <option value="ta">Tamil</option>
                  <option value="te">Telugu</option>
                </select>
              </div>

              {/* Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text to translate
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter text to translate..."
                  className="w-full p-2 border border-gray-300 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTranslate}
                  disabled={isLoading || !inputText.trim()}
                  className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin inline mr-2" />
                      Translating...
                    </>
                  ) : (
                    'Translate'
                  )}
                </button>
                <button
                  onClick={handleClear}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
                >
                  Clear
                </button>
              </div>

              {/* Translation Result */}
              {translatedText && (
                <div className="border-t border-gray-200 pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Translation ({targetLanguage.toUpperCase()})
                  </label>
                  <div 
                    className="p-3 bg-gray-50 rounded text-sm"
                    dir={targetLanguage === 'ur' ? 'rtl' : 'ltr'}
                  >
                    {translatedText}
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(translatedText)}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Copy translation
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
