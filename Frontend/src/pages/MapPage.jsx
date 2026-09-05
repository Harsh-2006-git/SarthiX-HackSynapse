import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MapPin, Compass, Search, LocateFixed, Layers, Info, Sparkles, TrendingUp, Anchor, Trash2 } from 'lucide-react';

// Full Temple Data from HTML
const temples = [
    {
        name: "Mahakaleshwar Temple",
        lat: 23.1827,
        lng: 75.7681,
        description: "One of the 12 Jyotirlingas, dedicated to Lord Shiva. Famous for its Bhasma Aarti.",
        significance: "Most sacred temple in Ujjain, attracts millions of devotees annually",
        density: "high",
        deity: "Lord Shiva",
        bestTime: "Early morning for Bhasma Aarti",
    },
    {
        name: "Kal Bhairav Temple",
        lat: 23.1765,
        lng: 75.7849,
        description: "Dedicated to Kal Bhairav, the guardian deity of Ujjain.",
        significance: "Unique temple where liquor is offered as prasad to the deity",
        density: "medium",
        deity: "Kal Bhairav",
        bestTime: "Tuesday and Sunday",
    },
    {
        name: "Harsiddhi Temple",
        lat: 23.1694,
        lng: 75.7878,
        description: "One of the 51 Shakti Peethas, dedicated to Goddess Harsiddhi.",
        significance: "Ancient temple with rich history and spiritual significance",
        density: "medium",
        deity: "Goddess Harsiddhi",
        bestTime: "Navratri festivals",
    },
    {
        name: "Chintaman Ganesh Temple",
        lat: 23.1958,
        lng: 75.7714,
        description: "Famous Ganesh temple believed to fulfill wishes of devotees.",
        significance: "One of the most visited Ganesh temples in Madhya Pradesh",
        density: "high",
        deity: "Lord Ganesha",
        bestTime: "Wednesday and Ganesh Chaturthi",
    },
    {
        name: "Mangalnath Temple",
        lat: 23.1653,
        lng: 75.7542,
        description: "Birthplace of Mars (Mangal) according to Hindu mythology.",
        significance: "Remedial temple for Mars-related astrological problems",
        density: "low",
        deity: "Lord Shiva",
        bestTime: "Tuesday early morning",
    },
    {
        name: "Sandipani Ashram",
        lat: 23.1917,
        lng: 75.7833,
        description: "Where Lord Krishna and Balaram received education from Guru Sandipani.",
        significance: "Sacred educational site with historical importance",
        density: "low",
        deity: "N/A",
        bestTime: "Daytime hours",
    },
    {
        name: "Kshipra Ghat",
        lat: 23.1789,
        lng: 75.7719,
        description: "Sacred bathing ghat on the Shipra River.",
        significance: "Site of Kumbh Mela and important for ritual bathing",
        density: "high",
        deity: "N/A",
        bestTime: "Sunrise for holy dip",
    },
    {
        name: "Gadkalika Temple",
        lat: 23.1703,
        lng: 75.7892,
        description: "Ancient temple dedicated to Goddess Kalika.",
        significance: "Important Shakti temple with architectural beauty",
        density: "medium",
        deity: "Goddess Kalika",
        bestTime: "Friday and Navratri",
    },
];

const densityAreas = [
    {
        name: "Mahakaleshwar Temple Area",
        bounds: [[23.18, 75.765], [23.185, 75.771]],
        color: "rgba(255, 0, 0, 0.6)",
        density: "high",
        info: "Temple complex area - Very high crowd density",
    },
    {
        name: "Main Market Area",
        bounds: [[23.178, 75.778], [23.182, 75.782]],
        color: "rgba(255, 0, 0, 0.6)",
        density: "high",
        info: "Commercial center - Heavy traffic",
    },
    {
        name: "Railway Station Area",
        bounds: [[23.185, 75.785], [23.19, 75.79]],
        color: "rgba(255, 0, 0, 0.6)",
        density: "high",
        info: "Transport hub - High density",
    },
];

