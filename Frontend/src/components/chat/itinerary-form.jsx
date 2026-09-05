import React, { useState } from "react";
import { format, addDays } from "date-fns";
import {
  MapPin,
  Calendar as CalendarIcon,
  Users,
  Wallet,
  Sparkles,
  Compass,
  ArrowRight,
  Loader2,
  Check,
  Flame,
  Languages
} from "lucide-react";

const POPULAR_DESTINATIONS = [
  { name: "Ujjain (Mahakal)", origin: "Indore" },
  { name: "Varanasi (Kashi)", origin: "Lucknow" },
  { name: "Ayodhya Dham", origin: "Delhi" },
  { name: "Haridwar & Rishikesh", origin: "Delhi" },
  { name: "Rameshwaram", origin: "Chennai" },
  { name: "Tirupati Balaji", origin: "Bengaluru" },
];

const BUDGET_OPTIONS = [
  { label: "Budget / Dharmshala", value: "Budget", desc: "Ashrams & local transit (₹1,500/day)" },
  { label: "Comfort / Hotel", value: "Comfortable", desc: "3-star stays & private cabs (₹4,000/day)" },
  { label: "Luxury / VIP", value: "Luxury", desc: "Premium resorts & VIP darshan (₹8,000+/day)" },
];

const STYLE_OPTIONS = [
  { label: "Devotional & Peaceful", value: "Devotional", icon: "🙏" },
  { label: "Rituals & Parikrama", value: "Rituals & Aarti", icon: "🔱" },
  { label: "Family & Heritage", value: "Family Pilgrimage", icon: "🛕" },
  { label: "Fast-Track / Weekend", value: "Express Darshan", icon: "⚡" },
];

export default function ItineraryForm({ onSubmit, isLoading }) {
  const [origin, setOrigin] = useState("Indore");
  const [destination, setDestination] = useState("Ujjain (Mahakaleshwar)");
  const [departureDate, setDepartureDate] = useState(() => format(addDays(new Date(), 1), "yyyy-MM-dd"));
  const [arrivalDate, setArrivalDate] = useState(() => format(addDays(new Date(), 4), "yyyy-MM-dd"));
  const [numberOfPeople, setNumberOfPeople] = useState("2");
  const [budget, setBudget] = useState("Comfortable");
  const [style, setStyle] = useState("Devotional");
  const [language, setLanguage] = useState("English");
  const [formError, setFormError] = useState(null);

  const handleQuickDest = (dest, orig) => {
    setDestination(dest);
    if (orig) setOrigin(orig);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);

    if (!origin.trim() || !destination.trim()) {
      setFormError("Please enter both starting point and holy destination.");
      return;
    }

    if (new Date(arrivalDate) < new Date(departureDate)) {
      setFormError("Return date must be on or after departure date.");
      return;
    }

    const payload = {
      origin: origin.trim(),
      destination: destination.trim(),
      departureDate: new Date(departureDate),
      arrivalDate: new Date(arrivalDate),
      numberOfPeople: parseInt(numberOfPeople, 10) || 1,
      budget,
      style,
      language,
    };

    onSubmit(payload);
  };

  return (
    <div className="bg-white p-6 sm:p-8 md:p-10 max-h-[85vh] overflow-y-auto selection:bg-orange-100">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-orange-100 pb-5 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-wider mb-2 border border-orange-100">
            <Sparkles size={13} className="text-orange-600" /> Sacred Yatra Intelligence
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Plan Your <span className="text-[#EA580C]">Divine Yatra</span>
          </h3>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Fill in your pilgrimage details to receive an auspicious day-by-day itinerary.
          </p>
        </div>

        {/* Language Pill */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setLanguage("English")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              language === "English" ? "bg-white text-orange-600 shadow-sm" : "text-slate-500"
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLanguage("Hindi")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              language === "Hindi" ? "bg-white text-orange-600 shadow-sm" : "text-slate-500"
            }`}
          >
            हिन्दी
          </button>
        </div>
      </div>

      {formError && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
          <span>⚠️</span>
          <span>{formError}</span>
        </div>
      )}

      {/* QUICK PRESET CHIPS */}
      <div className="mb-6">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
          Popular Sacred Destinations:
        </label>
        <div className="flex flex-wrap gap-2">
          {POPULAR_DESTINATIONS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickDest(item.name, item.origin)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                destination.includes(item.name.split(" ")[0])
                  ? "bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-500/20"
                  : "bg-slate-50 hover:bg-orange-50/70 border-slate-200 text-slate-700 hover:border-orange-200"
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* ORIGIN & DESTINATION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <MapPin size={13} className="text-slate-400" /> Starting City (Origin)
            </label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g. Mumbai, Delhi, Ahmedabad"
              required
              className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Compass size={13} className="text-orange-600" /> Holy Destination
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Ujjain, Varanasi, Ayodhya"
              required
              className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
            />
          </div>
        </div>

        {/* DATES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <CalendarIcon size={13} className="text-orange-600" /> Departure Date (Start)
            </label>
            <input
              type="date"
              value={departureDate}
              min={format(new Date(), "yyyy-MM-dd")}
              onChange={(e) => setDepartureDate(e.target.value)}
              required
              className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <CalendarIcon size={13} className="text-orange-600" /> Return Date (End)
            </label>
            <input
              type="date"
              value={arrivalDate}
              min={departureDate}
              onChange={(e) => setArrivalDate(e.target.value)}
              required
              className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
            />
          </div>
        </div>

        {/* TRAVELERS & BUDGET STYLE */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-4 space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Users size={13} className="text-slate-400" /> Number of Pilgrims
            </label>
            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50 h-12">
              <button
                type="button"
                onClick={() => setNumberOfPeople((prev) => Math.max(1, parseInt(prev, 10) - 1).toString())}
                className="w-12 h-full font-black text-slate-600 hover:bg-slate-200 transition-colors"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max="50"
                value={numberOfPeople}
                onChange={(e) => setNumberOfPeople(e.target.value)}
                className="w-full text-center bg-transparent text-sm font-black text-slate-900 outline-none"
              />
              <button
                type="button"
                onClick={() => setNumberOfPeople((prev) => (parseInt(prev, 10) + 1).toString())}
                className="w-12 h-full font-black text-slate-600 hover:bg-slate-200 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <div className="sm:col-span-8 space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Wallet size={13} className="text-orange-600" /> Financial Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              {BUDGET_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setBudget(opt.value)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    budget === opt.value
                      ? "bg-orange-50 border-orange-400 text-orange-900 shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:border-orange-200"
                  }`}
                >
                  <span className="text-xs font-bold leading-tight flex items-center justify-between">
                    {opt.label.split(" / ")[0]}
                    {budget === opt.value && <Check size={12} className="text-orange-600" />}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium leading-tight mt-1 truncate">
                    {opt.desc.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* JOURNEY STYLE */}
        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Sparkles size={13} className="text-orange-600" /> Sacred Journey Intent
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {STYLE_OPTIONS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setStyle(s.value)}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                  style === s.value
                    ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20"
                    : "bg-slate-50 hover:bg-orange-50/50 border-slate-200 text-slate-700 hover:border-orange-200"
                }`}
              >
                <span className="text-lg">{s.icon}</span>
                <span className="text-xs font-bold leading-tight">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* SUBMIT CTA BUTTON */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#EA580C] to-[#C2410C] hover:from-[#D94F04] hover:to-[#9A3412] text-white font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-orange-600/25 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Crafting Sacred Itinerary...</span>
            </>
          ) : (
            <>
              <span>MANIFEST SACRED ITINERARY</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}