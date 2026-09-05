import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useSocket } from "../context/SocketContext";

const ZoneRiskAlert = () => {
  const { zoneRiskAlerts } = useSocket();
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (zoneRiskAlerts?.length) setAlert(zoneRiskAlerts.at(-1));
  }, [zoneRiskAlerts]);

  if (!alert) return null;
  const critical = alert.level === "HIGH";
  return (
    <aside className={`fixed z-[100] right-4 top-24 w-[min(26rem,calc(100vw-2rem))] rounded-2xl border p-4 shadow-2xl ${critical ? "bg-rose-950 text-white border-rose-400" : "bg-amber-50 text-amber-950 border-amber-300"}`} role="alert">
      <div className="flex gap-3">
        <AlertTriangle className={critical ? "text-rose-300" : "text-amber-600"} />
        <div className="flex-1">
          <p className="text-xs font-black uppercase tracking-widest">{alert.level} zone-risk alert</p>
          <p className="mt-1 text-sm font-semibold">{alert.message}</p>
          <p className="mt-2 text-[11px] opacity-80">Planning estimate, not a reported crime incident. Risk score: {alert.risk_score}/100.</p>
        </div>
        <button onClick={() => setAlert(null)} aria-label="Dismiss zone-risk alert"><X size={18} /></button>
      </div>
    </aside>
  );
};

export default ZoneRiskAlert;
