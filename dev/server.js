require("dotenv").config();
const express = require("express");
const https = require("https");
const http = require("http");
const path = require("path");
const fs = require("fs");
const WebSocket = require("ws");

const { DESIGN_REFERENCES, PATTERNS, KEY_TECHNOLOGIES, ADVANCED_TOPICS, DESIGN_PATTERN_TAGS, ENVELOPE_MATH } = require("./designs");
const { CODING_PATTERNS, COMPLEXITY_REFERENCE, COMMON_GOTCHAS } = require("./coding-patterns");
const behavioralBase = require("./behavioral-stories");

// ============ INTERVIEW PROFILE ============
// Selects which story bank the behavioral copilot serves. "ebay" merges the
// eBay-targeted stories in and retires the Mastercard-flavored duplicates so
// the matcher never serves a wrong-company narrative live.
// Override with INTERVIEW_PROFILE=base to get the original bank back.
const INTERVIEW_PROFILE = process.env.INTERVIEW_PROFILE || "ebay";
let { SIGNALS, CATEGORIES, QUESTION_TYPES, STORIES, QUESTION_KEYWORDS, FRAMEWORKS, FRAMEWORK_KEYWORDS } = behavioralBase;
if (INTERVIEW_PROFILE === "ebay") {
  const ebay = require("./ebay-stories");
  const liveStories = ebay.EBAY_STORIES.filter(s => !s.draft);
  // Retire all Mastercard-targeted content: the eBay-superseded stories, the
  // Mastercard tech-screen cards (ts-*/tsp*), and the orphaned payments type.
  const isMastercard = id => id.startsWith("ts-") || id.startsWith("tsp") || id === "screen-payments-domain";
  const dropped = STORIES.filter(s => isMastercard(s.id) || ebay.EBAY_REPLACES.includes(s.id)).length;
  STORIES = [...STORIES.filter(s => !isMastercard(s.id) && !ebay.EBAY_REPLACES.includes(s.id)), ...liveStories];
  QUESTION_TYPES = Object.fromEntries(Object.entries({ ...QUESTION_TYPES, ...ebay.EBAY_QUESTION_TYPES }).filter(([k]) => !isMastercard(k)));
  QUESTION_KEYWORDS = Object.fromEntries(Object.entries({ ...QUESTION_KEYWORDS, ...ebay.EBAY_QUESTION_KEYWORDS }).filter(([k]) => !isMastercard(k)));
  CATEGORIES = Object.fromEntries(
    Object.entries({ ...CATEGORIES, ...ebay.EBAY_CATEGORIES })
      .filter(([k]) => !["tech-screen", "tech-screen-bridge", "tech-screen-pillars"].includes(k))
      .map(([k, c]) => [k, { ...c, questionTypes: c.questionTypes.filter(qt => QUESTION_TYPES[qt]) }])
  );
  FRAMEWORKS = FRAMEWORKS.map(f => ebay.ID_ALIASES[f.storyLink] ? { ...f, storyLink: ebay.ID_ALIASES[f.storyLink] } : f);
  console.log(`[PROFILE] ebay — ${liveStories.length} eBay stories in, ${dropped} Mastercard-era entries retired (${STORIES.length} total)`);
}

// ============ INTERVIEW DOMAIN FOCUS ============
// Each interview has a focus (data vs infra). Scope the LIVE bank to that focus
// so off-domain technical stories (e.g. infra stories during a data interview)
// never surface. "general" (management/behavioral) and "screen" (narratives) are
// universal — they apply to every interview. Override with INTERVIEW_DOMAIN=infra,
// or =all to disable scoping.
const INTERVIEW_DOMAIN = process.env.INTERVIEW_DOMAIN || (INTERVIEW_PROFILE === "ebay" ? "data" : "all");
if (INTERVIEW_DOMAIN !== "all") {
  const universal = new Set(["general", "screen"]);
  const inFocus = s => (s.domains || []).some(d => d === INTERVIEW_DOMAIN || universal.has(d));
  const before = STORIES.length;
  const droppedStories = STORIES.filter(s => !inFocus(s)).map(s => s.id);
  STORIES = STORIES.filter(inFocus);
  // Drop question types / keywords / categories that no longer have a backing
  // story so the classifier never offers a type it can't fulfil. Frameworks stay
  // (philosophy answers); a dangling storyLink is handled gracefully downstream.
  const liveTypes = new Set(STORIES.flatMap(s => s.questionTypes || []));
  QUESTION_TYPES = Object.fromEntries(Object.entries(QUESTION_TYPES).filter(([k, q]) => liveTypes.has(k) || q.isFramework));
  QUESTION_KEYWORDS = Object.fromEntries(Object.entries(QUESTION_KEYWORDS).filter(([k]) => QUESTION_TYPES[k]));
  CATEGORIES = Object.fromEntries(
    Object.entries(CATEGORIES)
      .map(([k, c]) => [k, { ...c, questionTypes: c.questionTypes.filter(qt => QUESTION_TYPES[qt]) }])
      .filter(([, c]) => c.questionTypes.length)
  );
  console.log(`[DOMAIN] ${INTERVIEW_DOMAIN} focus — ${STORIES.length}/${before} stories in focus; dropped off-domain: ${droppedStories.join(", ") || "none"}`);
}

const LOG_FILE = path.join(__dirname, "session.log");

function findDesignReference(question) {
  if (!question) return null;
  const q = question.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;
  for (const [key, ref] of Object.entries(DESIGN_REFERENCES)) {
    for (const kw of ref.keywords) {
      if (q.includes(kw)) {
        const score = kw.length;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = { key, ...ref };
        }
      }
    }
  }
  if (bestMatch) log("DESIGN_REF", `matched "${question}" → ${bestMatch.key}`);
  return bestMatch;
}

function log(tag, msg) {
  const line = `[${new Date().toISOString()}] [${tag}] ${typeof msg === "string" ? msg : JSON.stringify(msg)}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + "\n");
}

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ANTHROPIC_API_KEY;
const GEMINI_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY || API_KEY === "sk-ant-your-key-here") {
  console.warn("\n  WARNING: No valid ANTHROPIC_API_KEY set.\n");
}
if (!GEMINI_KEY || GEMINI_KEY === "your-gemini-key-here") {
  console.warn("\n  WARNING: No valid GEMINI_API_KEY set. Classification will fall back to Claude.\n");
}

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/cert.pem", (req, res) => {
  const cp = path.join(__dirname, "cert.pem");
  if (fs.existsSync(cp)) {
    res.setHeader("Content-Type", "application/x-pem-file");
    res.setHeader("Content-Disposition", "attachment; filename=interview-coach.pem");
    res.sendFile(cp);
  } else {
    res.status(404).send("No certificate");
  }
});
app.get("/cert.cer", (req, res) => {
  const cp = path.join(__dirname, "cert.pem");
  if (fs.existsSync(cp)) {
    res.setHeader("Content-Type", "application/x-x509-ca-cert");
    res.setHeader("Content-Disposition", "attachment; filename=interview-coach.cer");
    res.sendFile(cp);
  } else {
    res.status(404).send("No certificate");
  }
});

// ============ SSE (Server-Sent Events) ============
const sseClients = new Set();

app.get("/api/events", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.write(":\n\n");
  sseClients.add(res);
  req.on("close", () => sseClients.delete(res));
});

function pushEvent(eventType, data) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    client.write(payload);
  }
}

// ============ CONVERSATION STATE ============
let conversationState = {
  questionsAsked: [],
  currentTopic: "",
  lastSpeakerRole: "unknown",
  phase: "not_started",
  topicsCovered: [],
  mainQuestion: "",
  lastSuggestionTime: 0,
  lastNextStepTime: 0,
  previousPhase: "not_started",
  flowCardsGenerated: [],
  requirements: {
    functional: [],
    non_functional: [],
    version: 0,
  },
};

const DESIGN_FLOW = [
  { step: "requirements", label: "Requirements (FR + NFR)", topics: ["functional requirements", "non-functional requirements", "capacity estimation"] },
  { step: "core_entities", label: "Core Entities / Data Model", topics: ["data model / schema", "database choice"] },
  { step: "api_and_data_flow", label: "API / Interface / Data Flow", topics: ["API design", "data flow"] },
  { step: "high_level_design", label: "High-Level Design", topics: ["high-level design", "scaling strategy"] },
  { step: "deep_dives", label: "Deep Dives", topics: ["trade-offs", "failure handling / edge cases"] },
];

const EXPECTED_TOPICS = DESIGN_FLOW.flatMap(s => s.topics);

function getCurrentFlowStep() {
  for (const step of DESIGN_FLOW) {
    const covered = step.topics.some(t => conversationState.topicsCovered.includes(t));
    if (!covered) return step;
  }
  return DESIGN_FLOW[DESIGN_FLOW.length - 1];
}

function getFlowProgress() {
  return DESIGN_FLOW.map(s => {
    const covered = s.topics.some(t => conversationState.topicsCovered.includes(t));
    return `${covered ? "✓" : "○"} ${s.label}`;
  }).join(" → ");
}

function resetState() {
  conversationState = {
    questionsAsked: [],
    currentTopic: "",
    lastSpeakerRole: "unknown",
    phase: "not_started",
    topicsCovered: [],
    mainQuestion: "",
    lastSuggestionTime: 0,
    lastNextStepTime: 0,
    previousPhase: "not_started",
    flowCardsGenerated: [],
    requirements: {
      functional: [],
      non_functional: [],
      version: 0,
    },
  };
}

function updateRequirements(reqUpdate) {
  if (!reqUpdate) return false;
  let changed = false;
  for (const fr of (reqUpdate.functional || [])) {
    const norm = fr.toLowerCase().trim();
    if (!conversationState.requirements.functional.some(
      e => e.toLowerCase().includes(norm) || norm.includes(e.toLowerCase())
    )) {
      conversationState.requirements.functional.push(fr);
      changed = true;
    }
  }
  for (const nfr of (reqUpdate.non_functional || [])) {
    const norm = nfr.toLowerCase().trim();
    if (!conversationState.requirements.non_functional.some(
      e => e.toLowerCase().includes(norm) || norm.includes(e.toLowerCase())
    )) {
      conversationState.requirements.non_functional.push(nfr);
      changed = true;
    }
  }
  if (changed) {
    conversationState.requirements.version++;
    pushEvent("requirements_update", conversationState.requirements);
    log("REQUIREMENTS", `updated (v${conversationState.requirements.version}): ${conversationState.requirements.functional.length} FR, ${conversationState.requirements.non_functional.length} NFR`);
  }
  return changed;
}

function callClaude(messages, maxTokens) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens || 2000,
      messages,
    });

    const apiReq = https.request(
      {
        hostname: "api.anthropic.com",
        path: "/v1/messages",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
          "anthropic-version": "2023-06-01",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (apiRes) => {
        let data = "";
        apiRes.on("data", (c) => (data += c));
        apiRes.on("end", () => {
          try {
            const json = JSON.parse(data);
            if (json.error) return reject(new Error(json.error.message));
            const text = (json.content || []).map((c) => c.text || "").join("\n");
            resolve(text);
          } catch (e) {
            reject(new Error("Failed to parse API response"));
          }
        });
      }
    );
    apiReq.on("error", reject);
    apiReq.write(payload);
    apiReq.end();
  });
}

function callGemini(prompt, maxTokens) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: maxTokens || 1000,
        temperature: 0.0,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const url = new URL(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${GEMINI_KEY}`
    );

    const apiReq = https.request(
      {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (apiRes) => {
        let data = "";
        apiRes.on("data", (c) => (data += c));
        apiRes.on("end", () => {
          try {
            const json = JSON.parse(data);
            if (json.error) return reject(new Error(json.error.message));
            const text = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
            resolve(text);
          } catch (e) {
            reject(new Error("Failed to parse Gemini response"));
          }
        });
      }
    );
    apiReq.on("error", reject);
    apiReq.write(payload);
    apiReq.end();
  });
}

