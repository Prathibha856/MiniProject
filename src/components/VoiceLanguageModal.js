import React, { useEffect } from 'react';
import { useVoice } from '../context/VoiceContext';
import './VoiceLanguageModal.css';

const VoiceLanguageModal = () => {
  const { showLanguagePrompt, selectVoiceLanguage } = useVoice();

  useEffect(() => {
    console.log('🎭 VoiceLanguageModal Render:', { showLanguagePrompt });
  }, [showLanguagePrompt]);

  if (!showLanguagePrompt) {
    console.log('❌ Modal hidden (showLanguagePrompt is false)');
    return null;
  }

  console.log('✅ Modal showing!');

  const handleLanguageSelect = (lang) => {
    selectVoiceLanguage(lang);
  };

  return (
    <div className="voice-language-modal-overlay" onClick={(e) => e.stopPropagation()}>
      <div className="voice-language-modal">
        <div className="modal-header">
          <i className="fas fa-microphone-alt voice-icon"></i>
          <h2>Voice Assistant Language</h2>
          <p>Select your preferred language for voice commands</p>
        </div>
        
        <div className="language-options">
          <button 
            className="language-option"
            onClick={() => handleLanguageSelect('en')}
          >
            <div className="language-flag">🇬🇧</div>
            <div className="language-info">
              <h3>English</h3>
              <p>Voice commands in English</p>
            </div>
            <i className="fas fa-chevron-right"></i>
          </button>

          <button 
            className="language-option"
            onClick={() => handleLanguageSelect('kn')}
          >
            <div className="language-flag">🇮🇳</div>
            <div className="language-info">
              <h3>ಕನ್ನಡ (Kannada)</h3>
              <p>ಕನ್ನಡದಲ್ಲಿ ಧ್ವನಿ ಆದೇಶಗಳು</p>
            </div>
            <i className="fas fa-chevron-right"></i>
          </button>

          <button 
            className="language-option"
            onClick={() => handleLanguageSelect('hi')}
          >
            <div className="language-flag">🇮🇳</div>
            <div className="language-info">
              <h3>हिंदी (Hindi)</h3>
              <p>हिंदी में वॉयस कमांड</p>
            </div>
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>

        <div className="modal-footer">
          <p className="info-text">
            <i className="fas fa-info-circle"></i>
            You can change this later from settings
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoiceLanguageModal;
