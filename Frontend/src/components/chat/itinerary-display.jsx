import React, { useState } from "react";
import { format } from "date-fns";
import {
  Sparkles,
  Car,
  Home as HomeIcon,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Landmark,
  CheckCircle2,
  Circle,
  Bus,
  Train,
  Plane,
  Star,
  Navigation,
  Zap,
  Maximize2,
  Minimize2,
  Calendar,
  Users,
  Wallet,
  Clock,
  ArrowRight,
  ShieldCheck,
  Check,
  MapPin,
  Compass
} from "lucide-react";
import ItinerarySkeleton from "./itinerary-skeleton";

const TRANSPORT_ICONS = {
  Bus: Bus,
  Train: Train,
  Flight: Plane,
  Plane: Plane,
  car: Car,
  "auto-rickshaw": Zap,
  "e-rickshaw": Zap,
  cab: Car,
};

const TRANSPORT_THEMES = {
  Bus: {
    bg: "bg-orange-50/70",
    border: "border-orange-200",
    text: "text-orange-900",
    badge: "bg-orange-500 text-white",
    tabActive: "bg-orange-600 text-white shadow-sm shadow-orange-500/20",
    pillBg: "bg-orange-100 text-orange-800",
  },
  Train: {
    bg: "bg-blue-50/70",
    border: "border-blue-200",
    text: "text-blue-900",
    badge: "bg-blue-600 text-white",
    tabActive: "bg-blue-600 text-white shadow-sm shadow-blue-500/20",
    pillBg: "bg-blue-100 text-blue-800",
  },
  Flight: {
    bg: "bg-purple-50/70",
    border: "border-purple-200",
    text: "text-purple-900",
    badge: "bg-purple-600 text-white",
    tabActive: "bg-purple-600 text-white shadow-sm shadow-purple-500/20",
    pillBg: "bg-purple-100 text-purple-800",
  },
  default: {
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-800",
    badge: "bg-slate-600 text-white",
    tabActive: "bg-slate-700 text-white",
    pillBg: "bg-slate-100 text-slate-700",
  },
};

const HOTEL_TIER_META = {
  Budget: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    label: "Budget Pick",
    icon: "🌱",
  },
  "Mid-range": {
    badge: "bg-amber-50 text-amber-800 border-amber-200",
    label: "Comfort & Value",
    icon: "⭐",
  },
  Luxury: {
    badge: "bg-purple-50 text-purple-700 border-purple-200",
    label: "Premium Stay",
    icon: "👑",
  },
  Transit: {
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    label: "Overnight Transit",
    icon: "🚌",
  },
};

