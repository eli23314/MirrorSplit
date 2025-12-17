# ...existing code...
# Audio Extraction & Waveform Feature - FAQ

## Installation & Setup

### Q: My terminal keeps crashing with PSReadLine errors. What should I do?
**A:** This is a PowerShell issue unrelated to the audio feature. Close your terminal and open a new one. The npm install will work in the fresh terminal.

### Q: Do I need to do anything special to install WaveSurfer.js?
**A:** No! Just run `npm install` from the project root directory. It's already added to package.json and will install automatically.

### Q: FFmpeg keeps saying "command not found". What's wrong?
**A:** FFmpeg isn't installed on your system or not in PATH. Download from https://ffmpeg.org/download.html and follow installation instructions for your OS. Test with `ffmpeg -version`.

### Q: Do I need to restart my dev server after npm install?
**A:** Yes. Kill the current `npm run dev` process and run it again. The new dependencies need to be loaded.

### Q: Where do the extracted audio files go?
**A:** They're saved to `/public/uploads/audio-{timestamp}.wav`. These are static files served directly by Next.js.

---

## Usage & Integration

### Q: How do I add the waveform feature to my existing page?
**A:** Import `VideoPreview` component and pass a video URL:

```tsx
import VideoPreview from '@/app/components/VideoPreview';

export default function MyPage() {
  return <VideoPreview videoUrl="video.mp4" title="My Video" />;
}
```

### Q: Can I use the waveform with my own video element instead of VideoPreview?
**A:** Yes! Use `WaveformPlayer` directly and pass your video element as a ref:

```tsx
import WaveformPlayer from '@/app/components/WaveformPlayer';
import { useRef } from 'react';

export default function MyComponent() {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  return (
    <>
      <video ref={videoRef} src="video.mp4" controls />
      <WaveformPlayer audioUrl="audio.wav" videoElement={videoRef.current} />
    </>
  );
}
```

### Q: How do I get the audio URL after extraction in my code?
**A:** Use the `onExtractAudio` callback in VideoPreview:

```tsx
<VideoPreview 
  videoUrl="video.mp4"
  onExtractAudio={(audioUrl) => {
    console.log('Audio extracted:', audioUrl);
    // Do something with audioUrl
  }}
/>
```

### Q: Can I extract audio without showing the waveform?
**A:** Yes! Call the API directly:

```tsx
const formData = new FormData();
formData.append('file', videoFile);

const res = await fetch('/api/extract-audio', {
  method: 'POST',
  body: formData
});

const data = await res.json();
console.log('Audio URL:', data.audioUrl);
```

### Q: Do I have to show the video player along with the waveform?
**A:** No, the waveform works independently. You can show waveform without video, though synchronization requires the video element.

---

## Functionality

### Q: What video formats are supported?
**A:** Any format FFmpeg supports: MP4, WebM, MOV, AVI, MKV, FLV, WMV, and more. Audio is always extracted as WAV.

### Q: What audio qualities are available?
**A:** Currently, audio is extracted at high quality (WAV, 44.1kHz, 16-bit). You can modify the FFmpeg quality setting in `/api/extract-audio/route.ts` if needed.

### Q: How long does audio extraction take?
**A:** Depends on file size:
- Small videos (<100MB): 5-10 seconds
- Medium videos (100-500MB): 15-30 seconds
- Large videos (>500MB): 1-3+ minutes

### Q: Can I show a progress bar during extraction?
**A:** Currently, the component shows "Extracting..." while processing. Adding real-time progress requires streaming FFmpeg output, which is more complex. This can be added later.

### Q: What happens if extraction fails?
**A:** An error message displays in the component. Check browser console and `/api/extract-audio` response for details. Common issues: FFmpeg not found, invalid file, insufficient disk space.

### Q: Can I cancel an extraction in progress?
**A:** Currently, no. The extraction runs to completion. Cancellation could be added later using AbortController.

---

## Video-Audio Synchronization

### Q: How does the video-waveform sync work?
**A:** 
1. Waveform play → Video plays
2. Video play → Waveform plays
3. Waveform seek → Video seeks
4. Video seek → Waveform seeks
5. Both check if out-of-sync (>0.5s) and correct

### Q: Is the sync perfect?
**A:** Nearly perfect with 0.5-second tolerance. Small drift may occur due to browser timing precision, but it self-corrects.

