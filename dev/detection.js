const SKIP = new Set([
  "right", "you know", "does that make sense", "make sense", "makes sense",
  "okay", "yeah", "no", "really", "isn't it", "so", "huh", "oh really",
  "you see", "got it", "fair enough", "am i right", "correct", "sure",
  "wouldn't you say", "see what i mean", "know what i mean",
  "you know what i mean", "isn't that right", "don't you think",
]);

const Q_STARTERS = [
  "what do you think about", "what do you think of", "what do you mean by",
  "how do you feel about", "how would you describe", "how would you handle",
  "can you tell me about", "can you tell me", "can you explain",
  "could you tell me", "could you explain", "could you describe",
  "would you say", "would you recommend", "would you mind",
  "do you know about", "do you know how", "do you know what", "do you know",
  "have you ever", "have you heard", "have you seen", "have you tried",
  "what is the best", "what is the difference", "what are the",
  "what is your", "what are your", "what was the", "what were the",
  "how do i", "how do you", "how do we", "how does it", "how does the",
  "how did you", "how did the", "how can i", "how can we", "how can you",
  "how could i", "how could we", "how would i", "how would you",
  "how is the", "how is it", "how are the", "how are you",
  "how was the", "how was it", "how long does", "how long did",
  "how many", "how much", "how often", "how far",
  "where do i", "where do you", "where does", "where did",
  "where is the", "where is it", "where are the", "where can i",
  "when do i", "when do you", "when does", "when did",
  "when is the", "when is it", "when are", "when was", "when will",
  "why do i", "why do you", "why does", "why did",
  "why is the", "why is it", "why are", "why was", "why would",
  "who is the", "who is it", "who are the", "who are you",
  "who was the", "who did", "who does", "who can", "who will",
  "is there a", "is there any", "is it possible", "is it true",
  "is this the", "is that the", "is that a", "is it a",
  "are there any", "are there", "are you", "are we", "are they",
  "was there", "was it", "was that", "were there", "were you",
  "did you", "did the", "did it", "did we", "did they",
  "does it", "does the", "does this", "does that",
  "do you", "do we", "do they", "do i",
  "can i", "can you", "can we", "can they",
  "could i", "could you", "could we",
  "should i", "should you", "should we", "should the",
  "will it", "will the", "will you", "will we",
  "would it", "would you", "would the",
  "has it", "has the", "has anyone", "has there",
  "have you", "have we", "have they",
  "tell me about", "tell me how", "tell me what", "tell me why", "tell me",
  "explain how", "explain what", "explain why", "explain the", "explain",
  "describe how", "describe what", "describe the", "describe your", "describe",
  "walk me through", "talk me through", "give me an example",
  "what's the", "what's your", "what's a", "what's it", "what's",
  "who's the", "who's", "where's the", "where's", "when's", "how's the", "how's",
  "how to", "what about", "what if", "what else",
  "who", "what", "where", "when", "why", "how",
  "is", "are", "was", "were", "do", "does", "did",
  "can", "could", "would", "should", "will", "shall",
  "has", "have", "had", "which", "whom",
];

function splitSentences(text) {
  return text
    .replace(/([.?!])\s+/g, "$1\n")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function extractQuestion(text) {
  const raw = text.trim();
  const t = raw.toLowerCase().replace(/[?.!,;:]+$/g, "").trim();
  const words = t.split(/\s+/);

  if (words.length < 3) return null;
  if (SKIP.has(t)) return null;
  if (raw.endsWith("?")) return raw;

  for (const starter of Q_STARTERS) {
    if (t.startsWith(starter + " ") || t === starter) return raw;
  }

  for (const starter of Q_STARTERS) {
    const idx = t.indexOf(" " + starter + " ");
    if (idx !== -1) {
      const extracted = raw.slice(idx + 1).trim();
      const eWords = extracted.split(/\s+/);
      if (eWords.length >= 3) return extracted;
    }
  }

  return null;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { extractQuestion, splitSentences, Q_STARTERS, SKIP };
}
