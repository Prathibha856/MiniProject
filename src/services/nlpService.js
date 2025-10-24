// Natural Language Processing Service for Voice Commands
// Implements intent recognition, entity extraction, and fuzzy matching

/**
 * Calculate similarity between two strings using Levenshtein distance
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Similarity score (0-1)
 */
const calculateSimilarity = (str1, str2) => {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1.0;
  if (s1.length === 0 || s2.length === 0) return 0.0;

  // Levenshtein distance
  const matrix = [];
  for (let i = 0; i <= s2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= s1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  const distance = matrix[s2.length][s1.length];
  const maxLength = Math.max(s1.length, s2.length);
  return 1 - distance / maxLength;
};

/**
 * Intent patterns with multiple variations for better NLP matching
 */
const intentPatterns = {
  track: {
    keywords: [
      'track', 'tracking', 'locate', 'find', 'where', 'search', 'look',
      'show', 'bus', 'location', 'position', 'see', 'check', 'view',
      'ट्रैक', 'ट्रैकिंग', 'खोजें', 'बस', 'कहां', 'देखें', 'ढूंढें',
      'ಟ್ರ್ಯಾಕ್', 'ಬಸ್', 'ಹುಡುಕಿ', 'ಎಲ್ಲಿ', 'ತೋರಿಸು', 'ನೋಡು', 'ಪತ್ತೆ'
    ],
    phrases: [
      'track a bus', 'track bus', 'find a bus', 'where is the bus', 'where is bus',
      'bus tracking', 'show bus location', 'locate bus', 'find the bus',
      'i want to track', 'can you track', 'track my bus', 'locate my bus',
      'show me bus', 'where is my bus', 'bus location', 'check bus location',
      'बस ट्रैक करें', 'बस कहां है', 'बस खोजें', 'बस ढूंढो', 'मेरी बस कहां है',
      'ಬಸ್ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ', 'ಬಸ್ ಎಲ್ಲಿದೆ', 'ಬಸ್ ಹುಡುಕಿ', 'ನನ್ನ ಬಸ್ ಎಲ್ಲಿದೆ'
    ],
    entities: ['bus_number']
  },
  journey: {
    keywords: [
      'journey', 'trip', 'travel', 'plan', 'route', 'planner', 'planning',
      'go', 'going', 'reach', 'get', 'destination', 'way', 'path',
      'यात्रा', 'योजना', 'मार्ग', 'जाना', 'से', 'जाने', 'रास्ता', 'कैसे',
      'ಪ್ರಯಾಣ', 'ಯೋಜನೆ', 'ಮಾರ್ಗ', 'ಹೋಗು', 'ದಾರಿ', 'ಹೇಗೆ'
    ],
    phrases: [
      'journey planner', 'plan my journey', 'plan trip', 'find route', 'plan my trip',
      'how to go', 'how to reach', 'how can i go', 'how do i get to', 'travel plan',
      'i want to go', 'i need to go', 'help me reach', 'show me the way',
      'route planning', 'plan a route', 'find the way', 'best way to go',
      'यात्रा योजना', 'कैसे जाएं', 'मार्ग खोजें', 'रास्ता बताओ', 'कैसे पहुंचें',
      'ಪ್ರಯಾಣ ಯೋಜನೆ', 'ಹೇಗೆ ಹೋಗಬೇಕು', 'ದಾರಿ ತೋರಿಸು', 'ಹೇಗೆ ತಲುಪುವುದು'
    ],
    entities: ['origin', 'destination']
  },
  crowd: {
    keywords: [
      'crowd', 'crowded', 'busy', 'full', 'occupied', 'people', 'passengers',
      'prediction', 'occupancy', 'packed', 'empty', 'space', 'seats',
      'भीड़', 'भीड़भाड़', 'व्यस्त', 'लोग', 'कितने', 'खाली', 'भरा',
      'ಜನಸಂದಣಿ', 'ಕಿಕ್ಕಿರಿದ', 'ಜನ', 'ಎಷ್ಟು', 'ಖಾಲಿ', 'ತುಂಬಿದೆ'
    ],
    phrases: [
      'crowd prediction', 'how crowded', 'bus occupancy', 'is it full', 'is bus full',
      'crowd level', 'how busy is the bus', 'people on bus', 'check crowd',
      'is it crowded', 'how many people', 'check occupancy', 'bus crowd',
      'will it be crowded', 'is there space', 'any seats available',
      'भीड़ की भविष्यवाणी', 'कितनी भीड़', 'बस में कितने लोग', 'भीड़ है क्या',
      'ಜನಸಂದಣಿ ಮುನ್ಸೂಚನೆ', 'ಎಷ್ಟು ಜನ', 'ಬಸ್ ತುಂಬಿದೆಯೇ', 'ಜನಸಂದಣಿ ಇದೆಯೇ'
    ],
    entities: ['bus_number', 'route']
  },
  fare: {
    keywords: [
      'fare', 'price', 'cost', 'ticket', 'charge', 'payment', 'pay', 'money',
      'calculate', 'calculator', 'amount', 'rate', 'fee',
      'किराया', 'कीमत', 'टिकट', 'कितना', 'मूल्य', 'पैसे', 'खर्च',
      'ದರ', 'ಬೆಲೆ', 'ಟಿಕೆಟ್', 'ಎಷ್ಟು', 'ಹಣ', 'ಖರ್ಚು'
    ],
    phrases: [
      'fare calculator', 'calculate fare', 'ticket price', 'how much fare', 'bus fare',
      'cost of ticket', 'price calculator', 'check fare', 'what is the fare',
      'how much does it cost', 'how much will i pay', 'ticket cost',
      'calculate ticket price', 'fare amount', 'bus ticket price',
      'किराया कैलकुलेटर', 'कितना किराया', 'टिकट की कीमत', 'किराया कितना है',
      'ದರ ಕ್ಯಾಲ್ಕುಲೇಟರ್', 'ಎಷ್ಟು ದರ', 'ಟಿಕೆಟ್ ಬೆಲೆ', 'ದರ ಎಷ್ಟು'
    ],
    entities: ['origin', 'destination']
  },
  timetable: {
    keywords: [
      'time', 'timetable', 'schedule', 'timing', 'when', 'departure', 'arrives',
      'arrival', 'leave', 'starts', 'comes', 'frequency', 'intervals',
      'समय', 'समय सारणी', 'कब', 'शेड्यूल', 'टाइमिंग', 'आता', 'जाता',
      'ಸಮಯ', 'ಸಮಯ ಪಟ್ಟಿ', 'ಯಾವಾಗ', 'ವೇಳಾಪಟ್ಟಿ', 'ಬರುತ್ತದೆ', 'ಹೊರಡುತ್ತದೆ'
    ],
    phrases: [
      'time table', 'bus schedule', 'bus timing', 'what time does it leave', 'show schedule',
      'check timing', 'departure time', 'arrival time', 'when does bus come',
      'when does it arrive', 'bus time', 'show timetable', 'check schedule',
      'what time does bus leave', 'when is the next bus', 'bus frequency',
      'समय सारणी', 'बस का समय', 'कब चलती है', 'कब आती है', 'समय बताओ',
      'ಸಮಯ ಪಟ್ಟಿ', 'ಬಸ್ ಸಮಯ', 'ಯಾವಾಗ ಹೊರಡುತ್ತದೆ', 'ಯಾವಾಗ ಬರುತ್ತದೆ'
    ],
    entities: ['bus_number', 'route']
  },
  search: {
    keywords: [
      'search', 'find', 'which', 'what', 'route', 'bus', 'look', 'looking',
      'खोजें', 'मार्ग', 'कौन', 'क्या', 'बस', 'ढूंढ',
      'ಹುಡುಕು', 'ಮಾರ್ಗ', 'ಯಾವ', 'ಏನು', 'ಬಸ್'
    ],
    phrases: [
      'search route', 'find route', 'which bus goes to', 'route search', 'search bus',
      'which bus should i take', 'what bus goes to', 'find a route', 'search for bus',
      'मार्ग खोजें', 'कौन सी बस जाती है', 'कौन सी बस लूं', 'रूट खोजें',
      'ಮಾರ್ಗ ಹುಡುಕು', 'ಯಾವ ಬಸ್ ಹೋಗುತ್ತದೆ', 'ಯಾವ ಬಸ್ ಹಿಡಿಯಬೇಕು'
    ],
    entities: ['destination']
  },
  around: {
    keywords: [
      'around', 'near', 'nearby', 'station', 'stop', 'amenities', 'facilities',
      'close', 'vicinity', 'area', 'surrounding', 'places',
      'आसपास', 'पास', 'स्टेशन', 'स्टॉप', 'सुविधाएं', 'क्षेत्र',
      'ಸುತ್ತಲೂ', 'ಹತ್ತಿರ', 'ನಿಲ್ದಾಣ', 'ಸೌಲಭ್ಯಗಳು', 'ಪ್ರದೇಶ'
    ],
    phrases: [
      'around station', 'near bus stop', 'nearby amenities', 'around bus station',
      'what is around', 'whats near', 'facilities nearby', 'places near station',
      'स्टेशन के आसपास', 'पास में क्या है', 'आसपास क्या है', 'पास की सुविधाएं',
      'ನಿಲ್ದಾಣದ ಸುತ್ತಲೂ', 'ಹತ್ತಿರ ಏನಿದೆ', 'ಸುತ್ತಮುತ್ತ ಏನಿದೆ'
    ],
    entities: ['location']
  },
  about: {
    keywords: [
      'about', 'information', 'info', 'details', 'buses', 'list', 'all', 'show',
      'tell', 'available', 'routes', 'numbers',
      'बारे', 'जानकारी', 'सभी', 'बसें', 'सूची', 'बताओ', 'दिखाओ',
      'ಬಗ್ಗೆ', 'ಮಾಹಿತಿ', 'ಎಲ್ಲಾ', 'ಬಸ್', 'ಪಟ್ಟಿ', 'ತೋರಿಸು'
    ],
    phrases: [
      'about bus', 'bus information', 'list of buses', 'all buses', 'show buses',
      'tell me about buses', 'bus details', 'available buses', 'all bus routes',
      'what buses are available', 'show all buses', 'bus info',
      'बस के बारे में', 'सभी बसों की सूची', 'बसों की जानकारी', 'सभी बसें दिखाओ',
      'ಬಸ್ ಬಗ್ಗೆ', 'ಎಲ್ಲಾ ಬಸ್‌ಗಳು', 'ಬಸ್ ಮಾಹಿತಿ', 'ಎಲ್ಲಾ ಬಸ್ ತೋರಿಸು'
    ],
    entities: []
  },
  feedback: {
    keywords: [
      'feedback', 'complaint', 'complain', 'review', 'rating', 'report', 'issue',
      'problem', 'suggest', 'suggestion', 'comment',
      'फीडबैक', 'शिकायत', 'रिव्यू', 'समस्या', 'सुझाव', 'टिप्पणी',
      'ಪ್ರತಿಕ್ರಿಯೆ', 'ದೂರು', 'ಸಮಸ್ಯೆ', 'ಸಲಹೆ', 'ಅಭಿಪ್ರಾಯ'
    ],
    phrases: [
      'give feedback', 'submit feedback', 'report issue', 'write review', 'report problem',
      'i want to complain', 'make a complaint', 'file complaint', 'give suggestion',
      'फीडबैक दें', 'शिकायत दर्ज करें', 'समस्या बताएं', 'सुझाव दें',
      'ಪ್ರತಿಕ್ರಿಯೆ ನೀಡಿ', 'ದೂರು ನೀಡಿ', 'ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಿ'
    ],
    entities: []
  },
  help: {
    keywords: [
      'help', 'guide', 'tutorial', 'support', 'assist', 'assistance', 'use',
      'how', 'what', 'explain', 'understand', 'instructions', 'manual',
      'मदद', 'सहायता', 'कैसे', 'क्या', 'समझाओ', 'बताओ', 'गाइड',
      'ಸಹಾಯ', 'ಮಾರ್ಗದರ್ಶನ', 'ಹೇಗೆ', 'ಏನು', 'ವಿವರಿಸು', 'ಬಳಕೆ'
    ],
    phrases: [
      'help me', 'user guide', 'how to use', 'need help', 'support', 'i need help',
      'can you help', 'help with app', 'how does this work', 'explain this',
      'show me how', 'instructions', 'how to use this app',
      'मदद चाहिए', 'कैसे उपयोग करें', 'मदद करें', 'समझाओ', 'कैसे काम करता है',
      'ಸಹಾಯ ಬೇಕು', 'ಹೇಗೆ ಬಳಸುವುದು', 'ಸಹಾಯ ಮಾಡಿ', 'ವಿವರಿಸಿ'
    ],
    entities: []
  }
};

/**
 * Extract bus number from text
 * @param {string} text - Input text
 * @returns {string|null} Extracted bus number
 */
const extractBusNumber = (text) => {
  // Match patterns like: 335E, 500D, 298, etc.
  const patterns = [
    /\b(\d{1,4}[a-z]{0,2})\b/i,  // 335E, 298, 500D
    /bus\s+(\d{1,4}[a-z]{0,2})/i, // "bus 335E"
    /number\s+(\d{1,4}[a-z]{0,2})/i, // "number 335E"
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].toUpperCase();
  }

  return null;
};

