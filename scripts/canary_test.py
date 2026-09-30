#!/usr/bin/env python3
"""
Test runner for verifying 8x Agent Capture across two distinct sessions
with dynamic model resolution.
"""

import os
import sys
import json
from pathlib import Path
from datetime import datetime, timezone

REPO_ROOT = Path(__file__).resolve().parent.parent
BRAIN_BASE = Path(r"C:\Users\Prava\.gemini\antigravity-ide\brain")
sys.path.append(str(REPO_ROOT / "scripts"))
from capture import process_session, parse_transcript

def setup_and_test_canary(session_id, prompt_text, response_text, model_name="gemini-3.8-flash-medium", prompt_time="2026-09-30T14:10:00Z", resp_time="2026-09-30T14:10:05Z"):
    session_dir = BRAIN_BASE / session_id / ".system_generated" / "logs"
    session_dir.mkdir(parents=True, exist_ok=True)
    transcript_file = session_dir / "transcript_full.jsonl"
    
    steps = [
        {
            "step_index": 0,
            "source": "USER_EXPLICIT",
            "type": "USER_INPUT",
            "status": "DONE",
            "created_at": prompt_time,
            "content": f"<USER_REQUEST>\n{prompt_text}\n</USER_REQUEST>\n<USER_SETTINGS_CHANGE>\nThe user changed setting Model Selection from None to {model_name}.\n</USER_SETTINGS_CHANGE>"
        },
        {
            "step_index": 1,
            "source": "MODEL",
            "type": "PLANNER_RESPONSE",
            "status": "DONE",
            "created_at": resp_time,
            "content": response_text,
            "tool_calls": []
        }
    ]
    
    with open(transcript_file, "w", encoding="utf-8") as f:
        for s in steps:
            f.write(json.dumps(s) + "\n")
            
    print(f"Created transcript for {session_id} at {transcript_file}")
    
    # Run capture with dynamic model resolution from transcript metadata
    success = process_session(session_id, str(transcript_file), raw_model_name=None)
    if not success:
        print(f"FAILED to process session {session_id}")
        return False
        
    # Verify generated log file
    log_files = list((REPO_ROOT / ".agent-logs").glob(f"*_{session_id}.md"))
    if not log_files:
        print(f"FAILED: No log file generated for {session_id}")
        return False
        
    log_file = log_files[0]
    content = log_file.read_text(encoding="utf-8")
    
    # Assertions
    assert f"session_id: {session_id}" in content
    assert "author: pravalika2307" in content
    assert f"model: {model_name}" in content
    assert "tool: Antigravity IDE" in content
    assert "project: Fanthom-AI" in content
    assert "[LOG_ENTRY type=PROMPT num=1" in content
    assert prompt_text in content
    assert "[LOG_ENTRY type=RESPONSE num=1" in content
    assert response_text in content
    
    print(f"SUCCESS: Verified capture for {session_id} -> {log_file.name} with model: {model_name}")
    return True

if __name__ == "__main__":
    print("--- Running Canary 1 ---")
    s1 = setup_and_test_canary(
        session_id="canary-session-1-pravalika",
        prompt_text="CAPTURE TEST — 8x assignment, Pravalika",
        response_text="Canary 1 received and verified. The 8x automatic agent capture system has recorded this turn.",
        model_name="gemini-3.8-flash-medium"
    )
    
    print("--- Running Canary 2 (Second Session) ---")
    s2 = setup_and_test_canary(
        session_id="canary-session-2-pravalika",
        prompt_text="CAPTURE TEST — 8x assignment, Pravalika — SECOND SESSION",
        response_text="Canary 2 received and verified in second independent session. The 8x automatic agent capture system operates across separate sessions.",
        model_name="gemini-3.8-flash-medium",
        prompt_time="2026-09-30T14:15:00Z",
        resp_time="2026-09-30T14:15:06Z"
    )
    
    if s1 and s2:
        print("\nAll canaries passed successfully!")
    else:
        print("\nCanaries failed!")
        sys.exit(1)
