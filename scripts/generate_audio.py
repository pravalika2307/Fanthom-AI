import os
import subprocess
import wave
import json

# Ensure public/audio directory exists
os.makedirs("public/audio", exist_ok=True)

# 12 Transcript turns for meeting-arch-q4
turns = [
    {
        "id": "t1",
        "speakerId": "u1",
        "speakerName": "Pravalika Palle",
        "voice": "Microsoft Zira Desktop",
        "rate": 0,
        "text": "Thanks everyone for dialing into the Q4 core architecture sync. Today we need a definitive decision on our distributed caching tier. Our current Memcached cluster is hitting hot-shard limits during morning spikes."
    },
    {
        "id": "t2",
        "speakerId": "u2",
        "speakerName": "Marcus Vance",
        "voice": "Microsoft David Desktop",
        "rate": 1,
        "text": "Right. The primary issue is p99 latency climbing past 450 milliseconds whenever three enterprise clients sync their calendar indexes simultaneously. I evaluated two proposals: upgrading our Memcached topology with consistent hashing, versus migrating to a multi-node Redis cluster with active read-replicas."
    },
    {
        "id": "t3",
        "speakerId": "u4",
        "speakerName": "Dave Kowalski",
        "voice": "Microsoft David Desktop",
        "rate": -1,
        "text": "From an SRE perspective, operating standalone Memcached instances across three AWS availability zones has caused intermittent split-brain scenarios when VPC peering drops. Redis 7 with failover automation would cut our on-call pages by at least forty percent."
    },
    {
        "id": "t4",
        "speakerId": "u8",
        "speakerName": "Tom Becker",
        "voice": "Microsoft David Desktop",
        "rate": 0,
        "text": "Before we get too excited about Redis, what is our encryption in transit policy? We handle SOC2 Type II and HIPAA data for our healthcare clients. We cannot allow unencrypted TLS payloads between cache nodes."
    },
    {
        "id": "t5",
        "speakerId": "u1",
        "speakerName": "Pravalika Palle",
        "voice": "Microsoft Zira Desktop",
        "rate": 0,
        "text": "Good call, Tom. The architecture RFC mandates mutual TLS on port 6380 with automated Let's Encrypt certificate rotation via HashiCorp Vault. In addition, sensitive meeting tokens will be encrypted at the application layer with AES-256-GCM before touching the cache."
    },
    {
        "id": "t6",
        "speakerId": "u5",
        "speakerName": "Elena Rostova",
        "voice": "Microsoft Hazel Desktop",
        "rate": 0,
        "text": "How are we invalidating stale meeting metadata? If an organizer deletes a recording, GDPR mandates immediate purging. If we use write-behind caching, there is a risk of a 30-second window where deleted recordings could still be served from cache."
    },
    {
        "id": "t7",
        "speakerId": "u2",
        "speakerName": "Marcus Vance",
        "voice": "Microsoft David Desktop",
        "rate": 1,
        "text": "That is why I recommend strictly write-through caching with dual-write to PostgreSQL, backed by a Kafka dead-letter queue for retries. If the cache invalidation event fails, the replica automatically flags the key as expired."
    },
    {
        "id": "t8",
        "speakerId": "u3",
        "speakerName": "Sarah Lin",
        "voice": "Microsoft Zira Desktop",
        "rate": 1,
        "text": "What does the migration path look like for live users? Can we do a zero-downtime blue-green cutover, or will we need a scheduled maintenance window over a weekend?"
    },
    {
        "id": "t9",
        "speakerId": "u1",
        "speakerName": "Pravalika Palle",
        "voice": "Microsoft Zira Desktop",
        "rate": 0,
        "text": "We can do a full shadow-read and dual-write rollout over two sprints. In sprint 1, we deploy Redis in shadow mode and compare cache hits against Memcached. In sprint 2, we shift 10% of tenant traffic, monitor p99 metrics, and ramp up to 100% without any user downtime."
    },
    {
        "id": "t10",
        "speakerId": "u7",
        "speakerName": "Rachel Chen",
        "voice": "Microsoft Hazel Desktop",
        "rate": 1,
        "text": "That timeline aligns well with the enterprise launch we have scheduled for late October. Sales has three Fortune 500 pilots waiting on our 99.99% uptime commitment."
    },
    {
        "id": "t11",
        "speakerId": "u6",
        "speakerName": "James Thornton",
        "voice": "Microsoft David Desktop",
        "rate": 2,
        "text": "On the frontend, if cache responses drop to under 50ms, we can remove the optimistic retry debouncing in the meeting player, which immediately simplifies the state machine in React."
    },
    {
        "id": "t12",
        "speakerId": "u1",
        "speakerName": "Pravalika Palle",
        "voice": "Microsoft Zira Desktop",
        "rate": 0,
        "text": "Sounds like we have clear consensus. Decision: We approve RFC-204 for the Redis Cluster with mutual TLS and write-through invalidation. Marcus will lead the backend implementation, Dave handles the Terraform infra, and Tom reviews security certificates."
    }
]

