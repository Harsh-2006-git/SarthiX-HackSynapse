import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MessageSquare,
    X,
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
    PlaneTakeoff,
    ChevronRight,
    Users,
    Zap
} from "lucide-react";
import axios from "axios";
import { API_V1 } from "../config/api";

const BACKEND_URL = `${API_V1}/ai`;

const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("general"); // 'general' or 'tourism'
    const [language, setLanguage] = useState("English");
    const [messages, setMessages] = useState({
        general: [{ role: "assistant", content: "Hari Om! I'm your Smart Pilgrim AI. How can I help you today?" }],
        tourism: [{ role: "assistant", content: "Hari Om! I'm RoamAI. I'll help you plan a divine trip. Where are you traveling from?" }]
    });
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);

    // Exact fields matching your requirement
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

    // Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
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
        if (!recognitionRef.current) return alert("Mic not supported");
        if (isListening) recognitionRef.current.stop();
        else { setIsListening(true); recognitionRef.current.start(); }
    };

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        const text = inputValue.trim();
        if (!text) return;

        const currentTab = activeTab;
        const newUserMsg = { role: "user", content: text };

        setMessages(prev => ({
            ...prev,
            [currentTab]: [...prev[currentTab], newUserMsg]
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
                const res = await axios.post(`${BACKEND_URL}/chat`, {
                    history: [...messages.tourism, newUserMsg],
                    language
                });

                setMessages(prev => ({
                    ...prev,
                    tourism: [...prev.tourism, { role: "assistant", content: res.data.response }]
                }));

                if (res.data.extractedData) {
                    setTourismForm(prev => ({ ...prev, ...res.data.extractedData }));
                }

                if (res.data.isDone && res.data.extractedData) {
                    generateFinalPlan(res.data.extractedData);
                }
            }
        } catch (error) {
            setMessages(prev => ({
                ...prev,
                [currentTab]: [...prev[currentTab], { role: "assistant", content: "Connection Error. Is Ollama running?" }]
            }));
        } finally {
            setLoading(false);
        }
    };

    const generateFinalPlan = async (data) => {
        setLoading(true);
        try {
            const res = await axios.post(`${BACKEND_URL}/tourism`, { ...data, language });
            setMessages(prev => ({
                ...prev,
                tourism: [...prev.tourism, { role: "assistant", content: res.data.response }]
            }));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] font-jakarta">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.9, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: 30, scale: 0.9, filter: "blur(10px)" }}
                        className="absolute bottom-24 right-0 w-[420px] h-[680px] bg-white rounded-[3rem] shadow-[0_20px_80px_-15px_rgba(0,0,0,0.3)] border border-gray-100 overflow-hidden flex flex-col ring-1 ring-black/5"
                    >
                        {/* Premium Header */}
                        <div className="bg-slate-900 p-8 text-white relative overflow-hidden shrink-0">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>

                            <div className="flex justify-between items-center relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-600/40 border border-orange-400/20">
                                        <Bot size={26} className="text-white" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xl font-black uppercase tracking-tighter leading-none">RoamAI</h3>
                                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                        </div>
                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Neural Engine v2</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => setLanguage(language === "English" ? "Hindi" : "English")} className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-black uppercase tracking-widest transition-all">
                                        {language === 'English' ? 'EN' : 'HI'}
                                    </button>
                                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Ultra Tabs */}
                            <div className="flex gap-2 mt-8 relative z-10 p-1.5 bg-white/5 rounded-2xl backdrop-blur-md">
                                <button
                                    onClick={() => setActiveTab("general")}
                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'general' ? 'bg-orange-600 text-white shadow-xl shadow-orange-600/20' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                                >
                                    <MessageSquare size={14} /> Global Inquiry
                                </button>
                                <button
                                    onClick={() => setActiveTab("tourism")}
                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'tourism' ? 'bg-orange-600 text-white shadow-xl shadow-orange-600/20' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                                >
                                    <Compass size={14} /> Divine Planner
                                </button>
                            </div>
                        </div>

                        {/* Intelligence Feed */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 hide-scrollbar">
                            {activeTab === "tourism" && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-orange-50/50 rounded-3xl border border-orange-100/50 mb-2">
                                    <div className="flex items-center gap-2 text-[9px] font-black text-orange-600 uppercase tracking-[0.2em] mb-3 px-1">
                                        <Zap size={12} fill="currentColor" /> Intelligence Pulse
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                                        {[
                                            { l: "Origin", v: tourismForm.origin },
                                            { l: "Dates", v: tourismForm.departureDate ? "Set" : null },
                                            { l: "People", v: tourismForm.numberOfPeople },
                                            { l: "Budget", v: tourismForm.budget }
                                        ].map((it, i) => (
                                            <div key={i} className="flex flex-col">
                                                <span className="text-[8px] font-black text-slate-300 uppercase">{it.l}</span>
                                                <span className={`text-[10px] font-bold truncate ${it.v ? 'text-slate-800' : 'text-slate-300 italic'}`}>{it.v || 'Searching...'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {messages[activeTab].map((msg, idx) => (
                                <motion.div initial={{ opacity: 0, x: msg.role === 'assistant' ? -10 : 10 }} animate={{ opacity: 1, x: 0 }} key={idx} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`max-w-[88%] p-5 rounded-[2rem] text-xs leading-relaxed ${msg.role === 'assistant' ? 'bg-white text-slate-800 rounded-tl-none shadow-[0_4px_15px_-5px_rgba(0,0,0,0.05)] border border-gray-100' : 'bg-slate-900 text-white rounded-tr-none shadow-xl'}`}>
                                        <div className="prose prose-sm font-medium whitespace-pre-wrap">
                                            {msg.content}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-white px-5 py-4 rounded-[1.5rem] rounded-tl-none border border-gray-100 shadow-sm">
                                        <div className="flex gap-2">
                                            <div className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-bounce"></div>
                                            <div className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                            <div className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Interaction Bar */}
                        <div className="p-6 bg-white border-t border-gray-100 shrink-0">
                            <form onSubmit={handleSend} className="relative flex items-center gap-3">
                                <div className="relative flex-1">
                                    <input
                                        value={inputValue}
                                        onChange={e => setInputValue(e.target.value)}
                                        placeholder={isListening ? "Listening..." : activeTab === 'general' ? "Ask the AI Assistant..." : "Talk to the Planner..."}
                                        className={`w-full p-5 pr-14 bg-gray-50 rounded-[1.8rem] text-[11px] font-bold outline-none border-2 transition-all ${isListening ? 'border-orange-500 ring-4 ring-orange-500/10' : 'border-transparent focus:bg-white focus:border-slate-900/5'}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={toggleMic}
                                        className={`absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isListening ? 'bg-orange-600 text-white animate-pulse' : 'bg-gray-100 text-slate-400 hover:text-orange-600'}`}
                                    >
                                        {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading || !inputValue.trim()}
                                    className="w-14 h-14 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center hover:bg-orange-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95 disabled:opacity-50"
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                            <div className="mt-4 flex justify-between items-center px-2">
                                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                                    <Sparkles size={10} className="text-orange-500" /> Secure Local AI
                                </span>
                                <button onClick={() => setMessages({ general: [], tourism: [] })} className="text-[8px] font-black text-slate-300 uppercase tracking-widest hover:text-orange-600 transition-colors">Clear Stream</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Premium Toggle Orbit */}
            <div className="relative group">
                <div className="absolute -inset-4 bg-orange-600/20 rounded-full blur-2xl group-hover:bg-orange-600/30 transition-all animate-pulse"></div>
                <motion.button
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-20 h-20 rounded-[2.2rem] flex items-center justify-center shadow-2xl transition-all relative border-4 ${isOpen ? 'bg-orange-600 text-white border-white' : 'bg-slate-900 text-white border-white/10'}`}
                >
                    <AnimatePresence mode="wait">
                        {isOpen ? (
                            <motion.div key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}><X size={32} /></motion.div>
                        ) : (
                            <motion.div key="bot" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.5 }} className="flex flex-col items-center">
                                <Bot size={34} />
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                                    <Sparkles size={12} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>

            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
            `}</style>
        </div>
    );
};

export default AIAssistant;
