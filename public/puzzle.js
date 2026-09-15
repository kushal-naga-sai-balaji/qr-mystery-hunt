let puzzleData = null;
let stageId = 1;
let portalId = 'a';

document.addEventListener('DOMContentLoaded', async () => {
  const parts = window.location.pathname.split('/').filter(Boolean);
  // /stage/:stageId/:portalId
  stageId = parseInt(parts[1] || '1', 10);
  portalId = (parts[2] || 'a').toLowerCase();

  document.getElementById('btnBackToGateway').href = `/stage/${stageId}`;

  await fetchPuzzleInfo();
  setupHintButton();
});

async function fetchPuzzleInfo() {
  try {
    const res = await fetch(`/api/puzzle/${stageId}/${portalId}`);
    if (!res.ok) throw new Error('Puzzle not found');
    puzzleData = await res.json();

    document.getElementById('lblStageBadge').textContent = `STAGE 0${puzzleData.stageId}`;
    document.getElementById('lblPortalBadge').textContent = `PORTAL ${puzzleData.portalId.toUpperCase()}`;
    document.getElementById('puzzleHeading').textContent = puzzleData.portalTitle;
    document.getElementById('puzzleSubtitle').textContent = puzzleData.portalSubtitle;
    document.getElementById('puzzleDescription').textContent = puzzleData.portalDescription;

    const hintText = puzzleData.puzzleData.hint || 'Examine the symbols and patterns carefully to discover the answer.';
    document.getElementById('hintText').innerHTML = `<strong>Field Intelligence Hint:</strong> ${hintText}`;

    renderPuzzleWorkspace();
    await updateAttemptsDisplay();
  } catch (err) {
    document.getElementById('puzzleHeading').textContent = 'Error Loading Puzzle Chamber';
    document.getElementById('puzzleDescription').textContent = err.message;
  }
}

function setupHintButton() {
  const btn = document.getElementById('btnHintToggle');
  const banner = document.getElementById('hintBanner');
  btn.addEventListener('click', () => {
    const isShown = banner.classList.contains('show');
    if (isShown) {
      banner.classList.remove('show');
      btn.textContent = '💡 Show Field Hint';
    } else {
      banner.classList.add('show');
      btn.textContent = '💡 Hide Field Hint';
      window.soundFx.playClick();
    }
  });
}

function renderPuzzleWorkspace() {
  const container = document.getElementById('puzzleWorkspace');
  container.innerHTML = '';

  const type = puzzleData.puzzleType;

  if (type === 'riddle') {
    renderRiddlePuzzle(container);
  } else if (type === 'caesar') {
    renderCaesarPuzzle(container);
  } else if (type === 'matrix') {
    renderMatrixPuzzle(container);
  } else if (type === 'runes') {
    renderRunesPuzzle(container);
  } else if (type === 'waveform') {
    renderWaveformPuzzle(container);
  } else if (type === 'cryptogram') {
    renderCryptogramPuzzle(container);
  }
}

// 1. Decoy Riddle Puzzle Renderer
function renderRiddlePuzzle(container) {
  const data = puzzleData.puzzleData;
  const div = document.createElement('div');
  div.innerHTML = `
    <div style="background: rgba(30, 41, 59, 0.6); padding: 1.5rem; border-radius: 0.75rem; border: 1px solid var(--border-color); margin: 1.5rem 0;">
      <h4 style="color: var(--accent-cyan); margin-bottom: 1rem;">${data.question}</h4>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
        ${data.options.map(opt => `
          <button class="btn btn-secondary opt-btn" data-option="${opt}" style="text-align: left; padding: 1rem;">
            ${opt}
          </button>
        `).join('')}
      </div>
    </div>
  `;

  container.appendChild(div);

  div.querySelectorAll('.opt-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const selected = btn.dataset.option;
      window.soundFx.playClick();
      await submitAnswer(selected);
    });
  });
}

