// src/context/LanguageContext.jsx
import React, { createContext, useContext, useState } from 'react';

const LANGUAGES = [
  { code: 'en', name: 'English',    native: 'English',    flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi',      native: 'हिंदी',       flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil',      native: 'தமிழ்',       flag: '🇮🇳' },
  { code: 'te', name: 'Telugu',     native: 'తెలుగు',      flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada',    native: 'ಕನ್ನಡ',       flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali',    native: 'বাংলা',       flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi',    native: 'मराठी',       flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati',   native: 'ગુજરાતી',     flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi',    native: 'ਪੰਜਾਬੀ',      flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam',  native: 'മലയാളം',      flag: '🇮🇳' },
];

// Translations (key phrases)
const TRANSLATIONS = {
  en: { home: 'Home', send: 'Send Money', receive: 'Receive', history: 'History', balance: 'Balance', scan: 'Scan & Pay', bills: 'Pay Bills', welcome: 'Welcome', logout: 'Sign Out' },
  hi: { home: 'होम', send: 'पैसे भेजें', receive: 'प्राप्त करें', history: 'इतिहास', balance: 'बैलेंस', scan: 'स्कैन करें', bills: 'बिल भरें', welcome: 'स्वागत है', logout: 'साइन आउट' },
  ta: { home: 'முகப்பு', send: 'பணம் அனுப்பு', receive: 'பெறு', history: 'வரலாறு', balance: 'இருப்பு', scan: 'ஸ்கேன் செய்', bills: 'பில் செலுத்து', welcome: 'வரவேற்கிறோம்', logout: 'வெளியேறு' },
  te: { home: 'హోమ్', send: 'డబ్బు పంపు', receive: 'స్వీకరించు', history: 'చరిత్ర', balance: 'బ్యాలెన్స్', scan: 'స్కాన్ చేయి', bills: 'బిల్లు చెల్లించు', welcome: 'స్వాగతం', logout: 'సైన్ అవుట్' },
  kn: { home: 'ಮನೆ', send: 'ಹಣ ಕಳುಹಿಸು', receive: 'ಸ್ವೀಕರಿಸು', history: 'ಇತಿಹಾಸ', balance: 'ಬ್ಯಾಲೆನ್ಸ್', scan: 'ಸ್ಕ್ಯಾನ್ ಮಾಡು', bills: 'ಬಿಲ್ ಪಾವತಿ', welcome: 'ಸ್ವಾಗತ', logout: 'ಸೈನ್ ಔಟ್' },
  bn: { home: 'হোম', send: 'টাকা পাঠান', receive: 'গ্রহণ করুন', history: 'ইতিহাস', balance: 'ব্যালেন্স', scan: 'স্ক্যান করুন', bills: 'বিল দিন', welcome: 'স্বাগতম', logout: 'সাইন আউট' },
  mr: { home: 'मुख्यपृष्ठ', send: 'पैसे पाठवा', receive: 'प्राप्त करा', history: 'इतिहास', balance: 'शिल्लक', scan: 'स्कॅन करा', bills: 'बिल भरा', welcome: 'स्वागत', logout: 'साइन आउट' },
  gu: { home: 'હોમ', send: 'પૈસા મોકલો', receive: 'પ્રાપ્ત કરો', history: 'ઇતિહાસ', balance: 'બેલેન્સ', scan: 'સ્કૅન કરો', bills: 'બિલ ભરો', welcome: 'સ્વાગત', logout: 'સાઇન આઉટ' },
  pa: { home: 'ਹੋਮ', send: 'ਪੈਸੇ ਭੇਜੋ', receive: 'ਪ੍ਰਾਪਤ ਕਰੋ', history: 'ਇਤਿਹਾਸ', balance: 'ਬੈਲੈਂਸ', scan: 'ਸਕੈਨ ਕਰੋ', bills: 'ਬਿੱਲ ਦਿਓ', welcome: 'ਜੀ ਆਇਆਂ', logout: 'ਸਾਈਨ ਆਊਟ' },
  ml: { home: 'ഹോം', send: 'പണം അയക്കുക', receive: 'സ്വീകരിക്കുക', history: 'ചരിത്രം', balance: 'ബാലൻസ്', scan: 'സ്കാൻ ചെയ്യുക', bills: 'ബിൽ അടക്കുക', welcome: 'സ്വാഗതം', logout: 'സൈൻ ഔട്ട്' },
};

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'en');
  const t = (key) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;
  const changeLang = (code) => { setLang(code); localStorage.setItem('app_lang', code); };
  return (
    <LanguageContext.Provider value={{ lang, changeLang, t, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
export { LANGUAGES, TRANSLATIONS };
