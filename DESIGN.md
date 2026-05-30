# Hitotoki Landing Page Design System Document

This document outlines the detailed editorial visual directions, typography choices, and acoustic details configured for the Hitotoki Cinematic Landing Page.

## 1. Visual & Typography System

Our typography pairings are inspired by Japanese high-fashion lookbooks and traditional editorial magazines (Soup Stock Tokyo and Zen temple booklets):

- **Brand Header / Japanese Copy**: *Shippori Mincho* and *Noto Serif JP*. This provides a delicate, quiet, medium-weight aesthetic with generous character spacing (`tracking-[0.25em]`).
- **Technical / Metadata Labels**: *JetBrains Mono* is used for data lines (coordinates, depths, durations) representing the precise, disciplined structure behind the experience.
- **English Supporting Copy**: *Playfair Display* (italicized) which acts as a gentle poetic subtitle layer.
- **Negative Space**: High-density elements, bright neon lights, and bold sans-serif tags are strictly avoided. Each segment is framed with expansive negative outer margins (`px-6 md:px-20 py-10`).

## 2. Interactive Layering Blueprint

The interface is stacked across 5 precise interactive depths (Layer 0 to Layer 4):

```
+-------------------------------------------------------------+
| Layer 4: Floating actions (Mute toggle, dot navigation)     |
+-------------------------------------------------------------+
| Layer 3: DOM text text block renders (Mincho titles, logs)  |
+-------------------------------------------------------------+
| Layer 2: Three.js canvas (floating wind particles, smoke)   |
+-------------------------------------------------------------+
| Layer 1: Dedicated Video fallback gradient canvas layers     |
+-------------------------------------------------------------+
| Layer 0: Solid #050608 black backing frame                  |
+-------------------------------------------------------------+
```

## 3. Dynamic Section Navigation & Scroll Coordinates

We mapped standard native vertical scrolling onto normalized triggers. This prevents wheel-jacking bugs and ensures mobile responsiveness:

- `0.00 – 0.16` : **Opening Hero / Brand Entrance** (Abstract silver particles / quiet focus aura)
- `0.16 – 0.40` : **Scene 1: Forest & Hunter** (Frosty green particles, drift wind, Akita mountains)
- `0.40 – 0.62` : **Scene 2: Temple & Silence** (Amber smoke particles, Rising incense, Kyoto temple corridors)
- `0.62 – 0.81` : **Scene 3: Blade & Body** (Steel white sparks, tension horizontal breeze, Kochi forge)
- `0.81 – 0.93` : **Concept Philosophy** (Slow ambient drift, dual column detailed description)
- `0.93 – 1.00` : **Final CTA** (Golden luxurious tint, inquiry form trigger)

## 4. Acoustic Zen Hum System (Web Audio API Synthesis)

To establish emotional immersion without forcing heavy `.mp3`/`.wav` downloads:
1. **White Noise Wind**: Generates custom mathematical noise buffer shaped by a custom Bandpass filter (`Q: 1.8`, `Freq: 350Hz`) modulated by a slow LFO (`0.08Hz`) to emulate sweeping alpine wind breezes.
2. **Grounding Sub-Hum**: Synthesizes a silent deep sine wave (`180Hz`) modulated by a gentle `0.15Hz` LFO representing slow meditative breathing.
3. **Interactive Chime Rings**: Triggering unique ancient Japanese chords (A4, C5, E5, G5, etc.) with custom exponentially decaying envelopes as you progress or submit inquiries.
