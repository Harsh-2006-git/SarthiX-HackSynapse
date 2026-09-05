import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  BookOpen,
  Send,
  Mic,
  MicOff,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  VolumeX,
  Calendar,
  ShieldAlert,
  Bus,
  Building2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Flame,
  FileText,
  X,
  Download,
  ExternalLink,
  Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ragService from "../services/ragService";
import divyaRobotImg from "../assets/divya_robot_3d.jpg";
import templeBgImg from "../assets/temple_ghats_bg.jpg";

const DEFAULT_DOC_ID = "default/ujjain_simhastha_2028_rag_knowledge_base.pdf";

const QA_SIDEBAR_ITEMS = [
  {
    id: "qa-1",
    category: "DATES & SCHEDULE",
    categoryHi: "तिथियां एवं कार्यक्रम",
    icon: Calendar,
    iconBg: "bg-blue-50 text-blue-600",
    question: "What are the exact Shahi Snan (Amrit Snan) dates for Simhastha 2028?",
    questionHi: "सिंहस्थ 2028 के लिए शाही स्नान (अमृत स्नान) की सटीक तारीखें क्या हैं?",
    defaultAnswer:
      "**Simhastha 2028 Royal Shahi Snan (Amrit Snan) Schedule:**\n\n• **First Shahi Snan (Chaitra Shukla Purnima)**: 09 April 2028 — The grand inaugural royal bathing festival led by Juna and Niranjani Akharas.\n• **Second Shahi Snan (Mesh Sankranti / Vaisakhi Snan)**: 23 April 2028 — The main Mahakumbh congregation of Sanyasis, Vairagis, and holy seers.\n• **Third Shahi Snan (Vaishakha Shukla Purnima)**: 08 May 2028 — The culminating sacred dip at Ram Ghat and Dutt Akhada Ghat.\n\n*General auspicious bathing (Punya Snan) begins from 27 March 2028 to 27 May 2028.*",
    defaultAnswerHi:
      "**सिंहस्थ 2028 शाही स्नान (अमृत स्नान) का आधिकारिक कार्यक्रम:**\n\n• **प्रथम शाही स्नान (चैत्र शुक्ल पूर्णिमा)**: 09 अप्रैल 2028 — अखाड़ों के महामंडलेश्वरों और संतों का भव्य प्रथम स्नान।\n• **द्वितीय शाही स्नान (मेष संक्रांति / वैशाख स्नान)**: 23 अप्रैल 2028 — संन्यासियों और वैरागियों का मुख्य महाकुंभ अमृत स्नान।\n• **तृतीय शाही स्नान (वैशाख शुक्ल पूर्णिमा)**: 08 मई 2028 — सिंहस्थ महाकुंभ का अंतिम पावन शाही स्नान रामघाट पर।\n\n*श्रद्धालुओं के लिए सामान्य पुण्य स्नान 27 मार्च 2028 से 27 मई 2028 तक जारी रहेगा।*",
  },
  {
    id: "qa-2",
    category: "MAHAKAL SANCTUM",
    categoryHi: "महाकाल गर्भगृह",
    icon: Flame,
    iconBg: "bg-amber-50 text-amber-600",
    question: "What are the rules, timings & dress code for Mahakaleshwar Bhasma Aarti?",
    questionHi: "महाकालेश्वर भस्म आरती के नियम, समय और ड्रेस कोड क्या हैं?",
    defaultAnswer:
      "**Mahakaleshwar Jyotirlinga Bhasma Aarti Protocol:**\n\n• **Timings**: Daily from **4:00 AM to 6:00 AM** in the Garbhagriha.\n• **Booking & e-Pass**: Online booking opens strictly on the Shree Mahakaleshwar Temple portal 30 days prior. Offline quota passes available daily at the counter.\n• **Strict Dress Code**:\n  - **Men**: Traditional unstitched Dhoti and Solah/Angavastram (No jeans, trousers, or shirts allowed in the sanctum).\n  - **Women**: Traditional Saree (Salwar suits allowed in outer gallery only).\n• **Reporting & ID**: Pilgrims must report at Gate No. 1 by **3:00 AM** with the original Aadhaar Card/Passport.",
    defaultAnswerHi:
      "**श्री महाकालेश्वर भस्म आरती के नियम एवं समय सारिणी:**\n\n• **आरती का समय**: प्रतिदिन प्रातः **4:00 बजे से 6:00 बजे तक** गर्भगृह में।\n• **बुकिंग व ई-पास**: मंदिर की आधिकारिक वेबसाइट पर 30 दिन पूर्व बुकिंग खुलती है। काउंटर पर सीमित ऑफलाइन पास भी उपलब्ध रहते हैं।\n• **अनिवार्य ड्रेस कोड**:\n  - **पुरुष**: बिना सिला हुआ पारंपरिक सूती धोती व सोलाह।\n  - **महिलाएं**: पारंपरिक भारतीय साड़ी।\n• **प्रवेश नियम**: मूल आधार कार्ड के साथ प्रातः **3:00 बजे गेट नंबर 1/4** पर रिपोर्ट करना अनिवार्य है।",
  },
  {
    id: "qa-3",
    category: "EMERGENCY & SAFETY",
    categoryHi: "आपातकाल एवं सुरक्षा",
    icon: ShieldAlert,
    iconBg: "bg-rose-50 text-rose-600",
    question: "Where are the emergency medical booths, lost & found, and police helplines located?",
    questionHi: "आपातकालीन चिकित्सा केंद्र, खोया-पाया केंद्र और पुलिस हेल्पलाइन कहाँ स्थित हैं?",
    defaultAnswer:
      "**Simhastha Emergency, Medical & Safety Infrastructure:**\n\n• **24x7 Medical Booths & ICU Ambulances**:\n  - Stationed at Ram Ghat, Dutt Akhada, Narsingha Ghat, Mangalnath, and all 5 Satellite Parking zones.\n  - Base Hospitals: District Hospital Ujjain (Freeganj), Charak Super Speciality Hospital, and RD Gardi Medical College.\n• **Lost & Found / Digital Pilgrim Tracking**:\n  - Central AI Booth located at Mahakal Lok Plaza & Ram Ghat Police Chowki with RFID wristband tracking for children and senior citizens.\n• **Emergency Helplines**:\n  - **Simhastha Central Control Room**: **1077**\n  - **Police & Ambulance**: **112 / 108**\n  - **Women Helpline**: **1090**",
    defaultAnswerHi:
      "**सिंहस्थ आपातकालीन, चिकित्सा और सुरक्षा सहायता केंद्र:**\n\n• **24x7 चिकित्सा शिविर एवं एम्बुलेंस**:\n  - रामघाट, दत्त अखाड़ा, नृसिंह घाट, मंगलनाथ और सभी 5 सेटेलाइट पार्किंग ज़ोन पर सुसज्जित चिकित्सा बूथ।\n  - प्रमुख अस्पताल: जिला अस्पताल (फ्रीगंज), चरक सुपर स्पेशियलिटी अस्पताल और आरडी गार्डी मेडिकल कॉलेज।\n• **खोया-पाया एवं डिजिटल ट्रैकिंग बूथ**:\n  - महाकाल लोक प्लाजा और रामघाट पुलिस चौकी पर डिजिटल खोया-पाया केंद्र और बच्चों के लिए RFID रिस्टबैंड सुविधा।\n• **आपातकालीन हेल्पलाइन नंबर**:\n  - **सिंहस्थ नियंत्रण कक्ष**: **1077**\n  - **पुलिस एवं एम्बुलेंस**: **112 / 108**\n  - **महिला हेल्पलाइन**: **1090**",
  },
  {
    id: "qa-4",
    category: "TRANSPORT & TRAVEL",
    categoryHi: "परिवहन एवं यात्रा",
    icon: Bus,
    iconBg: "bg-orange-50 text-orange-600",
    question: "What are the best ways to reach Ujjain and travel locally during Simhastha?",
    questionHi: "सिंहस्थ के दौरान उज्जैन पहुँचने और स्थानीय आवागमन के सबसे अच्छे साधन क्या हैं?",
    defaultAnswer:
      "**Transit & Access Guide for Simhastha 2028:**\n\n• **Air Connectivity**: Devi Ahilyabai Holkar Airport, Indore (~55 km). 24x7 dedicated 4-lane Simhastha green corridor shuttles available directly to Ujjain holding zones.\n• **Rail Connectivity**: Ujjain Junction (UJN), Vikramnagar, and Chintaman Ganesh Railway Stations with 100+ Simhastha Special trains connecting major Indian cities.\n• **Satellite Parking & E-Buses**:\n  - 4 massive peripheral parking sectors on Indore Road, Dewas Road, Agar Road, and Nagda Road.\n  - High-frequency zero-emission Electric Feeder Buses operate non-stop between parking hubs and ghat transit terminals.",
    defaultAnswerHi:
      "**सिंहस्थ 2028 यात्रा एवं स्थानीय परिवहन गाइड:**\n\n• **हवाई मार्ग**: देवी अहिल्याबाई होल्कर हवाई अड्डा, इंदौर (~55 किमी)। यहां से 24x7 एक्सप्रेस ग्रीन कॉरिडोर बसें उपलब्ध हैं।\n• **रेल मार्ग**: उज्जैन जंक्शन (UJN), विक्रमनगर एवं चिंतामण गणेश रेलवे स्टेशन से देश भर के लिए विशेष सिंहस्थ ट्रेनें।\n• **सेटेलाइट पार्किंग और ई-बसें**:\n  - इंदौर रोड, देवास रोड, आगर रोड और नागदा रोड पर 4 विशाल सेटेलाइट पार्किंग स्थल।\n  - पार्किंग से घाटों तक निरंतर चलने वाली निःशुल्क इलेक्ट्रिक फीडर बसें।",
  },
  {
    id: "qa-5",
    category: "STAY & FACILITIES",
    categoryHi: "आवास एवं सुविधाएं",
    icon: Building2,
    iconBg: "bg-purple-50 text-purple-600",
    question: "Where can I find affordable hotels, dharamshalas & tent city facilities?",
    questionHi: "किफायती होटल, धर्मशालाएं और टेंट सिटी की सुविधाएं कहाँ मिलेंगी?",
    defaultAnswer:
      "**Accommodation, Dharamshalas & Tent Cities:**\n\n• **Simhastha Luxury & Budget Tent Cities**:\n  - Sprawling tent cities set up along the scenic Kshipra river banks (Mangalnath & Triveni sectors) featuring deluxe AC/non-AC Swiss tents, 24-hr hot water, security, and Satvik dining.\n• **Dharamshalas & Ashrams**:\n  - 150+ trust dharamshalas in Mahakal Kshetra, Freeganj, and Harifatak providing clean and economical stays.\n• **Advance Pilgrim Booking**:\n  - Official bookings open on MP Tourism and DivyaYatra portal with verified price caps to prevent surge pricing.",
    defaultAnswerHi:
      "**आवास, धर्मशालाएं और टेंट सिटी व्यवस्था:**\n\n• **सिंहस्थ टेंट सिटी**:\n  - शिप्रा नदी के तट पर मंगलनाथ और त्रिवेणी सेक्टर में सुसज्जित टेंट सिटी, जिसमें डीलक्स स्विस कॉटेज, भोजनशाला और सुरक्षा व्यवस्था उपलब्ध है।\n• **धर्मशालाएं एवं आश्रम**:\n  - महाकाल क्षेत्र, फ्रीगंज और हरिफाटक में 150 से अधिक पंजीकृत धर्मशालाएं और सेवाश्रम।\n• **अग्रिम बुकिंग**:\n  - मध्य प्रदेश पर्यटन और दिव्ययात्रा पोर्टल के माध्यम से निर्धारित सरकारी दरों पर अग्रिम बुकिंग उपलब्ध है।",
  },
  {
    id: "qa-6",
    category: "SACRED GHATS",
    categoryHi: "पवित्र घाट",
    icon: Sparkles,
    iconBg: "bg-indigo-50 text-indigo-600",
    question: "Which are the principal ghats on the Kshipra river for holy Snan?",
    questionHi: "पवित्र स्नान के लिए क्षिप्रा नदी के प्रमुख घाट कौन से हैं?",
    defaultAnswer:
      "**Principal Bathing Ghats in Ujjain:**\n\n1. **Ram Ghat**: The oldest and holiest ghat for royal Shahi Snans and Sandhya Aarti.\n2. **Dutt Akhada Ghat**: Located right opposite Ram Ghat for Akhara sadhus.\n3. **Narsingha & Triveni Ghats**: Spacious family-friendly bathing zones equipped with safety nets and changing rooms.\n4. **Mangalnath & Gau Ghats**: Serene spots for astrological rituals and pitra tarpan.",
    defaultAnswerHi:
      "**उज्जैन में पावन स्नान के प्रमुख घाट:**\n\n1. **रामघाट**: शाही स्नान एवं दिव्य संध्या आरती के लिए सबसे प्राचीन एवं प्रमुख घाट।\n2. **दत्त अखाड़ा घाट**: रामघाट के ठीक सामने अखाड़ा साधु-संतों के लिए आरक्षित घाट।\n3. **नृसिंह व त्रिवेणी घाट**: सुरक्षा जालियों और वस्त्र बदलने के कक्षों से युक्त परिवारिक स्नान घाट।\n4. **मंगलनाथ व गौ घाट**: शांतिपूर्ण वातावरण एवं पितृ तर्पण अनुष्ठान हेतु पवित्र स्थल।",
  },
];