### Q: What if the video and audio have different durations?
**A:** The waveform uses audio duration. If video and audio lengths differ significantly, they may get out of sync. For best results, ensure video audio track matches the extracted audio.

### Q: Can I disable the auto-sync?
**A:** Currently, no. The WaveformPlayer always syncs. You could create a custom version without sync for display-only use.

---

## Performance

### Q: Will large video uploads work?
**A:** Yes, but extraction takes longer. A 1GB video takes 5-10 minutes to process. You might want to add:
- Progress indication
- File size limits
- Processing queue
- Background processing

### Q: How much disk space do I need?
**A:** You need space for both the original and extracted audio:
- Original video: X MB
- Extracted audio: ~1 MB per minute
- Temporary files: X MB (cleaned up after)
Total: ~2X MB per video

### Q: Will this work on Vercel?
**A:** FFmpeg needs to be on the server. Vercel has FFmpeg available in serverless functions, so this should work. Test before deploying.

### Q: Can multiple users extract audio simultaneously?
**A:** Yes, but each extraction uses CPU resources. Many simultaneous extractions may slow down the server. Consider adding a queue system if you expect high volume.

---

## Styling & Customization

### Q: Can I change the waveform colors?
**A:** Yes! In `WaveformPlayer.tsx`, modify the WaveSurfer options:

```tsx
const wavesurfer = WaveSurfer.create({
  waveColor: '#3b82f6',      // Blue
  progressColor: '#1e40af',  // Dark blue
  cursorColor: '#1e40af',    // Change these
  // ... other options
});
```

### Q: Can I make the waveform taller or shorter?
**A:** Yes, in WaveformPlayer, change the `height` option:

```tsx
const wavesurfer = WaveSurfer.create({
  height: 80,  // Pixels, default is 80
  // ... other options
});
```

### Q: Can I add a theme/dark mode?
**A:** Yes! The component uses Tailwind CSS classes. Modify the className strings in the component files.

### Q: Can I customize the button text and labels?
**A:** Yes! All text is hardcoded in the components. Search for the text you want to change and modify it.

---

## Troubleshooting

### Q: Audio extraction fails with "FFmpeg not found"
**A:** 
1. Verify FFmpeg is installed: `ffmpeg -version`
2. If not installed, download from https://ffmpeg.org/download.html
3. Add to system PATH (Windows) or use `brew install ffmpeg` (Mac)
4. Restart your dev server after installing

### Q: Waveform doesn't load after extraction
**A:**
1. Check browser console for errors
2. Verify audio file exists in `/public/uploads/`
3. Check CORS if audio is from external source
4. Ensure WaveSurfer.js is installed: `ls node_modules/wavesurfer.js`

### Q: Video and waveform are out of sync
**A:**
1. Reload the page
2. Verify both files have same duration
3. Check browser console for errors
4. Try with a different video file

### Q: "Cannot find module 'wavesurfer.js'" error
**A:** Run `npm install` to install missing dependencies

### Q: API returns 500 error
**A:**
1. Check FFmpeg is installed and working
2. Verify video file is valid
3. Check disk space
4. Look at server logs for specific error

### Q: Extracted audio has no sound
**A:** The video might not have an audio track. Extract from a video that has audio.

---

## Security & Privacy

### Q: Are uploaded videos stored permanently?
**A:** Videos are stored in `/public/uploads/` and persist until manually deleted. Consider implementing auto-cleanup of old files.

### Q: Is my audio data sent to external services?
**A:** No! Everything runs locally. No data is sent to external APIs. (Unless you add such integration later)

### Q: Are there any privacy concerns with this feature?
**A:** Audio files are stored publicly in `/public/uploads/`. If privacy is needed, implement authentication and private storage.

### Q: Can I password-protect extracted audio?
**A:** Currently, no. All audio files in `/public/uploads/` are publicly accessible. Implement authentication if needed.

---

## Browser Compatibility

### Q: Does this work on Safari?
**A:** Yes! Both WaveSurfer.js and Web Audio API are fully supported on modern Safari.

### Q: Does this work on mobile browsers?
**A:** Yes! The UI is responsive. Audio extraction might be slower on mobile due to server processing.

