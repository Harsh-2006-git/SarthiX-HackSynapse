import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays, differenceInDays } from "date-fns";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ItineraryDisplay from "../components/chat/itinerary-display";
import { getItinerary } from "../api/chatActions";
import {
  Sparkles,
  MapPin,
  Calendar,
  Users,
  Wallet,
  ArrowRight,
  ArrowLeft,
  Download,
  Flame,
  RefreshCw,
  AlertCircle,
  MessageSquare,
  Landmark,
  SlidersHorizontal,
  FileText,
  Languages
} from "lucide-react";
import templeBgImg from "../assets/temple_ghats_bg.jpg";

const BUDGET_TIERS = [
  {
    id: "Budget",
    label: "Budget / Ashram",
    desc: "Clean trust dharamshalas, mandir annakshetra meals & e-rickshaws",
    badge: "Economical",
    icon: "🌿",
  },
  {
    id: "Comfortable",
    label: "Comfort / 3-Star",
    desc: "AC hotel rooms, private cab transit & priority darshan assistance",
    badge: "Most Popular",
    icon: "🏨",
  },
  {
    id: "Luxury",
    label: "Luxury / VIP",
    desc: "Premium riverside suites, private chauffeur & VIP sanctum passes",
    badge: "Exclusive",
    icon: "👑",
  },
];

const YATRA_INTENTS = [
  { id: "Devotional", label: "Devotional & Darshan", desc: "Sanctum presence & morning abhishek", icon: "🙏" },
  { id: "Rituals & Aarti", label: "Rituals & Holy Snan", desc: "Bhasma Aarti, snan & sandhya deep", icon: "🔱" },
  { id: "Family & Heritage", label: "Family & Senior Friendly", desc: "Comfortable pace, wheelchair support", icon: "🛕" },
  { id: "Express Darshan", label: "Express Fast-Track", desc: "1-2 days priority itinerary", icon: "⚡" },
];