// 2. Caesar Cipher Puzzle (Stage 1 - True)
function renderCaesarPuzzle(container) {
  const data = puzzleData.puzzleData;
  const div = document.createElement('div');
  div.innerHTML = `
    <div style="text-align: center; margin: 2rem 0;">
      <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">INTERCEPTED CIPHERTEXT (ROT+3):</div>
      <div style="font-family: var(--font-mono); font-size: 2.25rem; letter-spacing: 0.25em; color: var(--accent-cyan); font-weight: bold; background: rgba(0,0,0,0.4); padding: 0.75rem; border-radius: 0.5rem; display: inline-block;">
        ${data.ciphertext}
      </div>
    </div>

    <!-- Interactive Decoder Wheel / Slider -->
    <div style="background: rgba(30, 41, 59, 0.5); padding: 1.5rem; border-radius: 0.75rem; border: 1px solid var(--border-color); margin: 1.5rem 0;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
        <span>Cipher Shift Alignment: <strong id="lblShiftVal" style="color: var(--accent-cyan);">0</strong></span>
        <span style="font-size: 0.8rem; color: var(--text-muted);">Adjust slider to test shift angles</span>
      </div>
      <input type="range" id="caesarSlider" min="0" max="25" value="0" style="width: 100%; margin-bottom: 1rem; cursor: pointer;">
      
      <div style="font-family: var(--font-mono); font-size: 0.85rem; overflow-x: auto; white-space: nowrap; padding: 0.5rem; background: rgba(0,0,0,0.5); border-radius: 0.35rem;">
        <div>PLAIN:&nbsp;&nbsp;A B C D E F G H I J K L M N O P Q R S T U V W X Y Z</div>
        <div id="caesarShiftPreview" style="color: var(--accent-cyan); margin-top: 0.25rem;">
          SHIFT:&nbsp;&nbsp;A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
        </div>
      </div>
    </div>

    <div style="display: flex; gap: 1rem; margin-top: 1.5rem; flex-wrap: wrap;">
      <input type="text" id="txtCaesarAns" placeholder="Enter Decrypted Word" style="flex: 1; background: #1e293b; color: #fff; border: 1px solid var(--border-color); padding: 0.75rem 1rem; border-radius: 0.5rem; font-family: var(--font-mono); text-transform: uppercase;">
      <button id="btnSubmitCaesar" class="btn btn-emerald">Submit Keystone Solution</button>
    </div>
  `;

  container.appendChild(div);

  const slider = document.getElementById('caesarSlider');
  const lblShift = document.getElementById('lblShiftVal');
  const preview = document.getElementById('caesarShiftPreview');
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  slider.addEventListener('input', () => {
    const shift = parseInt(slider.value, 10);
    lblShift.textContent = shift;
    const shifted = alphabet.slice(shift) + alphabet.slice(0, shift);
    preview.innerHTML = `SHIFT:&nbsp;&nbsp;${shifted.split('').join(' ')}`;
    window.soundFx.playClick();
  });

  document.getElementById('btnSubmitCaesar').addEventListener('click', async () => {
    const val = document.getElementById('txtCaesarAns').value.trim();
    if (!val) return alert('Please enter decrypted word');
    await submitAnswer(val);
  });
}