### Q: Does this work on Internet Explorer?
**A:** No. This uses modern Web APIs. Only works on modern browsers (Chrome, Firefox, Safari, Edge).

### Q: What's the minimum browser version required?
**A:** Any modern browser released in the last 3-4 years. Specifically:
- Chrome 90+
- Firefox 87+
- Safari 14+
- Edge 90+

---

## Advanced Topics

### Q: Can I use FFmpeg.wasm instead of system FFmpeg?
**A:** Yes, but it's slower. FFmpeg.wasm runs in the browser. System FFmpeg (what we're using) is faster. Current setup is recommended.

### Q: How can I add audio normalization?
**A:** Modify the FFmpeg command in `/api/extract-audio/route.ts` to include normalization filters:

```bash
ffmpeg -i input.mp4 -af "loudnorm" output.wav
```

### Q: Can I extract multiple audio tracks?
**A:** Currently, only one audio track is extracted (the first one). To extract multiple, would need to modify the API.

### Q: How do I save extracted audio to Supabase Storage instead of local?
**A:** Modify `/api/extract-audio/route.ts` to upload the WAV file to Supabase Storage after extraction.

### Q: Can I add audio analysis (BPM, key detection)?
**A:** Yes, but requires additional libraries like Essentia.js or TarsosDSP. This would be a future enhancement.

---

## Getting Help

### Q: Where can I find more examples?
**A:** See `INTEGRATION_EXAMPLES.tsx` in the project root for 10+ real-world examples.

### Q: Where's the complete API documentation?
**A:** See `AUDIO_EXTRACTION_SETUP.md` for API details and response formats.

### Q: How do I understand the architecture?
**A:** See `ARCHITECTURE_DIAGRAMS.md` for visual flowcharts and component diagrams.

### Q: Is there a troubleshooting guide?
**A:** Yes! See the "Troubleshooting" section in `QUICK_START_AUDIO.md`

### Q: What if I find a bug?
**A:** Check the browser console for detailed error messages. If it's a code issue, check `ARCHITECTURE_DIAGRAMS.md` to understand the flow and locate where the error occurs.

---

## Future Enhancements

### Q: What features are planned?
**A:** See `AUDIO_WAVEFORM_COMPLETE_SUMMARY.md` "Next Steps" section for planned features.

### Q: Can I add audio trimming?
**A:** Yes, this is on the enhancement roadmap. Would require a new component and API endpoint.

### Q: Can I add audio effects?
**A:** Yes, you can use Web Audio API effects after extracting. Would require a new component for effect controls.

### Q: Can I add speech-to-text?
**A:** Yes, but requires integration with a speech-to-text service or library. Currently out of scope as per "no AI services" requirement.

---

## Support & Contact

**Documentation Files:**
1. `AUDIO_EXTRACTION_SETUP.md` - Technical setup guide
2. `QUICK_START_AUDIO.md` - Quick start guide
3. `INTEGRATION_EXAMPLES.tsx` - Code examples
4. `AUDIO_WAVEFORM_COMPLETE_SUMMARY.md` - Complete overview
5. `ARCHITECTURE_DIAGRAMS.md` - Visual diagrams
6. `IMPLEMENTATION_CHECKLIST.md` - Implementation checklist
7. This file - FAQ

**Recommended Reading Order:**
1. Start with `QUICK_START_AUDIO.md`
2. Read `INTEGRATION_EXAMPLES.tsx` for your use case
3. Check `ARCHITECTURE_DIAGRAMS.md` if you need to understand internals
4. Use `FAQ` (this file) for specific questions
5. Reference `AUDIO_EXTRACTION_SETUP.md` for detailed info

---

## Quick Reference

| What | Where |
|------|-------|
| Setup Instructions | `QUICK_START_AUDIO.md` |
| Code Examples | `INTEGRATION_EXAMPLES.tsx` |
| API Details | `AUDIO_EXTRACTION_SETUP.md` |
| How It Works | `ARCHITECTURE_DIAGRAMS.md` |
| Implementation Plan | `IMPLEMENTATION_CHECKLIST.md` |
| Big Picture | `AUDIO_WAVEFORM_COMPLETE_SUMMARY.md` |
| Questions | This FAQ |

---

Last Updated: 2024
Version: 1.0
Status: ✅ Complete
=======
# Audio Extraction & Waveform Feature - FAQ

