import express from "express";
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/google-genai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import wav from "wav";
import { z } from "zod";
import { spawn } from "child_process";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const router = express.Router();

// ── GenAI Keys & Rotation ───────────────────────────────────────────────────
const getGeminiKeys = () => {
  const keys = [];
  if (process.env.GEMINI_API_KEY) {
    keys.push(...process.env.GEMINI_API_KEY.split(",").map(k => k.trim()).filter(Boolean));
  }
  if (process.env.GEMINI_API_KEY_BACKUP) {
    keys.push(...process.env.GEMINI_API_KEY_BACKUP.split(",").map(k => k.trim()).filter(Boolean));
  }
  if (process.env.GEMINI_API_KEY_V2) {
    keys.push(...process.env.GEMINI_API_KEY_V2.split(",").map(k => k.trim()).filter(Boolean));
  }
  return [...new Set(keys)];
};

let currentGeminiKeyIdx = 0;

// ── In-Memory Fast Caching (Prevents repeated LLM calls & redundant re-renders) ─
const itineraryCache = new Map();
const chatCache = new Map();
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 Hours

// ── Genkit AI initialisation (for chat & TTS) ────────────────────────────────
const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY?.split(",")[0] || "" })],
  model: "googleai/gemini-2.5-flash",
});

const aiBackup = genkit({
  plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY_BACKUP?.split(",")[0] || "" })],
  model: "googleai/gemini-2.5-flash",
});

// ── Groq LLM with Automatic Key Rotation & Model Fallback ───────────────────
const getGroqKeys = () => {
  const raw = process.env.GROQ_API_KEY || "";
  return raw.split(",").map(k => k.trim()).filter(Boolean);
};

let currentGroqKeyIdx = 0;

async function callGroqChat(messages, systemPrompt = "", jsonMode = false) {
  const keys = getGroqKeys();
  if (keys.length === 0) throw new Error("No Groq API keys configured");

  const groqModels = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "openai/gpt-oss-20b",
    "openai/gpt-oss-120b",
    "groq/compound-mini"
  ];
  
  const fullMessages = [];
  if (systemPrompt) {
    fullMessages.push({ role: "system", content: systemPrompt });
  }
  fullMessages.push(...messages);

  let lastError = null;
  for (let attempt = 0; attempt < keys.length; attempt++) {
    const keyIdx = (currentGroqKeyIdx + attempt) % keys.length;
    const key = keys[keyIdx];

    for (const model of groqModels) {
      try {
        const payload = {
          model,
          messages: fullMessages,
          temperature: 0.3,
          max_tokens: 4096,
        };
        if (jsonMode) {
          payload.response_format = { type: "json_object" };
        }

        const res = await withTimeout(
          axios.post("https://api.groq.com/openai/v1/chat/completions", payload, {
            headers: {
              "Authorization": `Bearer ${key}`,
              "Content-Type": "application/json",
            },
            timeout: 15000,
          }),
          15000,
          `Groq ${model}`
        );

        const content = res.data?.choices?.[0]?.message?.content;
        if (content) {
          currentGroqKeyIdx = keyIdx; // Stick with working key
          return content;
        }
      } catch (err) {
        lastError = err;
        const isRateLimit = err.response?.status === 429 || err.message?.includes("429");
        if (isRateLimit) {
          console.warn(`[Groq] Rate limit (429) on key ${keyIdx} (${model}). Rotating to next key...`);
          break; // Rotate key immediately
        }
      }
    }
  }
  throw lastError || new Error("All Groq keys and models failed");
}

// ── Google AI SDK Helper with Key Rotation ──────────────────────────────────
async function callGeminiDirect(prompt, jsonMode = true) {
  const keys = getGeminiKeys();
  if (keys.length === 0) throw new Error("No Gemini API keys configured");

  let lastErr = null;
  for (let i = 0; i < keys.length; i++) {
    const idx = (currentGeminiKeyIdx + i) % keys.length;
    const key = keys[idx];
    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: jsonMode ? { responseMimeType: "application/json" } : {}
      });
      const result = await withTimeout(model.generateContent(prompt), 10000, "Gemini 2.5 Flash");
      const text = result?.response?.text();
      if (text) {
        currentGeminiKeyIdx = idx; // Keep working key
        return text;
      }
    } catch (err) {
      lastErr = err;
      console.warn(`[Gemini] Key index ${idx} failed: ${err.message}. Rotating...`);
    }
  }
  throw lastErr || new Error("All Gemini keys exhausted");
}

// Helper to race promise against timeout
function withTimeout(promise, ms, label = "Operation") {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms))
  ]);
}

// ── Helper: PCM buffer → base64 WAV ─────────────────────────────────────────
function toWav(pcmData, channels = 1, rate = 24000, sampleWidth = 2) {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({ channels, sampleRate: rate, bitDepth: sampleWidth * 8 });
    const bufs = [];
    writer.on("error", reject);
    writer.on("data", (d) => bufs.push(d));
    writer.on("end", () => resolve(Buffer.concat(bufs).toString("base64")));
    writer.write(pcmData);
    writer.end();
  });
}

// ── SerpAPI: fetch real hotels for a destination ─────────────────────────────
async function fetchRealHotels(destination, checkIn, checkOut, budget) {
  if (!process.env.SERP_API_KEY) return [];
  try {
    const res = await axios.get("https://serpapi.com/search.json", {
      params: {
        engine: "google_hotels",
        q: `Hotels in ${destination}`,
        check_in_date: checkIn,
        check_out_date: checkOut,
        adults: 2,
        currency: "INR",
        hl: "en",
        gl: "in",
        api_key: process.env.SERP_API_KEY,
      },
      timeout: 6000,
    });

    const properties = res.data.properties || [];
    if (properties.length === 0) return [];

    // Categorize into Budget (<₹1800), Mid-range (₹1800-₹4000), Luxury (>₹4000)
    const validProps = properties.map(h => ({
      name: h.name,
      rating: h.overall_rating ? `${h.overall_rating}/5 (${h.reviews || 0} reviews)` : "4.2/5",
      pricePerNight: h.rate_per_night?.lowest || "₹1,800",
      numericPrice: h.rate_per_night?.extracted_lowest || 1800,
      type: (h.rate_per_night?.extracted_lowest || 0) > 4000 ? "Luxury" : ((h.rate_per_night?.extracted_lowest || 0) < 1800 ? "Budget" : "Mid-range"),
      highlights: h.amenities ? h.amenities.slice(0, 3).join(", ") : "Verified accommodation near sacred sites",
    }));

    // Sort by price ascending
    validProps.sort((a, b) => a.numericPrice - b.numericPrice);

    const budgetHotel = validProps.find(h => h.numericPrice <= 2000) || validProps[0];
    const luxuryHotel = validProps.slice().reverse().find(h => h.numericPrice >= 3500) || validProps[validProps.length - 1];
    const midHotel = validProps.find(h => h !== budgetHotel && h !== luxuryHotel) || validProps[Math.floor(validProps.length / 2)];

    return [
      { ...budgetHotel, type: "Budget" },
      { ...midHotel, type: "Mid-range" },
      { ...luxuryHotel, type: "Luxury" },
    ].filter(Boolean);
  } catch (err) {
    console.warn("[SerpAPI] Hotels fetch skipped/failed:", err.message);
    return [];
  }
}

