// Voice Service - Text-to-Speech and Speech-to-Text
// Uses Web Speech API (built into modern browsers)

/**
 * Text-to-Speech - Makes the app speak
 * @param {string} text - Text to speak
 * @param {string} language - Language code ('en', 'kn', 'hi')
 */
export const speak = (text, language = 'en') => {
  if (!('speechSynthesis' in window)) {
    console.error('Speech synthesis not supported in this browser');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Language mapping
  const langMap = {
    en: 'en-US',
    kn: 'kn-IN',
    hi: 'hi-IN'
  };
  
  utterance.lang = langMap[language] || 'en-US';
  utterance.rate = 0.9; // Slightly slower for clarity
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  // Speak
  window.speechSynthesis.speak(utterance);
  
  console.log(`🔊 Speaking (${language}):`, text);
};

/**
 * Speech-to-Text - Listens to user's voice
 * @param {string} language - Language code ('en', 'kn', 'hi')
 * @param {object} callbacks - { onResult, onError, onEnd }
 * @returns {object} recognition instance
 */
export const listen = (language = 'en', callbacks = {}) => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.error('Speech recognition not supported in this browser');
    callbacks.onError?.('Speech recognition not supported');
    return null;
  }

  const recognition = new SpeechRecognition();

  // Language mapping
  const langMap = {
    en: 'en-US',
    kn: 'kn-IN',
    hi: 'hi-IN'
  };

  recognition.lang = langMap[language] || 'en-US';
  recognition.continuous = false; // Stop after one result
  recognition.interimResults = false; // Only final results
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    console.log('🎤 Listening started...');
    callbacks.onStart?.();
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const confidence = event.results[0][0].confidence;
    console.log(`🎤 Recognized (${language}):`, transcript, `(${(confidence * 100).toFixed(0)}% confidence)`);
    callbacks.onResult?.(transcript, confidence);
  };

  recognition.onerror = (event) => {
    console.error('🎤 Speech recognition error:', event.error);
    callbacks.onError?.(event.error);
  };

  recognition.onend = () => {
    console.log('🎤 Listening ended');
    callbacks.onEnd?.();
  };

  try {
    recognition.start();
    return recognition;
  } catch (error) {
    console.error('Failed to start recognition:', error);
    callbacks.onError?.(error.message);
    return null;
  }
};

/**
 * Stop listening
 * @param {object} recognition - Recognition instance to stop
 */
export const stopListening = (recognition) => {
  if (recognition) {
    try {
      recognition.stop();
      console.log('🎤 Stopped listening');
    } catch (error) {
      console.error('Error stopping recognition:', error);
    }
  }
};

/**
 * Stop speaking
 */
export const stopSpeaking = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    console.log('🔇 Stopped speaking');
  }
};

/**
 * Check if voice features are supported
 * @returns {object} Support status for TTS and STT
 */
export const checkVoiceSupport = () => {
  const support = {
    tts: 'speechSynthesis' in window,
    stt: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
  };
  
  console.log('Voice Support:', support);
  return support;
};

/**
 * Get available voices for TTS
 * @returns {array} Available voices
 */
export const getAvailableVoices = () => {
  if ('speechSynthesis' in window) {
    return window.speechSynthesis.getVoices();
  }
  return [];
};