// 3. Binary Matrix Circuit Puzzle (Stage 2 - True)
function renderMatrixPuzzle(container) {
  const data = puzzleData.puzzleData;
  const size = data.gridSize;
  const gridState = Array(size).fill(0).map(() => Array(size).fill(0));

  const div = document.createElement('div');
  div.innerHTML = `
    <div style="text-align: center; margin-bottom: 1.5rem;">
      <p style="font-size: 0.9rem; color: var(--text-muted);">
        Activate cells to balance row and column target energy parity.
      </p>
    </div>

    <div style="display: flex; justify-content: center; align-items: center; gap: 1rem; overflow-x: auto; padding: 1rem;">
      <!-- Main Grid with targets -->
      <div>
        <!-- Column Targets -->
        <div style="display: flex; gap: 10px; margin-left: 50px; margin-bottom: 8px;">
          ${data.colTargets.map((colTgt, c) => `
            <div id="colTgt_${c}" style="width: 60px; text-align: center; font-family: var(--font-mono); font-weight: bold; color: var(--text-muted); font-size: 0.85rem;">
              C${c+1}: 0/${colTgt}
            </div>
          `).join('')}
        </div>

        <!-- Rows -->
        ${Array(size).fill(0).map((_, r) => `
          <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 10px;">
            <div id="rowTgt_${r}" style="width: 40px; text-align: right; font-family: var(--font-mono); font-weight: bold; color: var(--text-muted); font-size: 0.85rem;">
              0/${data.rowTargets[r]}
            </div>
            ${Array(size).fill(0).map((__, c) => `
              <div class="matrix-cell" id="cell_${r}_${c}" data-r="${r}" data-c="${c}">0</div>
            `).join('')}
          </div>
        `).join('')}
      </div>
    </div>

    <div style="text-align: center; margin-top: 1.5rem;">
      <button id="btnPowerMatrix" class="btn btn-emerald" style="padding: 0.75rem 2rem;">⚡ Connect Power Grid</button>
    </div>
  `;

  container.appendChild(div);

  function updateMatrixUi() {
    let allMatched = true;

    // Check rows
    for (let r = 0; r < size; r++) {
      const sum = gridState[r].reduce((a, b) => a + b, 0);
      const tgt = data.rowTargets[r];
      const elem = document.getElementById(`rowTgt_${r}`);
      elem.textContent = `${sum}/${tgt}`;
      elem.style.color = (sum === tgt) ? 'var(--accent-emerald)' : 'var(--text-muted)';
      if (sum !== tgt) allMatched = false;
    }

    // Check cols
    for (let c = 0; c < size; c++) {
      let sum = 0;
      for (let r = 0; r < size; r++) sum += gridState[r][c];
      const tgt = data.colTargets[c];
      const elem = document.getElementById(`colTgt_${c}`);
      elem.textContent = `C${c+1}: ${sum}/${tgt}`;
      elem.style.color = (sum === tgt) ? 'var(--accent-emerald)' : 'var(--text-muted)';
      if (sum !== tgt) allMatched = false;
    }

    return allMatched;
  }

  div.querySelectorAll('.matrix-cell').forEach(cell => {
    cell.addEventListener('click', () => {
      const r = parseInt(cell.dataset.r, 10);
      const c = parseInt(cell.dataset.c, 10);
      gridState[r][c] = gridState[r][c] === 1 ? 0 : 1;
      cell.textContent = gridState[r][c];
      cell.classList.toggle('active', gridState[r][c] === 1);
      window.soundFx.playClick();
      updateMatrixUi();
    });
  });

  document.getElementById('btnPowerMatrix').addEventListener('click', async () => {
    const isSolved = updateMatrixUi();
    if (isSolved) {
      await submitAnswer(null, true);
    } else {
      window.soundFx.playGlitch();
      const feedback = document.getElementById('puzzleFeedback');
      feedback.className = 'alert-box alert-error show';
      feedback.textContent = '❌ Power overload: Row or Column target counts are not fully satisfied. Keep balancing!';
    }
  });

  updateMatrixUi();
}

// 4. Alchemical Runes Lock Puzzle (Stage 3 - True)
function renderRunesPuzzle(container) {
  const data = puzzleData.puzzleData;
  const icons = {
    "FIRE": "🔥",
    "WATER": "💧",
    "EARTH": "🌍",
    "AIR": "💨",
    "AETHER": "⚛️"
  };

  // Scramble order initially
  let currentOrder = ["EARTH", "AIR", "FIRE", "AETHER", "WATER"];

  const div = document.createElement('div');
  div.innerHTML = `
    <div style="text-align: center; margin-bottom: 1.5rem;">
      <p style="font-size: 0.95rem; color: var(--text-muted);">
        Required Cosmological Order: 
        <strong style="color: var(--accent-emerald);">FIRE 🔥 &rarr; WATER 💧 &rarr; EARTH 🌍 &rarr; AIR 💨 &rarr; AETHER ⚛️</strong>
      </p>
    </div>

    <div class="runes-list" id="runesContainer">
      <!-- Injected by updateRunes() -->
    </div>

    <div style="text-align: center; margin-top: 1.5rem;">
      <button id="btnVerifyRunes" class="btn btn-emerald" style="padding: 0.75rem 2rem;">🔓 Unlock Alchemical Keystone</button>
    </div>
  `;

  container.appendChild(div);

  function updateRunesUi() {
    const rContainer = document.getElementById('runesContainer');
    rContainer.innerHTML = '';

    currentOrder.forEach((element, idx) => {
      const item = document.createElement('div');
      item.className = 'rune-item';
      item.innerHTML = `
        <span class="rune-icon">${icons[element]}</span>
        <span style="font-family: var(--font-mono); font-weight: bold; font-size: 0.9rem;">${element}</span>
        <div style="display: flex; gap: 0.25rem; margin-top: 0.5rem;">
          <button class="btn btn-secondary btn-sm btn-left" ${idx === 0 ? 'disabled' : ''}>◀</button>
          <button class="btn btn-secondary btn-sm btn-right" ${idx === currentOrder.length - 1 ? 'disabled' : ''}>▶</button>
        </div>
      `;

      item.querySelector('.btn-left').addEventListener('click', () => {
        if (idx > 0) {
          [currentOrder[idx - 1], currentOrder[idx]] = [currentOrder[idx], currentOrder[idx - 1]];
          window.soundFx.playClick();
          updateRunesUi();
        }
      });

      item.querySelector('.btn-right').addEventListener('click', () => {
        if (idx < currentOrder.length - 1) {
          [currentOrder[idx + 1], currentOrder[idx]] = [currentOrder[idx], currentOrder[idx + 1]];
          window.soundFx.playClick();
          updateRunesUi();
        }
      });

      rContainer.appendChild(item);
    });
  }

  document.getElementById('btnVerifyRunes').addEventListener('click', async () => {
    const isCorrect = JSON.stringify(currentOrder) === JSON.stringify(data.solutionOrder);
    if (isCorrect) {
      await submitAnswer(null, true);
    } else {
      window.soundFx.playGlitch();
      const feedback = document.getElementById('puzzleFeedback');
      feedback.className = 'alert-box alert-error show';
      feedback.textContent = '❌ Rune seal rejects this order. Consult the cosmological progression: Fire > Water > Earth > Air > Aether!';
    }
  });

  updateRunesUi();
}