// ── SerpAPI: fetch real transport options (Trains + Buses) ───────────────────
async function fetchRealTransport(origin, destination) {
  if (!process.env.SERP_API_KEY) return [];
  try {
    const [trainRes, busRes, flightRes] = await Promise.allSettled([
      axios.get("https://serpapi.com/search.json", {
        params: {
          engine: "google",
          q: `train from ${origin} to ${destination} schedule timing train number fare irctc`,
          gl: "in", hl: "en",
          api_key: process.env.SERP_API_KEY,
        },
        timeout: 6000,
      }),
      axios.get("https://serpapi.com/search.json", {
        params: {
          engine: "google",
          q: `bus from ${origin} to ${destination} timetable operators departure arrival fare redbus`,
          gl: "in", hl: "en",
          api_key: process.env.SERP_API_KEY,
        },
        timeout: 6000,
      }),
      axios.get("https://serpapi.com/search.json", {
        params: {
          engine: "google",
          q: `flight from ${origin} to nearest airport ${destination} fare indigo spicejet air india`,
          gl: "in", hl: "en",
          api_key: process.env.SERP_API_KEY,
        },
        timeout: 6000,
      }),
    ]);

    const snippets = [];
    const extractData = (res, type) => {
      if (res.status === "fulfilled" && res.value?.data) {
        const d = res.value.data;
        if (d.answer_box) {
          const text = d.answer_box.snippet || d.answer_box.answer || d.answer_box.title;
          if (text) snippets.push(`[${type} SUMMARY]: ${text}`);
        }
        if (d.knowledge_graph?.description) {
          snippets.push(`[${type} OVERVIEW]: ${d.knowledge_graph.description}`);
        }
        (d.organic_results || []).slice(0, 4).forEach((r) => {
          snippets.push(`[${type} OPTION]: ${r.title} — ${(r.snippet || "").slice(0, 200)}`);
        });
      }
    };

    extractData(trainRes, "TRAIN");
    extractData(busRes, "BUS");
    extractData(flightRes, "FLIGHT");

    return snippets;
  } catch (err) {
    console.warn("[SerpAPI] Transport fetch skipped/failed:", err.message);
    return [];
  }
}

// ── POST /api/v1/chatbot/chat ────────────────────────────────────────────────
router.post("/chat", async (req, res) => {
  try {
    const { history = [], language = "English" } = req.body;

    if (!Array.isArray(history)) {
      return res.status(400).json({ error: "history must be an array" });
    }

    const latestMessage = history.length > 0 ? history[history.length - 1].content : "";
    const lowerMsg = latestMessage.toLowerCase().trim();

    // ── Hardcoded Responses for Predefined Buttons ──────────────────────────────
    const hardcodedResponses = {
      // Mahakaleshwar
      "mahakaleshwar visit": "Mahakaleshwar Jyotirlinga is one of the most sacred shrines. Bhasma Aarti starts at 4 AM (pre-booking required). General Darshan takes 1-3 hours depending on the queue. You can carry only water inside.",
      "महाकालेश्वर दर्शन": "महाकालेश्वर ज्योतिर्लिंग सबसे पवित्र स्थलों में से एक है। भस्म आरती सुबह 4 बजे शुरू होती है (प्री-बुकिंग अनिवार्य है)। सामान्य दर्शन में कतार के अनुसार 1-3 घंटे लगते हैं। अंदर केवल जल ले जाने की अनुमति है।",

      // Food
      "best food in ujjain": "Ujjain is famous for Poha-Jalebi at Tower Chowk, Sabudana Khichdi, and Malpua. Don't forget to try the legendary Thali at Shri Ganga or the street food near Mahakal Temple.",
      "उज्जैन का प्रसिद्ध भोजन": "उज्जैन अपने पोहा-जलेबी (टावर चौक), साबूदाना खिचड़ी और मालपुआ के लिए प्रसिद्ध है। श्री गंगा की थाली और महाकाल मंदिर के पास मिलने वाले स्ट्रीट फूड का आनंद जरूर लें।",

      // 2-day itinerary
      "2-day itinerary": "Day 1: Mahakaleshwar Bhasma Aarti, Harsiddhi Temple, and Kshipra River Aarti. Day 2: Kal Bhairav, Mangalnath Temple, and Sandipani Ashram. Have a peaceful journey!",
      "2 दिनों की यात्रा": "दिन 1: महाकालेश्वर भस्म आरती, हरसिद्धि मंदिर और क्षिप्रा तट पर आरती। दिन 2: काल भैरव, मंगलनाथ मंदिर और सांदीपनि आश्रम। आपकी यात्रा मंगलमय हो!",

      // Timings
      "temple timings": "Most temples open at 5:00 AM and close at 10:00 PM. Mahakaleshwar opens at 4:00 AM for Bhasma Aarti and closes at 11:00 PM after Shayan Aarti.",
      "मंदिरों का समय": "अधिकांश मंदिर सुबह 5:00 बजे खुलते हैं और रात 10:00 बजे बंद होते हैं। महाकालेश्वर मंदिर भस्म आरती के लिए सुबह 4:00 बजे खुलता है और शयन आरती के बाद रात 11:00 बजे बंद होता है।",

      // Emergency
      "emergency helpline": "Ujjain Police: 100, Ambulance: 108, Mahakal Temple Office: +91-734-2550563. Stay safe, Pilgrim!",
      "हेल्पलाइन नंबर": "उज्जैन पुलिस: 100, एम्बुलेंस: 108, महाकाल मंदिर कार्यालय: +91-734-2550563। अपनी सुरक्षा का ध्यान रखें!",
    };

    // ── Check chat cache (Instant response, NO repeated LLM calls) ─────────────
    const chatKey = `${language}_${JSON.stringify(history)}`.toLowerCase();
    const cachedChat = chatCache.get(chatKey);
    if (cachedChat && (Date.now() - cachedChat.timestamp < 1000 * 60 * 30)) {
      return res.json({ data: cachedChat.data });
    }

    if (hardcodedResponses[lowerMsg]) {
      const respData = { response: hardcodedResponses[lowerMsg] };
      chatCache.set(chatKey, { timestamp: Date.now(), data: respData });
      return res.json({ data: respData });
    }

    const systemPrompt = `You are RoamAI, a friendly and helpful travel planning assistant for DivyaYatra. Your goal is to have a conversation with the user to gather the necessary information to plan their pilgrimage trip.

You need to ask for the following details:
- Origin (where the user is traveling from)
- Destination
- Departure Date
- Arrival Date
- Number of People
- Budget (e.g., Modest, Luxury, Budget)
- Travel Style (e.g., Peaceful, Devotional, Cultural, Adventure)

Keep your responses concise and conversational.
Always respond in the language specified by the user: ${language}.

If you have all the information, summarize it for the user and return a JSON object with:
{
  "response": "Your conversational reply here",
  "itineraryInput": {
    "origin": "string",
    "destination": "string",
    "departureDate": "string",
    "arrivalDate": "string",
    "numberOfPeople": number,
    "budget": "string",
    "style": "string"
  }
}
If information is still missing, set itineraryInput to undefined or omit it, and ask for the missing detail.`;

    const messages = history.map((m) => ({
      role: m.role === "model" ? "assistant" : "user",
      content: m.content,
    }));

    if (messages.length === 0) {
      return res.json({
        data: {
          response: language === "Hindi"
            ? "नमस्ते! मैं RoamAI हूँ। शुरू करते हैं — आप कहाँ से यात्रा करना चाहते हैं?"
            : "Hello! I am RoamAI. Let's get started — where are you traveling from?"
        }
      });
    }

    // Try Groq first for ultra-fast chat
    try {
      const groqRaw = await callGroqChat(messages, systemPrompt, true);
      let parsed = JSON.parse(groqRaw);
      if (parsed) {
        chatCache.set(chatKey, { timestamp: Date.now(), data: parsed });
        return res.json({ data: parsed });
      }
    } catch (groqErr) {
      console.warn("Groq failed for /chat, retrying with Gemini Genkit:", groqErr.message);
    }

    // Backup to Gemini
    const genkitMessages = history.map((m) => ({
      role: m.role === "model" ? "model" : "user",
      content: [{ text: m.content }],
    }));

    const generatePayload = {
      system: systemPrompt,
      messages: genkitMessages,
      output: {
        schema: z.object({
          response: z.string().describe("The AI response text"),
          itineraryInput: z.object({
            origin: z.string().optional(),
            destination: z.string().optional(),
            departureDate: z.string().optional(),
            arrivalDate: z.string().optional(),
            numberOfPeople: z.number().optional(),
            budget: z.string().optional(),
            style: z.string().optional(),
          }).optional(),
        }),
      },
    };

    let output;
    try {
      const result = await withTimeout(ai.generate(generatePayload), 8000, "Primary AI");
      output = result.output;
    } catch (primaryErr) {
      console.warn("Primary AI failed for /chat, retrying with backup. Error:", primaryErr.message);
      try {
        const result = await withTimeout(aiBackup.generate(generatePayload), 8000, "Backup AI");
        output = result.output;
      } catch (backupErr) {
        output = {
          response: language === "Hindi"
            ? "नमस्ते! मैं आपकी तीर्थयात्रा की योजना बनाने में पूरी सहायता करूँगा। कृपया अपना प्रस्थान शहर, गंतव्य, और यात्रा की तिथि बताएं।"
            : "Welcome to DivyaYatra! I am here to help you plan your sacred pilgrimage. Please share your departure city, destination, and travel dates.",
        };
      }
    }

    return res.json({ data: output });
  } catch (err) {
    console.error("Chatbot /chat error:", err);
    return res.status(500).json({ error: err.message || "Failed to get chat response" });
  }
});

