import React, { useState } from "react";
import { format } from "date-fns";
import {
  MapPin,
  Calendar as CalendarIcon,
  Users,
  Wallet,
  Sparkles,
  Car,
  Home as HomeIcon,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Landmark,
  CheckCircle2
} from "lucide-react";
import ItinerarySkeleton from "./itinerary-skeleton";

export default function ItineraryDisplay({ itinerary, isLoading, error }) {
  const [expandedDays, setExpandedDays] = useState({ 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true });
  const [completedActivities, setCompletedActivities] = useState({});

  if (isLoading) {
    return <ItinerarySkeleton />;
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50/80 border border-red-200 rounded-3xl text-center shadow-sm">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h4 className="text-lg font-black text-red-900 mb-1">Itinerary Generation Alert</h4>
        <p className="text-sm font-medium text-red-700 max-w-md mx-auto">{error}</p>
      </div>
    );
  }

  if (!itinerary) {
    return null;
  }

  const itn = itinerary.itinerary || itinerary;
  const days = (itn.daily_plan || []).sort((a, b) => a.day - b.day);

  const toggleDayCollapse = (dayNum) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayNum]: !prev[dayNum],
    }));
  };

  const toggleActivity = (dayIndex, actIndex) => {
    const key = `${dayIndex}_${actIndex}`;
    setCompletedActivities((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Helper to format dates safely
  let datesDisplay = itn.departureDate && itn.arrivalDate ? `${itn.departureDate} - ${itn.arrivalDate}` : "Sacred Dates";
  try {
    if (itn.departureDate && itn.arrivalDate && !isNaN(new Date(itn.departureDate.replace(/-/g, "/")).getTime())) {
      const d1 = format(new Date(itn.departureDate.replace(/-/g, "/")), "MMM d");
      const d2 = format(new Date(itn.arrivalDate.replace(/-/g, "/")), "MMM d");
      datesDisplay = `${d1} - ${d2}`;
    }
  } catch (e) {
    // Keep fallback
  }

  const isHindi = itn.title && /[\u0900-\u097F]/.test(itn.title);

  return (
    <div className="space-y-8 animate-fadeInUp">
      {/* ── TOP PERSONALIZED JOURNEY HEADER ───────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-orange-100/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-600 block mb-1">
            {isHindi ? "व्यक्तिगत यात्रा" : "Personalized Journey"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
            {itn.title || (isHindi ? "पवित्र तीर्थयात्रा कार्यक्रम" : "Sacred Pilgrimage Journey")}
          </h2>
        </div>

        {/* 4-COLUMN SUMMARY GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              {isHindi ? "गंतव्य" : "Destination"}
            </p>
            <p className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
              {itn.destination || "Holy Sanctum"}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              {isHindi ? "तिथियां" : "Dates"}
            </p>
            <p className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
              {datesDisplay}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              {isHindi ? "समूह का आकार" : "Group Size"}
            </p>
            <p className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
              {itn.numberOfPeople || 2} {isHindi ? "यात्री" : "Traveler(s)"}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              {isHindi ? "बजट शैली" : "Budget Style"}
            </p>
            <p className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
              {itn.budget || (isHindi ? "मामूली" : "Modest")} • {itn.style || (isHindi ? "शांतिपूर्ण" : "Peaceful")}
            </p>
          </div>
        </div>
      </div>

      {/* ── DETAILED SCHEDULE HEADER ──────────────────────────────────────── */}
      <div className="space-y-1">
        <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
          {isHindi ? "विस्तृत यात्रा कार्यक्रम" : "Detailed Schedule"}
        </h3>
        <p className="text-xs font-semibold text-slate-500">
          {isHindi ? "दैनिक विभाजन और समय-सारणी" : "Hourly Breakdown"}
        </p>
      </div>

      {/* ── DAY-WISE CARDS (EXACT SCREENSHOT LAYOUT) ───────────────────────── */}
      <div className="space-y-6">
        {days.map((day) => {
          const isExpanded = expandedDays[day.day] !== false;
          const activitiesCount = (day.activities || []).length;

          return (
            <div
              key={day.day}
              className="bg-white rounded-3xl border border-orange-100/90 shadow-sm overflow-hidden transition-all"
            >
              {/* Day Header Row */}
              <div
                onClick={() => toggleDayCollapse(day.day)}
                className="cursor-pointer p-5 sm:p-6 flex items-center justify-between gap-4 hover:bg-orange-50/30 transition-colors border-b border-transparent data-[open=true]:border-slate-100"
                data-open={isExpanded}
              >
                {/* Left: Circular Day Badge + Title */}
                <div className="flex items-center gap-4">
                  <div className="w-13 h-13 rounded-2xl bg-[#FFEDD5] text-[#EA580C] flex flex-col items-center justify-center flex-shrink-0 shadow-xs border border-orange-200/60">
                    <span className="text-[9px] font-black uppercase tracking-wider">DAY</span>
                    <span className="text-xl font-black leading-none">{day.day}</span>
                  </div>

                  <div>
                    <h4 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                      {day.title || (isHindi ? "दैनिक विसर्जन" : "Daily Immersion")}
                    </h4>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      {day.subtitle || `${activitiesCount} ${isHindi ? "पवित्र गतिविधियां नियोजित" : "Sacred Activities Planned"}`}
                    </p>
                  </div>
                </div>

                {/* Right: Est. Cost + Chevron */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  {day.estimated_cost && (
                    <div className="text-right hidden sm:block">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                        EST. COST
                      </span>
                      <span className="text-sm font-bold text-slate-800">
                        {day.estimated_cost}
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-orange-100 text-slate-600 hover:text-orange-700 flex items-center justify-center transition-colors"
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Mobile Cost Banner */}
              {isExpanded && day.estimated_cost && (
                <div className="sm:hidden px-5 py-2 bg-orange-50/50 border-b border-orange-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500 uppercase text-[10px]">EST. COST</span>
                  <span className="font-bold text-slate-900">{day.estimated_cost}</span>
                </div>
              )}

              {/* Day Expanded Body */}
              {isExpanded && (
                <div className="p-5 sm:p-6 pt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#FAFAF8]/50">
                  
                  {/* LEFT COLUMN: ACTIVITIES & RITUALS (7 Cols) */}
                  <div className="lg:col-span-7 space-y-3">
                    <div className="flex items-center gap-1.5 mb-1 text-slate-400">
                      <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                      <h5 className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                        {isHindi ? "गतिविधियां और अनुष्ठान" : "ACTIVITIES & RITUALS"}
                      </h5>
                    </div>

                    <div className="space-y-2.5">
                      {(day.activities || []).map((act, actIdx) => {
                        const isChecked = completedActivities[`${day.day}_${actIdx}`];
                        return (
                          <div
                            key={actIdx}
                            onClick={() => toggleActivity(day.day, actIdx)}
                            className={`cursor-pointer px-4 py-3.5 rounded-2xl border transition-all flex items-start gap-3 shadow-2xs ${
                              isChecked
                                ? "bg-emerald-50/60 border-emerald-200 text-slate-400"
                                : "bg-white hover:bg-orange-50/40 border-slate-100 hover:border-orange-200 text-slate-800"
                            }`}
                          >
                            {/* Orange Round Bullet Point */}
                            <span className="w-2 h-2 rounded-full bg-[#EA580C] mt-1.5 flex-shrink-0" />

                            <div className="flex-1">
                              <p
                                className={`text-xs sm:text-[13px] font-medium leading-relaxed ${
                                  isChecked ? "line-through opacity-70" : ""
                                }`}
                              >
                                {act}
                              </p>
                            </div>

                            {isChecked && (
                              <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0 mt-1" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* RIGHT COLUMN: STAY & TRANSIT (5 Cols) */}
                  <div className="lg:col-span-5 space-y-4">
                    
                    {/* 🏠 STAY CARD */}
                    {day.accommodation && (
                      <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFBF5] border border-[#FFEDD5] shadow-2xs space-y-2">
                        <div className="flex items-center gap-1.5 text-[#EA580C] font-black text-[11px] uppercase tracking-wider">
                          <HomeIcon size={14} className="text-[#EA580C]" />
                          <span>{isHindi ? "आवास / ठहरना" : "STAY"}</span>
                        </div>

                        <div>
                          <h6 className="font-bold text-sm text-slate-900 leading-snug">
                            {day.accommodation.name}
                          </h6>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs font-semibold text-slate-500">
                            {day.accommodation.rating && (
                              <span className="flex items-center gap-1 text-amber-600">
                                ★ {day.accommodation.rating}
                              </span>
                            )}
                            {day.accommodation.price && (
                              <span className="text-slate-600">
                                {day.accommodation.price}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 🚗 TRANSIT CARD */}
                    {day.transportation_options && day.transportation_options.length > 0 && (
                      <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 shadow-2xs space-y-3">
                        <div className="flex items-center gap-1.5 text-slate-500 font-black text-[11px] uppercase tracking-wider">
                          <Car size={14} className="text-slate-500" />
                          <span>{isHindi ? "परिवहन" : "TRANSIT"}</span>
                        </div>

                        <div className="space-y-3">
                          {day.transportation_options.map((t, tIdx) => (
                            <div key={tIdx} className="space-y-1">
                              <p className="font-bold text-sm text-slate-900">
                                {t.mode}
                              </p>
                              <p className="text-xs font-medium text-slate-600 leading-relaxed">
                                {t.details}
                              </p>
                              {t.price && (
                                <p className="text-xs font-bold text-[#EA580C] pt-0.5">
                                  {t.price}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── BOTTOM TOTAL INVESTMENT & DIVINE ADVICE ───────────────────────── */}
      <div className="bg-white rounded-3xl border border-orange-100/90 shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* TOTAL INVESTMENT */}
        {itn.total_estimated_cost && (
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              {isHindi ? "कुल निवेश" : "Total Investment"}
            </span>
            <p className="text-xl sm:text-2xl font-black text-slate-900">
              {itn.total_estimated_cost}
            </p>
          </div>
        )}

        {/* DIVINE ADVICE / NOTES */}
        {itn.notes && (
          <div className="pt-4 border-t border-slate-100">
            <div className="p-5 rounded-2xl bg-orange-50/60 border border-orange-200/70 text-slate-700 space-y-2">
              <div className="flex items-center gap-2 text-orange-800 font-black text-xs uppercase tracking-wider">
                <Landmark size={15} className="text-orange-600" />
                <span>{isHindi ? "महत्वपूर्ण यात्रा सुझाव व दिशा-निर्देश" : "Important Pilgrim Guidance & Tips"}</span>
              </div>
              <p className="text-xs sm:text-[13px] font-medium leading-relaxed italic text-slate-700">
                &ldquo;{itn.notes}&rdquo;
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}