// 5. Frequency Waveform Tuner (Stage 4 - True)
function renderWaveformPuzzle(container) {
  const data = puzzleData.puzzleData;
  const targetF = data.targetFreq;
  const targetA = data.targetAmp;
  const targetP = data.targetPhase;

  let currentF = 2;
  let currentA = 50;
  let currentP = 0;
  let animId = null;

  const div = document.createElement('div');
  div.innerHTML = `
    <div class="waveform-box">
      <canvas id="waveCanvas" width="800" height="220"></canvas>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
      <span style="font-size: 0.9rem; color: var(--text-muted);">Legend: <span style="color: #10b981; font-weight: bold;">— Target Signal</span> &nbsp;|&nbsp; <span style="color: #38bdf8; font-weight: bold;">— Tuner Carrier</span></span>
      <div style="font-family: var(--font-mono); font-size: 0.95rem;">
        Resonance Harmony: <strong id="lblResonance" style="color: var(--accent-amber);">0%</strong>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; background: rgba(30, 41, 59, 0.5); padding: 1.25rem; border-radius: 0.75rem; border: 1px solid var(--border-color);">
      <div>
        <label style="font-size: 0.85rem;">Frequency: <span id="lblFreq" style="color: var(--accent-cyan); font-weight: bold;">2 Hz</span></label>
        <input type="range" id="sliderFreq" min="1" max="10" step="1" value="2" style="width: 100%; margin-top: 0.35rem;">
      </div>
      <div>
        <label style="font-size: 0.85rem;">Amplitude: <span id="lblAmp" style="color: var(--accent-cyan); font-weight: bold;">50%</span></label>
        <input type="range" id="sliderAmp" min="20" max="100" step="5" value="50" style="width: 100%; margin-top: 0.35rem;">
      </div>
      <div>
        <label style="font-size: 0.85rem;">Phase Angle: <span id="lblPhase" style="color: var(--accent-cyan); font-weight: bold;">0°</span></label>
        <input type="range" id="sliderPhase" min="0" max="360" step="15" value="0" style="width: 100%; margin-top: 0.35rem;">
      </div>
    </div>

    <div style="text-align: center; margin-top: 1.5rem;">
      <button id="btnLockWave" class="btn btn-emerald" style="padding: 0.75rem 2rem;">📡 Lock Resonance Harmonic</button>
    </div>
  `;

  container.appendChild(div);

  const canvas = document.getElementById('waveCanvas');
  const ctx = canvas.getContext('2d');
  let t = 0;

  function draw() {
    t += 0.04;
    ctx.fillStyle = '#0a0e17';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // Target Wave (Green)
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x < canvas.width; x++) {
      const y = (canvas.height / 2) + Math.sin((x / canvas.width) * targetF * Math.PI * 2 + (targetP * Math.PI / 180) + t) * (targetA * 0.8);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Player Wave (Cyan)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = 0; x < canvas.width; x++) {
      const y = (canvas.height / 2) + Math.sin((x / canvas.width) * currentF * Math.PI * 2 + (currentP * Math.PI / 180) + t) * (currentA * 0.8);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    animId = requestAnimationFrame(draw);
  }

  draw();

  function calcResonance() {
    const diffF = Math.abs(currentF - targetF);
    const diffA = Math.abs(currentA - targetA);
    const diffP = Math.abs(currentP - targetP);

    let score = 100 - (diffF * 25 + diffA * 0.7 + (diffP / 360) * 40);
    score = Math.max(0, Math.min(100, Math.round(score)));

    const lbl = document.getElementById('lblResonance');
    lbl.textContent = `${score}%`;
    lbl.style.color = score >= 98 ? 'var(--accent-emerald)' : score >= 70 ? 'var(--accent-amber)' : 'var(--accent-rose)';
    return score;
  }

  document.getElementById('sliderFreq').addEventListener('input', (e) => {
    currentF = parseInt(e.target.value, 10);
    document.getElementById('lblFreq').textContent = `${currentF} Hz`;
    calcResonance();
  });

  document.getElementById('sliderAmp').addEventListener('input', (e) => {
    currentA = parseInt(e.target.value, 10);
    document.getElementById('lblAmp').textContent = `${currentA}%`;
    calcResonance();
  });

  document.getElementById('sliderPhase').addEventListener('input', (e) => {
    currentP = parseInt(e.target.value, 10);
    document.getElementById('lblPhase').textContent = `${currentP}°`;
    calcResonance();
  });

  calcResonance();

  document.getElementById('btnLockWave').addEventListener('click', async () => {
    const score = calcResonance();
    if (score >= 98) {
      await submitAnswer(null, true);
    } else {
      window.soundFx.playGlitch();
      const feedback = document.getElementById('puzzleFeedback');
      feedback.className = 'alert-box alert-error show';
      feedback.textContent = `❌ Phase mismatch! Resonance is only ${score}%. Match Frequency (4Hz), Amplitude (75%), and Phase (180°) exactly.`;
    }
  });
}