// ── POST /api/v1/chatbot/itinerary ───────────────────────────────────────────
router.post("/itinerary", async (req, res) => {
  try {
    const {
      origin, destination, departureDate, arrivalDate,
      numberOfPeople, budget, style, language = "English"
    } = req.body;

    if (!origin || !destination || !departureDate || !arrivalDate) {
      return res.status(400).json({ error: "origin, destination, departureDate, and arrivalDate are required" });
    }

    const isHindi = language === "Hindi" || language === "hi" || language === "hindi";
    const pilgrims = Number(numberOfPeople) || 2;

    // ── 1. Check In-Memory Cache (Instant response, NO repeated LLM calls) ────
    const cacheKey = `itinerary_${origin}_${destination}_${departureDate}_${arrivalDate}_${pilgrims}_${budget}_${style}_${language}`.toLowerCase().replace(/\s+/g, '_');
    const cachedEntry = itineraryCache.get(cacheKey);
    if (cachedEntry && (Date.now() - cachedEntry.timestamp < CACHE_TTL_MS)) {
      console.log(`[Itinerary Cache] Serving instant cached itinerary for ${cacheKey}`);
      return res.json({ data: cachedEntry.data });
    }

    // ── 2. Fetch real-world data from SerpAPI in parallel (with short timeout) ─
    console.log(`[SerpAPI] Fetching real hotels in ${destination} and transport from ${origin}...`);
    let hotels = [];
    let transportSnippets = [];
    try {
      [hotels, transportSnippets] = await Promise.all([
        fetchRealHotels(destination, departureDate, arrivalDate, budget),
        fetchRealTransport(origin, destination),
      ]);
    } catch (e) {
      console.warn("[SerpAPI] Data fetch failed:", e.message);
    }
    console.log(`[SerpAPI] Successfully fetched ${hotels.length} real categorized hotels and ${transportSnippets.length} transport snippets`);

    // Detect if short distance
    const origLower = origin.toLowerCase();
    const destLower = destination.toLowerCase();
    const isShortDistance =
      (origLower.includes("indore") && destLower.includes("ujjain")) ||
      (origLower.includes("ujjain") && destLower.includes("indore")) ||
      (origLower.includes("haridwar") && destLower.includes("rishikesh")) ||
      (origLower.includes("mathura") && destLower.includes("vrindavan")) ||
      (origLower.includes("varanasi") && destLower.includes("sarnath"));

    // Build context blocks to inject into the AI prompt
    const hotelContext = hotels.length > 0
      ? `\nREAL VERIFIED HOTELS from SerpAPI / Google Hotels in ${destination} (YOU MUST USE THESE EXACT 3 HOTELS in accommodation_options):\n` +
        hotels.map((h, i) => `  ${i + 1}. [${h.type}] "${h.name}" | Rating: "${h.rating}" | Price/Night: "${h.pricePerNight}" | Amenities: ${h.highlights}`).join("\n")
      : "";

    const transportContext = transportSnippets.length > 0
      ? `\nREAL TRANSPORT SCHEDULE & OPERATORS (IRCTC Trains & RedBus) from ${origin} to ${destination} from Google/SerpAPI:\n` +
        transportSnippets.map(s => `  - ${s}`).join("\n")
      : "";

    const transitRules = isShortDistance
      ? `CRITICAL SHORT-DISTANCE TRANSIT RULE: The distance between ${origin} and ${destination} is very short (~55 km). DO NOT SUGGEST AIRPLANES / FLIGHTS. Instead, the 3 travel options MUST be:
1. Bus: AC Express Intercity / Chartered City Bus (AICTSL / Atal Indore City Transport via 4-lane expressway, every 15 mins, 1 hr 15 mins, ₹120-₹180/person)
2. Train: Superfast Intercity / Passenger Train (Indore Jn → Ujjain Jn direct, 1 hr 10 mins, ₹70-₹150/person)
3. Cab/Taxi: Private AC Doorstep Cab / Taxi (Direct highway route via Sanwer Road, 55 mins, ₹1,200 - ₹1,600 per cab)`
      : `LONG-DISTANCE TRANSIT RULE:
1. Bus: Multi-Axle AC Sleeper Bus (e.g. Kalpana / Shrinath / Hans Travels) with departure/arrival times & fare.
2. Train: Superfast / Vande Bharat / Express Train (IRCTC Train name & number, e.g. 12919 Malwa Express) with timings & 3A/2A fare.
3. Flight: Flight connecting nearest airport to origin → nearest airport to destination (e.g. Devi Ahilyabai Holkar Airport Indore - IDR for Ujjain) + pre-booked airport taxi.`;

    const languageInstruction = isHindi
      ? `CRITICAL LANGUAGE REQUIREMENT: ALL output fields (title, destination, departureDate, arrivalDate, budget, style, total_estimated_cost, notes, daily_plan.title, daily_plan.subtitle, daily_plan.estimated_cost, daily_plan.activities, daily_plan.accommodation_options.highlights, daily_plan.transportation_options.details, daily_plan.transportation_options.price) MUST BE WRITTEN IN NATURAL, ELEGANT, RESPECTFUL HINDI (देवनागरी लिपि). Hotel names can retain original English/Hindi names.`
      : `Language: Generate all textual content in fluent, professional English.`;

    const prompt = `You are the master spiritual pilgrimage trip planner for DivyaYatra.
Generate a deeply detailed, authentic, day-wise pilgrimage travel itinerary as a valid JSON object ONLY.

Travel Parameters:
- Starting City (Origin): ${origin}
- Holy Destination: ${destination}
- Departure Date: ${departureDate}
- Return/Arrival Date: ${arrivalDate}
- Total Pilgrims: ${pilgrims}
- Budget Style: ${budget || "Comfortable"}
- Journey Intent: ${style || "Devotional & Peaceful"}
- Language: ${isHindi ? "Hindi" : "English"}

${languageInstruction}
${transitRules}
${hotelContext}
${transportContext}

CRITICAL CONTENT & RICHNESS GUIDELINES:
1. TITLE: Create an auspicious, culturally resonant title (e.g., "${destination} पावन तीर्थयात्रा: ${origin} से दिव्य दर्शन एवं अनुष्ठान").
2. TOTAL ESTIMATED COST: Realistic comprehensive calculation for ${pilgrims} pilgrims including travel tickets, hotel stays, sattvic meals, auto transfers, and puja prasad (e.g. ₹${pilgrims * 2800} - ₹${pilgrims * 3800} for ${pilgrims} travelers).
3. DETAILED ACTIVITIES & RITUALS (4 to 6 descriptive milestones per day):
   - Do NOT give generic 3-word bullet points! Each activity must be an authentic, detailed, 20-40 word sentence with specific timings, traditional dress code instructions, sacred offerings, and spiritual significance.
   - For Ujjain / Mahakaleshwar: Include Mahakaleshwar Bhasma Aarti (04:00 AM) & Panchamrit Jalabhishek (Dhoti/Saree dress code), Ram Ghat holy Kshipra dip & Surya Arghya, 51 Shaktipeeth Maa Harsiddhi Temple & evening 1011 Deepstambh lighting, Kal Bhairav Temple with sacred Raksha Sutra & Naivedya, Sandipani Ashram (where Lord Krishna studied), Mangalnath Temple, Chintaman Ganesh, and evening Mahakal Lok Corridor walk.
   - For Varanasi / Kashi: Include Kashi Vishwanath Mangala Aarti & Sugam Darshan, Maa Annapurna blessing, sunrise Dashashwamedh boat ride, Manikarnika Ghat, Kaal Bhairav (Kotwal of Kashi), evening grand Ganga Aarti.
   - For Ayodhya: Include Ram Janmabhoomi Ram Lalla darshan, Hanuman Garhi flag offering, Kanak Bhawan Sita-Ram darshan, Ram Ki Paidi & evening Saryu Maha Aarti.
4. ACCOMMODATION OPTIONS:
   - On Middle/Darshan Days: Provide EXACTLY 3 categorized tiers (Budget, Mid-range, Luxury) using the REAL HOTELS from the SerpAPI list above with exact real names, prices, ratings, and unique highlights.
   - On Travel Days: 1 entry: name="During transit", type="Transit", rating="N/A", price="Included in transit", highlights="Comfortable journey in transit".
   - On Return Day: 1 entry: name="None (Return departure)", type="Transit", rating="N/A", price="N/A", highlights="Safe return journey".
5. TRANSPORTATION OPTIONS:
   - Travel Days (Day 1 departure & last day return): Provide EXACT 3 options adhering to the TRANSIT RULES above.
   - Middle Sightseeing Days: Provide local transport options (Temple E-Rickshaw, Auto-rickshaw, Local AC Cab) with full-day circuit details and realistic fares.
6. NOTES & PRACTICAL GUIDELINES: 3-4 rich paragraphs with official aarti booking portals, traditional dress codes, locker facilities, sattvic food spots, and emergency numbers.

Return ONLY this valid JSON schema:
{
  "itinerary": {
    "title": "string",
    "destination": "string",
    "departureDate": "string",
    "arrivalDate": "string",
    "numberOfPeople": number,
    "budget": "string",
    "style": "string",
    "total_estimated_cost": "string",
    "notes": "string",
    "daily_plan": [
      {
        "day": 1,
        "title": "string",
        "subtitle": "string",
        "estimated_cost": "string",
        "activities": [
          "Detailed descriptive milestone 1 with timings, rituals and guidance...",
          "Detailed descriptive milestone 2..."
        ],
        "accommodation_options": [
          { "name": "string", "rating": "string", "price": "string", "type": "Budget", "highlights": "string" },
          { "name": "string", "rating": "string", "price": "string", "type": "Mid-range", "highlights": "string" },
          { "name": "string", "rating": "string", "price": "string", "type": "Luxury", "highlights": "string" }
        ],
        "transportation_options": [
          { "mode": "Bus", "icon": "bus", "operator": "string", "details": "string", "departure": "string", "arrival": "string", "price": "string", "available": true },
          { "mode": "Train", "icon": "train", "operator": "string", "details": "string", "departure": "string", "arrival": "string", "price": "string", "available": true },
          { "mode": "Flight", "icon": "plane", "operator": "string", "details": "string", "departure": "string", "arrival": "string", "price": "string", "available": true }
        ]
      }
    ]
  }
}`;

    // Calculate expected days
    let expectedDays = 3;
    try {
      const d1 = new Date(departureDate);
      const d2 = new Date(arrivalDate);
      const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
      if (diff >= 1 && diff <= 7) expectedDays = diff;
    } catch (e) {
      expectedDays = 3;
    }

    // ── 3. Direct Groq LLM Generation (Fast, High Rate-Limit, No Gemini 429) ──
    let text = null;

    try {
      console.log("[Itinerary] Generating authentic itinerary directly with Groq LLM pool...");
      text = await callGroqChat(
        [{ role: "user", content: prompt }],
        "You are an expert Vedic pilgrimage trip planner for DivyaYatra. Generate an exceptionally detailed, authentic, and culturally rich pilgrimage itinerary in valid JSON format only.",
        true
      );
      console.log("[Itinerary] Groq generation successful!");
    } catch (groqErr) {
      console.warn("[Itinerary] Groq LLM failed, activating authentic Pilgrim Knowledge Base:", groqErr.message);
    }

    // ── 4. Parse JSON response or activate Fallback ───────────────────────────
    let parsed = null;
    if (text) {
      try {
        let clean = text.trim();
        const firstBrace = clean.indexOf("{");
        const lastBrace = clean.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1) {
          clean = clean.substring(firstBrace, lastBrace + 1);
        }
        parsed = JSON.parse(clean);
      } catch (parseErr) {
        console.error("JSON parse error:", parseErr.message);
      }
    }

    // Strict validation: Ensure all requested days exist with rich descriptive activities
    const isValidItinerary =
      parsed &&
      parsed.itinerary &&
      Array.isArray(parsed.itinerary.daily_plan) &&
      parsed.itinerary.daily_plan.length >= expectedDays &&
      parsed.itinerary.daily_plan.every(d => Array.isArray(d.activities) && d.activities.length >= 3);

    if (!isValidItinerary) {
      console.log(`[Itinerary Fallback] Activating comprehensive authentic pilgrimage itinerary for ${destination} from ${origin} with SerpAPI data...`);
      parsed = generateFallbackItinerary(destination, origin, departureDate, arrivalDate, numberOfPeople, budget, style, language, hotels, transportSnippets);
    }

    // ── 5. Cache result to prevent repeated LLM calls ────────────────────────
    if (parsed) {
      itineraryCache.set(cacheKey, { timestamp: Date.now(), data: parsed });
    }

    return res.json({ data: parsed });
  } catch (err) {
    console.error("Chatbot /itinerary caught error:", err.message || err);
    try {
      const fallback = generateFallbackItinerary(
        req.body?.destination || "Ujjain",
        req.body?.origin || "Indore",
        req.body?.departureDate || "2026-09-10",
        req.body?.arrivalDate || "2026-09-12",
        req.body?.numberOfPeople || 2,
        req.body?.budget || "Comfortable",
        req.body?.style || "Devotional",
        req.body?.language || "English"
      );
      return res.json({ data: fallback });
    } catch (_) {
      return res.status(500).json({ error: "Failed to generate itinerary. Please try again." });
    }
  }
});