// ── Transport Component ────────────────────────────────────────────────────────
function TransportSection({ options, isHindi }) {
  const MAIN = ["Bus", "Train", "Flight"];
  const isLongDistance = options.some((o) => MAIN.includes(o.mode));
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  if (!isLongDistance) {
    return (
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-500 font-semibold text-xs uppercase tracking-wider">
          <Navigation size={14} className="text-orange-600" />
          <span>{isHindi ? "स्थानीय परिवहन" : "Local Transportation"}</span>
        </div>
        {options.map((t, i) => (
          <div
            key={i}
            className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:bg-white transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Car size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-sm text-slate-900">{t.mode}</p>
                {t.price && (
                  <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/60">
                    {t.price}
                  </span>
                )}
              </div>
              {t.details && (
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {t.details}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const transportOptions = MAIN.map((m) =>
    options.find((o) => o.mode === m)
  ).filter(Boolean);

  const activeOption = transportOptions[activeTabIndex] || transportOptions[0];
  if (!activeOption) return null;

  const theme =
    TRANSPORT_THEMES[activeOption.mode] || TRANSPORT_THEMES.default;
  const ActiveIcon = TRANSPORT_ICONS[activeOption.mode] || Bus;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/80 border-b border-slate-200/70">
        {transportOptions.map((opt, i) => {
          const isSelected = i === activeTabIndex;
          const optTheme =
            TRANSPORT_THEMES[opt.mode] || TRANSPORT_THEMES.default;
          const TabIcon = TRANSPORT_ICONS[opt.mode] || Bus;

          return (
            <button
              key={i}
              type="button"
              onClick={() => setActiveTabIndex(i)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? optTheme.tabActive
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
              }`}
            >
              <TabIcon size={14} />
              <span>{opt.mode}</span>
            </button>
          );
        })}
      </div>

      {/* Mode Detail Card */}
      <div className={`p-5 ${theme.bg} space-y-4`}>
        {/* Header line: Operator & Price */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl ${theme.badge} flex items-center justify-center shadow-xs flex-shrink-0`}
            >
              <ActiveIcon size={18} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                {activeOption.mode} Option
              </span>
              <h6 className="font-bold text-sm text-slate-900 leading-snug">
                {activeOption.operator || `${activeOption.mode} Service`}
              </h6>
            </div>
          </div>
          {activeOption.price && (
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 bg-white text-orange-700 font-bold text-xs rounded-full border border-orange-200 shadow-2xs">
                {activeOption.price}
              </span>
            </div>
          )}
        </div>

        {/* Departure & Arrival Visual Route */}
        {(activeOption.departure || activeOption.arrival) && (
          <div className="bg-white/90 rounded-xl p-3.5 border border-slate-200/70 flex items-center justify-between gap-3">
            <div className="text-left">
              <span className="text-[10px] font-semibold text-slate-400 uppercase block tracking-wider">
                Departure
              </span>
              <p className="text-base font-bold text-slate-900">
                {activeOption.departure || "—"}
              </p>
            </div>

            <div className="flex-1 flex flex-col items-center px-2">
              <div className="w-full flex items-center gap-1.5">
                <div className="h-0.5 flex-1 bg-slate-300 rounded-full" />
                <ActiveIcon size={13} className="text-slate-400 flex-shrink-0" />
                <ArrowRight size={13} className="text-slate-400 flex-shrink-0" />
                <div className="h-0.5 flex-1 bg-slate-300 rounded-full" />
              </div>
              <span className="text-[10px] font-medium text-slate-500 mt-1">
                Direct Route
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-semibold text-slate-400 uppercase block tracking-wider">
                Arrival
              </span>
              <p className="text-base font-bold text-slate-900">
                {activeOption.arrival || "—"}
              </p>
            </div>
          </div>
        )}

        {/* Route Details Description */}
        {activeOption.details && (
          <p className="text-xs text-slate-700 leading-relaxed font-normal bg-white/60 p-3 rounded-xl border border-slate-200/50">
            {activeOption.details}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Stay (Accommodation) Component ─────────────────────────────────────────────
function StaySection({ options, accommodation, isHindi }) {
  const [selectedStayIdx, setSelectedStayIdx] = useState(0);

  const hotels =
    Array.isArray(options) && options.length > 0
      ? options
      : accommodation
      ? [
          {
            ...accommodation,
            type: "Mid-range",
            highlights: accommodation.name,
          },
        ]
      : null;

  if (!hotels || hotels.length === 0) return null;

  // Single transit stay
  if (
    hotels.length === 1 &&
    (hotels[0].type === "Transit" || hotels[0].rating === "N/A")
  ) {
    return (
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-slate-500 font-semibold text-xs uppercase tracking-wider">
          <HomeIcon size={14} className="text-orange-600" />
          <span>{isHindi ? "आवास व्यवस्था" : "Accommodation"}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/60">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md inline-block mb-1">
            Overnight Journey
          </span>
          <p className="font-semibold text-sm text-slate-900">
            {hotels[0].name}
          </p>
          <p className="text-xs text-slate-600 mt-1 font-normal leading-relaxed">
            {hotels[0].highlights || "Transit accommodation during travel."}
          </p>
        </div>
      </div>
    );
  }

  const activeHotel = hotels[selectedStayIdx] || hotels[0];
  const tierMeta =
    HOTEL_TIER_META[activeHotel.type] || HOTEL_TIER_META["Mid-range"];

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
      {/* Header & Tabs */}
      <div className="p-4 pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-slate-500 font-semibold text-xs uppercase tracking-wider">
            <HomeIcon size={14} className="text-orange-600" />
            <span>{isHindi ? "आवास विकल्प" : "Where to Stay"}</span>
          </div>
          <span className="text-[11px] font-medium text-slate-400">
            {hotels.length} Options Available
          </span>
        </div>

        {hotels.length > 1 && (
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl">
            {hotels.map((h, i) => {
              const isSel = i === selectedStayIdx;
              const meta = HOTEL_TIER_META[h.type] || HOTEL_TIER_META["Mid-range"];
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedStayIdx(i)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer truncate ${
                    isSel
                      ? "bg-white text-orange-700 shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span className="mr-1">{meta.icon}</span>
                  <span>{h.type || `Option ${i + 1}`}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Hotel Body */}
      <div className="p-5 bg-gradient-to-b from-amber-50/30 to-white space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${tierMeta.badge}`}
            >
              <span>{tierMeta.icon}</span>
              <span>{tierMeta.label}</span>
            </span>
            <h6 className="font-bold text-base text-slate-900 leading-snug">
              {activeHotel.name}
            </h6>
          </div>

          {activeHotel.price && (
            <div className="text-right flex-shrink-0">
              <span className="text-base font-bold text-orange-600 block leading-tight">
                {activeHotel.price}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase">
                per night
              </span>
            </div>
          )}
        </div>

        {/* Rating and Badges */}
        {activeHotel.rating && activeHotel.rating !== "N/A" && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100/80 text-amber-800 font-bold text-xs">
              <Star size={12} className="fill-amber-500 text-amber-500" />
              <span>{activeHotel.rating}</span>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Verified Pilgrim Stay
            </span>
          </div>
        )}

        {/* Highlights / Features */}
        {activeHotel.highlights && (
          <p className="text-xs text-slate-700 leading-relaxed font-normal bg-white p-3 rounded-xl border border-slate-200/70">
            {activeHotel.highlights}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main Itinerary Component ──────────────────────────────────────────────────
export default function ItineraryDisplay({ itinerary, isLoading, error }) {
  const [expandedDays, setExpandedDays] = useState({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
    7: true,
  });
  const [completedActivities, setCompletedActivities] = useState({});
  const [isFullScreen, setIsFullScreen] = useState(false);

  if (isLoading) return <ItinerarySkeleton />;

  if (error) {
    return (
      <div className="p-8 bg-red-50/90 border border-red-200 rounded-3xl text-center shadow-sm">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h4 className="text-lg font-bold text-red-900 mb-1">
          Itinerary Generation Alert
        </h4>
        <p className="text-sm font-medium text-red-700 max-w-md mx-auto">
          {error}
        </p>
      </div>
    );
  }

  if (!itinerary) return null;

  const itn = itinerary.itinerary || itinerary;
  const days = (itn.daily_plan || []).sort((a, b) => a.day - b.day);
  const isHindi = itn.title && /[\u0900-\u097F]/.test(itn.title);

  const toggleAllDays = (expand) => {
    const nextState = {};
    days.forEach((d) => {
      nextState[d.day] = expand;
    });
    setExpandedDays(nextState);
  };

  const allExpanded = days.every((d) => expandedDays[d.day] !== false);

  let datesDisplay = "Auspicious Dates";
  try {
    if (itn.departureDate && itn.arrivalDate) {
      datesDisplay = `${format(
        new Date(itn.departureDate.replace(/-/g, "/")),
        "MMM d, yyyy"
      )} – ${format(
        new Date(itn.arrivalDate.replace(/-/g, "/")),
        "MMM d, yyyy"
      )}`;
    }
  } catch (_) {}

  return (
    <div
      className={`space-y-8 animate-fadeInUp transition-all duration-300 ${
        isFullScreen ? "w-full max-w-none" : "w-full"
      }`}
    >
      {/* ── TOP HERO OVERVIEW CARD ── */}
      <div className="relative overflow-hidden bg-white rounded-3xl border border-orange-200/80 shadow-md shadow-orange-950/5 p-6 sm:p-8 space-y-6">
        {/* Background Subtle Gradient Accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-orange-100/40 via-amber-50/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Title & Fullscreen Button Bar */}
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100/90 text-orange-800 text-xs font-bold uppercase tracking-wider">
              <Compass size={13} className="text-orange-600" />
              <span>
                {isHindi ? "वैयक्तिकृत तीर्थयात्रा कार्यक्रम" : "Personalized Sacred Yatra"}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
              {itn.title || "Sacred Pilgrimage Journey"}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-normal">
              {isHindi
                ? "आपकी सुविधा और दर्शन के अनुसार तैयार की गई संपूर्ण यात्रा योजना।"
                : "Auspicious day-wise schedule, verified stays, and complete transit routes."}
            </p>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => toggleAllDays(!allExpanded)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
            >
              {allExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              <span>{allExpanded ? "Collapse All" : "Expand All"}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="px-3.5 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
            >
              {isFullScreen ? (
                <>
                  <Minimize2 size={14} />
                  <span>Standard View</span>
                </>
              ) : (
                <>
                  <Maximize2 size={14} />
                  <span>Full Width</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Key Info Grid */}
        <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t border-slate-100">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium uppercase tracking-wider">
              <MapPin size={13} className="text-orange-500" />
              <span>{isHindi ? "गंतव्य" : "Destination"}</span>
            </div>
            <p className="font-bold text-sm sm:text-base text-slate-900 leading-snug truncate">
              {itn.destination || "Holy Sanctum"}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium uppercase tracking-wider">
              <Calendar size={13} className="text-orange-500" />
              <span>{isHindi ? "तिथियां" : "Duration"}</span>
            </div>
            <p className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
              {datesDisplay}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium uppercase tracking-wider">
              <Users size={13} className="text-orange-500" />
              <span>{isHindi ? "यात्री" : "Travelers"}</span>
            </div>
            <p className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
              {itn.numberOfPeople || 2} {isHindi ? "व्यक्ति" : "Pilgrim(s)"}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-100 space-y-1">
            <div className="flex items-center gap-1.5 text-orange-600 text-xs font-medium uppercase tracking-wider">
              <Wallet size={13} className="text-orange-600" />
              <span>{isHindi ? "कुल बजट" : "Estimated Budget"}</span>
            </div>
            <p className="font-bold text-sm sm:text-base text-orange-950 leading-snug">
              {itn.total_estimated_cost || "Custom Plan"}
            </p>
          </div>
        </div>
      </div>

      {/* ── DAY-BY-DAY ITINERARY CARDS ── */}
      <div className="space-y-6">
        {days.map((day) => {
          const isExp = expandedDays[day.day] !== false;

          return (
            <div
              key={day.day}
              className="bg-white rounded-3xl border border-orange-200/80 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              {/* Day Header */}
              <div
                onClick={() =>
                  setExpandedDays((prev) => ({
                    ...prev,
                    [day.day]: !prev[day.day],
                  }))
                }
                className="cursor-pointer p-5 sm:p-6 flex items-center justify-between gap-4 hover:bg-orange-50/30 transition-colors select-none"
              >
                {/* Left: Day Badge & Title */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex flex-col items-center justify-center flex-shrink-0 shadow-sm shadow-orange-600/20">
                    <span className="text-[10px] font-bold uppercase tracking-wider leading-none text-orange-100">
                      DAY
                    </span>
                    <span className="text-2xl font-bold leading-none mt-0.5">
                      {day.day}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
                      {day.title || "Daily Pilgrimage Schedule"}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 truncate">
                      {day.subtitle ||
                        `${(day.activities || []).length} Sacred Rituals & Sightseeing`}
                    </p>
                  </div>
                </div>

                {/* Right: Est Cost & Expand Arrow */}
                <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                  {day.estimated_cost && (
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                        EST. COST
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {day.estimated_cost}
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      isExp
                        ? "bg-orange-100 text-orange-800"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                    }`}
                  >
                    {isExp ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              </div>

              {/* Mobile Cost Bar */}
              {isExp && day.estimated_cost && (
                <div className="sm:hidden px-5 py-2.5 bg-orange-50/60 border-t border-b border-orange-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500 uppercase text-[11px]">
                    EST. DAILY COST
                  </span>
                  <span className="font-bold text-slate-900">
                    {day.estimated_cost}
                  </span>
                </div>
              )}

              {/* Day Body */}
              {isExp && (
                <div className="p-5 sm:p-7 pt-5 border-t border-slate-100 bg-[#FAFAF8]/60 grid grid-cols-1 lg:grid-cols-12 gap-7">
                  {/* Left Column: Activities & Rituals (7 cols) */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-200/60">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-orange-500" />
                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          {isHindi
                            ? "गतिविधियां और दर्शन अनुष्ठान"
                            : "Activities & Sacred Rituals"}
                        </h5>
                      </div>
                      <span className="text-xs font-semibold text-slate-400">
                        {(day.activities || []).length} Milestones
                      </span>
                    </div>

                    {/* Timeline list */}
                    <div className="space-y-3 relative before:absolute before:top-4 before:bottom-4 before:left-4 before:w-0.5 before:bg-orange-200/60 pl-1">
                      {(day.activities || []).map((activityText, actIdx) => {
                        const actKey = `${day.day}_${actIdx}`;
                        const isDone = completedActivities[actKey];

                        return (
                          <div
                            key={actIdx}
                            onClick={() =>
                              setCompletedActivities((p) => ({
                                ...p,
                                [actKey]: !p[actKey],
                              }))
                            }
                            className={`relative flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer shadow-2xs ${
                              isDone
                                ? "bg-emerald-50/80 border-emerald-200"
                                : "bg-white hover:bg-orange-50/40 border-slate-200/80 hover:border-orange-300"
                            }`}
                          >
                            {/* Step Number Circle */}
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 z-10 transition-all ${
                                isDone
                                  ? "bg-emerald-600 text-white"
                                  : "bg-orange-100 text-orange-800 border border-orange-200"
                              }`}
                            >
                              {isDone ? <Check size={14} /> : actIdx + 1}
                            </div>

                            {/* Activity Description */}
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm sm:text-[15px] leading-relaxed font-normal transition-all ${
                                  isDone
                                    ? "line-through text-slate-400"
                                    : "text-slate-800"
                                }`}
                              >
                                {activityText}
                              </p>
                            </div>

                            {/* Checkbox Icon */}
                            <div className="flex-shrink-0 mt-0.5">
                              {isDone ? (
                                <CheckCircle2
                                  size={18}
                                  className="text-emerald-600"
                                />
                              ) : (
                                <Circle
                                  size={18}
                                  className="text-slate-300 hover:text-orange-500"
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Stay & Transit (5 cols) */}
                  <div className="lg:col-span-5 space-y-5">
                    {/* Stay Section */}
                    <StaySection
                      options={day.accommodation_options}
                      accommodation={day.accommodation}
                      isHindi={isHindi}
                    />

                    {/* Transit Section */}
                    {day.transportation_options?.length > 0 && (
                      <TransportSection
                        options={day.transportation_options}
                        isHindi={isHindi}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── BOTTOM TOTAL & PILGRIM GUIDANCE NOTES ── */}
      <div className="bg-white rounded-3xl border border-orange-200/80 shadow-md shadow-orange-950/5 p-6 sm:p-8 space-y-6">
        {itn.total_estimated_cost && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 rounded-2xl bg-orange-50/60 border border-orange-200/70">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                {isHindi ? "अनुमानित कुल लागत" : "Total Estimated Yatra Cost"}
              </span>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">
                {itn.total_estimated_cost}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-orange-800 bg-white px-4 py-2 rounded-xl border border-orange-200/80">
              <ShieldCheck size={16} className="text-orange-600" />
              <span>Includes transit, lodging & rituals</span>
            </div>
          </div>
        )}

        {itn.notes && (
          <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm uppercase tracking-wider">
              <Landmark size={18} className="text-amber-700" />
              <span>
                {isHindi
                  ? "महत्वपूर्ण यात्रा दिशानिर्देश और सुझाव"
                  : "Important Pilgrim Guidelines & Practical Tips"}
              </span>
            </div>
            <p className="text-sm sm:text-[15px] font-normal leading-relaxed text-slate-700 italic">
              &ldquo;{itn.notes}&rdquo;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