// Streams a Claude completion over SSE. Hardened: logs every failure, and on a
// TRANSIENT error (HTTP 429/500/502/503/529 or a mid-stream overloaded/api_error)
// auto-retries up to MAX_ATTEMPTS — but only while nothing has been streamed yet
// (headers are written lazily on first token, so a retry is invisible to the client).
function streamClaude(messages, maxTokens, res, attempt = 1) {
  const MAX_ATTEMPTS = 3;
  const RETRYABLE_HTTP = new Set([429, 500, 502, 503, 529]);
  let headersSent = false;
  let fullText = "";
  let aborted = false; // this attempt was handed to a retry — ignore its remaining events

  const ensureHeaders = () => {
    if (!headersSent) {
      res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });
      headersSent = true;
    }
  };
  const retry = (why) => {
    aborted = true;
    log("WARN", `streamClaude transient (attempt ${attempt}/${MAX_ATTEMPTS}): ${why} — retrying`);
    setTimeout(() => streamClaude(messages, maxTokens, res, attempt + 1), 500 * attempt);
  };
  const fail = (msg) => {
    ensureHeaders();
    res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true, fullText: "" })}\n\n`);
    res.end();
  };

  const payload = JSON.stringify({
    model: "claude-sonnet-4-6",
    max_tokens: maxTokens || 800,
    stream: true,
    messages,
  });

  const apiReq = https.request(
    {
      hostname: "api.anthropic.com",
      path: "/v1/messages",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Length": Buffer.byteLength(payload),
      },
    },
    (apiRes) => {
      let buffer = "";
      // Non-200 responses aren't SSE — capture the JSON error body so it can't fail silently.
      if (apiRes.statusCode !== 200) {
        let errBody = "";
        apiRes.on("data", (c) => (errBody += c));
        apiRes.on("end", () => {
          let msg = `Claude API ${apiRes.statusCode}`;
          try { msg = JSON.parse(errBody).error.message || msg; } catch (_) {}
          log("ERROR", `streamClaude ${apiRes.statusCode}: ${msg}`);
          if (attempt < MAX_ATTEMPTS && RETRYABLE_HTTP.has(apiRes.statusCode)) return retry(`HTTP ${apiRes.statusCode}`);
          fail(msg);
        });
        return;
      }
      apiRes.on("data", (chunk) => {
        if (aborted) return;
        buffer += chunk.toString();
        const lines = buffer.split("\n");
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const evt = JSON.parse(data);
            if (evt.type === "content_block_delta" && evt.delta && evt.delta.text) {
              ensureHeaders();
              fullText += evt.delta.text;
              res.write(`data: ${JSON.stringify({ text: evt.delta.text })}\n\n`);
            }
            if (evt.type === "error") {
              const em = (evt.error && evt.error.message) || "stream error";
              const et = (evt.error && evt.error.type) || "";
              log("ERROR", `streamClaude mid-stream ${et || "error"}: ${em}`);
              const transient = /overloaded|api_error|internal server|50\d|529/i.test(`${et} ${em}`);
              if (!fullText && attempt < MAX_ATTEMPTS && transient) return retry(`mid-stream ${et || em}`);
              ensureHeaders();
              res.write(`data: ${JSON.stringify({ error: em })}\n\n`);
            }
          } catch (_) {}
        }
      });
      apiRes.on("end", () => {
        if (aborted) return;
        ensureHeaders();
        res.write(`data: ${JSON.stringify({ done: true, fullText })}\n\n`);
        res.end();
      });
    }
  );
  apiReq.on("error", (e) => {
    if (aborted) return;
    log("ERROR", `streamClaude network error: ${e.message}`);
    if (!fullText && attempt < MAX_ATTEMPTS) return retry(`network ${e.message}`);
    fail(e.message);
  });
  // Watchdog: if Anthropic stalls (socket open, no data) for 12s, self-heal — retry if nothing has
  // streamed yet, otherwise close gracefully with the partial answer. Never hang the client.
  apiReq.setTimeout(12000, () => {
    if (aborted) return;
    apiReq.destroy();
    if (!fullText && attempt < MAX_ATTEMPTS) { log("WARN", `streamClaude idle stall — retrying (attempt ${attempt}/${MAX_ATTEMPTS})`); return retry("idle stall"); }
    log("ERROR", `streamClaude idle stall — closing with ${fullText.length} chars`);
    aborted = true;
    ensureHeaders();
    res.write(`data: ${JSON.stringify({ done: true, fullText })}\n\n`);
    res.end();
  });
  apiReq.write(payload);
  apiReq.end();
}

// Stream a pre-built answer over the same SSE contract the client expects — no LLM, instant.
function streamStatic(text, res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.write(`data: ${JSON.stringify({ text })}\n\n`);
  res.write(`data: ${JSON.stringify({ done: true, fullText: text })}\n\n`);
  res.end();
}

// Resolve the primary banked story for a detected questionType.
// Prefer the story for which this type is PRIMARY (first in its questionTypes), else any story listing it.
function primaryStoryFor(questionType) {
  if (!questionType) return null;
  return STORIES.find(s => (s.questionTypes || [])[0] === questionType)
      || STORIES.find(s => (s.questionTypes || []).includes(questionType))
      || null;
}

// Keep the live answer body to just the story header — the short CARL bullets render in the
// [STORY] refresher (buildCarlHtml on the client). This is a memory-jog card, not a script.
function buildInstantAnswer(story) {
  const angle = story.title.split("—")[0].replace(/\([^)]*\)/g, "").trim();
  return [
    `**${angle}**`,
    `[STORY:${story.id}]`,
  ].join("\n");
}

const HLD_TRANSITION_PATTERNS = /\b(high level design|start designing|draw.*(architecture|system|diagram)|let me (sketch|design|draw|start with the)|move on to (the )?(design|architecture)|now.*(design|architect))/i;
const WRAP_UP_PATTERNS = /\b(congratulations|how do you think it went|let me give you feedback|that's time|let's wrap up|interview is (over|done)|how are you feeling about)/i;

// ============ ANALYZE CONVERSATION ============
app.post("/api/analyze", async (req, res) => {
  const { recentSpeech, fullContext } = req.body;
  if (!recentSpeech) return res.status(400).json({ error: "No speech" });
  log("ANALYZE", `input (${recentSpeech.split(/\s+/).length} words): "${recentSpeech.slice(0, 150)}..."`);
  if (!API_KEY || API_KEY === "sk-ant-your-key-here") {
    return res.json({ action: "none" });
  }

  // Server-side phase transition detection (overrides model)
  let forcePhase = null;
  if (conversationState.phase === "clarification" && HLD_TRANSITION_PATTERNS.test(recentSpeech)) {
    forcePhase = "high_level_design";
    log("PHASE", `server-detected HLD transition from speech`);
  }
  if (WRAP_UP_PATTERNS.test(recentSpeech)) {
    forcePhase = "wrap_up";
    log("PHASE", `server-detected wrap_up from speech`);
  }

  const questionsHistory = conversationState.questionsAsked.length
    ? conversationState.questionsAsked.map((q, i) => `${i + 1}. "${q}"`).join("; ")
    : "none";

  // ---- Job 1: Fast Classifier ----
  const fastPrompt = `Classify this system design interview speech. Two speakers (interviewer + candidate) are mixed.

SPEECH: "${recentSpeech}"
CONTEXT (last 1500 chars): "${(fullContext || "").slice(-1500)}"

STATE: phase=${conversationState.phase}, main_question=${conversationState.mainQuestion || "none"}, topic=${conversationState.currentTopic || "none"}
QUESTIONS ASKED: ${questionsHistory}

HIGHEST PRIORITY: If main_question is "none" and the conversation is about a system or product being designed (features listed, requirements discussed, system name mentioned), you MUST return action:"question" with is_main_question:true and infer the design question (e.g. "Design an e-commerce website"). Do NOT return "answering" when no main question exists yet.

Classify into exactly ONE action:
- "question": Interviewer asks a NEW design problem, OR (if main_question is "none") a design topic is clearly being discussed — infer it.
- "follow_up": Interviewer probes deeper — "what about...", "why did you choose...", "how would you scale..."
- "design_challenge": Interviewer pushes back on a choice — "but why X over Y?", "have you considered Z?", "I'm not sure that works because..."
- "answering": Candidate explaining their design. ONLY use when main_question already exists.
- "struggling": Candidate stuck, going in circles, long silence.
- "none": Filler, small talk, acknowledgments, confirmations like "okay", "sounds good".

Phase (always include): clarification | entities | api_design | high_level_design | deep_dive | wrap_up
- Infer from CONTENT not just keywords. Discussing features/scope = clarification. Listing entities/fields = entities. Drawing components = high_level_design. Discussing specific component internals = deep_dive.

Topic: brief label of what's being discussed.

JSON only, no markdown:
{"action":"...","phase":"...","topic":"...","question":"only if action is question/follow_up/design_challenge","is_main_question":false,"speaker_intent":"one sentence"}`;

  try {
    let text;
    if (GEMINI_KEY && GEMINI_KEY !== "your-gemini-key-here") {
      try {
        text = await callGemini(fastPrompt, 200);
        log("ANALYZE", "fast-classified via Gemini");
      } catch (gErr) {
        log("WARN", `Gemini classify failed (${gErr.message}) — falling back to Claude`);
        text = await callClaude([{ role: "user", content: fastPrompt }], 200);
        log("ANALYZE", "fast-classified via Claude (Gemini fallback)");
      }
    } else {
      text = await callClaude([{ role: "user", content: fastPrompt }], 200);
    }

    const cleaned = text.trim().replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    let result;
    try {
      result = JSON.parse(cleaned);
    } catch (parseErr) {
      const jsonMatch = cleaned.match(/\{[\s\S]*?"action"\s*:\s*"[^"]+?"[\s\S]*?\}/);
      if (jsonMatch) {
        try {
          result = JSON.parse(jsonMatch[0]);
          log("ANALYZE", `recovered JSON from mixed response`);
        } catch (_) {
          log("ERROR", `fast classify parse failed: "${cleaned.slice(0, 200)}..."`);
          result = { action: "none" };
        }
      } else {
        log("ERROR", `fast classify parse failed: "${cleaned.slice(0, 200)}..."`);
        result = { action: "none" };
      }
    }

    // Normalize action names for backward compatibility
    if (result.action === "answering") result.action = "candidate_answering";
    if (result.action === "struggling") result.action = "candidate_struggling";
    if (result.action === "question") result.action = "new_question";

    // Map new phase names to existing ones
    if (result.phase === "entities") result.phase = "clarification";
    if (result.phase === "api_design") result.phase = "clarification";

    log("ANALYZE", `result: ${result.action}${result.question ? ` → "${result.question}"` : ""}${result.hint ? ` → hint: "${result.hint}"` : ""}${result.warning ? ` → pitfall: "${result.warning}"` : ""}${result.missing_topic ? ` → gap: "${result.missing_topic}"` : ""}`);

    if (result.topic) {
      conversationState.currentTopic = result.topic;
    }
    const effectivePhase = forcePhase || result.phase;
    if (effectivePhase) {
      if (effectivePhase !== conversationState.phase) {
        log("PHASE", `${conversationState.phase} → ${effectivePhase}${forcePhase ? " (server-forced)" : ""}`);
        conversationState.previousPhase = conversationState.phase;
        pushEvent("phase_change", {
          phase: effectivePhase,
          previousPhase: conversationState.previousPhase,
        });
      }
      conversationState.phase = effectivePhase;
      result.phase = effectivePhase;
    }

    // Auto-generate flow step card when candidate enters a new step
    // Skip "requirements" — already covered by the FR/NFR card on main question detection
    // Detect from topics_covered OR from topic text matching flow step keywords
    if (conversationState.mainQuestion && effectivePhase !== "clarification" && effectivePhase !== "not_started") {
      const FLOW_KEYWORDS = {
        core_entities: /\b(entit(y|ies)|data model|schema|tables?\b|database|fields|columns)/i,
        api_and_data_flow: /\b(apis?\b|endpoints?|interface|data flow|rest api|requests?\b|responses?\b)/i,
        deep_dives: /\b(deep dive|go deeper|scaling|bottleneck|failure|edge case)/i,
      };

      for (const flowStep of DESIGN_FLOW) {
        if (flowStep.step === "requirements") continue;
        if (conversationState.flowCardsGenerated.includes(flowStep.step)) continue;
        const alreadyCovered = flowStep.topics.some(t => conversationState.topicsCovered.includes(t));
        if (alreadyCovered) continue;

        let triggered = false;
        // Check from topics_covered in response
        if (result.topics_covered && Array.isArray(result.topics_covered)) {
          triggered = result.topics_covered.some(t => flowStep.topics.includes(t));
        }
        // Check from speech keywords
        if (!triggered && FLOW_KEYWORDS[flowStep.step] && FLOW_KEYWORDS[flowStep.step].test(recentSpeech)) {
          triggered = true;
        }

        if (triggered) {
          conversationState.flowCardsGenerated.push(flowStep.step);
          flowStep.topics.forEach(t => {
            if (!conversationState.topicsCovered.includes(t)) {
              conversationState.topicsCovered.push(t);
            }
          });
          result._triggerFlowCard = flowStep.step;
          result._flowCardLabel = flowStep.label;
          log("FLOW", `auto-generating card for step: ${flowStep.label}`);
          break;
        }
      }
    }
    // Also trigger on phase transition to high_level_design
    if (
      conversationState.phase !== "high_level_design" &&
      (forcePhase === "high_level_design" || result.phase === "high_level_design") &&
      !conversationState.flowCardsGenerated.includes("high_level_design") &&
      conversationState.mainQuestion
    ) {
      conversationState.flowCardsGenerated.push("high_level_design");
      const hldStep = DESIGN_FLOW.find(s => s.step === "high_level_design");
      if (hldStep) {
        hldStep.topics.forEach(t => {
          if (!conversationState.topicsCovered.includes(t)) {
            conversationState.topicsCovered.push(t);
          }
        });
      }
      result._triggerFlowCard = "high_level_design";
      result._flowCardLabel = "High-Level Design";
      log("FLOW", `auto-generating card for step: High-Level Design (phase transition)`);
    }
    if (result.is_main_question) {
      if (result.question) {
        if (conversationState.mainQuestion) {
          log("REPLACE", `main question: "${conversationState.mainQuestion}" → "${result.question}"`);
          conversationState.topicsCovered = [];
          conversationState.flowCardsGenerated = [];
        }
        conversationState.mainQuestion = result.question;
      } else if (result.topic && !conversationState.mainQuestion) {
        conversationState.mainQuestion = "Design " + result.topic.replace(/system design|design|clarification/gi, "").trim();
        result.action = "new_question";
        result.question = conversationState.mainQuestion;
        log("INFER", `inferred main question from topic: "${conversationState.mainQuestion}"`);
      }
    }
    if (result.topics_covered && Array.isArray(result.topics_covered)) {
      for (const t of result.topics_covered) {
        if (!conversationState.topicsCovered.includes(t)) {
          conversationState.topicsCovered.push(t);
          log("TOPICS", `covered: ${t}`);
        }
      }
    }

    // Rate-limit suggestions — max once per 2 minutes
    const now = Date.now();
    if (result.suggestion) {
      if (now - conversationState.lastSuggestionTime < 120000) {
        log("RATE", `suggestion suppressed (${Math.round((now - conversationState.lastSuggestionTime) / 1000)}s since last)`);
        delete result.suggestion;
      } else {
        conversationState.lastSuggestionTime = now;
      }
    }

    // Rate-limit next_step nudges — max once per 3 minutes
    if (result.next_step) {
      if (now - conversationState.lastNextStepTime < 180000) {
        log("RATE", `next_step suppressed (${Math.round((now - conversationState.lastNextStepTime) / 1000)}s since last)`);
        delete result.next_step;
      } else {
        conversationState.lastNextStepTime = now;
      }
    }

    // Deduplicate questions — but skip dedup for is_main_question (it's establishing the question)
    if ((result.action === "new_question" || result.action === "follow_up") && result.question) {
      if (result.is_main_question) {
        if (!conversationState.questionsAsked.includes(result.question)) {
          conversationState.questionsAsked.push(result.question);
        }
      } else {
        const newQ = result.question.toLowerCase().replace(/[?.!,;:'"]/g, "").trim();
        const newWords = new Set(newQ.split(/\s+/));
        let isDuplicate = false;

        const checkAgainst = [...conversationState.questionsAsked];
        if (conversationState.mainQuestion) checkAgainst.push(conversationState.mainQuestion);

        for (const existing of checkAgainst) {
          const existQ = existing.toLowerCase().replace(/[?.!,;:'"]/g, "").trim();
          const existWords = new Set(existQ.split(/\s+/));
          const overlap = [...newWords].filter(w => existWords.has(w) && w.length > 3);
          const similarity = overlap.length / Math.max(newWords.size, existWords.size);
          if (similarity > 0.6) {
            isDuplicate = true;
            log("DEDUP", `"${result.question.slice(0, 60)}..." too similar to existing "${existing.slice(0, 60)}..." (${(similarity * 100).toFixed(0)}%)`);
            break;
          }
        }

        if (isDuplicate) {
          result.action = "none";
          delete result.question;
        } else {
          conversationState.questionsAsked.push(result.question);
        }
      }
    }

    res.json(result);

    // ---- Job 2: Content Analyzer (async, non-blocking) ----
    const phaseChanged = effectivePhase && effectivePhase !== conversationState.previousPhase;
    const needsContent = result.action === "new_question"
      || result.action === "follow_up"
      || result.action === "design_challenge"
      || result.action === "candidate_struggling"
      || phaseChanged
      || conversationState.phase === "clarification";

    if (needsContent) {
      const contentPrompt = `Analyze this system design interview segment for requirements, suggestions, and pitfalls.

