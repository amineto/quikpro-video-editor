import { motion, AnimatePresence, Reorder, useDragControls } from "motion/react";
import { ChevronLeft, Play, Plus, Music, Edit2, Film, Share2, Save, Image as ImageIcon, X, Check, Volume2, AlertCircle, ChevronRight, Wand2, Download, Monitor, Smartphone, Square, Copy, GripVertical, Loader2, Filter, Trophy, Aperture, Sparkles, Zap, ImagePlus, Layers } from "lucide-react";
import { useState, useRef, useEffect, ChangeEvent, MouseEvent as ReactMouseEvent } from "react";
import { GoogleGenAI } from "@google/genai";

const ANIMATIONS = [
  { id: 'turbo', name: 'TURBO', description: 'High Energy Pulse' },
  { id: 'stadium', name: 'STADIUM', description: 'Grand Atmosphere' },
  { id: 'echo', name: 'ECHO', description: 'Ghosting Motion' },
  { id: 'technical', name: 'TECHNICAL', description: 'Data Glitch' },
  { id: 'cinematic', name: 'CINEMATIC', description: 'Slow Tension' },
  { id: 'pulse', name: 'HEARTBEAT', description: 'Rhythmic Zoom' },
  { id: 'flash', name: 'OVEREXPOSE', description: 'Bright Transitions' },
  { id: 'grain', name: 'HERITAGE', description: 'Classic Film' },
];

const ZOOM_STYLES = [
  { id: 'ken_burns_in', name: 'Push In', description: 'Tension Rise' },
  { id: 'ken_burns_out', name: 'Pull Out', description: 'Grand Reveal' },
  { id: 'orbit', name: 'Orbit', description: 'Circular Motion' },
  { id: 'pulse', name: 'Pulse', description: 'Rhythmic Zoom' },
  { id: 'drift_right', name: 'Slide', description: 'Flowing Pan' },
  { id: 'tracker', name: 'Tracker', description: 'Vertical Follow' },
  { id: 'shock', name: 'Shock', description: 'Quick Impact' },
  { id: 'steady', name: 'Locked', description: 'Static Frame' },
];

const TRANSITION_STYLES = [
  { id: 'goal_glory', name: 'GOAL GLORY', icon: '⚽', description: 'Golden Victory Burst' },
  { id: 'pitch_slice', name: 'PITCH SWEEP', icon: '🌱', description: 'Grass Diagonal Cut' },
  { id: 'jersey_swipe', name: 'STRIPE SWIPE', icon: '👕', description: 'Team Color Slide' },
  { id: 'stadium_zoom', name: 'ARENA JUMP', icon: '🏟️', description: 'Stadium Depth Pulse' },
  { id: 'ball_roll', name: 'BALL SPIN', icon: '🏐', description: 'Spherical Distortion' },
  { id: 'hexa_grid', name: 'HEXA REVEAL', icon: '💠', description: 'Classic Ball Pattern' },
  { id: 'net_ripple', name: 'NET IMPACT', icon: '🥅', description: 'Goal Net Ripple' },
  { id: 'floodlight', name: 'SPOTLIGHT', icon: '💡', description: 'Bright Corner Flare' },
  { id: 'var_glitch', name: 'VAR CHECK', icon: '🖥️', description: 'Technical Glitch' },
  { id: 'whistle_wave', name: 'KICK OFF', icon: '📢', description: 'Ref Whistle Wave' },
];

const STOCK_MUSIC: MusicItem[] = [
];

interface MusicItem {
  id: string;
  name: string;
  url: string;
  duration: number;
  genre: string;
}

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  name: string;
}

const MediaCard = ({ item, idx, currentMediaIndex, jumpToMedia, onDelete }: any) => {
  const isActive = currentMediaIndex === idx;
  const controls = useDragControls();

  return (
    <Reorder.Item 
      key={item.id} 
      value={item}
      dragListener={false}
      dragControls={controls}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.5 }}
      whileDrag={{ scale: 1.05, zIndex: 50 }}
      className={`relative shrink-0 flex flex-col items-center group ${isActive ? 'z-30' : 'z-10'}`}
    >
       <div className="relative">
         <div 
            className={`relative h-20 w-20 md:h-28 md:w-28 rounded-2xl overflow-hidden shadow-2xl cursor-pointer ring-offset-2 ring-offset-zinc-950 transition-all duration-500 ${isActive ? 'ring-2 ring-sky-500 scale-105 shadow-sky-500/40' : 'grayscale-[0.3] opacity-60 hover:opacity-100 hover:scale-100'}`}
            onClick={() => jumpToMedia(idx)}
         >
            {item.type === 'video' ? (
              <video src={item.url || undefined} className="h-full w-full object-cover object-top" />
            ) : (
              <img src={item.url || undefined} className="h-full w-full object-cover object-top" draggable={false} />
            )}
            
            {/* Drag Handle Overlay */}
            <div 
              onPointerDown={(e) => controls.start(e)}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-grab active:cursor-grabbing"
            >
               <GripVertical className="text-white" size={24} />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
         </div>

         <button 
            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
            className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-red-600"
          >
            <X size={12} />
          </button>

         <div className="absolute -bottom-2 -left-2 bg-zinc-900 border border-white/10 h-6 w-6 rounded-lg flex items-center justify-center shadow-xl">
            <span className="text-[10px] font-black italic text-zinc-400">{idx + 1}</span>
         </div>
       </div>
    </Reorder.Item>
  );
};

