// ...existing code...
/**
 * ARCHITECTURE & DATA FLOW DIAGRAMS
 * 
 * Visual representation of the audio extraction and waveform system
 */

// ============================================================================
// 1. AUDIO EXTRACTION FLOW
// ============================================================================

/*
┌─────────────────────────────────────────────────────────────────────────┐
│                    AUDIO EXTRACTION FLOW DIAGRAM                        │
└─────────────────────────────────────────────────────────────────────────┘

USER INTERFACE LAYER
┌──────────────────────────────────────────────────────┐
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │         VideoPreview Component              │   │
│  │  ┌──────────────┐  ┌──────────────────┐    │   │
│  │  │  Video       │  │  Extract Audio   │    │   │
│  │  │  Player      │  │  Button          │    │   │
│  │  └──────────────┘  └──────────────────┘    │   │
│  └─────────────────────────────────────────────┘   │
│                       │                             │
│                       │ (user clicks)               │
│                       ▼                             │
│  ┌──────────────────────────────────────────────┐  │
│  │  Fetch video file                            │  │
│  │  Create FormData                             │  │
│  │  POST to /api/extract-audio                  │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
└──────────────────────────────────────────────────────┘
                       │
                       │ HTTP POST
                       ▼
API LAYER
┌──────────────────────────────────────────────────────┐
│                                                      │
│  /api/extract-audio/route.ts (POST)                 │
│                                                      │
│  1. Receive FormData                                │
│  2. Extract File object                             │
│  3. Convert to Buffer                               │
│  4. Write temp video file                           │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │        FFmpeg Processing                     │  │
│  │   ┌─────────────────────────────────────┐   │  │
│  │   │ ffmpeg -i input.mp4 \              │   │  │
│  │   │         -q:a 9 \                   │   │  │
│  │   │         output.wav                 │   │  │
│  │   └─────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────┘  │
│                       │                             │
│  5. Delete temp file                                │
│  6. Return audio URL                                │
│                                                      │
└──────────────────────────────────────────────────────┘
                       │
                       │ JSON Response
                       │ {
                       │   audioUrl: "/uploads/audio-123.wav",
                       │   success: true
                       │ }
                       ▼
BROWSER STORAGE
┌──────────────────────────────────────────────────────┐
│                                                      │
│  /public/uploads/audio-123.wav                      │
│  (Static file server)                               │
│                                                      │
└──────────────────────────────────────────────────────┘
                       │
                       │ HTTP GET
                       ▼
UI DISPLAY LAYER
┌──────────────────────────────────────────────────────┐
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │      WaveformPlayer Component                │  │
│  │                                              │  │
│  │  ┌────────────────────────────────────────┐ │  │
│  │  │  WaveSurfer.js                        │ │  │
│  │  │  - Load audio from URL                │ │  │
│  │  │  - Parse WAV format                   │ │  │
│  │  │  - Render waveform visualization      │ │  │
│  │  │  - Create interactive timeline        │ │  │
│  │  └────────────────────────────────────────┘ │  │
│  │                                              │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │  Play    │  │  Pause   │  │   Seek   │  │  │
│  │  │  Button  │  │  Button  │  │  Cursor  │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  │  │
│  │                                              │  │
│  │  Time: 0:15 / 3:45                          │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
└──────────────────────────────────────────────────────┘
*/


// ============================================================================
// 2. COMPONENT HIERARCHY
// ============================================================================

/*
┌──────────────────────────────────────────────────────────────────┐
│                         Application Root                         │
└──────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴──────────────┐
                │                            │
    ┌───────────▼──────────┐    ┌────────────▼─────────────┐
    │   Page/Layout        │    │   Upload Modal          │
    │   app/page.tsx       │    │   UploadModal.tsx       │
    └───────────┬──────────┘    └────────────┬─────────────┘
                │                            │
    ┌───────────▼──────────┐    ┌────────────▼─────────────┐
    │  Recent Uploads      │    │  After Upload Success   │
    │  RecentUploads.tsx   │    │  VideoPreview.tsx       │
    └──────────────────────┘    └─────┬──────────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    │                                   │
        ┌───────────▼──────────┐         ┌──────────────▼────────┐
        │  HTML Video Element  │         │  WaveformPlayer       │
        │  <video />           │         │  WaveformPlayer.tsx   │
        └──────────────────────┘         └──────────┬───────────┘
                                                    │
                                        ┌───────────▼──────────┐
                                        │  WaveSurfer.js       │
                                        │  (Web Audio API)     │
                                        └──────────────────────┘
*/


