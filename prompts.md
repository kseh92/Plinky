# Development Log: Paper Instruments

## 2026-02-02: Initial Project Creation
- **Prompt**: "Build 'Paper Instruments' - an app where kids draw instruments on paper, scan them, and play them using hand tracking. Include a 'Gemini Studio' feature that masters their recording into a hit song."
- **Result**: Established the core project structure, integrated MediaPipe HandLandmarker for vision, implemented the Tone.js audio engine, and created the "Gemini Studio" mastering pipeline.

## 2026-02-02: Uploads, Recording, and Result UX
- **Prompt**: "Allow image upload instead of only camera... No sound on play... Save result file."
- **Result**: Added upload flow, fixed audio context start, added recording + result download UI.

## 2026-02-02: Audio Reliability & Drum Mapping Iterations
- **Prompt**: "Fix sample loading errors... All buttons have same sound... Drum sounds like beeps... Remap toms/cymbals... Fix audio init errors."
- **Result**: Stabilized ToneService with synth fallbacks, corrected sample paths, improved fuzzy drum label mapping, and tuned tom synthesis settings.

## 2026-02-03: Piano/Blueprint Scanning Improvements
- **Prompt**: "Piano zones not visible... Where did sharps go?... If scan fails, use default hit zones."
- **Result**: Refined scan prompts for piano keys (including sharps), improved hit zone rendering, and added preset zone fallbacks for faster/safer use.

## 2026-02-03: Recap & Recommendations
- **Prompt**: "Add Session Recap... Recommend ~3 songs... Links not available on YouTube Music... Make recommendations more mainstream."
- **Result**: Added recap card, expanded recommendation schema, and adjusted prompting toward mainstream pop with safer link handling.

## 2026-02-04: AI Mixing & Studio Mastering Evolution
- **Prompt**: "Add AI Mixing Engine... Generate mix settings... Extend to 1–2 minute studio mix... Enable download... Use Lyria/streaming audio... Fix streaming errors."
- **Result**: Implemented mix settings generation, event log–driven arrangements, studio mix recording + download, and multiple iterations of streaming/AI audio generation reliability fixes.

## 2026-02-04: UX & Visual Tweaks
- **Prompt**: "Center drum/piano selections... Remove styling and magic mode... Adjust label overlap... Add harp instrument."
- **Result**: Updated layout and visuals, removed conflicting visual filters, improved label placement, and added harp support with tailored synth routing.

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

## 2026-02-08: Scan Reliability & Camera Fixes
- **Prompt**: "CameraScanner not working (empty zones). Fix reversed camera. Add logging for scan/blueprint. If scan takes too long or fails, fall back to preset zones. Map drum zones to drum sounds. Fix harp scan note errors."
- **Result**: Improved scan robustness (MIME detection, percent-based boxes, empty-zone guard, scan timeout with preset fallback). Added scan/blueprint timing logs, fixed mirrored camera preview, mapped drum scan zones to preset drum sounds, and normalized harp notes with default octave.

## 2026-02-08: Album Jacket & Title Keywords
- **Prompt**: "If blueprint is made through scan or explore, try to find any object in the photo or prompt to use as a keyword in the album jacket generation. And use the keyword in the song's name generation as well."
- **Result**: Extracted a keyword from scan images (best-effort object detection) or explore custom names and passed it into album jacket generation and mix title creation.

## 2026-02-08: Instrument Buddy Toggle
- **Prompt**: "In the InstrumentPlayer, can you make a small disable button for the monster doodle on the bottom left side?"
- **Result**: Added a small toggle button to show/hide the bottom-left mascot in `InstrumentPlayer_V2.tsx`.

## 2026-02-08: YouTube Music Verification Logic
- **Prompt**: "After checking the youtube availability, make sure not to include the same songs twice... re-explain logic... should not do number 3. Pin the first item. Actually recommendations should be all from verified matches but first recommendation should be matching the artistComparison."
- **Result**: Updated YouTube Music recommendation filtering to keep only verified matches, reorder to place `artistComparison` first, and dedupe by title/artist so duplicates are removed.

## 2026-02-08: Drum Crash Zone Mapping
- **Prompt**: "If I scan the drum, I want to make sure that top left and top right zones are allocated to the crash. It can only apply if there are more than 5 zones to hit. OR make it more than 4 zones."
- **Result**: For drum scans with more than 4 zones, the top-left and top-right zones are forced to `crash_l` and `crash_r`, while remaining zones are randomly assigned non-crash drum sounds.

## 2026-02-08: Piano Doodle Render, Mirroring, and Silhouette-Based Scan Alignment
- **Prompt**: "Rebuild the piano rendering in a kid-doodle style (black doodle lines, black keys filled, white keys semi-transparent). Fix mirroring issues between piano, canvas, and hands. Keep particle/feedback effects above the instrument. Make scan results follow the scanned silhouette (especially for piano) and improve scan reliability. Adjust camera scan UI so buttons don’t block the view, and keep scan preview mirrored."
- **Result**: Reworked piano rendering to doodle-style keys with black/white fills and hand-drawn outlines. Corrected mirroring by flipping piano hit zones while keeping video/canvas consistency and made scan preview mirrored. Moved particle effects and finger markers above instrument rendering. Added silhouette extraction + overlay for scan confirmation/play, refined bounds detection to avoid border frames, and re-mapped piano zones to silhouette bounds using scanned key count. Improved scan prompts/thresholds and adjusted CameraScanner layout so buttons sit below the preview.

## 2026-02-10: Bug Fixes for Audio Enable, Low-Perf Mode, and YouTube Thumbnails
- **Prompt**: "Explore preset instruments show 'AudioContext is suspended' and no sound. Add a user-gesture enable flow. Add low-performance auto mode for particle feedback. Fix YouTube 404 spam and missing thumbnails in the result screen."
- **Result**: Added a tap-to-enable overlay in Explore presets to reliably start Tone.js. Implemented a low-performance auto mode that disables particles when FPS drops. Adjusted YouTube availability handling to retain recommendations on oEmbed failure and preserve video IDs for thumbnail fallback, reducing 404s and restoring thumbnails.

## 2026-02-10: Scan UI Mirror & Controls Layout
- **Prompt**: "In Scan Your Paper, show the camera preview in mirror mode, and move SNAP PHOTO / UPLOAD so they don’t block the camera view."
- **Result**: Restored mirror preview for the scan camera and moved capture/upload controls below the preview for a clearer scanning view.

## 2026-02-10: Piano Silhouette Alignment & Bounds Refinement
- **Prompt**: "Make piano scans follow the detected silhouette bounds and improve silhouette accuracy so the piano doesn’t fill the whole screen."
- **Result**: Added silhouette extraction and bounds mapping for scan-based instruments, used outline-driven bounds for better accuracy, and filtered out edge-frame artifacts to prevent oversized bounds.

## 2026-02-10: Performance Feedback & Overlay Ordering
- **Prompt**: "Feedback particles and finger markers should stay above instruments, but avoid performance drops during play."
- **Result**: Ensured finger markers/particles render above instrument visuals and introduced particle throttling plus low-perf auto-disable when FPS drops.

## 2026-02-10: UI Copy Visibility on Pick Screen
- **Prompt**: "After Start, 'Pick Your Instrument' should appear above the instrument buttons."
- **Result**: Added the missing header to the pick screen so the selection title is visible.