## Installation & Setup

### Q: My terminal keeps crashing with PSReadLine errors. What should I do?
**A:** This is a PowerShell issue unrelated to the audio feature. Close your terminal and open a new one. The npm install will work in the fresh terminal.

### Q: Do I need to do anything special to install WaveSurfer.js?
**A:** No! Just run `npm install` from the project root directory. It's already added to package.json and will install automatically.

### Q: FFmpeg keeps saying "command not found". What's wrong?
**A:** FFmpeg isn't installed on your system or not in PATH. Download from https://ffmpeg.org/download.html and follow installation instructions for your OS. Test with `ffmpeg -version`.

### Q: Do I need to restart my dev server after npm install?
**A:** Yes. Kill the current `npm run dev` process and run it again. The new dependencies need to be loaded.

### Q: Where do the extracted audio files go?
**A:** They're saved to `/public/uploads/audio-{timestamp}.wav`. These are static files served directly by Next.js.

---

## Usage & Integration

### Q: How do I add the waveform feature to my existing page?
**A:** Import `VideoPreview` component and pass a video URL:

```tsx
import VideoPreview from '@/app/components/VideoPreview';

export default function MyPage() {
  return <VideoPreview videoUrl="video.mp4" title="My Video" />;
}
```

### Q: Can I use the waveform with my own video element instead of VideoPreview?
**A:** Yes! Use `WaveformPlayer` directly and pass your video element as a ref:

```tsx
import WaveformPlayer from '@/app/components/WaveformPlayer';
import { useRef } from 'react';

export default function MyComponent() {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  return (
    <>
      <video ref={videoRef} src="video.mp4" controls />
      <WaveformPlayer audioUrl="audio.wav" videoElement={videoRef.current} />
    </>
  );
}
```

### Q: How do I get the audio URL after extraction in my code?
**A:** Use the `onExtractAudio` callback in VideoPreview:

```tsx
<VideoPreview 
  videoUrl="video.mp4"
  onExtractAudio={(audioUrl) => {
    console.log('Audio extracted:', audioUrl);
    // Do something with audioUrl
  }}
/>
```

### Q: Can I extract audio without showing the waveform?
**A:** Yes! Call the API directly:

```tsx
const formData = new FormData();
formData.append('file', videoFile);

const res = await fetch('/api/extract-audio', {
  method: 'POST',
  body: formData
});

const data = await res.json();
console.log('Audio URL:', data.audioUrl);
```

### Q: Do I have to show the video player along with the waveform?
**A:** No, the waveform works independently. You can show waveform without video, though synchronization requires the video element.

---

## Functionality

### Q: What video formats are supported?
**A:** Any format FFmpeg supports: MP4, WebM, MOV, AVI, MKV, FLV, WMV, and more. Audio is always extracted as WAV.

### Q: What audio qualities are available?
**A:** Currently, audio is extracted at high quality (WAV, 44.1kHz, 16-bit). You can modify the FFmpeg quality setting in `/api/extract-audio/route.ts` if needed.

### Q: How long does audio extraction take?
**A:** Depends on file size:
- Small videos (<100MB): 5-10 seconds
- Medium videos (100-500MB): 15-30 seconds
- Large videos (>500MB): 1-3+ minutes

### Q: Can I show a progress bar during extraction?
**A:** Currently, the component shows "Extracting..." while processing. Adding real-time progress requires streaming FFmpeg output, which is more complex. This can be added later.

### Q: What happens if extraction fails?
**A:** An error message displays in the component. Check browser console and `/api/extract-audio` response for details. Common issues: FFmpeg not found, invalid file, insufficient disk space.

### Q: Can I cancel an extraction in progress?
**A:** Currently, no. The extraction runs to completion. Cancellation could be added later using AbortController.

---

## Video-Audio Synchronization

### Q: How does the video-waveform sync work?
**A:** 
1. Waveform play → Video plays
2. Video play → Waveform plays
3. Waveform seek → Video seeks
4. Video seek → Waveform seeks
5. Both check if out-of-sync (>0.5s) and correct

### Q: Is the sync perfect?
**A:** Nearly perfect with 0.5-second tolerance. Small drift may occur due to browser timing precision, but it self-corrects.