// 6. Master Enigma Cryptogram (Stage 5 - True)
function renderCryptogramPuzzle(container) {
  const data = puzzleData.puzzleData;
  const div = document.createElement('div');
  div.innerHTML = `
    <div style="text-align: center; margin: 2rem 0;">
      <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">CIPHERTEXT:</div>
      <div style="font-family: var(--font-mono); font-size: 2.25rem; letter-spacing: 0.2em; color: var(--accent-cyan); font-weight: bold; background: rgba(0,0,0,0.4); padding: 0.75rem 1.5rem; border-radius: 0.5rem; display: inline-block;">
        ${data.ciphertext}
      </div>
      <div style="margin-top: 0.75rem; font-size: 0.9rem; color: var(--text-muted);">
        Encryption Key: <strong style="color: var(--accent-amber); font-family: var(--font-mono);">${data.keyword}</strong>
      </div>
    </div>

    <div style="background: rgba(30, 41, 59, 0.5); padding: 1.25rem; border-radius: 0.75rem; border: 1px solid var(--border-color); margin-bottom: 1.5rem;">
      <h4 style="color: var(--accent-cyan); margin-bottom: 0.5rem;">Vigenère Table Quick Cipher Reference</h4>
      <p style="font-size: 0.85rem; color: var(--text-muted);">
        Letter Shift Rule: <code>Decrypted = (Cipher - Key) mod 26</code><br>
        Word 1: Cipher <code>QASVE</code> with Key <code>CHRON</code> &rarr; <strong>O M E G A</strong><br>
        Word 2: Cipher <code>XOFFVWE</code> with Key <code>OSCHRON</code> &rarr; <strong>S A N C T U M</strong>
      </p>
    </div>

    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
      <input type="text" id="txtCryptoAns" placeholder="Enter Master Vault Passphrase (e.g. OMEGA SANCTUM)" style="flex: 1; background: #1e293b; color: #fff; border: 1px solid var(--border-color); padding: 0.75rem 1rem; border-radius: 0.5rem; font-family: var(--font-mono); text-transform: uppercase;">
      <button id="btnSubmitCrypto" class="btn btn-emerald">🔓 Unlock Master Sanctum</button>
    </div>
  `;

  container.appendChild(div);

  document.getElementById('btnSubmitCrypto').addEventListener('click', async () => {
    const val = document.getElementById('txtCryptoAns').value.trim();
    if (!val) return alert('Please enter passphrase');
    await submitAnswer(val);
  });
}

