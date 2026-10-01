import os
import subprocess
import wave
import json

# Ensure output directory exists
os.makedirs("public/audio", exist_ok=True)
temp_dir = "scripts/temp_spoken"
os.makedirs(temp_dir, exist_ok=True)

# 1. Query installed voices dynamically from System.Speech
voice_check_ps = """
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.GetInstalledVoices() | ForEach-Object { $_.VoiceInfo.Name }
"""
voice_check_file = os.path.join(temp_dir, "check_voices.ps1")
with open(voice_check_file, "w", encoding="utf-8") as f:
    f.write(voice_check_ps)

result = subprocess.run(
    ["powershell", "-ExecutionPolicy", "Bypass", "-File", voice_check_file],
    capture_output=True, text=True, check=True
)
available_voices = [line.strip() for line in result.stdout.strip().splitlines() if line.strip()]
print("Discovered Windows Voices:", available_voices)

# Select voices based on availability
voice_pravalika = next((v for v in available_voices if "Zira" in v), available_voices[0])
voice_marcus = next((v for v in available_voices if "David" in v), available_voices[0])
voice_dave = next((v for v in available_voices if "David" in v), available_voices[0])
voice_sarah = next((v for v in available_voices if "Hazel" in v or "Zira" in v), available_voices[0])

# Exact script requested by the user
script_turns = [
    {
        "id": "turn-1",
        "speaker": "Pravalika Reddy",
        "voice": voice_pravalika,
        "rate": -2,
        "pause_before": 1.5,
        "text": "Thanks everyone for joining the Q4 core architecture sync. Today we need a definitive decision on our distributed caching layer. Our current Memcached cluster is hitting hot-shard limits during morning spikes."
    },
    {
        "id": "turn-2",
        "speaker": "Marcus Vance",
        "voice": voice_marcus,
        "rate": -1,
        "pause_before": 8.5,
        "text": "The primary issue is p99 latency climbing past 450 milliseconds whenever three enterprise clients sync their calendar indexes simultaneously. I evaluated two proposals: upgrading our Memcached topology with consistent hashing, versus migrating to a multi-node Redis cluster with active read replicas."
    },
    {
        "id": "turn-3",
        "speaker": "Dave Kowalski",
        "voice": voice_dave,
        "rate": -2,
        "pause_before": 9.5,
        "text": "From an SRE perspective, operating standalone Memcached instances across three AWS availability zones has caused intermittent split-brain scenarios when VPC peering drops. Redis 7 with failover automation would reduce our on-call risk significantly."
    },
    {
        "id": "turn-4",
        "speaker": "Pravalika Reddy",
        "voice": voice_pravalika,
        "rate": -2,
        "pause_before": 8.5,
        "text": "Given the reliability concerns, I'm leaning toward Redis 7 with Raft consensus for the session tier."
    },
    {
        "id": "turn-5",
        "speaker": "Sarah Lin",
        "voice": voice_sarah,
        "rate": -1,
        "pause_before": 7.5,
        "text": "I agree, but we need to make sure the migration doesn't introduce data consistency problems during the transition."
    },
    {
        "id": "turn-6",
        "speaker": "Marcus Vance",
        "voice": voice_marcus,
        "rate": -1,
        "pause_before": 7.5,
        "text": "Then we should explicitly reject write-behind caching and use dual-write shadow traffic during the migration."
    },
    {
        "id": "turn-7",
        "speaker": "Pravalika Reddy",
        "voice": voice_pravalika,
        "rate": -2,
        "pause_before": 8.0,
        "text": "Agreed. We'll start with a 10 percent canary, monitor the failover benchmarks, and expand over two sprints."
    },
    {
        "id": "turn-8",
        "speaker": "Dave Kowalski",
        "voice": voice_dave,
        "rate": -2,
        "pause_before": 7.5,
        "text": "That gives SRE a clear rollback path and removes the current single-cluster failure concern."
    },
    {
        "id": "turn-9",
        "speaker": "Pravalika Reddy",
        "voice": voice_pravalika,
        "rate": -2,
        "pause_before": 8.0,
        "text": "Let's record the decision: Redis 7 cluster migration, no write-behind caching, and a phased dual-write rollout."
    }
]

