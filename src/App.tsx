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
  Cctv,
  Lock,
  ShieldAlert,
} from 'lucide-react';

function Pill({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'green' | 'amber' | 'red' | 'blue' | 'teal' }) {
  const toneMap = {
    neutral: 'bg-zinc-800 text-zinc-200 border-zinc-700',
    green: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    red: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    blue: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    teal: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
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

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 transition-all duration-300 hover:scale-110 ${active ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
    >
      <div className="relative">
        {icon}
        {active && <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-8 h-1 bg-cyan-500 rounded-full shadow-[0_0_15px_cyan]" />}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{label}</span>
    </button>
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
  const [matchedIdentity, setMatchedIdentity] = useState<{ name: string; photo: string } | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'home' | 'scan' | 'enroll' | 'alerts'>('home');
  const [enrollments, setEnrollments] = useState<{ id: string; name: string; photo: string; timestamp: number }[]>([]);
  const [enrollName, setEnrollName] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollSuccess, setEnrollSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('biometric_enrollments');
    if (saved) {
      try {
        setEnrollments(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load enrollments', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('biometric_enrollments', JSON.stringify(enrollments));
  }, [enrollments]);

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
    setIsScanning(false);
    // Simulate identification against enrollments
    const matched = enrollments.length > 0 && Math.random() > 0.3;
    if (matched) {
      const randomMatch = enrollments[Math.floor(Math.random() * enrollments.length)];
      setMatchedIdentity(randomMatch);
      setScanResult('success');
    } else {
      setScanResult('error');
    }
    setScanProgress(0);
    setBusy(false);
  };

  const startEnrollment = () => {
    if (!enrollName.trim()) return;
    setBusy(true);
    setIsEnrolling(true);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          const canvas = document.createElement('canvas');
          if (videoRef.current) {
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(videoRef.current, 0, 0);
            const photo = canvas.toDataURL('image/jpeg');
            const newEnrollment = {
              id: Math.random().toString(36).substr(2, 9),
              name: enrollName,
              photo,
              timestamp: Date.now(),
            };
            setEnrollments(prev => [...prev, newEnrollment]);
            setEnrollSuccess(true);
            setEnrollName('');
            setIsEnrolling(false);
            setBusy(false);
            setScanProgress(0);
          }
          return 100;
        }
        return prev + 5;
      });
    }, 100);
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
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-white/5 bg-slate-900/20 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <ShieldCheck className="w-7 h-7 text-cyan-400" />
          </div>
        </div>
        
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="relative">
            <Lock className="w-5 h-5 text-cyan-500/40" />
            <div className="absolute inset-0 border border-cyan-500/20 rounded-full scale-150 animate-pulse" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative p-2 rounded-xl bg-slate-800/40 border border-white/5">
            <Bell className="w-6 h-6 text-slate-300" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 rounded-full text-[9px] flex items-center justify-center font-bold border-2 border-slate-900">2</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto pb-28">
        {activeTab === 'home' && (
          <div className="p-5 space-y-6">
            {/* Hero / Immigration Portal */}
            <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 aspect-[4/3] group shadow-2xl shadow-cyan-900/20">
              <img 
                src="https://ais-dev-ejzbcgt7ruetckswv642si-56203130379.asia-east1.run.app/api/attachments/89d5cb25-1e75-490d-963a-baec89117a56/attachment.png" 
                alt="Immigration Hall" 
                className="w-full h-full object-cover brightness-75 transition-transform duration-1000 group-hover:scale-110" 
                referrerPolicy="no-referrer" 
              />
              
              {/* Scanning Line Animation */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
                <div className="w-full h-[1px] bg-cyan-400/40 shadow-[0_0_20px_rgba(34,211,238,0.6)] absolute top-0 animate-scan" />
              </div>

              {/* Biometric Frame Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="relative w-48 h-56">
                  {/* Corner Brackets */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/80 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/80 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/80 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/80 rounded-br-lg" />
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ScanFace className="w-12 h-12 text-white/20 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* HUD Elements */}
              <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                <span className="text-[11px] font-bold text-white tracking-widest uppercase">IMMIGRATION</span>
              </div>

              <div className="absolute bottom-4 left-6 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">REC</span>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 gap-4">
              <button 
                className="group relative flex items-center gap-5 p-5 rounded-[1.5rem] bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#020617] border border-white/10 hover:border-cyan-500/40 transition-all duration-500 overflow-hidden shadow-xl"
                onClick={() => setActiveTab('scan')}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                  <Fingerprint className="w-8 h-8 text-cyan-400" />
                </div>
                <div className="flex flex-col items-start relative z-10">
                  <span className="text-lg font-bold text-white tracking-tight group-hover:text-cyan-50 transition-colors">Start Verification</span>
                  <span className="text-[10px] text-cyan-500/60 uppercase tracking-[0.2em] font-bold">Verification Protocol</span>
                </div>
              </button>

              <button 
                className="group relative flex items-center gap-5 p-5 rounded-[1.5rem] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] border border-white/10 hover:border-teal-500/40 transition-all duration-500 overflow-hidden shadow-xl"
                onClick={() => setActiveTab('enroll')}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.1)]">
                  <UserCheck className="w-8 h-8 text-teal-400" />
                </div>
                <div className="flex flex-col items-start relative z-10">
                  <span className="text-lg font-bold text-white tracking-tight group-hover:text-teal-50 transition-colors">Enroll Identity</span>
                  <span className="text-[10px] text-teal-500/60 uppercase tracking-[0.2em] font-bold">Biometric Registration</span>
                </div>
              </button>

              <div className="grid grid-cols-2 gap-4">
                <MetricCard label="Active Scans" value="1,284" hint="+12% from yesterday" />
                <MetricCard label="Clearance" value="98.2%" hint="Optimal status" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scan' && (
          <div className="p-5 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Verification Terminal</h3>
              <Pill tone="blue">Ready</Pill>
            </div>

            {/* Camera View */}
            <div className={`rounded-[2.5rem] overflow-hidden border border-white/10 relative shadow-2xl ${cameraReady ? 'block' : 'hidden'}`}>
              <div className="relative aspect-[9/16] w-full bg-slate-950">
                <video ref={videoRef} playsInline muted autoPlay className="h-full w-full object-cover" />
                
                {/* Scanning HUD Overlay */}
                <div className="absolute inset-0 z-10">
                  <div className="absolute inset-0 border-[60px] border-black/70 backdrop-blur-[2px]" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 border-2 border-cyan-500/40 rounded-[3rem] overflow-hidden">
                    <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-cyan-400 rounded-tl-2xl" />
                    <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-cyan-400 rounded-tr-2xl" />
                    <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-cyan-400 rounded-bl-2xl" />
                    <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-cyan-400 rounded-br-2xl" />
                    
                    {/* Moving Scan Line */}
                    {isScanning && (
                      <div className="absolute w-full h-[2px] bg-cyan-400 shadow-[0_0_25px_cyan] animate-scan z-20" />
                    )}
                    
                    {/* Face Mesh Effect (SVG) */}
                    <svg className="absolute inset-0 w-full h-full opacity-30 text-cyan-400" viewBox="0 0 100 100">
                      <path d="M50 20 L30 40 L50 60 L70 40 Z" fill="none" stroke="currentColor" strokeWidth="0.5" className="animate-pulse" />
                      <path d="M30 40 L20 60 L50 80 L80 60 L70 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                      <circle cx="35" cy="45" r="1" fill="currentColor" />
                      <circle cx="65" cy="45" r="1" fill="currentColor" />
                      <circle cx="50" cy="55" r="1" fill="currentColor" />
                      <path d="M40 70 Q50 75 60 70" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    </svg>
                  </div>
                  
                  {isScanning && (
                    <div className="absolute bottom-16 left-0 w-full flex flex-col items-center gap-3">
                      <div className="px-5 py-1.5 bg-cyan-500/20 border border-cyan-500/40 rounded-full backdrop-blur-xl shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                        <span className="text-[11px] font-bold text-cyan-400 tracking-[0.2em] uppercase animate-pulse">Analyzing Facial Mesh...</span>
                      </div>
                      <div className="text-[10px] text-cyan-400/60 font-mono tracking-widest bg-black/40 px-3 py-1 rounded-md border border-white/5">MATCH_PROBABILITY: {(scanProgress * 0.98).toFixed(2)}%</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {!cameraReady && (
              <div className="aspect-[9/16] rounded-[2.5rem] bg-slate-900/40 border border-white/5 flex flex-col items-center justify-center gap-4">
                <div className="p-4 rounded-full bg-slate-800 animate-pulse">
                  <Camera className="w-8 h-8 text-slate-500" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Optics Offline</p>
                <ActionButton onClick={startCamera}>Initialize Camera</ActionButton>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <button 
                className="group relative flex items-center justify-center gap-5 p-5 rounded-[1.5rem] bg-white border border-white/10 hover:bg-slate-100 transition-all duration-300 overflow-hidden shadow-xl disabled:opacity-50"
                onClick={startScan}
                disabled={isScanning || !cameraReady}
              >
                <Fingerprint className={`w-8 h-8 ${isScanning ? 'animate-pulse text-cyan-600' : 'text-slate-900'}`} />
                <span className="text-lg font-black text-slate-900 tracking-tight uppercase">{isScanning ? 'Scanning...' : 'Scan Identity'}</span>
                {isScanning && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-200">
                    <div className="h-full bg-cyan-500 transition-all duration-300 shadow-[0_0_15px_cyan]" style={{ width: `${scanProgress}%` }} />
                  </div>
                )}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'enroll' && (
          <div className="p-5 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Biometric Enrollment</h3>
              <Pill tone="teal">Secure</Pill>
            </div>

            <div className="rounded-[2.5rem] border border-zinc-800 bg-zinc-900/50 p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Subject Name</label>
                <input
                  type="text"
                  value={enrollName}
                  onChange={(e) => setEnrollName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full rounded-2xl border border-zinc-800 bg-black px-5 py-4 text-white placeholder:text-zinc-700 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                />
              </div>

              <div className="relative aspect-square overflow-hidden rounded-[2rem] border-2 border-zinc-800 bg-black">
                {!cameraReady && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <Camera className="w-8 h-8 text-zinc-800" />
                    <button onClick={startCamera} className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">Enable Optics</button>
                  </div>
                )}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                />
                {isEnrolling && (
                  <div className="absolute inset-0 bg-cyan-500/10 backdrop-blur-[1px]">
                    <div className="absolute left-0 top-0 h-1 w-full animate-scan bg-cyan-400" />
                  </div>
                )}
              </div>

              {!isEnrolling ? (
                <ActionButton onClick={startEnrollment} disabled={!enrollName.trim() || !cameraReady || busy} variant="primary">
                  <Camera className="h-5 w-5" />
                  Capture & Enroll
                </ActionButton>
              ) : (
                <div className="space-y-3">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                    <div className="h-full bg-cyan-400 transition-all" style={{ width: `${scanProgress}%` }} />
                  </div>
                  <div className="text-center text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                    Processing Biometrics...
                  </div>
                </div>
              )}
            </div>

            {enrollments.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Registry ({enrollments.length})</h4>
                  <button 
                    onClick={() => {
                      if (confirm('Clear all biometric data?')) {
                        setEnrollments([]);
                        localStorage.removeItem('biometric_enrollments');
                      }
                    }}
                    className="text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:text-rose-400"
                  >
                    Purge Database
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {enrollments.map((e) => (
                    <div key={e.id} className="group relative aspect-square overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
                      <img src={e.photo} alt={e.name} className="h-full w-full object-cover opacity-60 transition-opacity group-hover:opacity-100" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="truncate text-xs font-bold text-white">{e.name}</div>
                        <div className="text-[9px] text-zinc-500">{new Date(e.timestamp).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="p-5 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Security Alerts</h3>
              <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded text-[10px] font-bold text-rose-400 animate-pulse">3 ACTIVE</span>
            </div>
            
            <div className="space-y-3">
              {[
                { 
                  id: 1, 
                  title: 'Unauthorized Entry Attempt', 
                  time: '2m ago', 
                  level: 'CRITICAL', 
                  location: 'Gate 4B',
                  image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=200&h=200'
                },
                { 
                  id: 2, 
                  title: 'Suspicious Package Detected', 
                  time: '15m ago', 
                  level: 'HIGH', 
                  location: 'Terminal 2',
                  image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&q=80&w=200&h=200'
                },
                { 
                  id: 3, 
                  title: 'Facial Recognition Match', 
                  time: '45m ago', 
                  level: 'MEDIUM', 
                  location: 'Main Hall',
                  image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200'
                }
              ].map((alert) => (
                <div key={alert.id} className="group relative flex items-center gap-4 p-4 rounded-[1.5rem] bg-slate-900/40 border border-white/5 hover:border-white/10 transition-all duration-300">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                    <img src={alert.image} alt="Alert" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" referrerPolicy="no-referrer" />
                    <div className={`absolute inset-0 opacity-20 ${alert.level === 'CRITICAL' ? 'bg-rose-500' : alert.level === 'HIGH' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${
                        alert.level === 'CRITICAL' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 
                        alert.level === 'HIGH' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 
                        'bg-blue-500/10 border-blue-500/20 text-blue-400'
                      }`}>
                        {alert.level}
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold">{alert.time}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white truncate group-hover:text-cyan-400 transition-colors">{alert.title}</h4>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{alert.location}</p>
                  </div>

                  <button className="p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-slate-400 hover:text-white">
                    <ShieldAlert className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Scan Result Modal */}
      {scanResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-500">
          <div className={`w-full max-w-sm rounded-[2.5rem] border p-10 text-center space-y-8 animate-in zoom-in slide-in-from-bottom-10 duration-500 shadow-2xl ${
            scanResult === 'success' ? 'bg-emerald-950/40 border-emerald-500/30 shadow-emerald-500/10' : 'bg-rose-950/40 border-rose-500/30 shadow-rose-500/10'
          }`}>
            <div className="flex justify-center">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center border-2 animate-pulse ${
                scanResult === 'success' ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-rose-500/20 border-rose-500/40'
              }`}>
                {scanResult === 'success' ? (
                  <UserCheck className="w-12 h-12 text-emerald-400" />
                ) : (
                  <XCircle className="w-12 h-12 text-rose-400" />
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <h2 className={`text-3xl font-black tracking-tighter ${scanResult === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {scanResult === 'success' ? 'IDENTITY VERIFIED' : 'ACCESS DENIED'}
              </h2>
              {scanResult === 'success' && matchedIdentity ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-500/50">
                    <img src={matchedIdentity.photo} alt={matchedIdentity.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-white text-lg font-bold">{matchedIdentity.name}</p>
                  <p className="text-emerald-400/60 text-[10px] font-bold uppercase tracking-widest">Clearance Level 4</p>
                </div>
              ) : (
                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                  {scanResult === 'success' 
                    ? 'Biometric signature matches the database record for Agent E-001. Clearance granted.' 
                    : 'No matching biometric signature found in the global database. Security alert triggered.'}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Confidence</p>
                <p className={`text-lg font-black ${scanResult === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {scanResult === 'success' ? '98.4%' : '12.1%'}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Status</p>
                <p className="text-lg font-black text-white">
                  {scanResult === 'success' ? 'SECURE' : 'THREAT'}
                </p>
              </div>
            </div>

            <button 
              onClick={() => { setScanResult(null); setMatchedIdentity(null); }}
              className={`w-full py-5 rounded-2xl font-black tracking-widest uppercase transition-all duration-300 active:scale-95 shadow-lg ${
                scanResult === 'success' 
                  ? 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-emerald-500/20' 
                  : 'bg-rose-500 text-white hover:bg-rose-400 shadow-rose-500/20'
              }`}
            >
              Dismiss Protocol
            </button>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 w-full bg-slate-950/80 backdrop-blur-3xl border-t border-white/5 px-8 py-5 flex justify-between items-center z-50">
        <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home className="w-6 h-6" />} label="Home" />
        <NavButton active={activeTab === 'scan'} onClick={() => setActiveTab('scan')} icon={<ScanFace className="w-6 h-6" />} label="Scan" />
        <NavButton active={activeTab === 'enroll'} onClick={() => setActiveTab('enroll')} icon={<UserCheck className="w-6 h-6" />} label="Enroll" />
        <NavButton active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')} icon={<Bell className="w-6 h-6" />} label="Alerts" />
      </nav>
    </div>
  );
}