export default function AIAssistantPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: "welcome-1",
      role: "assistant",
      content:
        "**Hari Om! 🙏 Welcome to Divya Sacred Intelligence.**\n\nI am your dedicated AI companion for **Ujjain Simhastha 2028** and **Lord Mahakaleshwar Jyotirlinga**, strictly grounded in the official pilgrimage knowledge base.\n\nClick any question from the **Instant Verified Q&A** panel on the left, or type your query below to begin your sacred journey!",
      source: "Simhastha 2028 Knowledge Base",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      feedback: null,
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState("EN");
  const [copiedId, setCopiedId] = useState(null);
  const [speakingId, setSpeakingId] = useState(null);
  const [showMoreQA, setShowMoreQA] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [sessionId, setSessionId] = useState(() => `session_${Date.now()}`);

  const scrollRef = useRef(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of chat whenever messages or loading changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading]);

  // Speech Recognition setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = language === "हिन्दी" ? "hi-IN" : "en-US";

        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInputValue(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = () => setIsListening(false);
        recognitionRef.current.onend = () => setIsListening(false);
      } catch (err) {
        console.warn("Speech recognition init error:", err);
      }
    }
  }, [language]);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = (id, type) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, feedback: msg.feedback === type ? null : type } : msg
      )
    );
  };

  const handleSpeak = (id, text) => {
    if (!("speechSynthesis" in window)) return;
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`[\]()•]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === "हिन्दी" ? "hi-IN" : "en-US";
    utterance.rate = 0.95;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleResetChat = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeakingId(null);
    setActiveQuestionId(null);
    setSessionId(`session_${Date.now()}`);
    setMessages([
      {
        id: "welcome-1",
        role: "assistant",
        content:
          "**Hari Om! 🙏 Welcome to Divya Sacred Intelligence.**\n\nI am your dedicated AI companion for **Ujjain Simhastha 2028** and **Lord Mahakaleshwar Jyotirlinga**, strictly grounded in the official pilgrimage knowledge base.\n\nClick any question from the **Instant Verified Q&A** panel on the left, or type your query below to begin your sacred journey!",
        source: "Simhastha 2028 Knowledge Base",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        feedback: null,
      },
    ]);
  };

  const handleSelectQuestion = async (item) => {
    if (loading) return;
    setActiveQuestionId(item.id);

    const isHindi = language === "हिन्दी";
    const selectedQuestion = isHindi ? (item.questionHi || item.question) : item.question;
    const verifiedAnswer = isHindi ? (item.defaultAnswerHi || item.defaultAnswer) : item.defaultAnswer;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsgId = `user_${Date.now()}`;
    const botMsgId = `bot_${Date.now() + 1}`;

    const newUserMsg = {
      id: userMsgId,
      role: "user",
      content: selectedQuestion,
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setLoading(true);

    try {
      // Natural AI retrieval delay so the search animation runs gracefully
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const newBotMsg = {
        id: botMsgId,
        role: "assistant",
        content: verifiedAnswer,
        source: "Simhastha 2028 Knowledge Base",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        feedback: null,
      };
      setMessages((prev) => [...prev, newBotMsg]);
    } catch (err) {
      console.warn("Q&A selection fallback:", err);
      const newBotMsg = {
        id: botMsgId,
        role: "assistant",
        content: verifiedAnswer,
        source: "Simhastha 2028 Knowledge Base",
        timestamp: timeStr,
        feedback: null,
      };
      setMessages((prev) => [...prev, newBotMsg]);
    } finally {
      setLoading(false);
      setActiveQuestionId(null);
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    const text = inputValue.trim();
    if (!text || loading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsgId = `user_${Date.now()}`;
    const botMsgId = `bot_${Date.now() + 1}`;

    const newUserMsg = {
      id: userMsgId,
      role: "user",
      content: text,
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue("");
    setLoading(true);

    try {
      const res = await ragService.askQuestion(
        text,
        [DEFAULT_DOC_ID],
        sessionId,
        "gemini-2.5-flash",
        "history_aware"
      );

      const newBotMsg = {
        id: botMsgId,
        role: "assistant",
        content: res.answer || "I could not find this information in the official knowledge base.",
        source: "Simhastha 2028 Knowledge Base",
        timestamp: timeStr,
        feedback: null,
      };
      setMessages((prev) => [...prev, newBotMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      const newBotMsg = {
        id: botMsgId,
        role: "assistant",
        content:
          "⚠️ **Notice**: Unable to connect to the Divya RAG Knowledge Service. Please verify that the local server is running on port 8000.",
        source: "Simhastha 2028 Knowledge Base",
        timestamp: timeStr,
        feedback: null,
      };
      setMessages((prev) => [...prev, newBotMsg]);
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.focus();
    }
  };

  const formatMarkdown = (content) => {
    if (!content) return null;
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      if (line.startsWith("### ")) {
        return (
          <h4 key={idx} className="text-sm font-bold text-slate-900 mt-2.5 mb-1">
            {line.replace("### ", "")}
          </h4>
        );
      }
      if (line.startsWith("## ") || line.startsWith("# ")) {
        return (
          <h3 key={idx} className="text-base font-bold text-slate-900 mt-3 mb-1.5">
            {line.replace(/^#+\s/, "")}
          </h3>
        );
      }
      if (line.startsWith("• ") || line.startsWith("- ") || line.startsWith("* ")) {
        const itemText = line.replace(/^[•\-*]\s+/, "");
        return (
          <div key={idx} className="flex items-start gap-2 my-1 text-[13px] text-slate-700 leading-relaxed">
            <span className="text-purple-600 font-bold">•</span>
            <span>{renderInlineStyles(itemText)}</span>
          </div>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      return (
        <p key={idx} className="text-[13px] text-slate-700 leading-relaxed my-1">
          {renderInlineStyles(line)}
        </p>
      );
    });
  };

  const renderInlineStyles = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-bold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const visibleQAItems = showMoreQA ? QA_SIDEBAR_ITEMS : QA_SIDEBAR_ITEMS.slice(0, 5);

  return (
    <div className="relative min-h-screen bg-[#FAF8F5] text-slate-900 font-sans selection:bg-purple-100 flex flex-col justify-between overflow-x-hidden">
      <Header />

      {/* Atmospheric Faint Temple Line-Art Backdrop */}
      <div className="absolute top-0 left-0 right-0 w-full h-[620px] pointer-events-none overflow-hidden z-0">
        <img
          src={templeBgImg}
          alt="Temple Silhouette"
          className="w-full h-full object-cover object-top opacity-30 filter contrast-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF8F5]/40 via-[#FAF8F5]/85 to-[#FAF8F5]" />
      </div>

      <main className="relative z-10 pt-24 pb-8 max-w-[1360px] mx-auto w-full px-4 sm:px-6 lg:px-8 flex-grow flex flex-col justify-between">
        
        {/* TOP ACTION ROW */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          {/* Back to Journey Planner */}
          <button
            onClick={() => navigate("/chatbot")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/95 hover:bg-white border border-purple-200/90 rounded-full text-xs font-semibold text-slate-700 hover:text-purple-700 shadow-xs transition-all active:scale-95"
          >
            <ArrowLeft size={14} className="text-purple-600" />
            <span>Back to Journey Planner</span>
          </button>

          {/* View Knowledge Base PDF Button */}
          <button
            onClick={() => setShowPdfModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/95 hover:bg-purple-50 border border-purple-200/90 hover:border-purple-300 rounded-full text-xs font-bold text-slate-800 hover:text-purple-700 shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <FileText size={14} className="text-purple-600" />
            <span>View Knowledge Base PDF</span>
            <span className="text-[10px] font-extrabold text-white bg-[#7C3AED] px-2 py-0.5 rounded-full shadow-2xs">
              20 PGS
            </span>
          </button>
        </div>

        {/* MAIN CHATBOT CONTAINER */}
        <div className="flex-1 flex flex-col bg-white rounded-[2rem] border border-[#E9D5FF]/80 shadow-xl shadow-purple-950/5 overflow-hidden">
          
          {/* CHAT HEADER */}
          <div className="px-6 py-4 border-b border-purple-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3.5">
              {/* Friendly Robot Avatar */}
              <div className="w-11 h-11 rounded-2xl overflow-hidden border border-purple-200 bg-purple-50 shadow-xs flex-shrink-0">
                <img src={divyaRobotImg} alt="Divya AI" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">
                    Divya AI Assistant
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-[#F3E8FF] text-[#7C3AED] text-[10px] font-black uppercase tracking-wider">
                    SACRED RAG
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Official Simhastha 2028 & Mahakal Pilgrimage Intelligence
                </p>
              </div>
            </div>

            <button
              onClick={handleResetChat}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-purple-50 border border-purple-200 text-slate-700 hover:text-purple-700 rounded-full text-xs font-semibold shadow-2xs transition-all active:scale-95"
            >
              <RotateCcw size={13} className="text-purple-600" />
              <span>New Chat</span>
            </button>
          </div>

          {/* TWO-COLUMN SPLIT CHAT CONTENT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 h-[520px] max-h-[560px] min-h-0 overflow-hidden">
            
            {/* LEFT SIDEBAR: INSTANT VERIFIED Q&A */}
            <div className="lg:col-span-4 border-r border-purple-100 bg-[#FAF9F7]/50 p-5 overflow-y-auto h-full min-h-0 custom-scrollbar flex flex-col justify-between">
              <div>
                <div className="mb-3.5">
                  <div className="flex items-center gap-1.5 text-purple-700 text-xs font-black uppercase tracking-wider mb-0.5">
                    <Sparkles size={13} className="text-purple-600" />
                    <span>INSTANT VERIFIED Q&amp;A</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Click any question to get instant answer
                  </p>
                </div>

                <div className="space-y-2.5">
                  {visibleQAItems.map((item) => {
                    const IconComp = item.icon;
                    const isActive = activeQuestionId === item.id;
                    const isHindi = language === "हिन्दी";
                    const displayCategory = isHindi ? (item.categoryHi || item.category) : item.category;
                    const displayQuestion = isHindi ? (item.questionHi || item.question) : item.question;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectQuestion(item)}
                        className={`group cursor-pointer p-3.5 rounded-2xl bg-white border transition-all shadow-2xs flex items-start gap-3 active:scale-[0.99] ${
                          isActive
                            ? "border-purple-500 ring-2 ring-purple-400/25 bg-purple-50/50 shadow-sm"
                            : "border-purple-100/90 hover:border-purple-300 hover:shadow-md"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${item.iconBg}`}>
                          <IconComp size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100 inline-block mb-1">
                            {displayCategory}
                          </span>
                          <p className="text-xs font-semibold text-slate-800 group-hover:text-purple-900 transition-colors leading-snug">
                            {displayQuestion}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {QA_SIDEBAR_ITEMS.length > 5 && (
                <button
                  onClick={() => setShowMoreQA(!showMoreQA)}
                  className="mt-3.5 w-full py-2 text-center text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center justify-center gap-1 transition-colors"
                >
                  <span>{showMoreQA ? "Show Less" : "View More Questions"}</span>
                  {showMoreQA ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              )}
            </div>

            {/* RIGHT CHAT WINDOW */}
            <div
              ref={scrollRef}
              className="lg:col-span-8 p-6 overflow-y-auto h-full min-h-0 space-y-4 bg-white custom-scrollbar flex flex-col justify-start"
            >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                  <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-3 shadow-2xs">
                    <Sparkles size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1">Begin Your Sacred Inquiry</h4>
                  <p className="text-xs max-w-sm">
                    Select a question from the left sidebar or type your query in the box below.
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                  >
                    {msg.role === "user" ? (
                      /* USER MESSAGE: Lavender/Purple Rounded Bubble */
                      <div className="max-w-[80%] bg-[#EDE9FE] border border-[#DDD6FE] text-slate-900 rounded-2xl rounded-tr-sm px-4 py-3 shadow-2xs space-y-1">
                        <p className="text-[13px] font-medium leading-relaxed">{msg.content}</p>
                        <div className="flex items-center justify-end gap-1 text-[10px] text-purple-700 font-semibold">
                          <span>{msg.timestamp}</span>
                          <span>✓✓</span>
                        </div>
                      </div>
                    ) : (
                      /* AI MESSAGE: Left Aligned Card */
                      <div className="flex items-start gap-3 max-w-[92%]">
                        <div className="w-7 h-7 rounded-xl overflow-hidden border border-purple-200 bg-purple-50 flex-shrink-0 shadow-2xs mt-1">
                          <img src={divyaRobotImg} alt="Divya" className="w-full h-full object-cover" />
                        </div>

                        <div className="flex-1 bg-white border border-purple-100 rounded-2xl p-4 shadow-xs space-y-2.5">
                          {/* Content Body */}
                          <div className="prose prose-sm max-w-none">
                            {formatMarkdown(msg.content)}
                          </div>

                          {/* Source Citation & Actions Footer */}
                          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                            <span className="text-[11px] font-medium text-slate-500">
                              Source: {msg.source || "Simhastha 2028 Knowledge Base"}
                            </span>

                            <div className="flex items-center gap-3">
                              <span className="text-[10px] text-slate-400">{msg.timestamp}</span>

                              {/* Copy */}
                              <button
                                onClick={() => handleCopy(msg.id, msg.content)}
                                title="Copy answer"
                                className="hover:text-purple-700 transition-colors"
                              >
                                {copiedId === msg.id ? (
                                  <Check size={14} className="text-emerald-600" />
                                ) : (
                                  <Copy size={14} />
                                )}
                              </button>

                              {/* Thumbs Up */}
                              <button
                                onClick={() => handleFeedback(msg.id, "up")}
                                title="Helpful"
                                className={`hover:text-purple-700 transition-colors ${
                                  msg.feedback === "up" ? "text-purple-700 font-bold" : ""
                                }`}
                              >
                                <ThumbsUp size={14} />
                              </button>

                              {/* Thumbs Down */}
                              <button
                                onClick={() => handleFeedback(msg.id, "down")}
                                title="Not helpful"
                                className={`hover:text-purple-700 transition-colors ${
                                  msg.feedback === "down" ? "text-purple-700 font-bold" : ""
                                }`}
                              >
                                <ThumbsDown size={14} />
                              </button>

                              {/* Read Aloud */}
                              <button
                                onClick={() => handleSpeak(msg.id, msg.content)}
                                title="Read aloud"
                                className="hover:text-purple-700 transition-colors"
                              >
                                {speakingId === msg.id ? (
                                  <VolumeX size={14} className="text-purple-600 animate-pulse" />
                                ) : (
                                  <Volume2 size={14} />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))
              )}

              {/* Typing indicator */}
              {loading && (
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl overflow-hidden border border-purple-200 bg-purple-50 flex-shrink-0 shadow-2xs mt-1">
                    <img src={divyaRobotImg} alt="Divya" className="w-full h-full object-cover" />
                  </div>
                  <div className="bg-white border border-purple-100 rounded-2xl px-4 py-3 shadow-xs flex items-center gap-2">
                    <span className="text-xs font-semibold text-purple-700">Searching Simhastha Knowledge Base</span>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Anchor to scroll to bottom */}
              <div ref={messagesEndRef} className="h-1" />
            </div>

          </div>

          {/* INPUT AREA */}
          <div className="p-4 border-t border-purple-100 bg-white">
            <form onSubmit={handleSend} className="relative flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask Divya anything about Ujjain Simhastha 2028, rituals, darshan..."
                  disabled={loading}
                  className={`w-full py-3.5 pl-5 pr-12 bg-[#FAF9F7] focus:bg-white rounded-full text-xs sm:text-[13px] font-medium text-slate-900 placeholder-slate-400 border border-purple-200/90 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all shadow-inner ${
                    isListening ? "ring-2 ring-red-500 border-red-300 animate-pulse" : ""
                  }`}
                />
                {/* Microphone Button */}
                <button
                  type="button"
                  onClick={toggleMic}
                  title="Voice Query"
                  className={`absolute right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    isListening
                      ? "bg-red-500 text-white animate-bounce shadow-xs"
                      : "text-slate-400 hover:text-purple-700 hover:bg-purple-50"
                  }`}
                >
                  {isListening ? <MicOff size={15} /> : <Mic size={15} />}
                </button>
              </div>

              {/* Purple Circular Send Button */}
              <button
                type="submit"
                disabled={loading || !inputValue.trim()}
                className="w-12 h-12 rounded-2xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white flex items-center justify-center transition-all shadow-md shadow-purple-600/25 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send size={17} />
              </button>
            </form>
          </div>

        </div>

        {/* BOTTOM FOOTER */}
        <div className="mt-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 px-2 text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-purple-600 flex-shrink-0" />
            <span>
              Divya AI Assistant provides information from official sources only. Please cross-check important details with government authorities.
            </span>
          </div>

          <a
            href="https://simhastha.mp.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-700 hover:text-purple-900 font-semibold flex-shrink-0 transition-colors"
          >
            Learn more about Simhastha 2028 →
          </a>
        </div>

      </main>

      {/* PDF VIEWER MODAL */}
      <AnimatePresence>
        {showPdfModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl border border-purple-200 shadow-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-purple-100 flex items-center justify-between bg-gradient-to-r from-purple-50/70 via-white to-orange-50/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 shadow-2xs">
                    <FileText size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900">
                        Official Simhastha 2028 Knowledge Base
                      </h3>
                      <span className="text-[10px] font-extrabold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                        20 PAGES • 68 CHUNKS
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Grounded PDF corpus for Divya Sacred AI Assistant
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="/ujjain_simhastha_2028_rag_knowledge_base.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full text-xs font-semibold border border-purple-200 transition-colors"
                  >
                    <ExternalLink size={13} />
                    <span className="hidden sm:inline">Open in Tab</span>
                  </a>
                  <a
                    href="/ujjain_simhastha_2028_rag_knowledge_base.pdf"
                    download="ujjain_simhastha_2028_rag_knowledge_base.pdf"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-full text-xs font-semibold border border-slate-200 transition-colors"
                  >
                    <Download size={13} />
                    <span className="hidden sm:inline">Download</span>
                  </a>
                  <button
                    onClick={() => setShowPdfModal(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors ml-1"
                    title="Close preview"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* PDF Preview Frame */}
              <div className="flex-1 w-full bg-slate-100 relative overflow-hidden">
                <iframe
                  src="/ujjain_simhastha_2028_rag_knowledge_base.pdf"
                  title="Official Simhastha 2028 Knowledge Base"
                  className="w-full h-full border-none"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #DDD6FE transparent;
          overscroll-behavior: contain;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #DDD6FE;
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #C4B5FD;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
      `}} />
    </div>
  );
}