export default function TravelPlannerPage() {
  const navigate = useNavigate();

  // Form State
  const [origin, setOrigin] = useState("Indore");
  const [destination, setDestination] = useState("Ujjain (Mahakaleshwar)");
  const [departureDate, setDepartureDate] = useState(() => format(addDays(new Date(), 2), "yyyy-MM-dd"));
  const [arrivalDate, setArrivalDate] = useState(() => format(addDays(new Date(), 4), "yyyy-MM-dd"));
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  const [budget, setBudget] = useState("Comfortable");
  const [style, setStyle] = useState("Devotional");
  const [language, setLanguage] = useState("English");

  // Output State
  const [isLoading, setIsLoading] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(true);

  const durationDays = Math.max(1, differenceInDays(new Date(arrivalDate), new Date(departureDate)) + 1);

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    setError(null);

    if (!origin.trim() || !destination.trim()) {
      setError("Please enter both starting city and sacred destination.");
      return;
    }

    if (new Date(arrivalDate) < new Date(departureDate)) {
      setError("Return date must be equal to or after departure date.");
      return;
    }

    setIsLoading(true);
    setItinerary(null);

    try {
      const payload = {
        origin: origin.trim(),
        destination: destination.trim(),
        departureDate: new Date(departureDate),
        arrivalDate: new Date(arrivalDate),
        numberOfPeople: Number(numberOfPeople) || 1,
        budget,
        style,
        language,
      };

      const res = await getItinerary(payload);

      if (res.error) {
        setError(res.error);
      } else if (res.data) {
        setItinerary(res.data);
      }
    } catch (err) {
      console.error("Itinerary generation error:", err);
      setError(err.message || "Failed to generate itinerary. Please try again.");
    } finally {
      setIsLoading(false);

      setTimeout(() => {
        const resultsEl = document.getElementById("itinerary-results-section");
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  };

  const downloadPDF = () => {
    if (!itinerary) return;
    const itn = itinerary.itinerary || itinerary;

    const dailyPlanHTML = (itn.daily_plan || [])
      .sort((a, b) => a.day - b.day)
      .map(
        (day) => `
        <div class="day-card">
          <div class="day-header">
            <div class="day-badge">
              <span class="day-label">DAY</span>
              <span class="day-num">${day.day}</span>
            </div>
            <div class="day-info">
              <h3>Daily Immersion</h3>
              <p>${day.activities.length} Sacred Activities Planned</p>
            </div>
            <div class="day-cost">
              <span class="cost-label">EST. COST</span>
              <span class="cost-val">${day.estimated_cost || "N/A"}</span>
            </div>
          </div>

          <div class="day-body">
            <div class="activities-col">
              <h4 class="section-label">&#10022; ACTIVITIES &amp; RITUALS</h4>
              ${day.activities.map((act) => `<div class="activity-item"><span class="dot"></span><span>${act}</span></div>`).join("")}
            </div>

            <div class="sidebar-col">
              ${
                day.accommodation
                  ? `
              <div class="info-card orange-card">
                <h4 class="section-label" style="color:#ea580c;">&#127968; STAY</h4>
                <p class="info-name">${day.accommodation.name}</p>
                <p class="info-sub">${day.accommodation.rating ? `&#11088; ${day.accommodation.rating}` : ""} ${day.accommodation.price ? `&bull; ${day.accommodation.price}` : ""}</p>
              </div>`
                  : ""
              }

              ${
                day.transportation_options && day.transportation_options.length
                  ? `
              <div class="info-card grey-card">
                <h4 class="section-label">&#128663; TRANSIT</h4>
                ${day.transportation_options
                  .map(
                    (t) => `
                  <div class="transit-item">
                    <p class="info-name">${t.mode}</p>
                    <p class="info-sub">${t.details}</p>
                    <p class="transit-price">${t.price}</p>
                  </div>
                `
                  )
                  .join("")}
              </div>`
                  : ""
              }
            </div>
          </div>
        </div>
      `
      )
      .join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${itn.title || "Sacred Itinerary"} - DivyaYatra</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      background: #fff;
      color: #1e293b;
      font-size: 13px;
      line-height: 1.6;
    }

    .pdf-header {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #7c2d12 100%);
      color: white;
      padding: 40px 48px 36px;
      position: relative;
      overflow: hidden;
    }
    .header-brand {
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: #f97316;
      margin-bottom: 16px;
      position: relative; z-index: 1;
    }
    .header-title {
      font-size: 32px;
      font-weight: 900;
      line-height: 1.15;
      margin-bottom: 24px;
      position: relative; z-index: 1;
    }
    .header-meta {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      padding-top: 20px;
      border-top: 1px solid rgba(255,255,255,0.12);
      position: relative; z-index: 1;
    }
    .meta-item .meta-label {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #94a3b8;
      margin-bottom: 4px;
    }
    .meta-item .meta-value {
      font-size: 13px;
      font-weight: 700;
      color: #f8fafc;
    }

    .pdf-body { padding: 36px 48px; }

    .cost-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(135deg, #fff7ed, #fef3c7);
      border: 1px solid #fed7aa;
      border-radius: 16px;
      padding: 24px 28px;
      margin-bottom: 32px;
    }
    .total-label {
      font-size: 9px;
      font-weight: 900;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #92400e;
      margin-bottom: 4px;
    }
    .total-value {
      font-size: 28px;
      font-weight: 900;
      color: #1e293b;
    }
    .notes-text {
      font-size: 12px;
      font-style: italic;
      color: #78350f;
      max-width: 380px;
      text-align: right;
      line-height: 1.6;
    }

    .schedule-heading {
      font-size: 9px;
      font-weight: 900;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .schedule-heading::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #e2e8f0;
    }

    .day-card {
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      overflow: hidden;
      margin-bottom: 18px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .day-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }
    .day-badge {
      width: 48px; height: 48px;
      background: linear-gradient(135deg, #ea580c, #dc2626);
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }
    .day-label { font-size: 8px; font-weight: 900; letter-spacing: 0.1em; }
    .day-num { font-size: 20px; font-weight: 900; line-height: 1; }
    .day-info { flex: 1; }
    .day-info h3 { font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 2px; }
    .day-info p { font-size: 12px; color: #64748b; font-weight: 500; }
    .day-cost { text-align: right; }
    .cost-label { font-size: 8px; font-weight: 900; letter-spacing: 0.15em; text-transform: uppercase; color: #94a3b8; display: block; margin-bottom: 2px; }
    .cost-val { font-size: 15px; font-weight: 800; color: #ea580c; }

    .day-body {
      display: grid;
      grid-template-columns: 1fr 260px;
      gap: 24px;
      padding: 20px;
    }
    .section-label {
      font-size: 8px;
      font-weight: 900;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #94a3b8;
      margin-bottom: 12px;
    }
    .activities-col { display: flex; flex-direction: column; gap: 8px; }
    .activity-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-size: 12.5px;
      font-weight: 500;
      color: #334155;
      line-height: 1.5;
    }
    .dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #ea580c;
      flex-shrink: 0;
      margin-top: 6px;
    }

    .sidebar-col { display: flex; flex-direction: column; gap: 12px; }
    .info-card {
      border-radius: 12px;
      padding: 14px 16px;
    }
    .orange-card { background: #fff7ed; border: 1px solid #ffedd5; }
    .grey-card { background: #f8fafc; border: 1px solid #f1f5f9; }
    .info-name { font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 2px; }
    .info-sub { font-size: 11px; color: #64748b; font-weight: 500; }
    .transit-item { margin-top: 8px; padding-top: 8px; border-top: 1px dashed #e2e8f0; }
    .transit-item:first-of-type { margin-top: 0; padding-top: 0; border-top: none; }
    .transit-price { font-size: 10px; font-weight: 800; color: #ea580c; margin-top: 2px; text-transform: uppercase; }

    .pdf-footer {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 24px 48px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #94a3b8;
      font-size: 11px;
      font-weight: 500;
    }
    .footer-brand { font-weight: 800; color: #0f172a; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="pdf-header">
    <div class="header-brand">&#10022; DivyaYatra Sacred Pilgrimage Itinerary</div>
    <div class="header-title">${itn.title || "Sacred Pilgrimage Itinerary"}</div>
    <div class="header-meta">
      <div class="meta-item">
        <div class="meta-label">Origin &rarr; Destination</div>
        <div class="meta-value">${itn.origin || origin} &rarr; ${itn.destination || destination}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Travel Dates</div>
        <div class="meta-value">${itn.departureDate || departureDate} &ndash; ${itn.arrivalDate || arrivalDate}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Pilgrims &amp; Style</div>
        <div class="meta-value">${itn.numberOfPeople || numberOfPeople} Travelers &bull; ${itn.style || style}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Budget Tier</div>
        <div class="meta-value">${itn.budget || budget}</div>
      </div>
    </div>
  </div>

  <div class="pdf-body">
    <div class="cost-banner">
      <div>
        <div class="total-label">Total Estimated Investment</div>
        <div class="total-value">${itn.total_estimated_cost || "Custom Estimate"}</div>
      </div>
      <div class="notes-text">&ldquo;${itn.notes || "May Mahakaal bless and protect your pilgrimage."}&rdquo;</div>
    </div>

    <div class="schedule-heading">Daily Sacred Immersion Schedule</div>
    ${dailyPlanHTML}
  </div>

  <div class="pdf-footer">
    <div>Generated by <span class="footer-brand">DivyaYatra</span> &bull; AI-Powered Sacred Pilgrimage Intelligence</div>
    <div>simhastha.mp.gov.in &bull; Official Pilgrimage Partner</div>
  </div>
</body>
</html>`;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 font-sans selection:bg-orange-100 flex flex-col justify-between overflow-x-hidden">
      <Header />

      {/* Subtle Temple Background */}
      <div className="absolute top-0 left-0 right-0 w-full h-[480px] pointer-events-none overflow-hidden z-0">
        <img
          src={templeBgImg}
          alt="Temple Backdrop"
          className="w-full h-full object-cover object-top opacity-20 filter contrast-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF8F5]/20 via-[#FAF8F5]/80 to-[#FAF8F5]" />
      </div>

      <main className={`relative z-10 pt-24 pb-16 mx-auto w-full px-4 sm:px-6 lg:px-8 flex-grow transition-all duration-300 ${itinerary ? "max-w-6xl xl:max-w-7xl" : "max-w-4xl"}`}>
        
        {/* TOP NAVIGATION BARS */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <button
            onClick={() => navigate("/chatbot")}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/95 hover:bg-white border border-orange-200 rounded-full text-xs font-bold text-slate-700 hover:text-orange-700 shadow-2xs transition-all active:scale-95"
          >
            <ArrowLeft size={13} className="text-orange-600" />
            <span>Back to Hub</span>
          </button>

          <button
            onClick={() => navigate("/ai-assistant")}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 rounded-full text-xs font-bold shadow-2xs transition-all active:scale-95"
          >
            <MessageSquare size={13} className="text-purple-600" />
            <span>Ask Divya AI</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </button>
        </div>

        {/* HERO TITLE HEADER */}
        <div className="text-center max-w-xl mx-auto mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100/90 text-orange-800 rounded-full text-[11px] font-black uppercase tracking-wider mb-2 border border-orange-200 shadow-2xs">
            <Sparkles size={12} className="text-orange-600" />
            <span>Sacred Yatra Planner</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            Plan Your <span className="text-[#EA580C]">Divine Yatra</span>
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-1">
            Fill your pilgrimage details to receive an auspicious day-by-day itinerary.
          </p>
        </div>

        {/* ========================================================= */}
        {/* COMPACT & ELEGANT FORM CARD */}
        {/* ========================================================= */}
        {showForm && (
          <div className="bg-white rounded-3xl border border-orange-200/90 shadow-lg shadow-orange-950/5 p-5 sm:p-7 mb-8 relative">
            
            {/* Top Language & Mode Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Languages size={15} className="text-orange-600" />
                <span className="text-xs font-bold text-slate-700">
                  {language === "Hindi" ? "यात्रा कार्यक्रम की भाषा चुनें:" : "Choose Itinerary Language:"}
                </span>
              </div>

              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setLanguage("English")}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                    language === "English"
                      ? "bg-white text-orange-700 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("Hindi")}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                    language === "Hindi"
                      ? "bg-[#EA580C] text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  हिन्दी (Hindi)
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle size={15} className="text-red-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* FORM FIELDS */}
            <form onSubmit={handleGenerate} className="space-y-4">
              
              {/* ORIGIN & DESTINATION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1">
                    <MapPin size={12} className="text-slate-400" /> Starting City (Origin)
                  </label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="e.g. Indore, Mumbai, Delhi"
                    required
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:border-orange-500 focus:ring-3 focus:ring-orange-500/10 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1">
                    <Landmark size={12} className="text-orange-600" /> Sacred Destination
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Ujjain (Mahakaleshwar)"
                    required
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:border-orange-500 focus:ring-3 focus:ring-orange-500/10 outline-none transition-all"
                  />
                </div>
              </div>

              {/* DATES & PILGRIMS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1">
                    <Calendar size={12} className="text-orange-600" /> Departure Date
                  </label>
                  <input
                    type="date"
                    value={departureDate}
                    min={format(new Date(), "yyyy-MM-dd")}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    required
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:border-orange-500 focus:ring-3 focus:ring-orange-500/10 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-orange-600" /> Return Date
                    </span>
                    <span className="text-[9px] font-extrabold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded-md">
                      {durationDays} Days
                    </span>
                  </label>
                  <input
                    type="date"
                    value={arrivalDate}
                    min={departureDate}
                    onChange={(e) => setArrivalDate(e.target.value)}
                    required
                    className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:border-orange-500 focus:ring-3 focus:ring-orange-500/10 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1">
                    <Users size={12} className="text-orange-600" /> Pilgrims Count
                  </label>
                  <div className="flex items-center h-11 bg-slate-50 border border-slate-200 rounded-xl px-2">
                    <button
                      type="button"
                      onClick={() => setNumberOfPeople(Math.max(1, numberOfPeople - 1))}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-orange-50 transition-colors"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-bold text-xs sm:text-sm text-slate-900">
                      {numberOfPeople} {numberOfPeople === 1 ? "Person" : "Persons"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setNumberOfPeople(numberOfPeople + 1)}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center hover:bg-orange-50 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* FINANCIAL STYLE / BUDGET TIERS */}
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1">
                    <Wallet size={12} className="text-orange-600" />
                    <span>Financial Style</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Includes stay, meals &amp; transit</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {BUDGET_TIERS.map((tier) => {
                    const isSelected = budget === tier.id;
                    return (
                      <div
                        key={tier.id}
                        onClick={() => setBudget(tier.id)}
                        className={`cursor-pointer p-3 rounded-2xl border transition-all ${
                          isSelected
                            ? "bg-orange-50/70 border-orange-500 ring-2 ring-orange-400/20 shadow-2xs"
                            : "bg-white hover:bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-slate-900">{tier.icon} {tier.label}</span>
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                            isSelected ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-600"
                          }`}>
                            {tier.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight">{tier.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SACRED JOURNEY INTENT */}
              <div>
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1 mb-1.5">
                  <Flame size={12} className="text-orange-600" />
                  <span>Sacred Journey Intent</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {YATRA_INTENTS.map((item) => {
                    const isSelected = style === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setStyle(item.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                            : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800"
                        }`}
                      >
                        <div className="text-sm mb-0.5">{item.icon}</div>
                        <p className="text-xs font-bold leading-tight truncate">{item.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#EA580C] hover:bg-[#D94F04] text-white font-black text-xs uppercase tracking-[0.16em] shadow-md shadow-orange-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>Generating Auspicious Itinerary...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      <span>Generate Day-Wise Itinerary &amp; Budget Plan</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* RESULTS SECTION USING ORIGINAL ITINERARY DISPLAY */}
        {/* ========================================================= */}
        {(isLoading || itinerary || error) && (
          <div id="itinerary-results-section" className="space-y-6 animate-fadeInUp">
            
            {itinerary && (
              <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-orange-200 shadow-xs">
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 rounded-full text-xs font-bold transition-all"
                >
                  <SlidersHorizontal size={12} />
                  <span>{showForm ? "Hide Form" : "Modify Preferences"}</span>
                </button>

                <button
                  onClick={downloadPDF}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-orange-600 text-white rounded-full text-xs font-bold transition-all shadow-xs"
                >
                  <Download size={13} />
                  <span>Download PDF Itinerary</span>
                </button>
              </div>
            )}

            <div className="w-full">
              <ItineraryDisplay itinerary={itinerary} isLoading={isLoading} error={error} />
            </div>

          </div>
        )}

      </main>

      <Footer />
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeInUp { animation: fadeInUp 0.5s ease-out; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #FED7AA; border-radius: 10px; }
      `}} />
    </div>
  );
}
