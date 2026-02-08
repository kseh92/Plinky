# Development Log: Paper Instruments

## 2026-02-02: Initial Project Creation
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

## 2026-02-07: Merge Resolution, Harp Sound, Imports, and Doodles
- **Prompt**: "First of all, I want to improve the sound of playing Harp. Now it sounds the same as playing piano. Any way to make the sound more like harp?"
- **Result**: Resolved merge conflicts across the app, rebuilt the harp synth chain with harp-specific FX, fixed harp note routing (`harp:` tags + instrument-aware playback), normalized import paths, and moved/implemented doodles and crayon doodles in `components/decor` for proper App imports.

## 2026-02-07: Studio Mix Overhaul, Recap Fixes, and Recommendation Filtering
- **Prompt**: "I want to improve the studio mix function... Can I use Music generation using Lyria RealTime... AI composer should show after the studio analysis and recommendations are complete."
- **Result**: Replaced the old Studio Mix replay with Lyria RealTime streaming in-browser (PCM16 to WAV). Added AI Composer gating until recap is ready, improved recap generation progress logs, fixed album jacket generation with `generateImages`, removed Google Search citations, and over-generated recommendations with browser availability checks to keep 3 playable tracks.

## 2026-02-07: Recap UI Cleanup
- **Prompt**: "Reverb/Distortion/Compressor are not necessary to show to user... keep these for Studio Mix purpose but let's not show it to the user in the result screen."
- **Result**: Removed the mixing metrics UI from `RecapCard_V2.tsx` while keeping mix settings for Studio Mix.

## 2026-02-07: AI Composer Reliability & Share UX
- **Prompt**: "AI Composer should appear when the Recap generation is successful... Remove TTS streaming, use Lyria, fix errors, improve recap logging, and adjust sharing UX."
- **Result**: Refactored Lyria composer logic into `services/aiComposer.ts` using the SDK live client, fixed invalid WS config fields, added detailed composer logging, parallelized recap + mix, made album jacket lazy, added availability filtering, moved share to direct Web Share API, and showed share only after mix finished. 

## 2026-02-08: AI Composer Duration & SDK Close
- **Prompt**: "In the lyria composer, I want to make sure the song generated to be between 30 - 60 seconds. If SDK connection is closed after composing the song, it does not have to show error message. Rather why don't we just close the SDK connection as soon as the AIcomposer process is finished?"
- **Result**: Clamped AI Composer duration to 30–60s and made SDK close cleanly without errors on intentional shutdown.

## 2026-02-08: Recap Tone & Recommendation Rules
- **Prompt**: "In the result screen, when it makes the session recap I want the criticQuote to be less serious and shorter... Make it sound appropriate for like 6 years old... I want the recommendations to be more diverse but not straying too much. It always shows Taylor Swift's Shake it off. Also if you are showing an artist's name in the artistComparison it should be included as no.1 in the Recommended songs."
- **Result**: Adjusted recap prompt for kid-friendly short quotes with exactly one emoji. Enforced diverse recommendations (no repeated artists), and ensured `artistComparison` appears as the first recommendation with post-processing.

## 2026-02-08: Recap Card Layout Tweaks
- **Prompt**: "In the Recap Card, Future {recap.artistComparison} is not centered and too long... Showing the Studio picks, if the song title is too long, Play button goes out of the box... Box for Each recommended songs can be smaller especially the height. The gap between these boxes can be smaller as well. I want the VinylRecord it self to be smaller around 30%."
- **Result**: Centered and wrapped artist comparison, fixed Play button alignment with a grid layout, tightened spacing, and reduced card/typography sizes. Scaled VinylRecord down ~30%.

## 2026-02-08: YouTube Thumbnails & Link Safety
- **Prompt**: "In the studio picks, if the youtube videos are properly connected, is it possible to show the thumbnails of the video for the VinylRecord? ... When getting the youtube img url, Failed to load resource: the server responded with a status of 404 () ... title showing on the VinylRecord and actual link is different ... I still want to keep the auto play for the youtube link. Now it does not connect into the actual link and all thumbnails are gone. Is there any other solution to this mismatching bug?"
- **Result**: Added YouTube thumbnail fallback chain and oEmbed-based validation for link/title mismatches. Autoplay is preserved for matching links; mismatches fall back to safe YouTube Music search.

## 2026-02-08: Playback Stability & Sustained Notes
- **Prompt**: "When playing the instuments in InstumentPlayer very quickly, Max polyphony exceeded. Note dropped. appears. Any way to prevent this? ... Can it keep making sound if I have finger on the hit zones? ... What I meant was if I keep my finger on a note, it should not keep clicking multiple times but one sound lasts long."
- **Result**: Increased polyphony limits and switched to true note hold behavior (start on enter, release on exit) for sustained sounds.
