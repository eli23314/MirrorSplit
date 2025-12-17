# ...existing code...
# Audio Extraction & Waveform Preview Implementation Guide

## Overview
This implementation adds audio extraction from video files and a visual waveform player using FFmpeg and WaveSurfer.js. No external AI services are used.

## Files Created

### 1. **API Route: `/api/extract-audio`**
- **File**: `app/api/extract-audio/route.ts`
- **Purpose**: Extracts audio from uploaded video files using FFmpeg
- **Endpoint**: `POST /api/extract-audio`
- **Input**: FormData with video file
- **Output**: JSON with audio file URL and path
- **Features**:
  - Converts video to WAV audio format
  - Uses FFmpeg's built-in processing
  - Handles temporary files and cleanup
  - Proper error handling and response codes

### 2. **WaveformPlayer Component**
- **File**: `app/components/WaveformPlayer.tsx`
- **Purpose**: Displays interactive waveform visualization with playback controls
- **Features**:
  - Visual waveform display using WaveSurfer.js
  - Play/pause controls
  - Current time and total duration display
  - Syncs with video element playback
  - Responsive and styled with Tailwind CSS
- **Props**:
  - `audioUrl` (string): URL to the audio file
  - `videoElement` (HTMLVideoElement): Optional video element for sync
  - `onReady` (function): Callback when waveform is ready
  - `onError` (function): Callback for error handling

### 3. **VideoPreview Component**
- **File**: `app/components/VideoPreview.tsx`
- **Purpose**: Complete video player with integrated audio extraction and waveform
- **Features**:
  - Video player with controls
  - "Extract Audio" button with loading state
  - Error handling and display
  - Integrated WaveformPlayer component
  - Callback support for extracted audio

## Setup Instructions

### Step 1: Install Dependencies
After the package.json update, run:
```bash
npm install
```

This installs:
- **wavesurfer.js** (v7.13.1): Audio visualization library
- FFmpeg dependencies (already in project):
  - @ffmpeg/ffmpeg (v0.12.15)
  - ffmpeg-static (v5.3.0)
  - fluent-ffmpeg (v2.1.3)

### Step 2: System Requirements
Ensure FFmpeg is installed on your system:
- **Windows**: Install from https://ffmpeg.org/download.html or use package manager
- **macOS**: `brew install ffmpeg`
- **Linux**: `sudo apt-get install ffmpeg`

### Step 3: Usage in Components

#### Using VideoPreview Component
```tsx
import VideoPreview from '@/app/components/VideoPreview';

export default function MyPage() {
  return (
    <VideoPreview
      videoUrl="https://example.com/video.mp4"
      title="My Video"
      onExtractAudio={(audioUrl) => {
        console.log('Audio extracted:', audioUrl);
      }}
    />
  );
}
```

#### Using WaveformPlayer Directly
```tsx
import WaveformPlayer from '@/app/components/WaveformPlayer';

export default function MyPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <>
      <video ref={videoRef} src="video.mp4" controls />
      <WaveformPlayer
        audioUrl="audio.wav"
        videoElement={videoRef.current}
        onReady={() => console.log('Waveform ready')}
        onError={(error) => console.error(error)}
      />
    </>
  );
}
```

## How It Works

### Audio Extraction Flow
1. User uploads a video file or clicks "Extract Audio" button
2. Frontend sends video to `/api/extract-audio` endpoint
3. Backend uses FFmpeg to extract audio stream:
   - Input: Video file (MP4, WebM, MOV, etc.)
   - Processing: `ffmpeg -i input.mp4 -q:a 9 output.wav`
   - Output: WAV file saved to `/public/uploads/`
4. API returns audio file URL to frontend
5. Frontend displays waveform using WaveSurfer.js

### Video-Waveform Sync
- **Play/Pause**: Clicking waveform play button syncs with video
- **Seek**: Dragging waveform cursor syncs video playback position
- **External Control**: Video play/pause events trigger waveform sync
- **Time Tolerance**: 0.5s tolerance prevents excessive seeking