// ── Destination Knowledge Base for Authentic Fallback ────────────────────────
const PILGRIM_DESTINATIONS = {
  ujjain: {
    name: "Ujjain",
    state: "Madhya Pradesh",
    nameHi: "उज्जैन (महाकाल नगरी)",
    rituals: [
      {
        titleEn: "Mahakaleshwar Jyotirlinga Darshan & Holy Ghats",
        titleHi: "महाकालेश्वर ज्योतिर्लिंग दर्शन एवं पावन क्षिप्रा आरती",
        subtitleEn: "Bhasma Aarti, Shaktipeeth & Sacred Temple Circuit",
        subtitleHi: "भस्म आरती, हरसिद्धि शक्तिपीठ एवं काल भैरव दर्शन",
        activitiesEn: [
          "Early morning Bhasma Aarti (04:00 AM) and sacred Jalabhishek at Mahakaleshwar Jyotirlinga",
          "Holy dip and prayer rituals at Ram Ghat along the sacred Kshipra River",
          "Darshan at sacred Maa Harsiddhi Shaktipeeth Temple (51 Peethas)",
          "Special prayers and customary offerings at historic Kal Bhairav Temple",
          "Mesmerizing evening Sandhya Maha Aarti at Triveni Ghat"
        ],
        activitiesHi: [
          "प्रातः 04:00 बजे महाकालेश्वर ज्योतिर्लिंग भस्म आरती एवं विशेष जलाभिषेक",
          "राम घाट पर पावन क्षिप्रा नदी में स्नान एवं सूर्य अर्घ्य",
          "51 शक्तिपीठों में से एक - माँ हरसिद्धि माता मंदिर दर्शन",
          "काल भैरव मंदिर में विशेष पूजा एवं मदिरा/मिठाई अर्पण",
          "संध्या काल में त्रिवेणी घाट पर महाआरती दर्शन"
        ],
        hotels: [
          { name: "Shree Mahakal Dharamshala & Yatri Niwas", rating: "4.3/5 (340 reviews)", price: "₹850", type: "Budget", highlights: "5 mins walk to Temple Sanctum, clean AC rooms" },
          { name: "Hotel Ashoka Palace & Suites", rating: "4.6/5 (520 reviews)", price: "₹2,200", type: "Mid-range", highlights: "Complimentary sattvic breakfast, 24/7 travel desk" },
          { name: "Anjushree Spiritual Heritage Resort", rating: "4.9/5 (210 reviews)", price: "₹5,200", type: "Luxury", highlights: "5-star luxury, ayurvedic wellness & garden suites" }
        ]
      },
      {
        titleEn: "Mangalnath, Sandipani Ashram & Sacred Heritage",
        titleHi: "मंगलनाथ, सांदीपनि आश्रम एवं पावन धरोहर",
        subtitleEn: "Planetary blessings, Krishna's learning seat and Chintaman Ganesh",
        subtitleHi: "ग्रह दोष निवारण, श्रीकृष्ण शिक्षा स्थली एवं चिंतामण गणेश दर्शन",
        activitiesEn: [
          "Morning visit to historic Mangalnath Temple (Navagraha peace prayers)",
          "Darshan at Maharishi Sandipani Ashram (where Lord Krishna studied)",
          "Seeking auspicious blessings at sacred Chintaman Ganesh Temple",
          "Visiting Gadkalika Temple and Bhartrihari Caves",
          "Purchasing authentic local prasad, Mahakal rudraksha, and souvenirs near Gopal Mandir"
        ],
        activitiesHi: [
          "मंगलनाथ मंदिर में मंगल शांति पूजा एवं दर्शन",
          "भगवान श्रीकृष्ण की पावन शिक्षा स्थली महर्षि सांदीपनि आश्रम दर्शन",
          "चिंतामण गणेश मंदिर में सुख-समृद्धि हेतु आशीर्वाद प्राप्त करना",
          "गढ़कालिका मंदिर एवं भर्तृहरि गुफाओं का भ्रमण",
          "गोपाल मंदिर बाजार से प्रामाणिक महाकाल प्रसाद, रुद्राक्ष एवं स्मृति चिन्ह खरीदना"
        ],
        hotels: [
          { name: "Avantika Tourist Guest House", rating: "4.1/5 (180 reviews)", price: "₹950", type: "Budget", highlights: "Near Railway Station, quiet and hygienic" },
          { name: "Hotel Imperial Grand Ujjain", rating: "4.5/5 (310 reviews)", price: "₹2,500", type: "Mid-range", highlights: "Pure veg restaurant, temple pickup service" },
          { name: "Rudraksh Club & Luxury Resort", rating: "4.8/5 (150 reviews)", price: "₹4,800", type: "Luxury", highlights: "Lush gardens, swimming pool & pure sattvic dining" }
        ]
      }
    ],
    notesEn: "Book Bhasma Aarti slots in advance on official portal. Traditional dress code (Dhoti/Kurta for men, Saree/Salwar for women) required in Sanctum. Use authorized e-rickshaws.",
    notesHi: "भस्म आरती के लिए समय से पूर्व ऑनलाइन स्लॉट बुक करें। मंदिर गर्भगृह में पारंपरिक परिधान (धोती/कुर्ता/साड़ी) पहनें। स्थानीय अधिकृत ई-रिक्शा का उपयोग करें।"
  },
  varanasi: {
    name: "Varanasi (Kashi)",
    state: "Uttar Pradesh",
    nameHi: "वाराणसी (काशी विश्वनाथ धाम)",
    rituals: [
      {
        titleEn: "Kashi Vishwanath Jyotirlinga & Ganga Ghats",
        titleHi: "काशी विश्वनाथ ज्योतिर्लिंग दर्शन एवं गंगा घाट",
        subtitleEn: "Mangala Aarti, Annapurna Darshan & Dashashwamedh Maha Aarti",
        subtitleHi: "मंगला आरती, अन्नपूर्णा दर्शन एवं दशाश्वमेध महाआरती",
        activitiesEn: [
          "Early morning Mangala Aarti at Kashi Vishwanath Jyotirlinga Corridor",
          "Darshan of Maa Annapurna Devi and blessing for lifelong abundance",
          "Holy sunrise boat ride along Dashashwamedh, Manikarnika, and Assi Ghats",
          "Visit to historic Kaal Bhairav Temple (Kotwal of Varanasi)",
          "Spectacular Ganga Aarti at Dashashwamedh Ghat in the evening"
        ],
        activitiesHi: [
          "प्रातः मंगला आरती एवं काशी विश्वनाथ ज्योतिर्लिंग का पावन दर्शन",
          "माँ अन्नपूर्णा देवी के दर्शन एवं अखंड अन्न का आशीर्वाद",
          "दशाश्वमेध, मणिकर्णिका और अस्सी घाट पर सूर्योदय नौका विहार",
          "काशी के कोतवाल श्री काल भैरव मंदिर में दर्शन",
          "संध्या काल में दशाश्वमेध घाट पर विश्वप्रसिद्ध भव्य गंगा आरती दर्शन"
        ],
        hotels: [
          { name: "Kashi Yatri Niwas & Dharamshala", rating: "4.2/5", price: "₹900", type: "Budget", highlights: "Walking distance to Vishwanath Temple Corridor" },
          { name: "Hotel Ganges View & Suites", rating: "4.6/5", price: "₹2,400", type: "Mid-range", highlights: "River facing rooms, sattvic rooftop restaurant" },
          { name: "BrijRama Palace Heritage Hotel", rating: "4.9/5", price: "₹7,500", type: "Luxury", highlights: "Royal heritage palace right on the Ghats" }
        ]
      }
    ],
    notesEn: "Pre-book Sugam Darshan or Mangala Aarti for quick entry. Mobile phones and bags are not allowed inside Vishwanath Corridor. Taste the famous Banarasi Paan and Malaiyyo.",
    notesHi: "सुगम दर्शन या मंगला आरती की अग्रिम बुकिंग करें। विश्वनाथ कॉरिडोर में मोबाइल/बैग प्रतिबंधित हैं। प्रसिद्ध बनारसी पान और मलइयो का आनंद लें।"
  },
  ayodhya: {
    name: "Ayodhya Dham",
    state: "Uttar Pradesh",
    nameHi: "अयोध्या धाम (श्री राम जन्मभूमि)",
    rituals: [
      {
        titleEn: "Shri Ram Janmabhoomi & Hanuman Garhi Darshan",
        titleHi: "श्री राम जन्मभूमि एवं हनुमान गढ़ी दर्शन",
        subtitleEn: "Divine Darshan of Ram Lalla, Kanak Bhawan & Saryu Aarti",
        subtitleHi: "रामलला के दिव्य दर्शन, कनक भवन एवं पावन सरयू आरती",
        activitiesEn: [
          "Sacred morning Darshan at Shri Ram Janmabhoomi Mandir (Ram Lalla)",
          "Seeking supreme protection and blessings at Hanuman Garhi Temple",
          "Darshan at ornate Kanak Bhawan (Golden Palace of Sita-Ram)",
          "Holy dip at Ram Ki Paidi and evening Saryu River Maha Aarti",
          "Exploring Lata Mangeshkar Chowk and vibrant temple avenues"
        ],
        activitiesHi: [
          "श्री राम जन्मभूमि मंदिर में बालक राम के भव्य दर्शन",
          "हनुमान गढ़ी मंदिर में शीश नवाकर विजय का आशीर्वाद लेना",
          "भव्य कनक भवन में सीताराम युगल दर्शन",
          "राम की पैड़ी पर स्नान एवं संध्या सरयू महाआरती",
          "लता मंगेशकर चौक एवं नव-निर्मित राम पथ का भ्रमण"
        ],
        hotels: [
          { name: "Shri Ram Yatri Sewa Kendra", rating: "4.3/5", price: "₹800", type: "Budget", highlights: "Near Ram Janmabhoomi Path, clean & quiet" },
          { name: "Hotel Ramayana Ayodhya", rating: "4.6/5", price: "₹2,600", type: "Mid-range", highlights: "Spacious family suites, pure vegetarian food" },
          { name: "Park Inn by Radisson Ayodhya", rating: "4.9/5", price: "₹6,000", type: "Luxury", highlights: "Premium luxury near sacred sites" }
        ]
      }
    ],
    notesEn: "Arrive early for Hanuman Garhi to avoid queues. Use the electric shuttles along Ram Path. Locker facilities are available at Ram Mandir entry.",
    notesHi: "हनुमान गढ़ी दर्शन हेतु प्रातः जल्दी पहुँचें। राम पथ पर उपलब्ध ई-वाहनों का उपयोग करें। मंदिर प्रवेश द्वार पर निःशुल्क लॉकर सुविधा उपलब्ध है।"
  }
};