/**
 * Extract location/stop names from text
 * @param {string} text - Input text
 * @returns {object} Extracted locations
 */
const extractLocations = (text) => {
  const normalized = text.toLowerCase();
  const result = { origin: null, destination: null };

  // Look for "from X to Y" patterns
  const fromToPattern = /from\s+([a-z\s]+)\s+to\s+([a-z\s]+)/i;
  const match = normalized.match(fromToPattern);
  
  if (match) {
    result.origin = match[1].trim();
    result.destination = match[2].trim();
  }

  return result;
};

/**
 * Advanced NLP intent recognition with confidence scoring
 * @param {string} text - User's voice input
 * @returns {object} { intent, confidence, entities }
 */
export const recognizeIntent = (text) => {
  if (!text || text.trim().length === 0) {
    return { intent: null, confidence: 0, entities: {} };
  }

  const normalized = text.toLowerCase().trim();
  const scores = {};

  // Score each intent based on keyword and phrase matching
  for (const [intent, pattern] of Object.entries(intentPatterns)) {
    let score = 0;
    let matchCount = 0;

    // Check phrase matches (higher weight)
    for (const phrase of pattern.phrases) {
      const similarity = calculateSimilarity(normalized, phrase);
      if (similarity > 0.6) { // Lowered from 0.7 to be more lenient
        score += similarity * 12; // Increased weight for phrase matches
        matchCount++;
      } else if (normalized.includes(phrase)) {
        score += 10; // Increased weight
        matchCount++;
      }
    }

    // Check keyword matches
    for (const keyword of pattern.keywords) {
      if (normalized.includes(keyword)) {
        score += 6; // Increased weight from 5 to 6
        matchCount++;
      }
      // Also check for partial matches (more human-like)
      else if (keyword.length > 3) {
        const similarity = calculateSimilarity(normalized, keyword);
        if (similarity > 0.7) {
          score += 4; // Partial match bonus
          matchCount++;
        }
      }
    }

    // Normalize score by number of patterns checked
    if (matchCount > 0) {
      scores[intent] = score / Math.sqrt(pattern.keywords.length + pattern.phrases.length);
    }
  }

  // Find best matching intent
  let bestIntent = null;
  let bestScore = 0;

  for (const [intent, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  // Calculate confidence (0-1)
  const confidence = Math.min(bestScore / 10, 1.0);

  // Extract entities
  const entities = {};
  const busNumber = extractBusNumber(text);
  if (busNumber) entities.busNumber = busNumber;

  const locations = extractLocations(text);
  if (locations.origin) entities.origin = locations.origin;
  if (locations.destination) entities.destination = locations.destination;

  console.log('🧠 NLP Analysis:', {
    input: text,
    intent: bestIntent,
    confidence: confidence.toFixed(2),
    entities,
    allScores: scores
  });

  return {
    intent: confidence > 0.3 ? bestIntent : null, // Threshold: 30% confidence
    confidence,
    entities,
    originalText: text
  };
};

/**
 * Get route path for intent
 * @param {string} intent - Detected intent
 * @returns {string} Route path
 */
export const getRouteForIntent = (intent) => {
  const routes = {
    track: '/track-bus',
    journey: '/journey-planner',
    crowd: '/crowd-prediction',
    fare: '/fare-calculator',
    timetable: '/timetable',
    search: '/search-route',
    around: '/around-station',
    about: '/about-bus',
    feedback: '/feedback',
    help: '/user-guide'
  };

  return routes[intent] || null;
};

/**
 * Generate response message for intent
 * @param {string} intent - Detected intent
 * @param {string} language - Language code
 * @param {object} entities - Extracted entities
 * @returns {string} Response message
 */
export const getResponseForIntent = (intent, language = 'en', entities = {}) => {
  const responses = {
    en: {
      track: entities.busNumber 
        ? `Opening bus tracking for bus ${entities.busNumber}`
        : 'Opening bus tracking',
      journey: entities.origin && entities.destination
        ? `Planning journey from ${entities.origin} to ${entities.destination}`
        : 'Opening journey planner',
      crowd: entities.busNumber
        ? `Checking crowd prediction for bus ${entities.busNumber}`
        : 'Opening crowd prediction',
      fare: entities.origin && entities.destination
        ? `Calculating fare from ${entities.origin} to ${entities.destination}`
        : 'Opening fare calculator',
      timetable: 'Opening time table',
      search: 'Opening route search',
      around: 'Showing nearby amenities',
      about: 'Opening bus information',
      feedback: 'Opening feedback form',
      help: 'Opening user guide',
      unknown: "I didn't understand that. Try saying 'track bus' or 'journey planner'"
    },
    kn: {
      track: entities.busNumber
        ? `ಬಸ್ ${entities.busNumber} ಗೆ ಟ್ರ್ಯಾಕಿಂಗ್ ತೆರೆಯುತ್ತಿದೆ`
        : 'ಬಸ್ ಟ್ರ್ಯಾಕಿಂಗ್ ತೆರೆಯುತ್ತಿದೆ',
      journey: 'ಪ್ರಯಾಣ ಯೋಜಕ ತೆರೆಯುತ್ತಿದೆ',
      crowd: 'ಜನಸಂದಣಿ ಮುನ್ಸೂಚನೆ ತೆರೆಯುತ್ತಿದೆ',
      fare: 'ದರ ಗಣಕ ತೆರೆಯುತ್ತಿದೆ',
      timetable: 'ಸಮಯ ಪಟ್ಟಿ ತೆರೆಯುತ್ತಿದೆ',
      search: 'ಮಾರ್ಗ ಹುಡುಕಾಟ ತೆರೆಯುತ್ತಿದೆ',
      around: 'ಹತ್ತಿರದ ಸೌಲಭ್ಯಗಳು ತೋರಿಸುತ್ತಿದೆ',
      about: 'ಬಸ್ ಮಾಹಿತಿ ತೆರೆಯುತ್ತಿದೆ',
      feedback: 'ಪ್ರತಿಕ್ರಿಯೆ ತೆರೆಯುತ್ತಿದೆ',
      help: 'ಬಳಕೆದಾರ ಮಾರ್ಗದರ್ಶಿ ತೆರೆಯುತ್ತಿದೆ',
      unknown: 'ಅರ್ಥವಾಗಲಿಲ್ಲ. "ಬಸ್ ಟ್ರ್ಯಾಕ್" ಅಥವಾ "ಪ್ರಯಾಣ ಯೋಜನೆ" ಹೇಳಿ'
    },
    hi: {
      track: entities.busNumber
        ? `बस ${entities.busNumber} के लिए ट्रैकिंग खोल रहा हूं`
        : 'बस ट्रैकिंग खोल रहा हूं',
      journey: 'यात्रा योजनाकार खोल रहा हूं',
      crowd: 'भीड़ पूर्वानुमान खोल रहा हूं',
      fare: 'किराया कैलकुलेटर खोल रहा हूं',
      timetable: 'समय सारणी खोल रहा हूं',
      search: 'मार्ग खोज खोल रहा हूं',
      around: 'पास की सुविधाएं दिखा रहा हूं',
      about: 'बस जानकारी खोल रहा हूं',
      feedback: 'फीडबैक फॉर्म खोल रहा हूं',
      help: 'उपयोगकर्ता गाइड खोल रहा हूं',
      unknown: 'समझ नहीं आया। "बस ट्रैक" या "यात्रा योजना" बोलें'
    }
  };

  const langResponses = responses[language] || responses.en;
  return langResponses[intent] || langResponses.unknown;
};
