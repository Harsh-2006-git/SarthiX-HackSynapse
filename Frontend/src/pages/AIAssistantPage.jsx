import React, { useState, useRef, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
    MessageSquare,
    Send,
    Compass,
    Bot,
    Sparkles,
    Loader2,
    MapPin,
    Calendar,
    IndianRupee,
    Mic,
    MicOff,
    Zap,
    Users,
    ChevronRight,
    PlaneTakeoff,
    PlaneLanding
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { API_V1 } from "../config/api";

const BACKEND_URL = `${API_V1}/ai`;

const AIAssistantPage = () => {
    const [activeTab, setActiveTab] = useState("general"); // general, tourism
    const [plannerMode, setPlannerMode] = useState("chat"); // chat, form
    const [language, setLanguage] = useState("English");
    const [messages, setMessages] = useState({
        general: [{ role: "assistant", content: "Hari Om! I am your Smart Pilgrim AI. How can I assist you today?" }],
        tourism: [{ role: "assistant", content: "Hari Om! I'm RoamAI. I can help you plan your entire trip. Where are you traveling from?" }]
    });
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);

    // EXACT FIELDS FROM NEXT.JS FOLDER
    const [tourismForm, setTourismForm] = useState({
        origin: "",
        destination: "Ujjain",
        departureDate: "",
        arrivalDate: "",
        numberOfPeople: "2",
        budget: "5000",
        style: "Religious"
    });

    const scrollRef = useRef(null);
    const recognitionRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    // Speech Recognition Setup
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = language === "Hindi" ? "hi-IN" : "en-US";

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInputValue(transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = () => setIsListening(false);
            recognitionRef.current.onend = () => setIsListening(false);
        }
    }, [language]);

    const toggleMic = () => {
        if (!recognitionRef.current) return alert("Speech recognition not supported");
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setIsListening(true);
            recognitionRef.current.start();
        }
    };

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        const text = inputValue.trim();
        if (!text) return;

        const currentMsgGroup = activeTab;
        const newUserMsg = { role: "user", content: text };

        setMessages(prev => ({
            ...prev,
            [currentMsgGroup]: [...prev[currentMsgGroup], newUserMsg]
        }));
        setInputValue("");
        setLoading(true);

        try {
            if (activeTab === "general") {
                const res = await axios.post(`${BACKEND_URL}/general`, { prompt: text });
                setMessages(prev => ({
                    ...prev,
                    general: [...prev.general, { role: "assistant", content: res.data.response }]
                }));
            } else {
                // Tourism Bot Conversational Mode
                const res = await axios.post(`${BACKEND_URL}/chat`, {
                    history: [...messages.tourism, newUserMsg],
                    language: language
                });

                setMessages(prev => ({
                    ...prev,
                    tourism: [...prev.tourism, { role: "assistant", content: res.data.response }]
                }));

                if (res.data.extractedData) {
                    setTourismForm(prev => ({
                        ...prev,
                        ...res.data.extractedData
                    }));
                }

                if (res.data.isDone && res.data.extractedData) {
                    handleGenerateTrip(res.data.extractedData);
                }
            }
        } catch (error) {
            setMessages(prev => ({
                ...prev,
                [currentMsgGroup]: [...prev[currentMsgGroup], { role: "assistant", content: "AI is currently offline. Please ensure Ollama is running." }]
            }));
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateTrip = async (formData = null) => {
        setLoading(true);
        const data = formData || tourismForm;

        try {
            const res = await axios.post(`${BACKEND_URL}/tourism`, { ...data, language });
            setMessages(prev => ({
                ...prev,
                tourism: [...prev.tourism, { role: "assistant", content: res.data.response }]
            }));
        } catch (error) {
            alert("Error in generating your sacred itinerary.");
        } finally {
            setLoading(false);
            setPlannerMode("chat");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-jakarta selection:bg-orange-100">
            <Header />

            <div className="pt-32 pb-8 bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                            <Sparkles size={14} className="animate-pulse" /> Advanced Travel Intelligence
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter mb-2 leading-none">
                            Roam<span className="text-orange-600">AI</span> Planner
                        </h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Next-Gen Pilgrim Assistance</p>
                    </div>

                    <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100 shadow-inner">
                        <button onClick={() => setLanguage("English")} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${language === 'English' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>English</button>
                        <button onClick={() => setLanguage("Hindi")} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${language === 'Hindi' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>Hindi</button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px]">
                    {/* Navigation Sidebar */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="bg-white p-5 rounded-[2rem] shadow-xl border border-gray-100 h-full flex flex-col">
                            <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 px-2">Navigation</h3>

                            <div className="space-y-2">
                                <button
                                    onClick={() => setActiveTab("general")}
                                    className={`w-full p-4 rounded-2xl text-left transition-all flex items-center gap-4 border ${activeTab === 'general' ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-600 border-gray-100 hover:border-orange-200'}`}
                                >
                                    <MessageSquare size={16} className={activeTab === 'general' ? 'text-orange-500' : 'text-slate-300'} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Query Assistant</span>
                                </button>

                                <button
                                    onClick={() => setActiveTab("tourism")}
                                    className={`w-full p-4 rounded-2xl text-left transition-all flex items-center gap-4 border ${activeTab === 'tourism' ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-600 border-gray-100 hover:border-orange-200'}`}
                                >
                                    <Compass size={16} className={activeTab === 'tourism' ? 'text-orange-500' : 'text-slate-300'} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Divine Planner</span>
                                </button>
                            </div>

                            {activeTab === 'tourism' && (
                                <div className="mt-4 p-1 bg-gray-100 rounded-xl flex gap-1">
                                    <button onClick={() => setPlannerMode("chat")} className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${plannerMode === 'chat' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Smart Chat</button>
                                    <button onClick={() => setPlannerMode("form")} className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${plannerMode === 'form' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Quick Form</button>
                                </div>
                            )}

                            {activeTab === 'tourism' && (
                                <div className="mt-8 pt-8 border-t border-orange-100 flex-1 overflow-y-auto hide-scrollbar">
                                    <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-4 px-2 flex items-center gap-2">
                                        <Bot size={14} /> Collected Intel
                                    </p>
                                    <div className="space-y-3 px-2">
                                        {[
                                            { label: "Origin", val: tourismForm.origin },
                                            { label: "Destination", val: tourismForm.destination },
                                            { label: "Start", val: tourismForm.departureDate },
                                            { label: "End", val: tourismForm.arrivalDate },
                                            { label: "People", val: tourismForm.numberOfPeople },
                                            { label: "Budget", val: tourismForm.budget },
                                            { label: "Style", val: tourismForm.style }
                                        ].map((item, i) => (
                                            <div key={i} className="flex flex-col gap-0.5 group">
                                                <span className="text-[8px] font-black text-slate-300 uppercase">{item.label}</span>
                                                <span className={`text-[10px] font-bold ${item.val ? 'text-slate-800' : 'text-slate-200 italic'}`}>
                                                    {item.val || "Pending..."}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 p-5 bg-orange-50/50 rounded-2xl border border-orange-100 flex-shrink-0">
                                <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-1">Privacy Shield</p>
                                <p className="text-[10px] text-orange-800 leading-tight">Your data never leaves this computer. Powered by local LLM.</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Interface Area */}
                    <div className="lg:col-span-9 flex flex-col bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden relative">
                        {activeTab === 'tourism' && plannerMode === 'form' ? (
                            <div className="flex-1 p-8 overflow-y-auto animate-in fade-in zoom-in-95 duration-300 bg-gray-50/20">
                                <div className="max-w-3xl mx-auto">
                                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-8 flex items-center gap-3">
                                        <Zap className="text-orange-600" /> Itinerary <span className="text-slate-300">Configuration</span>
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Starting Place (Origin)</label>
                                            <div className="relative">
                                                <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-600" />
                                                <input placeholder="e.g. Mumbai" value={tourismForm.origin} onChange={e => setTourismForm({ ...tourismForm, origin: e.target.value })} className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 ring-orange-100 outline-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Destination</label>
                                            <div className="relative">
                                                <Compass size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-600" />
                                                <input value={tourismForm.destination} onChange={e => setTourismForm({ ...tourismForm, destination: e.target.value })} className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 ring-orange-100 outline-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Departure Date</label>
                                            <div className="relative">
                                                <PlaneTakeoff size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-600" />
                                                <input type="date" value={tourismForm.departureDate} onChange={e => setTourismForm({ ...tourismForm, departureDate: e.target.value })} className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 ring-orange-100 outline-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Arrival Date (Return)</label>
                                            <div className="relative">
                                                <PlaneLanding size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-600" />
                                                <input type="date" value={tourismForm.arrivalDate} onChange={e => setTourismForm({ ...tourismForm, arrivalDate: e.target.value })} className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 ring-orange-100 outline-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">No. of People</label>
                                            <div className="relative">
                                                <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-600" />
                                                <input type="number" value={tourismForm.numberOfPeople} onChange={e => setTourismForm({ ...tourismForm, numberOfPeople: e.target.value })} className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 ring-orange-100 outline-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Budget (₹)</label>
                                            <div className="relative">
                                                <IndianRupee size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-600" />
                                                <input value={tourismForm.budget} onChange={e => setTourismForm({ ...tourismForm, budget: e.target.value })} className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 ring-orange-100 outline-none" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 space-y-2">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Trip Style</label>
                                        <select value={tourismForm.style} onChange={e => setTourismForm({ ...tourismForm, style: e.target.value })} className="w-full p-4 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 ring-orange-100 outline-none appearance-none">
                                            <option>Religious</option>
                                            <option>Leisure</option>
                                            <option>Adventure</option>
                                            <option>Backpacking</option>
                                            <option>Luxury</option>
                                        </select>
                                    </div>

                                    <button
                                        onClick={() => handleGenerateTrip()}
                                        disabled={loading}
                                        className="mt-12 w-full py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-orange-600 transition-all shadow-xl flex items-center justify-center gap-4 group"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : <>Generate Sacred Itinerary <ChevronRight size={16} className="group-hover:translate-x-2 transition-transform" /></>}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/20">
                                    <AnimatePresence>
                                        {messages[activeTab].map((msg, idx) => (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                key={idx}
                                                className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                                            >
                                                <div className={`max-w-[85%] p-5 rounded-[1.5rem] text-xs leading-relaxed ${msg.role === 'assistant' ? 'bg-white text-slate-800 rounded-tl-none shadow-sm border border-gray-100' : 'bg-orange-600 text-white rounded-tr-none shadow-xl'}`}>
                                                    <div className="prose prose-sm max-w-none whitespace-pre-wrap font-medium">
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    {loading && (
                                        <div className="flex justify-start">
                                            <div className="bg-white px-5 py-4 rounded-[1.5rem] rounded-tl-none border border-gray-100 shadow-sm">
                                                <div className="flex gap-2">
                                                    <div className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-bounce"></div>
                                                    <div className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                    <div className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 bg-white border-t border-gray-100">
                                    <form onSubmit={handleSend} className="relative flex items-center gap-4">
                                        <div className="relative flex-1">
                                            <input
                                                value={inputValue}
                                                onChange={e => setInputValue(e.target.value)}
                                                placeholder={isListening ? "Listening with intent..." : "Speak or type your pilgrim needs..."}
                                                className={`w-full p-5 pr-16 bg-gray-50 rounded-2xl text-[11px] font-bold outline-none focus:ring-4 ring-orange-500/10 transition-all border border-gray-200 shadow-inner ${isListening ? 'animate-pulse ring-red-500/10 border-red-200' : ''}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={toggleMic}
                                                className={`absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isListening ? 'bg-red-500 text-white animate-bounce' : 'bg-gray-200 text-slate-400 hover:text-orange-600'}`}
                                            >
                                                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                                            </button>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loading || !inputValue.trim()}
                                            className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-orange-600 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                                        >
                                            <Send size={20} />
                                        </button>
                                    </form>
                                    <div className="mt-3 flex justify-center">
                                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">Integrated Local Voice Intelligence</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
            <style>{`.font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }`}</style>
        </div>
    );
};

export default AIAssistantPage;
