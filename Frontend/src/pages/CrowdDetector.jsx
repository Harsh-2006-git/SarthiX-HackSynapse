import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { Camera, Video, LayoutDashboard, Activity, Upload, Play, XCircle, Loader2 } from 'lucide-react';
import { API_V1 } from '../config/api';

// TensorFlow.js imports
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

const CrowdDetector = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState('camera'); // 'camera' or 'video'
    const [isStreaming, setIsStreaming] = useState(false);
    const [status, setStatus] = useState({ camera_active: false, detection_mode: 'Model Loading...' });
    const [zones, setZones] = useState({ total: 0, zones: [] });
    const [isStarting, setIsStarting] = useState(false);
    
    // AI State
    const [model, setModel] = useState(null);
    const [isModelLoading, setIsModelLoading] = useState(true);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const requestRef = useRef(null);
    const isStreamingRef = useRef(false); // Use ref for the detection loop
    const fileInputRef = useRef(null);

    const BACKEND_URL = `${API_V1}/crowd`;

    // ── Load AI Model ────────────────────────────────────────────────────────────
    useEffect(() => {
        const loadModel = async () => {
            try {
                // Initialize TFJS and load COCO-SSD
                await tf.ready();
                const loadedModel = await cocoSsd.load({
                    base: 'mobilenet_v2' // Lightweight for mobile/browser
                });
                setModel(loadedModel);
                setIsModelLoading(false);
                setStatus(prev => ({ ...prev, detection_mode: 'AI Engine Ready' }));
                console.log('✅ AI Engine Loaded: COCO-SSD (MobileNetV2)');
            } catch (err) {
                console.error('Failed to load AI model:', err);
                setIsModelLoading(false);
                setStatus(prev => ({ ...prev, detection_mode: 'AI Load Failed' }));
            }
        };
        loadModel();
        
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            stopCameraStream();
        };
    }, []);

    // ── Detection Logic (Local Camera) ───────────────────────────────────────────
    const detectFrame = async () => {
        // Use the Ref for the loop check
        if (!videoRef.current || !model || !isStreamingRef.current) {
            console.log('AI Loop Terminated or Paused');
            return;
        }

        if (videoRef.current.readyState >= 2) { // HAVE_CURRENT_DATA or better
            const predictions = await model.detect(videoRef.current, 50, 0.25);
            
            // Increased sensitivity: Lowered confidence threshold to 0.25 
            const people = predictions.filter(p => p.class === 'person' && p.score > 0.25);
            
            processDetections(people);
            drawCanvas(people);
        }
        
        requestRef.current = requestAnimationFrame(detectFrame);
    };

    const processDetections = (people) => {
        const video = videoRef.current;
        if (!video) return;

        const w = video.videoWidth || 640;
        const h = video.videoHeight || 480;
        const rows = 3, cols = 3;
        const zone_counts = Array(rows).fill(0).map(() => Array(cols).fill(0));

        people.forEach(person => {
            const [bx, by, bw, bh] = person.bbox;
            const cx = bx + bw / 2;
            const cy = by + bh / 2;

            const col_idx = Math.min(Math.floor((cx / w) * cols), cols - 1);
            const row_idx = Math.min(Math.floor((cy / h) * rows), rows - 1);
            
            if (col_idx >= 0 && row_idx >= 0) {
                zone_counts[row_idx][col_idx]++;
            }
        });

        const newZones = [];
        let total = 0;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const zCount = zone_counts[r][c];
                total += zCount;
                const level = zCount < 2 ? "Low" : zCount < 5 ? "Medium" : "High";
                newZones.push({
                    id: `Z${r * cols + c + 1}`,
                    count: zCount,
                    level: level,
                    row: r,
                    col: c
                });
            }
        }

        setZones({ total, zones: newZones });
        setStatus(prev => ({ 
            ...prev, 
            total,
            detection_mode: 'Client-Side AI (TFJS)' 
        }));
    };

    const drawCanvas = (people) => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video) return;

        const ctx = canvas.getContext('2d');
        const { videoWidth: w, videoHeight: h } = video;
        
        // Ensure canvas matches video resolution
        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
        }

        ctx.clearRect(0, 0, w, h);

        const rows = 3, cols = 3;
        const cellW = w / cols;
        const cellH = h / rows;

        // Calculate zone counts for drawing
        const zone_counts = Array(rows).fill(0).map(() => Array(cols).fill(0));
        people.forEach(person => {
            const [bx, by, bw, bh] = person.bbox;
            const cx = bx + bw / 2;
            const cy = by + bh / 2;
            const col_idx = Math.min(Math.floor((cx / w) * cols), cols - 1);
            const row_idx = Math.min(Math.floor((cy / h) * rows), rows - 1);
            if (col_idx >= 0 && row_idx >= 0) zone_counts[row_idx][col_idx]++;
        });

        // 1. Draw 3x3 Grid and Zone Stats
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const zCount = zone_counts[r][c];
                const zId = r * cols + c + 1;
                const x = c * cellW;
                const y = r * cellH;

                // Density Tint (15% opacity overlay)
                if (zCount > 0) {
                    let fillColor = 'rgba(0, 160, 0, 0.15)'; // Low
                    if (zCount >= 5) fillColor = 'rgba(255, 0, 0, 0.2)'; // High/Critical
                    else if (zCount >= 2) fillColor = 'rgba(255, 165, 0, 0.18)'; // Medium
                    ctx.fillStyle = fillColor;
                    ctx.fillRect(x, y, cellW, cellH);
                }

                // Grid Lines
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, cellW, cellH);

                // Zone Label (e.g., Z1)
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.font = 'bold 12px Inter, sans-serif';
                ctx.fillText(`Z${zId}`, x + 8, y + 20);
            }
        }

        // 2. Draw Bounding Boxes (Minimalist Corners)
        people.forEach(person => {
            const [ox, oy, owidth, oheight] = person.bbox;
            
            // Inset the visual box slightly (5px) to make it feel more "locked on"
            const padding = 5;
            const x = ox + padding;
            const y = oy + padding;
            const width = owidth - padding * 2;
            const height = oheight - padding * 2;

            // Stylish Corner Brackets only (No full rectangle)
            ctx.strokeStyle = '#FF6B00';
            ctx.lineWidth = 3;
            const len = Math.min(width, height, 20); // Length of corners
            
            // Top Left
            ctx.beginPath(); ctx.moveTo(x, y + len); ctx.lineTo(x, y); ctx.lineTo(x + len, y); ctx.stroke();
            // Top Right
            ctx.beginPath(); ctx.moveTo(x + width - len, y); ctx.lineTo(x + width, y); ctx.lineTo(x + width, y + len); ctx.stroke();
            // Bottom Left
            ctx.beginPath(); ctx.moveTo(x, y + height - len); ctx.lineTo(x, y + height); ctx.lineTo(x + len, y + height); ctx.stroke();
            // Bottom Right
            ctx.beginPath(); ctx.moveTo(x + width - len, y + height); ctx.lineTo(x + width, y + height); ctx.lineTo(x + width, y + height - len); ctx.stroke();

            // Confidence Label (Compact & Inset)
            ctx.fillStyle = '#FF6B00';
            const label = `${Math.round(person.score * 100)}%`;
            ctx.font = 'bold 8px Inter, sans-serif';
            const textWidth = ctx.measureText(label).width;
            ctx.fillRect(x, y, textWidth + 8, 12); // Positioned inside the corner
            ctx.fillStyle = 'white';
            ctx.fillText(label, x + 4, y + 9);
        });

        // 3. HUD Stats Bar
        ctx.fillStyle = 'rgba(15, 15, 15, 0.85)';
        ctx.fillRect(0, 0, w, 40);
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 15px Inter, sans-serif';
        const total = people.length;
        const color = total < 3 ? '#22C55E' : total < 7 ? '#EAB308' : total < 12 ? '#F97316' : '#EF4444';
        
        ctx.fillText('PEOPLE:', 20, 26);
        ctx.fillStyle = color;
        ctx.fillText(total.toString(), 85, 26);
        
        ctx.fillStyle = 'white';
        ctx.fillText(' |  DENSITY:', 110, 26);
        ctx.fillStyle = color;
        const dLabel = total < 3 ? "LOW" : total < 7 ? "MEDIUM" : total < 12 ? "HIGH" : "CRITICAL";
        ctx.fillText(dLabel, 205, 26);
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillText(` |  AUTO-AI MODE: ACTIVE`, 280, 26);
    };

    // ── Interaction Handlers ────────────────────────────────────────────────────
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // stop any existing stream
        stopCameraStream();
        
        try {
            const url = URL.createObjectURL(file);
            if (videoRef.current) {
                setMode('video');
                setIsStreaming(true);
                isStreamingRef.current = true;
                
                videoRef.current.srcObject = null;
                videoRef.current.src = url;
                videoRef.current.loop = true; // Loop as requested
                
                videoRef.current.onplay = () => {
                    detectFrame();
                };
                
                await videoRef.current.play();
                setStatus({ camera_active: true, detection_mode: 'Local AI: File Analysis' });
            }
        } catch (err) {
            console.error('Local video load failed:', err);
            alert('Failed to load video file.');
        }
    };

    const stopCameraStream = () => {
        isStreamingRef.current = false;
        if (videoRef.current) {
            if (videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject;
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
            if (videoRef.current.src) {
                URL.revokeObjectURL(videoRef.current.src);
                videoRef.current.src = "";
            }
        }
    };

    const handleStartCamera = async () => {
        setIsStarting(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: 'environment', 
                    width: { ideal: 640 }, 
                    height: { ideal: 480 } 
                },
                audio: false
            });
            
            if (videoRef.current) {
                setMode('camera');
                videoRef.current.src = "";
                videoRef.current.srcObject = stream;
                videoRef.current.onplay = () => {
                    setIsStreaming(true);
                    isStreamingRef.current = true;
                    detectFrame();
                };
                await videoRef.current.play();
                setStatus({ camera_active: true, detection_mode: 'Local AI: Live Sensor' });
            }
        } catch (err) {
            console.error('Camera access denied:', err);
            alert('Camera access denied. Please enable permissions.');
        } finally {
            setIsStarting(false);
        }
    };

    const handleStopCamera = () => {
        stopCameraStream();
        setIsStreaming(false);
        isStreamingRef.current = false;
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        setZones({ total: 0, zones: [] });
        setStatus({ camera_active: false, detection_mode: 'Idle' });
    };

    const getLevelColor = (level) => {
        switch (level?.toLowerCase()) {
            case 'low': return 'text-green-500 bg-green-500/10';
            case 'medium': return 'text-yellow-500 bg-yellow-500/10';
            case 'high': return 'text-orange-500 bg-orange-500/10';
            case 'critical': return 'text-red-500 bg-red-500/10';
            default: return 'text-gray-400 bg-gray-400/10';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <Header />

            <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-3 md:mb-4">
                            Live Crowd Analytics
                        </h1>
                        <p className="text-sm md:text-base text-gray-600 max-w-xl mx-auto md:mx-0">
                            Real-time devotee flow monitoring using <strong>Client-Side Neural AI</strong>.
                            Privacy-first processing happens directly on your device.
                        </p>
                    </div>

                    <div className="flex bg-white p-1 md:p-1.5 rounded-xl md:rounded-2xl border border-gray-200 shadow-sm w-full md:w-auto">
                        <button
                            onClick={() => { setMode('camera'); handleStopCamera(); }}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-8 py-2 md:py-3 rounded-lg md:rounded-xl font-bold transition-all text-xs md:text-base ${mode === 'camera' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
                        >
                            <Camera size={18} /> <span className="hidden xs:inline">Live Camera</span><span className="xs:hidden">Live</span>
                        </button>
                        <button
                            onClick={() => { setMode('video'); handleStopCamera(); }}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-8 py-2 md:py-3 rounded-lg md:rounded-xl font-bold transition-all text-xs md:text-base ${mode === 'video' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
                        >
                            <Video size={18} /> <span className="hidden xs:inline">Video Upload</span><span className="xs:hidden">Upload</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4 md:space-y-6">
                        <div className="relative aspect-[4/5] md:aspect-video bg-black rounded-3xl md:rounded-[2rem] overflow-hidden border border-gray-200 shadow-2xl group">
                            {/* Live Video Element */}
                            <video
                                ref={videoRef}
                                className={`w-full h-full object-cover ${isStreaming ? 'block' : 'hidden'}`}
                                autoPlay
                                playsInline
                                muted
                                loop
                            />
                            
                            {/* Canvas Overlay for Detections */}
                            <canvas
                                ref={canvasRef}
                                className={`absolute inset-0 w-full h-full pointer-events-none ${isStreaming ? 'block' : 'hidden'}`}
                            />

                            {/* Offline/Placeholder States */}
                            {!isStreaming && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center bg-gray-50/95 backdrop-blur-sm">
                                    {isModelLoading ? (
                                        <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
                                            <div className="relative w-32 h-32 md:w-48 md:h-48 mx-auto mb-10">
                                                {/* Outer Pulsing Ring */}
                                                <div className="absolute inset-0 rounded-full border-4 border-orange-500/20 animate-ping"></div>
                                                {/* Rotating Neural Ring */}
                                                <div className="absolute inset-0 rounded-full border-t-4 border-orange-600 animate-spin transition-all duration-1000"></div>
                                                {/* Inner Core */}
                                                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-2xl shadow-orange-500/40">
                                                    <Activity className="w-10 h-10 md:w-16 md:h-16 text-white animate-pulse" />
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                <h3 className="text-xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter italic">
                                                    Downloading Neural AI Detector...
                                                </h3>
                                                <div className="px-8 flex flex-col gap-3">
                                                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-100">
                                                        <div className="h-full bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 w-[60%] animate-[progress_3s_ease-in-out_infinite] bg-[length:200%_100%]"></div>
                                                    </div>
                                                    <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                                                        Establishing local neural link. This download happens once and enables 100% private, on-device processing.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 md:w-24 md:h-24 mb-4 md:mb-6 rounded-[2rem] bg-orange-100 flex items-center justify-center border-2 border-orange-200 shadow-xl shadow-orange-500/10 active:scale-95 transition-transform">
                                                <Camera className="w-8 h-8 md:w-12 md:h-12 text-orange-600" />
                                            </div>
                                            <h3 className="text-2xl md:text-3xl font-black mb-6 text-slate-900 uppercase tracking-tighter">
                                                {mode === 'camera' ? 'Camera AI Ready' : 'Video Analysis Hub'}
                                            </h3>
                                            {mode === 'camera' ? (
                                                <button
                                                    onClick={handleStartCamera}
                                                    disabled={isStarting}
                                                    className="group relative px-8 md:px-12 py-4 md:py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] md:text-sm tracking-[0.2em] uppercase transition-all shadow-2xl shadow-slate-900/20 active:scale-95 overflow-hidden"
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                    <div className="relative flex items-center gap-3">
                                                        <Play size={18} fill="currentColor" /> {isStarting ? 'Synchronizing...' : 'Initialize Live Sensor'}
                                                    </div>
                                                </button>
                                            ) : (
                                                <div className="space-y-4">
                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        onChange={handleFileUpload}
                                                        className="hidden"
                                                        accept="video/*"
                                                    />
                                                    <button
                                                        onClick={() => fileInputRef.current.click()}
                                                        className="px-10 py-5 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-xl shadow-orange-500/20 flex items-center gap-3"
                                                    >
                                                        <Upload size={18} /> Select Footage For Analysis
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                <style>{`
                    @keyframes progress {
                        0% { background-position: 100% 0%; }
                        100% { background-position: -100% 0%; }
                    }
                `}</style>
 
                            {isStreaming && (
                                <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full border border-gray-200 shadow-sm">
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                                    <span className="text-[10px] font-black tracking-tighter uppercase text-gray-900">
                                        {mode === 'camera' ? 'Neural Link Active' : 'Local File Analysis'}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="bg-white border border-gray-200 rounded-3xl p-6 flex items-center justify-between shadow-sm">
                            <div className="flex gap-4">
                                {isStreaming && (
                                    <button
                                        onClick={handleStopCamera}
                                        className="flex items-center gap-2 px-4 md:px-6 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold text-xs md:text-sm hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        <XCircle size={16} /> Stop Sensor
                                    </button>
                                )}
                            </div>
                            <div className="text-right">
                                <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Total People Detected</span>
                                <h4 className="text-3xl font-black text-orange-600">{zones.total || 0}</h4>
                                <span className="text-[10px] text-gray-400 font-bold uppercase">{status.detection_mode}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white border border-gray-200 rounded-2xl md:rounded-[2rem] p-5 md:p-8 shadow-sm">
                            <h3 className="text-lg md:text-xl font-black mb-4 md:mb-6 flex items-center gap-2 text-gray-900">
                                <LayoutDashboard className="text-orange-500 w-5 h-5 md:w-6 md:h-6" /> Zone Breakdown
                            </h3>

                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {zones.zones && zones.zones.length > 0 ? zones.zones.map((zone) => (
                                    <div key={zone.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:border-orange-500/30 transition-colors">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-bold text-gray-500">Zone {zone.id}</span>
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${getLevelColor(zone.level)}`}>
                                                {zone.level}
                                            </span>
                                        </div>
                                        <div className="flex items-end justify-between">
                                            <h5 className="text-2xl font-black text-gray-800">{zone.count}</h5>
                                            <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-1000 ${zone.level?.toLowerCase() === 'low' ? 'bg-green-500' :
                                                        zone.level?.toLowerCase() === 'medium' ? 'bg-yellow-500' :
                                                            zone.level?.toLowerCase() === 'high' ? 'bg-orange-500' : 'bg-red-500'
                                                        }`}
                                                    style={{ width: `${Math.min(100, (zone.count / 20) * 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-12 text-gray-400">
                                        Initialize camera to see telemetry
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-2xl md:rounded-[2rem] p-5 md:p-8 shadow-sm">
                            <h3 className="text-base md:text-lg font-black mb-3 md:mb-4 flex items-center gap-2 text-gray-900">
                                <Activity className="text-orange-600 w-4 h-4 md:w-5 md:h-5" /> Local Intelligence
                            </h3>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 text-xs text-gray-600">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                    Model: COCO-SSD (MobileNetV2)
                                </li>
                                <li className="flex items-center gap-3 text-xs text-gray-600">
                                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                    Processing: 100% Local (Client GPU)
                                </li>
                                <li className="flex items-center gap-3 text-xs text-gray-600">
                                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                    Privacy: Video data never leaves device
                                </li>
                                <li className="flex items-center gap-3 text-xs text-gray-600">
                                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                    Hardware: WebGL Acceleration Active
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,165,0,0.2); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,165,0,0.5); }
            `}</style>
            <Footer />
        </div>
    );
};

export default CrowdDetector;

