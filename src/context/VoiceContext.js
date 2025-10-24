import React, { createContext, useState, useContext, useEffect } from 'react';
import { speak, listen, stopListening, stopSpeaking, checkVoiceSupport } from '../services/voiceService';

const VoiceContext = createContext();

export const VoiceProvider = ({ children }) => {
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentRecognition, setCurrentRecognition] = useState(null);
  const [voiceSupport, setVoiceSupport] = useState({ tts: false, stt: false });
  const [voiceLanguage, setVoiceLanguage] = useState('en');
  const [showLanguagePrompt, setShowLanguagePrompt] = useState(false);

  useEffect(() => {
    // Check browser support
    const support = checkVoiceSupport();
    setVoiceSupport(support);

    // Load voice preference from localStorage
    const savedPreference = localStorage.getItem('voiceEnabled');
    const savedLanguage = localStorage.getItem('voiceLanguage');
    
    console.log('🚀 Voice Context Init:', { savedPreference, savedLanguage, support });
    
    if (savedPreference && support.tts && support.stt) {
      setVoiceEnabled(JSON.parse(savedPreference));
    }
    
    if (savedLanguage) {
      setVoiceLanguage(savedLanguage);
    }

    // Load voices (needed for some browsers)
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // Debug: Log when showLanguagePrompt changes
  useEffect(() => {
    console.log('🎭 Language Prompt State Changed:', showLanguagePrompt);
  }, [showLanguagePrompt]);

  const toggleVoice = (skipLanguagePrompt = false) => {
    const newState = !voiceEnabled;
    console.log('🎤 Toggle Voice:', { newState, voiceEnabled, skipLanguagePrompt });
    
    setVoiceEnabled(newState);
    localStorage.setItem('voiceEnabled', JSON.stringify(newState));
    
    if (newState) {
      // Check if language is already set
      const savedLanguage = localStorage.getItem('voiceLanguage');
      console.log('🔍 Saved Language:', savedLanguage);
      
      if (!savedLanguage && !skipLanguagePrompt) {
        // Show language selection prompt
        console.log('✅ Showing language selection modal');
        setShowLanguagePrompt(true);
      } else {
        // Use saved language or default
        const lang = savedLanguage || 'en';
        console.log('🗣️ Using language:', lang);
        setVoiceLanguage(lang);
        const welcomeMsg = {
          en: "Voice assistant enabled",
          kn: "ಧ್ವನಿ ಸಹಾಯಕ ಸಕ್ರಿಯಗೊಂಡಿದೆ",
          hi: "आवाज सहायक सक्षम"
        };
        speak(welcomeMsg[lang] || welcomeMsg.en, lang);
      }
    } else {
      console.log('🔇 Disabling voice assistant');
      stopSpeaking();
      if (currentRecognition) {
        stopListening(currentRecognition);
        setCurrentRecognition(null);
      }
      setIsListening(false);
      setShowLanguagePrompt(false);
    }
  };

  const selectVoiceLanguage = (lang) => {
    console.log('🌍 Language Selected:', lang);
    setVoiceLanguage(lang);
    localStorage.setItem('voiceLanguage', lang);
    setShowLanguagePrompt(false);
    
    const welcomeMsg = {
      en: "Voice assistant enabled. Welcome to BusFlow. You can now use voice commands to navigate the app.",
      kn: "ಧ್ವನಿ ಸಹಾಯಕ ಸಕ್ರಿಯಗೊಂಡಿದೆ. BusFlow ಗೆ ಸ್ವಾಗತ. ಈಗ ನೀವು ಆಪ್ ಅನ್ನು ನ್ಯಾವಿಗೇಟ್ ಮಾಡಲು ಧ್ವನಿ ಆದೇಶಗಳನ್ನು ಬಳಸಬಹುದು.",
      hi: "आवाज सहायक सक्षम। BusFlow में आपका स्वागत है। अब आप ऐप को नेविगेट करने के लिए वॉयस कमांड का उपयोग कर सकते हैं।"
    };
    console.log('🔊 Speaking welcome message in', lang);
    speak(welcomeMsg[lang] || welcomeMsg.en, lang);
  };

  const speakText = (text, language) => {
    if (voiceEnabled && text) {
      setIsSpeaking(true);
      const lang = language || voiceLanguage;
      speak(text, lang);
      
      // Estimate speaking duration (rough calculation)
      const duration = Math.max(2000, text.length * 50);
      setTimeout(() => setIsSpeaking(false), duration);
    }
  };

  const startListening = (language, callbacks = {}) => {
    if (!voiceEnabled) {
      console.log('Voice not enabled');
      return null;
    }

    if (isListening) {
      console.log('Already listening');
      return currentRecognition;
    }

    setIsListening(true);
    const lang = language || voiceLanguage;
    
    const recognition = listen(lang, {
      onStart: () => {
        setIsListening(true);
        callbacks.onStart?.();
      },
      onResult: (transcript, confidence) => {
        callbacks.onResult?.(transcript, confidence);
      },
      onError: (error) => {
        setIsListening(false);
        setCurrentRecognition(null);
        callbacks.onError?.(error);
      },
      onEnd: () => {
        setIsListening(false);
        setCurrentRecognition(null);
        callbacks.onEnd?.();
      }
    });

    setCurrentRecognition(recognition);
    return recognition;
  };

  const stopCurrentListening = () => {
    if (currentRecognition) {
      stopListening(currentRecognition);
      setIsListening(false);
      setCurrentRecognition(null);
    }
  };

  const stopCurrentSpeaking = () => {
    stopSpeaking();
    setIsSpeaking(false);
  };

  return (
    <VoiceContext.Provider value={{
      voiceEnabled,
      voiceSupport,
      voiceLanguage,
      showLanguagePrompt,
      toggleVoice,
      selectVoiceLanguage,
      isListening,
      isSpeaking,
      speakText,
      startListening,
      stopCurrentListening,
      stopCurrentSpeaking
    }}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within VoiceProvider');
  }
  return context;
};