// Universal Submit Handler
async function submitAnswer(answerVal, isSolvedBool = false) {
  const feedback = document.getElementById('puzzleFeedback');
  feedback.className = 'alert-box';
  feedback.style.display = 'none';

  try {
    const res = await fetch('/api/verify-puzzle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stageId,
        portalId,
        answer: answerVal,
        solved: isSolvedBool,
        teamName: localStorage.getItem('chronos_team_name') || 'Anonymous Operative'
      })
    });

    const data = await res.json();

    if (data.attemptsLeft !== undefined) {
      applyAttemptsBadge(data.attemptsLeft, data.locked);
    }

    if (data.locked) {
      lockPuzzleUi(data.message);
      return;
    }

    if (data.isDecoy) {
      // It's a DECOY portal
      window.soundFx.playGlitch();
      feedback.className = 'alert-box alert-warning show';
      feedback.innerHTML = `
        <h4 style="color: var(--accent-amber); margin-bottom: 0.5rem;">⚠️ DECOY SUBROUTINE TRIGGERED!</h4>
        <p>${data.message}</p>
        <div style="margin-top: 1rem;">
          <a href="/stage/${stageId}" class="btn btn-secondary btn-sm">
            ← Return to Stage ${stageId} Portals & Try Another Link
          </a>
        </div>
      `;
    } else if (data.success) {
      // AUTHENTIC PORTAL SOLVED!
      window.soundFx.playSuccess();
      feedback.className = 'alert-box alert-success show';
      feedback.innerHTML = `<strong>${data.message}</strong>`;

      // Save passkey in localStorage
      const completed = JSON.parse(localStorage.getItem('chronos_completed_stages') || '[]');
      if (!completed.includes(stageId)) {
        completed.push(stageId);
        localStorage.setItem('chronos_completed_stages', JSON.stringify(completed));
      }

      // Display next action box
      const actionBox = document.getElementById('nextStageAction');
      actionBox.style.display = 'block';
      document.getElementById('passkeyDisplay').textContent = data.rewardPasskey;
      document.getElementById('nextClueDisplay').textContent = data.nextStageClue;

      document.getElementById('btnCopyPasskey').onclick = () => {
        navigator.clipboard.writeText(data.rewardPasskey);
        alert('Passkey copied to clipboard: ' + data.rewardPasskey);
      };
    } else {
      // Incorrect answer
      window.soundFx.playGlitch();
      feedback.className = 'alert-box alert-error show';
      feedback.textContent = `${data.message}`;
    }
  } catch (err) {
    feedback.className = 'alert-box alert-error show';
    feedback.textContent = 'Network or verification error: ' + err.message;
  }
}

function getTeam() {
  return localStorage.getItem('chronos_team_name') || 'Anonymous Operative';
}

function applyAttemptsBadge(attemptsLeft, isLocked) {
  const badge = document.getElementById('lblAttemptsBadge');
  if (!badge) return;

  if (isLocked || attemptsLeft <= 0) {
    badge.textContent = '🚨 LOCKED (0/2 ATTEMPTS)';
    badge.style.borderColor = 'var(--accent-rose)';
    badge.style.color = 'var(--accent-rose)';
  } else if (attemptsLeft === 1) {
    badge.textContent = '⚠️ ATTEMPTS: 1/2 (FINAL CHANCE)';
    badge.style.borderColor = 'var(--accent-amber)';
    badge.style.color = 'var(--accent-amber)';
  } else {
    badge.textContent = '🛡️ ATTEMPTS: 2/2';
    badge.style.borderColor = 'var(--accent-cyan)';
    badge.style.color = 'var(--accent-cyan)';
  }
}

async function updateAttemptsDisplay() {
  try {
    const res = await fetch(`/api/attempts/${stageId}/${portalId}?teamName=${encodeURIComponent(getTeam())}`);
    const data = await res.json();
    applyAttemptsBadge(data.attemptsLeft, data.isLocked);
    if (data.isLocked) {
      lockPuzzleUi('🚨 MAXIMUM ATTEMPTS EXCEEDED (2/2)! This portal has entered security lockdown.');
    }
  } catch (e) {}
}

function lockPuzzleUi(msg) {
  const workspace = document.getElementById('puzzleWorkspace');
  if (workspace) {
    workspace.querySelectorAll('input, button').forEach(el => {
      el.disabled = true;
      el.style.opacity = '0.5';
      el.style.cursor = 'not-allowed';
    });
  }
  const feedback = document.getElementById('puzzleFeedback');
  if (feedback) {
    feedback.className = 'alert-box alert-error show';
    feedback.innerHTML = `
      <strong>${msg}</strong>
      <div style="margin-top: 1rem;">
        <a href="/stage/${stageId}" class="btn btn-secondary btn-sm">
          ← Return to Checkpoint Portals
        </a>
      </div>
    `;
  }
}
