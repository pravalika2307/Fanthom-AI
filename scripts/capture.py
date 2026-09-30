#!/usr/bin/env python3
"""
8x SWE Assignment - Automatic Agent Capture Script (PostInvocation)
Captures prompt -> final response for every completed turn into .agent-logs/
Dynamically resolves actual selected model from Antigravity session metadata/transcript.
"""

import os
import sys
import json
import re
import argparse
from pathlib import Path
from datetime import datetime, timezone

AUTHOR = "pravalika2307"
PROJECT = "Fanthom-AI"
TOOL_NAME = "Antigravity IDE"

REPO_ROOT = Path(__file__).resolve().parent.parent
LOG_DIR = REPO_ROOT / ".agent-logs"
BRAIN_BASE = Path(r"C:\Users\Prava\.gemini\antigravity-ide\brain")
CONV_DIR = Path(r"C:\Users\Prava\.gemini\antigravity-ide\conversations")


def read_stdin_safe():
    """Safely reads stdin without blocking indefinitely on Windows."""
    try:
        import msvcrt
        import ctypes
        from ctypes import wintypes
        handle = msvcrt.get_osfhandle(sys.stdin.fileno())
        avail = wintypes.DWORD()
        success = ctypes.windll.kernel32.PeekNamedPipe(handle, None, 0, None, ctypes.byref(avail), None)
        if success and avail.value > 0:
            return sys.stdin.read(avail.value)
    except Exception:
        pass
    return ""


def extract_prompt_text(content):
    """Extract verbatim prompt, stripping outer system-injected tags if present."""
    if not content:
        return ""
    m = re.search(r"<USER_REQUEST>\s*(.*?)\s*</USER_REQUEST>", content, re.DOTALL)
    if m:
        return m.group(1).strip()
    return content.strip()


def resolve_actual_model_name(session_id, transcript_path=None, hook_model=None):
    """
    Dynamically investigates Antigravity session metadata and transcript to determine
    the actual resolved model rather than guessing or defaulting to a hardcoded string.
    """
    # 1. If hook payload explicitly provides a resolved model (not auto/none/unknown)
    if hook_model and hook_model.lower() not in ["auto", "none", "unknown", ""]:
        return hook_model

    # 2. Check Antigravity's SQLite conversation database
    db_path = CONV_DIR / f"{session_id}.db"
    if db_path.exists():
        try:
            import sqlite3
            conn = sqlite3.connect(str(db_path))
            cur = conn.cursor()
            cur.execute("SELECT data FROM gen_metadata ORDER BY idx DESC LIMIT 1;")
            row = cur.fetchone()
            if row:
                data = row[0]
                # Protobuf tag \xe2\x01 (Field 28) stores the exact model ID
                idx = data.find(b"\xe2\x01")
                raw_id = None
                if idx != -1 and idx + 2 < len(data):
                    length = data[idx + 2]
                    raw_id = data[idx + 3 : idx + 3 + length].decode("utf-8", errors="ignore")

                # Check for human-readable display names stored in gen_metadata
                display_matches = re.findall(rb"(?:Gemini|Claude|GPT) [0-9a-zA-Z. ()-]+", data)
                for dm in display_matches:
                    ds = dm.decode("utf-8", errors="ignore").strip()
                    if "(" in ds and ")" in ds and len(ds) < 50:
                        return ds

                if raw_id:
                    return raw_id
        except Exception:
            pass

    # 3. Check transcript_full.jsonl for explicit model selection events
    if transcript_path:
        tp = Path(transcript_path)
        full_tp = tp.parent / "transcript_full.jsonl"
        candidate_path = full_tp if full_tp.exists() else tp
        if candidate_path.exists():
            try:
                with open(candidate_path, "r", encoding="utf-8") as f:
                    for line in f:
                        if "USER_SETTINGS_CHANGE" in line and "Model Selection" in line:
                            # Match model selection with dots and parentheses
                            m = re.search(r"Model Selection from \S+ to\s+([^<\n\r]+?)(?:\.\s|\.\n|\.$)", line)
                            if not m:
                                m = re.search(r"Model Selection from \S+ to\s+([^<\n\r]+)", line)
                            if m:
                                val = m.group(1).strip()
                                if val.endswith("."):
                                    val = val[:-1].strip()
                                return val
            except Exception:
                pass

    return "Unknown"


