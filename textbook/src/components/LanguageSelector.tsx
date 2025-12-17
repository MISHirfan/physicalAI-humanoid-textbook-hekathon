import React, { useState, useEffect } from 'react';
import { useTranslation } from './TranslationProvider';
import { FaGlobe, FaChevronDown } from 'react-icons/fa';

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
  className = ''
}) => {
  const [supportedLanguages, setSupportedLanguages] = useState<Record<string, string>>({});
  const [isOpen, setIsOpen] = useState(false);
  const { getSupportedLanguages } = useTranslation();

  useEffect(() => {
    const fetchLanguages = async () => {
      const languages = await getSupportedLanguages();
      setSupportedLanguages(languages);
    };
    fetchLanguages();
  }, [getSupportedLanguages]);

  const handleLanguageSelect = (langCode: string) => {
    onLanguageChange(langCode);
    setIsOpen(false);
  };

  return (
    <div className={`language-selector relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
      >
        <FaGlobe className="text-blue-500" />
        <span className="text-sm font-medium">
          {supportedLanguages[selectedLanguage] || selectedLanguage}
        </span>
        <FaChevronDown className={`text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded shadow-lg z-50">
          <div className="max-h-64 overflow-y-auto">
            {Object.entries(supportedLanguages).map(([code, name]) => (
              <button
                key={code}
                onClick={() => handleLanguageSelect(code)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors ${
                  selectedLanguage === code ? 'bg-blue-100 text-blue-700 font-medium' : ''
                }`}
              >
                {name}
                <span className="block text-xs text-gray-500">{code.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
