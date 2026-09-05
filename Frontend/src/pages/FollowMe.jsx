import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import { 
    User, MapPin, Activity, ShieldCheck, Phone, 
    Navigation, AlertTriangle, Clock, Zap, Heart,
    MoreVertical, Bell, PhoneCall
} from 'lucide-react';
import Header from '../components/Header';

// Component to handle routing on the map
const RoutingMachine = ({ start, end, color }) => {
    const map = useMap();
    const routingControlRef = useRef(null);

    useEffect(() => {
        if (!map || !start || !end) return;

        if (routingControlRef.current) {
            map.removeControl(routingControlRef.current);
        }

        routingControlRef.current = L.Routing.control({
            waypoints: [L.latLng(start[0], start[1]), L.latLng(end[0], end[1])],
            lineOptions: { styles: [{ color: color || '#3b82f6', opacity: 0.6, weight: 4 }] },
            createMarker: () => null,
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            show: false
        }).addTo(map);

        return () => {
            if (routingControlRef.current && map) {
                map.removeControl(routingControlRef.current);
            }
        };
    }, [map, start, end, color]);

    return null;
};

const AutoFitBounds = ({ pos1, pos2 }) => {
    const map = useMap();
    useEffect(() => {
        if (pos1 && pos2) {
            const bounds = L.latLngBounds([pos1, pos2]);
            map.fitBounds(bounds, { padding: [100, 100], maxZoom: 15 });
        } else if (pos1) {
            map.setView(pos1, 15);
        } else if (pos2) {
            map.setView(pos2, 15);
        }
    }, [pos1, pos2, map]);
    return null;
};

