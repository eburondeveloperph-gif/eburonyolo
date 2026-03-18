import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  ShieldCheck,
  ScanFace,
  Loader2,
  RefreshCw,
  UserCheck,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  Bell,
  Fingerprint,
  Video,
  Home,
  User,
} from 'lucide-react';

function Pill({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'green' | 'amber' | 'red' | 'blue' }) {
  const toneMap = {
    neutral: 'bg-zinc-800 text-zinc-200 border-zinc-700',
    green: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    red: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    blue: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  } as const;

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${toneMap[tone]}`}>
      {children}
    </span>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  variant = 'primary',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}) {
  const variants = {
    primary: 'bg-white text-black hover:bg-zinc-200',
    secondary: 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700',
    danger: 'bg-rose-500/15 text-rose-200 hover:bg-rose-500/25 border border-rose-500/30',
  } as const;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]}`}
    >
      {children}
    </button>
  );
}

function MetricCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-4 shadow-sm">
      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{label}</div>
      <div className="mt-2 text-lg font-semibold text-white">{value}</div>
      {hint ? <div className="mt-1 text-xs text-zinc-400">{hint}</div> : null}
    </div>
  );
}

export default function SemlexFaceShowcaseDemo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [statusText, setStatusText] = useState('Face detection is currently disabled.');
  const [busy, setBusy] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            completeScan();
            return 100;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  const completeScan = () => {
    setTimeout(() => {
      setIsScanning(false);
      setScanResult(Math.random() > 0.2 ? 'success' : 'error');
      setScanProgress(0);
    }, 500);
  };

  const startScan = () => {
    if (!cameraReady) {
      startCamera();
    }
    setIsScanning(true);
    setScanResult(null);
    setScanProgress(0);
  };

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }

  async function startCamera() {
    try {
      stopCamera();
      setBusy(true);
      setStatusText('Requesting camera access...');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 720 },
          height: { ideal: 1280 },
        },
        audio: false,
      });

      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error('Video element is unavailable.');

      video.srcObject = stream;
      await video.play();

      setCameraReady(true);
      setStatusText('Camera live.');
    } catch (error) {
      console.error(error);
      setStatusText('Camera access failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Eye className="w-8 h-8 text-cyan-400" />
          <div>
            <h1 className="text-xl font-bold tracking-wider text-white">Eburon</h1>
            <p className="text-[10px] uppercase tracking-widest text-cyan-500">ISEEYOU</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Bell className="w-6 h-6 text-slate-400" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-6 space-y-6 overflow-y-auto pb-24">
        {/* Hero */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 h-48 group">
          <img src="https://ais-dev-ejzbcgt7ruetckswv642si-56203130379.asia-east1.run.app/api/attachments/89d5cb25-1e75-490d-963a-baec89117a56/attachment.png" alt="Facial Recognition System" className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
          
          {/* Scanning Line Animation */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="w-full h-[2px] bg-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.5)] absolute top-0 animate-scan" />
          </div>

          {/* Biometric Frame Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative">
              <ScanFace className="w-16 h-16 text-cyan-400/30 animate-pulse" />
              <div className="absolute inset-0 border-2 border-cyan-500/20 rounded-full scale-150 animate-pulse" />
              <div className="absolute inset-0 border border-cyan-500/10 rounded-full scale-[2] animate-[ping_4s_linear_infinite]" />
            </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ScanFace className="w-4 h-4 text-cyan-400" />
                <h2 className="text-lg font-bold tracking-tight text-white">Verification Portal</h2>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-tighter">Biometric Active</span>
              </div>
            </div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Immigration Biometric System</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-3">
          <button 
            className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-900/40 to-slate-900 border border-blue-500/30 hover:border-blue-500/60 transition disabled:opacity-50"
            onClick={startScan}
            disabled={isScanning}
          >
            <Fingerprint className={`w-8 h-8 ${isScanning ? 'animate-pulse text-blue-300' : 'text-blue-400'}`} />
            <div className="flex flex-col items-start">
              <span className="font-semibold">{isScanning ? 'Analyzing Biometrics...' : 'Scan Identity'}</span>
              {isScanning && (
                <div className="w-32 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${scanProgress}%` }} />
                </div>
              )}
            </div>
          </button>
          <button className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-cyan-900/40 to-slate-900 border border-cyan-500/30 hover:border-cyan-500/60 transition" onClick={startCamera}>
            <Video className="w-8 h-8 text-cyan-400" />
            <span className="font-semibold">{cameraReady ? 'Surveillance Active' : 'Start Surveillance'}</span>
          </button>
          <button className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-900/40 to-slate-900 border border-amber-500/30 hover:border-amber-500/60 transition">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
            <span className="font-semibold">Report Suspicious Activity</span>
          </button>
        </div>

        {/* Camera View */}
        <div className={`rounded-xl overflow-hidden border border-slate-800 relative ${cameraReady ? 'block' : 'hidden'}`}>
          <div className="relative aspect-[9/16] w-full bg-slate-900">
            <video ref={videoRef} playsInline muted autoPlay className="h-full w-full object-cover" />
            
            {/* Scanning HUD Overlay */}
            {isScanning && (
              <div className="absolute inset-0 z-10">
                <div className="absolute inset-0 border-[40px] border-slate-950/60" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 border-2 border-cyan-500/50 rounded-3xl">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-400 rounded-br-lg" />
                  
                  {/* Moving Scan Line */}
                  <div className="absolute w-full h-1 bg-cyan-400/50 shadow-[0_0_15px_cyan] animate-scan" />
                  
                  {/* Data Points */}
                  <div className="absolute top-4 left-4 space-y-1">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-75" />
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-150" />
                  </div>
                </div>
                
                <div className="absolute bottom-12 left-0 w-full flex flex-col items-center gap-2">
                  <div className="px-4 py-1 bg-cyan-500/20 border border-cyan-500/40 rounded-full backdrop-blur-md">
                    <span className="text-xs font-bold text-cyan-400 tracking-widest uppercase animate-pulse">Analyzing Facial Mesh...</span>
                  </div>
                  <div className="text-[10px] text-cyan-400/60 font-mono">MATCH_PROBABILITY: {(scanProgress * 0.98).toFixed(2)}%</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scan Result Modal */}
        {scanResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
            <div className={`w-full max-w-sm rounded-3xl border p-8 text-center space-y-6 animate-in zoom-in duration-300 ${
              scanResult === 'success' ? 'bg-emerald-950/30 border-emerald-500/30' : 'bg-rose-950/30 border-rose-500/30'
            }`}>
              <div className="flex justify-center">
                {scanResult === 'success' ? (
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40">
                    <UserCheck className="w-10 h-10 text-emerald-400" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-rose-500/20 flex items-center justify-center border border-rose-500/40">
                    <XCircle className="w-10 h-10 text-rose-400" />
                  </div>
                )}
              </div>
              
              <div>
                <h2 className={`text-2xl font-bold ${scanResult === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {scanResult === 'success' ? 'Identity Verified' : 'Access Denied'}
                </h2>
                <p className="text-slate-400 mt-2 text-sm">
                  {scanResult === 'success' 
                    ? 'Biometric signature matches the database record for Agent E-001.' 
                    : 'No matching biometric signature found in the global database.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                  <p className="text-[10px] text-slate-500 uppercase">Confidence</p>
                  <p className="text-sm font-bold text-white">{scanResult === 'success' ? '98.4%' : '12.1%'}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                  <p className="text-[10px] text-slate-500 uppercase">Latency</p>
                  <p className="text-sm font-bold text-white">142ms</p>
                </div>
              </div>

              <button 
                onClick={() => setScanResult(null)}
                className={`w-full py-4 rounded-2xl font-bold transition active:scale-95 ${
                  scanResult === 'success' ? 'bg-emerald-500 text-white hover:bg-emerald-400' : 'bg-rose-500 text-white hover:bg-rose-400'
                }`}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Alerts */}
        <section>
          <h3 className="text-sm font-semibold text-slate-400 mb-3">Latest Security Alerts</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">
              <img src="https://picsum.photos/seed/intruder/200/150?grayscale" alt="Suspicious Intruder" className="w-full h-20 object-cover rounded-lg mb-2 opacity-80" referrerPolicy="no-referrer" />
              <p className="text-xs font-semibold">Suspicious Intruder</p>
              <p className="text-[10px] text-slate-500">14 mins ago</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">
              <img src="https://picsum.photos/seed/hacker/200/150?grayscale" alt="Hacker Warning" className="w-full h-20 object-cover rounded-lg mb-2 opacity-80" referrerPolicy="no-referrer" />
              <p className="text-xs font-semibold">Hacker Warning</p>
              <p className="text-[10px] text-slate-500">2 hours ago</p>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 w-full bg-slate-900 border-t border-slate-800 px-6 py-3 flex justify-between items-center">
        <button className="flex flex-col items-center gap-1 text-cyan-400">
          <Home className="w-6 h-6" />
          <span className="text-[10px]">Home</span>
        </button>
        <button 
          className={`flex flex-col items-center gap-1 ${isScanning ? 'text-cyan-400' : 'text-slate-500'}`}
          onClick={startScan}
        >
          <ScanFace className="w-6 h-6" />
          <span className="text-[10px]">Scan</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-500 relative">
          <Bell className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] flex items-center justify-center font-bold">2</span>
          <span className="text-[10px]">Alerts</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-500">
          <User className="w-6 h-6" />
          <span className="text-[10px]">Profile</span>
        </button>
      </nav>
    </div>
  );
}