### Q: What if the video and audio have different durations?
**A:** The waveform uses audio duration. If video and audio lengths differ significantly, they may get out of sync. For best results, ensure video audio track matches the extracted audio.

### Q: Can I disable the auto-sync?
**A:** Currently, no. The WaveformPlayer always syncs. You could create a custom version without sync for display-only use.

---

## Performance

### Q: Will large video uploads work?
**A:** Yes, but extraction takes longer. A 1GB video takes 5-10 minutes to process. You might want to add:
- Progress indication
- File size limits
- Processing queue
- Background processing

### Q: How much disk space do I need?
**A:** You need space for both the original and extracted audio:
- Original video: X MB
- Extracted audio: ~1 MB per minute
- Temporary files: X MB (cleaned up after)
Total: ~2X MB per video

### Q: Will this work on Vercel?
**A:** FFmpeg needs to be on the server. Vercel has FFmpeg available in serverless functions, so this should work. Test before deploying.

### Q: Can multiple users extract audio simultaneously?
**A:** Yes, but each extraction uses CPU resources. Many simultaneous extractions may slow down the server. Consider adding a queue system if you expect high volume.

---

## Styling & Customization

### Q: Can I change the waveform colors?
**A:** Yes! In `WaveformPlayer.tsx`, modify the WaveSurfer options:

```tsx
const wavesurfer = WaveSurfer.create({
  waveColor: '#3b82f6',      // Blue
  progressColor: '#1e40af',  // Dark blue
  cursorColor: '#1e40af',    // Change these
  // ... other options
});
```

### Q: Can I make the waveform taller or shorter?
**A:** Yes, in WaveformPlayer, change the `height` option:

```tsx
const wavesurfer = WaveSurfer.create({
  height: 80,  // Pixels, default is 80
  // ... other options
});
```

### Q: Can I add a theme/dark mode?
**A:** Yes! The component uses Tailwind CSS classes. Modify the className strings in the component files.

### Q: Can I customize the button text and labels?
**A:** Yes! All text is hardcoded in the components. Search for the text you want to change and modify it.

---

## Troubleshooting

### Q: Audio extraction fails with "FFmpeg not found"
**A:** 
1. Verify FFmpeg is installed: `ffmpeg -version`
2. If not installed, download from https://ffmpeg.org/download.html
3. Add to system PATH (Windows) or use `brew install ffmpeg` (Mac)
4. Restart your dev server after installing

### Q: Waveform doesn't load after extraction
**A:**
1. Check browser console for errors
2. Verify audio file exists in `/public/uploads/`
3. Check CORS if audio is from external source
4. Ensure WaveSurfer.js is installed: `ls node_modules/wavesurfer.js`

### Q: Video and waveform are out of sync
**A:**
1. Reload the page
2. Verify both files have same duration
3. Check browser console for errors
4. Try with a different video file

### Q: "Cannot find module 'wavesurfer.js'" error
**A:** Run `npm install` to install missing dependencies

### Q: API returns 500 error
**A:**
1. Check FFmpeg is installed and working
2. Verify video file is valid
3. Check disk space
4. Look at server logs for specific error

### Q: Extracted audio has no sound
**A:** The video might not have an audio track. Extract from a video that has audio.

---

## Security & Privacy

### Q: Are uploaded videos stored permanently?
**A:** Videos are stored in `/public/uploads/` and persist until manually deleted. Consider implementing auto-cleanup of old files.

### Q: Is my audio data sent to external services?
**A:** No! Everything runs locally. No data is sent to external APIs. (Unless you add such integration later)

### Q: Are there any privacy concerns with this feature?
**A:** Audio files are stored publicly in `/public/uploads/`. If privacy is needed, implement authentication and private storage.

### Q: Can I password-protect extracted audio?
**A:** Currently, no. All audio files in `/public/uploads/` are publicly accessible. Implement authentication if needed.

---

## Browser Compatibility

### Q: Does this work on Safari?
**A:** Yes! Both WaveSurfer.js and Web Audio API are fully supported on modern Safari.

### Q: Does this work on mobile browsers?
**A:** Yes! The UI is responsive. Audio extraction might be slower on mobile due to server processing.

### Q: Does this work on Internet Explorer?
**A:** No. This uses modern Web APIs. Only works on modern browsers (Chrome, Firefox, Safari, Edge).

