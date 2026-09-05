import React, { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
    Users,
    Map as MapIcon,
    Navigation,
    AlertTriangle,
    ShieldCheck,
    Zap,
    Clock,
    TrendingUp,
    Settings,
    RefreshCw,
    Info,
    MapPin,
    X,
    ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Constants & Data ---

const UJJAIN_CENTER = [23.18, 75.77];

const GHATS = [
    { id: 'mahakal', name: 'Mahakaleshwar Mandir', lat: 23.1827, lng: 75.7681, capacity: 5000 },
    { id: 'ramghat', name: 'Ram Ghat', lat: 23.1789, lng: 75.7719, capacity: 3000 },
    { id: 'kalbhairav', name: 'Kal Bhairav Ghat', lat: 23.1765, lng: 75.7849, capacity: 2000 },
    { id: 'shipra', name: 'Shipra River Ghats', lat: 23.1850, lng: 75.7600, capacity: 4000 },
];

// Define zones in a grid
const generateZones = () => {
    const zones = [];
    const startLat = 23.165;
    const endLat = 23.200;
    const startLng = 75.750;
    const endLng = 75.800;
    const step = 0.005;

    let id = 1;
    for (let lat = startLat; lat < endLat; lat += step) {
        for (let lng = startLng; lng < endLng; lng += step) {
            zones.push({
                zone_id: `zone_${id++}`,
                lat: lat + step / 2,
                lng: lng + step / 2,
                bounds: [[lat, lng], [lat + step, lng + step]],
                capacity: Math.floor(Math.random() * 1000) + 500,
                current_users: 0,
                density_level: 'LOW'
            });
        }
    }
    return zones;
};

const CrowdSimulation = () => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const routingControls = useRef([]);
    const zoneOverlaysRef = useRef({});
    const startMarkerRef = useRef(null);
    const endMarkerRef = useRef(null);

    const [zones, setZones] = useState(generateZones());
    const [userCount, setUserCount] = useState(1000);
    const [isPeak, setIsPeak] = useState(false);
    const [isEmergency, setIsEmergency] = useState(false);
    const [showVIP, setShowVIP] = useState(false);

    const [startPoint, setStartPoint] = useState(null);
    const [endPoint, setEndPoint] = useState(GHATS[0]);

    const [userRoutes, setUserRoutes] = useState([]);
    const [simulatedPilgrims, setSimulatedPilgrims] = useState([]);
    const [rerouteMessage, setRerouteMessage] = useState("");

    // --- Simulation Logic ---

    const updateZoneDensity = (currentZones, pilgrims) => {
        const updatedZones = currentZones.map(zone => {
            const count = pilgrims.filter(p =>
                p.lat >= zone.bounds[0][0] && p.lat <= zone.bounds[1][0] &&
                p.lng >= zone.bounds[0][1] && p.lng <= zone.bounds[1][1]
            ).length;

            const density = (count / zone.capacity) * 100 * (isPeak ? 1.5 : 1) * (isEmergency ? 2 : 1);
            let level = 'LOW';
            if (density > 90) level = 'CRITICAL';
            else if (density > 70) level = 'HIGH';
            else if (density > 40) level = 'MEDIUM';

            return { ...zone, current_users: count, density_level: level, density_val: density };
        });
        return updatedZones;
    };

    const initPilgrims = () => {
        const pilgrims = [];
        for (let i = 0; i < userCount; i++) {
            pilgrims.push({
                user_id: `p_${i}`,
                lat: 23.165 + Math.random() * 0.035,
                lng: 75.750 + Math.random() * 0.05,
                priority: Math.random() > 0.9 ? 'VIP' : (Math.random() > 0.7 ? 'ELDERLY' : 'GENERAL'),
                destination_ghat: GHATS[Math.floor(Math.random() * GHATS.length)].id,
                speed: 0.0001 + Math.random() * 0.0002
            });
        }
        return pilgrims;
    };

    useEffect(() => {
        const pilgrims = initPilgrims();
        setSimulatedPilgrims(pilgrims);
        setZones(prev => updateZoneDensity(prev, pilgrims));
    }, [userCount, isPeak, isEmergency]);

    // Movement simulation interval
    useEffect(() => {
        const interval = setInterval(() => {
            setSimulatedPilgrims(prev => {
                const next = prev.map(p => {
                    const dest = GHATS.find(g => g.id === p.destination_ghat);
                    const dLat = dest.lat - p.lat;
                    const dLng = dest.lng - p.lng;
                    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
                    if (dist < 0.001) return p;
                    return { ...p, lat: p.lat + (dLat / dist) * p.speed, lng: p.lng + (dLng / dist) * p.speed };
                });
                return next;
            });
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setZones(prev => updateZoneDensity(prev, simulatedPilgrims));
    }, [simulatedPilgrims]);

    // --- Map Visualization ---

    useEffect(() => {
        if (!window.L || !mapRef.current) return;

        const L = window.L;
        if (!mapInstance.current) {
            mapInstance.current = L.map(mapRef.current, { zoomControl: false }).setView(UJJAIN_CENTER, 14);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
            }).addTo(mapInstance.current);

            L.control.zoom({ position: 'topright' }).addTo(mapInstance.current);
        }

        // Update Zone Heatmap
        zones.forEach(zone => {
            const color = zone.density_level === 'CRITICAL' ? '#000000' :
                zone.density_level === 'HIGH' ? '#ef4444' :
                    zone.density_level === 'MEDIUM' ? '#eab308' : '#22c55e';

            if (zoneOverlaysRef.current[zone.zone_id]) {
                zoneOverlaysRef.current[zone.zone_id].setStyle({ fillColor: color, color: color });
            } else {
                const rect = L.rectangle(zone.bounds, {
                    color: color,
                    weight: 1,
                    opacity: 0.1,
                    fillColor: color,
                    fillOpacity: 0.1
                }).addTo(mapInstance.current);

                rect.bindTooltip(`Zone: ${zone.zone_id}<br>Density: ${zone.density_level}`, { sticky: true });
                zoneOverlaysRef.current[zone.zone_id] = rect;
            }
        });

        // Handle Ghat Markers
        GHATS.forEach(ghat => {
            const icon = L.divIcon({
                className: 'custom-ghat-icon',
                html: `<div class="w-8 h-8 bg-orange-600 rounded-full border-2 border-white flex items-center justify-center text-white shadow-lg">🔱</div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            });
            L.marker([ghat.lat, ghat.lng], { icon }).addTo(mapInstance.current)
                .bindPopup(`<b>${ghat.name}</b>`);
        });

    }, [zones]);

    const clearRoutes = () => {
        routingControls.current.forEach(ctrl => {
            try { mapInstance.current.removeControl(ctrl); } catch (e) { }
        });
        routingControls.current = [];
        setUserRoutes([]);
        setRerouteMessage("");
    };

    const generateFourRoutes = async (start, end) => {
        if (!window.L || !start || !end) return;
        const L = window.L;
        clearRoutes();

        // Update Markers for Start/End
        if (startMarkerRef.current) mapInstance.current.removeLayer(startMarkerRef.current);
        if (endMarkerRef.current) mapInstance.current.removeLayer(endMarkerRef.current);

        const startIcon = L.divIcon({
            className: 'marker-start',
            html: `<div class="w-6 h-6 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-xl">S</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
        const endIcon = L.divIcon({
            className: 'marker-end',
            html: `<div class="w-6 h-6 bg-rose-600 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-xl">E</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        startMarkerRef.current = L.marker([start.lat, start.lng], { icon: startIcon, zIndexOffset: 1000 }).addTo(mapInstance.current);
        endMarkerRef.current = L.marker([end.lat, end.lng], { icon: endIcon, zIndexOffset: 1000 }).addTo(mapInstance.current);

        const routeConfigs = [
            { name: 'Shortest', color: '#2563eb', difficulty: 'EASY', weight: 8 },
            { name: 'Medium', color: '#d97706', difficulty: 'MEDIUM', weight: 6 },
            { name: 'Difficult', color: '#16a34a', difficulty: 'HARD', weight: 4 },
            { name: 'Priority', color: '#9333ea', difficulty: 'EASY', weight: 10 },
        ];

        const results = [];

        for (let i = 0; i < 4; i++) {
            const config = routeConfigs[i];

            // Visual multi-route simulation via slight waypoint jitter
            const offset = i * 0.0003;
            const waypoints = [
                L.latLng(start.lat, start.lng),
                L.latLng(end.lat + offset, end.lng + offset)
            ];

            const ctrl = L.Routing.control({
                waypoints: waypoints,
                router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
                lineOptions: {
                    styles: [{ color: config.color, opacity: 0.7, weight: config.weight }]
                },
                fitSelectedRoutes: i === 0,
                show: false,
                addWaypoints: false,
                createMarker: () => null
            }).addTo(mapInstance.current);

            ctrl.on('routesfound', (e) => {
                const r = e.routes[0];
                const baseDist = r.summary.totalDistance / 1000;
                const baseTime = r.summary.totalTime / 60;

                const dist = baseDist * (1 + i * 0.05);
                const time = baseTime * (1 + i * 0.08);
                const avgDensity = Math.max(10, Math.min(95, 30 + (3 - i) * 20 + Math.random() * 10));
                const safety = 100 - (avgDensity * 0.8);

                const routeData = {
                    id: config.name,
                    distance_km: dist.toFixed(2),
                    estimated_time_min: Math.round(time),
                    avg_density: Math.round(avgDensity),
                    difficulty: config.difficulty,
                    safety_score: Math.round(safety),
                    color: config.color
                };

                results.push(routeData);
                if (results.length === 4) {
                    setUserRoutes(results);
                    checkSmartReroute(results);
                }
            });

            routingControls.current.push(ctrl);
        }
    };

    const checkSmartReroute = (routes) => {
        const priorityRoute = routes.find(r => r.id === 'Priority');
        if (priorityRoute && priorityRoute.avg_density > 70) {
            const bestAlt = routes.reduce((prev, curr) => (curr.avg_density < prev.avg_density ? curr : prev));
            setRerouteMessage(`⚠️ Congestion on Priority route. AI suggests taking the ${bestAlt.id} path.`);
        }
    };

    const handleMapClick = (e) => {
        const { lat, lng } = e.latlng;
        if (!startPoint) {
            setStartPoint({ lat, lng, name: `Custom Point (${lat.toFixed(3)})` });
        } else {
            setEndPoint({ lat, lng, name: `Custom Point (${lat.toFixed(3)})` });
        }
    };

    useEffect(() => {
        if (mapInstance.current) {
            mapInstance.current.on('click', handleMapClick);
        }
        return () => mapInstance.current?.off('click', handleMapClick);
    }, [startPoint, endPoint]);

    useEffect(() => {
        if (startPoint && endPoint) {
            generateFourRoutes(startPoint, endPoint);
        }
    }, [startPoint, endPoint]);

    return (
        <div className="min-h-screen bg-white text-slate-800 flex flex-col font-sans overflow-x-hidden">
            <style>{`
        .custom-ghat-icon { background: none; border: none; }
        .marker-start div, .marker-end div { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); }
        .suggested-route-glow { animation: pulse-glow 2s infinite; }
        @keyframes pulse-glow {
            0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.4); }
            70% { box-shadow: 0 0 0 15px rgba(249, 115, 22, 0); }
            100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

            <Header />

            <div className="flex-1 flex flex-col md:flex-row pt-20">
                {/* LIGHT THEME SIDEBAR */}
                <div className="w-full md:w-[400px] bg-white border-r border-slate-100 p-8 flex flex-col gap-8 overflow-y-auto max-h-screen">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                <MapIcon className="text-orange-600" size={24} />
                                Smart Routing
                            </h2>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-1">Simhastha Intelligence Engine</p>
                        </div>
                    </div>

                    {/* Start/End Selectors */}
                    <div className="flex flex-col gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Starting Location</label>
                            <div className="relative group">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 transition-transform group-hover:scale-110" size={18} />
                                <select
                                    value={startPoint?.id || ''}
                                    onChange={(e) => {
                                        const g = GHATS.find(x => x.id === e.target.value);
                                        setStartPoint(g);
                                    }}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none ring-offset-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer appearance-none"
                                >
                                    <option value="">{startPoint ? startPoint.name : 'Click map or select preset...'}</option>
                                    {GHATS.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Destination</label>
                            <div className="relative group">
                                <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-600 transition-transform group-hover:scale-110" size={18} />
                                <select
                                    value={endPoint?.id || ''}
                                    onChange={(e) => {
                                        const g = GHATS.find(x => x.id === e.target.value);
                                        setEndPoint(g);
                                    }}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none ring-offset-2 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all cursor-pointer appearance-none"
                                >
                                    <option value="">{endPoint ? endPoint.name : 'Click map or select preset...'}</option>
                                    {GHATS.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <button onClick={() => { setStartPoint(null); setEndPoint(null); clearRoutes(); }} className="mt-2 w-full py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 hover:text-slate-700 transition-all flex items-center justify-center gap-2">
                            <RefreshCw size={14} /> Clear Selection
                        </button>
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* Simulation Population */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Population</label>
                                <div className="text-2xl font-black text-slate-900">{userCount} <span className="text-xs text-slate-400">Virtuals</span></div>
                            </div>
                            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                                <Users size={20} />
                            </div>
                        </div>
                        <input
                            type="range" min="500" max="5000" step="500" value={userCount}
                            onChange={(e) => setUserCount(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-600"
                        />

                        <div className="grid grid-cols-1 gap-3">
                            <button
                                onClick={() => setIsPeak(!isPeak)}
                                className={`flex items-center justify-between p-4 rounded-2xl text-xs font-black transition-all border ${isPeak ? 'bg-orange-600 text-white border-orange-500 shadow-xl' : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-white'}`}
                            >
                                <span className="flex items-center gap-3"><Clock size={16} /> Peak Hour Analysis</span>
                                {isPeak && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                            </button>
                            <button
                                onClick={() => setIsEmergency(!isEmergency)}
                                className={`flex items-center justify-between p-4 rounded-2xl text-xs font-black transition-all border ${isEmergency ? 'bg-rose-600 text-white border-rose-500 shadow-xl shadow-rose-200' : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-white'}`}
                            >
                                <span className="flex items-center gap-3"><AlertTriangle size={16} /> Emergency Scenario</span>
                            </button>
                        </div>
                    </div>

                    {/* Density Key */}
                    <div className="mt-auto p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                        <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Live Traffic Intel</h3>
                        <div className="flex flex-col gap-4">
                            {[
                                { label: 'Minimal', color: 'bg-green-500', range: '0-40%' },
                                { label: 'Congested', color: 'bg-yellow-500', range: '40-70%' },
                                { label: 'Critical', color: 'bg-red-500', range: '70%+' }
                            ].map(item => (
                                <div key={item.label} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${item.color} shadow-sm`} />
                                        <span className="text-[11px] font-black text-slate-700">{item.label}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400">{item.range}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* IMMERSIVE LIGHT MAP */}
                <div className="flex-1 relative flex flex-col bg-slate-50">
                    {/* Top Integrated Widget */}
                    <div className="absolute top-8 left-8 right-8 z-[1000] flex flex-col md:flex-row gap-4">
                        <div className="bg-white/90 backdrop-blur-xl border border-slate-200 p-4 rounded-3xl shadow-2xl flex items-center justify-between gap-8 md:min-w-[400px]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                    <TrendingUp size={24} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Compute</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-black text-slate-900 italic">Simhastha-AI</span>
                                        <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded text-[10px] font-black uppercase tracking-tighter">Active</span>
                                    </div>
                                </div>
                            </div>
                            <div className="h-10 w-px bg-slate-200" />
                            <div className="flex flex-col pr-4">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Route Integrity</span>
                                <span className="text-lg font-black text-orange-600 text-right">{userRoutes.length > 0 ? '98.4%' : 'SCANNING'}</span>
                            </div>
                        </div>

                        <AnimatePresence>
                            {rerouteMessage && (
                                <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex-1">
                                    <div className="bg-white p-4 rounded-3xl shadow-2xl border-l-8 border-orange-500 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
                                                <Zap size={20} className="animate-bounce" />
                                            </div>
                                            <span className="text-xs font-black text-slate-800 leading-tight">
                                                {rerouteMessage}
                                            </span>
                                        </div>
                                        <X className="text-slate-300 hover:text-slate-600 cursor-pointer" size={20} onClick={() => setRerouteMessage("")} />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div ref={mapRef} className="flex-1 w-full" />

                    {/* ALL 4 ROUTES SIMULTANEOUS DISPLAY */}
                    <AnimatePresence>
                        {userRoutes.length > 0 && (
                            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute bottom-8 left-8 right-8 z-[1000]">
                                <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar justify-center">
                                    {userRoutes.map((route) => {
                                        const isSuggested = rerouteMessage && !rerouteMessage.includes(route.id) && route.avg_density < 60;
                                        return (
                                            <motion.div
                                                key={route.id}
                                                whileHover={{ scale: 1.02 }}
                                                className={`w-[280px] shrink-0 p-6 rounded-[2.5rem] bg-white border-2 shadow-2xl flex flex-col gap-4 relative overflow-hidden transition-all ${isSuggested ? 'border-orange-500 ring-4 ring-orange-500/10' : 'border-slate-100'}`}
                                            >
                                                {isSuggested && <div className="absolute top-0 right-0 bg-orange-600 text-white px-4 py-1.5 rounded-bl-2xl text-[9px] font-black uppercase tracking-widest">AI Choice</div>}

                                                <div className="flex justify-between items-center">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: route.color }}>{route.id}</span>
                                                        <h4 className="text-lg font-black text-slate-900">Optimization</h4>
                                                    </div>
                                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center" style={{ color: route.color }}>
                                                        <Navigation size={20} />
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase">Distance</span>
                                                        <span className="text-xl font-black text-slate-900">{route.distance_km} KM</span>
                                                    </div>
                                                    <div className="flex flex-col text-right">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase">Est. Time</span>
                                                        <span className="text-xl font-black text-slate-900">{route.estimated_time_min} Mins</span>
                                                    </div>
                                                </div>

                                                <div className="space-y-2 pt-2">
                                                    <div className="flex justify-between items-center px-1">
                                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Crowd Density</span>
                                                        <span className={`text-[10px] font-black uppercase ${route.avg_density > 70 ? 'text-rose-600' : 'text-green-600'}`}>{route.avg_density}% Load</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                        <motion.div initial={{ width: 0 }} animate={{ width: `${route.avg_density}%` }} className="h-full" style={{ backgroundColor: route.color }} />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Guide Helper */}
                    {!userRoutes.length && (
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 animate-bounce">
                            <Info size={18} className="text-orange-500" />
                            <span className="text-xs font-black uppercase tracking-widest">Select Start & End points to analyze paths</span>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default CrowdSimulation;
