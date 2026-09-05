import axios from "axios";
import { format } from "date-fns";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

/**
 * Send a chat message to the AI and receive a response.
 * @param {{ history: {role:string, content:string}[], language: string }} input
 */
export async function getChatResponse(input) {
  try {
    const res = await axios.post(`${API_BASE}/api/v1/chatbot/chat`, input);
    return { data: res.data.data };
  } catch (err) {
    const msg = err.response?.data?.error || err.message || "Failed to get chat response";
    return { error: msg };
  }
}

/**
 * Generate a full travel itinerary.
 * @param {{ origin, destination, departureDate (Date), arrivalDate (Date), numberOfPeople, budget, style, language }} input
 */
export async function getItinerary(input) {
  try {
    const payload = {
      ...input,
      departureDate: format(input.departureDate, "yyyy-MM-dd"),
      arrivalDate: format(input.arrivalDate, "yyyy-MM-dd"),
    };
    const res = await axios.post(`${API_BASE}/api/v1/chatbot/itinerary`, payload);
    return { data: res.data.data?.itinerary };
  } catch (err) {
    const msg = err.response?.data?.error || err.message || "Failed to generate itinerary";
    return { error: `Failed to generate itinerary. ${msg}` };
  }
}

/**
 * Convert text to speech (WAV, base64 data URI).
 * @param {{ text: string, language: string }} input
 */
export async function getTextToSpeech(input) {
  try {
    const res = await axios.post(`${API_BASE}/api/v1/chatbot/tts`, input);
    return { data: res.data.data };
  } catch (err) {
    // TTS is non-critical — silently return empty
    return { data: { media: "" } };
  }
}