## Styling
- **Container**: Dark slate background with rounded corners
- **Waveform**: Blue waveform (#3b82f6) with darker blue progress (#1e40af)
- **Controls**: Tailwind CSS buttons with hover states
- **Responsive**: Waveform adapts to container width

## Error Handling
- Missing FFmpeg: Clear error message with suggestion
- Failed extraction: User-friendly error display
- Network errors: Caught and displayed to user
- Console logging for debugging

## File Storage
- **Location**: `/public/uploads/`
- **Naming**: `audio-{timestamp}.wav`
- **Cleanup**: Temporary input files removed after processing
- **Fallback**: Can be extended to use Supabase Storage

## API Response Format

### Success Response
```json
{
  "success": true,
  "audioUrl": "/uploads/audio-1234567890.wav",
  "audioPath": "/full/path/to/audio-1234567890.wav"
}
```

### Error Response
```json
{
  "error": "Failed to extract audio",
  "details": "FFmpeg error message",
  "code": "EXTRACT_ERROR"
}
```

## Performance Considerations
- Audio extraction is CPU-intensive; shows loading state
- Large video files may take time to process
- Consider adding progress tracking for long operations
- Extracted audio files should be cleaned up after some time

## Future Enhancements
1. Progress tracking for large file extraction
2. Audio trimming/editing before waveform display
3. Support for multiple audio tracks
4. Waveform screenshots/exports
5. Cloud storage integration (Supabase)
6. Browser-based FFmpeg (FFmpeg.wasm) for client-side processing

## Testing
1. Upload a video file
2. Click "Extract Audio" button
3. Wait for extraction to complete
4. Verify waveform displays
5. Test play/pause sync between video and waveform
6. Test seek functionality

## Troubleshooting

**Issue**: "Cannot find module 'wavesurfer.js'"
- **Solution**: Run `npm install` to install dependencies

**Issue**: FFmpeg not found
- **Solution**: Install FFmpeg on your system and ensure it's in PATH

**Issue**: Audio extraction fails
- **Solution**: Check browser console for detailed error; verify video file format

**Issue**: Waveform not syncing with video
- **Solution**: Ensure video element ref is properly passed to WaveformPlayer

## Dependencies Added
- `wavesurfer.js@^7.13.1` - Web Audio API audio visualization library

## Dependencies Already Present
- `@ffmpeg/ffmpeg@^0.12.15` - FFmpeg.wasm (optional fallback)
- `ffmpeg-static@^5.3.0` - Static FFmpeg binary
- `fluent-ffmpeg@^2.1.3` - FFmpeg wrapper
=======
# Audio Extraction & Waveform Preview Implementation Guide

## Overview
This implementation adds audio extraction from video files and a visual waveform player using FFmpeg and WaveSurfer.js. No external AI services are used.

## Files Created

### 1. **API Route: `/api/extract-audio`**
- **File**: `app/api/extract-audio/route.ts`
- **Purpose**: Extracts audio from uploaded video files using FFmpeg
- **Endpoint**: `POST /api/extract-audio`
- **Input**: FormData with video file
- **Output**: JSON with audio file URL and path
- **Features**:
  - Converts video to WAV audio format
  - Uses FFmpeg's built-in processing
  - Handles temporary files and cleanup
  - Proper error handling and response codes

### 2. **WaveformPlayer Component**
- **File**: `app/components/WaveformPlayer.tsx`
- **Purpose**: Displays interactive waveform visualization with playback controls
- **Features**:
  - Visual waveform display using WaveSurfer.js
  - Play/pause controls
  - Current time and total duration display
  - Syncs with video element playback
  - Responsive and styled with Tailwind CSS
- **Props**:
  - `audioUrl` (string): URL to the audio file
  - `videoElement` (HTMLVideoElement): Optional video element for sync
  - `onReady` (function): Callback when waveform is ready
  - `onError` (function): Callback for error handling

### 3. **VideoPreview Component**
- **File**: `app/components/VideoPreview.tsx`
- **Purpose**: Complete video player with integrated audio extraction and waveform
- **Features**:
  - Video player with controls
  - "Extract Audio" button with loading state
  - Error handling and display
  - Integrated WaveformPlayer component
  - Callback support for extracted audio

## Setup Instructions

### Step 1: Install Dependencies
After the package.json update, run:
```bash
npm install
```

This installs:
- **wavesurfer.js** (v7.13.1): Audio visualization library
- FFmpeg dependencies (already in project):
  - @ffmpeg/ffmpeg (v0.12.15)
  - ffmpeg-static (v5.3.0)
  - fluent-ffmpeg (v2.1.3)

### Step 2: System Requirements
Ensure FFmpeg is installed on your system:
- **Windows**: Install from https://ffmpeg.org/download.html or use package manager
- **macOS**: `brew install ffmpeg`
- **Linux**: `sudo apt-get install ffmpeg`

### Step 3: Usage in Components

#### Using VideoPreview Component
```tsx
import VideoPreview from '@/app/components/VideoPreview';

export default function MyPage() {
  return (
    <VideoPreview
      videoUrl="https://example.com/video.mp4"
      title="My Video"
      onExtractAudio={(audioUrl) => {
        console.log('Audio extracted:', audioUrl);
      }}
    />
  );
}
```

#### Using WaveformPlayer Directly
```tsx
import WaveformPlayer from '@/app/components/WaveformPlayer';

export default function MyPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <>
      <video ref={videoRef} src="video.mp4" controls />
      <WaveformPlayer
        audioUrl="audio.wav"
        videoElement={videoRef.current}
        onReady={() => console.log('Waveform ready')}
        onError={(error) => console.error(error)}
      />
    </>
  );
}
```

## How It Works

### Audio Extraction Flow
1. User uploads a video file or clicks "Extract Audio" button
2. Frontend sends video to `/api/extract-audio` endpoint
3. Backend uses FFmpeg to extract audio stream:
   - Input: Video file (MP4, WebM, MOV, etc.)
   - Processing: `ffmpeg -i input.mp4 -q:a 9 output.wav`
   - Output: WAV file saved to `/public/uploads/`
4. API returns audio file URL to frontend
5. Frontend displays waveform using WaveSurfer.js

### Video-Waveform Sync
- **Play/Pause**: Clicking waveform play button syncs with video
- **Seek**: Dragging waveform cursor syncs video playback position
- **External Control**: Video play/pause events trigger waveform sync
- **Time Tolerance**: 0.5s tolerance prevents excessive seeking

## Styling
- **Container**: Dark slate background with rounded corners
- **Waveform**: Blue waveform (#3b82f6) with darker blue progress (#1e40af)
- **Controls**: Tailwind CSS buttons with hover states
- **Responsive**: Waveform adapts to container width

## Error Handling
- Missing FFmpeg: Clear error message with suggestion
- Failed extraction: User-friendly error display
- Network errors: Caught and displayed to user
- Console logging for debugging

## File Storage
- **Location**: `/public/uploads/`
- **Naming**: `audio-{timestamp}.wav`
- **Cleanup**: Temporary input files removed after processing
- **Fallback**: Can be extended to use Supabase Storage

## API Response Format

### Success Response
```json
{
  "success": true,
  "audioUrl": "/uploads/audio-1234567890.wav",
  "audioPath": "/full/path/to/audio-1234567890.wav"
}
```

### Error Response
```json
{
  "error": "Failed to extract audio",
  "details": "FFmpeg error message",
  "code": "EXTRACT_ERROR"
}
```

## Performance Considerations
- Audio extraction is CPU-intensive; shows loading state
- Large video files may take time to process
- Consider adding progress tracking for long operations
- Extracted audio files should be cleaned up after some time

## Future Enhancements
1. Progress tracking for large file extraction
2. Audio trimming/editing before waveform display
3. Support for multiple audio tracks
4. Waveform screenshots/exports
5. Cloud storage integration (Supabase)
6. Browser-based FFmpeg (FFmpeg.wasm) for client-side processing

## Testing
1. Upload a video file
2. Click "Extract Audio" button
3. Wait for extraction to complete
4. Verify waveform displays
5. Test play/pause sync between video and waveform
6. Test seek functionality

## Troubleshooting

**Issue**: "Cannot find module 'wavesurfer.js'"
- **Solution**: Run `npm install` to install dependencies

**Issue**: FFmpeg not found
- **Solution**: Install FFmpeg on your system and ensure it's in PATH

**Issue**: Audio extraction fails
- **Solution**: Check browser console for detailed error; verify video file format

**Issue**: Waveform not syncing with video
- **Solution**: Ensure video element ref is properly passed to WaveformPlayer

## Dependencies Added
- `wavesurfer.js@^7.13.1` - Web Audio API audio visualization library

## Dependencies Already Present
- `@ffmpeg/ffmpeg@^0.12.15` - FFmpeg.wasm (optional fallback)
- `ffmpeg-static@^5.3.0` - Static FFmpeg binary
- `fluent-ffmpeg@^2.1.3` - FFmpeg wrapper
>>>>>>> a482193 (Fix Next.js, React and TypeScript dependencies)