// ============================================================================
// 3. DATA FLOW WITH VIDEO-AUDIO SYNC
// ============================================================================

/*
┌─────────────────────────────────────────────────────────────────────────┐
│              VIDEO & AUDIO SYNCHRONIZATION FLOW                         │
└─────────────────────────────────────────────────────────────────────────┘

USER INTERACTION
┌──────────────────────────────────────────────────────────────────┐
│ Click Video Play ─┐                                              │
│                  │                                               │
│                  └─────────────────────────────────────────────┐ │
│                                                                │ │
│                                            Click Waveform Play─┤ │
│                                                                │ │
│                                     Drag Waveform Cursor ──────┤ │
└──────────────────────────────────────────────────────────────────┘
                    │                                            │
                    ▼                                            ▼
        ┌──────────────────┐                      ┌──────────────────┐
        │  Video Element   │                      │  WaveSurfer.js   │
        │  Events:         │                      │  Events:         │
        │  - play          │                      │  - play          │
        │  - pause         │                      │  - pause         │
        │  - timeupdate    │                      │  - timeupdate    │
        │  - seeked        │                      │  - seek          │
        └────────┬─────────┘                      └────────┬─────────┘
                 │                                         │
                 │ Event Listener                          │ Event Listener
                 │                                         │
                 ├─────────────┬───────────────────────────┤
                 │             │                           │
                 │  Sync Logic (WaveformPlayer.tsx)        │
                 │             │                           │
                 │  Compare playback times                 │
                 │  If difference > 0.5s:                  │
                 │    - Seek the other element             │
                 │                                         │
                 └─────────────┬───────────────────────────┘
                               │
                 ┌─────────────┼─────────────┐
                 │             │             │
                 ▼             ▼             ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │ Video seeks  │ │ Waveform     │ │ Both update  │
        │ to time      │ │ seeks to     │ │ UI timeline  │
        │ X.XX seconds │ │ time X.XX    │ │              │
        └──────────────┘ └──────────────┘ └──────────────┘
*/


// ============================================================================
// 4. STATE MANAGEMENT IN WaveformPlayer
// ============================================================================

/*
┌─────────────────────────────────────────────────────────────────────────┐
│         STATE MANAGEMENT IN WaveformPlayer COMPONENT                    │
└─────────────────────────────────────────────────────────────────────────┘

Component Props Input:
┌──────────────────────────────────────┐
│ audioUrl: string                     │
│ videoElement?: HTMLVideoElement      │
│ onReady?: () => void                 │
│ onError?: (error: string) => void    │
└──────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│  Initialize WaveSurfer.js            │
│  Load audio file from URL            │
└──────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│      WaveSurfer Events               │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Event: 'ready'                 │  │
│  │ → setIsReady(true)             │  │
│  │ → setDuration(duration)        │  │
│  │ → onReady() callback           │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Event: 'play'                  │  │
│  │ → setIsPlaying(true)           │  │
│  │ → videoElement.play()          │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Event: 'pause'                 │  │
│  │ → setIsPlaying(false)          │  │
│  │ → videoElement.pause()         │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Event: 'timeupdate'            │  │
│  │ → setCurrentTime(time)         │  │
│  │ → Sync video if needed         │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Event: 'error'                 │  │
│  │ → onError(error) callback      │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│    Component State                   │
│                                      │
│ isReady: boolean                     │
│ isPlaying: boolean                   │
│ currentTime: number (seconds)        │
│ duration: number (seconds)           │
│                                      │
│ wavesurferRef: WaveSurfer instance   │
│ containerRef: HTMLDivElement         │
└──────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│    UI Rendering                      │
│                                      │
│ ┌────────────────────────────────┐  │
│ │ Waveform Canvas (WaveSurfer)   │  │
│ │ - Blue bars (waveform)         │  │
│ │ - Progress indicator           │  │
│ │ - Interactive seek             │  │
│ └────────────────────────────────┘  │
│                                      │
│ ┌────────────────────────────────┐  │
│ │ Controls                       │  │
│ │ [▶ Play] or [⏸ Pause]         │  │
│ │ 0:15 / 3:45                    │  │
│ └────────────────────────────────┘  │
└──────────────────────────────────────┘
*/