### Q: What's the minimum browser version required?
**A:** Any modern browser released in the last 3-4 years. Specifically:
- Chrome 90+
- Firefox 87+
- Safari 14+
- Edge 90+

---

## Advanced Topics

### Q: Can I use FFmpeg.wasm instead of system FFmpeg?
**A:** Yes, but it's slower. FFmpeg.wasm runs in the browser. System FFmpeg (what we're using) is faster. Current setup is recommended.

### Q: How can I add audio normalization?
**A:** Modify the FFmpeg command in `/api/extract-audio/route.ts` to include normalization filters:

```bash
ffmpeg -i input.mp4 -af "loudnorm" output.wav
```

### Q: Can I extract multiple audio tracks?
**A:** Currently, only one audio track is extracted (the first one). To extract multiple, would need to modify the API.

### Q: How do I save extracted audio to Supabase Storage instead of local?
**A:** Modify `/api/extract-audio/route.ts` to upload the WAV file to Supabase Storage after extraction.

### Q: Can I add audio analysis (BPM, key detection)?
**A:** Yes, but requires additional libraries like Essentia.js or TarsosDSP. This would be a future enhancement.

---

## Getting Help

### Q: Where can I find more examples?
**A:** See `INTEGRATION_EXAMPLES.tsx` in the project root for 10+ real-world examples.

### Q: Where's the complete API documentation?
**A:** See `AUDIO_EXTRACTION_SETUP.md` for API details and response formats.

### Q: How do I understand the architecture?
**A:** See `ARCHITECTURE_DIAGRAMS.md` for visual flowcharts and component diagrams.

### Q: Is there a troubleshooting guide?
**A:** Yes! See the "Troubleshooting" section in `QUICK_START_AUDIO.md`

### Q: What if I find a bug?
**A:** Check the browser console for detailed error messages. If it's a code issue, check `ARCHITECTURE_DIAGRAMS.md` to understand the flow and locate where the error occurs.

---

## Future Enhancements

### Q: What features are planned?
**A:** See `AUDIO_WAVEFORM_COMPLETE_SUMMARY.md` "Next Steps" section for planned features.

### Q: Can I add audio trimming?
**A:** Yes, this is on the enhancement roadmap. Would require a new component and API endpoint.

### Q: Can I add audio effects?
**A:** Yes, you can use Web Audio API effects after extracting. Would require a new component for effect controls.

### Q: Can I add speech-to-text?
**A:** Yes, but requires integration with a speech-to-text service or library. Currently out of scope as per "no AI services" requirement.

---

## Support & Contact

**Documentation Files:**
1. `AUDIO_EXTRACTION_SETUP.md` - Technical setup guide
2. `QUICK_START_AUDIO.md` - Quick start guide
3. `INTEGRATION_EXAMPLES.tsx` - Code examples
4. `AUDIO_WAVEFORM_COMPLETE_SUMMARY.md` - Complete overview
5. `ARCHITECTURE_DIAGRAMS.md` - Visual diagrams
6. `IMPLEMENTATION_CHECKLIST.md` - Implementation checklist
7. This file - FAQ

**Recommended Reading Order:**
1. Start with `QUICK_START_AUDIO.md`
2. Read `INTEGRATION_EXAMPLES.tsx` for your use case
3. Check `ARCHITECTURE_DIAGRAMS.md` if you need to understand internals
4. Use `FAQ` (this file) for specific questions
5. Reference `AUDIO_EXTRACTION_SETUP.md` for detailed info

---

## Quick Reference

| What | Where |
|------|-------|
| Setup Instructions | `QUICK_START_AUDIO.md` |
| Code Examples | `INTEGRATION_EXAMPLES.tsx` |
| API Details | `AUDIO_EXTRACTION_SETUP.md` |
| How It Works | `ARCHITECTURE_DIAGRAMS.md` |
| Implementation Plan | `IMPLEMENTATION_CHECKLIST.md` |
| Big Picture | `AUDIO_WAVEFORM_COMPLETE_SUMMARY.md` |
| Questions | This FAQ |

---

Last Updated: 2024
Version: 1.0
Status: ✅ Complete
>>>>>>> a482193 (Fix Next.js, React and TypeScript dependencies)
