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

// ── Genkit AI initialisation (for chat & TTS) ────────────────────────────────
const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY })],
  model: "googleai/gemini-2.5-flash",
});

const aiBackup = genkit({
  plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY_BACKUP })],
  model: "googleai/gemini-2.5-flash",
});

// ── Direct Google AI SDK (for itinerary - more reliable JSON output) ─────────
const getGenAI = () => new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const getGenAIBackup = () => new GoogleGenerativeAI(process.env.GEMINI_API_KEY_BACKUP);

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
      timeout: 8000,
    });

    const properties = res.data.properties || [];

    // Sort by budget preference
    let sorted = [...properties];
    const budgetLower = (budget || "").toLowerCase();
    if (budgetLower.includes("budget") || budgetLower.includes("modest")) {
      sorted.sort((a, b) => (a.rate_per_night?.extracted_lowest || 99999) - (b.rate_per_night?.extracted_lowest || 99999));
    } else if (budgetLower.includes("luxury")) {
      sorted.sort((a, b) => (b.rate_per_night?.extracted_lowest || 0) - (a.rate_per_night?.extracted_lowest || 0));
    }

    return sorted.slice(0, 6).map(h => ({
      name: h.name,
      rating: h.overall_rating ? `${h.overall_rating}/5 (${h.reviews || 0} reviews)` : "Not rated",
      pricePerNight: h.rate_per_night?.lowest || "Price on request",
      type: h.type || "hotel",
    }));
  } catch (err) {
    console.warn("[SerpAPI] Hotels fetch failed:", err.message);
    return [];
  }
}

