import { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  X, 
  Clock, 
  Compass, 
  Layers, 
  Check, 
  Send, 
  AlertCircle 
} from 'lucide-react';
import { scenes, conceptContent } from '../data/scenes';
import { SceneData } from '../types';
import VideoLayer from './VideoLayer';
import WebGLAtmosphere from './WebGLAtmosphere';
import TextReveal, { CharacterReveal } from './TextReveal';
import CalcomScheduler from './CalcomScheduler';
import ExperienceExplorer from './ExperienceExplorer';

export default function CinematicLanding() {
  const scrollProgressRef = useRef(0);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0); // Kept only for progress bar line rendering
  const [activeSection, setActiveSection] = useState(0); // 0: Hero, 1: Hunter, 2: Blade, 3: Temple, 4: Concept, 5: CTA
  const [isAudioLive, setIsAudioLive] = useState(false);
  const [selectedSceneDetails, setSelectedSceneDetails] = useState<SceneData | null>(null);
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [isCtaDrawerOpen, setIsCtaDrawerOpen] = useState(false);
  const [selectedCtaTopic, setSelectedCtaTopic] = useState('');
  
  // Audio Synthesis Web Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const windVolumeRef = useRef<GainNode | null>(null);
  const oscillationRef = useRef<OscillatorNode | null>(null);
  const bellGainRef = useRef<GainNode | null>(null);

  // Inquiry form states
  const [email, setEmail] = useState('');
  const [visitorName, setVisitorName] = useState('');
  const [notes, setNotes] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  // Main scroll track bounds
  const outerContainerRef = useRef<HTMLDivElement>(null);

  // Track mouse coordinates for WebGL parallax & interactive synth filters
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize coordinate: center is 0, bounds are -1.0 to 1.0
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      
      // Update ref for WebGL without triggering React render
      mousePosRef.current = { x, y };

      // Modulate audio frequencies gently based on mouse moves if audio is active
      if (isAudioLive && audioCtxRef.current) {
        if (oscillationRef.current) {
          // Adjust atmospheric hum filter or wave frequency: 120Hz to 280Hz
          oscillationRef.current.frequency.setValueAtTime(200 + x * 80, audioCtxRef.current.currentTime);
        }
        if (windVolumeRef.current) {
          // Modulate volume slightly on mouse y coordinates (lift)
          windVolumeRef.current.gain.setValueAtTime(0.04 + (1 - y) * 0.03, audioCtxRef.current.currentTime);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isAudioLive]);

  // Master scroll listener tracking standard native vertical progression
  useEffect(() => {
    const handleScroll = () => {
      if (!outerContainerRef.current) return;
      const el = outerContainerRef.current;
      const scrollTop = el.scrollTop;
      const scrollHeight = el.scrollHeight;
      const clientHeight = el.clientHeight;
      const totalScrollable = scrollHeight - clientHeight;

      if (totalScrollable <= 0) return;

      const progress = Math.min(Math.max(scrollTop / totalScrollable, 0), 1);
      
      // Update ref for WebGL without triggering React render
      scrollProgressRef.current = progress;
      
      // Update state for DOM progress bar line rendering
      setScrollProgress(progress);

      // Map progress intervals to section indices:
      // 0.00 to 0.16 : Hero
      // 0.16 to 0.40 : Hunter
      // 0.40 to 0.62 : Temple
      // 0.62 to 0.81 : Blade
      // 0.81 to 0.93 : Concept description
      // 0.93 to 1.00 : Final CTA
      let sec = 0;
      if (progress >= 0.16 && progress < 0.40) sec = 1;
      else if (progress >= 0.40 && progress < 0.62) sec = 2;
      else if (progress >= 0.62 && progress < 0.81) sec = 3;
      else if (progress >= 0.81 && progress < 0.93) sec = 4;
      else if (progress >= 0.93) sec = 5;

      if (sec !== activeSection) {
        setActiveSection(sec);
        // Soft acoustic state ring transition when sections slide over
        if (isAudioLive) {
          triggerZenChime(sec);
        }
      }
    };

    const container = outerContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [activeSection, isAudioLive]);

  // Dynamic sound generator system utilizing HTML5 Web Audio Synthesis
  const toggleAudio = async () => {
    if (isAudioLive) {
      // Quiet everything
      if (audioCtxRef.current) {
        await audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setIsAudioLive(false);
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Create a gorgeous white noise synthesis generator representing distant winter forest air / sea breeze
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Bandpass filter to make noise sound like gentle wind whistling
      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.value = 350;
      windFilter.Q.value = 1.8;

      // LFO (Low Frequency Oscillator) to modulate wood-filter swept wind automatically
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.08; // slow sweeping waves (8s cycles)
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 180; // range sweep in Hz

      lfo.connect(lfoGain);
      lfoGain.connect(windFilter.frequency);
      lfo.start();

      // Atmospheric gain node
      const windGain = ctx.createGain();
      windGain.gain.value = 0.04;
      windVolumeRef.current = windGain;

      whiteNoise.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(ctx.destination);
      whiteNoise.start();

      // Slow grounding hum
      const humOsc = ctx.createOscillator();
      humOsc.type = 'sine';
      humOsc.frequency.value = 180; // grounding low tone
      oscillationRef.current = humOsc;

      const humGain = ctx.createGain();
      humGain.gain.value = 0.012; // extremely quiet ambient hum

      // Gentle LFO for hum breathing amplitude
      const humLfo = ctx.createOscillator();
      humLfo.frequency.value = 0.15; // 6-second breath
      const humLfoGain = ctx.createGain();
      humLfoGain.gain.value = 0.005;

      humLfo.connect(humLfoGain);
      humLfoGain.connect(humGain.gain);
      humLfo.start();

      humOsc.connect(humGain);
      humGain.connect(ctx.destination);
      humOsc.start();

      // Bell chime setup for interaction points
      const bellGain = ctx.createGain();
      bellGain.gain.value = 0;
      bellGainRef.current = bellGain;
      bellGain.connect(ctx.destination);

      setIsAudioLive(true);
      
      // Trigger opening chime!
      setTimeout(() => {
        triggerZenChime(0);
      }, 300);

    } catch (e) {
      console.error('Audio initialization blocked or failed:', e);
    }
  };

  // Ring a synthesized high-frequency sine-wave bell mimicking temple bells or crystal bowls
  const triggerZenChime = (sectionIndex: number) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    // Harmonious ancient Japanese chords depending on scene index
    // 0: A4 (440Hz), 1: C5 (523Hz), 2: E5 (659Hz), 3: G5 (784Hz), 4: A5 (880Hz), 5: C6 (1046Hz)
    const tones = [440, 523.25, 659.25, 783.99, 880, 1046.50];
    const targetFreq = tones[sectionIndex % tones.length];

    // Strike 1: Primary fundamental bell
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(targetFreq, ctx.currentTime);

    // Strike 2: Sub-harmonic chime
    const subOsc = ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(targetFreq * 1.5, ctx.currentTime);

    const chimeGain = ctx.createGain();
    chimeGain.gain.setValueAtTime(0, ctx.currentTime);
    chimeGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.05); // quick attack
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 4.5); // long lazy decays

    osc.connect(chimeGain);
    subOsc.connect(chimeGain);
    chimeGain.connect(ctx.destination);

    osc.start();
    subOsc.start();

    // Clean up oscillator sources following decay envelope
    osc.stop(ctx.currentTime + 5);
    subOsc.stop(ctx.currentTime + 5);
  };

  // Navigational helper: Click to smoothly scroll outer container to specified section offset
  const scrollToSection = (secIndex: number) => {
    if (!outerContainerRef.current) return;
    const el = outerContainerRef.current;
    const scrollHeight = el.scrollHeight;
    const clientHeight = el.clientHeight;
    const scrollableRange = scrollHeight - clientHeight;

    // Anchor points aligned with scrolling intervals
    const targets = [0, 0.28, 0.51, 0.72, 0.87, 1.00];
    const targetPercentage = targets[secIndex];

    el.scrollTo({
      top: scrollPercentageToPixels(targetPercentage, scrollableRange),
      behavior: 'smooth'
    });
  };

  const scrollPercentageToPixels = (pct: number, range: number) => {
    return pct * range;
  };

  // Set scene state parameters for WebGL atmosphere controls
  const getAtmosphereId = () => {
    if (activeSection === 0) return 'hero';
    if (activeSection === 1) return 'hunter';
    if (activeSection === 2) return 'blade';
    if (activeSection === 3) return 'temple';
    if (activeSection === 4) return 'concept';
    return 'cta';
  };

  const handleSubmitInquiry = (e: FormEvent) => {
    e.preventDefault();
    if (!email || !visitorName) {
      setFormError('お名前とメールアドレスは必須です。Please provide your name and email.');
      return;
    }

    setFormError('');
    // Store in local persistence list
    const inquiry = {
      name: visitorName,
      email,
      notes,
      interest: selectedCtaTopic || 'General Inquiry',
      timestamp: new Date().toISOString()
    };
    
    const existing = JSON.parse(localStorage.getItem('hitotoki_inquiries') || '[]');
    existing.push(inquiry);
    localStorage.setItem('hitotoki_inquiries', JSON.stringify(existing));

    setFormSubmitted(true);
    if (isAudioLive) {
      // Ring multiple success chimes
      setTimeout(() => triggerZenChime(4), 100);
      setTimeout(() => triggerZenChime(5), 300);
    }
  };

  const resetFormState = () => {
    setEmail('');
    setVisitorName('');
    setNotes('');
    setFormSubmitted(false);
    setFormError('');
  };

  return (
    <div id="hitotoki-page-frame" className="relative w-full h-screen overflow-hidden text-[#e5e5e5] selection:bg-[#333333] selection:text-white font-sans bg-[#0a0a0a]">
      
      {/* Atmospheric Dust/Grain Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-overlay z-30" style={{ backgroundImage: `url('data:image/svg+xml,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E')` }}></div>

      {/* Dynamic Background Base Video Layer (WebGL Scrubbing) */}
      <VideoLayer activeSceneId={getAtmosphereId()} scrollProgressRef={scrollProgressRef} />

      {/* Embedded Ambient WebGL Particles Layer */}
      <WebGLAtmosphere activeSceneId={getAtmosphereId()} mousePosRef={mousePosRef} />

      {/* Fixed UI Header */}
      <header 
        className="absolute top-0 left-0 w-full flex justify-between items-center z-40 bg-gradient-to-b from-[#0a0a0a]/80 to-transparent backdrop-blur-[1px]"
        style={{
          paddingLeft: '33px',
          paddingRight: '33px',
          paddingTop: '20px',
          paddingBottom: '20px',
        }}
      >
        <div 
          onClick={() => scrollToSection(0)} 
          className="cursor-pointer group select-none flex items-center gap-3"
        >
          <span className="font-serif tracking-[0.3em] text-xl sm:text-2xl font-light text-white group-hover:text-[#bf9a62] transition-colors duration-500 uppercase">
            Hitotoki
          </span>
        </div>

        {/* Floating Menu Block - Brand Experience Entrances */}
        <div className="flex gap-8 sm:gap-12 text-[10px] tracking-[0.25em] font-serif uppercase">
          <span 
            onClick={() => setIsExplorerOpen(true)}
            className="text-white/40 cursor-pointer hover:text-white hover:scale-105 active:scale-95 transform transition-all duration-500"
          >
            探す
          </span>
          <span 
            onClick={() => setIsExplorerOpen(true)}
            className="text-white/40 cursor-pointer hover:text-white hover:scale-105 active:scale-95 transform transition-all duration-500"
          >
            滞在体験
          </span>
          <span 
            onClick={() => {
              setSelectedCtaTopic('新しく滞在を希望する');
              setIsCtaDrawerOpen(true);
              resetFormState();
            }}
            className="text-[#bf9a62] cursor-pointer hover:text-white hover:scale-105 active:scale-95 transform transition-all duration-500 font-light relative after:content-[''] after:absolute after:-bottom-1.5 after:left-0 after:w-full after:h-[1px] after:bg-[#bf9a62]/50 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-500 after:origin-left"
          >
            問い合わせ
          </span>
        </div>
      </header>

      {/* Fixed progress thin line tracer */}
      <div className="absolute left-0 bottom-0 h-[2px] bg-gradient-to-r from-emerald-950 via-[#bf9a62] to-amber-950 z-40 transition-all duration-100" style={{ width: `${scrollProgress * 100}%` }} />

      {/* ========================================================== */}
      {/* EDITORIAL FIXED TEXT CANVAS LAYER (Layer 3) */}
      {/* BUG FIX: Added pointer-events-none to the main wrapper to ensure it doesn't block scrolls,
          while keeping z-index higher than the scroll track. */}
      {/* ========================================================== */}
      <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-start p-8 sm:p-16 md:p-24 md:px-28">
        
        {/* SECTION 0: OPENING HERO (activeSection === 0) */}
        <motion.div
          animate={{ 
            opacity: activeSection === 0 ? 1 : 0, 
            y: activeSection === 0 ? 0 : (activeSection > 0 ? -40 : 40),
            pointerEvents: activeSection === 0 ? 'auto' : 'none'
          }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none"
          style={{
            display: Math.abs(activeSection - 0) <= 1 ? 'flex' : 'none'
          }}
        >
          {/* BUG FIX: Ensure interactive elements catch clicks but don't stop scroll events from passing through to the wrapper.
              Changed pointer-events-auto to specific elements only. */}
          <div className="flex flex-col items-center text-center max-w-2xl px-4 pointer-events-none">
            <h1 className="font-serif text-2xl sm:text-3xl md:text-5xl text-white font-light tracking-[0.25em] leading-relaxed mb-8 select-text pointer-events-auto">
              誰かの人生に、ひととき滞在する。
            </h1>
            <p className="font-serif text-sm sm:text-base tracking-[0.15em] text-slate-300 leading-relaxed font-light select-text max-w-xl pointer-events-auto">
              異なる日常、異なる職能、あるいは密やかな生活のリズムに身をまかせる。
            </p>
            
            <div 
              onClick={() => scrollToSection(1)}
              className="mt-16 flex items-center gap-3 cursor-pointer group pointer-events-auto"
            >
              <span className="font-serif text-[10px] sm:text-xs tracking-[0.3em] text-white/40 group-hover:text-white/80 transition-colors uppercase">スクロールして開始</span>
              <ArrowRight size={14} className="text-white/30 group-hover:text-white/80 group-hover:translate-y-1 transition-all duration-300 rotate-90" />
            </div>
          </div>
        </motion.div>

        {/* Common Container for Side-Aligned Sections */}
        <div className="relative w-full h-[72vh] flex items-end">
          
          {/* SECTION 1: SHI / FOREST & HUNTER (activeSection === 1) */}
          <motion.div
            animate={{ 
              opacity: activeSection === 1 ? 1 : 0, 
              y: activeSection === 1 ? 0 : (activeSection > 1 ? -40 : 40),
              pointerEvents: activeSection === 1 ? 'auto' : 'none'
            }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-6 right-0 w-full max-w-sm sm:max-w-md flex flex-col items-end text-right pointer-events-none"
            style={{
              display: Math.abs(activeSection - 1) <= 1 ? 'flex' : 'none'
            }}
          >
            <div className="flex flex-col items-end text-right pointer-events-none">
              <h2 className="font-serif text-lg sm:text-xl md:text-2xl text-white font-light tracking-[0.2em] leading-snug mb-4 select-text pointer-events-auto">
                森に入る、猟師になる。
              </h2>
              <div className="w-12 h-[1px] bg-[#8fa89b]/35 mb-6 pointer-events-none" />
              
              <div className="font-serif text-xs sm:text-[13px] text-[#cbd5e1] tracking-[0.16em] leading-[2.2] space-y-3 font-light select-text pointer-events-auto">
                {scenes[0].extendedCopy.map((line, lidx) => (
                  <p key={lidx}>{line}</p>
                ))}
              </div>

              <button 
                onClick={() => setSelectedSceneDetails(scenes[0])}
                className="mt-8 group flex items-center gap-2.5 text-[11px] font-serif tracking-[0.2em] text-[#8fa89b] hover:text-white transition-all duration-300 pointer-events-auto flex-row-reverse"
              >
                滞在について
                <ArrowRight size={13} className="group-hover:-translate-x-1.5 transition-transform duration-300 pointer-events-auto rotate-180" />
              </button>
            </div>
          </motion.div>

          {/* SECTION 2: BLADE / THE ART OF FOCUS (activeSection === 2) */}
          <motion.div
            animate={{ 
              opacity: activeSection === 2 ? 1 : 0, 
              y: activeSection === 2 ? 0 : (activeSection > 2 ? -40 : 40),
              pointerEvents: activeSection === 2 ? 'auto' : 'none'
            }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-6 left-0 w-full max-w-sm sm:max-w-md flex flex-col items-start text-left pointer-events-none"
            style={{
              display: Math.abs(activeSection - 2) <= 1 ? 'flex' : 'none'
            }}
          >
            <div className="flex flex-col items-start text-left pointer-events-none">
              <h2 className="font-serif text-lg sm:text-xl md:text-2xl text-white font-light tracking-[0.2em] leading-snug mb-4 select-text pointer-events-auto">
                一瞬を斬る。
              </h2>
              <div className="w-12 h-[1px] bg-slate-500/45 mb-6 pointer-events-none" />
              
              <div className="font-serif text-xs sm:text-[13px] text-[#cbd5e1] tracking-[0.16em] leading-[2.2] space-y-3 font-light select-text pointer-events-auto">
                {scenes[2].extendedCopy.map((line, lidx) => (
                  <p key={lidx}>{line}</p>
                ))}
              </div>

              <button 
                onClick={() => setSelectedSceneDetails(scenes[2])}
                className="mt-8 group flex items-center gap-2.5 text-[11px] font-serif tracking-[0.2em] text-slate-300 hover:text-white transition-all duration-300 pointer-events-auto"
              >
                滞在について
                <ArrowRight size={13} className="group-hover:translate-x-1.5 transition-transform duration-300 pointer-events-auto" />
              </button>
            </div>
          </motion.div>

          {/* SECTION 3: SILENCE / TEMPLE & ZEN (activeSection === 3) */}
          <motion.div
            animate={{ 
              opacity: activeSection === 3 ? 1 : 0, 
              y: activeSection === 3 ? 0 : (activeSection > 3 ? -40 : 40),
              pointerEvents: activeSection === 3 ? 'auto' : 'none'
            }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-6 right-0 w-full max-w-sm sm:max-w-md flex flex-col items-end text-right pointer-events-none"
            style={{
              display: Math.abs(activeSection - 3) <= 1 ? 'flex' : 'none'
            }}
          >
            <div className="flex flex-col items-end text-right pointer-events-none">
              <h2 className="font-serif text-lg sm:text-xl md:text-2xl text-white font-light tracking-[0.2em] leading-snug mb-4 select-text pointer-events-auto">
                静寂に入る寺修行。
              </h2>
              <div className="w-12 h-[1px] bg-[#dca878]/35 mb-6 pointer-events-none" />
              
              <div className="font-serif text-xs sm:text-[13px] text-[#cbd5e1] tracking-[0.16em] leading-[2.2] space-y-3 font-light select-text pointer-events-auto">
                {scenes[1].extendedCopy.map((line, lidx) => (
                  <p key={lidx}>{line}</p>
                ))}
              </div>

              <button 
                onClick={() => setSelectedSceneDetails(scenes[1])}
                className="mt-8 group flex items-center gap-2.5 text-[11px] font-serif tracking-[0.2em] text-[#e4b588] hover:text-white transition-all duration-300 pointer-events-auto flex-row-reverse"
              >
                滞在について
                <ArrowRight size={13} className="group-hover:-translate-x-1.5 transition-transform duration-300 pointer-events-auto rotate-180" />
              </button>
            </div>
          </motion.div>

          {/* SECTION 4: CONCEPT PHILOSOPHY (activeSection === 4) */}
          <motion.div
            animate={{ 
              opacity: activeSection === 4 ? 1 : 0, 
              y: activeSection === 4 ? 0 : (activeSection > 4 ? -40 : 40),
              pointerEvents: activeSection === 4 ? 'auto' : 'none'
            }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-6 right-0 w-full max-w-sm sm:max-w-md flex flex-col items-end text-right pointer-events-none"
            style={{
              display: Math.abs(activeSection - 4) <= 1 ? 'flex' : 'none'
            }}
          >
            <div className="flex flex-col items-end text-right pointer-events-none">
              <h2 className="font-serif text-lg sm:text-xl md:text-2xl text-white font-light tracking-[0.2em] leading-snug mb-4 select-text pointer-events-auto">
                誰かの人生に、ひととき滞在する。
              </h2>
              <div className="w-12 h-[1px] bg-[#bf9a62]/35 mb-6 pointer-events-none" />
              
              <div className="font-serif text-xs sm:text-[13px] text-[#cbd5e1] tracking-[0.16em] leading-[2.2] space-y-3 font-light select-text pointer-events-auto">
                {conceptContent.japaneseCopy.map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>

              <button 
                onClick={() => scrollToSection(5)}
                className="mt-8 group flex items-center gap-2.5 text-[11px] font-serif tracking-[0.2em] text-[#bf9a62] hover:text-white transition-all duration-300 pointer-events-auto flex-row-reverse"
              >
                希望の登録へ
                <ArrowRight size={13} className="group-hover:-translate-x-1.5 transition-transform duration-300 pointer-events-auto rotate-180" />
              </button>
            </div>
          </motion.div>

          {/* SECTION 5: FINAL CTA ACTION (activeSection === 5) */}
          <motion.div
            animate={{ 
              opacity: activeSection === 5 ? 1 : 0, 
              y: activeSection === 5 ? 0 : (activeSection > 5 ? -40 : 40),
              pointerEvents: activeSection === 5 ? 'auto' : 'none'
            }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            style={{
              display: Math.abs(activeSection - 5) <= 1 ? 'flex' : 'none'
            }}
          >
            <div className="pointer-events-auto flex flex-col items-center text-center w-full max-w-md px-4 py-8 bg-black/20 backdrop-blur-sm border border-white/5 rounded-lg shadow-2xl">
              <h2 className="font-serif text-xl sm:text-2xl text-white font-light tracking-[0.20em] leading-snug mb-4 select-text">
                滞在のお申し込み
              </h2>
              <div className="w-12 h-[1px] bg-[#bf9a62]/35 mb-6" />
              
              <p className="font-serif text-xs text-[#8ea499] tracking-[0.15em] leading-[1.8] mb-8 font-light select-text">
                各地の達人と直接手を取り合い、その静けさ薫る日常の調律を、ごく少数のお客様限定のプライベートな滞在プログラムとしてご案内いたします。
              </p>

              <div className="flex flex-col gap-4 w-full">
                <button
                  onClick={() => {
                    setIsExplorerOpen(true);
                  }}
                  className="w-full text-center py-3.5 px-4 border border-[#bf9a62]/30 bg-[#bf9a62]/5 hover:bg-[#bf9a62]/15 hover:border-[#bf9a62]/60 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(191,154,98,0.15)] text-[11px] font-serif tracking-[0.2em] text-[#f7e0bc] rounded transform transition-all duration-300 pointer-events-auto"
                >
                  滞在一覧を探索する (Airbnb風) →
                </button>

                <button
                  onClick={() => {
                    setSelectedCtaTopic('個別手配の調整・問い合わせ');
                    setIsCtaDrawerOpen(true);
                    resetFormState();
                  }}
                  className="w-full text-center py-3.5 px-4 border border-white/10 bg-white/[0.01] hover:bg-white/[0.08] hover:border-white/40 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(255,255,255,0.05)] text-[11px] font-serif tracking-[0.2em] text-white rounded transform transition-all duration-300 pointer-events-auto"
                >
                  手配の相談・マニュアル問い合わせ →
                </button>
              </div>

              {/* Minimal footer inside bottom panel */}
              <div className="mt-8 pt-6 border-t border-white/5 text-[9px] font-serif tracking-widest text-white/20 select-text flex flex-col gap-2 w-full">
                <span>© 2026 ひととき PROJECT</span>
                <span>
                  <a 
                    href="#inquiries" 
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedCtaTopic('Review Submitted Inquiries');
                      setIsCtaDrawerOpen(true);
                    }}
                    className="hover:text-white transition-colors underline decoration-white/10 pointer-events-auto"
                  >
                    保存された問い合わせを確認する
                  </a>
                </span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Transparent Scrollable Dummy Native Track */}
      {/* BUG FIX: Reduced z-index to 20 so it stays strictly behind interactive elements.
          Maintained pointer-events-auto so it can catch wheel/touch scroll events. */}
      <div 
        ref={outerContainerRef}
        id="native-scroll-wrapper"
        className="absolute inset-0 w-full h-full overflow-y-scroll overflow-x-hidden z-20 pointer-events-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="h-screen w-full select-none pointer-events-none" />
        <div className="h-screen w-full select-none pointer-events-none" />
        <div className="h-screen w-full select-none pointer-events-none" />
        <div className="h-screen w-full select-none pointer-events-none" />
        <div className="h-screen w-full select-none pointer-events-none" />
        <div className="h-screen w-full select-none pointer-events-none" />
      </div>

      {/* ========================================================== */}
      {/* GENERIC FULL SCREEN SLIDE-OVER DRAWER: EXPERIENCE DETAIL */}
      {/* ========================================================== */}
      <AnimatePresence>
        {selectedSceneDetails && (
          <div className="fixed inset-0 w-full h-full z-50 flex justify-end">
            
            {/* Backdrop Blur overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSceneDetails(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md pointer-events-auto"
            />

            {/* Drawer Body content */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 180 }}
              className="relative w-full max-w-xl md:max-w-2xl h-full bg-[#0a0a0a] border-l border-white/5 p-8 sm:p-12 overflow-y-auto z-10 flex flex-col justify-between pointer-events-auto shadow-[0_0_50px_rgba(0,0,0,0.8)]"
            >
              {/* Close Button top right */}
              <button 
                onClick={() => setSelectedSceneDetails(null)}
                className="absolute top-6 right-6 p-2 text-white/40 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              {/* Detail Content section block */}
              <div className="mt-8 flex-grow">
                <span className="font-serif text-[10px] tracking-[0.3em] text-[#bf9a62] block mb-3">
                  滞在設計図
                </span>
                
                <h3 className="font-serif text-3xl sm:text-4xl text-white font-light tracking-[0.18em] mb-4">
                  {selectedSceneDetails.title}
                </h3>
                
                <p className="font-serif text-sm text-[#8ea499] tracking-widest mb-8 border-b border-white/5 pb-6">
                  {selectedSceneDetails.subtitle}
                </p>

                {/* Grid details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 my-8 pb-8 border-b border-white/5">
                  <div className="flex gap-4">
                    <Clock size={18} className="text-[#bf9a62] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-serif text-xs tracking-wider text-white mb-1">滞在日程</h4>
                      <p className="font-serif text-xs text-[#cbd5e1] leading-relaxed">
                        {selectedSceneDetails.id === 'hunter' && '4日間（秋から冬への移行期）'}
                        {selectedSceneDetails.id === 'temple' && '3日間（全季節対応）'}
                        {selectedSceneDetails.id === 'blade' && '5日間（春秋限定）'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Compass size={18} className="text-[#bf9a62] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-serif text-xs tracking-wider text-white mb-1">滞在場所</h4>
                      <p className="font-serif text-xs text-[#cbd5e1] leading-relaxed">
                        {selectedSceneDetails.id === 'hunter' && '秋田県北部・山深き深緑の森'}
                        {selectedSceneDetails.id === 'temple' && '京都府宇治郊外・山間の寺院'}
                        {selectedSceneDetails.id === 'blade' && '高知県仁淀川流域・里山の古民家鍛冶場'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Immersive Day Timeline Scheduler */}
                <div className="space-y-6">
                  <h4 className="font-serif text-xs tracking-[0.25em] text-[#bf9a62] mb-4 border-b border-white/5 pb-2">
                    達人の一日（日課表）
                  </h4>
                  
                  {selectedSceneDetails.id === 'hunter' && (
                    <div className="space-y-4 font-serif text-sm text-slate-300">
                      <div className="flex border-l border-[#8fa89b]/30 pl-4 py-1">
                        <span className="font-mono text-xs tracking-wider text-[#8fa89b] w-20 block shrink-0">05:15</span>
                        <p className="select-text">朝の氷点下ウォーミング。猟師の呼吸法と歩法。冷えた山風を吸い込む。</p>
                      </div>
                      <div className="flex border-l border-[#8fa89b]/30 pl-4 py-1">
                        <span className="font-mono text-xs tracking-wider text-[#8fa89b] w-20 block shrink-0">06:45</span>
                        <p className="select-text">森への立ち入り。無言の追跡練習、足跡の解読と獣道の読図。</p>
                      </div>
                      <div className="flex border-l border-[#8fa89b]/30 pl-4 py-1">
                        <span className="font-mono text-xs tracking-wider text-[#8fa89b] w-20 block shrink-0">12:30</span>
                        <p className="select-text">焚き火での昼食。ジビエ肉と山野草の調味。自然の恵みを受けとる儀式。</p>
                      </div>
                      <div className="flex border-l border-[#8fa89b]/30 pl-4 py-1">
                        <span className="font-mono text-xs tracking-wider text-[#8fa89b] w-20 block shrink-0">16:00</span>
                        <p className="select-text">里山への帰還。毛皮の処理と肉の解体法。ナイフの保全。命と感謝の向き合い。</p>
                      </div>
                    </div>
                  )}

                  {selectedSceneDetails.id === 'temple' && (
                    <div className="space-y-4 font-serif text-sm text-slate-300">
                      <div className="flex border-l border-[#dca878]/30 pl-4 py-1">
                        <span className="font-mono text-xs tracking-wider text-[#dca878] w-20 block shrink-0">04:30</span>
                        <p className="select-text">開敷鐘（かいふしょう）の響き。朝の坐禅。呼吸だけの往復を聞く静止時間。</p>
                      </div>
                      <div className="flex border-l border-[#dca878]/30 pl-4 py-1">
                        <span className="font-mono text-xs tracking-wider text-[#dca878] w-20 block shrink-0">07:00</span>
                        <p className="select-text">作務（さむ）。廊下や庭石の磨き掃除。身体を使った動的な修業。</p>
                      </div>
                      <div className="flex border-l border-[#dca878]/30 pl-4 py-1">
                        <span className="font-mono text-xs tracking-wider text-[#dca878] w-20 block shrink-0">11:30</span>
                        <p className="select-text">一汁一菜のお粥。お椀を叩く作法を守りながら、無言のなぞり食。</p>
                      </div>
                      <div className="flex border-l border-[#dca878]/30 pl-4 py-1">
                        <span className="font-mono text-xs tracking-wider text-[#dca878] w-20 block shrink-0">19:30</span>
                        <p className="select-text">夜香坐（夜の坐禅）。一振りの線香が消えるまでの静かな闇時間。</p>
                      </div>
                    </div>
                  )}

                  {selectedSceneDetails.id === 'blade' && (
                    <div className="space-y-4 font-serif text-sm text-slate-300">
                      <div className="flex border-l border-slate-500/30 pl-4 py-1">
                        <span className="font-mono text-xs tracking-wider text-slate-400 w-20 block shrink-0">08:00</span>
                        <p className="select-text">神棚への拝礼、炭起こし。炎の燃焼色を読み取り、砂鉄を鉄床に乗せる。</p>
                      </div>
                      <div className="flex border-l border-slate-500/30 pl-4 py-1">
                        <span className="font-mono text-xs tracking-wider text-slate-400 w-20 block shrink-0">09:30</span>
                        <p className="select-text">槌打ち（大槌と小槌の呼応）。一打ごとに均等な厚みを整える鍛錬。</p>
                      </div>
                      <div className="flex border-l border-slate-500/30 pl-4 py-1">
                        <span className="font-mono text-xs tracking-wider text-slate-400 w-20 block shrink-0">13:30</span>
                        <p className="select-text">土置き（焼き入れの準備）。刃に独自の幾何学紋様を描き出す繊細な粘土引き。</p>
                      </div>
                      <div className="flex border-l border-slate-500/30 pl-4 py-1">
                        <span className="font-mono text-xs tracking-wider text-slate-400 w-20 block shrink-0">16:30</span>
                        <p className="select-text">焼き入れ式。鍛冶場の灯りを消した完全な闇の中、一瞬で水に沈める精神統一。</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Interactive Cal.com Scheduler in Flagships */}
                <div className="mt-8 pt-6 border-t border-white/5">
                  <CalcomScheduler 
                    experienceTitle={selectedSceneDetails.title}
                    location={
                      selectedSceneDetails.id === 'hunter' ? '秋田県北部・山深き深緑の森' :
                      selectedSceneDetails.id === 'temple' ? '京都府宇治郊外・山間の寺院' :
                      '高知県仁淀川流域・里山の古民家鍛冶場'
                    }
                    defaultSlots={
                      selectedSceneDetails.id === 'hunter' ? ['05:15 - 呼吸法訓練', '06:45 - 追跡随行', '12:30 - 森の焚火', '16:00 - 解体修事'] :
                      selectedSceneDetails.id === 'temple' ? ['04:30 - 坐禅瞑想', '07:00 - 古庭作務', '11:30 - 精進粥作', '19:30 - 夜線香坐'] :
                      ['08:00 - 神社参拝', '09:30 - 槌打調和', '13:30 - 土置粘土', '16:30 - 焼入決闘']
                    }
                  />
                </div>

              </div>

              {/* Action and Disclaimer bottom */}
              <div className="mt-8 border-t border-white/5 pt-6 flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#07090c]/40 p-4 rounded border border-white/5">
                <p className="font-serif text-[10px] text-[#8ea499] tracking-wider leading-relaxed max-w-sm">
                  人数限定のご案内となります。各期間ともお一人ずつの滞在引き受けとなります。
                </p>
                
                <button
                  onClick={() => {
                    setSelectedCtaTopic(`個別手配調整の希望: ${selectedSceneDetails.title}`);
                    setSelectedSceneDetails(null);
                    setIsCtaDrawerOpen(true);
                    resetFormState();
                  }}
                  className="px-5 py-2.5 bg-[#bf9a62] hover:bg-[#a9814c] text-black font-serif text-xs tracking-wider rounded transition-colors whitespace-nowrap"
                >
                  調整の相談をする →
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================== */}
      {/* GENERIC FULL SCREEN SLIDE-OVER DRAWER: CTA INQUIRY FORM */}
      {/* ========================================================== */}
      <AnimatePresence>
        {isCtaDrawerOpen && (
          <div className="fixed inset-0 w-full h-full z-50 flex justify-end">
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCtaDrawerOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md pointer-events-auto"
            />

            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 180 }}
              className="relative w-full max-w-xl h-full bg-[#0a0a0a] border-l border-white/5 p-8 sm:p-12 overflow-y-auto z-10 flex flex-col justify-between pointer-events-auto shadow-[0_0_50px_rgba(0,0,0,0.8)]"
            >
              <button 
                onClick={() => setIsCtaDrawerOpen(false)}
                className="absolute top-6 right-6 p-2 text-white/40 hover:text-white transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>

              <div className="mt-8 flex-grow">
                
                {selectedCtaTopic === 'Review Submitted Inquiries' ? (
                  // Historical inquiries inspection list
                  <div>
                    <span className="font-serif text-[10px] tracking-[0.3em] text-[#bf9a62] block mb-3">
                      ローカル保存記録
                    </span>
                    <h3 className="font-serif text-3xl text-white font-light tracking-[0.12em] mb-4">
                      送信済みのお問い合せ
                    </h3>
                    <p className="font-serif text-xs text-[#8ea499] mb-8 border-b border-white/5 pb-4">
                      このブラウザのローカルストレージに保存されている問い合わせ履歴です。
                    </p>

                    <SubmittedInquiriesList />
                  </div>
                ) : (
                  // Intake form
                  <div>
                    <span className="font-serif text-[10px] tracking-[0.3em] text-[#bf9a62] block mb-3">
                      問い合わせプロファイル
                    </span>
                    <h3 className="font-serif text-3xl text-white font-light tracking-[0.12em] mb-4">
                      滞在希望の登録
                    </h3>
                    
                    <p className="font-serif text-xs text-[#8ea499] leading-relaxed mb-8 font-light">
                      Hitotoki との直接のやり取りを開始します。理想の滞在を個別に調整するため、ご要望をお知らせください。
                    </p>

                    <div className="my-3 p-3 bg-white/[0.01] border border-white/5 rounded">
                      <span className="font-serif text-[9px] tracking-wider text-amber-600 block mb-1">選択中の滞在内容:</span>
                      <span className="font-serif text-sm text-white tracking-widest">{selectedCtaTopic || '一般的な滞在体験'}</span>
                    </div>

                    {!formSubmitted ? (
                      <form onSubmit={handleSubmitInquiry} className="space-y-6 mt-8">
                        {formError && (
                          <div className="p-3 bg-red-950/20 border border-red-900/40 text-[11px] text-red-200 rounded flex gap-2 items-center">
                            <AlertCircle size={14} className="text-red-400 shrink-0" />
                            <span>{formError}</span>
                          </div>
                        )}

                        <div>
                          <label className="font-serif text-[10px] tracking-widest text-[#8ea499] block mb-1">
                            お名前 *
                          </label>
                          <input 
                            type="text" 
                            value={visitorName}
                            onChange={(e) => setVisitorName(e.target.value)}
                            className="w-full bg-white/[0.02] border border-white/10 rounded px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#bf9a62] transition-colors font-serif"
                            placeholder="例：田中 健二"
                            required
                          />
                        </div>

                        <div>
                          <label className="font-serif text-[10px] tracking-widest text-[#8ea499] block mb-1">
                            メールアドレス *
                          </label>
                          <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/[0.02] border border-white/10 rounded px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#bf9a62] transition-colors font-serif"
                            placeholder="例：kenji.tanaka@example.jp"
                            required
                          />
                        </div>

                        <div>
                          <label className="font-serif text-[10px] tracking-widest text-[#8ea499] block mb-1">
                            ご要望、ご自身の背景など（自由記述）
                          </label>
                          <textarea 
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                            className="w-full bg-white/[0.02] border border-white/10 rounded px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#bf9a62] transition-colors resize-none font-serif"
                            placeholder="どのような背景をお持ちか、なぜこの美しい日常に入り込みたいのか、時期等のご希望や制限などがあれば詳しくお聞かせください。"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3.5 bg-[#bf9a62] hover:bg-[#a9814c] text-black font-serif text-[11px] tracking-[0.2em] font-light uppercase rounded transition-colors flex items-center justify-center gap-2 pointer-events-auto"
                        >
                          <Send size={12} />
                          問い合わせ情報を保存する
                        </button>
                      </form>
                    ) : (
                      // Success intake screen
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12 px-4 bg-emerald-950/10 border border-emerald-900/30 rounded mt-8"
                      >
                        <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center mx-auto mb-4 text-emerald-400">
                          <Check size={22} />
                        </div>
                        <h4 className="font-serif text-xl text-white font-light mb-3">
                          受け付けいたしました。
                        </h4>
                        <p className="font-serif text-xs text-[#8ea499] leading-relaxed max-w-sm mx-auto font-light">
                          登録が完了し、ブラウザのローカルストレージに安全に記録されました。いただいた内容をもとに、滞在手配のためのご連絡をいたします。
                        </p>

                        <button
                          onClick={resetFormState}
                          className="mt-8 text-xs font-serif text-[#bf9a62] hover:text-white tracking-widest uppercase border-b border-transparent hover:border-[#bf9a62]/35 pb-0.5 animate-pulse"
                        >
                          別のお問い合わせを登録する
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}

              </div>

              {/* Drawer footer close guide */}
              <div className="mt-8 border-t border-white/5 pt-6 flex justify-between items-center text-[10px] font-serif text-white/25 select-none text-right">
                <span>ひとときプライベート滞在手配サービス</span>
                <span>ESCキーで閉じる</span>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Experience Explorer Overlay (Airbnb-style platform listings) */}
      <ExperienceExplorer 
        isOpen={isExplorerOpen} 
        onClose={() => setIsExplorerOpen(false)} 
      />

    </div>
  );
}

// Subcomponent rendering submitted inquiries saved securely in localStorage
function SubmittedInquiriesList() {
  const [list, setList] = useState<any[]>([]);

  useEffect(() => {
    const listData = JSON.parse(localStorage.getItem('hitotoki_inquiries') || '[]');
    setList(listData);
  }, []);

  const handleClearInquiries = () => {
    if (window.confirm('保存されているすべての送信履歴を消去しますか？')) {
      localStorage.removeItem('hitotoki_inquiries');
      setList([]);
    }
  };

  if (list.length === 0) {
    return (
      <div className="text-center py-16 px-4 border border-dashed border-white/10 rounded text-slate-500 font-serif italic text-sm">
        現在、このブラウザに保存された送信履歴はありません。
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <span className="font-serif text-[10px] text-[#8ea499]">{list.length} 件の保存された記録</span>
        <button 
          onClick={handleClearInquiries}
          className="text-[10px] font-serif text-red-400/70 hover:text-red-400 hover:underline"
        >
          履歴を消去する
        </button>
      </div>

      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
        {list.slice().reverse().map((item: any, idx: number) => (
          <div key={idx} className="p-4 bg-white/[0.02] border border-white/5 rounded flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-serif text-sm font-light text-white">{item.name}</span>
                <span className="font-mono text-[10px] text-[#cda579] block mt-0.5">{item.email}</span>
              </div>
              <span className="font-serif text-[9px] text-[#8ea89b] bg-[#8ea89b]/10 px-2 py-0.5 rounded tracking-wide">
                {item.interest.replace('Arrangement Interest: ', '').replace('個別手配調整の希望: ', '')}
              </span>
            </div>

            {item.notes && (
              <p className="font-serif text-xs text-slate-400 bg-black/30 p-2.5 rounded italic leading-relaxed whitespace-pre-line mt-2 text-justify select-text font-light">
                "{item.notes}"
              </p>
            )}

            <span className="font-serif text-[8px] text-white/25 self-end mt-1">
              送信日時: {new Date(item.timestamp).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