// ── Fallback Itinerary Generator (Offline & Resilient) ───────────────────────
function generateFallbackItinerary(destination, origin, departureDate, arrivalDate, numberOfPeople, budget, style, language, realHotels = [], realTransportSnippets = []) {
  const isHindi = language === "Hindi" || language === "hi" || language === "hindi";
  const travelers = Number(numberOfPeople) || 2;
  const destStr = (destination || "Ujjain").trim();
  const origStr = (origin || "Indore").trim();
  const destLower = destStr.toLowerCase();
  const origLower = origStr.toLowerCase();

  const isShortDistance =
    (origLower.includes("indore") && destLower.includes("ujjain")) ||
    (origLower.includes("ujjain") && destLower.includes("indore")) ||
    (origLower.includes("haridwar") && destLower.includes("rishikesh")) ||
    (origLower.includes("mathura") && destLower.includes("vrindavan")) ||
    (origLower.includes("varanasi") && destLower.includes("sarnath"));

  const destKey = (destLower.includes("varanasi") || destLower.includes("kashi") || destLower.includes("वाराणसी") || destLower.includes("काशी"))
    ? "varanasi"
    : (destLower.includes("ayodhya") || destLower.includes("अयोध्या"))
      ? "ayodhya"
      : "ujjain";

  const destData = PILGRIM_DESTINATIONS[destKey] || PILGRIM_DESTINATIONS.ujjain;
  const destTitle = isHindi ? (destData.nameHi || destStr) : (destData.name || destStr);
  
  // Calculate total days (min 2, max 5)
  let totalDays = 3;
  try {
    const d1 = new Date(departureDate);
    const d2 = new Date(arrivalDate);
    const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
    if (diff >= 1 && diff <= 7) totalDays = diff;
  } catch (e) {
    totalDays = 3;
  }

  const primaryRitual = destData.rituals[0];
  const secondaryRitual = destData.rituals[1] || destData.rituals[0];

  // If real hotels from SerpAPI were passed, use them!
  const hotelOptions = (Array.isArray(realHotels) && realHotels.length >= 3)
    ? realHotels.map(h => ({
        name: h.name,
        rating: h.rating,
        price: h.pricePerNight,
        type: h.type,
        highlights: h.highlights || (isHindi ? "मंदिर गर्भगृह के निकट, स्वच्छ वातानुकूलित कमरे एवं सात्विक भोजनालय" : "Close to Temple Sanctum, clean AC rooms & pure vegetarian dining")
      }))
    : primaryRitual.hotels.map(h => ({
        ...h,
        highlights: isHindi ? "मंदिर गर्भगृह के निकट, स्वच्छ वातानुकूलित कमरे एवं सात्विक भोजनालय" : h.highlights
      }));

  // Build transit options for travel days based on distance
  const day1Transit = isShortDistance ? [
    {
      mode: "Bus",
      icon: "bus",
      operator: isHindi ? "AICTSL / अटल इंदौर सिटी ट्रांसपोर्ट (AC एक्सप्रेस बस)" : "AICTSL / Chartered AC Intercity Express",
      details: isHindi ? "इंदौर सरवटे / नवलखा बस स्टैंड → उज्जैन नानाखेड़ा (प्रत्येक 15 मिनट पर, 4-लेन एक्सप्रेसवे)" : "Sarwate / Navlakha Bus Stand → Ujjain Nanakheda (Every 15 mins via 4-lane expressway)",
      departure: "07:00",
      arrival: "08:15",
      price: isHindi ? "₹140 - ₹180 प्रति व्यक्ति" : "₹140 - ₹180 per person",
      available: true
    },
    {
      mode: "Train",
      icon: "train",
      operator: isHindi ? "इंदौर - उज्जैन सुपरफास्ट इंटरसिटी / पैसेंजर स्पेशल" : "Indore - Ujjain Superfast Intercity / Passenger Special",
      details: isHindi ? "इंदौर जंक्शन (INDB) → उज्जैन जंक्शन (UJN) दैनिक सीधी ट्रेन" : "Indore Junction (INDB) → Ujjain Junction (UJN) Direct Service",
      departure: "06:30",
      arrival: "07:45",
      price: isHindi ? "₹75 - ₹140 प्रति व्यक्ति" : "₹75 - ₹140 per person",
      available: true
    },
    {
      mode: "Flight",
      icon: "car",
      operator: isHindi ? "निजी वातानुकूलित कैब / टैक्सी (डोरस्टेप पिकअप)" : "Private AC Doorstep Cab / Taxi (Sedan/SUV)",
      details: isHindi ? "इंदौर से उज्जैन सांवेर रोड 4-लेन राजमार्ग (55 मिनट, आरामदायक पारिवारिक यात्रा)" : "Indore to Ujjain via Sanwer Road 4-lane Highway (55 mins, direct temple drop)",
      departure: "08:00",
      arrival: "09:00",
      price: isHindi ? "₹1,200 - ₹1,600 (पूरी कैब)" : "₹1,200 - ₹1,600 (Full Cab)",
      available: true
    }
  ] : [
    {
      mode: "Bus",
      icon: "bus",
      operator: "Shrinath / Kalpana Travels (Multi-Axle AC Sleeper)",
      details: `${origStr} Bus Terminal → ${destStr} Central Stand (Overnight Direct)`,
      departure: "20:00",
      arrival: "06:00",
      price: isHindi ? `₹850 - ₹1,250 प्रति व्यक्ति` : `₹850 - ₹1,250 per person`,
      available: true
    },
    {
      mode: "Train",
      icon: "train",
      operator: "Superfast Express (3rd AC / 2nd AC / Chair Car)",
      details: `${origStr} Junction → ${destStr} Junction (IRCTC Daily Service)`,
      departure: "19:30",
      arrival: "05:15",
      price: isHindi ? `₹650 - ₹1,200 प्रति व्यक्ति (3A)` : `₹650 - ₹1,200 per person (3A)`,
      available: true
    },
    {
      mode: "Flight",
      icon: "plane",
      operator: "Connecting Flight via Nearest Operational Airport",
      details: `Connecting flight to nearest airport + pre-arranged highway taxi to ${destStr}`,
      departure: "14:00",
      arrival: "18:30",
      price: isHindi ? `₹3,500 - ₹5,800 प्रति व्यक्ति` : `₹3,500 - ₹5,800 per person`,
      available: true
    }
  ];

  const returnTransit = isShortDistance ? [
    {
      mode: "Bus",
      icon: "bus",
      operator: isHindi ? "AICTSL / अटल इंदौर सिटी ट्रांसपोर्ट (AC एक्सप्रेस बस)" : "AICTSL / Chartered AC Intercity Express",
      details: isHindi ? "उज्जैन नानाखेड़ा बस स्टैंड → इंदौर सरवटे (प्रत्येक 15 मिनट पर उपलब्ध)" : "Ujjain Nanakheda Bus Stand → Indore (Every 15 mins)",
      departure: "18:00",
      arrival: "19:15",
      price: isHindi ? "₹140 - ₹180 प्रति व्यक्ति" : "₹140 - ₹180 per person",
      available: true
    },
    {
      mode: "Train",
      icon: "train",
      operator: isHindi ? "उज्जैन - इंदौर सुपरफास्ट इंटरसिटी एक्सप्रेस" : "Ujjain - Indore Superfast Intercity Express",
      details: isHindi ? "उज्जैन जंक्शन (UJN) → इंदौर जंक्शन (INDB)" : "Ujjain Junction (UJN) → Indore Junction (INDB)",
      departure: "19:00",
      arrival: "20:15",
      price: isHindi ? "₹75 - ₹140 प्रति व्यक्ति" : "₹75 - ₹140 per person",
      available: true
    },
    {
      mode: "Flight",
      icon: "car",
      operator: isHindi ? "निजी वातानुकूलित वापसी कैब / टैक्सी" : "Private AC Return Cab / Taxi",
      details: isHindi ? "उज्जैन मंदिर से इंदौर सीधे आपके गंतव्य तक ड्रॉप" : "Ujjain Temple doorstep to Indore drop (55 mins)",
      departure: "18:30",
      arrival: "19:30",
      price: isHindi ? "₹1,200 - ₹1,600 (पूरी कैब)" : "₹1,200 - ₹1,600 (Full Cab)",
      available: true
    }
  ] : [
    {
      mode: "Bus",
      icon: "bus",
      operator: "Kalpana / Hans Travels AC Sleeper",
      details: `${destStr} Bus Stand → ${origStr} Terminal`,
      departure: "21:00",
      arrival: "06:30",
      price: isHindi ? "₹850 - ₹1,250 प्रति व्यक्ति" : "₹850 - ₹1,250 per person",
      available: true
    },
    {
      mode: "Train",
      icon: "train",
      operator: "Return Superfast Express (3A/2A)",
      details: `${destStr} Junction → ${origStr} Junction`,
      departure: "20:15",
      arrival: "05:30",
      price: isHindi ? "₹700 - ₹1,150 प्रति व्यक्ति" : "₹700 - ₹1,150 per person",
      available: true
    },
    {
      mode: "Flight",
      icon: "plane",
      operator: "Connecting Return Flight via Airport",
      details: `Cab to Airport + Flight to ${origStr}`,
      departure: "18:00",
      arrival: "21:30",
      price: isHindi ? "₹3,800 - ₹5,500 प्रति व्यक्ति" : "₹3,800 - ₹5,500 per person",
      available: true
    }
  ];

  const days = [];

  // Day 1: Departure & Journey
  days.push({
    day: 1,
    title: isHindi ? `${origStr} से प्रस्थान एवं ${destStr} आगमन` : `Departure from ${origStr} & Journey to ${destStr}`,
    subtitle: isHindi ? "आध्यात्मिक तीर्थयात्रा का शुभारंभ एवं पावन प्रवेश" : "Commencement of the sacred pilgrimage and arrival",
    estimated_cost: isHindi ? `₹${travelers * 900} (यात्रा टिकट, मार्ग का सात्विक अल्पाहार)` : `₹${travelers * 900} (Transit tickets & sattvic refreshments)`,
    activities: isHindi ? [
      `यात्रा की पूर्व तैयारी: पूजन सामग्री (गंगाजल, चंदन, कलावा), पारंपरिक परिधान एवं पहचान पत्र सुरक्षित रखना`,
      `${origStr} रेलवे टर्मिनल / बस स्टैंड पर समय से 30 मिनट पूर्व पहुँचना एवं सामान व्यवस्थित करना`,
      `चयनित आरामदायक परिवहन में स्थान ग्रहण कर ${destStr} की सुखद एवं शांत आध्यात्मिक यात्रा प्रारंभ करना`,
      `मार्ग में सात्विक अल्पाहार, विश्राम एवं तीर्थ स्थल के महात्म्य का स्मरण करना`,
      `${destStr} पहुँचकर होटल में सुगम चेक-इन (अथवा सामान सुरक्षित रख) दर्शन हेतु तत्पर होना`
    ] : [
      `Pilgrimage preparations: Packing sacred puja items, traditional attire (Dhoti/Kurta or Saree), and travel essentials`,
      `Reaching ${origStr} railway station / bus terminal comfortably 30 minutes in advance`,
      `Boarding chosen transit for a peaceful, divine journey towards ${destStr}`,
      `Enjoying light sattvic refreshments during transit and resting well`,
      `Arrival at ${destStr}, smooth check-in at hotel / luggage drop, and freshening up for evening sanctum prayers`
    ],
    accommodation_options: [
      {
        name: isHindi ? (isShortDistance ? "होटल चेक-इन अथवा यात्रा के दौरान" : "रात्रि यात्रा (वातानुकूलित स्लीपर बस/ट्रेन)") : (isShortDistance ? "Hotel check-in or Transit" : "Overnight transit (AC Sleeper / Train)"),
        rating: "4.5/5",
        price: isHindi ? "यात्रा में शामिल" : "Included in transit",
        type: "Transit",
        highlights: isHindi ? "आरामदायक एवं सुरक्षित यात्रा सुविधा" : "Safe and comfortable transit journey"
      }
    ],
    transportation_options: day1Transit
  });

  // Day 2 (or middle days): Sanctum Darshan & Holy Ghats
  for (let i = 2; i < totalDays; i++) {
    const ritual = (i === 2) ? primaryRitual : secondaryRitual;
    days.push({
      day: i,
      title: isHindi ? ritual.titleHi : ritual.titleEn,
      subtitle: isHindi ? ritual.subtitleHi : ritual.subtitleEn,
      estimated_cost: isHindi ? `₹${travelers * 1800 + 1200} (होटल प्रवास, स्थानीय ई-रिक्शा, प्रसाद व सात्विक भोजन)` : `₹${travelers * 1800 + 1200} (Accommodation, local circuit, offerings & sattvic meals)`,
      activities: isHindi ? ritual.activitiesHi : ritual.activitiesEn,
      accommodation_options: hotelOptions,
      transportation_options: [
        {
          mode: "Auto-Rickshaw / E-Rickshaw",
          icon: "car",
          operator: isHindi ? "स्थानीय अधिकृत मंदिर ई-रिक्शा / ऑटो" : "Local Verified Temple E-Rickshaw",
          details: isHindi ? "पूरे दिन के लिए स्थानीय प्रमुख मंदिर, पावन घाट एवं महाकाल लोक कॉरिडोर सर्किट" : "Full day sacred circuit covering major sanctums, holy ghats & Mahakal Lok corridor",
          departure: "07:00",
          arrival: "21:00",
          price: isHindi ? "₹400 - ₹600 (पूरे दिन का कुल किराया)" : "₹400 - ₹600 (Full day circuit fare)",
          available: true
        }
      ]
    });
  }

  // If totalDays is 2, ensure Day 2 has the main sanctum rituals + stay/departure
  if (totalDays === 2) {
    days.push({
      day: 2,
      title: isHindi ? primaryRitual.titleHi : primaryRitual.titleEn,
      subtitle: isHindi ? primaryRitual.subtitleHi : primaryRitual.subtitleEn,
      estimated_cost: isHindi ? `₹${travelers * 1600} (दर्शन, प्रसाद, स्थानीय परिवहन एवं वापसी यात्रा)` : `₹${travelers * 1600} (Sanctum darshan, prasad, local circuit & return transit)`,
      activities: isHindi ? primaryRitual.activitiesHi : primaryRitual.activitiesEn,
      accommodation_options: hotelOptions,
      transportation_options: returnTransit
    });
  } else if (totalDays >= 3) {
    // Final Day: Morning blessings & return journey
    days.push({
      day: totalDays,
      title: isHindi ? `मंगलनाथ, सांदीपनि आश्रम, प्रसाद खरीदारी एवं ${origStr} वापसी` : `Morning Temples, Prasad Shopping & Return Journey to ${origStr}`,
      subtitle: isHindi ? "अंतिम मंगल दर्शन, पवित्र स्मृति चिन्ह एवं शुभ प्रस्थान" : "Final temple blessings, sacred souvenirs and peaceful departure",
      estimated_cost: isHindi ? `₹${travelers * 1200} (प्रसाद, स्थानीय ऑटो एवं वापसी यात्रा टिकट)` : `₹${travelers * 1200} (Prasad offerings, local auto, return transit)`,
      activities: isHindi ? [
        `प्रातःकालीन मंगलनाथ मंदिर में मंगल दोष शांति पूजा एवं महर्षि सांदीपनि आश्रम (श्रीकृष्ण शिक्षा स्थली) के दर्शन`,
        `सिद्धिदाता चिंतामण गणेश मंदिर में सुख-समृद्धि एवं निर्विघ्न जीवन हेतु मोदक भोग अर्पण`,
        `गोपाल मंदिर एवं पटनी बाजार से प्रामाणिक महाकाल प्रसादी, सिद्ध रुद्राक्ष माला एवं उज्जैन के प्रसिद्ध नमकीन/मिठाई की खरीदारी`,
        `होटल से सुगम चेक-आउट, सामान व्यवस्थित करना एवं मंदिर प्रांगण को प्रणाम कर प्रस्थान करना`,
        `${origStr} वापसी हेतु बस स्टैंड / रेलवे स्टेशन पर पहुँचकर समय पर सुखद यात्रा प्रारंभ करना`
      ] : [
        `Morning visit to historic Mangalnath Temple and Maharishi Sandipani Ashram (where Lord Krishna studied)`,
        `Seeking auspicious blessings at sacred Chintaman Ganesh Temple with traditional modak offerings`,
        `Purchasing authentic prasad, energized rudraksha, and sacred souvenirs near Gopal Mandir market`,
        `Hotel check-out, settling luggage, and offering final pranam to the sacred land`,
        `Reaching terminal and boarding return transit back to ${origStr} with divine memories`
      ],
      accommodation_options: [
        {
          name: isHindi ? `कोई नहीं (${destStr} से वापसी प्रस्थान)` : `None (Departure from ${destStr})`,
          rating: "N/A",
          price: isHindi ? "लागू नहीं" : "N/A",
          type: "Transit",
          highlights: isHindi ? "सुखद एवं मंगलमय वापसी यात्रा" : "Safe return journey with sacred memories"
        }
      ],
      transportation_options: returnTransit
    });
  }

  const estimatedTotal = travelers * 2400 + (totalDays * 1600);

  return {
    itinerary: {
      title: isHindi
        ? `${destTitle} पावन तीर्थयात्रा: ${origStr} से दिव्य दर्शन एवं अनुष्ठान`
        : `Sacred ${destTitle} Pilgrimage: Divine Yatra from ${origStr}`,
      destination: `${destStr}, ${destData.state || "India"}`,
      departureDate: departureDate || "2026-09-10",
      arrivalDate: arrivalDate || "2026-09-12",
      numberOfPeople: travelers,
      budget: budget || "Comfortable",
      style: style || "Devotional",
      total_estimated_cost: isHindi
        ? `₹${estimatedTotal - 800} - ₹${estimatedTotal + 1200} (${travelers} तीर्थयात्रियों के लिए संपूर्ण यात्रा)`
        : `₹${estimatedTotal - 800} - ₹${estimatedTotal + 1200} (Complete Yatra for ${travelers} Pilgrims)`,
      notes: isHindi ? destData.notesHi : destData.notesEn,
      daily_plan: days
    }
  };
}