// ── SerpAPI: fetch real transport options ────────────────────────────────────
async function fetchRealTransport(origin, destination) {
  try {
    const res = await axios.get("https://serpapi.com/search.json", {
      params: {
        engine: "google",
        q: `trains buses from ${origin} to ${destination} schedule timings India`,
        gl: "in",
        hl: "en",
        api_key: process.env.SERP_API_KEY,
      },
      timeout: 8000,
    });

    const organic = res.data.organic_results || [];
    return organic.slice(0, 5).map(r =>
      `${r.title}: ${(r.snippet || "").slice(0, 150)}`
    );
  } catch (err) {
    console.warn("[SerpAPI] Transport fetch failed:", err.message);
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

    if (hardcodedResponses[lowerMsg]) {
      return res.json({ data: { response: hardcodedResponses[lowerMsg] } });
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

If you have all the information, summarize it for the user and populate the itineraryInput JSON in your response with the collected details, and state that you are now generating the itinerary. Do not ask for confirmation.`;

    const messages = history.map((m) => ({
      role: m.role === "model" ? "model" : "user",
      content: [{ text: m.content }],
    }));

    const generatePayload = {
      system: systemPrompt,
      messages,
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
          }).optional().describe("Populated when all travel details are collected"),
        }),
      },
      prompt: messages.length === 0
        ? (language === "Hindi"
          ? "नमस्ते! मैं RoamAI हूँ। शुरू करते हैं — आप कहाँ से यात्रा करना चाहते हैं?"
          : "Hello! I am RoamAI. Let's get started — where are you traveling from?")
        : undefined,
    };

    let output;
    try {
      const result = await ai.generate(generatePayload);
      output = result.output;
    } catch (primaryErr) {
      console.warn("Primary AI failed for /chat, retrying with backup. Error:", primaryErr.message);
      const result = await aiBackup.generate(generatePayload);
      output = result.output;
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

    // ── Fetch real-world data from SerpAPI in parallel ──────────────────────
    console.log(`[SerpAPI] Fetching hotels in ${destination} and transport from ${origin}...`);
    const [hotels, transportSnippets] = await Promise.all([
      fetchRealHotels(destination, departureDate, arrivalDate, budget),
      fetchRealTransport(origin, destination),
    ]);
    console.log(`[SerpAPI] Got ${hotels.length} hotels, ${transportSnippets.length} transport snippets`);

    // Build context blocks to inject into the AI prompt
    const hotelContext = hotels.length > 0
      ? `\nREAL HOTELS available in ${destination} — use these EXACT names in every accommodation field (rotate day by day if stay is long):\n` +
        hotels.map((h, i) => `  ${i + 1}. "${h.name}" | Rating: ${h.rating} | Price: ${h.pricePerNight}/night | Type: ${h.type}`).join("\n")
      : "";

    const transportContext = transportSnippets.length > 0
      ? `\nREAL TRANSPORT INFO from ${origin} to ${destination} — extract and use actual train/bus names, numbers, and timings where mentioned:\n` +
        transportSnippets.map(s => `  - ${s}`).join("\n")
      : "";

    const prompt = `You are a travel agent specializing in creating detailed pilgrimage itineraries for Indian destinations.
Generate a comprehensive travel itinerary as a valid JSON object ONLY — no extra text, no markdown, no code fences.

User details:
- Origin: ${origin}
- Destination: ${destination}
- Departure Date: ${departureDate}
- Arrival Date: ${arrivalDate}
- Number of People: ${numberOfPeople || 1}
- Budget: ${budget || "Modest"}
- Style: ${style || "Peaceful"}

All text in the response (except keys) should be in: ${language}.
${hotelContext}
${transportContext}

STRICT INSTRUCTIONS:
1. Use the EXACT hotel names from the list above in every "accommodation.name" field. Do NOT invent hotel names.
2. For transportation on Day 1 (travel day), include the actual train or bus name/number from the transport info above (e.g., "12919 Malwa Express", "Intercity Express").
3. Include specific temple names, ghat names, and real landmark names of ${destination} in activities (e.g., "Mahakaleshwar Jyotirlinga darshan", "Ram Ghat Aarti").
4. For subsequent days, use autos/e-rickshaws/local transport with realistic pricing.
5. accommodation.price should match the real price from the hotel list.
6. accommodation.rating should match the real rating from the hotel list.
7. Do NOT use generic names like "Local Hotel" or "Hotel ABC".
8. Include a detailed "destination_history" section.
9. Populate "train_connectivity" with factual details from transport info.
10. Populate "recommended_hotels" using the top 3 hotels from the real hotel list.

Return ONLY this JSON structure exactly:
{
  "itinerary": {
    "title": "string",
    "destination": "string",
    "destination_history": "string (rich historical overview)",
    "train_connectivity": [{ "train_name": "string", "frequency": "string", "travel_time": "string" }],
    "recommended_hotels": [{ "name": "string", "type": "string", "price_range": "string" }],
    "departureDate": "string",
    "arrivalDate": "string",
    "numberOfPeople": number,
    "budget": "string",
    "style": "string",
    "total_estimated_cost": "string",
    "notes": "string — practical tips for pilgrims visiting ${destination}",
    "daily_plan": [
      {
        "day": 1,
        "activities": ["Specific real activity with actual place names"],
        "estimated_cost": "string",
        "accommodation": { "name": "EXACT hotel name from list above", "price": "real price from list", "rating": "real rating from list" },
        "transportation_options": [{ "mode": "Train/Bus/Auto/E-Rickshaw", "details": "Real train name + number + timing if known", "price": "string" }]
      }
    ]
  }
}`;

    // ── Call Gemini ──────────────────────────────────────────────────────────
    let text;
    try {
      const genAI = getGenAI();
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(prompt);
      text = result.response.text();
    } catch (primaryErr) {
      console.warn("Primary AI failed for /itinerary, retrying with backup. Error:", primaryErr.message);
      const genAIBackup = getGenAIBackup();
      const modelBackup = genAIBackup.getGenerativeModel({ model: "gemini-2.5-flash" });
      const resultBackup = await modelBackup.generateContent(prompt);
      text = resultBackup.response.text();
    }

    // ── Parse JSON response ──────────────────────────────────────────────────
    let parsed;
    try {
      const clean = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      parsed = JSON.parse(clean);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr.message, "\nRaw:", text.slice(0, 300));
      return res.status(500).json({ error: "AI returned invalid JSON. Please try again." });
    }

    return res.json({ data: parsed });
  } catch (err) {
    console.error("Chatbot /itinerary error:", err.message || err);
    return res.status(500).json({ error: err.message || "Failed to generate itinerary" });
  }
});

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
      const result = await ai.generate(ttsPayload);
      media = result.media;
    } catch (primaryErr) {
      console.warn("Primary AI failed for /tts, retrying with backup. Error:", primaryErr.message);
      const result = await aiBackup.generate(ttsPayload);
      media = result.media;
    }

    if (!media || !media.url) {
      throw new Error("No media returned from TTS model");
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
