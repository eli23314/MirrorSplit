#!/usr/bin/env python3
import sys
import json
from faster_whisper import WhisperModel

def transcribe_audio(audio_path):
    # Load medium model for better accuracy (can change to: tiny, base, small, medium, large)
    model = WhisperModel("medium", device="cpu", compute_type="int8")

    # Transcribe with maximum accuracy settings
    segments, info = model.transcribe(
        audio_path,
        beam_size=5,           # Beam search for better accuracy
        language="en",         # Force English
        temperature=0,         # Deterministic mode
        no_speech_threshold=0.6,
        logprob_threshold=-1.0,
        compression_ratio_threshold=2.4,
        condition_on_previous_text=True
    )

    # Convert to our format
    captions = []
    for segment in segments:
        captions.append({
            "start": segment.start,
            "end": segment.end,
            "text": segment.text.strip()
        })

    return captions

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python transcribe.py <audio_file>")
        sys.exit(1)

    audio_file = sys.argv[1]
    try:
        captions = transcribe_audio(audio_file)
        print(json.dumps(captions, indent=2))
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)