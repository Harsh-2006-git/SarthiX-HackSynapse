import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ItineraryForm from '../components/chat/itinerary-form';
import ItineraryDisplay from '../components/chat/itinerary-display';
import { getItinerary } from '../api/chatActions';
import { useToast } from '../hooks/use-toast';
import {
  Dialog, DialogContent, DialogTrigger,
  DialogTitle, DialogDescription as DialogDescriptionComponent,
} from '../components/ui/dialog';
import {
  Sparkles,
  ArrowRight,
  Download,
  Calendar,
  Shield,
  Clock,
  IndianRupee,
  Heart,
  FileText,
  Wallet,
  CalendarDays,
  MessageSquare,
  ShieldCheck,
  Headphones,
  Compass
} from 'lucide-react';

import yatraMapImg from '../assets/yatra_map_3d.jpg';
import divyaRobotImg from '../assets/divya_robot_3d.jpg';
import templeBgImg from '../assets/temple_ghats_bg.jpg';

export default function ChatbotPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const { toast } = useToast();

  const handleFormSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    setItinerary(null);
    setFormOpen(false);

    const result = await getItinerary(data);
    if (result.error) {
      setError(result.error);
      toast({ variant: 'destructive', title: 'Plan Failed', description: result.error });
    } else if (result.data) {
      setItinerary(result.data);
      toast({ title: 'Plan Generated!', description: 'Your sacred itinerary is ready.' });
    }
    setIsLoading(false);
  };

  const downloadPDF = () => {
    if (!itinerary) return;
    const itn = itinerary.itinerary || itinerary;

    const dailyPlanHTML = (itn.daily_plan || [])
      .sort((a, b) => a.day - b.day)
      .map(day => `
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
              <span class="cost-val">${day.estimated_cost || 'N/A'}</span>
            </div>
          </div>

          <div class="day-body">
            <div class="activities-col">
              <h4 class="section-label">&#10022; ACTIVITIES &amp; RITUALS</h4>
              ${day.activities.map(act => `<div class="activity-item"><span class="dot"></span><span>${act}</span></div>`).join('')}
            </div>

            <div class="sidebar-col">
              ${day.accommodation ? `
              <div class="info-card orange-card">
                <h4 class="section-label" style="color:#ea580c;">&#127968; STAY</h4>
                <p class="info-name">${day.accommodation.name}</p>
                <p class="info-sub">${day.accommodation.rating ? `&#11088; ${day.accommodation.rating}` : ''} ${day.accommodation.price ? `&bull; ${day.accommodation.price}` : ''}</p>
              </div>` : ''}

              ${day.transportation_options && day.transportation_options.length ? `
              <div class="info-card grey-card">
                <h4 class="section-label">&#128663; TRANSIT</h4>
                ${day.transportation_options.map(t => `
                  <div class="transit-item">
                    <p class="info-name">${t.mode}</p>
                    <p class="info-sub">${t.details}</p>
                    <p class="transit-price">${t.price}</p>
                  </div>
                `).join('')}
              </div>` : ''}
            </div>
          </div>
        </div>
      `).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${itn.title || 'Sacred Itinerary'} - DivyaYatra</title>
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
    .day-label { font-size: 7px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; }
    .day-num { font-size: 20px; font-weight: 900; line-height: 1; }
    .day-info h3 { font-size: 15px; font-weight: 800; color: #0f172a; }
    .day-info p { font-size: 10px; color: #64748b; font-weight: 600; margin-top: 2px; }
    .day-cost { margin-left: auto; text-align: right; }
    .cost-label { display: block; font-size: 8px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; }
    .cost-val { font-size: 14px; font-weight: 800; color: #1e293b; }

    .day-body {
      display: grid;
      grid-template-columns: 1fr 260px;
    }
    .activities-col { padding: 20px; border-right: 1px solid #f1f5f9; }
    .sidebar-col { padding: 20px; background: #fafafa; }

    .section-label {
      font-size: 9px;
      font-weight: 900;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 10px;
    }
    .activity-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 9px 12px;
      background: #f8fafc;
      border-radius: 8px;
      margin-bottom: 7px;
      font-size: 12px;
      color: #334155;
      font-weight: 500;
    }
    .dot {
      width: 7px; height: 7px;
      background: #ea580c;
      border-radius: 50%;
      margin-top: 4px;
      flex-shrink: 0;
    }

    .info-card { border-radius: 12px; padding: 14px; margin-bottom: 10px; }
    .orange-card { background: #fff7ed; border: 1px solid #fed7aa; }
    .grey-card { background: #f8fafc; border: 1px solid #e2e8f0; }
    .info-name { font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 3px; }
    .info-sub { font-size: 11px; color: #64748b; font-weight: 500; }
    .transit-item { margin-bottom: 10px; }
    .transit-price { font-size: 10px; font-weight: 800; color: #ea580c; text-transform: uppercase; margin-top: 2px; }

    .pdf-footer {
      margin: 32px 48px 0;
      padding: 18px 0;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand { font-size: 10px; font-weight: 900; color: #ea580c; letter-spacing: 0.15em; text-transform: uppercase; }
    .tagline { font-size: 10px; color: #94a3b8; }

    @media print {
      @page { size: A4; margin: 10mm; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .day-card { page-break-inside: avoid; break-inside: avoid; }
    }
  </style>
</head>
<body>

  <div class="pdf-header">
    <div class="header-brand">&#10022; DivyaYatra &mdash; Personalized Sacred Journey</div>
    <h1 class="header-title">${itn.title || 'Sacred Pilgrimage Itinerary'}</h1>
    <div class="header-meta">
      <div class="meta-item">
        <div class="meta-label">Destination</div>
        <div class="meta-value">&#128205; ${itn.destination || '&mdash;'}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Departure</div>
        <div class="meta-value">&#128197; ${itn.departureDate || '&mdash;'}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Return</div>
        <div class="meta-value">&#128197; ${itn.arrivalDate || '&mdash;'}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Travelers</div>
        <div class="meta-value">&#128101; ${itn.numberOfPeople || 1} &bull; ${itn.budget || ''} &bull; ${itn.style || ''}</div>
      </div>
    </div>
  </div>

  <div class="pdf-body">
    <div class="schedule-heading">Daily Schedule</div>
    ${dailyPlanHTML}

    <div class="cost-banner" style="margin-top: 32px;">
      <div>
        <div class="total-label">Total Estimated Investment</div>
        <div class="total-value">${itn.total_estimated_cost || 'N/A'}</div>
      </div>
      <div class="notes-text">&ldquo;${itn.notes || 'May your journey be filled with divine light and infinite peace.'}&rdquo;</div>
    </div>
  </div>

  <div class="pdf-footer">
    <span class="brand">DivyaYatra</span>
    <span class="tagline">Generated by RoamAI &bull; Sacred Pilgrimage Intelligence</span>
  </div>

  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`;

    const printWin = window.open('', '_blank', 'width=960,height=800');
    if (!printWin) {
      toast({ variant: 'destructive', title: 'Popup Blocked', description: 'Please allow popups for this site to download the PDF.' });
      return;
    }
    printWin.document.write(html);
    printWin.document.close();
  };

  return (
    <div className="relative min-h-screen bg-[#FAF6F0] text-slate-900 leading-relaxed font-sans overflow-x-hidden selection:bg-orange-100">
      <Header />

      {/* Atmospheric Temple Ghats Watercolor Backdrop - High Visibility */}
      <div className="absolute top-0 left-0 right-0 w-full h-[580px] pointer-events-none overflow-hidden z-0">
        <img
          src={templeBgImg}
          alt="Temple Ghats Background"
          className="w-full h-full object-cover object-top opacity-80 filter contrast-105 saturate-110"
        />
        {/* Smooth gradient blend into the ivory canvas */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-[#FAF6F0]" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#FAF6F0] via-[#FAF6F0]/90 to-transparent" />
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-full max-w-4xl h-44 bg-radial from-white/80 via-white/40 to-transparent blur-2xl" />
      </div>

      <div className="relative z-10 pt-20 md:pt-24 pb-10 flex-grow flex flex-col items-center">
        
        {/* HERO SECTION */}
        <section className="text-center pt-3 pb-5 px-6 max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/95 backdrop-blur-md border border-orange-200/90 shadow-sm mb-3 rounded-full">
            <Sparkles className="h-3.5 w-3.5 text-orange-600" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">✦ AI POWERED PILGRIMAGE</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight mb-2">
            Divine <span className="text-[#EA580C]">Journey Planner</span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-700 font-medium text-sm sm:text-base leading-relaxed max-w-lg mx-auto drop-shadow-sm">
            Let our sacred intelligence craft an auspicious itinerary for your pilgrimage.
          </p>
        </section>

        {/* MAIN CONTENT — TWO COMPACT CARDS SIDE-BY-SIDE */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-2 max-w-[1240px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-7 items-stretch">
            
            {/* CARD 1 — YATRA PLANNER */}
            <div className="group relative flex flex-col justify-between bg-white/95 backdrop-blur-sm rounded-3xl p-6 sm:p-7 border border-orange-100/90 shadow-xl shadow-orange-950/5 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-1 transition-all duration-300">
              <div className="flex-1 flex flex-col">
                {/* Icon Container */}
                <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 mb-4 shadow-sm">
                  <FileText className="w-6 h-6" />
                </div>

                {/* Title & Description */}
                <h2 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight mb-1.5 leading-snug">
                  Yatra Planner
                </h2>
                <p className="text-sm sm:text-[15px] text-slate-600 font-medium leading-relaxed mb-5 max-w-md">
                  Plan your pilgrimage with AI-powered itineraries, routes, budget & schedules.
                </p>

                {/* Content Split: Left Features, Right 3D Map Illustration */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center flex-1 mb-5">
                  {/* Left 3 Feature Rows */}
                  <div className="sm:col-span-7 space-y-3.5">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-orange-100/80">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-[15px] font-bold text-slate-900 leading-snug">Smart Route Planning</h4>
                        <p className="text-xs sm:text-[13px] text-slate-600 font-medium">Find shortest & safest paths</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-orange-100/80">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-[15px] font-bold text-slate-900 leading-snug">Budget Estimation</h4>
                        <p className="text-xs sm:text-[13px] text-slate-600 font-medium">Get cost breakdown instantly</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-orange-100/80">
                        <CalendarDays className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-[15px] font-bold text-slate-900 leading-snug">Daily Itinerary</h4>
                        <p className="text-xs sm:text-[13px] text-slate-600 font-medium">Morning to night schedule</p>
                      </div>
                    </div>
                  </div>

                  {/* Right 3D Isometric Illustration */}
                  <div className="sm:col-span-5 flex items-center justify-center">
                    <div className="w-40 h-40 sm:w-44 sm:h-44 rounded-2xl overflow-hidden relative shadow-md shadow-orange-950/10 border border-orange-100/70 bg-gradient-to-br from-amber-50 to-orange-50 transform group-hover:scale-105 transition-transform duration-500">
                      <img
                        src={yatraMapImg}
                        alt="3D Pilgrimage Route Map"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom CTA Button */}
              <button
                onClick={() => navigate('/travel-planner')}
                className="w-full py-3.5 px-6 rounded-full bg-[#EA580C] hover:bg-[#D94F04] text-white font-bold text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-2.5 shadow-lg shadow-orange-600/25 active:scale-[0.99] transition-all cursor-pointer"
              >
                <span>PLAN YOUR YATRA</span>
                <ArrowRight size={17} />
              </button>
            </div>

            {/* CARD 2 — DIVYA CHATBOT */}
            <div className="group relative flex flex-col justify-between bg-white/95 backdrop-blur-sm rounded-3xl p-6 sm:p-7 border border-purple-100/90 shadow-xl shadow-purple-950/5 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300">
              {/* Top-Right Speech Bubble */}
              <div className="absolute top-6 right-6 px-3 py-1 rounded-2xl bg-white border border-purple-100 shadow-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
              </div>

              <div className="flex-1 flex flex-col">
                {/* Icon Container */}
                <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#7C3AED] mb-4 shadow-sm">
                  <MessageSquare className="w-6 h-6" />
                </div>

                {/* Title & Description */}
                <h2 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight mb-1.5 leading-snug">
                  Divya Chatbot
                </h2>
                <p className="text-sm sm:text-[15px] text-slate-600 font-medium leading-relaxed mb-5 max-w-md">
                  Your AI companion for all pilgrimage queries and guidance.
                </p>

                {/* Content Split: Left Features, Right 3D Robot Illustration */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center flex-1 mb-5">
                  {/* Left 3 Feature Rows */}
                  <div className="sm:col-span-7 space-y-3.5">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center flex-shrink-0 mt-0.5 border border-purple-100/80">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-[15px] font-bold text-slate-900 leading-snug">Instant Answers</h4>
                        <p className="text-xs sm:text-[13px] text-slate-600 font-medium">Get answers to your queries</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center flex-shrink-0 mt-0.5 border border-purple-100/80">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-[15px] font-bold text-slate-900 leading-snug">Sacred Guidance</h4>
                        <p className="text-xs sm:text-[13px] text-slate-600 font-medium">Learn about rituals & traditions</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center flex-shrink-0 mt-0.5 border border-purple-100/80">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-[15px] font-bold text-slate-900 leading-snug">24/7 Assistance</h4>
                        <p className="text-xs sm:text-[13px] text-slate-600 font-medium">Always here to help you</p>
                      </div>
                    </div>
                  </div>

                  {/* Right 3D Robot Illustration */}
                  <div className="sm:col-span-5 flex items-center justify-center">
                    <div className="w-40 h-40 sm:w-44 sm:h-44 rounded-2xl overflow-hidden relative shadow-md shadow-purple-950/10 border border-purple-100/70 bg-gradient-to-br from-purple-50 to-indigo-50 transform group-hover:scale-105 transition-transform duration-500 flex items-center justify-center">
                      <img
                        src={divyaRobotImg}
                        alt="Divya AI Assistant Robot"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom CTA Button */}
              <button
                onClick={() => navigate('/ai-assistant')}
                className="w-full py-3.5 px-6 rounded-full bg-[#5B21B6] hover:bg-[#4C1D95] text-white font-bold text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-2.5 shadow-lg shadow-purple-900/25 active:scale-[0.99] transition-all"
              >
                <span>CHAT NOW</span>
                <ArrowRight size={17} />
              </button>
            </div>

          </div>
        </section>

        {/* BENEFITS STRIP */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-[1240px]">
          <div className="bg-white rounded-2xl border border-orange-100/90 shadow-md shadow-orange-950/5 p-5 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
              
              {/* Benefit 1 */}
              <div className="flex items-center gap-3.5 pt-3 sm:pt-0 sm:px-3 first:pt-0 first:pl-0">
                <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0 shadow-sm">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 mb-0.5">
                    Safe & Secure
                  </h4>
                  <p className="text-xs sm:text-[13px] text-slate-600 font-medium leading-snug">
                    AI verified routes & safety recommendations
                  </p>
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="flex items-center gap-3.5 pt-3 sm:pt-0 sm:px-3">
                <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0 shadow-sm">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 mb-0.5">
                    Time Saving
                  </h4>
                  <p className="text-xs sm:text-[13px] text-slate-600 font-medium leading-snug">
                    Optimized itineraries save your time
                  </p>
                </div>
              </div>

              {/* Benefit 3 */}
              <div className="flex items-center gap-3.5 pt-3 sm:pt-0 sm:px-3">
                <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0 shadow-sm">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 mb-0.5">
                    Budget Friendly
                  </h4>
                  <p className="text-xs sm:text-[13px] text-slate-600 font-medium leading-snug">
                    Smart budgeting for a worry-free journey
                  </p>
                </div>
              </div>

              {/* Benefit 4 */}
              <div className="flex items-center gap-3.5 pt-3 sm:pt-0 sm:px-3 last:pr-0">
                <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0 shadow-sm">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 mb-0.5">
                    Spiritual Experience
                  </h4>
                  <p className="text-xs sm:text-[13px] text-slate-600 font-medium leading-snug">
                    Focus on devotion, we handle the rest
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* GENERATED ITINERARY DISPLAY SECTION */}
        {itinerary && (
          <section className="container mx-auto px-4 sm:px-6 py-6 animate-fadeInUp max-w-5xl w-full">
            <div className="bg-white/95 backdrop-blur-3xl rounded-3xl border border-orange-100 shadow-2xl overflow-hidden flex flex-col">
              <div className="px-6 md:px-8 py-5 border-b border-orange-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-orange-50/50 to-amber-50/50">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase mb-0.5">Sacred Itinerary</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Auspicious Plan Ready</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={downloadPDF}
                  className="flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                >
                  <Download size={14} />
                  Download PDF
                </button>
              </div>
              <div className="flex-1 p-5 md:p-8 bg-[#FAF6F0]/40">
                <ItineraryDisplay itinerary={itinerary} isLoading={isLoading} error={error} />
              </div>
            </div>
          </section>
        )}

      </div>

      <Footer />
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeInUp { animation: fadeInUp 0.8s ease-out; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #fee2e2; border-radius: 10px; }
      `}} />
    </div>
  );
}
