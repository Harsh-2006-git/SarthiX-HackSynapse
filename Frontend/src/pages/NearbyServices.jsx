import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Hospital,
  Hotel,
  Utensils,
  Shield,
  MapPin,
  Navigation,
  Search,
  Loader2,
  Milestone,
  LocateFixed,
  Compass,
  LayoutGrid,
  ChevronRight,
  Info,
  Map as MapIcon,
  Tent
} from 'lucide-react';
import axios from 'axios';
import Header from '../components/Header';
import { API_V1 } from '../config/api';

// Leaflet Fixes
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const getCategoryIcon = (category) => {
  const settings = {
    hospital: { color: '#ef4444', border: '#fee2e2' },
    hotel: { color: '#824df4', border: '#ede9fe' },
    restaurant: { color: '#ea580c', border: '#ffedd5' },
    police: { color: '#2563eb', border: '#dbeafe' },
    temple: { color: '#db2777', border: '#fce7f3' }
  };

  const iconShapes = {
    hospital: '<path d="M19 14c1.66 0 3-1.34 3-3s-1.34-3-3-3H5c-1.66 0-3 1.34-3 3s1.34 3 3 3"/><path d="M17 14V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v10"/><path d="M5 22v-4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/><path d="M12 7v4"/><path d="M10 9h4"/>',
    hotel: '<path d="M2 22v-3a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3"/><path d="M19 17V11a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/><path d="M12 15V9"/><path d="M9 11v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"/>',
    restaurant: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
    police: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    temple: '<path d="m12 2 10 10-10 10L2 12Z"/><path d="m12 22 5-5"/><path d="m12 22-5-5"/><path d="m12 2 5 5"/><path d="m12 2-5 5"/>'
  };

  const s = settings[category] || { color: '#ea580c', border: '#fff7ed' };

  return L.divIcon({
    className: 'custom-icon',
    html: `<div class="marker-container" style="background:${s.color}; border: 3px solid white; box-shadow: 0 12px 30px -5px ${s.color}50;"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${iconShapes[category] || ''}</svg></div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -21]
  });
};

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => { if (center[0] !== 0) map.flyTo(center, zoom, { duration: 1.5 }); }, [center, zoom, map]);
  return null;
}

const NearbyServices = () => {
  const [userLocation, setUserLocation] = useState([0, 0]);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const query = new URLSearchParams(window.location.search);
  const [category, setCategory] = useState(query.get('category') || 'temple');
  const [radius, setRadius] = useState(20000);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [mapZoom, setMapZoom] = useState(14);

  const categories = useMemo(() => [
    { id: 'temple', name: 'Mandir', icon: <Milestone size={24} />, color: 'bg-rose-500', text: 'text-rose-600', bg: 'bg-rose-50' },
    { id: 'restaurant', name: 'Food', icon: <Utensils size={24} />, color: 'bg-orange-500', text: 'text-orange-600', bg: 'bg-orange-50' },
    { id: 'hospital', name: 'Medical', icon: <Hospital size={24} />, color: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50' },
    { id: 'police', name: 'Police', icon: <Shield size={24} />, color: 'bg-blue-600', text: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'hotel', name: 'Stay', icon: <Tent size={24} />, color: 'bg-purple-600', text: 'text-purple-600', bg: 'bg-purple-50' },
  ], []);

  const currentCategoryName = categories.find(c => c.id === category)?.name || 'Entities';

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        () => setUserLocation([23.1765, 75.7885])
      );
    }
  }, []);

  useEffect(() => { if (userLocation[0] !== 0) fetchPlaces(); }, [category, radius, userLocation]);

  const fetchPlaces = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_V1}/nearby`, { params: { category, lat: userLocation[0], lng: userLocation[1], radius } });
      setPlaces(response.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleDirections = (p) => window.open(`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`, '_blank');

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-orange-50 to-red-50 text-slate-800 overflow-hidden relative">
      <Header />

      <div className="flex-grow flex h-[calc(100vh-80px)] mt-[80px]">
        {/* PREMIUM SIDEBAR MATCHING HOME THEME */}
        <aside className="w-[340px] md:w-[400px] bg-white/90 backdrop-blur-3xl border-r border-orange-100 flex flex-col z-20 shadow-2xl overflow-hidden">
          <div className="p-8 pb-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200 shrink-0 border border-white/20">
                <Compass className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tighter leading-none text-slate-900 italic uppercase bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Explorer</h1>
                <p className="text-[10px] font-black text-black uppercase tracking-widest mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-black animate-pulse"></span>
                  Finding Nearby {currentCategoryName}s
                </p>
              </div>
            </div>

            <div className="py-6 space-y-10">
              <div className="space-y-4">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Universal Search</p>
                <div className="grid grid-cols-5 gap-3">
                  {categories.map((cat) => (
                    <div key={cat.id} className="relative group/tip">
                      <button
                        onClick={() => setCategory(cat.id)}
                        className={`w-full aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 relative overflow-hidden ${category === cat.id ? `${cat.color} text-white shadow-xl scale-110 z-10` : 'bg-white text-slate-400 hover:bg-orange-50 hover:shadow-md hover:text-orange-600 border border-orange-100'
                          }`}
                      >
                        {cat.icon}
                      </button>
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-2xl opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                        {cat.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between ml-1">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Range Scanner</p>
                  <span className="text-[12px] font-black text-orange-600 bg-orange-100 px-3 py-1 rounded-full border border-orange-200">{radius >= 1000 ? `${(radius / 1000).toFixed(0)} km` : `${radius} m`}</span>
                </div>
                <div className="flex p-1.5 bg-orange-50/50 rounded-2xl border border-orange-100">
                  {[1000, 2000, 5000, 20000].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRadius(r)}
                      className={`flex-1 py-2.5 text-[10px] font-black rounded-xl transition-all ${radius === r ? 'bg-white text-orange-600 shadow-lg' : 'text-slate-400 hover:text-orange-600'
                        }`}
                    >
                      {r >= 10000 ? `${r / 1000}k` : `${r / 1000}km`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* LIST AREA */}
          <div className="flex-grow overflow-y-auto bg-slate-50/30 custom-scrollbar border-t border-orange-100">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full py-20 opacity-60">
                <Loader2 className="animate-spin text-orange-600 mb-4" size={48} />
                <span className="text-[11px] font-black tracking-[0.3em] uppercase text-orange-900/50">Broadcasting...</span>
              </div>
            ) : places.length === 0 ? (
              <div className="text-center py-24 opacity-20">
                <MapPin size={72} className="mx-auto mb-4 text-orange-200" />
                <p className="text-xs uppercase font-black tracking-widest text-orange-400">Horizon Empty</p>
              </div>
            ) : (
              <div className="p-8 space-y-8">
                <p className="px-1 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                  Latest Discoveries <span>{places.length} found</span>
                </p>
                {places.map((place, idx) => (
                  <div
                    key={idx}
                    onClick={() => { setSelectedPlace(place); setMapZoom(17); }}
                    className={`group relative p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer ${selectedPlace?.name === place.name ? 'bg-white border-orange-200 scale-[1.02] shadow-[0_30px_60px_-15px_rgba(234,88,12,0.15)] z-10' : 'bg-transparent border-transparent hover:bg-white hover:shadow-xl hover:shadow-orange-200/20'
                      }`}
                  >
                    <div className="flex justify-between items-start relative z-10">
                      <div className="min-w-0 pr-4">
                        <h3 className={`font-black text-[15px] leading-tight uppercase tracking-tight truncate mb-2 ${selectedPlace?.name === place.name ? 'text-orange-600' : 'text-slate-800'}`}>{place.name}</h3>
                        <p className={`text-[11px] font-bold line-clamp-1 mb-5 leading-none text-slate-400`}>{place.address}</p>
                      </div>
                      <div className={`px-4 py-2 rounded-[14px] text-[11px] font-black uppercase tracking-tight shrink-0 flex items-center gap-1 ${selectedPlace?.name === place.name ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-xl' : 'bg-orange-100 text-orange-600'}`}>
                        {place.distance >= 1000 ? `${(place.distance / 1000).toFixed(1)} km` : `${Math.round(place.distance)} m`}
                      </div>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); handleDirections(place); }}
                      className={`w-full h-12 rounded-[1.25rem] text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all relative z-10 shadow-sm ${selectedPlace?.name === place.name ? 'bg-slate-900 text-white hover:bg-orange-600' : 'bg-white border border-orange-100 text-slate-500 hover:text-orange-600 hover:border-orange-600'
                        }`}
                    >
                      Route Map <Navigation size={16} fill="currentColor" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* FULLSCREEN LIGHT MAP */}
        <main className="flex-grow relative z-10">
          <MapContainer
            center={userLocation[0] !== 0 ? userLocation : [23.1765, 75.7885]}
            zoom={mapZoom}
            zoomControl={false}
            style={{ height: '100%', width: '100%' }}
          >
            <ChangeView center={selectedPlace ? [selectedPlace.lat, selectedPlace.lng] : userLocation[0] !== 0 ? userLocation : [23.1765, 75.7885]} zoom={mapZoom} />
            <TileLayer
              attribution='&copy; CARTO'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            <ZoomControl position="bottomright" />

            {userLocation[0] !== 0 && (
              <Marker position={userLocation} icon={L.divIcon({ className: 'user-marker', html: `<div class="pulse"></div><div class="dot shadow-2xl"></div>`, iconSize: [44, 44] })}>
                <Popup>Your Source</Popup>
              </Marker>
            )}

            {places.map((place, idx) => (
              <Marker key={idx} position={[place.lat, place.lng]} icon={getCategoryIcon(place.category)} eventHandlers={{ click: () => setSelectedPlace(place) }}>
                <Popup className="home-theme-popup">
                  <div className="p-8 text-slate-800 min-w-[300px]">
                    <div className="flex items-center gap-5 mb-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl ${categories.find(c => c.id === place.category)?.color}`}>
                        {categories.find(c => c.id === place.category)?.icon}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[11px] text-slate-400 mb-2 leading-none">{place.category}</p>
                        <h4 className="font-black text-xl uppercase italic tracking-tighter leading-none">{place.name}</h4>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 mb-8 text-slate-500">
                      <MapPin size={16} className="mt-0.5 shrink-0 text-orange-600" />
                      <p className="text-[13px] font-bold leading-tight">{place.address}</p>
                    </div>
                    <button onClick={() => handleDirections(place)} className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white text-[12px] py-5 rounded-[1.25rem] font-black uppercase tracking-[0.2em] hover:shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3">Initiate Nav <ChevronRight size={18} /></button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* FLOATING ACTION CLUSTER */}
          <div className="absolute top-8 right-8 z-[1000] flex flex-col gap-4">
            <button onClick={() => { setSelectedPlace(null); setMapZoom(14); }} className="w-18 h-18 bg-white text-orange-600 rounded-[2rem] shadow-2xl flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all active:scale-90 group border border-orange-100 p-4">
              <LocateFixed size={32} className="group-hover:scale-110 transition-transform" />
            </button>
            <button onClick={() => navigate('/')} className="w-18 h-18 bg-slate-900 text-white rounded-[2rem] shadow-2xl flex items-center justify-center hover:bg-orange-600 transition-all active:scale-90 border-4 border-white p-4">
              <LayoutGrid size={32} />
            </button>
          </div>
        </main>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .marker-container {
          width: 42px; height: 42px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .marker-container:hover { transform: scale(1.1) translateY(-5px); z-index: 1000; }
        
        .user-marker { display: flex; align-items: center; justify-content: center; position: relative; }
        .user-marker .dot { width: 16px; height: 16px; background: #6366f1; border: 4px solid white; border-radius: 50%; z-index: 2; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4); }
        .user-marker .pulse { width: 50px; height: 50px; background: rgba(99, 102, 241, 0.2); border-radius: 50%; position: absolute; animation: user-pulse 3s infinite; }
        @keyframes user-pulse { 0% { scale: 0.5; opacity: 1; } 100% { scale: 2.5; opacity: 0; } }
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #ffedd5; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #fed7aa; }

        .home-theme-popup .leaflet-popup-content-wrapper { border-radius: 3rem; padding: 0; overflow: hidden; background: white; border: 1px solid #ffedd5; box-shadow: 0 50px 100px -20px rgba(234, 88, 12, 0.2); }
        .home-theme-popup .leaflet-popup-content { margin: 0; }
        .home-theme-popup .leaflet-popup-tip { background: white; }
        .leaflet-container { background: #fff7ed; font-family: inherit; }
      `}} />
    </div>
  );
};

export default NearbyServices;
