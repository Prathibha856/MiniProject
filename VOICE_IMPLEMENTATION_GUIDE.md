# 💻 Voice Assistant - Implementation Guide

## 📁 Project Structure

```
f:\MiniProject\src\
├── components/
│   ├── VoiceAssistant/
│   │   ├── VoiceAssistant.js
│   │   ├── VoiceButton.js
│   │   └── VoiceButton.css
│   └── ... (existing components)
│
├── services/
│   └── voiceService.js
│
├── context/
│   └── VoiceContext.js
│
└── locales/
    ├── voice-en.json
    ├── voice-kn.json
    └── voice-hi.json
```

---

## 🔧 Step 1: Voice Service

Create `src/services/voiceService.js`:

```javascript
// Text-to-Speech
export const speak = (text, language = 'en-US') => {
  if (!('speechSynthesis' in window)) {
    console.error('Speech synthesis not supported');
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  
  const langMap = { en: 'en-US', kn: 'kn-IN', hi: 'hi-IN' };
  utterance.lang = langMap[language] || 'en-US';
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  window.speechSynthesis.speak(utterance);
};

// Speech-to-Text
export const listen = (language = 'en', callbacks = {}) => {
  if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
    console.error('Speech recognition not supported');
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  const langMap = { en: 'en-US', kn: 'kn-IN', hi: 'hi-IN' };
  recognition.lang = langMap[language] || 'en-US';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    callbacks.onResult?.(transcript);
  };

  recognition.onerror = (event) => callbacks.onError?.(event.error);
  recognition.onend = () => callbacks.onEnd?.();

  recognition.start();
  return recognition;
};

export const stopListening = (recognition) => recognition?.stop();
export const stopSpeaking = () => window.speechSynthesis?.cancel();
```

---

## 🎯 Step 2: Voice Context

Create `src/context/VoiceContext.js`:

```javascript
import React, { createContext, useState, useContext, useEffect } from 'react';
import { speak, listen, stopListening, stopSpeaking } from '../services/voiceService';

const VoiceContext = createContext();

export const VoiceProvider = ({ children }) => {
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentRecognition, setCurrentRecognition] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('voiceEnabled');
    if (saved) setVoiceEnabled(JSON.parse(saved));
  }, []);

  const toggleVoice = () => {
    const newState = !voiceEnabled;
    setVoiceEnabled(newState);
    localStorage.setItem('voiceEnabled', JSON.stringify(newState));
    
    if (newState) {
      speak("Voice assistant enabled", 'en');
    } else {
      stopSpeaking();
      if (currentRecognition) stopListening(currentRecognition);
    }
  };

  const speakText = (text, language) => {
    if (voiceEnabled) speak(text, language);
  };

  const startListening = (language, callbacks) => {
    if (voiceEnabled) {
      setIsListening(true);
      const recognition = listen(language, {
        ...callbacks,
        onEnd: () => {
          setIsListening(false);
          callbacks.onEnd?.();
        }
      });
      setCurrentRecognition(recognition);
      return recognition;
    }
  };

  return (
    <VoiceContext.Provider value={{
      voiceEnabled,
      toggleVoice,
      isListening,
      speakText,
      startListening
    }}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => useContext(VoiceContext);
```

---

## 🔘 Step 3: Floating Voice Button

Create `src/components/VoiceAssistant/VoiceButton.js`:

```javascript
import React from 'react';
import { useVoice } from '../../context/VoiceContext';
import './VoiceButton.css';

const VoiceButton = ({ onCommand }) => {
  const { voiceEnabled, isListening, startListening } = useVoice();
  const { language } = useApp();

  if (!voiceEnabled) return null;

  const handleClick = () => {
    startListening(language, {
      onResult: (text) => {
        console.log('Voice input:', text);
        onCommand?.(text);
      },
      onError: (error) => console.error('Voice error:', error)
    });
  };

  return (
    <button 
      className={`floating-voice-btn ${isListening ? 'listening' : ''}`}
      onClick={handleClick}
      aria-label="Voice command"
    >
      <i className="fas fa-microphone"></i>
      {isListening && <span className="pulse-ring"></span>}
    </button>
  );
};

export default VoiceButton;
```

