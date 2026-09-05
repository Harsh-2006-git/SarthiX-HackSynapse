import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import { Phone, AlertTriangle, ShieldCheck, Map as MapIcon, History, UserPlus } from 'lucide-react';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to recenter map
const RecenterMap = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.setView(position, map.getZoom());
        }
    }, [position, map]);
    return null;
};

const TrackingPage = () => {
    const { sendLocation, triggerSOS, lastLocation, sosAlerts } = useSocket();
    const [myPosition, setMyPosition] = useState(null);
    const [path, setPath] = useState([]);
    const [isTracking, setIsTracking] = useState(false);
    const [guardians, setGuardians] = useState([]);
    const [newGuardianId, setNewGuardianId] = useState('');
    const [activeTab, setActiveTab] = useState('map'); // 'map', 'history', 'guardians'
    const [history, setHistory] = useState([]);

    const watchId = useRef(null);
    const lastEmitTime = useRef(0);
    const lastEmitPos = useRef(null);

    const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api/v1';

    useEffect(() => {
        fetchGuardians();
    }, []);

    const fetchGuardians = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/location/my-guardians`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGuardians(res.data);
        } catch (err) {
            console.error('Error fetching guardians', err);
        }
    };

    const addGuardian = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/location/guardian`, { guardianId: newGuardianId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewGuardianId('');
            fetchGuardians();
            alert('Guardian request sent!');
        } catch (err) {
            alert(err.response?.data?.message || 'Error adding guardian');
        }
    };

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));
            const res = await axios.get(`${API_URL}/location/history/${user.client_id || user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(res.data);
            setActiveTab('history');
        } catch (err) {
            console.error('Error fetching history', err);
        }
    };

    const startTracking = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setIsTracking(true);
        watchId.current = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                const newPos = [latitude, longitude];
                setMyPosition(newPos);
                setPath(prev => [...prev, newPos]);

                // Optimization: send every 5 seconds OR if distance > 10m
                const now = Date.now();
                const dist = lastEmitPos.current ? getDistance(lastEmitPos.current, newPos) : 999;

                if (now - lastEmitTime.current > 5000 || dist > 10) {
                    sendLocation(latitude, longitude);
                    lastEmitTime.current = now;
                    lastEmitPos.current = newPos;
                }
            },
            (err) => console.error(err),
            { enableHighAccuracy: true, distanceFilter: 5 }
        );
    };

    const stopTracking = () => {
        if (watchId.current !== null) {
            navigator.geolocation.clearWatch(watchId.current);
            watchId.current = null;
        }
        setIsTracking(false);
    };

    const handleSOS = () => {
        if (myPosition) {
            triggerSOS(myPosition[0], myPosition[1]);
            alert('SOS Alert sent to guardians and admin!');
        } else {
            alert('Wait for GPS to catch your location');
        }
    };

    function getDistance(p1, p2) {
        const R = 6371e3; // meters
        const φ1 = p1[0] * Math.PI/180;
        const φ2 = p2[0] * Math.PI/180;
        const Δφ = (p2[0]-p1[0]) * Math.PI/180;
        const Δλ = (p2[1]-p1[1]) * Math.PI/180;
        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white p-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                    Live Safety Tracker
                </h1>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setActiveTab('map')}
                        className={`p-2 rounded-lg ${activeTab === 'map' ? 'bg-orange-500' : 'bg-gray-800'}`}
                    >
                        <MapIcon size={20} />
                    </button>
                    <button 
                        onClick={fetchHistory}
                        className={`p-2 rounded-lg ${activeTab === 'history' ? 'bg-orange-500' : 'bg-gray-800'}`}
                    >
                        <History size={20} />
                    </button>
                    <button 
                        onClick={() => setActiveTab('guardians')}
                        className={`p-2 rounded-lg ${activeTab === 'guardians' ? 'bg-orange-500' : 'bg-gray-800'}`}
                    >
                        <ShieldCheck size={20} />
                    </button>
                </div>
            </div>

            {/* Main Section */}
            <div className="flex-1 rounded-2xl overflow-hidden glassmorphism relative">
                {activeTab === 'map' && (
                    <MapContainer center={[25.4484, 81.8837]} zoom={15} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        
                        {myPosition && (
                            <>
                                <Marker position={myPosition}>
                                    <Popup>You are here</Popup>
                                </Marker>
                                <Polyline positions={path} color="orange" weight={4} dashArray="5, 10" />
                                <RecenterMap position={myPosition} />
                            </>
                        )}

                        {sosAlerts.map((alert, idx) => (
                            <Marker key={idx} position={[alert.lat, alert.lng]} icon={new L.Icon({
                                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                                iconSize: [25, 41],
                                iconAnchor: [12, 41],
                            })}>
                                <Popup className="text-red-600 font-bold">
                                    SOS: {alert.userName} needs help!
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                )}

                {activeTab === 'history' && (
                    <div className="p-4 overflow-y-auto h-full bg-gray-800">
                        <h2 className="text-xl font-bold mb-4">Location History</h2>
                        <div className="space-y-2">
                            {history.length > 0 ? history.map((log, i) => (
                                <div key={i} className="p-3 bg-gray-700 rounded-lg flex justify-between">
                                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                                    <span className="text-sm text-gray-400">{log.lat.toFixed(5)}, {log.lng.toFixed(5)}</span>
                                </div>
                            )) : <p>No history found</p>}
                        </div>
                    </div>
                )}

                {activeTab === 'guardians' && (
                    <div className="p-4 overflow-y-auto h-full bg-gray-800">
                        <h2 className="text-xl font-bold mb-4">Manage Guardians</h2>
                        
                        <div className="flex gap-2 mb-6">
                            <input 
                                type="text" 
                                placeholder="Enter Guardian Client ID"
                                className="flex-1 bg-gray-700 p-2 rounded-lg border border-gray-600"
                                value={newGuardianId}
                                onChange={(e) => setNewGuardianId(e.target.value)}
                            />
                            <button 
                                onClick={addGuardian}
                                className="bg-orange-500 px-4 rounded-lg flex items-center gap-2"
                            >
                                <UserPlus size={18} /> Add
                            </button>
                        </div>

                        <div className="space-y-3">
                            {guardians.map((g, i) => (
                                <div key={i} className="p-4 bg-gray-700 rounded-xl flex items-center justify-between">
                                    <div>
                                        <p className="font-bold">{g.guardian.name}</p>
                                        <p className="text-xs text-gray-400">{g.guardian.phone}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {g.is_approved ? (
                                            <span className="text-green-400 text-xs px-2 py-1 bg-green-400/10 rounded-full">Approved</span>
                                        ) : (
                                            <span className="text-yellow-400 text-xs px-2 py-1 bg-yellow-400/10 rounded-full">Pending</span>
                                        )}
                                        <button className="p-2 bg-red-400/10 text-red-400 rounded-lg"><Phone size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Controls */}
            <div className="mt-4 flex gap-4">
                {isTracking ? (
                    <button 
                        onClick={stopTracking}
                        className="flex-1 bg-red-600/20 text-red-500 border border-red-500/30 py-4 rounded-2xl font-bold shadow-lg"
                    >
                        Stop Tracking
                    </button>
                ) : (
                    <button 
                        onClick={startTracking}
                        className="flex-1 bg-orange-600/20 text-orange-500 border border-orange-500/30 py-4 rounded-2xl font-bold shadow-lg"
                    >
                        Start Live Tracking
                    </button>
                )}
                
                <button 
                    onClick={handleSOS}
                    className="flex-1 bg-red-600 hover:bg-red-700 py-4 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-2 animate-pulse"
                >
                    <AlertTriangle size={24} /> TRIGGER SOS
                </button>
            </div>

            <style>
                {`
                .glassmorphism {
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .leaflet-container {
                    background: #1a1a1a;
                }
                `}
            </style>
        </div>
    );
};

export default TrackingPage;