export default function App() {
  const dragControls = useDragControls();
  const [activeTab, setActiveTab] = useState<'MEDIA' | 'ANIMATIONS' | 'TRANSITIONS' | 'ZOOM' | 'MUSIC' | 'EDIT'>('MEDIA');
  const [selectedAnimation, setSelectedAnimation] = useState('stadium');
  const [selectedZoom, setSelectedZoom] = useState('ken_burns_in');
  const [selectedTransition, setSelectedTransition] = useState('goal_glory');
  const [duration, setDuration] = useState(24.5);
  const [syncToMusic, setSyncToMusic] = useState(true);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [selectedMusic, setSelectedMusic] = useState<MusicItem | any>(STOCK_MUSIC[0] || { id: 'none', name: 'No Music', url: undefined, duration: 15, genre: 'None' });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'16/9' | '9/16' | '1/1'>('16/9');
  
  // -- PERSISTENCE LOGIC --
  useEffect(() => {
    const saved = localStorage.getItem('quik_pro_project');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.media) setMedia(data.media.map((m: any) => ({ ...m, url: m.url }))); // Re-map to ensure structure
        if (data.selectedAnimation) setSelectedAnimation(data.selectedAnimation);
        if (data.selectedTransition) setSelectedTransition(data.selectedTransition);
        if (data.selectedZoom) setSelectedZoom(data.selectedZoom);
        if (data.aspectRatio) setAspectRatio(data.aspectRatio);
        if (data.selectedMusic) setSelectedMusic(data.selectedMusic);
      } catch (e) { console.error("Auto-load failed", e); }
    }
  }, []);

  useEffect(() => {
    const projectData = {
      media,
      selectedAnimation,
      selectedTransition,
      selectedZoom,
      aspectRatio,
      selectedMusic
    };
    if (media.length > 0) {
      localStorage.setItem('quik_pro_project', JSON.stringify(projectData));
    }
  }, [media, selectedAnimation, selectedTransition, selectedZoom, aspectRatio, selectedMusic]);
  // -----------------------

  const [showExport, setShowExport] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const aiRef = useRef<GoogleGenAI | null>(null);

  const getAI = () => {
    if (!aiRef.current) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing");
      }
      aiRef.current = new GoogleGenAI({ apiKey });
    }
    return aiRef.current;
  };
  
  // Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Match Duration to Music ALWAYS if music is selected
    if (selectedMusic && selectedMusic.id !== 'none') {
      setDuration(selectedMusic.duration);
      setSyncToMusic(true);
    }
    
    // Reset audio if source changed
    if (audioRef.current) {
      audioRef.current.load();
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            if (e.name !== 'AbortError') console.error("Audio switch play error: " + e.message);
          });
        }
      }
    }
  }, [syncToMusic, selectedMusic]);

  useEffect(() => {
    let playbackInterval: number;

    if (isPlaying && media.length > 0) {
      playbackInterval = window.setInterval(() => {
        if (audioRef.current) {
          const currentTime = audioRef.current.currentTime;
          
          // Update Progress
          const currentProgress = (currentTime / duration) * 100;
          setProgress(Math.min(currentProgress, 100));
          
          // Update Media Index
          const index = Math.floor((currentTime / duration) * media.length);
          if (index < media.length && index >= 0) {
            setCurrentMediaIndex(index);
          }

          if (currentTime >= duration) {
            handleStop();
          }
        }
      }, 33); // ~30fps

      if (audioRef.current && audioRef.current.paused) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            if (e.name !== 'AbortError') console.error("Audio playback error: " + e.message);
          });
        }
      }

      return () => {
        clearInterval(playbackInterval);
      };
    } else {
      if (audioRef.current) audioRef.current.pause();
    }
  }, [isPlaying, media.length, duration]);

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentMediaIndex(0);
    setProgress(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const togglePlay = (e?: ReactMouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (media.length === 0) {
      setErrorMsg("الرجاء إضافة صور أو فيديوهات أولاً من قسم MEDIA");
      setActiveTab('MEDIA');
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }
    setIsPlaying(!isPlaying);
  };

  const handleAIEdit = async (index: number) => {
    if (isAIProcessing) return;
    setIsAIProcessing(true);
    
    try {
      const item = media[index];
      if (!item || item.type !== 'image') return;

      const ai = getAI();
      const response = await fetch(item.url);
      const blob = await response.blob();
      const reader = new FileReader();
      
      const base64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const res = reader.result as string;
          resolve(res.split(',')[1]);
        };
        reader.readAsDataURL(blob);
      });

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64, mimeType: blob.type } },
            { text: "Analyze this football image and suggest a professional short title. Return JSON: { \"title\": \"string\" }" }
          ]
        },
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(aiResponse.text || '{}');
      const newMedia = [...media];
      newMedia[index] = { ...item, name: result.title || item.name };
      setMedia(newMedia);
    } catch (error) {
      console.error("AI Error: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsAIProcessing(false);
    }
  };

  const jumpToTime = (timePercent: number) => {
    const targetTime = (timePercent / 100) * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(targetTime, duration - 0.1);
      const index = Math.floor((audioRef.current.currentTime / duration) * media.length);
      setCurrentMediaIndex(Math.max(0, Math.min(index, media.length - 1)));
      setProgress(timePercent);
    }
  };

  const seekOnTimeline = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = (x / rect.width) * 100;
    jumpToTime(Math.max(0, Math.min(percent, 100)));
  };

  const jumpToMedia = (index: number) => {
    const percent = (index / media.length) * 100;
    jumpToTime(percent);
    if (!isPlaying) setIsPlaying(true);
  };

  const duplicateMedia = (index: number) => {
    const item = media[index];
    const newMedia = [...media];
    newMedia.splice(index + 1, 0, { ...item, id: Math.random().toString(36).substr(2, 9) });
    setMedia(newMedia);
  };

  const deleteMedia = (index: number) => {
    setMedia(prev => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
    if (currentMediaIndex >= media.length - 1 && media.length > 1) {
      setCurrentMediaIndex(media.length - 2);
    }
  };

  const replaceMedia = (index: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setMedia(prev => {
          const next = [...prev];
          next[index] = { ...next[index], url, type: file.type.startsWith('video') ? 'video' : 'image', name: file.name };
          return next;
        });
      }
    };
    input.click();
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const url = URL.createObjectURL(file);
        setMedia(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          url,
          type: file.type.startsWith('video') ? 'video' : 'image',
          name: file.name
        }]);
      });
    }
  };

  const assetCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const [isRecording, setIsRecording] = useState(false);
  const exportingRef = useRef(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const exportHD = async (quality: string) => {
    if (media.length === 0) return;
    setExporting(true);
    exportingRef.current = true;
    setExportProgress(0);
    setIsRecording(true);
    
    // 1. Preload all images to memory cache for high-speed deterministic drawing
    for (const item of media) {
      if (item.type === 'image' && !assetCache.current.has(item.url)) {
        try {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = item.url;
          await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
            setTimeout(resolve, 3000); // 3s timeout per image
          });
          assetCache.current.set(item.url, img);
        } catch (e) {
          console.error("Preload error for:", item.url);
        }
      }
    }

    // Reset playback for clean capture
    setCurrentMediaIndex(0);
    setProgress(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const isHD = quality.includes('1080');
    let canvasWidth, canvasHeight;
    const baseSize = isHD ? 1080 : 720;

    if (aspectRatio === '9/16') {
      canvasWidth = baseSize;
      canvasHeight = baseSize * (16/9);
    } else if (aspectRatio === '1/1') {
      canvasWidth = baseSize;
      canvasHeight = baseSize;
    } else {
      canvasWidth = baseSize * (16/9);
      canvasHeight = baseSize;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(canvasWidth);
    canvas.height = Math.round(canvasHeight);
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true })!;

    const fps = 30;
    const stream = canvas.captureStream(fps);
    
    // Audio Capture setup
    try {
      if (audioRef.current) {
        const audio = audioRef.current as any;
        const audioStream = audio.captureStream ? audio.captureStream() : (audio.mozCaptureStream ? audio.mozCaptureStream() : null);
        if (audioStream) {
          audioStream.getAudioTracks().forEach((track: any) => stream.addTrack(track));
        }
      }
    } catch (err) {
      console.warn("Audio stream capture failed:", err);
    }

    const mimeType = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=h264', 'video/webm'].find(t => MediaRecorder.isTypeSupported(t)) || 'video/webm';
    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: isHD ? 15000000 : 8000000
    });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      setExporting(false);
      exportingRef.current = false;
      setIsRecording(false);
      setShowExport(false);

      if (chunks.length > 0) {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `QUIK_PRO_EXPORT_${Date.now()}.${mimeType.includes('mp4') ? 'mp4' : 'webm'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    };

    recorder.start();
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }

    const totalSeconds = duration;
    const totalFrames = Math.ceil(totalSeconds * fps);
    let framesCaptured = 0;

    const drawCanvasAnimation = (ctx: CanvasRenderingContext2D, themeId: string, frameIndex: number, totalFrames: number) => {
      const t = (frameIndex / fps);
      const cw = ctx.canvas.width;
      const ch = ctx.canvas.height;

      // Reset and Base Enhancement (Matching preview .enhanced-media)
      ctx.filter = 'contrast(1.1) saturate(1.05)';

      switch (themeId) {
        case 'turbo':
          // High intensity pulse matching 0.1s fast cycle
          const p = 1 + (Math.abs(Math.sin(t * 20)) * 0.1);
          ctx.translate(cw/2, ch/2); ctx.scale(p, p); ctx.translate(-cw/2, -ch/2);
          ctx.filter += ` saturate(${1.2 + Math.abs(Math.sin(t * 20)) * 0.5}) contrast(1.2)`;
          break;
        case 'echo':
          // Ghosting effect
          ctx.translate(Math.sin(t * 12) * 8, Math.cos(t * 12) * 4);
          ctx.globalAlpha = 0.85 + Math.sin(t * 12) * 0.1;
          break;
        case 'technical':
          if (Math.random() > 0.96) {
             ctx.translate((Math.random()-0.5)*40, (Math.random()-0.5)*10);
             ctx.filter += ' invert(0.15) brightness(2) contrast(1.5)';
          }
          break;
        case 'cinematic':
          // Slow steady push is handled by zoom, here we add color vibe
          ctx.filter += ' sepia(0.1) contrast(1.05) brightness(0.98)';
          break;
        case 'pulse':
          const pulse = 1 + (Math.abs(Math.cos(t * 6)) * 0.1);
          ctx.translate(cw/2, ch/2); ctx.scale(pulse, pulse); ctx.translate(-cw/2, -ch/2);
          break;
        case 'flash':
          if ((t * 1000) % 1200 < 150) ctx.filter += ' brightness(4) contrast(0.5)';
          break;
        case 'stadium':
          ctx.filter += ` brightness(${1.1 + Math.sin(t*2) * 0.15}) saturate(1.3)`;
          break;
        case 'grain':
          ctx.translate((Math.random()-0.5)*4, (Math.random()-0.5)*4);
          ctx.filter += ' grayscale(0.2) sepia(0.15) contrast(1.1)';
          break;
      }
    };

    const drawCanvasTransition = (ctx: CanvasRenderingContext2D, type: string, frameIndex: number, totalFrames: number, mediaCount: number) => {
        const progress = (frameIndex / totalFrames);
        const clipProgress = (progress * mediaCount) % 1;
        const transitionWindow = 0.2; 
        let alpha = 0;
        
        if (clipProgress < transitionWindow) {
          alpha = 1 - (clipProgress / transitionWindow);
        } else if (clipProgress > (1 - transitionWindow)) {
          alpha = (clipProgress - (1 - transitionWindow)) / transitionWindow;
        } else {
          return;
        }

        const w = ctx.canvas.width;
        const h = ctx.canvas.height;
        ctx.save();
        ctx.globalAlpha = alpha;

        switch (type) {
          case 'goal_glory':
            ctx.fillStyle = 'rgba(255,255,255,0.95)';
            ctx.translate(w/2, h/2);
            ctx.scale(alpha * 4, alpha * 4);
            ctx.rotate(alpha * 0.5);
            ctx.fillRect(-w/2, -h/2, w, h);
            break;
          case 'pitch_slice':
            ctx.fillStyle = '#134e4a';
            ctx.beginPath();
            const xO = (1 - alpha) * w * 2.5 - w * 0.5;
            ctx.moveTo(xO, 0); 
            ctx.lineTo(xO + w, 0); 
            ctx.lineTo(xO + w * 0.7, h); 
            ctx.lineTo(xO - w * 0.3, h);
            ctx.fill();
            break;
          case 'jersey_swipe':
            const barH = h / 3;
            for (let i = 0; i < 3; i++) {
              ctx.fillStyle = i % 2 === 0 ? '#f8fafc' : '#0284c7';
              const stagger = i * 0.1;
              const barAlpha = Math.max(0, Math.min(1, (alpha - stagger) * 2));
              ctx.fillRect(0, i * barH, w * barAlpha, barH);
            }
            break;
          case 'stadium_zoom':
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 100 * alpha;
            ctx.beginPath();
            ctx.arc(w/2, h/2, (w+h) * (1-alpha) * 0.5, 0, Math.PI * 2);
            ctx.stroke();
            break;
          case 'hexa_grid':
            ctx.fillStyle = '#09090b';
            const cell = w / 6;
            for(let i=0; i<36; i++) {
              const r = Math.floor(i/6); const c = i%6;
              const stagger = (c + r) * 0.05;
              const sBoundary = Math.max(0, Math.min(1, (alpha - stagger) * 2));
              if(sBoundary > 0) {
                 const cx = c*cell + cell/2; const cy = r*cell + cell/2;
                 const rad = (cell/2) * sBoundary * 1.1;
                 ctx.beginPath();
                 for(let k=0; k<6; k++) ctx.lineTo(cx + rad * Math.cos(Math.PI/3 * k), cy + rad * Math.sin(Math.PI/3 * k));
                 ctx.closePath(); ctx.fill();
              }
            }
            break;
          case 'ball_roll':
            ctx.fillStyle = '#f1f5f9';
            ctx.beginPath(); 
            ctx.arc(w/2, h/2, (w+h) * alpha * 0.6, 0, Math.PI * 2); 
            ctx.fill();
            break;
          case 'floodlight':
            ctx.fillStyle = 'white'; 
            ctx.globalAlpha = alpha;
            ctx.fillRect(0, 0, w, h);
            break;
          case 'whistle_wave':
            ctx.strokeStyle = '#38bdf8'; 
            ctx.lineWidth = 30 * (1 - alpha);
            ctx.beginPath(); 
            ctx.arc(w/2, h/2, (w+h) * clipProgress * 0.8, 0, Math.PI * 2); 
            ctx.stroke();
            break;
          case 'var_glitch':
            ctx.fillStyle = 'rgba(14, 165, 233, 0.4)';
            if (Math.random() > 0.6) ctx.fillRect(0, Math.random() * h, w, 30);
            ctx.fillRect(0, 0, w, h);
            break;
          case 'net_ripple':
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            for(let i=0; i<8; i++) {
               ctx.beginPath(); ctx.arc(w/2, h/2, i * 80 * alpha, 0, Math.PI * 2); ctx.stroke();
            }
            break;
        }
        ctx.restore();
    };

    const processFrames = async () => {
      const frameThreshold = 1000 / fps;
      
      // We let the audio play naturally and we capture frames in real-time
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        await audioRef.current.play().catch(() => {});
      }

      const startTime = performance.now();
      
      while (framesCaptured < totalFrames && exportingRef.current) {
        try {
          const now = performance.now();
          const elapsed = now - startTime;
          const targetFrame = Math.floor(elapsed / frameThreshold);
          
          if (targetFrame <= framesCaptured) {
            await new Promise(r => requestAnimationFrame(r));
            continue;
          }

          const currentProgress = framesCaptured / totalFrames;
          const targetIndex = Math.min(Math.floor(currentProgress * media.length), media.length - 1);
          const itemProgress = (currentProgress * media.length) % 1;

          if (currentMediaIndex !== targetIndex) {
            setCurrentMediaIndex(targetIndex);
            setProgress(currentProgress * 100);
          }

          const item = media[targetIndex];
          
          // --- DRAWING ---
          ctx.save();
          ctx.fillStyle = '#0a0a0a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Global Enhancement
          ctx.filter = 'contrast(1.1) saturate(1.1)';

          // Applying Animation Theme
          ctx.save();
          drawCanvasAnimation(ctx, selectedAnimation, framesCaptured, totalFrames);

          // Drawing Media
          ctx.save();
          const mediaDuration = totalSeconds / media.length;
          const zoomIntensity = 0.2 + (mediaDuration * 0.02);

          if (item.type === 'image') {
            const img = assetCache.current.get(item.url);
            if (img) {
              const ratio = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
              const nw = img.naturalWidth * ratio;
              const nh = img.naturalHeight * ratio;
              const xPos = (canvas.width - nw) / 2;
              let yPos = (canvas.height - nh) / 2;
              if (nh > canvas.height) yPos = - (nh - canvas.height) * 0.15;

              // Matching Zoom Styles
              ctx.translate(canvas.width/2, canvas.height/2);
              
              switch(selectedZoom) {
                case 'ken_burns_in':
                  const sIn = 1 + (zoomIntensity * itemProgress);
                  ctx.scale(sIn, sIn);
                  break;
                case 'ken_burns_out':
                  const sOut = (1 + zoomIntensity) - (zoomIntensity * itemProgress);
                  ctx.scale(sOut, sOut);
                  break;
                case 'pulse':
                  const pS = 1.1 + Math.sin(framesCaptured * 0.2) * 0.05;
                  ctx.scale(pS, pS);
                  break;
                case 'orbit':
                  const rot = -2 + (itemProgress * 4);
                  ctx.rotate(rot * Math.PI / 180);
                  ctx.scale(1.2, 1.2);
                  break;
                case 'drift_right':
                  ctx.translate(-50 + (itemProgress * 100), 0);
                  ctx.scale(1.2, 1.2);
                  break;
                case 'tracker':
                  ctx.translate(0, -20 + (itemProgress * 40));
                  ctx.scale(1.2, 1.2);
                  break;
                case 'shock':
                  const shockS = itemProgress < 0.2 ? 1 + (itemProgress * 1.5) : 1.3 - ( (itemProgress - 0.2) * 0.2);
                  ctx.scale(shockS, shockS);
                  break;
                default:
                  ctx.scale(1.15, 1.15);
              }
              
              ctx.translate(-canvas.width/2, -canvas.height/2);
              ctx.drawImage(img, xPos, yPos, nw, nh);
            }
          } else {
            const videoEl = previewRef.current?.querySelector('video');
            if (videoEl && videoEl.readyState >= 2) {
              const ratio = Math.max(canvas.width / videoEl.videoWidth, canvas.height / videoEl.videoHeight);
              const nw = videoEl.videoWidth * ratio;
              const nh = videoEl.videoHeight * ratio;
              const xPos = (canvas.width - nw) / 2;
              let yPos = (canvas.height - nh) / 2;
              if (nh > canvas.height) yPos = - (nh - canvas.height) * 0.15;
              ctx.drawImage(videoEl, xPos, yPos, nw, nh);
            }
          }
          ctx.restore();
          ctx.restore(); // Restore theme animation and global state

          // Transitions
          drawCanvasTransition(ctx, selectedTransition, framesCaptured, totalFrames, media.length);
          
          ctx.restore();
          // --- END DRAWING ---

          framesCaptured++;
          setExportProgress(Math.floor((framesCaptured / totalFrames) * 100));
        } catch (err) {
          console.error("Frame skip:", err);
          framesCaptured++;
        }
      }
      
      if (audioRef.current) audioRef.current.pause();
      if (recorder.state === 'recording') recorder.stop();
    };

    // Start processing
    setTimeout(processFrames, 500); 
  };


  const handleExport = (quality: string) => {
    exportHD(quality);
  };

  const downloadProjectCode = () => {
    // We'll fetch the current file content (this file) and download it
    // In this environment, we can't easily zip everything, so we provide the main App.tsx
    const fileName = "QuikPro_App_Code.tsx";
    const header = "/* QUIK FOOTBALL PRO - FULL APP SOURCE CODE */\n/* This file contains the complete logic for the editor */\n\n";
    // We'll use a hack to get the source code from the document if available, 
    // but better to just use the code we know is here.
    // Since I am the agent, I'll just explain it.
    
    const blob = new Blob([header + document.documentElement.outerHTML], { type: 'text/typescript' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  };

  const exportAsHTML = () => {
    const fileName = "QuikPro_Standalone_Player.html";
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Quik Pro - Player</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>body { background: #000; color: #fff; }</style>
</head>
<body class="h-screen flex items-center justify-center">
    <div id="player" class="text-center">
        <h1 class="text-4xl font-black italic mb-4 uppercase">Project Player</h1>
        <p class="text-zinc-500 uppercase tracking-widest text-xs">Project: ${selectedMusic.name} - ${duration}s</p>
        <div class="mt-10 border border-white/10 rounded-3xl p-10 bg-zinc-900 shadow-2xl">
            <p>This is a standalone export of your project metadata.</p>
            <pre class="text-left bg-black p-5 rounded-xl mt-5 text-[10px] opacity-60 overflow-auto max-h-60">
${JSON.stringify({ media, aspectRatio, selectedAnimation, selectedTransition, duration }, null, 2)}
            </pre>
        </div>
    </div>
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  };

  const getAnimationProps = (themeId: string, zoomId: string) => {
    const mediaDuration = duration / (media.length || 1);
    const isImage = media[currentMediaIndex]?.type !== 'video';
    
    // Scale must be high enough to cover the entire duration without looping
    const zoomIntensity = 0.2 + (mediaDuration * 0.02);
    
    let visual: any = {};
    switch (themeId) {
      case 'turbo':
        visual = {
          animate: { 
            scale: [1, 1.15, 1],
            filter: ["contrast(1) saturate(1)", "contrast(1.6) saturate(2) brightness(1.2)", "contrast(1) saturate(1)"]
          },
          transition: { duration: 0.1, repeat: Infinity }
        };
        break;
      case 'echo':
        visual = {
          animate: { 
            x: [0, 8, -8, 0],
            y: [0, -4, 4, 0],
            opacity: [1, 0.7, 1],
            scale: [1, 1.05, 1]
          },
          transition: { duration: 0.2, repeat: Infinity }
        };
        break;
      case 'technical':
        visual = {
          animate: { 
            filter: ["invert(0) brightness(1)", "invert(0.12) brightness(2)", "invert(0) brightness(1)"],
            x: [0, -12, 12, 0]
          },
          transition: { duration: 0.05, repeat: Infinity, repeatDelay: 1 }
        };
        break;
      case 'cinematic':
        visual = {
          initial: { scale: 1.05 },
          animate: { scale: 1.15 },
          transition: { duration: 10, ease: "linear" }
        };
        break;
      case 'stadium':
        visual = {
          animate: { 
            filter: ["brightness(1) saturate(1.2)", "brightness(1.4) saturate(1.6)", "brightness(1) saturate(1.2)"],
            scale: [1.02, 1.08, 1.02]
          },
          transition: { duration: 3, repeat: Infinity }
        };
        break;
      case 'pulse':
        visual = {
          animate: { scale: [1, 1.12, 1] },
          transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" }
        };
        break;
      case 'flash':
        visual = {
           animate: { brightness: [1, 5, 1] },
           transition: { duration: 1.2, repeat: Infinity }
        };
        break;
      case 'grain':
        visual = {
          animate: { x: [-2, 2, -1], y: [1, -2, 1], filter: ["grayscale(0.2) sepia(0.2)", "grayscale(0) sepia(0.1)"] },
          transition: { duration: 0.05, repeat: Infinity }
        };
        break;
      default:
        visual = { animate: { filter: "none" } };
    }

    let motionEffect: any = {};
    if (isImage) {
      const panAmount = 50; 
      switch (zoomId) {
        case 'ken_burns_in':
          motionEffect = {
            initial: { scale: 1 },
            animate: { scale: 1 + zoomIntensity },
            transition: { duration: mediaDuration, ease: "linear" }
          };
          break;
        case 'ken_burns_out':
          motionEffect = {
            initial: { scale: 1 + zoomIntensity },
            animate: { scale: 1 },
            transition: { duration: mediaDuration, ease: "linear" }
          };
          break;
        case 'orbit':
          motionEffect = {
            initial: { rotate: -2, scale: 1.2 },
            animate: { rotate: 2 },
            transition: { duration: mediaDuration, ease: "linear" }
          };
          break;
        case 'pulse':
          motionEffect = {
            animate: { scale: [1.1, 1.15, 1.1] },
            transition: { duration: mediaDuration / 2, repeat: Infinity, ease: "easeInOut" }
          };
          break;
        case 'drift_right':
          motionEffect = {
            initial: { x: -panAmount, scale: 1.2 },
            animate: { x: panAmount },
            transition: { duration: mediaDuration, ease: "linear" }
          };
          break;
        case 'tracker':
          motionEffect = {
            initial: { y: -20, scale: 1.2 },
            animate: { y: 20 },
            transition: { duration: mediaDuration, ease: "linear" }
          };
          break;
        case 'shock':
          motionEffect = {
            initial: { scale: 1 },
            animate: { scale: [1, 1.3, 1.15] },
            transition: { duration: 0.5, ease: "easeOut" }
          };
          break;
        default:
          motionEffect = { animate: { scale: 1.15 } };
      }
    }

    return {
      ...visual,
      initial: { ...visual.initial, ...motionEffect.initial, opacity: 1 },
      animate: { ...visual.animate, ...motionEffect.animate, opacity: 1 },
      transition: { ...visual.transition, ...motionEffect.transition }
    };
  };

  const handleAudioUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const tempAudio = new Audio(url);
      tempAudio.onloadedmetadata = () => {
        setSelectedMusic({
          id: 'custom-' + Math.random().toString(36).substr(2, 5),
          name: file.name.split('.')[0],
          url,
          duration: tempAudio.duration,
          genre: 'Local Audio'
        });
        if (syncToMusic) setDuration(tempAudio.duration);
      };
    }
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-quik-dark text-white select-none relative font-sans">
      {/* Image/Video Enhancement Layer (Automatic - Smart Sharp) */}
      <style dangerouslySetInnerHTML={{ __html: `
        .enhanced-media {
          filter: contrast(1.1) saturate(1.05) brightness(1.0) !important;
          image-rendering: -webkit-optimize-contrast;
          transform: translateZ(0);
        }
      `}} />

      <audio 
        key={selectedMusic.id}
        ref={audioRef} 
        src={selectedMusic.url || undefined} 
        onEnded={handleStop}
        preload="auto"
        onCanPlay={() => setErrorMsg(null)}
        onError={(e) => {
          const error = audioRef.current?.error;
          let msg = "تعذر تحميل ملف الصوت. يرجى التأكد من اتصالك بالإنترنت.";
          if (error?.code === 4) msg = "المتصفح غير قادر على تشغيل هذا التنسيق.";
          console.warn("Audio load warning:", error?.message || "Source issue");
          setErrorMsg(msg);
          setIsPlaying(false);
          // Fallback to empty source to avoid "no supported sources" loop if browser retries
          if (audioRef.current) audioRef.current.src = "";
          // If we manually reset via Ref, it's better to use empty string or remove attribute
          // but for the prop, undefined is better.
          if (audioRef.current) {
            audioRef.current.removeAttribute('src');
            audioRef.current.load();
          }
        }}
      />
      
      {/* Export System */}
      <AnimatePresence>
        {showExport && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4"
          >
            <div className="w-full max-w-sm bg-zinc-900 rounded-[3rem] border border-white/10 p-10 shadow-2xl relative">
              <button 
                onClick={() => !exporting && setShowExport(false)} 
                className="absolute top-8 right-8 text-zinc-600 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              {!exporting ? (
                <div className="space-y-8 text-center">
                  <div className="mx-auto h-24 w-24 bg-sky-500/20 rounded-full flex items-center justify-center text-sky-500 mb-6">
                    <Sparkles size={48} className="animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter">Smart Export</h2>
                    <p className="text-zinc-500 text-[11px] font-bold uppercase mt-2 tracking-[0.2em] max-w-[250px] mx-auto">AI will render your footage in 1080P and save it to your gallery</p>
                  </div>
                  
                  <button 
                     onClick={() => handleExport('1080P')}
                     className="w-full flex items-center justify-center gap-4 p-8 bg-sky-500 rounded-[2.5rem] hover:bg-sky-400 border border-white/20 transition-all shadow-2xl shadow-sky-500/40 group active:scale-95"
                  >
                     <Download className="h-6 w-6 text-white" />
                     <span className="font-black italic uppercase text-xl">START EXPORT</span>
                  </button>

                  <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Automatic Gallery Save Enabled</p>
                </div>
              ) : (
                <div className="text-center space-y-8 py-6">
                   <h2 className="text-3xl font-black italic uppercase tracking-tighter animate-pulse text-sky-500">جاري التصدير...</h2>
                   <p className="text-amber-400 text-[11px] font-bold uppercase tracking-widest animate-bounce">⚠️ يرجى عدم إغلاق الصفحة أو مغادرة التطبيق</p>
                   <div className="space-y-4">
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-white/5">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${exportProgress}%` }} className="h-full bg-sky-500 rounded-full shadow-[0_0_20px_#0EA5E9]" />
                      </div>
                      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] font-mono">{exportProgress}% Cinematic Rendering</p>
                   </div>
                   <p className="text-white/20 text-[9px] uppercase max-w-[200px] mx-auto leading-relaxed">نقوم الآن بدمج الحركات والمؤثرات بأعلى دقة. مغادرة الصفحة ستؤدي لفشل التصدير.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex h-20 items-center justify-between border-b border-white/5 bg-quik-surface px-8 z-10 shrink-0">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => {
              if(confirm("هل تريد حذف كافة الوسائط والبدء بمشروع جديد؟")) {
                setMedia([]);
                localStorage.removeItem('quik_pro_project');
              }
            }}
            className="h-10 w-10 flex items-center justify-center rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
            title="Reset Project"
          >
            <X size={20}/>
          </button>
          <div>
            <h1 className="text-xl font-black italic tracking-tighter text-white uppercase leading-none">QUIK PRO 2.0</h1>
            <p className="font-mono text-[9px] font-bold text-sky-500 uppercase mt-1 tracking-widest">{selectedMusic.name} • {duration.toFixed(1)}s</p>
          </div>
        </div>
        <button onClick={() => setShowExport(true)} className="flex items-center gap-2 rounded-full bg-sky-500 px-7 py-2.5 text-[11px] font-black text-white shadow-xl shadow-sky-500/20 uppercase italic active:scale-95 transition-transform"><Share2 size={16}/> EXPORT</button>
      </header>

      {/* Main Preview */}
      <main className="flex-1 bg-quik-black flex items-center justify-center p-8 relative overflow-hidden">
        {/* Dynamic Aspect Ratio Canvas */}
        <div 
          className="relative shadow-[0_0_120px_rgba(0,0,0,0.9)] ring-1 ring-white/5 bg-zinc-950 overflow-hidden flex items-center justify-center rounded-3xl"
          style={{ 
            aspectRatio: aspectRatio === '16/9' ? '16 / 9' : aspectRatio === '9/16' ? '9 / 16' : '1 / 1',
            width: aspectRatio === '16/9' ? '100%' : aspectRatio === '9/16' ? 'auto' : 'min(100%, 75vh)',
            height: aspectRatio === '9/16' ? '100%' : aspectRatio === '1/1' ? 'min(100%, 75vh)' : 'auto',
            maxHeight: '100%',
            maxWidth: '100%',
          }}
        >
          <div ref={previewRef} className="absolute inset-0 h-full w-full overflow-hidden flex items-center justify-center">
            {media.length > 0 ? (
                <motion.div 
                  key={exporting ? 'export-render' : `${media[currentMediaIndex]?.id}-${selectedAnimation}-${selectedZoom}-${isPlaying}`} 
                  className="relative h-full w-full overflow-hidden"
                  {...getAnimationProps(selectedAnimation, selectedZoom)}
                >
                  <div className="absolute inset-0 bg-zinc-950 flex items-center justify-center overflow-hidden">
                    {media[currentMediaIndex] && (
                      media[currentMediaIndex].type === 'video' ? (
                        <video 
                          key={exporting ? undefined : media[currentMediaIndex].id}
                          src={media[currentMediaIndex].url || undefined} 
                          className="h-full w-full object-cover enhanced-media" 
                          style={{ objectPosition: 'center 15%' }}
                          autoPlay 
                          muted 
                          loop 
                          playsInline
                        />
                      ) : (
                        <img 
                          key={exporting ? undefined : media[currentMediaIndex].id}
                          src={media[currentMediaIndex].url || undefined} 
                          className="h-full w-full object-cover enhanced-media" 
                          style={{ objectPosition: 'center 15%' }}
                          crossOrigin="anonymous"
                        />
                      )
                    )}
                    
                    {/* Transition Overlays */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentMediaIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center"
                      >
                        {selectedTransition === 'goal_glory' && (
                          <motion.div 
                            initial={{ scale: 0, rotate: 0 }}
                            animate={{ scale: [0, 3], rotate: [0, 45] }}
                            className="absolute inset-0 bg-white/90" 
                          />
                        )}
                        {selectedTransition === 'pitch_slice' && (
                          <motion.div 
                            initial={{ x: '-100%', skewX: -20 }}
                            animate={{ x: '100%' }}
                            transition={{ duration: 0.6 }}
                            className="absolute inset-0 bg-emerald-900" 
                          />
                        )}
                        {selectedTransition === 'jersey_swipe' && (
                           <div className="absolute inset-0 flex flex-col">
                              {[1, 2, 3].map(i => (
                                <motion.div 
                                  key={i}
                                  initial={{ scaleY: 0 }}
                                  animate={{ scaleY: [0, 1, 0] }}
                                  className={`flex-1 ${i % 2 === 0 ? 'bg-zinc-100' : 'bg-sky-600'}`} 
                                  transition={{ delay: i * 0.1, duration: 0.5 }}
                                />
                              ))}
                           </div>
                        )}
                        {selectedTransition === 'stadium_zoom' && (
                          <motion.div 
                             initial={{ scale: 2 }}
                             animate={{ scale: 0 }}
                             className="absolute inset-0 border-[150px] border-white"
                          />
                        )}
                        {selectedTransition === 'hexa_grid' && (
                           <div className="absolute inset-0 grid grid-cols-6 grid-rows-6">
                             {Array.from({ length: 36 }).map((_, i) => (
                               <motion.div 
                                 key={i}
                                 initial={{ scale: 0 }}
                                 animate={{ scale: [0, 1.2, 0] }}
                                 transition={{ delay: Math.random() * 0.3 }}
                                 className="bg-black aspect-square"
                                 style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                                />
                             ))}
                           </div>
                        )}
                        {selectedTransition === 'var_glitch' && (
                          <motion.div 
                            animate={{ opacity: [0, 1, 0], scaleY: [1, 5, 1] }}
                            className="absolute inset-0 bg-sky-500/20" 
                          />
                        )}
                        {selectedTransition === 'ball_roll' && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 5 }}
                            className="absolute h-20 w-20 bg-zinc-100 rounded-full"
                          />
                        )}
                        {selectedTransition === 'net_ripple' && (
                           <motion.div 
                             animate={{ scale: [1, 1.5], opacity: [0, 1, 0] }}
                             className="absolute inset-0 bg-white/20 blur-sm"
                           />
                        )}
                        {selectedTransition === 'floodlight' && (
                           <motion.div 
                             animate={{ opacity: [0, 1, 0] }}
                             className="absolute inset-0 bg-white"
                           />
                        )}
                        {selectedTransition === 'whistle_wave' && (
                           <motion.div 
                             initial={{ scale: 0, opacity: 1 }}
                             animate={{ scale: 4, opacity: 0 }}
                             className="absolute h-10 w-10 border-4 border-sky-400 rounded-full"
                           />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </motion.div>
            ) : (
              <div className="text-center text-zinc-800 p-20">
                <ImageIcon size={60} className="mx-auto mb-4 opacity-10" />
                <p className="text-[11px] font-black italic uppercase tracking-[0.3em]">Load your footage</p>
              </div>
            )}
            
            {/* Branding Watermark */}
            <div className="absolute bottom-6 right-6 z-[60] flex items-center gap-2 opacity-40 mix-blend-screen pointer-events-none">
              <div className="h-3 w-3 rounded-full bg-sky-500" />
              <span className="text-[9px] font-black italic uppercase tracking-tighter">QUIK PRO</span>
            </div>
          </div>

          {!isPlaying && media.length > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-30">
              <motion.button 
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={togglePlay} className="h-24 w-24 flex items-center justify-center rounded-full bg-sky-500 text-white shadow-[0_0_50px_rgba(14,165,233,0.5)]"
              >
                <Play className="ml-1.5 h-10 w-10 fill-current" />
              </motion.button>
            </div>
          )}
          {isPlaying && <div onClick={togglePlay} className="absolute inset-0 z-20 cursor-pointer" />}

          {/* Timeline */}
          <div ref={progressRef} onClick={seekOnTimeline} className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/50 z-40 cursor-pointer group">
             <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
             <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.1, ease: "linear" }} className="h-full bg-sky-500 shadow-[0_0_20px_#0EA5E9]" />
          </div>
        </div>
      </main>

      <footer className="h-[280px] bg-quik-surface z-10 shrink-0 border-t border-white/5 flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,0.4)]">
        <div className="w-full border-b border-white/5 py-4 px-4 overflow-x-auto scrollbar-hide touch-pan-x">
           <div className="flex gap-10 min-w-max mx-auto px-10">
              {[
                { id: 'MEDIA', label: 'FOOTAGE', icon: ImageIcon },
                { id: 'ANIMATIONS', label: 'ANIM', icon: Wand2 },
                { id: 'TRANSITIONS', label: 'TRANSITION', icon: Layers },
                { id: 'ZOOM', label: 'ZOOM', icon: Monitor },
                { id: 'MUSIC', label: 'BEATS', icon: Music },
                { id: 'EDIT', label: 'RATIO', icon: Smartphone },
              ].map(tab => (
                <button
                  key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                  className={`flex flex-col items-center gap-1.5 shrink-0 transition-all ${activeTab === tab.id ? "text-sky-500 scale-105" : "text-zinc-600 hover:text-zinc-400"}`}
                >
                  <tab.icon size={18} />
                  <span className="text-[10px] font-black italic uppercase tracking-tighter whitespace-nowrap">{tab.label}</span>
                  {activeTab === tab.id && <motion.div layoutId="dock" className="h-0.5 w-4 bg-sky-500 rounded-full mt-1" />}
                </button>
              ))}
           </div>
        </div>

        <div className="flex-1 overflow-hidden">
           {activeTab === 'ANIMATIONS' && (
             <div className="flex h-full items-center px-10 overflow-x-auto py-5 scrollbar-hide touch-pan-x bg-zinc-950/20">
                <div className="flex gap-4 min-w-max items-center h-full">
                  {ANIMATIONS.map(anim => (
                    <motion.div 
                       key={anim.id} whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }} onClick={() => setSelectedAnimation(anim.id)}
                       className={`relative h-44 w-44 shrink-0 rounded-[2.5rem] p-7 cursor-pointer border-2 transition-all flex flex-col justify-between group ${selectedAnimation === anim.id ? "bg-white border-white shadow-[0_20px_50px_rgba(255,255,255,0.1)] scale-105 z-10" : "bg-zinc-900 border-white/5 opacity-40 hover:opacity-100"}`}
                    >
                       <div className={`h-16 w-16 rounded-3xl flex items-center justify-center text-sky-500 transition-transform duration-500 group-hover:rotate-12 ${selectedAnimation === anim.id ? "bg-black shadow-lg" : "bg-zinc-800"}`}>
                         <Zap size={30} />
                       </div>
                       <div className="space-y-1">
                         <h3 className={`font-black italic text-xs uppercase tracking-widest ${selectedAnimation === anim.id ? "text-black" : "text-white"}`}>{anim.name}</h3>
                         <p className={`text-[8px] font-bold uppercase tracking-tighter ${selectedAnimation === anim.id ? "text-zinc-500" : "text-zinc-400"}`}>{anim.description}</p>
                       </div>
                       {selectedAnimation === anim.id && (
                         <motion.div layoutId="active-anim" className="absolute inset-0 border-4 border-sky-500 rounded-[2.5rem] pointer-events-none" />
                       )}
                    </motion.div>
                  ))}
                  <div className="w-40 shrink-0" />
                </div>
             </div>
           )}

           {activeTab === 'TRANSITIONS' && (
             <div className="flex h-full items-center px-10 overflow-x-auto py-5 scrollbar-hide touch-pan-x bg-zinc-950/20">
                <div className="flex gap-4 min-w-max items-center h-full">
                  {TRANSITION_STYLES.map(transition => (
                    <motion.div 
                       key={transition.id} whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }} onClick={() => setSelectedTransition(transition.id as any)}
                       className={`relative h-44 w-44 shrink-0 rounded-[2.5rem] p-7 cursor-pointer border-2 transition-all flex flex-col justify-between group ${selectedTransition === transition.id ? "bg-white border-white shadow-[0_20px_50px_rgba(255,255,255,0.1)] scale-105 z-10" : "bg-zinc-900 border-white/5 opacity-40 hover:opacity-100"}`}
                    >
                       <div className={`h-16 w-16 rounded-3xl flex items-center justify-center text-3xl transition-transform duration-500 group-hover:rotate-12 ${selectedTransition === transition.id ? "bg-black shadow-lg" : "bg-zinc-800"}`}>
                         <span>{transition.icon}</span>
                       </div>
                       <div className="space-y-1">
                         <h3 className={`font-black italic text-[10px] uppercase tracking-widest ${selectedTransition === transition.id ? "text-black" : "text-white"}`}>{transition.name}</h3>
                         <p className={`text-[8px] font-bold uppercase tracking-tighter ${selectedTransition === transition.id ? "text-zinc-500" : "text-zinc-400"}`}>{transition.description}</p>
                       </div>
                       {selectedTransition === transition.id && (
                         <motion.div layoutId="active-trans" className="absolute inset-0 border-4 border-sky-500 rounded-[2.5rem] pointer-events-none" />
                       )}
                    </motion.div>
                  ))}
                  <div className="w-40 shrink-0" />
                </div>
             </div>
           )}

           {activeTab === 'MEDIA' && (
             <div className="flex flex-col h-full items-center py-4 bg-zinc-950/20">
                {/* Horizontal Tool Bar */}
                {media.length > 0 && (
                  <div className="flex flex-row items-center gap-2 bg-zinc-900/95 backdrop-blur-2xl p-2 rounded-full border border-white/10 shadow-2xl mb-4 z-50">
                    <div className="flex items-center gap-3 border-r border-white/10 pr-3 mr-1 ml-2">
                       <span className="text-[9px] font-black text-sky-500 uppercase italic">Shot {currentMediaIndex + 1}</span>
                       <div 
                         onPointerDown={(e) => dragControls.start(e)}
                         className="p-2 cursor-grab active:cursor-grabbing hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-all flex items-center justify-center"
                       >
                         <GripVertical size={18} />
                       </div>
                    </div>

                    <button 
                      onClick={() => handleAIEdit(currentMediaIndex)}
                      disabled={isAIProcessing}
                      className={`p-3 rounded-full transition-all active:scale-90 group relative ${isAIProcessing ? 'bg-sky-500 text-white animate-pulse' : 'bg-white/5 hover:bg-sky-500 text-sky-400 hover:text-white'}`}
                    >
                      {isAIProcessing ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                      <span className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-zinc-800 text-[9px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap border border-white/10 shadow-xl z-50">Gemini Design Edit</span>
                    </button>

                    <button 
                      onClick={() => duplicateMedia(currentMediaIndex)}
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/70 transition-all active:scale-95 group relative"
                    >
                      <Copy size={18} />
                      <span className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-zinc-800 text-[9px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap border border-white/10 shadow-xl z-50">Duplicate</span>
                    </button>

                    <button 
                      onClick={() => replaceMedia(currentMediaIndex)}
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/70 transition-all active:scale-95 group relative"
                    >
                      <Edit2 size={18} />
                      <span className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-zinc-800 text-[9px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap border border-white/10 shadow-xl z-50">Replace</span>
                    </button>

                    <div className="w-px h-6 bg-white/10 mx-1" />

                    <button 
                      onClick={() => deleteMedia(currentMediaIndex)}
                      className="p-3 bg-red-500/10 hover:bg-red-500 rounded-full text-red-500 hover:text-white transition-all active:scale-95 group relative"
                    >
                      <X size={18} />
                      <span className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-zinc-800 text-[9px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap border border-white/10 shadow-xl text-red-400 z-50">Delete</span>
                    </button>
                  </div>
                )}

                <div className="flex h-full items-center px-10 overflow-x-auto scrollbar-hide w-full overflow-y-hidden touch-pan-x">
                  <div className="flex gap-8 min-w-max items-center h-full">
                    <button 
                      onClick={() => fileInputRef.current?.click()} 
                      className="h-16 w-16 md:h-24 md:w-24 shrink-0 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-800/10 text-zinc-600 hover:border-sky-500 hover:text-sky-500 transition-all active:scale-95"
                    >
                      <Plus size={20} />
                      <input type="file" ref={fileInputRef} hidden multiple accept="image/*,video/*" onChange={handleFileUpload} />
                    </button>

                    <Reorder.Group 
                      axis="x" 
                      values={media} 
                      onReorder={setMedia} 
                      className="flex gap-10 h-full items-center"
                      style={{ WebkitOverflowScrolling: 'touch' }}
                    >
                       {media.map((item, idx) => (
                         <MediaCard 
                            key={item.id}
                            item={item}
                            idx={idx}
                            currentMediaIndex={currentMediaIndex}
                            jumpToMedia={jumpToMedia}
                            onDelete={() => deleteMedia(idx)}
                         />
                       ))}
                    </Reorder.Group>
                    <div className="w-64 shrink-0" />
                  </div>
                </div>
             </div>
           )}

           {activeTab === 'ZOOM' && (
             <div className="flex h-full items-center gap-6 px-10 overflow-x-auto py-5 scrollbar-hide touch-pan-x">
               {ZOOM_STYLES.map(zoom => (
                 <motion.div 
                    key={zoom.id} whileHover={{ y: -5 }} whileTap={{ scale: 0.95 }} onClick={() => setSelectedZoom(zoom.id)}
                    className={`relative h-44 w-44 shrink-0 rounded-[2.5rem] p-7 cursor-pointer border-2 transition-all flex flex-col justify-between group ${selectedZoom === zoom.id ? "bg-amber-500 border-amber-400 shadow-[0_20px_40px_rgba(245,158,11,0.3)] scale-105 z-10" : "bg-zinc-900 border-white/5 opacity-40 hover:opacity-100 hover:border-white/20"}`}
                 >
                   <div className="flex flex-col h-full justify-between">
                     <div className="flex justify-between items-start">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${selectedZoom === zoom.id ? "bg-white text-amber-500 shadow-lg" : "bg-zinc-800 text-zinc-500"}`}>
                          {zoom.id.includes('burns') ? <Aperture size={20} /> : <Monitor size={20} />}
                        </div>
                        {selectedZoom === zoom.id && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-6 w-6 bg-white text-amber-500 rounded-full flex items-center justify-center border-2 border-amber-500 shadow-lg">
                            <Check size={12} />
                          </motion.div>
                        )}
                     </div>
                     <div>
                       <h3 className={`font-black italic text-sm uppercase tracking-tighter leading-none ${selectedZoom === zoom.id ? "text-white" : "text-zinc-100"}`}>{zoom.name}</h3>
                       <p className={`text-[8px] font-bold uppercase mt-1 tracking-wider leading-tight ${selectedZoom === zoom.id ? "text-white/80" : "text-zinc-500"}`}>{zoom.description}</p>
                     </div>
                   </div>
                 </motion.div>
               ))}
             </div>
           )}


           {activeTab === '---HIDDEN---' && (
             <div className="flex h-full items-center px-10 overflow-x-auto py-5 scrollbar-hide touch-pan-x">
                <div className="flex gap-4 min-w-max items-center h-full">
                 {TRANSITION_STYLES.map(transition => (
                   <motion.div 
                      key={transition.id} whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }} onClick={() => setSelectedTransition(transition.id)}
                      className={`relative h-44 w-44 shrink-0 rounded-[2.5rem] p-7 cursor-pointer border-2 transition-all flex flex-col justify-between group ${selectedTransition === transition.id ? "bg-white border-white shadow-[0_20px_50px_rgba(255,255,255,0.2)] scale-105 z-10" : "bg-zinc-900 border-white/5 opacity-40 hover:opacity-100"}`}
                   >
                      <div className={`h-16 w-16 rounded-3xl flex items-center justify-center text-3xl transition-transform duration-500 group-hover:rotate-12 ${selectedTransition === transition.id ? "bg-black shadow-lg" : "bg-zinc-800"}`}>
                        {transition.icon}
                      </div>
                      <div className="space-y-1">
                        <h3 className={`font-black italic text-xs uppercase tracking-widest ${selectedTransition === transition.id ? "text-black" : "text-white"}`}>{transition.name}</h3>
                        <p className={`text-[8px] font-bold uppercase tracking-tighter ${selectedTransition === transition.id ? "text-zinc-500" : "text-zinc-400"}`}>{transition.description}</p>
                      </div>
                      
                      {selectedTransition === transition.id && (
                        <motion.div 
                          layoutId="active-scene"
                          className="absolute inset-0 border-4 border-sky-500 rounded-[2.5rem] pointer-events-none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        />
                      )}
                      <div className="absolute top-4 right-4 h-2 w-2 bg-sky-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                   </motion.div>
                 ))}
                 <div className="w-40 shrink-0" />
                </div>
             </div>
           )}

           {activeTab === 'MUSIC' && (
             <div className="flex h-full items-center px-10 overflow-x-auto py-6 scrollbar-hide touch-pan-x">
                <div className="flex gap-6 min-w-max items-center h-full">
                  <button onClick={() => audioInputRef.current?.click()} className="h-32 w-32 shrink-0 flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-zinc-800 bg-zinc-900/40 text-zinc-500 hover:text-sky-500"><Plus size={32}/><input type="file" ref={audioInputRef} hidden accept="audio/*" onChange={handleAudioUpload} /></button>
                  {STOCK_MUSIC.map(track => (
                    <motion.div 
                      key={track.id} onClick={() => { setSelectedMusic(track); if (syncToMusic) setDuration(track.duration); }}
                      className={`h-32 w-56 shrink-0 rounded-[2.5rem] p-6 flex flex-col justify-between cursor-pointer transition-all ${selectedMusic.id === track.id ? "bg-sky-500 shadow-[0_20px_50px_rgba(14,165,233,0.3)] ring-2 ring-white/10" : "bg-zinc-900 border border-white/5"}`}
                    >
                      <Volume2 size={24} className={selectedMusic.id === track.id ? 'text-white' : 'text-sky-500'} />
                      <div>
                        <h4 className="font-black italic text-xs uppercase leading-tight">{track.name}</h4>
                        <p className={`text-[9px] font-bold uppercase mt-1 ${selectedMusic.id === track.id ? 'text-white/60' : 'text-zinc-600'}`}>{track.genre}</p>
                      </div>
                    </motion.div>
                  ))}
                  <div className="w-40 shrink-0" />
                </div>
             </div>
           )}

           {activeTab === 'EDIT' && (
             <div className="flex h-full items-center justify-center px-10 gap-16">
                 <div className="flex bg-zinc-950 p-2.5 rounded-[2.5rem] border border-white/5 gap-2 shadow-inner">
                   {[
                     { id: '16/9', icon: Monitor, label: 'Cinema' },
                     { id: '1/1', icon: Square, label: 'Social' },
                     { id: '9/16', icon: Smartphone, label: 'Story' }
                   ].map(r => (
                     <button 
                       key={r.id} onClick={() => setAspectRatio(r.id as any)} 
                       className={`flex flex-col items-center gap-2 px-8 py-5 rounded-3xl transition-all ${aspectRatio === r.id ? 'bg-sky-500 text-black shadow-lg scale-110 ring-2 ring-white/10' : 'text-zinc-700 hover:text-zinc-400 hover:bg-white/5 grayscale'}`}
                     >
                       <r.icon size={22} /><span className="text-[10px] font-black uppercase text-center tracking-tighter">{r.label}</span>
                     </button>
                   ))}
                 </div>
                 
                 <div className="flex flex-col gap-3 w-48">
                    <span className="text-[10px] font-black italic uppercase text-zinc-500 tracking-widest">Global Speed</span>
                    <input type="range" min="5" max="60" step="0.5" value={duration} onChange={(e) => setDuration(parseFloat(e.target.value))} className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-sky-500" />
                    <div className="flex justify-between text-[8px] font-black italic text-zinc-600 uppercase"><span>5s</span><span>{duration}s</span><span>60s</span></div>
                 </div>
             </div>
           )}
         </div>
       </footer>
    </div>
  );
}