const FollowMePage = () => {
    const { lastLocation, sosAlerts, activeTrackingSesssion } = useSocket();
    const [protégés, setProtégés] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedUserPath, setSelectedUserPath] = useState([]);
    const [userPosition, setUserPosition] = useState(null);
    const [guardianPosition, setGuardianPosition] = useState(null);
    const [activeSession, setActiveSession] = useState(null);
    const [sosRoute, setSosRoute] = useState(null); // From guardian to user when SOS happens

    const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api/v1';

    useEffect(() => {
        fetchProtégés();
        detectGuardianLocation();
    }, []);

    useEffect(() => {
        if (activeTrackingSesssion) {
            setActiveSession(activeTrackingSesssion);
            setSelectedUserId(activeTrackingSesssion.userId);
            // Auto select the person who just started tracking
        }
    }, [activeTrackingSesssion]);

    useEffect(() => {
        if (lastLocation && lastLocation.userId === selectedUserId) {
            const newPos = [lastLocation.lat, lastLocation.lng];
            setUserPosition(newPos);
            setSelectedUserPath(prev => [...prev.slice(-49), newPos]); // Keep last 50 points
        }
    }, [lastLocation, selectedUserId]);

    const detectGuardianLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setGuardianPosition([pos.coords.latitude, pos.coords.longitude]);
            });
        }
    };

    const fetchProtégés = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/location/tracking-list`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProtégés(res.data);
            if (res.data.length > 0 && !selectedUserId) {
                handleUserSelect(res.data[0].user.client_id);
            }
        } catch (err) {
            console.error('Error fetching tracking list', err);
        }
    };

    const handleUserSelect = async (userId) => {
        setSelectedUserId(userId);
        setSelectedUserPath([]);
        setUserPosition(null);
        setSosRoute(null);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/location/history/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const historyPath = res.data.map(p => [p.lat, p.lng]);
            setSelectedUserPath(historyPath);
            if (historyPath.length > 0) {
                setUserPosition(historyPath[historyPath.length - 1]);
            }
        } catch (err) {
            console.error('Error fetching user history', err);
        }
    };

    const generateSosPath = () => {
        if (guardianPosition && userPosition) {
            setSosRoute({ start: guardianPosition, end: userPosition });
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden font-jakarta">
            <style>{`
                .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
                .leaflet-container { background: #020617 !important; }
                .glass-panel { background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); }
                .sos-card { background: linear-gradient(135deg, #be123c 0%, #9f1239 100%); }
                @keyframes dash-move {
                    from { stroke-dashoffset: 20; }
                    to { stroke-dashoffset: 0; }
                }
                .animate-sos-line {
                    animation: dash-move 2s linear infinite;
                }
            `}</style>
            
            <Header />

            <div className="flex flex-1 pt-16 overflow-hidden">
                {/* Sidebar - Control Panel */}
                <div className="w-96 bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl z-20">
                    <div className="p-8 border-b border-slate-800">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-600/20 rounded-xl border border-blue-500/30">
                                    <ShieldCheck className="text-blue-500" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black tracking-tight uppercase">Guardian Panel</h2>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Surveillance</p>
                                </div>
                            </div>
                            <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400">
                                <MoreVertical size={20} />
                            </button>
                        </div>

                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Tracking</p>
                                <p className="text-xl font-black text-white">{protégés.length}</p>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">SOS Alerts</p>
                                <p className="text-xl font-black text-rose-500">{sosAlerts.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* Session Notification */}
                        {activeTrackingSesssion && (
                            <div className="bg-orange-600/10 border border-orange-500/30 p-5 rounded-2xl animate-pulse">
                                <div className="flex items-center gap-3 mb-3">
                                    <Zap className="text-orange-500" size={18} />
                                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Ongoing Session</span>
                                </div>
                                <p className="text-sm font-bold text-white mb-1">{activeTrackingSesssion.userName} is traveling</p>
                                <p className="text-[10px] text-slate-400 font-medium truncate">From: {activeTrackingSesssion.src?.name || 'Current'}</p>
                                <p className="text-[10px] text-slate-400 font-medium truncate">To: {activeTrackingSesssion.dest?.name || 'Destination'}</p>
                            </div>
                        )}

                        <div>
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Activity size={14} /> My Proteges
                            </h3>
                            {protégés.length > 0 ? (
                                <div className="space-y-3">
                                    {protégés.map((p, i) => (
                                        <button 
                                            key={i} 
                                            onClick={() => handleUserSelect(p.user.client_id)}
                                            className={`w-full p-5 rounded-3xl flex items-center gap-4 transition-all ${
                                                selectedUserId === p.user.client_id 
                                                ? 'bg-blue-600/10 border-2 border-blue-600 shadow-lg shadow-blue-600/10' 
                                                : 'bg-slate-800/30 hover:bg-slate-800 border-2 border-transparent'
                                            }`}
                                        >
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${selectedUserId === p.user.client_id ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                                                <User size={24} />
                                            </div>
                                            <div className="text-left flex-1 min-w-0">
                                                <p className={`font-black text-xs uppercase tracking-tight truncate ${selectedUserId === p.user.client_id ? 'text-blue-500' : 'text-white'}`}>{p.user.name}</p>
                                                <p className="text-[10px] font-bold text-slate-500 mt-0.5">{p.user.phone}</p>
                                            </div>
                                            {selectedUserId === p.user.client_id && <Navigation size={14} className="text-blue-500 animate-pulse" />}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center p-10 bg-slate-800/20 rounded-[2.5rem] border-2 border-dashed border-slate-800">
                                    <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">No active protection</p>
                                </div>
                            )}
                        </div>

                        {/* Recent History / Log */}
                        <div>
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Clock size={14} /> Security Log
                            </h3>
                            <div className="space-y-4">
                                {sosAlerts.slice(-3).reverse().map((alert, idx) => (
                                    <div key={idx} className="flex gap-4 p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
                                        <div className="w-2 h-2 mt-1.5 rounded-full bg-rose-500 shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold text-rose-500 uppercase mb-1">SOS Alert Triggered</p>
                                            <p className="text-[11px] font-medium text-slate-300 leading-snug truncate">{alert.userName} needs immediate assistance</p>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex gap-4 p-4 bg-slate-800/30 border border-slate-700/30 rounded-2xl">
                                    <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 shrink-0"></div>
                                    <div>
                                        <p className="text-[10px] font-bold text-blue-500 uppercase mb-1">System Healthy</p>
                                        <p className="text-[11px] font-medium text-slate-500">Live grid monitoring active</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 border-t border-slate-800">
                        <button className="w-full bg-slate-900 border border-slate-700 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95">
                            <PhoneCall size={16} className="text-slate-400" /> Professional Support
                        </button>
                    </div>
                </div>

                {/* Main Content - Map Grid */}
                <div className="flex-1 relative bg-slate-950">
                    <MapContainer 
                        center={[23.1765, 75.7849]} 
                        zoom={13} 
                        className="h-full w-full"
                        zoomControl={false}
                    >
                        <TileLayer 
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
                            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                        />

                        {/* Smart Map Centering & Zooming */}
                        <AutoFitBounds pos1={guardianPosition} pos2={userPosition} />
                        
                        {/* Guardian (Tracker) Marker */}
                        {guardianPosition && (
                            <Marker position={guardianPosition} icon={L.divIcon({
                                className: 'guardian-marker',
                                html: `<div class="w-10 h-10 bg-orange-600 rounded-full border-4 border-white shadow-2xl flex items-center justify-center text-white">
                                        <div class="absolute inset-0 bg-orange-600 rounded-full animate-pulse opacity-20"></div>
                                        <div class="relative z-10 font-bold text-[18px]">🛡️</div>
                                       </div>`,
                                iconSize: [40, 40],
                                iconAnchor: [20, 20]
                            })}>
                                <Popup className="dark-popup">
                                    <div className="p-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Tracker Status</p>
                                        <p className="text-sm font-black text-slate-800">You (Guardian)</p>
                                    </div>
                                </Popup>
                            </Marker>
                        )}

                        {/* Protégé (Tracked) Marker */}
                        {userPosition && (
                            <>
                                <Marker position={userPosition} icon={L.divIcon({
                                    className: 'user-marker',
                                    html: `<div class="w-12 h-12 bg-blue-600 rounded-2xl border-4 border-white shadow-2xl flex items-center justify-center text-white scale-110">
                                            <div class="absolute inset-0 bg-blue-600 rounded-2xl animate-ping opacity-20"></div>
                                            <div class="relative z-10 font-bold text-[22px]">🚶</div>
                                           </div>`,
                                    iconSize: [48, 48],
                                    iconAnchor: [24, 24]
                                })}>
                                    <Popup className="dark-popup">
                                        <div className="p-3">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Currently Tracking</p>
                                            <p className="text-sm font-black text-slate-800">{protégés.find(p => p.user.client_id === selectedUserId)?.user.name}</p>
                                        </div>
                                    </Popup>
                                </Marker>
                                {/* Refined Path Styling */}
                                <Polyline 
                                    positions={selectedUserPath} 
                                    color="#2563eb" 
                                    weight={6} 
                                    opacity={0.6}
                                />
                                <Polyline 
                                    positions={selectedUserPath} 
                                    color="#60a5fa" 
                                    weight={2} 
                                    opacity={1}
                                />
                            </>
                        )}

                        {/* Planned Pilgrimage Route (S-D) */}
                        {activeTrackingSesssion && activeTrackingSesssion.userId === selectedUserId && !sosRoute && (
                            <RoutingMachine 
                                start={[activeTrackingSesssion.src.lat, activeTrackingSesssion.src.lng]} 
                                end={[activeTrackingSesssion.dest.lat, activeTrackingSesssion.dest.lng]}
                                color="#f59e0b"
                            />
                        )}

                        {/* Permanent SOS Rescue Connection (Tracker to Tracked) */}
                        {sosRoute && (
                            <>
                                <Polyline 
                                    positions={[sosRoute.start, sosRoute.end]} 
                                    color="#f43f5e" 
                                    weight={8} 
                                    opacity={0.3} 
                                    dashArray="1, 15"
                                />
                                <Polyline 
                                    positions={[sosRoute.start, sosRoute.end]} 
                                    color="#f43f5e" 
                                    weight={3} 
                                    opacity={1}
                                    dashArray="10, 10"
                                    className="animate-sos-line"
                                />
                            </>
                        )}

                        {sosAlerts.map((alert, idx) => (
                            <Marker key={idx} position={[alert.lat, alert.lng]} icon={L.divIcon({
                                className: 'sos-marker',
                                html: `<div class="w-12 h-12 bg-rose-600 rounded-2xl shadow-2xl flex items-center justify-center text-white animate-bounce border-2 border-white">
                                        <div class="absolute inset-0 bg-rose-600 rounded-2xl animate-ping opacity-40"></div>
                                        <div class="relative z-10">🚨</div>
                                       </div>`,
                                iconSize: [48, 48],
                                iconAnchor: [24, 24]
                            })}>
                                <Popup className="sos-popup">
                                    <div className="text-center p-2 min-w-[200px]">
                                        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <AlertTriangle size={24} />
                                        </div>
                                        <h4 className="text-lg font-black text-rose-600 uppercase tracking-tight">SOS TRIGGERED</h4>
                                        <p className="text-xs font-bold text-slate-500 mb-6">{alert.userName} is in danger!</p>
                                        <div className="grid grid-cols-1 gap-2">
                                            <button 
                                                onClick={generateSosPath}
                                                className="w-full bg-rose-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-colors"
                                            >
                                                Generate Rescue Route
                                            </button>
                                            <a 
                                                href={`tel:${protégés.find(p => p.user.client_id === alert.userId)?.user.phone}`}
                                                className="w-full bg-slate-100 text-slate-800 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                                            >
                                                <Phone size={14} /> Call Now
                                            </a>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>

                    {/* Dashboard Overlays */}
                    <div className="absolute top-8 left-8 right-8 flex justify-between items-start pointer-events-none z-[1000]">
                        <div className="glass-panel p-6 rounded-[2.5rem] shadow-2xl pointer-events-auto">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                                    <Activity size={24} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Network Speed</p>
                                    <p className="text-lg font-black text-white">4.2 <span className="text-[10px] font-bold text-blue-500">ms/pkt</span></p>
                                </div>
                            </div>
                        </div>

                        {sosAlerts.length > 0 && (
                            <div className="sos-card px-8 py-5 rounded-[2.5rem] shadow-2xl flex items-center gap-6 animate-glow pointer-events-auto">
                                <div className="bg-white/20 p-3 rounded-2xl">
                                    <AlertTriangle className="text-white" size={28} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-white uppercase tracking-wider italic">Critical Emergency</p>
                                    <p className="text-[11px] font-bold text-white/80">{sosAlerts[sosAlerts.length-1].userName} triggered SOS</p>
                                </div>
                                <button onClick={generateSosPath} className="bg-white text-rose-600 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-colors shadow-xl">
                                    Track Rescue
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Bottom Status Bar */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] pointer-events-auto">
                        <div className="glass-panel px-10 py-5 rounded-full flex items-center gap-8 shadow-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Guardian Live</span>
                            </div>
                            <div className="h-4 w-px bg-slate-800"></div>
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-2">
                                    {[1, 2].map(i => (
                                        <div key={i} className="w-7 h-7 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500">G{i}</div>
                                    ))}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Auth Sync</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                {`
                .dark-popup .leaflet-popup-content-wrapper { background: #ffffff !important; border-radius: 1.5rem; color: #020617; border: none; }
                .sos-popup .leaflet-popup-content-wrapper { background: #fff1f2 !important; border-radius: 2rem; border: 2px solid #e11d48; }
                .leaflet-popup-tip { display: none; }
                @keyframes glow { 0% { box-shadow: 0 0 10px #e11d48; transform: scale(1); } 100% { box-shadow: 0 0 30px #e11d48; transform: scale(1.02); } }
                .animate-glow { animation: glow 1s infinite alternate; }
                `}
            </style>
        </div>
    );
};

export default FollowMePage;
