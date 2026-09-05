import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { Shield, Navigation, AlertTriangle, X, Radio, ArrowRight, Phone, MapPin } from 'lucide-react';

const GuardianTrackingAlertModal = () => {
    const { activeTrackingSesssion, sosAlerts } = useSocket();
    const navigate = useNavigate();
    const location = useLocation();

    const [trackingModal, setTrackingModal] = useState(null);
    const [latestSosModal, setLatestSosModal] = useState(null);
    const [dismissedTrackingId, setDismissedTrackingId] = useState(null);
    const [dismissedSosIds, setDismissedSosIds] = useState([]);

    // Catch new tracking sessions
    useEffect(() => {
        if (activeTrackingSesssion && activeTrackingSesssion.userId !== dismissedTrackingId) {
            setTrackingModal(activeTrackingSesssion);
        }
    }, [activeTrackingSesssion, dismissedTrackingId]);

    // Catch incoming SOS alerts
    useEffect(() => {
        if (sosAlerts && sosAlerts.length > 0) {
            const latest = sosAlerts[sosAlerts.length - 1];
            if (latest && !dismissedSosIds.includes(latest.sosId || latest.timestamp)) {
                setLatestSosModal(latest);
            }
        }
    }, [sosAlerts, dismissedSosIds]);

    const handleOpenTrackingRadar = (session) => {
        localStorage.setItem('family_role', 'guardian');
        setTrackingModal(null);
        navigate('/family-mode', { state: { autoSelectUser: session.userId, session } });
    };

    const handleOpenSosRadar = (sos) => {
        localStorage.setItem('family_role', 'guardian');
        setLatestSosModal(null);
        navigate('/family-mode', { state: { autoSelectUser: sos.userId, sosActive: true, sos } });
    };

    const handleOpenGoogleMaps = (sos) => {
        if (sos.lat && sos.lng) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${sos.lat},${sos.lng}&travelmode=driving`, '_blank');
        }
    };

    return (
        <>
            {/* 1. CRITICAL SOS MODAL (HIGHEST PRIORITY) */}
            {latestSosModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in zoom-in duration-300">
                    <div className="relative w-full max-w-lg bg-slate-900 border-2 border-red-500 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(239,68,68,0.5)] overflow-hidden">
                        {/* Flashing glow background */}
                        <div className="absolute -top-20 -right-20 w-48 h-48 bg-red-600/30 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-rose-600/30 rounded-full blur-3xl animate-pulse" />

                        {/* Close button */}
                        <button
                            onClick={() => {
                                setDismissedSosIds(prev => [...prev, latestSosModal.sosId || latestSosModal.timestamp]);
                                setLatestSosModal(null);
                            }}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all"
                        >
                            <X size={18} />
                        </button>

                        {/* Header Badge */}
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/50 animate-bounce">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <span className="inline-block px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-black uppercase tracking-widest mb-1">
                                    🚨 Emergency SOS Alert
                                </span>
                                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                                    {latestSosModal.userName} in Distress!
                                </h3>
                            </div>
                        </div>

                        {/* Content Card */}
                        <div className="bg-red-950/40 border border-red-800/50 rounded-2xl p-4 mb-6 space-y-2">
                            <p className="text-xs text-red-200 font-medium leading-relaxed">
                                A panic SOS alert has been broadcasted by <strong>{latestSosModal.userName}</strong>. Immediate assistance and location tracking required.
                            </p>
                            <div className="flex items-center justify-between text-[11px] text-red-300 pt-2 border-t border-red-900/50 font-mono">
                                <span>Coordinates:</span>
                                <span>{latestSosModal.lat?.toFixed(5)}, {latestSosModal.lng?.toFixed(5)}</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-red-300 font-mono">
                                <span>Timestamp:</span>
                                <span>{new Date(latestSosModal.timestamp || Date.now()).toLocaleTimeString()}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                                onClick={() => handleOpenSosRadar(latestSosModal)}
                                className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-600/40 flex items-center justify-center gap-2 active:scale-95 transition-all"
                            >
                                <Radio size={16} className="animate-pulse" /> Track on Radar
                            </button>
                            <button
                                onClick={() => handleOpenGoogleMaps(latestSosModal)}
                                className="w-full py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-wider rounded-xl border border-slate-700 flex items-center justify-center gap-2 active:scale-95 transition-all"
                            >
                                <Navigation size={16} /> Google Maps
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. JOURNEY STARTED / GUARDIAN APPOINTED POPUP NOTIFICATION */}
            {trackingModal && !latestSosModal && (
                <div className="fixed bottom-6 right-6 z-[9990] max-w-md w-[calc(100vw-3rem)] animate-in slide-in-from-bottom-5 duration-500">
                    <div className="relative bg-slate-900/95 backdrop-blur-xl border-2 border-orange-500/50 rounded-3xl p-5 shadow-[0_20px_50px_rgba(249,115,22,0.3)] text-white overflow-hidden">
                        {/* Accent top glow */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 animate-pulse" />

                        {/* Dismiss button */}
                        <button
                            onClick={() => {
                                setDismissedTrackingId(trackingModal.userId);
                                setTrackingModal(null);
                            }}
                            className="absolute top-3.5 right-3.5 p-1.5 text-slate-400 hover:text-white rounded-full bg-white/5 hover:bg-white/15 transition-all"
                        >
                            <X size={16} />
                        </button>

                        <div className="flex items-start gap-3.5 mb-3.5">
                            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center shrink-0">
                                <Shield size={20} />
                            </div>
                            <div className="min-w-0 pr-6">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">
                                        Active Guardian Radar
                                    </span>
                                </div>
                                <h4 className="text-base font-black text-white truncate uppercase tracking-tight mt-0.5">
                                    {trackingModal.userName} Started Journey
                                </h4>
                            </div>
                        </div>

                        {/* Trip Info Card */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 mb-4 space-y-1.5 text-xs text-slate-300">
                            <p className="text-[11px] leading-relaxed text-slate-200">
                                You have been selected as the active Guardian Tracker for this journey.
                            </p>
                            {trackingModal.src && trackingModal.dest && (
                                <div className="pt-2 border-t border-white/10 flex flex-col gap-1 text-[10px]">
                                    <div className="flex items-center gap-1.5 text-orange-300 truncate">
                                        <MapPin size={12} className="shrink-0" />
                                        <span className="truncate"><strong>From:</strong> {trackingModal.src.name || 'Origin point'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-blue-300 truncate">
                                        <Navigation size={12} className="shrink-0" />
                                        <span className="truncate"><strong>To:</strong> {trackingModal.dest.name || 'Destination point'}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2.5">
                            <button
                                onClick={() => handleOpenTrackingRadar(trackingModal)}
                                className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
                            >
                                <Radio size={14} className="animate-pulse" /> View Live Path & Radar <ArrowRight size={14} />
                            </button>
                            <button
                                onClick={() => {
                                    setDismissedTrackingId(trackingModal.userId);
                                    setTrackingModal(null);
                                }}
                                className="py-3 px-3.5 bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs uppercase rounded-xl transition-all"
                            >
                                Later
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default GuardianTrackingAlertModal;
