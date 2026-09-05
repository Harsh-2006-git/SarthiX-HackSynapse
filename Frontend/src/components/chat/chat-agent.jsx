'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Loader2, Send, Volume2, Mic, MicOff, Bot, User } from 'lucide-react';
import { getChatResponse, getTextToSpeech } from '../../api/chatActions';
import { useToast } from '../../hooks/use-toast';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function ChatAgent({
  onItineraryReady
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
    const [language, setLanguage] = useState('Hindi');
    const [isResponding, setIsResponding] = useState(false);
    const [isListening, setIsListening] = useState(false);
  const speechRecognition = useRef(null);

  const suggestions = [
    { en: "Plan My Yatra 🚩", hi: "योजना बनाएं 🚩" },
    { en: "Mahakaleshwar visit", hi: "महाकालेश्वर दर्शन" },
    { en: "Best food in Ujjain", hi: "प्रसिद्ध भोजन" },
    { en: "Temple timings", hi: "मंदिर समय" },
    { en: "Emergency helpline", hi: "हेल्पलाइन" }
  ];

  const {
    toast
  } = useToast();
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const playAudio = (url) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play().catch(err => console.log("Autoplay blocked or failed:", err));
  };
  const handleSendMessage = async (e, textOverride = null) => {
    if (e) e.preventDefault();
    const userInput = textOverride ?? input;
    if (!userInput.trim()) return;
    const userMessage = {
      role: 'user',
      content: userInput
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsResponding(true);
    const historyForAI = newMessages.map(({
      role,
      content
    }) => ({
      role,
      content
    }));
    const chatInput = {
      history: historyForAI,
      language
    };
    const result = await getChatResponse(chatInput);
    if (result.error) {
      toast({
        variant: "destructive",
        title: "Chat Error",
        description: result.error
      });
      setIsResponding(false);
    } else if (result.data) {
      const aiText = result.data.response;
      const itineraryInput = result.data.itineraryInput;

      // Get Text to Speech automatically
      try {
        const audioResult = await getTextToSpeech({
          text: aiText,
          language
        });
        const aiMessage = {
          role: 'model',
          content: aiText,
          audioUrl: audioResult.data?.media
        };
        setMessages(prev => [...prev, aiMessage]);

        // Autoplay logic
        if (audioResult.data?.media) {
          playAudio(audioResult.data.media);
        }
      } catch (err) {
        console.error("TTS Error:", err);
        const aiMessage = {
          role: 'model',
          content: aiText
        };
        setMessages(prev => [...prev, aiMessage]);
      }
      if (itineraryInput && itineraryInput.departureDate && itineraryInput.arrivalDate) {
        const {
          departureDate,
          arrivalDate,
          numberOfPeople,
          ...rest
        } = itineraryInput;
        const departure = new Date(departureDate.replace(/-/g, '/'));
        const arrival = new Date(arrivalDate.replace(/-/g, '/'));
        onItineraryReady({
          ...rest,
          departureDate: departure,
          arrivalDate: arrival,
          numberOfPeople: Number(numberOfPeople) || 1
        });
      }
    }
    setIsResponding(false);
  };
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      speechRecognition.current = new SpeechRecognition();
      speechRecognition.current.continuous = false;
      speechRecognition.current.interimResults = false;
      speechRecognition.current.lang = language === 'Hindi' ? 'hi-IN' : 'en-US';
      speechRecognition.current.onresult = event => {
        const transcript = event.results[0][0].transcript;
        handleSendMessage(null, transcript);
      };
      speechRecognition.current.onerror = event => {
        if (event.error !== 'no-speech') {
          toast({
            variant: "destructive",
            title: "Voice Error",
            description: event.error
          });
        }
        setIsListening(false);
      };
      speechRecognition.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [language]);
  const toggleListening = () => {
    if (!speechRecognition.current) {
      toast({
        title: "Unsupported",
        description: "Your browser doesn't support voice recognition."
      });
      return;
    }
    if (isListening) {
      speechRecognition.current.stop();
      setIsListening(false);
    } else {
      speechRecognition.current.start();
      setIsListening(true);
    }
  };
  useEffect(() => {
    let isActive = true;
    const startChat = async () => {
      setIsLoading(true);
      const initialText = language === 'Hindi' ? 'जय श्री महाकाल! मैं RoamAI हूँ। मैं आपकी दिव्य यात्रा की योजना बनाने में मदद कर सकता हूँ। क्या आप शुरू करना चाहेंगे?' : 'Jai Shree Mahakal! I am RoamAI. I can help you plan your sacred journey. Would you like to start planning?';
      try {
        const audioResult = await getTextToSpeech({
          text: initialText,
          language
        });
        if (!isActive) return;
        const initialMessage = {
          role: 'model',
          content: initialText,
          audioUrl: audioResult.data?.media
        };
        setMessages([initialMessage]);
        if (audioResult.data?.media) {
          playAudio(audioResult.data.media);
        }
      } catch (err) {
        if (!isActive) return;
        setMessages([{
          role: 'model',
          content: initialText
        }]);
      }
      if (isActive) setIsLoading(false);
    };
    startChat();
    return () => {
      isActive = false;
    };
  }, [language]);
  return /*#__PURE__*/_jsxs("div", {
    className: "flex flex-col h-full bg-white relative overflow-hidden",
    children: [/*#__PURE__*/_jsx("div", {
      className: "absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50 pointer-events-none"
    }), /*#__PURE__*/_jsxs("div", {
      className: "p-6 border-b border-orange-100 bg-white/50 backdrop-blur-sm relative z-10 flex items-center justify-between",
      children: [/*#__PURE__*/_jsxs("div", {
        className: "flex items-center gap-4",
        children: [/*#__PURE__*/_jsx("div", {
          className: "h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-orange-200",
          children: /*#__PURE__*/_jsx(Bot, {
            size: 28
          })
        }), /*#__PURE__*/_jsxs("div", {
          children: [/*#__PURE__*/_jsx("h3", {
            className: "text-xl font-black text-slate-800 leading-tight",
            children: "RoamAI Assistant"
          }), /*#__PURE__*/_jsxs("div", {
            className: "flex items-center gap-1.5 mt-0.5",
            children: [/*#__PURE__*/_jsx("div", {
              className: "h-2 w-2 rounded-full bg-green-500 animate-pulse"
            }), /*#__PURE__*/_jsx("span", {
              className: "text-[10px] uppercase font-black tracking-widest text-slate-400",
              children: "Divine Wisdom Active"
            })]
          })]
        })]
      }), /*#__PURE__*/_jsxs(RadioGroup, {
        value: language,
        onValueChange: v => setLanguage(v),
        className: "flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-100",
        children: [/*#__PURE__*/_jsxs("div", {
          className: "flex items-center gap-2 px-3 py-1.5 rounded-lg has-[:checked]:bg-white has-[:checked]:shadow-sm transition-all selection:bg-transparent",
          children: [/*#__PURE__*/_jsx(RadioGroupItem, {
            value: "Hindi",
            id: "hindi",
            className: "sr-only"
          }), /*#__PURE__*/_jsx(Label, {
            htmlFor: "hindi",
            className: "text-xs font-bold cursor-pointer transition-colors",
            children: "Hindi"
          })]
        }), /*#__PURE__*/_jsxs("div", {
          className: "flex items-center gap-2 px-3 py-1.5 rounded-lg has-[:checked]:bg-white has-[:checked]:shadow-sm transition-all selection:bg-transparent",
          children: [/*#__PURE__*/_jsx(RadioGroupItem, {
            value: "English",
            id: "english",
            className: "sr-only"
          }), /*#__PURE__*/_jsx(Label, {
            htmlFor: "english",
            className: "text-xs font-bold cursor-pointer transition-colors",
            children: "English"
          })]
        })]
      })]
    }), /*#__PURE__*/_jsx(ScrollArea, {
      className: "flex-1 p-6 relative z-10",
      children: /*#__PURE__*/_jsxs("div", {
        className: "space-y-6 max-w-2xl mx-auto",
        children: [messages.map((m, i) => /*#__PURE__*/_jsx("div", {
          className: `flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`,
          children: /*#__PURE__*/_jsxs("div", {
            className: `flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`,
            children: [/*#__PURE__*/_jsx("div", {
              className: `h-10 w-10 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm ${m.role === 'user' ? 'bg-slate-100 text-slate-600' : 'bg-orange-600 text-white'}`,
              children: m.role === 'user' ? /*#__PURE__*/_jsx(User, {
                size: 20
              }) : /*#__PURE__*/_jsx(Bot, {
                size: 20
              })
            }), /*#__PURE__*/_jsxs("div", {
              className: "space-y-2",
              children: [/*#__PURE__*/_jsx("div", {
                className: `p-4 rounded-[1.5rem] shadow-sm text-sm leading-relaxed font-medium ${m.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white border border-orange-100 text-slate-700 rounded-tl-none'}`,
                children: m.content
              }), m.audioUrl && /*#__PURE__*/_jsxs(Button, {
                variant: "ghost",
                size: "sm",
                onClick: () => playAudio(m.audioUrl),
                className: "h-8 pr-3 pl-2 gap-2 rounded-full border border-slate-100 bg-white hover:bg-slate-50 text-slate-500 font-bold text-[10px] uppercase tracking-widest active:scale-95",
                children: [/*#__PURE__*/_jsx(Volume2, {
                  size: 14,
                  className: "text-orange-600"
                }), " Listen"]
              })]
            })]
          })
        }, i)), isResponding && /*#__PURE__*/_jsx("div", {
          className: "flex justify-start animate-fade-in-up",
          children: /*#__PURE__*/_jsxs("div", {
            className: "flex gap-3 items-center text-[10px] font-black uppercase tracking-[0.2em] text-orange-600/50",
            children: [/*#__PURE__*/_jsx(Loader2, {
              size: 12,
              className: "animate-spin"
            }), " Consulting the stars..."]
          })
        }), messages.length <= 1 && /*#__PURE__*/_jsx("div", {
          className: "flex flex-wrap gap-2 pt-6 max-w-2xl mx-auto animate-fade-in-up",
          children: suggestions.map((s, idx) => /*#__PURE__*/_jsx("button", {
            type: "button",
            onClick: () => handleSendMessage(null, language === 'Hindi' ? s.hi : s.en),
            className: "px-4 py-2 rounded-full border border-orange-200 bg-white hover:bg-orange-50 text-slate-600 font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-sm",
            children: language === 'Hindi' ? s.hi : s.en
          }, idx))
        }), /*#__PURE__*/_jsx("div", {
          ref: messagesEndRef
        })]
      })
    }), /*#__PURE__*/_jsx("div", {
      className: "p-6 bg-white/80 backdrop-blur-md border-t border-orange-100 relative z-10",
      children: /*#__PURE__*/_jsxs("form", {
        onSubmit: handleSendMessage,
        className: "max-w-2xl mx-auto flex items-center gap-3 bg-slate-50 p-2 rounded-[2rem] border border-slate-200 focus-within:border-orange-500/50 focus-within:ring-4 focus-within:ring-orange-500/5 transition-all",
        children: [/*#__PURE__*/_jsx(Button, {
          type: "button",
          variant: "ghost",
          size: "icon",
          onClick: toggleListening,
          className: `h-12 w-12 rounded-full transition-all ${isListening ? 'bg-orange-600 text-white animate-pulse' : 'hover:bg-orange-100 text-slate-400'}`,
          children: isListening ? /*#__PURE__*/_jsx(MicOff, {
            size: 20
          }) : /*#__PURE__*/_jsx(Mic, {
            size: 20
          })
        }), /*#__PURE__*/_jsx(Input, {
          value: input,
          onChange: e => setInput(e.target.value),
          placeholder: "Plan your divine journey...",
          className: "flex-1 border-none bg-transparent focus-visible:ring-0 font-medium placeholder:text-slate-400 h-12"
        }), /*#__PURE__*/_jsx(Button, {
          disabled: !input.trim() || isResponding,
          className: "h-12 w-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg active:scale-95 disabled:grayscale transition-all p-0 flex items-center justify-center",
          children: isResponding ? /*#__PURE__*/_jsx(Loader2, {
            size: 20,
            className: "animate-spin"
          }) : /*#__PURE__*/_jsx(Send, {
            size: 20
          })
        })]
      })
    })]
  });
}