Create `src/components/VoiceAssistant/VoiceButton.css`:

```css
.floating-voice-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  cursor: pointer;
  font-size: 1.5rem;
  z-index: 1000;
  transition: all 0.3s ease;
}

.floating-voice-btn:hover {
  transform: scale(1.1);
}

.floating-voice-btn.listening {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  animation: pulse 1.5s infinite;
}

.pulse-ring {
  position: absolute;
  width: 70px;
  height: 70px;
  border: 3px solid #f5576c;
  border-radius: 50%;
  top: -5px;
  left: -5px;
  animation: pulseRing 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes pulseRing {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.3); opacity: 0; }
}
```

---

## 🏠 Step 4: Update App.js

```javascript
import { VoiceProvider } from './context/VoiceContext';
import VoiceButton from './components/VoiceAssistant/VoiceButton';

function App() {
  return (
    <AppProvider>
      <VoiceProvider>
        <Router>
          <div className="app-wrapper">
            <Routes>
              {/* ... existing routes ... */}
            </Routes>
            <VoiceButton /> {/* Add floating button */}
            <Footer />
          </div>
        </Router>
      </VoiceProvider>
    </AppProvider>
  );
}
```

---

## 🏠 Step 5: Update Home.js

Add voice toggle to header:

```javascript
import { useVoice } from '../context/VoiceContext';

const Home = () => {
  const { voiceEnabled, toggleVoice, speakText } = useVoice();
  const { language } = useApp();

  useEffect(() => {
    if (voiceEnabled) {
      speakText("Welcome to BMTC Smart Transit", language);
    }
  }, [voiceEnabled]);

  return (
    <div>
      <header className="main-header">
        <div className="header-actions">
          <button 
            className={`header-btn ${voiceEnabled ? 'voice-active' : ''}`}
            onClick={toggleVoice}
          >
            <i className={`fas ${voiceEnabled ? 'fa-microphone' : 'fa-microphone-slash'}`}></i>
            <span>{voiceEnabled ? 'Voice On' : 'Voice Off'}</span>
          </button>
          {/* ... other buttons ... */}
        </div>
      </header>
      {/* ... rest of component ... */}
    </div>
  );
};
```

---

## 🚌 Step 6: Add Voice to TrackBus

```javascript
import { useVoice } from '../context/VoiceContext';

const TrackBus = () => {
  const { voiceEnabled, speakText, startListening } = useVoice();
  const { language } = useApp();
  const [busNumber, setBusNumber] = useState('');

  const handleVoiceInput = () => {
    speakText("Please say the bus number", language);
    
    startListening(language, {
      onResult: (text) => {
        const extractedNumber = extractBusNumber(text);
        if (extractedNumber) {
          setBusNumber(extractedNumber);
          speakText(`Tracking bus ${extractedNumber}`, language);
          handleSearch(extractedNumber);
        }
      }
    });
  };

  const extractBusNumber = (text) => {
    // Extract bus number from speech (e.g., "three three five E" → "335E")
    const normalized = text.toLowerCase();
    // Add number mapping logic here
    return normalized.match(/\d+[a-z]*/i)?.[0] || text;
  };

  return (
    <div>
      <input
        value={busNumber}
        onChange={(e) => setBusNumber(e.target.value)}
        placeholder="Enter bus number"
      />
      {voiceEnabled && (
        <button onClick={handleVoiceInput}>
          <i className="fas fa-microphone"></i> Voice Input
        </button>
      )}
      {/* ... rest of component ... */}
    </div>
  );
};
```

---

## 🗺️ Step 7: Voice Prompts JSON

Create `src/locales/voice-en.json`:

```json
{
  "welcome": "Welcome to BMTC Smart Transit",
  "selectLanguage": "Please say your preferred language",
  "trackBus": "Please say the bus number",
  "journeyOrigin": "Say your origin stop",
  "journeyDestination": "Say your destination",
  "crowdPrediction": "Say the bus number for crowd prediction",
  "fareFrom": "Say your starting point",
  "fareTo": "Say your destination",
  "searchComplete": "Search complete. {{count}} results found",
  "busArriving": "Bus {{number}} arriving in {{minutes}} minutes",
  "highCrowd": "Warning: High crowd level on this bus",
  "errorRetry": "Sorry, please try again",
  "unknownCommand": "I didn't understand. Please repeat"
}
```