// ============================================================================
// 5. VIDEO PREVIEW COMPONENT STRUCTURE
// ============================================================================

/*
┌──────────────────────────────────────────────────────────────────────────┐
│              VideoPreview Component Structure                             │
└──────────────────────────────────────────────────────────────────────────┘

VideoPreview.tsx
│
├─ Props:
│  ├─ videoUrl: string
│  ├─ title?: string
│  └─ onExtractAudio?: (audioUrl: string) => void
│
├─ State:
│  ├─ audioUrl: string | null
│  ├─ isExtracting: boolean
│  └─ extractError: string | null
│
├─ Refs:
│  └─ videoRef: HTMLVideoElement
│
├─ Methods:
│  └─ handleExtractAudio():
│     1. Check if video is loaded
│     2. Fetch video as blob
│     3. Create FormData
│     4. POST to /api/extract-audio
│     5. Handle response/errors
│     6. Update state
│
└─ Render:
   │
   ├─ Title
   │
   ├─ <video controls src={videoUrl} />
   │
   ├─ "Extract Audio" Button
   │  ├─ Disabled while extracting
   │  └─ Shows loading state
   │
   ├─ Error Message (if any)
   │  └─ Red background, error text
   │
   └─ WaveformPlayer (if audioUrl)
      ├─ Props: audioUrl, videoRef
      └─ Displays: Interactive waveform
*/


// ============================================================================
// 6. FFmpeg PROCESSING PIPELINE
// ============================================================================

/*
┌─────────────────────────────────────────────────────────────────────────┐
│               FFmpeg Audio Extraction Pipeline                           │
└─────────────────────────────────────────────────────────────────────────┘

INPUT
┌─────────────────────────────┐
│ Video File (any format)     │
│ - MP4, WebM, MOV, AVI, etc. │
│ - Size: 100MB - 1GB+        │
│ - Bitrate: 1-50 Mbps        │
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  FFmpeg Command:            │
│                             │
│  ffmpeg                     │
│  -i "input.mp4"            │
│  -q:a 9                     │
│  -n                         │
│  "output.wav"              │
│                             │
│  Where:                     │
│  -i     = input file        │
│  -q:a 9 = quality (high)    │
│  -n     = no overwrite      │
│  -y     = auto overwrite    │
└─────────────────────────────┘
         │
         │ FFmpeg Process
         │ - Read video container
         │ - Decode video codec (skip)
         │ - Decode audio codec
         │ - Resample if needed
         │ - Encode to WAV
         │
         ▼
┌─────────────────────────────┐
│ Audio File (WAV)            │
│ - Format: PCM WAV           │
│ - Sample Rate: 44.1kHz      │
│ - Bit Depth: 16-bit         │
│ - Size: ~1MB per min        │
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Store in /public/uploads/   │
│ audio-{timestamp}.wav       │
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Web Browser                 │
│ - Load audio via URL        │
│ - Parse WAV format          │
│ - Render waveform           │
│ - Play audio                │
└─────────────────────────────┘
*/


// ============================================================================
// 7. ERROR HANDLING FLOW
// ============================================================================

/*
┌─────────────────────────────────────────────────────────────────────────┐
│                   Error Handling Flow                                    │
└─────────────────────────────────────────────────────────────────────────┘

User Action
│
├─ extractAudio()
│  │
│  ├─ Validation
│  │  ├─ Is video loaded? ─ NO ──┐
│  │  └─ Is URL valid? ──────┐   │
│  │                         │   │
│  │  YES ──┐                │   │
│  │        │                │   │
│  │        └─> Fetch video  │   │
│  │           │             │   │
│  │           ├─ Network error ─┼──┐
│  │           │             │   │  │
│  │           ├─ CORS error ┤   │  │
│  │           │             │   │  │
│  │           └─ Success ──┐├───┘  │
│  │                        ││      │
│  │                        └┼──┐   │
│  │                          │  │  │
│  │        ┌─────────────────┘  │  │
│  │        │                    │  │
│  │        └─> Send to API      │  │
│  │            /api/extract-audio
│  │            │                │  │
│  │            ├─ API error ────┤──┤──┐
│  │            │                │  │  │
│  │            ├─ FFmpeg error ─┤──┤──┤──┐
│  │            │                │  │  │  │
│  │            └─ Success ──┐   │  │  │  │
│  │                         │   │  │  │  │
│  │                         └─┐ │  │  │  │
│  │                           │ │  │  │  │
│  │    ┌──────────────────────┘ │  │  │  │
│  │    │                        │  │  │  │
│  │    └─> setAudioUrl(url)    │  │  │  │
│  │        Display Waveform     │  │  │  │
│  │                            │  │  │  │
│  └─────────────────────────────┘  │  │  │
│                                   │  │  │
└───────────────────────────────────┼──┼──┤
                                    │  │  │
                        ┌───────────┘  │  │
                        │              │  │
                    setError(msg)      │  │
                    Display Error ─────┘  │
                                          │
                                    Show Red Box:
                                    "❌ Error: {message}"
*/


