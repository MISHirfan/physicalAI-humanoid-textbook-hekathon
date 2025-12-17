import React, { useState, useEffect } from 'react';
import { TranslationProvider, useTranslation } from '../components/TranslationProvider';
import { TranslateButton } from '../components/TranslateButton';
import { LanguageSelector } from '../components/LanguageSelector';
import { RealTimeTranslate } from '../components/RealTimeTranslate';
import { FaExchangeAlt, FaHistory, FaCog, FaLanguage, FaMagic, FaGlobe, FaCopy, FaVolumeUp, FaTimes } from 'react-icons/fa';

const TranslatePageContent: React.FC = () => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('ur');
  const [domain, setDomain] = useState('general');
  const [context, setContext] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [translationHistory, setTranslationHistory] = useState<Array<{
    original: string;
    translated: string;
    sourceLang: string;
    targetLang: string;
    timestamp: Date;
  }>>([]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { 
    translateText, 
    translateTechnical, 
    translateWithContext, 
    getCacheStats,
    clearCache,
    isLoading 
  } = useTranslation();

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    let result;
    if (context.trim()) {
      result = await translateWithContext(sourceText, targetLanguage, context);
    } else if (domain !== 'general') {
      result = await translateTechnical(sourceText, targetLanguage, domain);
    } else {
      result = await translateText(sourceText, targetLanguage, sourceLanguage);
    }

    if (result.success && result.translation) {
      setTranslatedText(result.translation);
      
      // Add to history
      setTranslationHistory(prev => [{
        original: sourceText,
        translated: result.translation,
        sourceLang: sourceLanguage,
        targetLang: targetLanguage,
        timestamp: new Date()
      }, ...prev.slice(0, 9)]); // Keep last 10 translations
    }
  };

  const handleSwapLanguages = () => {
    const temp = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(temp);
    
    // Swap text content
    if (translatedText) {
      setSourceText(translatedText);
      setTranslatedText(sourceText);
    }
  };

  const handleClear = () => {
    setSourceText('');
    setTranslatedText('');
    setContext('');
  };

  const domains = [
    { value: 'general', label: 'General' },
    { value: 'robotics', label: 'Robotics' },
    { value: 'ai', label: 'AI/Machine Learning' },
    { value: 'programming', label: 'Programming' }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 ${isMobile ? 'px-2' : 'px-4'}`}>
      <div className={`max-w-7xl mx-auto ${isMobile ? 'px-2' : 'px-4'}`}>
        <div className={`text-center mb-12 ${isMobile ? 'px-4' : ''}`}>
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg">
              <FaLanguage className="text-white text-3xl" />
            </div>
          </div>
          <h1 className={`font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4 ${isMobile ? 'text-3xl' : 'text-5xl'}`}>
            Universal Translator
          </h1>
          <p className={`text-gray-600 max-w-2xl mx-auto leading-relaxed ${isMobile ? 'text-base' : 'text-lg'}`}>
            Break language barriers with AI-powered translation. Support for 10+ languages including Urdu, Hindi, Arabic, and more.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FaMagic className="text-blue-500" />
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FaGlobe className="text-purple-500" />
              <span>10+ Languages</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FaHistory className="text-green-500" />
              <span>Smart Cache</span>
            </div>
          </div>
        </div>

        <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-3'}`}>
          {/* Main Translation Interface */}
          <div className={`${isMobile ? 'col-span-1' : 'col-span-2'} space-y-6`}>
            {/* Language Selection */}
            <div className={`bg-white rounded-2xl shadow-xl p-6 ${isMobile ? 'p-4' : ''} border border-gray-100 hover:shadow-2xl transition-shadow duration-300`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                  <LanguageSelector
                    selectedLanguage={sourceLanguage}
                    onLanguageChange={setSourceLanguage}
                    className="w-full"
                  />
                </div>
                
                <button
                  onClick={handleSwapLanguages}
                  className="mx-4 p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-110 shadow-lg"
                  title="Swap languages"
                >
                  <FaExchangeAlt className="text-lg" />
                </button>
                
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                  <LanguageSelector
                    selectedLanguage={targetLanguage}
                    onLanguageChange={setTargetLanguage}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Source Text */}
            <div className={`bg-white rounded-2xl shadow-xl p-6 ${isMobile ? 'p-4' : ''} border border-gray-100 hover:shadow-2xl transition-shadow duration-300`}>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-700">
                  <span className="flex items-center gap-2">
                    <FaLanguage className="text-blue-500" />
                    Source Text ({sourceLanguage.toUpperCase()})
                  </span>
                </label>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {sourceText.length} characters
                </span>
              </div>
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Enter text to translate..."
                className="w-full p-4 border-2 border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
                rows={6}
              />
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={handleClear}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center gap-2"
                >
                  <FaTimes className="text-sm" />
                  Clear
                </button>
                <div className="text-xs text-gray-500">
                  Press Ctrl+Enter to translate
                </div>
              </div>
            </div>

            {/* Translation Controls */}
            <div className={`bg-white rounded-2xl shadow-xl p-6 ${isMobile ? 'p-4' : ''} border border-gray-100 hover:shadow-2xl transition-shadow duration-300`}>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  showAdvanced 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaCog className="text-sm" />
                <span className="font-medium">Advanced Options</span>
              </button>
              
              {showAdvanced && (
                <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="flex items-center gap-2">
                        <FaMagic className="text-purple-500" />
                        Domain
                      </span>
                    </label>
                    <select
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      {domains.map(d => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="flex items-center gap-2">
                        <FaGlobe className="text-green-500" />
                        Context (optional)
                      </span>
                    </label>
                    <textarea
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="Provide context for better translation accuracy..."
                      className="w-full p-3 border-2 border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      rows={3}
                    />
                  </div>
                </div>
              )}
              
              <button
                onClick={handleTranslate}
                disabled={isLoading || !sourceText.trim()}
                className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] shadow-lg font-semibold text-lg flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Translating...
                  </>
                ) : (
                  <>
                    <FaMagic />
                    Translate
                  </>
                )}
              </button>
            </div>

            {/* Translated Text */}
            {translatedText && (
              <div className={`bg-white rounded-2xl shadow-xl p-6 ${isMobile ? 'p-4' : ''} border border-gray-100 hover:shadow-2xl transition-shadow duration-300`}>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    <span className="flex items-center gap-2">
                      <FaLanguage className="text-purple-500" />
                      Translation ({targetLanguage.toUpperCase()})
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigator.clipboard.writeText(translatedText)}
                      className="p-2 text-gray-500 hover:text-blue-500 transition-colors duration-200"
                      title="Copy translation"
                    >
                      <FaCopy />
                    </button>
                    <button
                      onClick={() => {
                        if ('speechSynthesis' in window) {
                          const utterance = new SpeechSynthesisUtterance(translatedText);
                          utterance.lang = targetLanguage === 'ur' ? 'ur-IN' : targetLanguage;
                          speechSynthesis.speak(utterance);
                        }
                      }}
                      className="p-2 text-gray-500 hover:text-blue-500 transition-colors duration-200"
                      title="Speak translation"
                    >
                      <FaVolumeUp />
                    </button>
                  </div>
                </div>
                <div 
                  className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl text-sm border border-gray-200"
                  dir={targetLanguage === 'ur' ? 'rtl' : 'ltr'}
                >
                  <p className="text-gray-800 leading-relaxed">{translatedText}</p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <TranslateButton
                    text={sourceText}
                    targetLanguage={targetLanguage}
                    className="text-xs"
                  >
                    Quick Translate
                  </TranslateButton>
                  <span className="text-xs text-gray-500">
                    Click icons to copy or speak
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Real-time Translation */}
            <div className={`bg-white rounded-2xl shadow-xl p-6 ${isMobile ? 'p-4' : ''} border border-gray-100 hover:shadow-2xl transition-shadow duration-300`}>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-full">
                  <FaMagic className="text-white text-sm" />
                </div>
                <h3 className="font-semibold text-gray-800">Real-time Translation</h3>
              </div>
              <RealTimeTranslate
                targetLanguage={targetLanguage}
                isMobile={isMobile}
                onTranslationUpdate={(original, translated) => {
                  console.log('Real-time translation:', { original, translated });
                }}
              />
            </div>

            {/* Translation History */}
            {translationHistory.length > 0 && (
              <div className={`bg-white rounded-2xl shadow-xl p-6 ${isMobile ? 'p-4' : ''} border border-gray-100 hover:shadow-2xl transition-shadow duration-300`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-full">
                      <FaHistory className="text-white text-sm" />
                    </div>
                    <h3 className="font-semibold text-gray-800">Recent Translations</h3>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {translationHistory.length} items
                  </span>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {translationHistory.map((item, index) => (
                    <div key={index} className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded-full border border-gray-200">
                          {item.sourceLang.toUpperCase()} → {item.targetLang.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-400">
                          {item.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="font-medium text-gray-800 text-sm mb-1 truncate">
                        {item.original}
                      </div>
                      <div className="text-gray-600 text-sm truncate" dir={item.targetLang === 'ur' ? 'rtl' : 'ltr'}>
                        {item.translated}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TranslatePage: React.FC = () => {
  return (
    <TranslationProvider>
      <TranslatePageContent />
    </TranslationProvider>
  );
};

export default TranslatePage;