Create `src/locales/voice-kn.json`:

```json
{
  "welcome": "ಬಿಎಮ್‌ಟಿಸಿ ಸ್ಮಾರ್ಟ್ ಟ್ರಾನ್ಸಿಟ್‌ಗೆ ಸ್ವಾಗತ",
  "selectLanguage": "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಭಾಷೆ ಹೇಳಿ",
  "trackBus": "ಬಸ್ ಸಂಖ್ಯೆ ಹೇಳಿ",
  "journeyOrigin": "ಮೂಲ ನಿಲ್ದಾಣ ಹೇಳಿ",
  "journeyDestination": "ಗಮ್ಯಸ್ಥಾನ ಹೇಳಿ"
}
```

Create `src/locales/voice-hi.json`:

```json
{
  "welcome": "बीएमटीसी स्मार्ट ट्रांजिट में आपका स्वागत है",
  "selectLanguage": "कृपया अपनी भाषा बोलें",
  "trackBus": "बस नंबर बोलें",
  "journeyOrigin": "प्रारंभिक स्टॉप बोलें",
  "journeyDestination": "गंतव्य बोलें"
}
```

---

## 🧪 Step 8: Testing

Create test file `src/components/VoiceAssistant/VoiceTest.js`:

```javascript
import React from 'react';
import { useVoice } from '../../context/VoiceContext';

const VoiceTest = () => {
  const { speakText, startListening } = useVoice();

  const testTTS = (lang) => {
    const messages = {
      en: "Hello, testing English",
      kn: "ನಮಸ್ಕಾರ, ಕನ್ನಡ ಪರೀಕ್ಷೆ",
      hi: "नमस्ते, हिंदी परीक्षण"
    };
    speakText(messages[lang], lang);
  };

  const testSTT = (lang) => {
    startListening(lang, {
      onResult: (text) => alert(`Recognized: ${text}`),
      onError: (error) => alert(`Error: ${error}`)
    });
  };

  return (
    <div style={{padding: '20px'}}>
      <h2>Voice Assistant Test</h2>
      
      <h3>Text-to-Speech</h3>
      <button onClick={() => testTTS('en')}>Test English</button>
      <button onClick={() => testTTS('kn')}>Test Kannada</button>
      <button onClick={() => testTTS('hi')}>Test Hindi</button>
      
      <h3>Speech-to-Text</h3>
      <button onClick={() => testSTT('en')}>Listen English</button>
      <button onClick={() => testSTT('kn')}>Listen Kannada</button>
      <button onClick={() => testSTT('hi')}>Listen Hindi</button>
    </div>
  );
};

export default VoiceTest;
```

---

## ✅ Checklist

- [ ] Install dependencies (none needed for Web Speech API!)
- [ ] Create voiceService.js
- [ ] Create VoiceContext.js
- [ ] Update App.js with VoiceProvider
- [ ] Add VoiceButton component
- [ ] Add voice toggle to Home
- [ ] Add voice input to TrackBus
- [ ] Create voice prompt JSON files
- [ ] Test TTS in all 3 languages
- [ ] Test STT in all 3 languages
- [ ] Test on different browsers

---

## 🌐 Browser Support

| Browser | TTS | STT | Notes |
|---------|-----|-----|-------|
| Chrome | ✅ | ✅ | Best support |
| Edge | ✅ | ✅ | Full support |
| Firefox | ✅ | ❌ | TTS only |
| Safari | ✅ | ⚠️ | Limited STT |

---

## 🚀 Quick Start

```bash
# No installation needed! Web Speech API is built-in

# Just add the files and test:
cd f:\MiniProject
npm start

# Navigate to home page
# Click "Voice Off" → "Voice On"
# Click floating mic button
# Say "Track bus three three five E"
```

---

**Implementation Time:** 1-2 days for basic version

**Next:** See VOICE_TESTING_GUIDE.md for comprehensive testing procedures
