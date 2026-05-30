export interface SceneData {
  id: string;
  title: string;
  subtitle: string;
  engTitle: string;
  shortCopy: string;
  extendedCopy: string[];
  englishSupportingCopy: string;
  videoWebM: string;
  videoMP4: string;
  posterImage: string;
  accentColor: string; // Tailwind color class or hex
  particleColor: number; // Hex code for Three.js
  particleSpeed: number;
  particleSize: number;
  particleCount: number;
  bgTone: string; // e.g., 'dark-moss', 'warm-candle', 'slate-steel'
}

export interface ScrollProgress {
  currentSection: number; // 0 = Hero, 1 = Hunter, 2 = Temple, 3 = Blade, 4 = Concept, 5 = CTA
  overallProgress: number; // 0.00 to 1.00
  sectionProgress: number; // 0.00 to 1.00 within active section
}