// ============================================================================
// 8. API ENDPOINT FLOW
// ============================================================================

/*
┌─────────────────────────────────────────────────────────────────────────┐
│            API Endpoint: POST /api/extract-audio                         │
└─────────────────────────────────────────────────────────────────────────┘

1. REQUEST RECEIVED
   ┌──────────────────────────┐
   │ FormData                 │
   │ - file: Blob/File        │
   └──────────────────────────┘
         │
         ▼
2. EXTRACT FILE
   ┌──────────────────────────┐
   │ formData.get('file')     │
   │ as File → Blob → Buffer  │
   └──────────────────────────┘
         │
         ▼
3. VALIDATE
   ┌──────────────────────────┐
   │ If !file:                │
   │   Return 400 error       │
   └──────────────────────────┘
         │
         ▼
4. CREATE DIRECTORIES
   ┌──────────────────────────┐
   │ /public/uploads/         │
   │ /public/uploads/temp/    │
   │ (mkdirSync recursive)    │
   └──────────────────────────┘
         │
         ▼
5. WRITE TEMP FILE
   ┌──────────────────────────┐
   │ Write buffer to:         │
   │ /uploads/temp/input-*.tmp│
   └──────────────────────────┘
         │
         ▼
6. EXECUTE FFmpeg
   ┌──────────────────────────┐
   │ execSync('ffmpeg ...')   │
   │ Input: temp/input-*.tmp  │
   │ Output: audio-*.wav      │
   │                          │
   │ Error handling:          │
   │ Try-catch with error msg │
   └──────────────────────────┘
         │
         ▼
7. CLEANUP
   ┌──────────────────────────┐
   │ Delete temp input file   │
   │ (try-catch to ignore err)│
   └──────────────────────────┘
         │
         ▼
8. RESPONSE
   ┌──────────────────────────┐
   │ Success (200):           │
   │ {                        │
   │   success: true,         │
   │   audioUrl: "/uploads/", │
   │   audioPath: "/full/path"│
   │ }                        │
   │                          │
   │ Error (500):             │
   │ {                        │
   │   error: "Failed...",    │
   │   details: "..."         │
   │ }                        │
   └──────────────────────────┘
*/


// ============================================================================
// 9. BROWSER AUDIO PLAYBACK ARCHITECTURE
// ============================================================================

/*
┌─────────────────────────────────────────────────────────────────────────┐
│         Browser Audio Playback Architecture (WaveSurfer.js)             │
└─────────────────────────────────────────────────────────────────────────┘

Audio File (WAV)
/uploads/audio-123.wav
     │
     ▼
Browser Fetch API
Loads audio file into memory
     │
     ▼
Web Audio API
AudioContext (native browser audio)
     │
     ├─ OfflineAudioContext (for analysis)
     │  └─ Analyzes WAV to get amplitude data
     │     ├─ Sample rate
     │     ├─ Duration
     │     └─ Waveform peaks
     │
     └─ AudioContext (for playback)
        ├─ AudioBufferSource
        ├─ GainNode (volume)
        ├─ BiquadFilterNode (if needed)
        └─ Destination (speakers)
     │
     ▼
WaveSurfer.js
Renders visualization based on audio data
     │
     ├─ Canvas element
     │  ├─ Draw waveform bars
     │  ├─ Color coded
     │  └─ Interactive cursor
     │
     └─ Time display
        ├─ Current time
        └─ Total duration
     │
     ▼
User Interaction
     │
     ├─ Click waveform → Seek
     │  └─ Update currentTime
     │
     ├─ Click Play → Start playback
     │  └─ Resume from currentTime
     │
     └─ Click Pause → Stop playback
        └─ Freeze currentTime
*/

