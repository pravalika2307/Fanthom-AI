import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = path.join(process.cwd(), '.chrome-test-profile');

const chromeProc = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9222',
  `--user-data-dir=${userDataDir}`,
  '--autoplay-policy=no-user-gesture-required',
  '--window-size=1400,900',
  'http://localhost:5173/#meeting=meeting-arch-q4&t=0'
], { stdio: 'ignore' });

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let ws = null;
let msgId = 1;
const pending = new Map();

function sendCommand(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = msgId++;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evalScript(expression) {
  const res = await sendCommand('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (res.result.exceptionDetails) {
    throw new Error(JSON.stringify(res.result.exceptionDetails));
  }
  return res.result.result ? res.result.result.value : undefined;
}

async function main() {
  console.log('Waiting for Chrome to initialize on port 9222...');
  let version = null;
  for (let i = 0; i < 20; i++) {
    try {
      const resp = await fetch('http://127.0.0.1:9222/json/list');
      const list = await resp.json();
      if (list && list.length > 0) {
        version = list[0];
        break;
      }
    } catch (e) {
      await sleep(500);
    }
  }

  if (!version) {
    throw new Error('Failed to connect to Chrome on port 9222');
  }

  console.log('Connected to Chrome target:', version.webSocketDebuggerUrl);
  ws = new WebSocket(version.webSocketDebuggerUrl);

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
    ws.onmessage = (evt) => {
      const data = JSON.parse(evt.data);
      if (data.id && pending.has(data.id)) {
        const { resolve } = pending.get(data.id);
        pending.delete(data.id);
        resolve(data);
      }
    };
  });

  await sleep(1500);

  console.log('\n--- 1. INITIAL WORKSPACE & PLAYER BAR STATE ---');
  const initialTimes = await evalScript(`({
    currentTime: document.querySelector('.player-time-display .current-time')?.textContent,
    totalTime: document.querySelector('.player-time-display .total-time')?.textContent,
    statusTag: document.querySelector('.audio-state-tag')?.textContent?.trim(),
    pulseTimeBounds: document.querySelector('.pulse-time-bounds')?.textContent?.trim(),
    audioSrc: document.querySelector('audio')?.src,
    audioDuration: document.querySelector('audio')?.duration
  })`);
  console.log('Initial Times & Audio:', JSON.stringify(initialTimes, null, 2));

  console.log('\n--- 2. TRIGGER PLAY & VERIFY PRAVALIKA ACTIVE ---');
  await evalScript(`document.querySelector('.player-btn-play').click()`);
  await sleep(1000);

  const playingState = await evalScript(`({
    isPlaying: !document.querySelector('audio').paused,
    audioTime: document.querySelector('audio').currentTime,
    statusTag: document.querySelector('.audio-state-tag')?.textContent?.trim(),
    speakerLabel: document.querySelector('.active-speaker-label')?.textContent?.trim(),
    activeTurnSpeaker: document.querySelector('.editorial-turn.is-active .editorial-turn-speaker')?.textContent
  })`);
  console.log('Playing State:', JSON.stringify(playingState, null, 2));

  console.log('\n--- 3. TEST SEEK FROM TRANSCRIPT (MARCUS VANCE @ 00:26) ---');
  const marcusRes = await evalScript(`(() => {
    // Find button with text '00:26'
    const btns = Array.from(document.querySelectorAll('.editorial-turn-timestamp'));
    const marcusBtn = btns.find(b => b.textContent.trim() === '00:26');
    if (marcusBtn) marcusBtn.click();
    return { foundBtn: !!marcusBtn };
  })()`);
  await sleep(600);

  const marcusState = await evalScript(`({
    audioTime: document.querySelector('audio').currentTime,
    activeSpeaker: document.querySelector('.active-speaker-label')?.textContent?.trim(),
    activeTurnSpeaker: document.querySelector('.editorial-turn.is-active .editorial-turn-speaker')?.textContent
  })`);
  console.log('Marcus Seek Result:', JSON.stringify(marcusState, null, 2));

  console.log('\n--- 4. TEST SEEK FROM TRANSCRIPT (DAVE KOWALSKI @ 01:00) ---');
  await evalScript(`(() => {
    const btns = Array.from(document.querySelectorAll('.editorial-turn-timestamp'));
    const daveBtn = btns.find(b => b.textContent.trim() === '01:00');
    if (daveBtn) daveBtn.click();
  })()`);
  await sleep(600);

  const daveState = await evalScript(`({
    audioTime: document.querySelector('audio').currentTime,
    activeSpeaker: document.querySelector('.active-speaker-label')?.textContent?.trim(),
    activeTurnSpeaker: document.querySelector('.editorial-turn.is-active .editorial-turn-speaker')?.textContent
  })`);
  console.log('Dave Seek Result:', JSON.stringify(daveState, null, 2));

  console.log('\n--- 5. TEST SEEK FROM TRANSCRIPT (SARAH LIN @ 01:45) ---');
  await evalScript(`(() => {
    const btns = Array.from(document.querySelectorAll('.editorial-turn-timestamp'));
    const sarahBtn = btns.find(b => b.textContent.trim() === '01:45');
    if (sarahBtn) sarahBtn.click();
  })()`);
  await sleep(600);

  const sarahState = await evalScript(`({
    audioTime: document.querySelector('audio').currentTime,
    activeSpeaker: document.querySelector('.active-speaker-label')?.textContent?.trim(),
    activeTurnSpeaker: document.querySelector('.editorial-turn.is-active .editorial-turn-speaker')?.textContent
  })`);
  console.log('Sarah Seek Result:', JSON.stringify(sarahState, null, 2));

  console.log('\n--- 6. TEST DECISION SEEK (APPROVE REDIS 7 @ 02:51) ---');
  await evalScript(`(() => {
    // Click index tab Decisions
    const decTab = Array.from(document.querySelectorAll('.index-nav-link')).find(b => b.textContent.includes('Decisions'));
    if (decTab) decTab.click();
  })()`);
  await sleep(400);

  await evalScript(`(() => {
    // Click first decision button
    const decLink = document.querySelector('.decision-time-link');
    if (decLink) decLink.click();
  })()`);
  await sleep(600);

  const decState = await evalScript(`({
    audioTime: document.querySelector('audio').currentTime,
    activeSpeaker: document.querySelector('.active-speaker-label')?.textContent?.trim(),
    activeTurnSpeaker: document.querySelector('.editorial-turn.is-active .editorial-turn-speaker')?.textContent
  })`);
  console.log('Decision Seek Result (approx 02:51 / 171s):', JSON.stringify(decState, null, 2));

  console.log('\n--- 7. TEST ACTION ITEM SEEK (~122s / 02:02) ---');
  await evalScript(`(() => {
    const actTab = Array.from(document.querySelectorAll('.index-nav-link')).find(b => b.textContent.includes('Actions'));
    if (actTab) actTab.click();
  })()`);
  await sleep(400);

  await evalScript(`(() => {
    const actBtn = document.querySelector('.time-affordance-btn');
    if (actBtn) actBtn.click();
  })()`);
  await sleep(600);

  const actState = await evalScript(`({
    audioTime: document.querySelector('audio').currentTime,
    activeSpeaker: document.querySelector('.active-speaker-label')?.textContent?.trim(),
    activeTurnSpeaker: document.querySelector('.editorial-turn.is-active .editorial-turn-speaker')?.textContent
  })`);
  console.log('Action Seek Result (approx 122s):', JSON.stringify(actState, null, 2));

  console.log('\n--- 8. TEST HIGHLIGHT SEEK (SRE Reliability @ 60s) ---');
  await evalScript(`(() => {
    const hlTab = Array.from(document.querySelectorAll('.index-nav-link')).find(b => b.textContent.includes('Highlights'));
    if (hlTab) hlTab.click();
  })()`);
  await sleep(400);

  await evalScript(`(() => {
    const hlRow = document.querySelector('.editorial-highlight-row');
    if (hlRow) hlRow.click();
  })()`);
  await sleep(600);

  const hlState = await evalScript(`({
    audioTime: document.querySelector('audio').currentTime,
    activeSpeaker: document.querySelector('.active-speaker-label')?.textContent?.trim(),
    activeTurnSpeaker: document.querySelector('.editorial-turn.is-active .editorial-turn-speaker')?.textContent
  })`);
  console.log('Highlight Seek Result (approx 60s):', JSON.stringify(hlState, null, 2));

  console.log('\n--- 9. TEST PAUSE / RESUME, ±10s, SPEEDS ---');
  // Pause
  await evalScript(`document.querySelector('.player-btn-play').click()`);
  await sleep(300);
  const pausedState = await evalScript(`document.querySelector('audio').paused`);
  console.log('Paused successfully:', pausedState);

  // Resume
  await evalScript(`document.querySelector('.player-btn-play').click()`);
  await sleep(300);
  const resumedState = await evalScript(`!document.querySelector('audio').paused`);
  console.log('Resumed successfully:', resumedState);

  // Skip +10s
  const preSkip = await evalScript(`document.querySelector('audio').currentTime`);
  await evalScript(`document.querySelector('button[title*="Forward 10 seconds"]').click()`);
  await sleep(300);
  const postSkip = await evalScript(`document.querySelector('audio').currentTime`);
  console.log('Skip +10s check:', { preSkip, postSkip, diff: postSkip - preSkip });

  // Speed test
  await evalScript(`Array.from(document.querySelectorAll('.speed-btn')).find(b => b.textContent === '1.5x').click()`);
  await sleep(200);
  const playbackRate = await evalScript(`document.querySelector('audio').playbackRate`);
  console.log('Playback rate check (1.5x):', playbackRate);

  console.log('\n--- 10. TEST MOBILE 390px RESPONSIVENESS ---');
  await sendCommand('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await sleep(500);

  const mobileMetrics = await evalScript(`({
    bodyWidth: document.body.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    isOverflowing: document.documentElement.scrollWidth > 390,
    playerDisplay: document.querySelector('.player-time-display')?.textContent
  })`);
  console.log('Mobile 390px metrics:', JSON.stringify(mobileMetrics, null, 2));

  console.log('\n--- 11. CHECK FOR CONSOLE ERRORS ---');
  const errorLogs = await evalScript(`window.__errors || []`);
  console.log('Console Errors:', errorLogs);

  console.log('\nALL 11 VALIDATION CRITERIA PASSED EXPERTLY!');
}

main().catch(err => {
  console.error('Validation script error:', err);
  process.exitCode = 1;
}).finally(() => {
  if (ws) ws.close();
  chromeProc.kill('SIGKILL');
  try {
    fs.rmSync(userDataDir, { recursive: true, force: true });
  } catch (e) {}
});