temp_dir = "scripts/temp_wav"
os.makedirs(temp_dir, exist_ok=True)

# Generate individual turn audio via PowerShell SpeechSynthesizer
for i, turn in enumerate(turns):
    out_file = os.path.abspath(os.path.join(temp_dir, f"turn_{i}.wav")).replace('\\', '/')
    escaped_text = turn["text"].replace('"', '`"').replace("'", "''")
    ps_cmd = f"""
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SelectVoice('{turn["voice"]}')
$synth.Rate = {turn["rate"]}
$synth.SetOutputToWaveFile('{out_file}')
$synth.Speak('{escaped_text}')
$synth.Dispose()
"""
    ps_file = os.path.join(temp_dir, f"speak_{i}.ps1")
    with open(ps_file, "w", encoding="utf-8") as f:
        f.write(ps_cmd)
    
    subprocess.run(["powershell", "-ExecutionPolicy", "Bypass", "-File", ps_file], check=True)
    print(f"Generated turn {i}: {turn['speakerName']}")

# Now concatenate with a short pause (0.75s silence) between turns
final_wav = "public/audio/q4-core-architecture.wav"
silence_sec = 0.75

turn_timings = []
current_time = 0.0

with wave.open(os.path.join(temp_dir, "turn_0.wav"), 'rb') as first_w:
    params = first_w.getparams()
    sample_rate = params.framerate
    num_channels = params.nchannels
    sampwidth = params.sampwidth

silence_frames = int(sample_rate * silence_sec)
silence_bytes = b'\x00' * (silence_frames * num_channels * sampwidth)

with wave.open(final_wav, 'wb') as outfile:
    outfile.setparams(params)
    for i, turn in enumerate(turns):
        turn_file = os.path.join(temp_dir, f"turn_{i}.wav")
        with wave.open(turn_file, 'rb') as infile:
            n_frames = infile.getnframes()
            duration = n_frames / sample_rate
            data = infile.readframes(n_frames)
            
            start_t = round(current_time, 2)
            end_t = round(current_time + duration, 2)
            
            turn_timings.append({
                "id": turn["id"],
                "speakerId": turn["speakerId"],
                "speakerName": turn["speakerName"],
                "startTime": int(round(start_t)),
                "endTime": int(round(end_t)),
                "startTimeFloat": start_t,
                "endTimeFloat": end_t,
                "duration": round(duration, 2),
                "text": turn["text"]
            })
            
            outfile.writeframes(data)
            current_time += duration
            
            if i < len(turns) - 1:
                outfile.writeframes(silence_bytes)
                current_time += silence_sec

total_duration = current_time
print(f"Final audio created: {final_wav}")
print(f"Total duration: {total_duration:.2f} seconds ({int(total_duration // 60):02d}:{int(total_duration % 60):02d})")

with open("scripts/turn_timings.json", "w", encoding="utf-8") as f:
    json.dump({"totalDurationSeconds": int(round(total_duration)), "turns": turn_timings}, f, indent=2)
print("Saved scripts/turn_timings.json")