=======
/**
 * ARCHITECTURE & DATA FLOW DIAGRAMS
 * 
 * Visual representation of the audio extraction and waveform system
 */

// ============================================================================
// 1. AUDIO EXTRACTION FLOW
// ============================================================================

/*
┌─────────────────────────────────────────────────────────────────────────┐
│                    AUDIO EXTRACTION FLOW DIAGRAM                        │
└─────────────────────────────────────────────────────────────────────────┘

USER INTERFACE LAYER
┌──────────────────────────────────────────────────────┐
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │         VideoPreview Component              │   │
│  │  ┌──────────────┐  ┌──────────────────┐    │   │
│  │  │  Video       │  │  Extract Audio   │    │   │
│  │  │  Player      │  │  Button          │    │   │
│  │  └──────────────┘  └──────────────────┘    │   │
│  └─────────────────────────────────────────────┘   │
│                       │                             │
│                       │ (user clicks)               │
│                       ▼                             │
│  ┌──────────────────────────────────────────────┐  │
│  │  Fetch video file                            │  │
│  │  Create FormData                             │  │
│  │  POST to /api/extract-audio                  │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
└──────────────────────────────────────────────────────┘
                       │
                       │ HTTP POST
                       ▼
API LAYER
┌──────────────────────────────────────────────────────┐
│                                                      │
│  /api/extract-audio/route.ts (POST)                 │
│                                                      │
│  1. Receive FormData                                │
│  2. Extract File object                             │
│  3. Convert to Buffer                               │
│  4. Write temp video file                           │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │        FFmpeg Processing                     │  │
│  │   ┌─────────────────────────────────────┐   │  │
│  │   │ ffmpeg -i input.mp4 \              │   │  │
│  │   │         -q:a 9 \                   │   │  │
│  │   │         output.wav                 │   │  │
│  │   └─────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────┘  │
│                       │                             │
│  5. Delete temp file                                │
│  6. Return audio URL                                │
│                                                      │
└──────────────────────────────────────────────────────┘
                       │
                       │ JSON Response
                       │ {
                       │   audioUrl: "/uploads/audio-123.wav",
                       │   success: true
                       │ }
                       ▼
BROWSER STORAGE
┌──────────────────────────────────────────────────────┐
│                                                      │
│  /public/uploads/audio-123.wav                      │
│  (Static file server)                               │
│                                                      │
└──────────────────────────────────────────────────────┘
                       │
                       │ HTTP GET
                       ▼
UI DISPLAY LAYER
┌──────────────────────────────────────────────────────┐
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │      WaveformPlayer Component                │  │
│  │                                              │  │
│  │  ┌────────────────────────────────────────┐ │  │
│  │  │  WaveSurfer.js                        │ │  │
│  │  │  - Load audio from URL                │ │  │
│  │  │  - Parse WAV format                   │ │  │
│  │  │  - Render waveform visualization      │ │  │
│  │  │  - Create interactive timeline        │ │  │
│  │  └────────────────────────────────────────┘ │  │
│  │                                              │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │  Play    │  │  Pause   │  │   Seek   │  │  │
│  │  │  Button  │  │  Button  │  │  Cursor  │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  │  │
│  │                                              │  │
│  │  Time: 0:15 / 3:45                          │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
└──────────────────────────────────────────────────────┘
*/


// ============================================================================
// 2. COMPONENT HIERARCHY
// ============================================================================

/*
┌──────────────────────────────────────────────────────────────────┐
│                         Application Root                         │
└──────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴──────────────┐
                │                            │
    ┌───────────▼──────────┐    ┌────────────▼─────────────┐
    │   Page/Layout        │    │   Upload Modal          │
    │   app/page.tsx       │    │   UploadModal.tsx       │
    └───────────┬──────────┘    └────────────┬─────────────┘
                │                            │
    ┌───────────▼──────────┐    ┌────────────▼─────────────┐
    │  Recent Uploads      │    │  After Upload Success   │
    │  RecentUploads.tsx   │    │  VideoPreview.tsx       │
    └──────────────────────┘    └─────┬──────────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    │                                   │
        ┌───────────▼──────────┐         ┌──────────────▼────────┐
        │  HTML Video Element  │         │  WaveformPlayer       │
        │  <video />           │         │  WaveformPlayer.tsx   │
        └──────────────────────┘         └──────────┬───────────┘
                                                    │
                                        ┌───────────▼──────────┐
                                        │  WaveSurfer.js       │
                                        │  (Web Audio API)     │
                                        └──────────────────────┘
*/


