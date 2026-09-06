import React, { useState } from "react";
import {
  User,
  Phone,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Zap,
  Globe,
  Activity,
  ShieldCheck,
  XCircle,
  Calendar,
  Compass,
  CreditCard,
  MapPin,
  CheckCircle2,
  LogIn
} from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { API_V1 } from "../config/api";

const Auth = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  // step: "initial" | "emailLogin" | "registering"
  const [step, setStep] = useState("initial");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    userType: "Civilian",
    age: "",
    adminSecret: "",
    divyangCardId: "",
  });
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const slides = [
    "https://cdn.pixabay.com/photo/2016/08/21/19/49/temple-1610625_1280.jpg",
    "https://s-media-cache-ak0.pinimg.com/originals/c3/22/a0/c322a010cd73eb17596d705120bc0132.jpg",
    "https://wallpaperaccess.com/full/9297798.jpg",
    "https://wallpaperbat.com/img/1609509-ram-mandir-photo-a-look-at-the-proposed-model-for-ram-janmbhoomi-temple-in-ayodhya.jpg"
  ];

  const handleLoginSuccess = (userData, token) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    if (setIsAuthenticated) setIsAuthenticated(true);
    navigate("/");
  };

  // Google OAuth Success Handler
  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setMessage("");
    try {
      const idToken = credentialResponse.credential;
      const decodedUser = jwtDecode(idToken);

      const response = await fetch(`${API_V1}/auth/profile`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        handleLoginSuccess(data.user, data.token);
      } else if (response.status === 404 || response.status === 401) {
        setFormData({
          name: decodedUser.name || "",
          email: decodedUser.email || "",
          phone: "",
          password: "",
          userType: "Civilian",
          age: "",
          adminSecret: "",
          divyangCardId: "",
        });
        setStep("registering");
      } else {
        // Fallback instant register/login with Google data
        const fallbackRes = await fetch(`${API_V1}/auth/instant-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: decodedUser.name || "Google User",
            email: decodedUser.email,
            phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
            userType: "Civilian",
          }),
        });
        const fallbackData = await fallbackRes.json();
        if (fallbackRes.ok && fallbackData.token) {
          handleLoginSuccess(fallbackData.user, fallbackData.token);
        } else {
          throw new Error("Divine connection lost");
        }
      }
    } catch (error) {
      console.error(error);
      setMessage("Google sign in failed. You can also sign in with Email & Password below.");
    } finally {
      setIsLoading(false);
    }
  };

  // Normal Email & Password Login
  const handleEmailPasswordLogin = async (e) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      setMessage("Please enter both Email and Password.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_V1}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailInput,
          phone: emailInput,
          identifier: emailInput,
          password: passwordInput,
        }),
      });

      const data = await response.json();
      if (response.ok && data.token) {
        handleLoginSuccess(data.user, data.token);
      } else {
        setMessage(data.message || "Invalid email or password.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Login service unavailable. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Complete Registration Form Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      setMessage("Please fill out all required fields.");
      return;
    }

    if (formData.userType === "Admin" && !formData.adminSecret) {
      setMessage("Admin Secret Code is required for this role.");
      return;
    }
    if (formData.userType === "Divyang" && !formData.divyangCardId) {
      setMessage("Please provide your Government Divyang Card ID.");
      return;
    }
    if ((formData.userType === "Aged" || formData.userType === "Child") && !formData.age) {
      setMessage("Age verification is required for this category.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_V1}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          password: formData.password || "divyayatra123",
        }),
      });

      const data = await response.json();
      if (response.ok && data.token) {
        handleLoginSuccess(data.user, data.token);
      } else {
        setMessage(data.message || "Registration failed.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Registration failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const featureCards = [
    { title: "Sacred Navigation", icon: <Compass size={19} />, desc: "Navigate through holy corridors with real-time AI guidance.", color: "text-orange-600", bg: "bg-orange-50" },
    { title: "Live Darshan", icon: <Activity size={19} />, desc: "Witness the divine presence with real-time darshan links.", color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Smart Booking", icon: <CreditCard size={19} />, desc: "Seamlessly book tickets, parking, and accommodation.", color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Crisis Hub", icon: <ShieldCheck size={19} />, desc: "Advanced emergency tracking and pilgrim safety portal.", color: "text-purple-600", bg: "bg-purple-50" }
  ];

  return (
    <div className="relative min-h-[100dvh] w-full flex items-center justify-center bg-slate-50 font-['Outfit',sans-serif] select-none overflow-x-hidden p-4 sm:p-6 lg:p-8">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-100/30 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none" />

      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-8 lg:gap-16 relative z-10 items-center justify-center py-4">
        
        {/* Left Section: Branding & Features */}
        <div className="w-full lg:w-3/5 space-y-5 sm:space-y-8 animate-in fade-in slide-in-from-left-8 duration-500">
          <div className="flex items-center gap-3.5 justify-center lg:justify-start">
            <div className="w-13 h-13 sm:w-16 sm:h-16 flex items-center justify-center bg-white rounded-2xl shadow-xs border border-orange-100 p-2">
              <img src={logo} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-none uppercase">DIVYA YATRA</h3>
              <span className="text-[10px] sm:text-xs font-bold text-orange-600 uppercase tracking-widest mt-0.5 block">Pilgrim Navigator</span>
            </div>
          </div>

          <div className="space-y-2.5 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-[0.98]">
              Step into the <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-rose-500 to-orange-500">Divine Journey</span>
            </h1>
            <p className="max-w-lg mx-auto lg:mx-0 text-slate-500 text-sm sm:text-base font-medium leading-relaxed">
              A unified portal for Pilgrims, Trust, and Administration.
            </p>
          </div>

          <div className="hidden sm:grid grid-cols-2 gap-4 pt-1">
            {featureCards.map((feature, idx) => (
              <div key={idx} className="flex gap-3.5 p-4 rounded-2xl bg-white border border-slate-100 backdrop-blur-sm transition-all hover:shadow-lg hover:shadow-slate-200/40 group">
                <div className={`p-3 h-fit rounded-xl ${feature.bg} ${feature.color} group-hover:scale-105 transition-transform flex-shrink-0`}>
                  {feature.icon}
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-sm leading-tight">{feature.title}</h4>
                  <p className="text-xs text-slate-400 font-medium leading-snug">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Section: Proportional Sign In Card */}
        <div className="w-full lg:w-2/5 max-w-md lg:max-w-[460px] mx-auto animate-in fade-in slide-in-from-right-8 duration-500">
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 md:p-9 shadow-[0_24px_80px_-15px_rgba(0,0,0,0.08)] text-center border border-slate-100 space-y-5 relative overflow-hidden">
            
            {/* Header / Subtitle */}
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                {step === "initial" && "Welcome Devotee"}
                {step === "emailLogin" && "Email Sign In"}
                {step === "registering" && "Pilgrim Registration"}
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm font-medium">
                {step === "initial" && "Sign in to your spiritual workspace"}
                {step === "emailLogin" && "Enter your email and password"}
                {step === "registering" && "Provide details for your sacred pass"}
              </p>
            </div>

            {/* STEP 1: INITIAL (GOOGLE AUTH + EMAIL OPTION) */}
            {step === "initial" && (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-400">
                <div className="w-full p-6 sm:p-7 rounded-[1.75rem] bg-slate-50/90 border border-slate-100 flex flex-col items-center justify-center space-y-4 shadow-inner">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-xs">
                    <User className="text-slate-900" size={22} />
                  </div>

                  <div className="text-center space-y-0.5">
                    <span className="text-slate-800 font-bold block text-base sm:text-lg">One-Tap Authentication</span>
                    <span className="text-slate-400 text-xs font-medium">Continue securely with your Google account</span>
                  </div>

                  <div className="w-full transform transition-all hover:scale-[1.02] flex justify-center py-1">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => setMessage("Google sign-in connection failed. Please use Email Sign In.")}
                      useOneTap
                      theme="outline"
                      shape="pill"
                      size="large"
                      width="260px"
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 py-0.5">
                  <div className="h-px bg-slate-200 flex-1" />
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">OR</span>
                  <div className="h-px bg-slate-200 flex-1" />
                </div>

                {/* Email Sign-In Button */}
                <button
                  type="button"
                  onClick={() => { setStep("emailLogin"); setMessage(""); }}
                  className="w-full h-12 sm:h-13 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl font-bold text-sm shadow-2xs transition-all flex items-center justify-center gap-2.5 cursor-pointer hover:border-orange-200"
                >
                  <Mail size={16} className="text-orange-500" />
                  <span>Sign in with Email & Password</span>
                </button>
              </div>
            )}

            {/* STEP 2: EMAIL & PASSWORD LOGIN */}
            {step === "emailLogin" && (
              <form onSubmit={handleEmailPasswordLogin} className="space-y-3.5 text-left animate-in fade-in duration-400">
                <div className="space-y-3">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={17} />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-400 rounded-2xl h-12 pl-12 pr-4 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={17} />
                    <input
                      type="password"
                      placeholder="Password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-400 rounded-2xl h-12 pl-12 pr-4 text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 sm:h-13 bg-slate-900 hover:bg-orange-600 text-white rounded-2xl font-bold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
                >
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn size={17} />
                      <span>Sign In with Email</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => { setStep("registering"); setMessage(""); }}
                    className="font-bold text-orange-600 hover:underline cursor-pointer"
                  >
                    New Pilgrim? Register here
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStep("initial"); setMessage(""); }}
                    className="font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    ← Google Sign-In
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: REGISTRATION */}
            {step === "registering" && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3 text-left animate-in fade-in duration-400">
                <div className="space-y-2.5">
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={17} />
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-400 rounded-2xl h-11 pl-11 pr-4 text-xs sm:text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={17} />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-400 rounded-2xl h-11 pl-11 pr-4 text-xs sm:text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={17} />
                    <input
                      type="tel"
                      placeholder="Mobile Contact"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-400 rounded-2xl h-11 pl-11 pr-4 text-xs sm:text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={17} />
                    <input
                      type="password"
                      placeholder="Create Password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-400 rounded-2xl h-11 pl-11 pr-4 text-xs sm:text-sm font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div className="relative group">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={17} />
                    <select
                      value={formData.userType}
                      onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-400 rounded-2xl h-11 pl-11 pr-4 text-xs sm:text-sm font-semibold text-slate-800 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="Civilian">Civilian Devotee</option>
                      <option value="Local">Local Resident</option>
                      <option value="Aged">Senior Citizen (60+)</option>
                      <option value="Child">Child (Under 12)</option>
                      <option value="VIP">VIP Delegate</option>
                      <option value="Divyang">Differently Abled (Divyang)</option>
                      <option value="Sadhu">Sadhu / Saint</option>
                      <option value="Admin">Administrator</option>
                    </select>
                  </div>

                  {formData.userType === "Admin" && (
                    <div className="relative group">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400" size={17} />
                      <input
                        type="password"
                        placeholder="Admin Secret Code (DIVYA-ADMIN-777)"
                        value={formData.adminSecret}
                        onChange={(e) => setFormData({ ...formData, adminSecret: e.target.value })}
                        className="w-full bg-red-50/60 border border-red-200 focus:border-red-400 rounded-2xl h-11 pl-11 pr-4 text-xs sm:text-sm font-semibold text-slate-800 outline-none"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-slate-900 hover:bg-orange-600 text-white rounded-2xl font-bold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
                >
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep("initial")}
                  className="w-full text-center text-slate-400 font-bold text-[11px] uppercase tracking-widest pt-2 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Return to Login
                </button>
              </form>
            )}

            {/* Status Message Alert */}
            {message && (
              <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center gap-2 text-rose-600 text-xs font-bold animate-in bounce-in w-full">
                <XCircle size={15} /> {message}
              </div>
            )}

            {/* Bottom Slides Marquee */}
            <div className="pt-2 w-full">
              <div className="w-full h-[62px] rounded-2xl overflow-hidden border border-slate-100 flex items-center bg-slate-50 shadow-inner">
                <div className="flex animate-marquee hover:[animation-play-state:paused] w-max py-1">
                  {[...slides, ...slides].map((imgUrl, index) => (
                    <div key={index} className="w-[100px] h-[52px] flex-shrink-0 mx-1">
                      <img src={imgUrl} alt="Sacred site" className="w-full h-full object-cover rounded-xl border border-slate-200/70 shadow-2xs" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <style>{`
              @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(calc(-108px * 4)); }
              }
              .animate-marquee {
                animation: marquee 20s linear infinite;
              }
            `}</style>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