const MapPage = () => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const routingControlRef = useRef(null);
    const [userLocation, setUserLocation] = useState(null);
    const [statusMessage, setStatusMessage] = useState("Configure your journey starting point to begin.");
    const [routeSummary, setRouteSummary] = useState(null);
    const [densityVisible, setDensityVisible] = useState(false);
    const densityOverlaysRef = useRef([]);
    const [startInput, setStartInput] = useState("");
    const [destInput, setDestInput] = useState("");
    const [destLocation, setDestLocation] = useState(null);

    useEffect(() => {
        const initialCenter = [23.1765, 75.7849];
        const map = L.map(mapRef.current, { zoomControl: false }).setView(initialCenter, 13);
        mapInstance.current = map;

        L.control.zoom({ position: 'topright' }).addTo(map);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(map);

        // Custom Icons
        const templeIcon = L.icon({
            iconUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTUiIGZpbGw9IiNmZjdhMDAiIHN0cm9rZT0iI2ZmNTcwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjx0ZXh0IHg9IjE2IiB5PSIyMSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxNiIgZmlsbD0id2hpdGUiPvCfj5s8L3RleHQ+Cjwvc3ZnPg==",
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -16],
        });

        // Add Markers
        temples.forEach((temple, index) => {
            const marker = L.marker([temple.lat, temple.lng], { icon: templeIcon }).addTo(map);
            marker.bindPopup(`
                <div class="custom-popup p-2">
                    <h3 class="font-bold text-orange-600 uppercase text-[10px] mb-1">${temple.name}</h3>
                    <p class="text-[9px] text-gray-500 mb-2 leading-tight">${temple.description}</p>
                    <button class="w-full bg-slate-900 text-white py-1.5 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-orange-600 transition-colors" onclick="window.showRoute(${index})">Visualize Journey</button>
                </div>
            `);
        });

        window.showRoute = (index) => showRouteToTemple(index);

        // Density Circles/Rects
        densityAreas.forEach(area => {
            const rectangle = L.rectangle(area.bounds, {
                color: area.color,
                weight: 1,
                opacity: 0.8,
                fillColor: area.color,
                fillOpacity: 0.3,
            });
            densityOverlaysRef.current.push(rectangle);
        });

        return () => {
            if (mapInstance.current) mapInstance.current.remove();
            delete window.showRoute;
        };
    }, []);

    const setManualPosition = (lat, lng, name) => {
        if (!mapInstance.current) return;

        if (window.userMarker) mapInstance.current.removeLayer(window.userMarker);

        const userIcon = L.icon({
            iconUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTUiIGZpbGw9IiNmZjdhMDAiIHN0cm9rZT0iI2ZmNTcwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjMiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==",
            iconSize: [24, 24],
            iconAnchor: [12, 12],
        });

        window.userMarker = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(mapInstance.current);
        window.userMarker.bindPopup(`<div class="font-black text-[9px] uppercase tracking-widest text-orange-600">Start:</div><div class="text-[11px] font-bold">${name}</div>`).openPopup();
        mapInstance.current.setView([lat, lng], 14);
        setUserLocation({ lat, lng, name });
        setStartInput(name);
        setStatusMessage(`Starting from: ${name}`);
        setRouteSummary(null);
    };

    const setDestPosition = (lat, lng, name) => {
        if (!mapInstance.current) return;

        if (window.destMarker) mapInstance.current.removeLayer(window.destMarker);

        const destIcon = L.icon({
            iconUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTUiIGZpbGw9IiMwZmE0ZDYiIHN0cm9rZT0iIzAyOGRhZCIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjMiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==",
            iconSize: [24, 24],
            iconAnchor: [12, 12],
        });

        window.destMarker = L.marker([lat, lng], { icon: destIcon, zIndexOffset: 1000 }).addTo(mapInstance.current);
        window.destMarker.bindPopup(`<div class="font-black text-[9px] uppercase tracking-widest text-blue-600">Destination:</div><div class="text-[11px] font-bold">${name}</div>`).openPopup();
        mapInstance.current.setView([lat, lng], 14);
        setDestLocation({ lat, lng, name });
        setDestInput(name);
        setStatusMessage(`Destination set: ${name}`);
        setRouteSummary(null);
    };

    const showRouteToTemple = (index) => {
        if (!mapInstance.current) {
            setStatusMessage("⚠️ Map is initializing, please try again in a moment.");
            return;
        }

        if (!userLocation && !window.userMarker) {
            setStatusMessage("⚠️ Please set your starting location first.");
            const target = document.getElementById('location-intelligence');
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        const currentPos = userLocation || { lat: window.userMarker.getLatLng().lat, lng: window.userMarker.getLatLng().lng };
        const temple = temples[index];

        calculateRoute(currentPos, temple);
    };

    const showCustomRoute = () => {
        if (!userLocation || !destLocation) {
            setStatusMessage("⚠️ Please set both start and destination points.");
            return;
        }
        calculateRoute(userLocation, destLocation);
    };

    const calculateRoute = (start, end) => {
        if (routingControlRef.current) {
            mapInstance.current.removeControl(routingControlRef.current);
        }

        routingControlRef.current = L.Routing.control({
            waypoints: [L.latLng(start.lat, start.lng), L.latLng(end.lat, end.lng)],
            lineOptions: { styles: [{ color: '#f97316', opacity: 0.9, weight: 6 }] },
            fitSelectedRoutes: true,
            show: true,
            collapsible: true,
            createMarker: () => null
        }).on('routesfound', function (e) {
            const routes = e.routes;
            const summary = routes[0].summary;
            setRouteSummary({
                distance: (summary.totalDistance / 1000).toFixed(1),
                time: Math.round(summary.totalTime / 60),
                temple: end.name ? end : { name: "Custom Destination", density: "N/A" }
            });
        }).addTo(mapInstance.current);

        setStatusMessage(`🕊 Journey path calculated.`);
        document.getElementById('main-map-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const toggleDensity = () => {
        const next = !densityVisible;
        setDensityVisible(next);
        densityOverlaysRef.current.forEach(overlay => {
            if (next) overlay.addTo(mapInstance.current);
            else overlay.remove();
        });
    };

    const handleSearch = async (type) => {
        const query = type === 'start' ? startInput : destInput;
        if (!query) return;
        setStatusMessage(`Searching for ${type}...`);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data.length > 0) {
                if (type === 'start') {
                    setManualPosition(parseFloat(data[0].lat), parseFloat(data[0].lon), data[0].display_name);
                } else {
                    setDestPosition(parseFloat(data[0].lat), parseFloat(data[0].lon), data[0].display_name);
                }
            } else {
                setStatusMessage("Location not found.");
            }
        } catch (err) {
            setStatusMessage("Service error.");
        }
    };

    const detectLocation = () => {
        if (navigator.geolocation) {
            setStatusMessage("Locating...");
            navigator.geolocation.getCurrentPosition(
                (pos) => setManualPosition(pos.coords.latitude, pos.coords.longitude, "Your Current Location"),
                () => setStatusMessage("GPS access denied."),
                { enableHighAccuracy: true }
            );
        }
    };

    return (
        <div className="min-h-screen bg-[#fcfcfc] flex flex-col font-jakarta overflow-x-hidden">
            <style>{`
                .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
                .leaflet-popup-content-wrapper { border-radius: 1rem !important; padding: 0.2rem; border: 1px solid #f3f4f6; }
                
                /* NICE STYLED COOL ROUTING BOX */
                .leaflet-routing-container { 
                    background: rgba(255, 255, 255, 0.9) !important; 
                    backdrop-filter: blur(10px);
                    border-radius: 1.5rem !important; 
                    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1) !important;
                    padding: 20px !important;
                    max-height: 400px !important;
                    overflow-y: auto !important;
                    font-size: 11px !important;
                    font-weight: 800 !important;
                    border: 1px solid rgba(255, 255, 255, 0.5) !important;
                    width: 320px !important;
                    color: #1e293b !important;
                }
                .leaflet-routing-alt { margin: 0 !important; padding: 0 !important; border: none !important; }
                .leaflet-routing-alt h2 { font-size: 12px !important; color: #f97316 !important; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 15px !important; border-bottom: 2px solid #f9731633; padding-bottom: 8px; }
                .leaflet-routing-alt table { width: 100% !important; }
                .leaflet-routing-alt tr:hover { background: rgba(249, 115, 22, 0.05); }
                .leaflet-routing-icon { filter: hue-rotate(150deg) saturate(3); }

                @media (max-width: 768px) {
                    .leaflet-routing-container { width: calc(100vw - 40px) !important; max-height: 200px !important; margin: 10px !important; }
                }
            `}</style>

            <Header />

            {/* Premium Hero Section */}
            <div className="pt-24 md:pt-32 pb-8 md:pb-12 px-4 md:px-6 text-center bg-white border-b border-gray-100 flex-shrink-0">
                <div className="max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-600 mb-3 animate-fade-in-up">
                        <MapPin size={12} />
                        <span className="text-[9px] font-black uppercase tracking-wider text-orange-600">Divine Pathfinding</span>
                    </div>
                    <h1 className="text-2xl md:text-5xl font-black mb-3 leading-tight text-slate-900 tracking-tight">
                        Sacred <span className="text-orange-600">Ujjain Routes</span>
                    </h1>
                    <p className="text-xs md:text-sm text-slate-500 max-w-2xl mx-auto mb-2 leading-relaxed font-bold uppercase tracking-widest opacity-80">
                        Real-time navigation for the spiritual seeker
                    </p>
                </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent w-full"></div>

            {/* LOCATION SELECTOR TOP (GPS & Search) */}
            <div id="location-intelligence" className="w-full max-w-[1400px] mx-auto px-4 md:px-12 lg:px-24 pt-8 pb-4">
                <div className="bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-lg border border-gray-100 flex flex-col gap-6 items-center justify-center">

                    <div className="flex flex-col lg:flex-row w-full gap-6 items-center lg:items-end">
                        {/* Start Point */}
                        <div className="w-full lg:flex-1 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">Starting Point</label>
                            <div className="relative flex flex-col md:flex-row gap-2">
                                <div className="relative flex-1">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400" size={18} />
                                    <input
                                        value={startInput}
                                        onChange={(e) => setStartInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch('start')}
                                        type="text"
                                        placeholder="Where are you now?"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-orange-500 focus:bg-white transition-all font-bold text-xs outline-none"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleSearch('start')} className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-lg">
                                        Set Start
                                    </button>
                                    <button onClick={detectLocation} className="p-4 bg-orange-50 text-orange-600 border border-orange-100 rounded-2xl hover:bg-orange-100 transition-all active:scale-95 shadow-sm shrink-0">
                                        <LocateFixed size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="hidden lg:block h-12 w-px bg-slate-200 self-end mb-4"></div>

                        {/* Destination */}
                        <div className="w-full lg:flex-1 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">Destination</label>
                            <div className="relative flex flex-col md:flex-row gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                                    <input
                                        value={destInput}
                                        onChange={(e) => setDestInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch('dest')}
                                        type="text"
                                        placeholder="Where do you want to go?"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white transition-all font-bold text-xs outline-none"
                                    />
                                </div>
                                <button onClick={() => handleSearch('dest')} className="px-6 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-lg hover:shadow-blue-500/20">
                                    Set Destination
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-slate-100"></div>

                    <button
                        onClick={showCustomRoute}
                        disabled={!userLocation || !destLocation}
                        className={`w-full max-w-sm flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl active:scale-95 ${(!userLocation || !destLocation) ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:shadow-orange-500/30'}`}
                    >
                        Visualize custom journey
                        <Sparkles size={16} />
                    </button>

                </div>
            </div>

            {/* MAIN MAP AREA - GRID LAYOUT */}
            <div id="main-map-container" className="w-full max-w-[1400px] mx-auto px-4 md:px-12 lg:px-24 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* SIDEBAR FOR DESKTOP (Moved above map in mobile) */}
                    <div className="lg:col-span-3 order-2 lg:order-1 flex flex-col gap-6">

                        {/* Regional Gateways */}
                        <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-gray-100">
                            <h3 className="text-sm font-black mb-4 text-slate-800 flex items-center gap-3 uppercase tracking-widest">
                                <TrendingUp className="text-orange-600" size={16} />
                                Gateways
                            </h3>
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { name: "Indore", code: "IDR", color: "blue", coords: [22.7196, 75.8577] },
                                    { name: "Bhopal", code: "BPL", color: "green", coords: [23.2599, 77.4126] },
                                    { name: "Gwalior", code: "GWL", color: "purple", coords: [26.2298, 78.1712] },
                                    { name: "Ujjain Sta.", code: "UJN", color: "orange", coords: [23.1755, 75.7895] }
                                ].map((site) => (
                                    <button key={site.name} onClick={() => setManualPosition(site.coords[0], site.coords[1], site.name)} className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-orange-500 hover:bg-white hover:shadow-md transition-all group">
                                        <span className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-700 font-black text-[10px] shrink-0">{site.code}</span>
                                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter group-hover:text-orange-600">{site.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Map Utilities */}
                        <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-gray-100 flex flex-col gap-3">
                            <button onClick={toggleDensity} className={`flex items-center justify-between p-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${densityVisible ? 'bg-orange-600 text-white' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                                {densityVisible ? "Hide Crowd" : "Crowd Layer"}
                                <Layers size={14} />
                            </button>
                            <button onClick={() => { if (routingControlRef.current) mapInstance.current.removeControl(routingControlRef.current); setStatusMessage("Routes cleared."); }} className="flex items-center justify-between p-4 bg-rose-50 text-rose-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center justify-between">
                                Reset Map
                                <Trash2 size={14} />
                            </button>
                        </div>

                    </div>

                    {/* IMMERSIVE MAP CONTAINER */}
                    <div className="lg:col-span-9 order-1 lg:order-2 bg-white p-2 md:p-3 rounded-[1.5rem] md:rounded-[3rem] shadow-2xl border border-gray-100 ring-4 ring-slate-50">
                        <div ref={mapRef} className="w-full h-[450px] md:h-[650px] rounded-[1.25rem] md:rounded-[2.5rem] z-0 overflow-hidden shadow-inner" />

                        {/* THE REAL-TIME SUMMARY DASHBOARD */}
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                            <div className="bg-slate-900 rounded-[1.25rem] p-4 flex flex-col items-center justify-center border border-white/10 shadow-xl overflow-hidden relative">
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-orange-500 mb-1">Distance</span>
                                <span className="text-xl md:text-2xl font-black text-white">{routeSummary ? `${routeSummary.distance} KM` : '--'}</span>
                                <div className="absolute -bottom-2 -right-2 text-white/5 font-black text-4xl">KM</div>
                            </div>
                            <div className="bg-slate-900 rounded-[1.25rem] p-4 flex flex-col items-center justify-center border border-white/10 shadow-xl overflow-hidden relative">
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-orange-500 mb-1">Est. Time</span>
                                <span className="text-xl md:text-2xl font-black text-white">{routeSummary ? `${routeSummary.time} Min` : '--'}</span>
                                <div className="absolute -bottom-2 -right-2 text-white/5 font-black text-4xl">MIN</div>
                            </div>
                            <div className="bg-slate-900 rounded-[1.25rem] p-4 flex flex-col items-center justify-center border border-white/10 shadow-xl overflow-hidden relative">
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-orange-500 mb-1">Crowd Density</span>
                                <span className={`text-sm md:text-lg font-black uppercase tracking-widest ${routeSummary?.temple?.density === 'high' ? 'text-red-500' : 'text-green-500'}`}>
                                    {routeSummary ? routeSummary.temple.density : '--'}
                                </span>
                                <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${routeSummary?.temple?.density === 'high' ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-green-500 shadow-[0_0_10px_green]'} animate-pulse`}></div>
                            </div>
                            <div className="bg-slate-900 rounded-[1.25rem] p-4 flex flex-col items-center justify-center border border-white/10 shadow-xl overflow-hidden relative">
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-orange-500 mb-1">Traffic Flow</span>
                                <span className="text-sm md:text-lg font-black uppercase tracking-widest text-white">
                                    {routeSummary ? (routeSummary.temple.density === 'high' ? 'Heavy' : 'Smooth') : '--'}
                                </span>
                                <div className="absolute -bottom-2 -right-2 text-white/5 font-black text-4xl italic">AI</div>
                            </div>
                        </div>

                        {/* Status Message */}
                        <div className="mt-4 p-4 md:p-5 bg-orange-600 rounded-xl md:rounded-[1.5rem] flex items-center gap-3 text-white text-[10px] md:text-xs font-black uppercase tracking-widest shadow-xl overflow-hidden">
                            <div className="w-6 h-6 rounded-lg bg-white text-orange-600 flex items-center justify-center shrink-0"><Info size={12} /></div>
                            <span className="truncate">{statusMessage}</span>
                        </div>
                    </div>

                </div>
            </div>

            {/* Temple Directory Selection */}
            <div className="max-w-[1400px] mx-auto px-4 md:px-12 lg:px-24 mb-16 md:mb-24">
                <div className="bg-white p-6 md:p-12 rounded-[2.5rem] md:rounded-[4rem] shadow-xl border border-gray-100 relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-xl md:text-3xl font-black mb-6 md:mb-10 text-slate-900 flex items-center gap-5 uppercase tracking-tighter">
                            <span className="w-12 h-12 md:w-16 md:h-16 bg-orange-600 text-white rounded-2xl md:rounded-3xl flex items-center justify-center text-2xl shadow-xl shadow-orange-600/30">🔱</span>
                            Temple Directory
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {temples.map((temple, idx) => (
                                <button key={temple.name} onClick={() => showRouteToTemple(idx)} className="group flex items-center justify-between p-5 rounded-3xl border-2 border-slate-50 bg-white hover:border-orange-500 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300">
                                    <div className="flex flex-col text-left">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{temple.deity}</span>
                                        <span className="text-xs font-black text-slate-800 uppercase tracking-tight group-hover:text-orange-600">{temple.name}</span>
                                    </div>
                                    <div className={`w-2.5 h-2.5 rounded-full ${temple.density === 'high' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : temple.density === 'medium' ? 'bg-orange-500' : 'bg-green-500'} animate-pulse`}></div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sacred Journey Guide Cards */}
            <div className="max-w-[1400px] mx-auto px-4 md:px-12 lg:px-24 pb-16 md:pb-24">
                <div className="text-center mb-16">
                    <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.4em] mb-3 block">Ujjain Protocol</span>
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight uppercase tracking-tight">Divine <span className="text-orange-600">Journey Guide</span></h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {temples.map((temple, idx) => (
                        <div key={`card-${temple.name}`} className="group bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-slate-50 hover:border-orange-500 transition-all duration-500 overflow-hidden relative">
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/5 rounded-full blur-[60px] group-hover:bg-orange-500/10 transition-all duration-500"></div>

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-2xl shadow-xl group-hover:bg-orange-600 group-hover:rotate-12 transition-all duration-500">🔱</div>
                                    <div className={`px-4 py-2 rounded-full border text-[9px] font-black uppercase tracking-widest ${temple.density === 'high' ? 'bg-red-50 text-red-600 border-red-100' : temple.density === 'medium' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                        {temple.density} Density
                                    </div>
                                </div>

                                <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight group-hover:text-orange-600 transition-colors">{temple.name}</h3>
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{temple.deity}</span>
                                </div>

                                <div className="bg-slate-50 p-6 rounded-[1.5rem] mb-6 min-h-[100px] group-hover:bg-orange-50/50 transition-colors">
                                    <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Divine Essence</span>
                                    <p className="text-[11px] text-slate-600 font-bold leading-relaxed">{temple.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="p-4 bg-white border border-slate-50 rounded-2xl shadow-sm">
                                        <span className="block text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Ritual</span>
                                        <p className="text-[11px] font-black text-slate-800">{temple.bestTime}</p>
                                    </div>
                                    <div className="p-4 bg-white border border-slate-50 rounded-2xl shadow-sm">
                                        <span className="block text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</span>
                                        <p className="text-[11px] font-black text-slate-800 truncate">{temple.significance.split(',')[0]}</p>
                                    </div>
                                </div>

                                <button onClick={() => showRouteToTemple(idx)} className="w-full mt-auto py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl group-hover:bg-orange-600 transition-all active:scale-95">
                                    Visualize path
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default MapPage;