// ============================================================================
// 3. DATA FLOW WITH VIDEO-AUDIO SYNC
// ============================================================================

/*
┌─────────────────────────────────────────────────────────────────────────┐
│              VIDEO & AUDIO SYNCHRONIZATION FLOW                         │
└─────────────────────────────────────────────────────────────────────────┘

USER INTERACTION
┌──────────────────────────────────────────────────────────────────┐
│ Click Video Play ─┐                                              │
│                  │                                               │
│                  └─────────────────────────────────────────────┐ │
│                                                                │ │
│                                            Click Waveform Play─┤ │
│                                                                │ │
│                                     Drag Waveform Cursor ──────┤ │
└──────────────────────────────────────────────────────────────────┘
                    │                                            │
                    ▼                                            ▼
        ┌──────────────────┐                      ┌──────────────────┐
        │  Video Element   │                      │  WaveSurfer.js   │
        │  Events:         │                      │  Events:         │
        │  - play          │                      │  - play          │
        │  - pause         │                      │  - pause         │
        │  - timeupdate    │                      │  - timeupdate    │
        │  - seeked        │                      │  - seek          │
        └────────┬─────────┘                      └────────┬─────────┘
                 │                                         │
                 │ Event Listener                          │ Event Listener
                 │                                         │
                 ├─────────────┬───────────────────────────┤
                 │             │                           │
                 │  Sync Logic (WaveformPlayer.tsx)        │
                 │             │                           │
                 │  Compare playback times                 │
                 │  If difference > 0.5s:                  │
                 │    - Seek the other element             │
                 │                                         │
                 └─────────────┬───────────────────────────┘
                               │
                 ┌─────────────┼─────────────┐
                 │             │             │
                 ▼             ▼             ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │ Video seeks  │ │ Waveform     │ │ Both update  │
        │ to time      │ │ seeks to     │ │ UI timeline  │
        │ X.XX seconds │ │ time X.XX    │ │              │
        └──────────────┘ └──────────────┘ └──────────────┘
*/


// ============================================================================
// 4. STATE MANAGEMENT IN WaveformPlayer
// ============================================================================

/*
┌─────────────────────────────────────────────────────────────────────────┐
│         STATE MANAGEMENT IN WaveformPlayer COMPONENT                    │
└─────────────────────────────────────────────────────────────────────────┘

Component Props Input:
┌──────────────────────────────────────┐
│ audioUrl: string                     │
│ videoElement?: HTMLVideoElement      │
│ onReady?: () => void                 │
│ onError?: (error: string) => void    │
└──────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│  Initialize WaveSurfer.js            │
│  Load audio file from URL            │
└──────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│      WaveSurfer Events               │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Event: 'ready'                 │  │
│  │ → setIsReady(true)             │  │
│  │ → setDuration(duration)        │  │
│  │ → onReady() callback           │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Event: 'play'                  │  │
│  │ → setIsPlaying(true)           │  │
│  │ → videoElement.play()          │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Event: 'pause'                 │  │
│  │ → setIsPlaying(false)          │  │
│  │ → videoElement.pause()         │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Event: 'timeupdate'            │  │
│  │ → setCurrentTime(time)         │  │
│  │ → Sync video if needed         │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Event: 'error'                 │  │
│  │ → onError(error) callback      │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│    Component State                   │
│                                      │
│ isReady: boolean                     │
│ isPlaying: boolean                   │
│ currentTime: number (seconds)        │
│ duration: number (seconds)           │
│                                      │
│ wavesurferRef: WaveSurfer instance   │
│ containerRef: HTMLDivElement         │
└──────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│    UI Rendering                      │
│                                      │
│ ┌────────────────────────────────┐  │
│ │ Waveform Canvas (WaveSurfer)   │  │
│ │ - Blue bars (waveform)         │  │
│ │ - Progress indicator           │  │
│ │ - Interactive seek             │  │
│ └────────────────────────────────┘  │
│                                      │
│ ┌────────────────────────────────┐  │
│ │ Controls                       │  │
│ │ [▶ Play] or [⏸ Pause]         │  │
│ │ 0:15 / 3:45                    │  │
│ └────────────────────────────────┘  │
└──────────────────────────────────────┘
*/