SPEECH: "${recentSpeech}"
CONTEXT (last 2000 chars): "${(fullContext || "").slice(-2000)}"

MAIN QUESTION: ${conversationState.mainQuestion || "not yet established — extract requirements from what's being discussed"}
PHASE: ${conversationState.phase}
CURRENT TOPIC: ${conversationState.currentTopic || "unknown"}

EXISTING REQUIREMENTS:
- Functional: ${JSON.stringify(conversationState.requirements.functional)}
- Non-functional: ${JSON.stringify(conversationState.requirements.non_functional)}

TOPICS COVERED: ${conversationState.topicsCovered.join(", ") || "none"}

Extract ONLY what is NEW (not already in existing requirements):

1. requirements_update: New functional or non-functional requirements mentioned or implied.
2. suggestion: ONE contextual suggestion about what is being discussed RIGHT NOW. Must reference the current topic. Leave empty string if nothing specific.
3. pitfall: ONLY flag a pitfall if the candidate proposed something that will CLEARLY BREAK the system — single point of failure, data loss, race condition, security hole. Vague statements, unclear wording, or minor gaps are NOT pitfalls. Most segments should have empty string here. Max 15 words if set.
4. topics_covered: Which of these topics were discussed: ${EXPECTED_TOPICS.join(", ")}

JSON only:
{"requirements_update":{"functional":[],"non_functional":[]},"suggestion":"","pitfall":"","topics_covered":[]}`;

      callGemini(contentPrompt, 500).then(contentText => {
        try {
          const cCleaned = contentText.trim().replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          const content = JSON.parse(cCleaned);
          log("CONTENT", `analyzed: ${JSON.stringify(content).slice(0, 200)}`);

          if (content.requirements_update) {
            updateRequirements(content.requirements_update);
          }
          if (content.suggestion) {
            const now = Date.now();
            if (now - conversationState.lastSuggestionTime >= 120000) {
              conversationState.lastSuggestionTime = now;
              pushEvent("suggestion", { text: content.suggestion, topic: conversationState.currentTopic });
              log("SUGGESTION", content.suggestion);
            }
          }
          if (content.pitfall) {
            const now2 = Date.now();
            const lastPitfall = conversationState.lastPitfallTime || 0;
            if (now2 - lastPitfall >= 180000) {
              conversationState.lastPitfallTime = now2;
              pushEvent("pitfall", { warning: content.pitfall, topic: conversationState.currentTopic });
              log("PITFALL", content.pitfall);
            } else {
              log("RATE", `pitfall suppressed (${Math.round((now2 - lastPitfall) / 1000)}s since last)`);
            }
          }
          if (content.topics_covered && Array.isArray(content.topics_covered)) {
            for (const t of content.topics_covered) {
              if (!conversationState.topicsCovered.includes(t)) {
                conversationState.topicsCovered.push(t);
                log("TOPICS", `covered: ${t}`);
              }
            }
          }
        } catch (ce) {
          log("ERROR", `content analyze parse failed: ${ce.message}`);
        }
      }).catch(ce => {
        log("ERROR", `content analyze failed: ${ce.message}`);
      });
    }

  } catch (e) {
    log("ERROR", `analyze: ${e.message}`);
    res.json({ action: "none", error: e.message });
  }
});

// ============ ANSWER ============
app.post("/api/answer", async (req, res) => {
  const { question, context, type } = req.body;
  if (!question) return res.status(400).json({ error: "No question" });
  if (!API_KEY || API_KEY === "sk-ant-your-key-here") {
    return res.json({ answer: "Add your ANTHROPIC_API_KEY to .env" });
  }

  const isFollowUp = type === "follow_up";
  const isHint = type === "hint";
  const isPitfall = type === "pitfall";
  const isTopicGap = type === "topic_gap";
  const isHLD = type === "hld";
  const isDesignChallenge = type === "design_challenge";
  const currentPhase = conversationState.phase;
  const isClarification = currentPhase === "clarification" && type === "new" && !req.body.isMainQuestion;
  const isClarificationFollowUp = currentPhase === "clarification" && type === "follow_up";
  const isWrapUp = currentPhase === "wrap_up";

  const flowStep = req.body.flowStep;

  const FLOW_PROMPTS = {
    core_entities: `System design interview coach. Quick-reference card for core entities.

Main question: "${question}"
Context: "${(context || "").slice(-2000)}"

Format — scannable, not a textbook:
**Entities:**
- **EntityName** — key fields: field1, field2, field3
(3-5 entities, one line each)

**Storage:** SQL vs NoSQL — 1 sentence why

Then output an ER diagram:
\`\`\`mermaid
erDiagram
  User ||--o{ Review : writes
  Business ||--o{ Review : has
  ...
\`\`\`
Rules: use erDiagram format, show relationships, keep to 3-5 entities, label relationships with verbs, NO special characters in labels`,

    api_and_data_flow: `System design interview coach. Quick-reference card for APIs.

Main question: "${question}"
Context: "${(context || "").slice(-2000)}"

Format — scannable:
**Endpoints:**
- \`METHOD /path\` → what it returns (key params)
(3-5 endpoints, one line each)

**Notes:** 1-2 lines on pagination, auth, or rate limiting if relevant

Then output a sequence diagram showing the main read and write flows:
\`\`\`mermaid
sequenceDiagram
  Client->>API Gateway: GET /search
  API Gateway->>Service: query
  Service->>DB: lookup
  DB-->>Client: results
\`\`\`
Rules: use sequenceDiagram format, show the main read AND write paths, keep to 6-10 interactions max, NO special characters`,

    high_level_design: `System design interview coach. Architecture overview card.

Main question: "${question}"
Context: "${(context || "").slice(-2000)}"
Topics covered: ${conversationState.topicsCovered.join(", ") || "none"}

Format — scannable:
**Components:**
- Component → what it does (tech choice)
(4-6 components, one line each)

**Data Flow:**
- Write: Client → ... → Storage
- Read: Client → ... → Response

**Key Decisions:** 2-3 bullet points

Then output the architecture diagram:
\`\`\`mermaid
graph LR
  Client[Client] --> GW[API Gateway]
  GW --> Svc[Service]
  Svc --> DB[(Database)]
  ...
\`\`\`
Rules for diagram:
- graph LR (left to right)
- 6-10 nodes max, specific names not generic
- [] for services, [()] for databases
- NO semicolons, NO special characters in labels`,

    deep_dives: `System design interview coach. Deep dive reference card — the candidate needs quick visual reminders, not essays.

Main question: "${question}"
Context: "${(context || "").slice(-2000)}"
Topics covered: ${conversationState.topicsCovered.join(", ") || "none"}

For EACH deep dive area (3-4 areas), output:
**Area Name**
- Key insight in 1 sentence
- Solution approach in 1-2 sentences
- A Mermaid diagram showing the flow/architecture for this specific area

Example format:
**Scaling Reads**
- Problem: 20K QPS on single DB
- Solution: Redis cache + read replicas + Elasticsearch
\`\`\`mermaid
graph LR
  Client --> Cache{{Redis}}
  Cache -->|miss| Replica[(Read Replica)]
  Write[Write Path] --> Leader[(Leader DB)]
  Leader -->|CDC| ES[(Elasticsearch)]
\`\`\`

Rules:
- 3-4 deep dive areas, each with its own Mermaid diagram
- Keep text minimal — the diagram IS the explanation
- Use graph LR, sequenceDiagram, or flowchart as appropriate for each area
- NO semicolons, NO special characters in labels
- Each diagram should be 4-8 nodes max`,
  };

  const designRef = findDesignReference(conversationState.mainQuestion || question);

  // Phase-aware: suppress or minimize responses based on interview phase
  if (isWrapUp) {
    log("ANSWER", `[wrap_up] suppressing answer — interview wrapping up`);
    res.setHeader("Content-Type", "text/event-stream");
    res.write(`data: ${JSON.stringify({ text: "*(Interview wrapping up — coach paused)*" })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    return res.end();
  }

  let prompt;
  if (isClarificationFollowUp) {
    prompt = `System design interview coach. The candidate is in the CLARIFICATION phase — the interviewer just asked a follow-up or probing question, but we're still in scope/requirements discussion. Keep the answer minimal — the candidate should be driving this conversation, not reading long answers.

Question: "${question}"
Main question: ${conversationState.mainQuestion || "not yet established"}
Context: "${(context || "").slice(-1000)}"

Format (under 30 words):
**Quick note:** 1 sentence — the key thing to keep in mind when answering this. No full design, no architecture.`;
  } else if (flowStep && FLOW_PROMPTS[flowStep]) {
    prompt = FLOW_PROMPTS[flowStep];
    if (designRef) {
      let refContext = "";
      if (flowStep === "core_entities" && designRef.entities) {
        refContext = "\n\nREFERENCE (use as grounding, adapt to conversation):\n" +
          designRef.entities.map(e => `- ${e.name}: ${e.desc}`).join("\n");
        if (designRef.apis) refContext += "\nRelated APIs: " + designRef.apis.slice(0, 3).join("; ");
      } else if (flowStep === "api_and_data_flow" && designRef.apis) {
        refContext = "\n\nREFERENCE (use as grounding, adapt to conversation):\n" +
          designRef.apis.join("\n");
      } else if (flowStep === "high_level_design" && designRef.hld) {
        refContext = "\n\nREFERENCE (use as grounding, adapt to conversation):\nComponents: " +
          designRef.hld.components.join("; ") +
          "\n\nUse this Mermaid diagram as a starting point (adapt based on conversation):\n```mermaid\n" +
          designRef.hld.diagram + "\n```";
      } else if (flowStep === "deep_dives" && designRef.deepDives) {
        refContext = "\n\nREFERENCE (use these areas and their diagrams as grounding):\n" +
          designRef.deepDives.map(d => {
            let entry = `- **${d.topic}**: ${d.details}`;
            if (d.diagram) entry += `\nDiagram:\n\`\`\`mermaid\n${d.diagram}\n\`\`\``;
            return entry;
          }).join("\n\n");
      }
      if (refContext) {
        prompt += refContext;
        log("DESIGN_REF", `injecting ${flowStep} reference for ${designRef.key}`);
      }
    }
  } else if (isPitfall) {
    prompt = `System design interview coach. The candidate just made a design choice with a potential weakness. Give a brief, specific warning they can glance at.

Pitfall: ${question}
Topic: ${conversationState.currentTopic || "system design"}
Context: "${(context || "").slice(-1000)}"

Format (under 30 words, like a PowerPoint bullet):
**Watch out:** 1 short sentence — the risk
**Instead:** 1 bullet — the fix`;
  } else if (isDesignChallenge) {
    prompt = `System design interview coach. The interviewer is pushing back on a design choice. Help the candidate respond confidently.

Challenge: "${question}"
Topic: ${conversationState.currentTopic || "system design"}
Main question: ${conversationState.mainQuestion || "system design"}
Context: "${(context || "").slice(-1500)}"

Format (under 40 words, like a PowerPoint slide):
**Tradeoff:** 1 sentence
**Say this:** 1 sentence the candidate can say out loud
- 2 bullet points max with key arguments`;
  } else if (isTopicGap) {
    prompt = `System design interview coach. The candidate hasn't covered an important topic yet. Give a brief nudge.

Missing topic: ${question}
Main question: ${conversationState.mainQuestion || "system design"}
Topics already covered: ${conversationState.topicsCovered.join(", ") || "none"}
Context: "${(context || "").slice(-1000)}"

Format (under 50 words):
**Don't forget:** 1 sentence on why this topic matters for this specific problem
- 2-3 quick talking points to cover it`;
  } else if (isHint) {
    prompt = `System design interview coach. Candidate is stuck.

Situation: ${question}
Topic: ${conversationState.currentTopic || "system design"}
Context: "${(context || "").slice(-1000)}"

Give 2-3 SHORT nudges. Under 60 words total. Format:
**Consider:**
- Hint 1
- Hint 2
- Hint 3`;
  } else if (isClarification) {
    prompt = `System design interview coach. The candidate is in the CLARIFICATION phase — asking scope questions before designing. This is a clarification question, NOT the main design question. Keep the answer very brief.

Question: "${question}"
Main question: ${conversationState.mainQuestion || "not yet established"}
Context: "${(context || "").slice(-1000)}"

Format (under 40 words):
**Good to clarify.** 1 sentence on why this matters for the design, and what assumption to make if interviewer doesn't specify.`;
  } else if (isFollowUp) {
    const isDeepDive = currentPhase === "deep_dive";
    prompt = `System design interview coach. Follow-up question in a live interview — answer must be scannable in seconds.

Question: "${question}"
Topic: ${conversationState.currentTopic || "system design"}
Phase: ${currentPhase}
Context: "${(context || "").slice(-1000)}"

${isDeepDive ?
`Format (keep under 150 words — deep dive phase, more detail expected):
**Key point**: 1-2 sentences
**Details**:
- Point 1
  · specific implementation detail
  · numbers/configs if relevant
- Point 2
  · specific implementation detail
- Point 3
  · specific implementation detail
**Watch out**: one pitfall with mitigation` :
`Format (keep under 120 words):
**Key point**: 1-2 sentences
**Details**:
- Point 1
  · deep-dive detail if interviewer probes
- Point 2
  · deep-dive detail
- Point 3
  · deep-dive detail
**Watch out**: one pitfall`}`;
  } else if (req.body.isMainQuestion) {
    prompt = `System design interview coach. The main design question was just asked. Help the candidate start strong by listing the functional and non-functional requirements they should clarify/confirm with the interviewer.

Question: "${question}"
${context ? `Context: "${context.slice(-1000)}"` : ""}

Format (keep under 150 words):
**Functional Requirements:**
- 4-6 core features to confirm (e.g., "Upload short videos (max 60s)")
  · quick clarification question if relevant

**Non-Functional Requirements:**
- 3-4 NFRs with ballpark numbers (e.g., "Scale: ~500M DAU, read-heavy")
  · why it matters for design

Keep items specific to THIS system, not generic. Use realistic ballpark numbers. These are what the candidate should discuss with the interviewer before designing.`;
    if (designRef) {
      let frNfrRef = "\n\nREFERENCE (use as grounding):\nFR: " + designRef.fr.join("; ") +
        "\nNFR: " + designRef.nfr.join("; ");
      prompt += frNfrRef;
      log("DESIGN_REF", `injecting FR/NFR reference for ${designRef.key}`);
    }
  } else {
    const phaseInstructions = currentPhase === "clarification"
      ? `The interview is in CLARIFICATION phase. The candidate is still scoping. Keep your answer brief — under 80 words. Just the key insight, no full architecture.

Format:
**Key point**: 1-2 sentences
- 2-3 bullet points max`
      : currentPhase === "deep_dive"
      ? `The interview is in DEEP DIVE phase. The interviewer wants detailed, specific answers.

Format (keep under 180 words):
**Approach**: 1-2 sentences
**Details**:
- Point 1 with specific implementation
  · concrete numbers, configs, or trade-offs
- Point 2
  · concrete detail
- Point 3
  · concrete detail
**Watch out**: one pitfall with mitigation`
      : `Format (keep under 150 words):
**Approach**: 1-2 sentences
**Key Components**:
- Component: why
  · detail for deep-dive
- Component: why
  · detail for deep-dive
(3-5 components max)
**Trade-offs**:
- 2 trade-offs
**Go deeper**: one sentence`;

    prompt = `System design interview coach. New question in a live interview — answer must be scannable in seconds at a glance.

Question: "${question}"
Phase: ${currentPhase}
${context ? `Context: "${context.slice(-1000)}"` : ""}

${phaseInstructions}`;
  }

  log("ANSWER", `[${type || "new"}] streaming for "${question.slice(0, 80)}..."`);
  streamClaude([{ role: "user", content: prompt }], 800, res);
});