# Generate each speech segment
turn_wavs = []
for i, turn in enumerate(script_turns):
    turn_wav = os.path.abspath(os.path.join(temp_dir, f"speech_{i}.wav")).replace('\\', '/')
    escaped_text = turn["text"].replace('"', '`"').replace("'", "''")
    ps_cmd = f"""
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SelectVoice('{turn["voice"]}')
$synth.Rate = {turn["rate"]}
$synth.SetOutputToWaveFile('{turn_wav}')
$synth.Speak('{escaped_text}')
$synth.Dispose()
"""
    ps_file = os.path.join(temp_dir, f"speak_{i}.ps1")
    with open(ps_file, "w", encoding="utf-8") as f:
        f.write(ps_cmd)
    
    subprocess.run(["powershell", "-ExecutionPolicy", "Bypass", "-File", ps_file], check=True)
    turn_wavs.append(turn_wav)

# Determine audio format from first clip
with wave.open(turn_wavs[0], 'rb') as first_w:
    params = first_w.getparams()
    sample_rate = params.framerate
    num_channels = params.nchannels
    sampwidth = params.sampwidth

# Assemble master WAV file
out_wav_path = "public/audio/q4-core-architecture.wav"
total_time_cursor = 0.0
turn_metadata = []

with wave.open(out_wav_path, 'wb') as outfile:
    outfile.setparams(params)
    
    for i, turn in enumerate(script_turns):
        # 1. Add natural pause before turn
        pause_sec = turn["pause_before"]
        silence_frames = int(sample_rate * pause_sec)
        silence_bytes = b'\x00' * (silence_frames * num_channels * sampwidth)
        outfile.writeframes(silence_bytes)
        total_time_cursor += pause_sec
        
        # 2. Add spoken turn
        turn_file = turn_wavs[i]
        with wave.open(turn_file, 'rb') as tw:
            n_frames = tw.getnframes()
            dur = n_frames / sample_rate
            raw_audio = tw.readframes(n_frames)
            
            turn_metadata.append({
                "id": turn["id"],
                "speaker": turn["speaker"],
                "voice": turn["voice"],
                "startTimeSeconds": round(total_time_cursor, 2),
                "endTimeSeconds": round(total_time_cursor + dur, 2),
                "durationSeconds": round(dur, 2),
                "text": turn["text"]
            })
            
            outfile.writeframes(raw_audio)
            total_time_cursor += dur
            
    # Final wrap-up pause (4.0s)
    end_silence_frames = int(sample_rate * 4.0)
    outfile.writeframes(b'\x00' * (end_silence_frames * num_channels * sampwidth))
    total_time_cursor += 4.0

# Clean up temp files
for f in os.listdir(temp_dir):
    try:
        os.remove(os.path.join(temp_dir, f))
    except Exception:
        pass
try:
    os.rmdir(temp_dir)
except Exception:
    pass

file_size_bytes = os.path.getsize(out_wav_path)
minutes = int(total_time_cursor // 60)
seconds = int(total_time_cursor % 60)
formatted_dur = f"{minutes:02d}:{seconds:02d}"

print("=== REAL SPOKEN DEMO AUDIO GENERATION COMPLETE ===")
print(f"Destination: {os.path.abspath(out_wav_path)}")
print(f"File Size: {file_size_bytes:,} bytes")
print(f"Total Duration: {total_time_cursor:.2f} seconds ({formatted_dur})")
print(f"Voices Assigned:")
for t in turn_metadata:
    print(f"  - [{t['startTimeSeconds']:05.1f}s - {t['endTimeSeconds']:05.1f}s] {t['speaker']}: {t['voice']}")

# Save timing metadata for reference
with open("scripts/spoken_demo_timings.json", "w", encoding="utf-8") as f:
    json.dump({
        "audioFile": out_wav_path,
        "totalDurationSeconds": round(total_time_cursor, 2),
        "formattedDuration": formatted_dur,
        "fileSizeBytes": file_size_bytes,
        "turns": turn_metadata
    }, f, indent=2)
