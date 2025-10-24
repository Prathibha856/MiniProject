# 🔧 Voice Assistant - Complete Troubleshooting Guide

## ⚠️ IMPORTANT: There is NO Backend Server!

**The voice assistant is 100% FRONTEND** - It uses browser APIs only:
- **Text-to-Speech (TTS):** Browser's built-in `speechSynthesis` API
- **Speech-to-Text (STT):** Browser's built-in `SpeechRecognition` API
- **No server**, **no API calls**, **no backend**

---

## 🚀 QUICK START - Fresh Installation

### **Step 1: Stop Any Running Server**
```bash
# Press Ctrl+C in terminal if npm start is running
```

### **Step 2: Test Voice Features First**
```bash
# Open the standalone test file:
# File: f:\MiniProject\public\test-voice.html
# Just double-click it or open in Chrome/Edge
```

This will test if your browser supports voice features **WITHOUT React**.

### **Step 3: If Test Works, Start React App**
```bash
cd f:\MiniProject
npm start
```

### **Step 4: Clear Browser Storage**
```javascript
// Open console (F12), paste this:
localStorage.clear();
location.reload();
```

---

## 🎯 STEP-BY-STEP TESTING

### **Test 1: Browser Voice API**

**Open:** `f:\MiniProject\public\test-voice.html` in Chrome/Edge

**Expected Result:**
- ✅ Browser Support Check: All green
- ✅ TTS Test: Should hear voice
- ✅ STT Test: Should recognize speech
- ✅ Integration Test: Full flow works

**If this fails:**
- ❌ Use Chrome or Edge (NOT Firefox)
- ❌ Grant microphone permission
- ❌ Check browser audio/volume

---

### **Test 2: React App**

**Start app:**
```bash
npm start
```

**Open:** http://localhost:3000

**Test sequence:**
1. ✅ See "Voice Off" button in header?
2. ✅ Click "Voice Off"
3. ✅ Language modal appears?
4. ✅ Click any language
5. ✅ Hear welcome message?
6. ✅ Button changes to "Voice On" (green)?
7. ✅ Purple mic button visible (bottom-right)?
8. ✅ Click mic button
9. ✅ Button turns pink?
10. ✅ Hear "Listening..."?
11. ✅ Say "track bus"
12. ✅ Navigate to Track Bus page?

**If ANY step fails, see specific section below.**

---

## 🐛 SPECIFIC ISSUE FIXES

### **Issue 1: "Voice Off" Button Not Showing**

**Cause:** Browser doesn't support voice APIs

**Fix:**
```javascript
// Test support in console:
console.log('TTS:', 'speechSynthesis' in window);
console.log('STT:', 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

// Both should be true
// If false → Use Chrome or Edge browser
```

---

### **Issue 2: Language Modal Not Appearing**

**Possible Causes:**
1. Language already saved
2. Component not imported
3. React error

**Fix:**
```javascript
// 1. Check if language is saved:
console.log('Saved language:', localStorage.getItem('voiceLanguage'));
// If not null → that's why modal doesn't show

// 2. Force show modal:
localStorage.removeItem('voiceLanguage');
localStorage.removeItem('voiceEnabled');
location.reload();
// Now click "Voice Off" again

// 3. Check React DevTools:
// Install React DevTools extension
// Check if VoiceLanguageModal exists in component tree
```

---

### **Issue 3: No Sound/Voice**

**Possible Causes:**
1. Browser audio muted
2. System volume low
3. TTS not working

**Fix:**
```javascript
// Test TTS directly:
const test = new SpeechSynthesisUtterance('Hello World Test');
test.lang = 'en-US';
test.rate = 1.0;
test.volume = 1.0;
window.speechSynthesis.speak(test);

// Should hear "Hello World Test"
// If not:
// - Check browser audio icon (top-right)
// - Check system volume
// - Check if speakers/headphones connected
// - Try different browser
```

---

### **Issue 4: Microphone Not Working**

**Possible Causes:**
1. Permission denied
2. No microphone connected
3. STT not supported

**Fix:**

**A. Check Permission:**
1. Click 🔒 lock icon in address bar
2. Find "Microphone" permission
3. Set to "Allow"
4. Reload page

**B. Test Microphone:**
```javascript
navigator.mediaDevices.getUserMedia({ audio: true })
    .then(() => console.log('✅ Microphone access granted'))
    .catch(err => console.error('❌ Microphone error:', err));
```

