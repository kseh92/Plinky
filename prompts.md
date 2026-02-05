# Development Log: Paper Instruments

## 2026-02-05: Initial Project Creation
- **Prompt**: "Build 'Paper Instruments' - an app where kids draw instruments on paper, scan them, and play them using hand tracking. Include a 'Gemini Studio' feature that masters their recording into a hit song."
- **Result**: Established the core project structure, integrated MediaPipe HandLandmarker for vision, implemented the Tone.js audio engine, and created the "Gemini Studio" mastering pipeline.

## 2026-02-05: Tone.js Harp Synthesis & Polyphony Fix
- **Prompt**: "Fix the following error: 'Voice must extend Monophonic class' in Tone.js when playing the Harp. This happened while trying to implement the Blueprint Engine."
- **Result**: Updated `services/toneService.ts` to use `PolySynth` with `FMSynth` for the Harp. This resolved the compatibility error and allowed for rich, overlapping string resonances.

## 2026-02-05: Harp Mixing & Progress Bar Optimization
- **Prompt**: "The Harp recordings are not being mixed correctly by the AI Producer. Also, the progress bar stays at 0% for a long time during generation."
- **Result**: Implemented contextual sound tagging (e.g., `harp:c4`) in `InstrumentPlayer.tsx` to help the AI model understand the performance better. Added an immediate 10% progress jump in `ResultScreen.tsx` to improve user feedback during the loading state.

## 2026-02-05: Gemini TTS Studio Stream Stability Fix
- **Prompt**: "Fix the following errors: Studio stream generation failed: [original: RPC::CANCELLED] Fail to execute model for flow_id: gemini_v3p1s_tts_rev22_2025_10_28. Streaming failed."
- **Result**: Simplified the musical score representation in `geminiService.ts` and reduced the event log length to 45 events. This decreased the complexity of the TTS prompt, preventing internal server cancellations and improving stability.

## 2026-02-05: UI/UX Refinement & Layout Adjustment
- **Prompt**: "Can you change the harp selection emoji into a harp emoji? And place Piano, drum and harp in the same row."
- **Result**: Updated `constants.tsx` to use the `🪕` emoji. Modified the CSS grid/flex classes in `App.tsx` to ensure all three instrument buttons align horizontally on medium and large screens.

## 2026-02-05: Development Log Generation
- **Prompt**: "Make prompts.md file to add all the prompts I used to make changes. Looking like this: [example format]"
- **Result**: Created this `prompts.md` file to maintain a clear history of the project's evolution and the specific AI prompts used to drive its development.

## 2026-02-06: Initial Project Creation
- **Task**: Build "Paper Instruments" using Gemini AI and Hand Tracking.
- **Result**: Core app lifecycle, hand vision, and Harp synthesis (PolySynth with FMSynth) implemented.

## 2026-02-06: Mixing Optimization & API Setup
- **Task**: Fix "Missing API Key" errors and improve Harp mixing.
- **Result**: Configured Vite to bridge local environment keys. Implemented contextual sound tagging (e.g., `harp:c4`) to help the AI better understand performance "DNA."

## 2026-02-06: High-Fidelity Studio Synthesis
- **Task**: Use `gemini-2.5-flash-preview-tts` (Lyria) for studio-level quality. The generation should reflect the rhythm and timing of the paper performance.
- **Result**: Integrated the Lyria engine with a specific prompt that forces melodic humming, beatboxing, and cinematic textures instead of speech. Implemented raw PCM decoding and WAV encoding for high-quality downloads.

## 2026-02-06: Professional Tone & Child Safety
- **Task**: Ensure titles and genres are "normal music" standards (cool, professional) but strictly kid-safe (G/PG). Restore background graphics and missing Album Jacket feature.
- **Result**: Updated Gemini prompts to use professional music terminology. Restored the Album Jacket hero section and corrected background z-indexing.