// ============================================================================
// 5. VIDEO PREVIEW COMPONENT STRUCTURE
// ============================================================================

/*
┌──────────────────────────────────────────────────────────────────────────┐
│              VideoPreview Component Structure                             │
└──────────────────────────────────────────────────────────────────────────┘

VideoPreview.tsx
│
├─ Props:
│  ├─ videoUrl: string
│  ├─ title?: string
│  └─ onExtractAudio?: (audioUrl: string) => void
│
├─ State:
│  ├─ audioUrl: string | null
│  ├─ isExtracting: boolean
│  └─ extractError: string | null
│
├─ Refs:
│  └─ videoRef: HTMLVideoElement
│
├─ Methods:
│  └─ handleExtractAudio():
│     1. Check if video is loaded
│     2. Fetch video as blob
│     3. Create FormData
│     4. POST to /api/extract-audio
│     5. Handle response/errors
│     6. Update state
│
└─ Render:
   │
   ├─ Title
   │
   ├─ <video controls src={videoUrl} />
   │
   ├─ "Extract Audio" Button
   │  ├─ Disabled while extracting
   │  └─ Shows loading state
   │
   ├─ Error Message (if any)
   │  └─ Red background, error text
   │
   └─ WaveformPlayer (if audioUrl)
      ├─ Props: audioUrl, videoRef
      └─ Displays: Interactive waveform
*/


// ============================================================================
// 6. FFmpeg PROCESSING PIPELINE
// ============================================================================

/*
┌─────────────────────────────────────────────────────────────────────────┐
│               FFmpeg Audio Extraction Pipeline                           │
└─────────────────────────────────────────────────────────────────────────┘

INPUT
┌─────────────────────────────┐
│ Video File (any format)     │
│ - MP4, WebM, MOV, AVI, etc. │
│ - Size: 100MB - 1GB+        │
│ - Bitrate: 1-50 Mbps        │
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  FFmpeg Command:            │
│                             │
│  ffmpeg                     │
│  -i "input.mp4"            │
│  -q:a 9                     │
│  -n                         │
│  "output.wav"              │
│                             │
│  Where:                     │
│  -i     = input file        │
│  -q:a 9 = quality (high)    │
│  -n     = no overwrite      │
│  -y     = auto overwrite    │
└─────────────────────────────┘
         │
         │ FFmpeg Process
         │ - Read video container
         │ - Decode video codec (skip)
         │ - Decode audio codec
         │ - Resample if needed
         │ - Encode to WAV
         │
         ▼
┌─────────────────────────────┐
│ Audio File (WAV)            │
│ - Format: PCM WAV           │
│ - Sample Rate: 44.1kHz      │
│ - Bit Depth: 16-bit         │
│ - Size: ~1MB per min        │
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Store in /public/uploads/   │
│ audio-{timestamp}.wav       │
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Web Browser                 │
│ - Load audio via URL        │
│ - Parse WAV format          │
│ - Render waveform           │
│ - Play audio                │
└─────────────────────────────┘
*/


// ============================================================================
// 7. ERROR HANDLING FLOW
// ============================================================================

/*
┌─────────────────────────────────────────────────────────────────────────┐
│                   Error Handling Flow                                    │
└─────────────────────────────────────────────────────────────────────────┘

User Action
│
├─ extractAudio()
│  │
│  ├─ Validation
│  │  ├─ Is video loaded? ─ NO ──┐
│  │  └─ Is URL valid? ──────┐   │
│  │                         │   │
│  │  YES ──┐                │   │
│  │        │                │   │
│  │        └─> Fetch video  │   │
│  │           │             │   │
│  │           ├─ Network error ─┼──┐
│  │           │             │   │  │
│  │           ├─ CORS error ┤   │  │
│  │           │             │   │  │
│  │           └─ Success ──┐├───┘  │
│  │                        ││      │
│  │                        └┼──┐   │
│  │                          │  │  │
│  │        ┌─────────────────┘  │  │
│  │        │                    │  │
│  │        └─> Send to API      │  │
│  │            /api/extract-audio
│  │            │                │  │
│  │            ├─ API error ────┤──┤──┐
│  │            │                │  │  │
│  │            ├─ FFmpeg error ─┤──┤──┤──┐
│  │            │                │  │  │  │
│  │            └─ Success ──┐   │  │  │  │
│  │                         │   │  │  │  │
│  │                         └─┐ │  │  │  │
│  │                           │ │  │  │  │
│  │    ┌──────────────────────┘ │  │  │  │
│  │    │                        │  │  │  │
│  │    └─> setAudioUrl(url)    │  │  │  │
│  │        Display Waveform     │  │  │  │
│  │                            │  │  │  │
│  └─────────────────────────────┘  │  │  │
│                                   │  │  │
└───────────────────────────────────┼──┼──┤
                                    │  │  │
                        ┌───────────┘  │  │
                        │              │  │
                    setError(msg)      │  │
                    Display Error ─────┘  │
                                          │
                                    Show Red Box:
                                    "❌ Error: {message}"
*/