// ============ COACH (keyboard-triggered) ============
app.post("/api/coach", async (req, res) => {
  const { key, depth, topic, latestQuestion, latestAnswer, context, recentSpeech } = req.body;
  if (!key) return res.status(400).json({ error: "No key" });
  if (!API_KEY || API_KEY === "sk-ant-your-key-here") {
    return res.json({ coach: "Add your ANTHROPIC_API_KEY to .env" });
  }

  const depthLabel = depth === 0 ? "brief" : depth === 1 ? "more detail" : "deep detail";
  const missingTopics = EXPECTED_TOPICS.filter(t => !conversationState.topicsCovered.includes(t));

  const prompts = {
    m: `The candidate pressed M for MORE DETAIL. Give ${depthLabel} on the current topic.

Current topic: ${topic || "system design"}
Latest question: "${latestQuestion || "none"}"
Latest answer given: "${(latestAnswer || "").slice(0, 500)}"
What candidate is saying: "${(recentSpeech || "").slice(-500)}"

${depth === 0 ? "Give 3-4 additional talking points they haven't covered yet. Under 80 words." :
  depth === 1 ? "Go deeper — specific implementation details, numbers, concrete examples. Under 120 words." :
  "Expert-level detail — specific algorithms, data structures, exact configurations. Under 150 words."}

Format as bullet points. No headers. Just the points.`,

    h: `The candidate pressed H for HINT — they need a nudge on what to say next.

Current topic: ${topic || "system design"}
Main question: ${conversationState.mainQuestion || "not set"}
What candidate just said: "${(recentSpeech || context || "").slice(-800)}"

Give ONE clear sentence telling them what to say next, then 2 bullet points as talking points. Under 50 words total.`,

    t: `The candidate pressed T for TRADE-OFFS on their current approach.

Current topic: ${topic || "system design"}
What candidate is proposing: "${(recentSpeech || "").slice(-500)}"
Context: "${(context || "").slice(-500)}"

List 2-3 trade-offs for what they just proposed. Format:
- **Choice**: pro vs con
Keep under 80 words. Mention what alternatives exist.`,

    n: `__FLOW_CARD__`,

    e: `The candidate pressed E for ESTIMATE — help with back-of-envelope math.

Current topic: ${topic || "system design"}
Main question: ${conversationState.mainQuestion || "system design"}
What candidate is saying: "${(recentSpeech || context || "").slice(-800)}"

${depth === 0 ? "Identify what numbers they should estimate and set up the calculation chain. Use ROUND numbers only (powers of 10, easy multiples). Show the chain: e.g. 50M users × 10 req/day = 500M/day ÷ 100k sec/day ≈ 5k QPS." :
  "Continue the estimation with more metrics: storage, bandwidth, memory, number of servers. All ballpark with round numbers."}

Under 100 words. Format as a calculation chain, not paragraphs.`,
  };

  const prompt = prompts[key];
  if (!prompt) return res.json({ coach: "Unknown key" });

  if (prompt === "__FLOW_CARD__") {
    const nextStep = getCurrentFlowStep();
    if (!conversationState.flowCardsGenerated.includes(nextStep.step)) {
      conversationState.flowCardsGenerated.push(nextStep.step);
    }
    nextStep.topics.forEach(t => {
      if (!conversationState.topicsCovered.includes(t)) {
        conversationState.topicsCovered.push(t);
      }
    });
    log("COACH", `[n] advancing flow → ${nextStep.label}`);
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.write(`data: ${JSON.stringify({ flowCard: true, flowStep: nextStep.step, flowLabel: nextStep.label })}\n\n`);
    res.write("data: [DONE]\n\n");
    return res.end();
  }

  log("COACH", `[${key}] depth=${depth} streaming...`);
  streamClaude([{ role: "user", content: prompt }], 500, res);
});

// ============ CODING INTERVIEW STATE ============
let codingState = {
  problem: "",
  pattern: "",
  currentLevel: 0,
  questionsAsked: [],
  lastHintTime: 0,
};

function resetCodingState() {
  codingState = {
    problem: "",
    pattern: "",
    currentLevel: 0,
    questionsAsked: [],
    lastHintTime: 0,
  };
}

function findCodingPattern(speech) {
  if (!speech) return null;
  const s = speech.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;
  for (const [key, pat] of Object.entries(CODING_PATTERNS)) {
    for (const kw of pat.keywords) {
      if (s.includes(kw)) {
        const score = kw.length;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = { key, ...pat };
        }
      }
    }
  }
  if (bestMatch) log("CODING_PATTERN", `matched → ${bestMatch.key} (score: ${bestScore})`);
  return bestMatch;
}

const OPTIMIZE_PATTERNS = /\b(can you do better|optimize|improve|faster|more efficient|better (time|space)|reduce|O of n|linear|what.s the (best|optimal)|there.s a better way|can we do this in|too slow|time limit|TLE)\b/i;

