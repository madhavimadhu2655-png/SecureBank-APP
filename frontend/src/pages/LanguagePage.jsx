import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

export default function LanguagePage() {
  const navigate = useNavigate();
  const { lang, changeLang, LANGUAGES, t } = useLanguage();

  const handleChange = (code) => {
    changeLang(code);
    const langName = LANGUAGES.find(l => l.code === code)?.name;
    toast.success(`Language changed to ${langName}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 max-w-md mx-auto pb-20">
      <div className="bg-white dark:bg-gray-900 px-4 pt-12 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">←</button>
          <h1 className="font-bold text-gray-900 dark:text-white text-lg">Language / भाषा</h1>
        </div>
      </div>

      <div className="p-4">
        <p className="text-xs text-gray-500 mb-4">Choose your preferred language for the app</p>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden">
          {LANGUAGES.map(l => (
            <button key={l.code} onClick={() => handleChange(l.code)}
              className="w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition text-left">
              <span className="text-2xl">{l.flag}</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">{l.name}</p>
                <p className="text-sm text-gray-500">{l.native}</p>
              </div>
              {lang === l.code && (
                <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs">✓</div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