// ============================================================================
// 8. API ENDPOINT FLOW
// ============================================================================

/*
┌─────────────────────────────────────────────────────────────────────────┐
│            API Endpoint: POST /api/extract-audio                         │
└─────────────────────────────────────────────────────────────────────────┘

1. REQUEST RECEIVED
   ┌──────────────────────────┐
   │ FormData                 │
   │ - file: Blob/File        │
   └──────────────────────────┘
         │
         ▼
2. EXTRACT FILE
   ┌──────────────────────────┐
   │ formData.get('file')     │
   │ as File → Blob → Buffer  │
   └──────────────────────────┘
         │
         ▼
3. VALIDATE
   ┌──────────────────────────┐
   │ If !file:                │
   │   Return 400 error       │
   └──────────────────────────┘
         │
         ▼
4. CREATE DIRECTORIES
   ┌──────────────────────────┐
   │ /public/uploads/         │
   │ /public/uploads/temp/    │
   │ (mkdirSync recursive)    │
   └──────────────────────────┘
         │
         ▼
5. WRITE TEMP FILE
   ┌──────────────────────────┐
   │ Write buffer to:         │
   │ /uploads/temp/input-*.tmp│
   └──────────────────────────┘
         │
         ▼
6. EXECUTE FFmpeg
   ┌──────────────────────────┐
   │ execSync('ffmpeg ...')   │
   │ Input: temp/input-*.tmp  │
   │ Output: audio-*.wav      │
   │                          │
   │ Error handling:          │
   │ Try-catch with error msg │
   └──────────────────────────┘
         │
         ▼
7. CLEANUP
   ┌──────────────────────────┐
   │ Delete temp input file   │
   │ (try-catch to ignore err)│
   └──────────────────────────┘
         │
         ▼
8. RESPONSE
   ┌──────────────────────────┐
   │ Success (200):           │
   │ {                        │
   │   success: true,         │
   │   audioUrl: "/uploads/", │
   │   audioPath: "/full/path"│
   │ }                        │
   │                          │
   │ Error (500):             │
   │ {                        │
   │   error: "Failed...",    │
   │   details: "..."         │
   │ }                        │
   └──────────────────────────┘
*/


// ============================================================================
// 9. BROWSER AUDIO PLAYBACK ARCHITECTURE
// ============================================================================

/*
┌─────────────────────────────────────────────────────────────────────────┐
│         Browser Audio Playback Architecture (WaveSurfer.js)             │
└─────────────────────────────────────────────────────────────────────────┘

Audio File (WAV)
/uploads/audio-123.wav
     │
     ▼
Browser Fetch API
Loads audio file into memory
     │
     ▼
Web Audio API
AudioContext (native browser audio)
     │
     ├─ OfflineAudioContext (for analysis)
     │  └─ Analyzes WAV to get amplitude data
     │     ├─ Sample rate
     │     ├─ Duration
     │     └─ Waveform peaks
     │
     └─ AudioContext (for playback)
        ├─ AudioBufferSource
        ├─ GainNode (volume)
        ├─ BiquadFilterNode (if needed)
        └─ Destination (speakers)
     │
     ▼
WaveSurfer.js
Renders visualization based on audio data
     │
     ├─ Canvas element
     │  ├─ Draw waveform bars
     │  ├─ Color coded
     │  └─ Interactive cursor
     │
     └─ Time display
        ├─ Current time
        └─ Total duration
     │
     ▼
User Interaction
     │
     ├─ Click waveform → Seek
     │  └─ Update currentTime
     │
     ├─ Click Play → Start playback
     │  └─ Resume from currentTime
     │
     └─ Click Pause → Stop playback
        └─ Freeze currentTime
*/

>>>>>>> a482193 (Fix Next.js, React and TypeScript dependencies)
