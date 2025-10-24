# 🔧 Voice Assistant Testing & Debugging Guide

## ⚠️ TROUBLESHOOTING STEPS

### **Step 1: Clear Browser Cache & Storage**
```javascript
// Open browser console (Press F12)
// Run these commands:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### **Step 2: Check Browser Compatibility**
The voice assistant requires:
- ✅ **Chrome** (Recommended)
- ✅ **Edge** (Chromium-based)
- ❌ **Firefox** (No speech recognition support)
- ⚠️ **Safari** (Limited support)

**Current Browser Check:**
```javascript
// Paste in console:
console.log('TTS Support:', 'speechSynthesis' in window);
console.log('STT Support:', 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
```

### **Step 3: Grant Microphone Permissions**
1. Click the 🔒 lock icon in address bar
2. Find "Microphone" permissions
3. Set to "Allow"
4. Reload page

---

## 🧪 MANUAL TESTING PROCEDURE

### **Test 1: Voice Service Check**
```javascript
// In browser console (F12), paste:
import { checkVoiceSupport } from './services/voiceService';
checkVoiceSupport();
// Should show: { tts: true, stt: true }
```

### **Test 2: Enable Voice Assistant**
1. Open app: http://localhost:3000
2. Click "Voice Off" button (top-right header)
3. **Expected:** Language selection modal appears ✅
4. **If not appearing:** Check console for errors

### **Test 3: Language Selection**
1. Click on any language (English/Kannada/Hindi)
2. **Expected:** 
   - Modal closes
   - Hear welcome message
   - Button changes to "Voice On" (green)
3. **If no sound:** Check browser audio/volume

### **Test 4: Voice Commands**
1. Click purple mic button (bottom-right)
2. **Expected:** Button turns pink, shows "Listening..."
3. Say: "track bus"
4. **Expected:**
   - Hear: "Opening bus tracking"
   - Navigate to Track Bus page
5. **If not working:** Check console for NLP output

---

## 🐛 COMMON ISSUES & FIXES

### **Issue 1: "Voice Off" button not showing**
**Cause:** Browser doesn't support voice features
**Fix:** Use Chrome or Edge browser

### **Issue 2: Modal not appearing**
**Possible Causes:**
1. Language already saved
2. Modal component not imported
3. JavaScript errors

**Debug Steps:**
```javascript
// Check if modal should show:
localStorage.getItem('voiceLanguage')
// If null → modal should appear
// If has value → uses saved language

// Force show modal:
localStorage.removeItem('voiceLanguage');
// Then click "Voice Off" again
```

### **Issue 3: No welcome message**
**Possible Causes:**
1. Browser audio muted
2. TTS not supported
3. Speaker issue

**Debug Steps:**
```javascript
// Test TTS directly:
const utterance = new SpeechSynthesisUtterance('Hello World');
utterance.lang = 'en-US';
window.speechSynthesis.speak(utterance);
// Should hear "Hello World"
```

### **Issue 4: Mic button not responding**
**Possible Causes:**
1. No microphone permission
2. STT not supported
3. Already listening

**Debug Steps:**
```javascript
// Test STT directly:
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';
recognition.onresult = (e) => console.log(e.results[0][0].transcript);
recognition.start();
// Speak something, check console
```

### **Issue 5: Commands not recognized**
**Possible Causes:**
1. Speaking unclear
2. Wrong language selected
3. NLP not detecting intent

**Debug Steps:**
1. Open console (F12)
2. Click mic button
3. Say a command
4. Check console for:
   ```
   🎤 Recognized (en): your text here
   🧠 NLP Analysis: { intent: "track", confidence: 0.87 }
   ```
5. If confidence < 30% → command rejected

---

## ✅ VERIFICATION CHECKLIST

Run through this checklist:

- [ ] Using Chrome or Edge browser?
- [ ] Microphone permission granted?
- [ ] Console shows no errors?
- [ ] `localStorage.clear()` executed?
- [ ] Page refreshed after clearing?
- [ ] "Voice Off" button visible in header?
- [ ] Click "Voice Off" shows modal?
- [ ] Can select language from modal?
- [ ] Hear welcome message after selection?
- [ ] Button changes to "Voice On" (green)?
- [ ] Purple mic button visible (bottom-right)?
- [ ] Mic button responds to clicks?
- [ ] Button turns pink when listening?
- [ ] Can hear "Listening..." message?
- [ ] Voice commands trigger navigation?

---

## 🔍 DETAILED DEBUGGING

### **Check 1: Imports**
```javascript
// All files should be present:
✅ src/services/voiceService.js
✅ src/services/nlpService.js
✅ src/context/VoiceContext.js
✅ src/components/VoiceButton.js
✅ src/components/VoiceButton.css
✅ src/components/VoiceLanguageModal.js
✅ src/components/VoiceLanguageModal.css
```

### **Check 2: Console Errors**
Open console (F12) and look for:
- ❌ Import errors
- ❌ Syntax errors
- ❌ Permission errors
- ❌ API errors

### **Check 3: Network Tab**
Not applicable (no backend calls)

### **Check 4: React DevTools**
1. Install React DevTools extension
2. Check component tree
3. Verify VoiceProvider wraps app
4. Check VoiceContext state:
   - `voiceEnabled: false/true`
   - `voiceLanguage: 'en'/'kn'/'hi'`
   - `showLanguagePrompt: false/true`

---

## 🚀 FRESH START PROCEDURE

If nothing works, follow this complete reset:

```bash
# 1. Stop development server
# Press Ctrl+C in terminal

# 2. Clear browser completely
# In browser console (F12):
localStorage.clear();
sessionStorage.clear();
caches.keys().then(keys => keys.forEach(key => caches.delete(key)));

# 3. Clear npm cache
npm cache clean --force

# 4. Reinstall dependencies
cd f:\MiniProject
rm -rf node_modules
rm package-lock.json
npm install

# 5. Start fresh
npm start

# 6. Open in incognito/private window
# Chrome: Ctrl+Shift+N
# Edge: Ctrl+Shift+P

# 7. Grant microphone permission when prompted

# 8. Test voice assistant
```

---

## 📊 EXPECTED CONSOLE OUTPUT

### **When app loads:**
```
Voice Support: { tts: true, stt: true }
```

### **When clicking "Voice Off":**
```
(Modal should appear - no console output)
```

### **When selecting language:**
```
🔊 Speaking (en): Voice assistant enabled. Welcome to BusFlow...
```

### **When clicking mic button:**
```
🔊 Speaking (en): Listening... Please say a command
🎤 Listening started...
```

### **When speaking command:**
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

---

## 🎯 QUICK FIX COMMANDS

Copy-paste these into console for quick fixes:

```javascript
// Fix 1: Reset voice preferences
localStorage.removeItem('voiceEnabled');
localStorage.removeItem('voiceLanguage');
location.reload();

// Fix 2: Check voice support
console.log({
  tts: 'speechSynthesis' in window,
  stt: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window,
  browser: navigator.userAgent
});

// Fix 3: Test TTS
window.speechSynthesis.speak(
  new SpeechSynthesisUtterance('Voice test successful')
);

// Fix 4: Test STT (requires mic permission)
const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
rec.onresult = e => console.log('You said:', e.results[0][0].transcript);
rec.start();
console.log('Speak now...');

// Fix 5: Check React context
// (Requires React DevTools)
// Open React DevTools → Components → Search "VoiceProvider"
// Check hooks state
```

---

## 📱 BROWSER-SPECIFIC NOTES

### **Chrome (RECOMMENDED ✅)**
- Full support for all features
- Best recognition accuracy
- Kannada & Hindi supported

### **Edge (Chromium) (GOOD ✅)**
- Full support
- Same as Chrome

### **Firefox (NOT SUPPORTED ❌)**
- TTS works ✅
- STT NOT available ❌
- Voice commands will NOT work

### **Safari (LIMITED ⚠️)**
- TTS works ✅
- STT works but limited ⚠️
- May need additional permissions

---

## 🆘 STILL NOT WORKING?

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

3. **Console Errors:**
   - Copy all red errors from console

4. **What happens:**
   - Describe step-by-step what you're doing
   - What you expect to happen
   - What actually happens

5. **Screenshots:**
   - Console output
   - Browser UI
   - Any error messages

---

## ✅ SUCCESS INDICATORS

You know it's working when:

1. ✅ "Voice Off" button visible in header
2. ✅ Clicking it shows language modal
3. ✅ Selecting language speaks welcome message
4. ✅ Button changes to "Voice On" (green, pulsing)
5. ✅ Purple mic button appears bottom-right
6. ✅ Clicking mic speaks "Listening..."
7. ✅ Button turns pink with pulse animation
8. ✅ Speaking command shows in console
9. ✅ NLP detects intent correctly
10. ✅ App navigates to correct page
11. ✅ Confirmation message spoken

---

## 🎉 FINAL TEST SEQUENCE

**Complete end-to-end test:**

```
1. Open: http://localhost:3000
2. Console: localStorage.clear()
3. Refresh page
4. Click: "Voice Off" button
5. See: Language modal ✅
6. Click: "English"
7. Hear: "Voice assistant enabled..." ✅
8. See: Button is green "Voice On" ✅
9. See: Purple mic button (bottom-right) ✅
10. Click: Purple mic button
11. Hear: "Listening..." ✅
12. See: Button pink with pulse ✅
13. Say: "track bus"
14. Console: Shows NLP analysis ✅
15. Hear: "Opening bus tracking" ✅
16. Navigate: To /track-bus page ✅
17. SUCCESS! 🎉
```

---

**If ALL steps work → Feature is working perfectly!** ✅
**If ANY step fails → Check that specific section above** 🔧