def parse_transcript(transcript_path):
    """
    Parses transcript_full.jsonl and extracts completed prompt -> final response exchanges.
    Strictly filters out:
      - chain-of-thought / hidden reasoning
      - tool calls (run_command, view_file, write_to_file, etc.)
      - tool outputs / terminal outputs
      - intermediate model steps
      - diffs / file reads
    Only pairs where a final assistant response (PLANNER_RESPONSE with tool_calls=[]) has been produced.
    """
    exchanges = []
    current_prompt = None
    current_prompt_time = None
    final_response = None
    final_response_time = None

    with open(transcript_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                step = json.loads(line)
            except Exception:
                continue

            step_type = step.get("type")
            source = step.get("source")
            content = step.get("content", "")
            created_at = step.get("created_at", "")
            tool_calls = step.get("tool_calls", [])

            if step_type == "USER_INPUT" and source == "USER_EXPLICIT":
                # Finalize previous turn if a prompt and final response exist
                if current_prompt and final_response:
                    exchanges.append({
                        "prompt": current_prompt,
                        "prompt_time": current_prompt_time,
                        "response": final_response,
                        "response_time": final_response_time
                    })

                current_prompt = extract_prompt_text(content)
                current_prompt_time = created_at
                final_response = None
                final_response_time = None

            elif step_type == "PLANNER_RESPONSE" and source == "MODEL":
                # Only a PLANNER_RESPONSE with no tool calls and non-empty content represents the final response
                if content and len(tool_calls) == 0:
                    final_response = content
                    final_response_time = created_at

    # Append last turn if complete
    if current_prompt and final_response:
        exchanges.append({
            "prompt": current_prompt,
            "prompt_time": current_prompt_time,
            "response": final_response,
            "response_time": final_response_time
        })

    return exchanges


def format_timestamp_filename(ts_str):
    """Convert ISO UTC timestamp 2026-09-30T13:46:52Z to 2026-09-30_13-46-52."""
    try:
        ts_clean = ts_str.replace("Z", "").replace("+00:00", "")
        dt = datetime.fromisoformat(ts_clean)
        return dt.strftime("%Y-%m-%d_%H-%M-%S")
    except Exception:
        return datetime.now(timezone.utc).strftime("%Y-%m-%d_%H-%M-%S")


def format_date_str(ts_str):
    """Convert ISO UTC timestamp to YYYY-MM-DD."""
    try:
        ts_clean = ts_str.replace("Z", "").replace("+00:00", "")
        dt = datetime.fromisoformat(ts_clean)
        return dt.strftime("%Y-%m-%d")
    except Exception:
        return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def process_session(session_id, transcript_path, raw_model_name=None):
    """Processes a single session and writes its markdown log."""
    transcript_file = None
    if transcript_path:
        tp = Path(transcript_path)
        full_tp = tp.parent / "transcript_full.jsonl"
        if full_tp.exists():
            transcript_file = full_tp
        elif tp.exists():
            transcript_file = tp

    if not transcript_file or not transcript_file.exists():
        expected_full = BRAIN_BASE / session_id / ".system_generated" / "logs" / "transcript_full.jsonl"
        expected_compact = BRAIN_BASE / session_id / ".system_generated" / "logs" / "transcript.jsonl"
        if expected_full.exists():
            transcript_file = expected_full
        elif expected_compact.exists():
            transcript_file = expected_compact

    if not transcript_file or not transcript_file.exists():
        return False

    # Dynamically resolve actual model from metadata/transcript
    model_name = resolve_actual_model_name(session_id, transcript_file, raw_model_name)

    exchanges = parse_transcript(transcript_file)
    if not exchanges:
        return False

    first_prompt_time = exchanges[0]["prompt_time"] or datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    last_prompt_time = exchanges[-1]["prompt_time"] or first_prompt_time
    session_date = format_date_str(first_prompt_time)
    time_prefix = format_timestamp_filename(first_prompt_time)

    LOG_DIR.mkdir(parents=True, exist_ok=True)
    log_filename = f"{time_prefix}_{session_id}.md"
    log_file_path = LOG_DIR / log_filename

    # Reuse existing file if already named with a timestamp
    existing_files = list(LOG_DIR.glob(f"*_{session_id}.md"))
    if existing_files:
        log_file_path = existing_files[0]

    lines = []
    lines.append("---")
    lines.append(f"session_id: {session_id}")
    lines.append(f"date: {session_date}")
    lines.append(f"author: {AUTHOR}")
    lines.append(f"model: {model_name}")
    lines.append(f"tool: {TOOL_NAME}")
    lines.append(f"project: {PROJECT}")
    lines.append(f"total_exchanges: {len(exchanges)}")
    lines.append(f"first_prompt_time: {first_prompt_time}")
    lines.append(f"last_prompt_time: {last_prompt_time}")
    lines.append("---")
    lines.append("")
    lines.append(f"# Session Log - {session_date}")
    lines.append("")
    lines.append(f"Session: `{session_id}` | Project: `{PROJECT}` | Author: `{AUTHOR}`")
    lines.append("")
    lines.append("---")
    lines.append("")

    for i, ex in enumerate(exchanges, start=1):
        lines.append(f"[LOG_ENTRY type=PROMPT num={i} session={session_id}]")
        lines.append(f"timestamp: {ex['prompt_time']}")
        lines.append(f"model: {model_name}")
        lines.append("")
        lines.append(ex["prompt"])
        lines.append("")
        lines.append("")
        lines.append(f"[LOG_ENTRY type=RESPONSE num={i} session={session_id}]")
        lines.append(f"timestamp: {ex['response_time']}")
        lines.append(f"model: {model_name}")
        lines.append("")
        lines.append(ex["response"])
        lines.append("")
        lines.append("")

    content_to_write = "\n".join(lines)
    with open(log_file_path, "w", encoding="utf-8") as f:
        f.write(content_to_write)
    return True


def capture():
    parser = argparse.ArgumentParser()
    parser.add_argument("--session", help="Session ID to capture")
    parser.add_argument("--transcript", help="Transcript path")
    parser.add_argument("--model", help="Model name")
    args, _ = parser.parse_known_args()

    if args.session:
        process_session(args.session, args.transcript, args.model)
        print("{}")
        return

    # 1. Read PostInvocation stdin payload
    stdin_data = read_stdin_safe()
    hook_payload = {}
    if stdin_data:
        try:
            hook_payload = json.loads(stdin_data)
        except Exception:
            pass

    session_id = hook_payload.get("conversationId") or os.environ.get("ANTIGRAVITY_CONVERSATION_ID")
    transcript_path = hook_payload.get("transcriptPath")
    model_name = hook_payload.get("modelName")

    if not session_id or not transcript_path:
        # Fallback to latest active session directory
        if BRAIN_BASE.exists():
            sessions = []
            for item in BRAIN_BASE.iterdir():
                if item.is_dir() and len(item.name) >= 30:
                    t_full = item / ".system_generated" / "logs" / "transcript_full.jsonl"
                    if t_full.exists():
                        sessions.append((t_full.stat().st_mtime, item.name, t_full))
            if sessions:
                sessions.sort(reverse=True, key=lambda x: x[0])
                if not session_id:
                    session_id = sessions[0][1]
                if not transcript_path:
                    transcript_path = str(sessions[0][2])

    if session_id:
        process_session(session_id, transcript_path, model_name)

    # PostInvocation hook contract: must return a valid JSON object
    print("{}")


if __name__ == "__main__":
    capture()
