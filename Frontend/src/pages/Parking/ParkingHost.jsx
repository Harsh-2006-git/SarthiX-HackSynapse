import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
    MapPin,
    Car,
    Bike,
    Truck,
    IndianRupee,
    Camera,
    CheckCircle2,
    Loader2,
    Navigation,
    Sparkles,
    LandPlot
} from "lucide-react";
import axios from "axios";
import { API_V1 } from "../../config/api";

const BACKEND_URL = API_V1;

const ParkingHost = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState([]);
    const [success, setSuccess] = useState(false);
    const [locLoading, setLocLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        parkingType: "Car",
        totalSlots: 1,
        pricePerHour: "",
        address: "",
        latitude: "23.1765",
        longitude: "75.7849",
    });

    const handleImageChange = (e) => setImages(Array.from(e.target.files));

    const detectLocation = () => {
        if (navigator.geolocation) {
            setLocLoading(true);
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const { latitude, longitude } = pos.coords;

                try {
                    // Live Reverse Geocoding for Address
                    const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const address = res.data.display_name || "Detected Location";

                    setFormData(prev => ({
                        ...prev,
                        latitude: latitude.toString(),
                        longitude: longitude.toString(),
                        address: address
                    }));
                } catch (err) {
                    setFormData(prev => ({
                        ...prev,
                        latitude: latitude.toString(),
                        longitude: longitude.toString()
                    }));
                } finally {
                    setLocLoading(false);
                }
            }, () => setLocLoading(false));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            images.forEach(img => data.append("images", img));

            await axios.post(`${BACKEND_URL}/parking`, data, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
            });

            setSuccess(true);
            setTimeout(() => navigate("/parking"), 2000);
        } catch (error) {
            alert("Error listing parking spot.");
        } finally {
            setLoading(false);
        }
    };

    if (success) return (
        <div className="min-h-screen flex items-center justify-center bg-white font-sans">
            <div className="text-center">
                <div className="w-20 h-20 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-xl">
                    <CheckCircle2 size={40} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Spot Listed Successfully!</h2>
                <p className="text-slate-400 font-bold uppercase text-[10px] mt-2">Redirecting to marketplace...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Header />

            {/* Hero Section */}
            <div className="pt-32 pb-16 bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                        <LandPlot size={14} /> Passive Income
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter mb-4">
                        Become a <span className="text-orange-600">Parking Partner</span>
                    </h1>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-xl mx-auto">
                        Turn your empty space into a profitable asset in minutes.
                    </p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-16">
                <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-100 space-y-8">
                    <div className="mb-4">
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Spot Information</h2>
                        <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Details about your parking space</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Title</label>
                            <input required type="text" placeholder="e.g. My Secure Garage" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-orange-500 outline-none font-bold text-sm transition-all" />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Vehicle Type</label>
                                <select value={formData.parkingType} onChange={e => setFormData({ ...formData, parkingType: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-orange-500 outline-none font-bold text-sm appearance-none">
                                    <option value="Car">Car</option>
                                    <option value="Bike">Bike</option>
                                    <option value="Truck">Truck</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Rate (₹/hr)</label>
                                <input required type="number" placeholder="50" value={formData.pricePerHour} onChange={e => setFormData({ ...formData, pricePerHour: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-orange-500 outline-none font-bold text-sm" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Address / Location</label>
                            <div className="space-y-4">
                                <div className="relative">
                                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-500" size={18} />
                                    <input required type="text" placeholder="Full address here..." value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-orange-500 outline-none font-bold text-sm" />
                                </div>
                                <button type="button" onClick={detectLocation} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center justify-center gap-2">
                                    {locLoading ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
                                    {locLoading ? "Fetching Location..." : "Fetch GPS & Address"}
                                </button>
                                {formData.latitude !== "23.1765" && (
                                    <div className="flex justify-center gap-6 text-[8px] font-black text-gray-400 uppercase">
                                        <span>LAT: {formData.latitude}</span>
                                        <span>LNG: {formData.longitude}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Photos</label>
                            <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition-all cursor-pointer">
                                <input type="file" multiple onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                <Camera size={24} className="mx-auto text-slate-400 mb-2" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{images.length > 0 ? `${images.length} files selected` : 'Upload space images'}</span>
                            </div>
                        </div>
                    </div>

                    <button disabled={loading} type="submit" className="w-full py-5 bg-orange-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:bg-slate-900 transition-all active:scale-95 flex items-center justify-center gap-3">
                        {loading ? <Loader2 size={18} className="animate-spin" /> : "Start Earning Now"}
                    </button>
                </form>
            </div>
            <Footer />
        </div>
    );
};

export default ParkingHost;