// ── POST /api/v1/chatbot/tts ─────────────────────────────────────────────────
router.post("/tts", async (req, res) => {
  try {
    const { text, language = "English" } = req.body;

    if (!text || !text.trim()) {
      return res.json({ data: { media: "" } });
    }

    const voiceName = language === "Hindi" ? "Achernar" : "Algenib";

    const ttsPayload = {
      model: "googleai/gemini-2.5-flash",
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
      prompt: text,
    };

    let media;
    try {
      const result = await withTimeout(ai.generate(ttsPayload), 5000, "TTS Primary");
      media = result.media;
    } catch (primaryErr) {
      console.warn("Primary AI failed for /tts, retrying with backup. Error:", primaryErr.message);
      try {
        const result = await withTimeout(aiBackup.generate(ttsPayload), 5000, "TTS Backup");
        media = result.media;
      } catch (backupErr) {
        // Silently return empty audio
        return res.json({ data: { media: "" } });
      }
    }

    if (!media || !media.url) {
      return res.json({ data: { media: "" } });
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(",") + 1),
      "base64"
    );
    const wavBase64 = await toWav(audioBuffer);

    return res.json({ data: { media: `data:audio/wav;base64,${wavBase64}` } });
  } catch (err) {
    console.error("Chatbot /tts server error:", err);
    return res.json({ data: { media: "" }, warning: err.message });
  }
});

export default router;