**C. Test STT:**
```javascript
const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
rec.lang = 'en-US';
rec.onresult = e => console.log('✅ You said:', e.results[0][0].transcript);
rec.onerror = e => console.error('❌ Error:', e.error);
rec.start();
console.log('🎤 Speak now...');
```

---

### **Issue 5: Commands Not Recognized**

**Possible Causes:**
1. Speaking unclear
2. Wrong language
3. Low confidence
4. NLP not working

**Fix:**

**A. Check Console Output:**
```javascript
// After saying a command, console should show:
🎤 Recognized (en): your words here (92% confidence)
🧠 NLP Analysis: { intent: "track", confidence: "0.92", ... }
🧠 Detected Intent: track (92.0% confidence)
```

**B. If no recognition:**
- Speak **clearly** and **slowly**
- Speak **closer** to microphone
- Use **exact commands**: "track bus", "journey planner"
- Check language matches voice language setting

**C. If low confidence (<30%):**
- Command is too vague
- Try exact phrases:
  - "track bus"
  - "journey planner"
  - "crowd prediction"
  - "fare calculator"
  - "time table"

---

### **Issue 6: Navigation Not Working**

**Possible Causes:**
1. React Router issue
2. Hash navigation
3. JavaScript error

**Fix:**

**A. Check Console for Errors:**
Press F12, look for red errors

**B. Test Navigation Manually:**
```javascript
// In console, test navigation:
window.location.hash = '/track-bus';
// Should navigate to Track Bus page
// If not → React Router issue
```

**C. Check Routes in App.js:**
```javascript
// Ensure routes are defined:
<Route path="/track-bus" element={<TrackBus />} />
<Route path="/journey-planner" element={<JourneyPlanner />} />
// etc.
```

---

### **Issue 7: React Compilation Errors**

**If app won't start:**

```bash
# 1. Clear npm cache
npm cache clean --force

# 2. Delete node_modules
rm -rf node_modules
rm package-lock.json

# 3. Reinstall
npm install

# 4. Start
npm start
```

**Common errors:**

**A. "Cannot find module"**
```bash
# Install missing dependency:
npm install react-router-dom
```

**B. "Syntax error"**
- Check for typos in imports
- Check for missing brackets/parentheses
- Look at line number in error message

**C. "Port 3000 already in use"**
```bash
# Kill process on port 3000:
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Then start again:
npm start
```

---

## 📊 CONSOLE DEBUGGING

### **What to Look For:**

**On Page Load:**
```
Voice Support: { tts: true, stt: true }  ← Should be true
```

**On Enable Voice:**
```
(Language modal appears - no console output expected)
```

**On Language Selection:**
```
🔊 Speaking (en): Voice assistant enabled. Welcome to BusFlow...
```

**On Mic Click:**
```
🔊 Speaking (en): Listening... Please say a command
🎤 Listening started...
```

**On Speaking:**
```
🎤 Recognized (en): track bus (92% confidence)
🧠 NLP Analysis: {
  input: "track bus",
  intent: "track",
  confidence: "0.92",
  entities: {},
  allScores: { track: 9.2, journey: 1.1, ... }
}
🧠 Detected Intent: track (92.0% confidence)
📊 Extracted Entities: {}
🔊 Speaking (en): Opening bus tracking
🎤 Listening ended
```

**If you DON'T see this output → Something is wrong**

---

## 🔍 FILE CHECKLIST

Ensure all these files exist:

```
✅ src/services/voiceService.js
✅ src/services/nlpService.js
✅ src/context/VoiceContext.js
✅ src/components/VoiceButton.js
✅ src/components/VoiceButton.css
✅ src/components/VoiceLanguageModal.js
✅ src/components/VoiceLanguageModal.css
✅ src/App.js (imports VoiceProvider, VoiceButton, VoiceLanguageModal)
✅ src/components/Home.js (has voice toggle button)
```

**To check:**
```bash
# In terminal:
cd f:\MiniProject\src

# Check services:
ls services/voiceService.js
ls services/nlpService.js

# Check context:
ls context/VoiceContext.js

# Check components:
ls components/VoiceButton.js
ls components/VoiceButton.css
ls components/VoiceLanguageModal.js
ls components/VoiceLanguageModal.css
```

---

