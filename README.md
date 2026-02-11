<div align="center">
<img width="1200" height="475" alt="Plinky Landing" src="https://github.com/user-attachments/assets/b0d01cb5-c5c0-46bd-bf13-f2a71848f8db" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://aistudio.google.com/apps/drive/1WYHbwEUxZdyZEWV7WcmVWs6VHT8c9t_E

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Overview

**What this is**
- Paper Instruments is a browser app where kids draw instruments, scan them, and play them with hand tracking. It also generates an AI studio mix, album jacket, and recap, plus an Explore mode with playful preset instruments.

**Features**
- Scan & Play: detect hit zones from a drawing and perform in real time.
- Instant Magic: jump straight into preset hit zones without scanning.
- Explore Presets: themed instruments (e.g., snake xylophone, neon harp) with custom overlays.
- Silhouette-based alignment: scan silhouette bounds are used to align piano key zones.
- Performance feedback: particles/markers render above instruments with low-perf auto mode.
- AI Studio Recap: kid-friendly critique + YouTube Music recommendations.

**Core products & libraries**
- Frontend: React + Vite
- Computer Vision: MediaPipe Hand Landmarker (`@mediapipe/tasks-vision`)
- Audio Engine: Tone.js
- Generative AI: Google Gemini API (`@google/genai`)
- Music generation: Gemini + Lyria RealTime (streamed audio)
- Recommendations: YouTube Music (validated via oEmbed + URL normalization)

**How it connects**
1. User flow (state machine)
   - `landing → pick → provide → scan → confirmScan → play → result`
2. Blueprint + Scan (Gemini vision)
   - `scanDrawing` returns hit zones (0–100% coords). If scanning fails, preset zones are used.
3. Play (MediaPipe + Tone.js)
   - MediaPipe tracks fingertips; collision with hit zones triggers Tone.js sounds.
   - Performance is recorded (audio + event log).
4. Result (Recap + Studio Mix)
   - Gemini generates recap, artist comparison, and recommended tracks.
   - Gemini image generation creates a cover; a keyword from scan/explore can be injected.
   - Lyria RealTime streams a studio mix; WAV is built for playback/download.

**Key files**
- App flow: `components/app/useAppFlow.tsx`, `App.tsx`
- Vision/scan: `geminiService_V2.ts` (`generateBlueprint`, `scanDrawing`)
- Play engine: `components/player/InstrumentPlayer_V2.tsx`, `services/toneService.ts`
- Explore presets: `components/player/ExplorePresets.tsx`
- Result/recap: `components/player/ResultScreen_V2.tsx`, `components/player/RecapCard_V2.tsx`
- Recommendations: `services/youtubeAvailability.ts`
- Studio mix: `services/aiComposer.ts`, `services/lyriaStudio.ts`
