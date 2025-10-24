import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoice } from '../context/VoiceContext';
import { recognizeIntent, getRouteForIntent, getResponseForIntent } from '../services/nlpService';
import './VoiceButton.css';

const VoiceButton = () => {
  const navigate = useNavigate();
  const { voiceEnabled, voiceLanguage, isListening, startListening, speakText } = useVoice();

  if (!voiceEnabled) return null;

  const handleClick = () => {
    if (isListening) return;

    // Prompt user to speak
    const prompts = {
      en: "Listening... Please say a command",
      kn: "ಕೇಳುತ್ತಿದ್ದೇನೆ... ದಯವಿಟ್ಟು ಆದೇಶ ಹೇಳಿ",
      hi: "सुन रहा हूं... कृपया कमांड बोलें"
    };
    
    speakText(prompts[voiceLanguage] || prompts.en, voiceLanguage);

    setTimeout(() => {
      startListening(voiceLanguage, {
        onResult: (transcript) => {
          console.log('Voice command received:', transcript);
          processVoiceCommand(transcript);
        },
        onError: (error) => {
          console.error('Voice error:', error);
          const errorMsg = {
            en: "Sorry, I didn't catch that. Please try again.",
            kn: "ಕ್ಷಮಿಸಿ, ಅರ್ಥವಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
            hi: "क्षमा करें, समझ नहीं आया। फिर से प्रयास करें।"
          };
          speakText(errorMsg[voiceLanguage] || errorMsg.en, voiceLanguage);
        }
      });
    }, 1500); // Wait for prompt to finish
  };

  const processVoiceCommand = (text) => {
    // Use NLP service for advanced intent recognition
    const { intent, confidence, entities } = recognizeIntent(text);
    
    console.log('🎤 Voice Command:', text);
    console.log('🧠 Detected Intent:', intent, `(${(confidence * 100).toFixed(1)}% confidence)`);
    console.log('📊 Extracted Entities:', entities);

    if (intent && confidence > 0.2) { // Lowered threshold from 0.3 to 0.2 for better recognition
      // Get personalized response with entities
      const response = getResponseForIntent(intent, voiceLanguage, entities);
      console.log('🔊 Response:', response);
      speakText(response, voiceLanguage);
      
      // Navigate to the appropriate page using React Router
      const route = getRouteForIntent(intent);
      console.log('🚀 Navigating to:', route);
      
      if (route) {
        setTimeout(() => {
          navigate(route);
          console.log('✅ Navigation complete to:', route);
        }, 2000); // Wait for response to finish
      } else {
        console.log('⚠️ No route found for intent:', intent);
      }
    } else {
      // Low confidence or no intent detected
      console.log('❌ Low confidence or no intent detected');
      console.log('📊 Best intent was:', intent, 'with confidence:', (confidence * 100).toFixed(1) + '%');
      const fallbackMsg = {
        en: "I didn't quite understand that. Try saying: 'track bus', 'journey planner', 'crowd prediction', 'fare calculator', or 'time table'",
        kn: "ಅರ್ಥವಾಗಲಿಲ್ಲ. 'ಬಸ್ ಟ್ರ್ಯಾಕ್', 'ಪ್ರಯಾಣ ಯೋಜನೆ', 'ಜನಸಂದಣಿ', 'ದರ ಗಣಕ' ಅಥವಾ 'ಸಮಯ ಪಟ್ಟಿ' ಹೇಳಿ",
        hi: "समझ नहीं आया। 'बस ट्रैक', 'यात्रा योजना', 'भीड़', 'किराया' या 'समय सारणी' बोलें"
      };
      speakText(fallbackMsg[voiceLanguage] || fallbackMsg.en, voiceLanguage);
    }
  };

  return (
    <button 
      className={`floating-voice-btn ${isListening ? 'listening' : ''}`}
      onClick={handleClick}
      disabled={isListening}
      aria-label="Voice command"
      title="Click to give voice command"
    >
      <i className="fas fa-microphone"></i>
      {isListening && (
        <>
          <span className="pulse-ring"></span>
          <span className="listening-text">Listening...</span>
        </>
      )}
    </button>
  );
};

export default VoiceButton;