## 🌐 BROWSER-SPECIFIC ISSUES

### **Chrome (RECOMMENDED ✅)**
- Full support
- Best accuracy
- No known issues

**If not working in Chrome:**
1. Update to latest version
2. Check microphone permission
3. Clear cache: Settings → Privacy → Clear browsing data

---

### **Edge (GOOD ✅)**
- Full support (Chromium-based)
- Same as Chrome

---

### **Firefox (NOT SUPPORTED ❌)**
- ✅ TTS works
- ❌ STT does NOT work
- Voice commands will NOT work

**If using Firefox:**
- Switch to Chrome or Edge

---

### **Safari (LIMITED ⚠️)**
- ✅ TTS works
- ⚠️ STT works but limited
- May have permission issues

**If using Safari:**
- Try Chrome or Edge for best experience

---

## 🚨 EMERGENCY RESET

If NOTHING works:

### **Option 1: Full Browser Reset**
```javascript
// In console (F12):
localStorage.clear();
sessionStorage.clear();
caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
location.reload();
```

### **Option 2: Fresh App Start**
```bash
# Stop server (Ctrl+C)

# Clear everything
npm cache clean --force
rm -rf node_modules
rm package-lock.json

# Reinstall
npm install

# Start fresh
npm start

# Open in incognito/private window
```

### **Option 3: Test Without React**
```bash
# Open test file directly:
# f:\MiniProject\public\test-voice.html
# Just double-click it

# If this works → React issue
# If this fails → Browser issue
```

---

## ✅ FINAL VERIFICATION

**Run this complete test:**

```
1. Open: f:\MiniProject\public\test-voice.html
   → All tests pass? ✅
   
2. Open: http://localhost:3000
   → App loads? ✅
   
3. Console: localStorage.clear()
   → Cleared? ✅
   
4. Refresh page
   → Loaded? ✅
   
5. Click "Voice Off"
   → Modal appears? ✅
   
6. Click "English"
   → Hear welcome? ✅
   
7. Button is "Voice On" (green)?
   → Yes? ✅
   
8. Purple mic button visible?
   → Yes? ✅
   
9. Click mic button
   → Turns pink? ✅
   → Hear "Listening..."? ✅
   
10. Say "track bus"
    → Console shows NLP analysis? ✅
    → Hear "Opening bus tracking"? ✅
    → Navigate to /track-bus? ✅

ALL ✅ → WORKING PERFECTLY! 🎉
ANY ❌ → Check specific section above
```

---

## 📞 STILL NOT WORKING?

### **Provide These Details:**

1. **Browser & Version:**
   ```javascript
   navigator.userAgent
   ```

2. **Voice Support:**
   ```javascript
   {
     tts: 'speechSynthesis' in window,
     stt: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
   }
   ```

3. **Test File Result:**
   - Did test-voice.html work?
   - What happened?

4. **Console Errors:**
   - Copy ALL red errors from F12 console
   - Include full error messages

5. **Exact Steps:**
   - What did you click?
   - What happened?
   - What should have happened?

6. **Screenshots:**
   - Console output
   - Browser UI
   - Error messages

---

## 🎉 SUCCESS CONFIRMATION

You know it's working when:

1. ✅ test-voice.html passes all tests
2. ✅ React app starts without errors
3. ✅ "Voice Off" button visible
4. ✅ Modal appears on first click
5. ✅ Hear welcome message after selection
6. ✅ Button turns green "Voice On"
7. ✅ Mic button appears and responds
8. ✅ Voice commands recognized in console
9. ✅ App navigates correctly
10. ✅ All feedback messages spoken

**ALL 10 CHECKED → FEATURE IS WORKING!** 🚀

---

## 📝 Quick Reference Commands

```javascript
// Clear storage
localStorage.clear();

// Check support
console.log({
  tts: 'speechSynthesis' in window,
  stt: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
});

// Test TTS
window.speechSynthesis.speak(new SpeechSynthesisUtterance('Test'));

// Test STT
const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
rec.onresult = e => console.log(e.results[0][0].transcript);
rec.start();

// Force show modal
localStorage.removeItem('voiceLanguage');
localStorage.removeItem('voiceEnabled');
location.reload();

// Check voice language
console.log('Voice Language:', localStorage.getItem('voiceLanguage'));
```

---

**Follow this guide step-by-step and your voice assistant WILL work!** 🎤✨