// ============ CODING ANALYZE ============
app.post("/api/coding/analyze", async (req, res) => {
  const { recentSpeech, fullContext, currentPattern, currentLevel, problemDetected } = req.body;
  if (!recentSpeech) return res.status(400).json({ error: "No speech" });
  log("CODING_ANALYZE", `input (${recentSpeech.split(/\s+/).length} words): "${recentSpeech.slice(0, 150)}..."`);

  if (!API_KEY || API_KEY === "sk-ant-your-key-here") {
    return res.json({ action: "none" });
  }

  // Server-side optimize detection
  if (currentPattern && OPTIMIZE_PATTERNS.test(recentSpeech)) {
    const pat = CODING_PATTERNS[currentPattern];
    if (pat && currentLevel < pat.levels.length - 1) {
      const nextLevel = currentLevel + 1;
      log("CODING_OPTIMIZE", `server-detected optimize push → level ${nextLevel}`);
      codingState.currentLevel = nextLevel;
      return res.json({
        action: "optimize",
        problem: problemDetected || codingState.problem,
        pattern: currentPattern,
        level: nextLevel,
        totalLevels: pat.levels.length,
      });
    }
  }

  const patternList = Object.entries(CODING_PATTERNS).map(([key, p]) => `${key}: ${p.keywords.slice(0, 4).join(", ")}`).join("\n");

  const codingPrompt = `You are an AI coach analyzing a live coding interview. You hear INTERVIEWER and CANDIDATE mixed. Decide what action to take.

RECENT SPEECH:
"${recentSpeech}"

CONTEXT (last 3000 chars):
"${(fullContext || "").slice(-3000)}"

CURRENT STATE:
- Problem: ${codingState.problem || "not detected"}
- Pattern: ${codingState.pattern || "none"}
- Optimization level: ${codingState.currentLevel}
- Questions asked: ${codingState.questionsAsked.length ? codingState.questionsAsked.join("; ") : "none"}

KNOWN PATTERNS:
${patternList}

DETERMINE which ONE action applies:

1. **problem_detected** — Interviewer presents a coding problem. "Given an array...", "Write a function that...", "How would you solve...", "find the...", "return the...". Extract the problem statement.

2. **approach** — Candidate is starting to think about an approach or asking clarifying questions about the problem. Provide the pattern match if detected.

3. **optimize** — Interviewer pushes for better solution: "can you do better?", "what about time complexity?", "that's O(n²), can you improve?", "is there a faster way?"

4. **hint** — Candidate is stuck, silent for a while, going in circles, or explicitly says "I'm stuck" / "I don't know how to proceed"

5. **candidate_coding** — Candidate is actively writing/explaining code. No action needed.

6. **none** — Filler, small talk, not code-related

Respond in EXACTLY one of these JSON formats:
{"action": "problem_detected", "problem": "clear problem statement", "pattern": "matched-pattern-key or null"}
{"action": "approach", "problem": "current problem", "pattern": "matched-pattern-key or null"}
{"action": "optimize", "problem": "current problem", "pattern": "current-pattern-key"}
{"action": "hint", "hint": "what the candidate seems stuck on", "pattern": "current-pattern-key or null"}
{"action": "candidate_coding", "pattern": "current-pattern-key or null"}
{"action": "none"}

Return ONLY raw JSON. No markdown, no backticks, no explanation.`;

  try {
    let text;
    if (GEMINI_KEY && GEMINI_KEY !== "your-gemini-key-here") {
      try {
        text = await callGemini(codingPrompt, 4000);
        log("CODING_ANALYZE", "classified via Gemini");
      } catch (gErr) {
        log("WARN", `Gemini classify failed (${gErr.message}) — falling back to Claude`);
        text = await callClaude([{ role: "user", content: codingPrompt }], 400);
        log("CODING_ANALYZE", "classified via Claude (Gemini fallback)");
      }
    } else {
      text = await callClaude([{ role: "user", content: codingPrompt }], 400);
    }

    const cleaned = text.trim().replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    let result;
    try {
      result = JSON.parse(cleaned);
    } catch (parseErr) {
      const jsonMatch = cleaned.match(/\{[\s\S]*?"action"\s*:\s*"[^"]+?"[\s\S]*?\}/);
      if (jsonMatch) {
        try {
          result = JSON.parse(jsonMatch[0]);
          log("CODING_ANALYZE", `recovered JSON from mixed response`);
        } catch (_) {
          log("ERROR", `coding JSON parse failed: "${cleaned.slice(0, 200)}..."`);
          result = { action: "none" };
        }
      } else {
        log("ERROR", `coding JSON parse failed: "${cleaned.slice(0, 200)}..."`);
        result = { action: "none" };
      }
    }

    log("CODING_ANALYZE", `result: ${result.action}${result.problem ? ` → "${result.problem}"` : ""}${result.pattern ? ` [${result.pattern}]` : ""}`);

    if (result.action === "problem_detected" && result.problem) {
      // Dedup: if we already have a problem detected, check similarity
      if (codingState.problem) {
        const existWords = new Set(codingState.problem.toLowerCase().replace(/[?.!,;:'"]/g, "").split(/\s+/));
        const newWords = new Set(result.problem.toLowerCase().replace(/[?.!,;:'"]/g, "").split(/\s+/));
        const overlap = [...newWords].filter(w => existWords.has(w) && w.length > 3);
        const similarity = overlap.length / Math.max(newWords.size, existWords.size);
        if (similarity > 0.5) {
          log("CODING_DEDUP", `suppressed re-detection (${(similarity * 100).toFixed(0)}% similar to existing problem)`);
          result.action = "none";
          delete result.problem;
        }
      }
    }

    if (result.action === "problem_detected" && result.problem) {
      codingState.problem = result.problem;
      codingState.currentLevel = 0;
      if (result.pattern && CODING_PATTERNS[result.pattern]) {
        codingState.pattern = result.pattern;
        result.totalLevels = CODING_PATTERNS[result.pattern].levels.length;
      } else {
        const autoMatch = findCodingPattern(result.problem);
        if (autoMatch) {
          result.pattern = autoMatch.key;
          codingState.pattern = autoMatch.key;
          result.totalLevels = autoMatch.levels.length;
        }
      }
      result.level = 0;
      if (!codingState.questionsAsked.includes(result.problem)) {
        codingState.questionsAsked.push(result.problem);
      }
    }

    // Suppress approach if we already have the problem answered
    if (result.action === "approach" && codingState.problem && codingState.questionsAsked.length > 0) {
      log("CODING_DEDUP", `suppressed approach — problem already answered`);
      result.action = "none";
    }

    if (result.action === "optimize") {
      const pat = CODING_PATTERNS[result.pattern || codingState.pattern];
      if (pat && codingState.currentLevel < pat.levels.length - 1) {
        codingState.currentLevel++;
        result.level = codingState.currentLevel;
        result.totalLevels = pat.levels.length;
        result.pattern = result.pattern || codingState.pattern;
      } else {
        result.action = "none";
        log("CODING_OPTIMIZE", "already at max level");
      }
    }

    if (result.pattern && !codingState.pattern) {
      codingState.pattern = result.pattern;
    }

    res.json(result);
  } catch (e) {
    log("ERROR", `coding analyze: ${e.message}`);
    res.json({ action: "none", error: e.message });
  }
});

// ============ CODING ANSWER ============
app.post("/api/coding/answer", async (req, res) => {
  const { question, type, context, pattern, level, analyzeData } = req.body;
  if (!question) return res.status(400).json({ error: "No question" });
  if (!API_KEY || API_KEY === "sk-ant-your-key-here") {
    return res.json({ answer: "Add your ANTHROPIC_API_KEY to .env" });
  }

  const patternKey = pattern || codingState.pattern;
  const patternData = patternKey ? CODING_PATTERNS[patternKey] : null;
  const lvl = level || codingState.currentLevel || 0;

  let prompt;

  if (type === "problem" || type === "approach") {
    const levelData = patternData ? patternData.levels[0] : null;
    const patternInfo = patternData ? `
MATCHED PATTERN: ${patternData.name}
When to use: ${patternData.whenToUse}
FIRST APPROACH: ${levelData ? levelData.name : "brute force"}
Complexity: ${levelData ? `Time: ${levelData.complexity.time}, Space: ${levelData.complexity.space}` : "analyze it"}
Java template:
\`\`\`java
${levelData ? levelData.java : "// no template available"}
\`\`\`
Walkthrough points: ${levelData ? levelData.walkthrough.join(" | ") : "explain step by step"}` : "";

    prompt = `You are a coding interview coach. The candidate just received this problem:
"${question}"

Context from interview: "${(context || "").slice(-1500)}"
${patternInfo}

Give a concise answer to help the candidate. Format:

**Pattern:** name of the pattern (or "Custom approach" if no pattern matched)

**Approach:** 1-2 sentences describing the strategy

**Java Code:**
\`\`\`java
// clean, ready-to-explain code
\`\`\`

**Walkthrough (say this):**
- 3-4 bullet points the candidate can SAY while coding to explain their thinking

**Complexity:** Time: O(...) | Space: O(...)

Rules:
- Java only
- Clean, interview-ready code (no boilerplate main method)
- Keep it concise — this is a refresher, not a tutorial
- The walkthrough points should be things the candidate can literally say out loud
- If a pattern template is provided, adapt it to the specific problem
- Under 200 words total`;
  } else if (type === "optimize") {
    const levelData = patternData && patternData.levels[lvl] ? patternData.levels[lvl] : null;
    const prevLevel = patternData && patternData.levels[lvl - 1] ? patternData.levels[lvl - 1] : null;

    prompt = `You are a coding interview coach. The interviewer asked the candidate to optimize their solution.

Problem: "${question}"
Context: "${(context || "").slice(-1500)}"
${prevLevel ? `Previous approach: ${prevLevel.name} (${prevLevel.complexity.time})` : ""}
${levelData ? `
NEXT OPTIMIZATION: ${levelData.name}
Approach: ${levelData.approach}
Complexity: Time: ${levelData.complexity.time}, Space: ${levelData.complexity.space}
Java template:
\`\`\`java
${levelData.java}
\`\`\`
Walkthrough: ${levelData.walkthrough.join(" | ")}` : ""}

Format:

**Optimization:** name (level ${lvl + 1}/${patternData ? patternData.levels.length : "?"})

**Key insight:** 1 sentence on WHY this is faster

**Java Code:**
\`\`\`java
// optimized solution
\`\`\`

**Walkthrough (say this):**
- 3-4 bullet points explaining the optimization

**Complexity:** Time: O(...) | Space: O(...)

Rules:
- Java only, clean interview-ready code
- Emphasize what changed from the previous approach
- The key insight should be something the candidate can say: "The trick here is..."
- Under 180 words`;
  } else if (type === "hint") {
    const levelData = patternData ? patternData.levels[lvl] : null;
    const gotchas = COMMON_GOTCHAS.filter(g => {
      const ctx = (context || "").toLowerCase();
      return g.keywords ? g.keywords.some(k => ctx.includes(k)) : true;
    }).slice(0, 3).map(g => `${g.name}: ${g.tip}`).join("\n");

    prompt = `You are a coding interview coach. The candidate is stuck and needs concrete help NOW — not hints, not questions, not riddles.

Problem: "${question}"
Context from interview: "${(context || "").slice(-1500)}"
${patternData ? `Pattern: ${patternData.name} — ${patternData.whenToUse}` : ""}
${levelData ? `
Approach to use: ${levelData.name}
Strategy: ${levelData.approach}
Complexity: Time: ${levelData.complexity.time}, Space: ${levelData.complexity.space}
Java template:
\`\`\`java
${levelData.java}
\`\`\`
Walkthrough: ${levelData.walkthrough.join(" | ")}` : ""}

${gotchas ? `Watch out for:\n${gotchas}` : ""}

Give the candidate what they need to get unstuck. Format:

**You're stuck on:** 1 sentence identifying where they're blocked (from context)

**Here's the approach:** 2-3 sentences explaining what to do

**Java Code:**
\`\`\`java
// working code for exactly where they're stuck
\`\`\`

**Say this:** 2-3 bullet points the candidate can say out loud to recover smoothly

**Watch out:** 1 common gotcha for this specific spot

Rules:
- Give the ACTUAL code — they're in an interview, not a classroom
- Focus on where they're stuck, not the whole problem
- If the context shows they have partial code, build on it
- Under 180 words`;
  } else {
    prompt = `Coding interview coach. Question: "${question}". Context: "${(context || "").slice(-1000)}". Give a brief, helpful response in under 100 words.`;
  }

  log("CODING_ANSWER", `[${type}] pattern=${patternKey || "none"} level=${lvl} streaming...`);
  streamClaude([{ role: "user", content: prompt }], 800, res);
});

// ============ CODING STATE ============
app.post("/api/coding/reset", (req, res) => {
  resetCodingState();
  log("CODING_STATE", "coding state reset");
  res.json({ ok: true });
});

app.get("/api/coding/state", (req, res) => {
  res.json(codingState);
});

// ============ STATE ============
app.post("/api/reset", (req, res) => {
  resetState();
  log("STATE", "conversation state reset");
  res.json({ ok: true });
});

app.get("/api/state", (req, res) => {
  res.json(conversationState);
});

// ============ LOG ============
app.post("/api/log", (req, res) => {
  const { entries } = req.body;
  if (Array.isArray(entries)) {
    for (const e of entries) {
      log(e.tag || "CLIENT", e.msg || "");
    }
  }
  res.json({ ok: true });
});

// ============ BEHAVIORAL INTERVIEW ============
// With a known interview profile, seed the target so answers tailor from the
// first question instead of waiting for company detection in the transcript.
const DEFAULT_INTERVIEW_CONTEXT = INTERVIEW_PROFILE === "ebay"
  ? { company: "ebay", domain: "marketplace/e-commerce, data platforms (Cloud Data Technologies), experimentation/A-B testing, near-real-time AI/analytics" }
  : null;

let behavioralState = {
  lastQuestionType: "",
  questionsDetected: [],
  lastFrameworkType: "",
  frameworksDetected: [],
  consecutiveAnswering: 0,
  recentQuestions: [],
  lastQuestionTime: 0,
  pendingSetup: null,
  interviewContext: DEFAULT_INTERVIEW_CONTEXT,
};

function resetBehavioralState() {
  behavioralState = { lastQuestionType: "", questionsDetected: [], lastFrameworkType: "", frameworksDetected: [], consecutiveAnswering: 0, recentQuestions: [], lastQuestionTime: 0, pendingSetup: null, interviewContext: DEFAULT_INTERVIEW_CONTEXT };
}

function isSimilarToRecent(question) {
  if (!question) return false;
  const newWords = new Set(question.toLowerCase().replace(/[?.!,;:'"]/g, "").split(/\s+/).filter(w => w.length > 3));
  const now = Date.now();
  for (const recent of behavioralState.recentQuestions) {
    if (now - recent.time > 120000) continue;
    const existWords = new Set(recent.words);
    const overlap = [...newWords].filter(w => existWords.has(w));
    const similarity = overlap.length / Math.max(newWords.size, existWords.size);
    if (similarity > 0.4) {
      log("BEHAVIORAL_DEDUP", `"${question.slice(0, 50)}..." similar to recent "${recent.text.slice(0, 50)}..." (${(similarity * 100).toFixed(0)}%)`);
      return true;
    }
  }
  return false;
}

function trackQuestion(question) {
  if (!question) return;
  const words = question.toLowerCase().replace(/[?.!,;:'"]/g, "").split(/\s+/).filter(w => w.length > 3);
  behavioralState.recentQuestions.push({ text: question, words, time: Date.now() });
  behavioralState.lastQuestionTime = Date.now();
  if (behavioralState.recentQuestions.length > 20) {
    behavioralState.recentQuestions = behavioralState.recentQuestions.slice(-20);
  }
}

app.get("/api/behavioral/data", (req, res) => {
  res.json({
    stories: STORIES,
    categories: CATEGORIES,
    questionTypes: QUESTION_TYPES,
    signals: SIGNALS,
    questionKeywords: QUESTION_KEYWORDS,
    frameworks: FRAMEWORKS,
    frameworkKeywords: FRAMEWORK_KEYWORDS,
  });
});

app.post("/api/behavioral/analyze", async (req, res) => {
  const { recentSpeech, fullContext, lastDetectedType, manual } = req.body;
  if (!recentSpeech) return res.status(400).json({ error: "No speech" });
  log("BEHAVIORAL_ANALYZE", `input (${recentSpeech.split(/\s+/).length} words)${manual ? " [MANUAL tap]" : ""}: "${recentSpeech.slice(0, 150)}..."`);

  if (!API_KEY || API_KEY === "sk-ant-your-key-here") {
    return res.json({ action: "none" });
  }

  const storyQtList = Object.entries(QUESTION_TYPES)
    .filter(([, qt]) => !qt.isFramework)
    .map(([key, qt]) => `${key}: "${qt.name}" (${qt.category})`)
    .join("\n");

  const frameworkQtList = Object.entries(QUESTION_TYPES)
    .filter(([, qt]) => qt.isFramework)
    .map(([key, qt]) => `${key}: "${qt.name}"`)
    .join("\n");

  const classifyPrompt = `You are an AI coach analyzing a live behavioral interview. Input is real-time speech transcription — expect noise, filler, garbled fragments. Your job is to find the INTENT behind what's being said.

STEP 1 — EXTRACT: Scan the ENTIRE speech block for any question. Questions can appear ANYWHERE — beginning, middle, or end. This is a single audio stream with no speaker labels, so an interviewer question may be embedded inside what looks like candidate speech. Look for:
- Direct questions ("what is...", "how do you...", "tell me about...")
- Topic shifts that imply a question was asked (candidate was discussing dashboards, now discussing code reviews — something prompted the change)
- Short interjections that redirect ("okay but what about...", "and how do you handle...")
If the speech is entirely garbled with no recognizable question or topic shift, return {"action": "none"}.

CRITICAL — SPEAKER ATTRIBUTION: This is a SINGLE audio stream with NO speaker labels. Both interviewer and candidate are mixed together. You MUST distinguish:
- INTERVIEWER questions: directed AT the candidate, expecting an answer ("how do you handle X?", "tell me about a time...")
- CANDIDATE explanations: the candidate DESCRIBING their own process, telling a story, or explaining how they do things ("so what I do is...", "in my team we interview by...", "one of the things I did was...")
When the candidate is explaining something in narrative form (e.g. "so I interview engineers by first giving them a coding problem, then..."), that is NOT an interviewer question — it's the candidate answering. Look at the CONTEXT to see if the candidate has been speaking continuously. If they have, a question-like phrase is almost certainly the candidate continuing their answer, not a new interviewer question.
Clues that it's the CANDIDATE speaking (not a question):
- Preceded by "I", "we", "my team", "what I do is", "one of the things"
- Fits as a continuation of the topic they were already discussing
- Uses past tense narrative ("so I asked them...", "what we did was...")
- The context shows them in the middle of a monologue

CRITICAL — INCOMPLETE QUESTIONS: Do NOT fire on questions that are clearly cut off mid-sentence or still being set up:
- "Have you ever had a case where..." → CUT OFF, the actual scenario hasn't been stated yet
- "Let's assume there is an issue..." → setup, the actual question hasn't landed
- "So imagine you have a system that..." → setup
- "Tell me about a time when you..." → CUT OFF if the speech ends here without specifying WHAT
- Any question that ends with a trailing conjunction, preposition, or incomplete clause ("where", "when", "that", "and then", "but")
These are INCOMPLETE — return candidate_answering with "setup": true so we catch the full question in the next chunk.
Only fire when you can see the COMPLETE question — what specifically the interviewer wants answered. "Have you ever had a case where part of your team was underperforming and you had to address it?" is complete. "Have you ever had a case where" is NOT.

STEP 2 — INTENT: What does the interviewer want to learn? Classify the intent:
- "past_experience" — wants a specific story from the candidate's past (context, actions, results)
- "philosophy" — wants the candidate's personal approach, mental model, or leadership style on a topic
- "concept" — wants the candidate to define or explain a technical/domain concept
- "personal" — the question requires the candidate's OWN knowledge, feelings, or personal narrative to answer AND has no matching story type. The system CANNOT help here. Examples:
  * "What are your salary expectations?" / "What's your notice period?" / "Do you have work authorization?" — logistics only the candidate knows
  * "What are your strengths/weaknesses?" / "How would your team describe you?" — candidate's own self-reflection
  * Any question that only the candidate can answer from their own mind — NOT from a story bank or framework
IMPORTANT: If a question LOOKS personal but has a matching story type in the STORY TYPES list (e.g., "tell me about yourself" → screen-intro, "why this company" → screen-why-role, "why are you leaving" → screen-why-leave, "how big is your team" → screen-leadership-scope), classify it as "past_experience" and match it — these have coached narratives prepared
- "probe" — wants to go deeper on something the candidate just said
- "setup" — interviewer is building a hypothetical/scenario but hasn't asked the actual question yet
- "not_a_question" — candidate is answering on a topic already detected, AND no new question or topic shift is present

STEP 3 — ANSWER HINT: When a question is detected, include an "answerHint" — MAX 8 WORDS, a glanceable nudge on what they really want:
- past_experience → e.g. "Story: their gap, your coaching, the promotion"
- philosophy → e.g. "Your mental model + one real example"
- concept → e.g. "Crisp definition, then your experience"
- personal → DO NOT generate an answerHint. This is the candidate's to handle.
- probe → e.g. "Go deeper: metrics, names, specifics"
Never explain CARL inside the hint — the answer card carries the structure. Make it specific to THIS question, never generic.

STEP 4 — MATCH: Based on intent, find the best match:
- past_experience → match to closest STORY type. If no good match, use unmatched_question.
- philosophy → match to closest FRAMEWORK type. If no good match, use unmatched_question.
- concept → always unmatched_question (we generate these on the fly)
- personal → return {"action": "none"} — the system stays quiet, candidate handles this themselves
- probe → follow_up
- setup → return {"action": "candidate_answering", "setup": true} — we'll watch the next chunk for the real question
- not_a_question → candidate_answering or none

STEP 5 — ALTERNATE READINGS (disambiguation): A single spoken phrase can legitimately mean different things that need DIFFERENT answers. When the detected question is genuinely ambiguous — it could map to a different intent, a different story, or a different framework that would change how the candidate should answer — include an "alternatives" array (max 2) listing the OTHER plausible readings. Each entry: {"action","questionType"(if it maps to a story/framework type),"question"(the reading-specific phrasing),"intent","label"(<=4 words naming the reading, e.g. "Hardest project", "0->1 build", "Your philosophy")}. Only include readings that genuinely need a different answer. If the question is unambiguous, omit "alternatives" or set it to []. Example: "tell me about a project you're proud of" -> primary {innovation, "0->1 build"} with an alternative {tough-project, "Hardest project"}.

RECENT SPEECH:
"${recentSpeech}"

CONTEXT (last 3000 chars):
"${(fullContext || "").slice(-3000)}"

LAST DETECTED TYPE: ${lastDetectedType || "none"}
${behavioralState.pendingSetup ? `PENDING SETUP: The previous chunk contained an incomplete hypothetical/scenario: "${behavioralState.pendingSetup}". The interviewer was building context. Look for the ACTUAL question that follows this setup (e.g. "what would you do?", "how would you handle that?"). If you find it, fire the question with the full context (setup + question combined).` : ""}
${behavioralState.consecutiveAnswering >= 4 ? `WARNING: ${behavioralState.consecutiveAnswering} consecutive chunks classified as candidate_answering. The interviewer has likely asked a follow-up or new question that was missed. Look EXTRA carefully for any question, topic shift, or redirect buried in this speech. Even a short interjection like "okay what about..." counts.` : ""}

STORY TYPES:
${storyQtList}

FRAMEWORK TYPES:
${frameworkQtList}

RULES:
- Same topic, different intent = different action. "Tell me about a time you managed stakeholders" (past_experience) vs "How do you manage stakeholders?" (philosophy) vs "What is stakeholder mapping?" (concept)
- A weak match is worse than unmatched_question — only match when confident
- If the same type was just detected (lastDetectedType), don't re-detect it
- Candidate restating or elaborating = candidate_answering
- PROJECT QUESTIONS — disambiguate by EMPHASIS, not just the words "hard/big": a question stressing that the candidate "built / drove / championed something FROM SCRATCH, by yourself, your own initiative, took it 0-to-1, started it and grew it into something used" → innovation. A question stressing the HARDEST / MOST COMPLEX / largest / company-wide project → tough-project. When both signals appear, prefer innovation if the emphasis is on personally driving a ground-up build.

Respond with ONLY a JSON object (no markdown, no explanation). Add "alternatives" ONLY when the phrase is genuinely ambiguous (see STEP 5):
{"action": "question_detected", "questionType": "type-key", "question": "cleaned question", "intent": "past_experience", "answerHint": "how to approach this answer", "alternatives": [{"action": "question_detected", "questionType": "other-type-key", "question": "the other reading", "intent": "past_experience", "label": "Hardest project"}]}
{"action": "framework_detected", "questionType": "fw-type-key", "question": "cleaned question", "intent": "philosophy", "answerHint": "how to approach this answer"}
{"action": "unmatched_question", "question": "cleaned question", "intent": "past_experience|philosophy|concept", "answerHint": "how to approach this answer"}
{"action": "follow_up", "questionType": "current-type-key", "question": "the follow-up question being asked", "intent": "probe", "answerHint": "how to approach this answer"}
{"action": "candidate_answering"}
{"action": "candidate_answering", "setup": true}
{"action": "none"}`;

  try {
    let text;
    if (GEMINI_KEY && GEMINI_KEY !== "your-gemini-key-here") {
      try {
        text = await callGemini(classifyPrompt, 4000);
        log("BEHAVIORAL_ANALYZE", "classified via Gemini");
      } catch (gErr) {
        log("WARN", `Gemini classify failed (${gErr.message}) — falling back to Claude`);
        text = await callClaude([{ role: "user", content: classifyPrompt }], 300);
        log("BEHAVIORAL_ANALYZE", "classified via Claude (Gemini fallback)");
      }
    } else {
      text = await callClaude([{ role: "user", content: classifyPrompt }], 300);
    }

    const cleaned = text.trim().replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    let result;
    try {
      result = JSON.parse(cleaned);
    } catch (parseErr) {
      const jsonMatch = cleaned.match(/\{[\s\S]*"action"\s*:\s*"[^"]+?"[\s\S]*?\}/);
      if (jsonMatch) {
        try {
          result = JSON.parse(jsonMatch[0]);
          log("BEHAVIORAL_ANALYZE", `recovered JSON from mixed response`);
        } catch (_) {
          log("ERROR", `behavioral JSON parse failed: "${cleaned.slice(0, 200)}..."`);
          result = { action: "none" };
        }
      } else {
        log("ERROR", `behavioral JSON parse failed: "${cleaned.slice(0, 200)}..."`);
        result = { action: "none" };
      }
    }

    log("BEHAVIORAL_ANALYZE", `result: ${result.action}${result.questionType ? ` → ${result.questionType}` : ""}${result.intent ? ` [${result.intent}]` : ""}`);

    // Track consecutive candidate_answering to detect missed questions
    if (result.action === "candidate_answering" || result.action === "none") {
      behavioralState.consecutiveAnswering++;
    } else {
      behavioralState.consecutiveAnswering = 0;
    }

    // Extract interview context from conversation (company, role, domain)
    if (!behavioralState.interviewContext && fullContext && fullContext.length > 500) {
      const ctx = (fullContext || "").toLowerCase();
      const companySignals = [];
      const domainSignals = [];
      const roleSignals = [];
      const knownCompanies = ["yahoo", "ebay", "google", "amazon", "meta", "facebook", "apple", "microsoft", "netflix", "uber", "lyft", "airbnb", "stripe", "coinbase", "robinhood", "slack", "salesforce", "oracle", "ibm", "cisco", "vmware", "databricks", "snowflake", "datadog", "splunk", "pagerduty"];
      for (const c of knownCompanies) {
        if (ctx.includes(c)) companySignals.push(c);
      }
      const domainKeywords = { "email": "email/messaging", "spam": "email/anti-abuse", "anti-abuse": "email/anti-abuse", "marketplace": "marketplace/e-commerce", "payments": "payments/fintech", "ads": "advertising", "search": "search", "cloud": "cloud infrastructure", "security": "security", "ml": "machine learning", "data pipeline": "data engineering", "streaming": "data streaming" };
      for (const [kw, domain] of Object.entries(domainKeywords)) {
        if (ctx.includes(kw)) domainSignals.push(domain);
      }
      if (companySignals.length > 0 || domainSignals.length > 0) {
        behavioralState.interviewContext = {
          company: [...new Set(companySignals)].join(", ") || "unknown",
          domain: [...new Set(domainSignals)].join(", ") || "unknown",
        };
        log("BEHAVIORAL_CONTEXT", `detected interview context: company=${behavioralState.interviewContext.company}, domain=${behavioralState.interviewContext.domain}`);
      }
    }

    // Track hypothetical setups — prime for the real question next chunk
    if (result.setup) {
      behavioralState.pendingSetup = recentSpeech.slice(0, 200);
      log("BEHAVIORAL_ANALYZE", `setup detected — waiting for actual question: "${recentSpeech.slice(0, 80)}..."`);
    } else if (result.action !== "candidate_answering" && result.action !== "none") {
      behavioralState.pendingSetup = null;
    }

    // Validate: if model returns a type we don't have, promote to unmatched
    if (result.action === "question_detected" && result.questionType) {
      if (!manual && result.questionType === lastDetectedType) {
        log("BEHAVIORAL_DEDUP", `suppressed — same as last: ${result.questionType}`);
        result.action = "none";
      } else if (!QUESTION_TYPES[result.questionType]) {
        log("BEHAVIORAL_ANALYZE", `unknown type "${result.questionType}" → unmatched_question`);
        result.action = "unmatched_question";
        result.question = result.question || result.questionType;
        delete result.questionType;
      }
    }

    if (result.action === "framework_detected" && result.questionType) {
      if (!manual && result.questionType === lastDetectedType) {
        log("BEHAVIORAL_DEDUP", `framework suppressed — same as last: ${result.questionType}`);
        result.action = "none";
      } else if (!FRAMEWORKS.find(f => f.questionType === result.questionType)) {
        log("BEHAVIORAL_ANALYZE", `unknown framework "${result.questionType}" → unmatched_question`);
        result.action = "unmatched_question";
        result.question = result.question || result.questionType;
        delete result.questionType;
      }
    }

    // A follow_up without question text leaves the frontend unable to render a
    // card (it gates on data.question) — synthesize one so the card always fires.
    if (result.action === "follow_up" && !result.question) {
      result.question = recentSpeech.slice(-200).trim();
      log("BEHAVIORAL_ANALYZE", "follow_up missing question — synthesized from recent speech");
    }

    // Semantic dedup: suppress if similar to a recently detected question.
    // Skipped for manual taps — an explicit Answer press is never spam.
    if (!manual && (result.action === "unmatched_question" || result.action === "question_detected" || result.action === "framework_detected" || result.action === "follow_up") && result.question) {
      if (isSimilarToRecent(result.question)) {
        result.action = "none";
      }
    }

    // Also cooldown: if a question was detected very recently (< 15s), suppress unless it's clearly a different topic.
    // Skipped for manual taps — the user is deliberately asking for an answer now.
    if (!manual && (result.action === "unmatched_question" || result.action === "follow_up") && result.question) {
      const timeSinceLast = Date.now() - behavioralState.lastQuestionTime;
      if (timeSinceLast < 15000 && timeSinceLast > 0) {
        log("BEHAVIORAL_DEDUP", `cooldown — ${Math.round(timeSinceLast / 1000)}s since last question, suppressing`);
        result.action = "none";
      }
    }

    // Track questions that pass through
    if ((result.action === "unmatched_question" || result.action === "question_detected" || result.action === "framework_detected" || result.action === "follow_up") && result.question) {
      trackQuestion(result.question);
      log("BEHAVIORAL_ANALYZE", `question tracked: "${result.question}"`);
    }

    if (result.action === "unmatched_question" && result.question) {
      log("BEHAVIORAL_ANALYZE", `unmatched question: "${result.question}"`);
    }

    if (result.action === "framework_detected" && result.questionType) {
      behavioralState.lastFrameworkType = result.questionType;
      if (!behavioralState.frameworksDetected.includes(result.questionType)) {
        behavioralState.frameworksDetected.push(result.questionType);
      }
      const fw = FRAMEWORKS.find(f => f.questionType === result.questionType);
      if (fw) {
        result.framework = fw;
        const linkedStory = STORIES.find(s => s.id === fw.storyLink);
        if (linkedStory) {
          result.linkedStory = {
            id: linkedStory.id,
            title: linkedStory.title,
            result: linkedStory.card.r,
          };
        }
      }
    }

    if (result.action === "question_detected" && result.questionType) {
      behavioralState.lastQuestionType = result.questionType;
      if (!behavioralState.questionsDetected.includes(result.questionType)) {
        behavioralState.questionsDetected.push(result.questionType);
      }
    }

    res.json(result);
  } catch (e) {
    log("ERROR", `behavioral analyze: ${e.message}`);
    res.json({ action: "none", error: e.message });
  }
});

// ============ BEHAVIORAL ANSWER (unified intelligent generation) ============
app.post("/api/behavioral/answer", async (req, res) => {
  const { question, intent, context, matchedStoryKey, matchedFrameworkKey, isFollowUp } = req.body;
  if (!question) return res.status(400).json({ error: "No question" });
  if (!API_KEY || API_KEY === "sk-ant-your-key-here") {
    res.setHeader("Content-Type", "text/event-stream");
    res.write(`data: ${JSON.stringify({ text: "Add your ANTHROPIC_API_KEY to .env" })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    return res.end();
  }

  try {
  // PLAN A — instant banked-card serve. For a confident first-pass "tell me about a time" match,
  // skip the LLM entirely and stream the candidate's pre-written CARL card. Follow-up probes still
  // go to the LLM below (they want fresh depth, not the prepared card).
  const matched = primaryStoryFor(matchedStoryKey);
  if (intent === "past_experience" && matched && !isFollowUp) {
    log("BEHAVIORAL_ANSWER", `[past_experience] INSTANT card: ${matched.id} (no LLM)`);
    return streamStatic(buildInstantAnswer(matched), res);
  }

  // PLAN C — slim prompt. Send a one-line learning index of every story (so the model can still
  // pick/reference any of them), plus the FULL CARL of just the matched story. ~12k tokens → ~1.5k.
  const storyIndex = STORIES.map(s =>
    `- "${s.title}" [${s.id}] (${(s.domains || []).join(", ")}): ${s.card.l}`
  ).join("\n");
  const matchedFull = matched
    ? `\n\nMOST RELEVANT STORY (full detail — prefer this if it fits):\n- "${matched.title}" [${matched.id}]: ${matched.card.c} → Actions: ${matched.card.a.join("; ")} → Result: ${matched.card.r} → Learning: ${matched.card.l}`
    : "";
  // Prepared, vetted deep-dive answers for the matched story — gold for probe follow-ups.
  const matchedProbeMap = matched && (matched.probes || (matched.card && matched.card.probes));
  const matchedProbes = matchedProbeMap && Object.keys(matchedProbeMap).length
    ? `\n\nPREPARED DEEP-DIVE ANSWERS for "${matched.id}" (Sogo's own vetted answers — adapt the closest one when a probe matches; skip anything marked [VERIFY]):\n${Object.entries(matchedProbeMap).map(([q, a]) => `  • "${q}" → ${a}`).join("\n")}`
    : "";
  const storyBank = storyIndex + matchedFull + matchedProbes;

  const frameworkBank = FRAMEWORKS.map(f =>
    `- ${f.questionType}: "${f.definition}" — Pillars: ${f.pillars.join("; ")}${f.storyLink ? ` — Evidence story: ${f.storyLink}` : ""}`
  ).join("\n");

  const intentGuide = {
    past_experience: "The interviewer wants a SPECIFIC STORY. Pick the best story from the bank, but ANGLE it to answer THIS exact question. Don't just dump the whole story — emphasize the parts that answer what was asked.",
    philosophy: "The interviewer wants the candidate's MENTAL MODEL or approach. Lead with a crisp definition/framework, then back it with 2-3 concrete examples from the story bank.",
    concept: "The interviewer wants the candidate to DEFINE or EXPLAIN something. Start with a clear definition, then immediately ground it in real experience from the story bank.",
    probe: "The interviewer is digging DEEPER on something the candidate just said. Give specific details, metrics, or angles the candidate hasn't mentioned yet. Be concrete.",
  };

  const prompt = `You are a brilliant interview coach sitting next to the candidate during a live interview. You are NOT a lookup tool. You THINK about each question independently, use your own knowledge and judgement, and give the candidate the best possible answer.

QUESTION: "${question}"
INTENT: ${intent || "unknown"} — ${intentGuide[intent] || "Reason about what the interviewer wants and respond accordingly."}
${isFollowUp ? "This is a FOLLOW-UP to the candidate's previous answer. Be specific to what was just discussed." : ""}
${context ? `INTERVIEW CONTEXT (recent conversation): "${context.slice(-1500)}"` : ""}
${behavioralState.interviewContext ? `\nINTERVIEW TARGET: The candidate is interviewing at ${behavioralState.interviewContext.company !== "unknown" ? behavioralState.interviewContext.company.toUpperCase() : "a company"} in the ${behavioralState.interviewContext.domain} space. TAILOR your answer to this specific company and domain — reference their challenges, scale, and technology where relevant.` : ""}

CANDIDATE PROFILE:
- Senior Engineering Manager / Director-level with 15+ years experience
- Domains: Cloud Infrastructure, Data Engineering, Platform Engineering
- Companies: Large financial institutions (Citi-scale), enterprise environments
- Leadership: Managed 25-50 engineers, managed managers, built tech-lead operating models
- Technical: Kafka, Flink, Terraform, Kubernetes, AWS, data governance, streaming architectures
- Style: Data-driven, coaching-based leadership, "guardrails not gates", blameless culture

CANDIDATE'S STORY BANK (reference material — use ONLY when a story genuinely fits):
${storyBank}

CANDIDATE'S FRAMEWORKS (reference material — use ONLY when relevant):
${frameworkBank}

YOUR JOB: Think like a human coach. Ask yourself:

1. WHAT does this question actually need? Not every question needs a pre-written story. Think:
   - "Why [company]?" → needs facts ABOUT THAT COMPANY (their mission, challenges, scale, recent initiatives, what makes them interesting) + why the candidate's background is a natural fit. Use your knowledge of the company.
   - "Tell me about a time..." → needs a specific story from the bank, angled to the question
   - "How do you think about X?" → needs the candidate's mental model, maybe backed by a story
   - "What's your weakness?" → needs genuine self-reflection, not a disguised strength
   - A technical concept → needs a clear definition grounded in experience
   - A follow-up probe → needs specific details the candidate hasn't said yet

2. WHAT IS THE BEST ANSWER? Use your intelligence:
   - If the question is about a company → bring real facts about that company (size, market, challenges, tech stack, recent news). The candidate needs ammunition they might not have memorized.
   - If the question needs a story → pick the ONE story from the bank that best fits and angle it
   - If the question is reflective → help the candidate be genuine and structured
   - If you have useful knowledge (about a technology, a company, an industry trend) → USE IT. Don't limit yourself to the story bank.

3. SHOULD I reference the story bank? Only if a story genuinely strengthens the answer. Many questions are better answered with fresh thinking than with a forced story reference.

Generate a response the candidate can GLANCE AT in 2 seconds:

**Frame:** One sentence — what the interviewer wants and the best angle.
**Open:** One short line to speak FIRST — the 10-second headline of the whole answer (hook + outcome).
${intent === "past_experience"
  ? `**Say (complete CARL — every letter present, in order; each BULLET is one short line the candidate builds on verbally):**
- C: context bullet → (detail). Add a 2nd C bullet if situation + stakes need separating.
- A: action bullet, what THEY did → (specific detail)
- A: action bullet → (specific detail)
- A: (optional 3rd action if the story needs it)
- R: result bullet that MUST contain the headline metric/number from the story (e.g. "1,300+ apps", "92% fewer alerts", "6h → <1min"). A result bullet with no number is incomplete — if the story has a number, it goes here. Add a 2nd R bullet for a secondary outcome if it strengthens.
- L: lesson/principle bullet → (ties back to the question)
Use 1-2 bullets per letter (Actions 2-3). Never cram a whole stage into one fragment, and never merge two letters into one bullet.`
  : intent === "probe"
  ? `**Say (answer the probe DIRECTLY — focused and concrete, NOT a story arc; do NOT use C/A/R/L labels):**
- Lead with the direct answer to exactly what was asked — a one-line definition, the specific mechanism, or the number.
- Then 2-4 tight bullets of real substance: name the actual tech / design choice, the metric, the tradeoff. Prefer the PREPARED DEEP-DIVE ANSWERS above when one matches the question.
- "How did you build/implement X?" → give the real architecture/stack. "What does X mean?" → define it in one line, then ground it in what you did.
- They asked a narrow question — give a sharp, specific answer, not a full Context→Result narrative.`
  : `**Say:**
- Short bullet, 6-10 words → (why this lands)
- Short bullet → (supporting detail)
- Short bullet → (evidence or fact)`}
**Pivot →** Story name + angle (ONLY if a story from the bank genuinely fits)

STORY TAG: At the very end of your response, on its own line, if the candidate should have a specific story from the bank ready as a CARL example to tell, output exactly:
[STORY:story-id-here]
Use the exact story id from the bank (e.g. [STORY:drift-modernization] or [STORY:kafka-oom]). This tells the system to display the full CARL breakdown for quick reference.
If no story is needed (motivation questions, self-reflection, concept definitions, etc.) — do NOT include this tag. Many great answers don't need a story.

AVAILABLE STORY IDS: ${STORIES.map(s => s.id).join(", ")}

Rules:
- Under 140 words total (not counting the STORY tag)
- Each bullet is ONE short line the candidate can build on verbally — never a paragraph
- A CARL letter may span 1-2 bullets (Actions 2-3) — don't force a stage into a single fragment, but keep every bullet to one line
- For story answers: the CARL bullets must form ONE coherent story, not a grab-bag of points. Every letter present — a story without R and L is incomplete.
- THINK INDEPENDENTLY. You are a smart coach, not a database query.
- Use your real knowledge about companies, industries, technologies when relevant
- Reference the story bank ONLY when a story genuinely fits the question
- Never force a story reference — if the best answer doesn't need one, don't include one
- No filler, no generic advice`;

  log("BEHAVIORAL_ANSWER", `[${intent || "?"}${isFollowUp ? ",follow-up" : ""}] streaming for: "${question.slice(0, 80)}..."`);
  streamClaude([{ role: "user", content: prompt }], 600, res);
  } catch (err) {
    // Never let a thrown error leave the client's "thinking..." spinner hanging forever.
    log("ERROR", `behavioral answer threw: ${err.message}`);
    if (!res.headersSent) {
      res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });
    }
    res.write(`data: ${JSON.stringify({ error: "answer failed: " + err.message })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true, fullText: "" })}\n\n`);
    res.end();
  }
});

// Legacy fallback endpoint — redirects to unified answer
app.post("/api/behavioral/fallback", async (req, res) => {
  req.body.intent = req.body.intent || "concept";
  const handler = app._router.stack.find(r => r.route && r.route.path === "/api/behavioral/answer");
  if (handler) return handler.route.stack[0].handle(req, res);
  res.status(500).json({ error: "answer endpoint not found" });
});

// Legacy follow-up endpoint — redirects to unified answer
app.post("/api/behavioral/follow-up", async (req, res) => {
  req.body.intent = "probe";
  req.body.isFollowUp = true;
  req.body.question = req.body.question || req.body.storyTitle || "follow-up";
  const handler = app._router.stack.find(r => r.route && r.route.path === "/api/behavioral/answer");
  if (handler) return handler.route.stack[0].handle(req, res);
  res.status(500).json({ error: "answer endpoint not found" });
});

// ============ BEHAVIORAL HELP (candidate pressed H or M) ============
app.post("/api/behavioral/help", async (req, res) => {
  const { question, intent, context, depth } = req.body;
  if (!question) return res.status(400).json({ error: "No question" });
  if (!API_KEY || API_KEY === "sk-ant-your-key-here") {
    res.setHeader("Content-Type", "text/event-stream");
    res.write(`data: ${JSON.stringify({ text: "Add your ANTHROPIC_API_KEY to .env" })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    return res.end();
  }

  const storyContext = STORIES.map(s =>
    `- "${s.title}" [${s.domains.join(",")}]: ${s.card.c} → Actions: ${s.card.a.join("; ")} → Result: ${s.card.r}`
  ).join("\n");

  const isMoreDetail = depth && depth > 0;

  const prompt = isMoreDetail
    ? `You are a behavioral interview coach. The candidate needs MORE DETAIL on a question they're answering.

QUESTION: "${question}"
INTENT: ${intent || "unknown"}
DEPTH LEVEL: ${depth} (give progressively more specific detail)
${context ? `WHAT CANDIDATE HAS SAID SO FAR: "${context.slice(-1500)}"` : ""}

CANDIDATE'S REAL STORIES:
${storyContext}

Give additional talking points the candidate HASN'T covered yet. Format:

**Go deeper:**
- Specific point → (real evidence: metric, story, technology)
- Specific point → (evidence)
- Specific point → (evidence)

Rules:
- Under 60 words
- Short phrases, not sentences
- Only points grounded in real experience above
- Don't repeat what's already been said in context`

    : `You are a behavioral interview coach. The candidate is STUCK and pressed H for help. They need a structured answer they can start speaking RIGHT NOW.

QUESTION: "${question}"
INTENT: ${intent || "unknown"}
${context ? `INTERVIEW CONTEXT: "${context.slice(-1500)}"` : ""}

CANDIDATE PROFILE:
- Senior Engineering Manager / Director-level, 15+ years
- Domains: Cloud Infrastructure, Data Engineering, Platform Engineering
- Companies: Large financial institutions (Citi-scale), enterprise environments
- Leadership: Managed 25-50 engineers, managed managers, tech-lead operating models
- Technical: Kafka, Flink, Terraform, Kubernetes, AWS, streaming architectures
- Style: Data-driven, coaching-based, "guardrails not gates", blameless culture

CANDIDATE'S REAL STORIES:
${storyContext}

Generate a FULL answer the candidate can speak through. Format:

**Start with:** One opening sentence to say verbatim — sets the frame.

**Key points:**
- Point 1: short phrase → expand with (specific detail from experience)
- Point 2: short phrase → (evidence)
- Point 3: short phrase → (evidence)

**Close with:** One sentence to wrap up — tie back to the role/company.

Rules:
- Under 100 words total
- Every point must reference real stories, metrics, or technologies
- Written so the candidate can literally speak through it top to bottom
- ${intent === "past_experience" ? "Structure as CARL: Context → Action → Result → Lesson" : intent === "philosophy" ? "Lead with definition, then pillars, then back with evidence" : "Start with crisp definition, then connect to real experience"}`;

  log("BEHAVIORAL_HELP", `[${isMoreDetail ? "more" : "help"}] streaming for: "${question.slice(0, 80)}..."`);
  streamClaude([{ role: "user", content: prompt }], isMoreDetail ? 400 : 600, res);
});

app.post("/api/behavioral/reset", (req, res) => {
  resetBehavioralState();
  log("BEHAVIORAL_STATE", "behavioral state reset");
  res.json({ ok: true });
});

app.get("/api/behavioral/state", (req, res) => {
  res.json(behavioralState);
});

// Test endpoint for detection (uses regex, no API)
app.post("/api/test-detect", (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "No text" });

  const { extractQuestion, splitSentences } = require("./detection");
  const sentences = splitSentences(text);
  const results = sentences.map((s) => ({
    sentence: s,
    question: extractQuestion(s),
  }));
  res.json({ results });
});

const server = http.createServer(app);

// HTTPS server for mobile (Safari requires HTTPS for microphone)
const HTTPS_PORT = 3443;
let httpsServer = null;
const certPath = path.join(__dirname, "cert.pem");
const keyPath = path.join(__dirname, "key.pem");
if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  const httpsModule = require("https");
  httpsServer = httpsModule.createServer({
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  }, app);
}

// ============ DEEPGRAM WEBSOCKET PROXY ============
const DEEPGRAM_KEY = process.env.DEEPGRAM_API_KEY;
const wss = new WebSocket.Server({ server, path: "/ws/deepgram" });

wss.on("connection", (clientWs) => {
  log("DEEPGRAM", "client connected");

  if (!DEEPGRAM_KEY || DEEPGRAM_KEY === "your-deepgram-key-here") {
    clientWs.send(JSON.stringify({ error: "No DEEPGRAM_API_KEY set" }));
    clientWs.close();
    return;
  }

  const dgUrl = "wss://api.deepgram.com/v1/listen?" + [
    "model=nova-3", // best English model; uses keyterm prompting (below), not the legacy keywords= param
    "language=en",
    "encoding=linear16",
    "sample_rate=16000",
    "channels=1",
    "smart_format=true",
    "punctuate=true",
    "diarize=true",
    "interim_results=true",
    "utterance_end_ms=3000",
    "vad_events=true",
    "endpointing=300",
    // keyterm prompting (nova-3): boosts recognition of these domain terms.
    // Each entry becomes its own keyterm= param; the legacy :weight suffix is stripped.
    ...[
      // Frameworks & acronyms — high misrecognition risk
      "STAR:1.5", "CARL:1.5", "SOAR:1.5",
      "OKRs:1.5", "KPIs:1.5", "SLAs:1.5", "DORA:1.5", "RACI:1.5",
      "PIP:1.5", "RIF:1.0", "MTTR:1.5",
      // Interview & resume terms
      "resume:1.5", "behavioral:1.0", "competency:1.0",
      // Engineering management — commonly garbled
      "high performing:1.5", "cross-functional:1.5",
      "stakeholder:1.5", "skip-level:1.5",
      "standup:1.0", "retrospective:1.0", "kanban:1.5",
      "scrum master:1.5", "tech debt:1.0",
      "blameless postmortem:1.5", "on-call:1.0",
      "individual contributor:1.0", "direct report:1.0",
      "servant leadership:1.5", "radical candor:1.5",
      // Org & people terms
      "psychological safety:1.5", "de-escalation:1.5",
      "mentoring:1.0", "sponsorship:1.0", "one on one:1.0",
      "headcount:1.0", "span of control:1.0",
      // Metrics & process
      "sprint cadence:1.5", "backlog refinement:1.0",
      "cycle time:1.0", "throughput:1.0", "burndown:1.0",
      "error budget:1.0", "bus factor:1.5",
      // Delivery & technical
      "CI CD:1.5", "monorepo:1.5", "microservices:1.0",
      "agile:1.0", "waterfall:1.0",
      // System design terms
      "sharding:1.5", "partitioning:1.0", "load balancer:1.5",
      "CAP theorem:1.5", "consistent hashing:1.5",
      "CDN:1.5", "WebSocket:1.5", "Kafka:1.5",
      "Redis:1.5", "Cassandra:1.5", "DynamoDB:1.5",
      "PostgreSQL:1.5", "MongoDB:1.0",
      "API gateway:1.5", "rate limiting:1.5",
      "idempotent:1.5", "eventual consistency:1.5",
      "replication:1.0", "failover:1.0",
      "latency:1.0", "throughput:1.0",
      "horizontal scaling:1.5", "vertical scaling:1.0",
      "message queue:1.5", "pub sub:1.5",
      "blob storage:1.5", "object store:1.0",
      "fanout:1.5", "denormalization:1.5",
      "write-ahead log:1.5", "LSM tree:1.5",
      "B-tree:1.5", "inverted index:1.5",
      // Coding interview terms
      "binary search:1.5", "dynamic programming:1.5",
      "sliding window:1.5", "two pointer:1.5",
      "hash map:1.0", "linked list:1.0",
      "breadth first:1.5", "depth first:1.5",
      "Big O:1.5", "time complexity:1.0",
      "recursion:1.0", "memoization:1.5",
      "topological sort:1.5", "heap:1.0", "trie:1.5",
    ].map(k => "keyterm=" + encodeURIComponent(k.replace(/:[0-9.]+$/, ""))),
  ].join("&");

  const dgWs = new WebSocket(dgUrl, {
    headers: { Authorization: `Token ${DEEPGRAM_KEY}` },
  });

  let dgReady = false;

  dgWs.on("open", () => {
    dgReady = true;
    clientWs.send(JSON.stringify({ type: "ready" }));
    log("DEEPGRAM", "connected to Deepgram API");
  });

  dgWs.on("message", (data) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.type === "Results" && msg.channel) {
        const alt = msg.channel.alternatives[0];
        if (!alt || !alt.transcript) return;

        const isFinal = msg.is_final;
        const speechFinal = msg.speech_final;
        const transcript = alt.transcript;

        const words = (alt.words || []).map(w => ({
          word: w.word,
          start: w.start,
          end: w.end,
          speaker: w.speaker,
          confidence: w.confidence,
        }));

        const speakers = [...new Set(words.map(w => w.speaker).filter(s => s !== undefined))];

        clientWs.send(JSON.stringify({
          type: "transcript",
          transcript,
          isFinal,
          speechFinal,
          speakers,
          words,
        }));
      }

      if (msg.type === "UtteranceEnd") {
        clientWs.send(JSON.stringify({ type: "utterance_end" }));
      }
    } catch (e) {
      log("DEEPGRAM", `parse error: ${e.message}`);
    }
  });

  dgWs.on("close", () => {
    log("DEEPGRAM", "Deepgram connection closed");
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({ type: "closed" }));
      clientWs.close();
    }
  });

  dgWs.on("error", (e) => {
    log("DEEPGRAM", `error: ${e.message}`);
    clientWs.send(JSON.stringify({ type: "error", message: e.message }));
  });

  let audioChunks = 0;
  clientWs.on("message", (data) => {
    if (dgReady && dgWs.readyState === WebSocket.OPEN) {
      dgWs.send(data);
      audioChunks++;
      if (audioChunks === 1) log("DEEPGRAM", `receiving audio (first chunk: ${data.length} bytes)`);
      if (audioChunks % 100 === 0) log("DEEPGRAM", `audio chunks forwarded: ${audioChunks}`);
    }
  });

  clientWs.on("close", () => {
    log("DEEPGRAM", "client disconnected");
    if (dgWs.readyState === WebSocket.OPEN) {
      dgWs.close();
    }
  });
});

// Attach Deepgram WebSocket to HTTPS server too (for mobile)
if (httpsServer) {
  const wssHttps = new WebSocket.Server({ server: httpsServer, path: "/ws/deepgram" });
  wssHttps.on("connection", (clientWs) => {
    wss.emit("connection", clientWs);
  });
}

server.listen(PORT, () => {
  console.log(`\n  Voice Q&A — Interview Coach`);
  console.log(`  http://localhost:${PORT}\n`);
  console.log(`  System Design: http://localhost:${PORT}/`);
  console.log(`  Coding:        http://localhost:${PORT}/coding.html`);
  console.log(`  Behavioral:    http://localhost:${PORT}/behavioral.html\n`);
  console.log(`  /api/analyze             — system design detection`);
  console.log(`  /api/answer              — system design answers`);
  console.log(`  /api/coding/analyze      — coding problem detection`);
  console.log(`  /api/coding/answer       — coding answers`);
  console.log(`  /api/behavioral/analyze  — behavioral question detection`);
  console.log(`  /api/behavioral/data     — behavioral story bank`);
  console.log(`  /api/state               — view conversation state`);
  console.log(`  /api/reset               — reset state`);
  console.log(`  /ws/deepgram             — Deepgram speech WebSocket${DEEPGRAM_KEY && DEEPGRAM_KEY !== "your-deepgram-key-here" ? " ✓" : " (no key)"}\n`);

  if (httpsServer) {
    httpsServer.listen(HTTPS_PORT, () => {
      console.log(`  HTTPS (for mobile): https://localhost:${HTTPS_PORT}`);
      console.log(`  iPad/mobile:        https://192.168.68.64:${HTTPS_PORT}/behavioral.html?speech=deepgram\n`);
    });
  }
});
