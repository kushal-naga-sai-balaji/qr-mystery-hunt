let gameInfo = null;
let html5QrScanner = null;

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', async () => {
  setupTabs();
  setupScannerModal();
  setupPasskeyValidator();
  await loadGameData();
});

// Tab navigation
function setupTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const target = tab.dataset.tab;
      document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
      if (target === 'checkpoints') document.getElementById('tabCheckpoints').style.display = 'block';
      if (target === 'validator') document.getElementById('tabValidator').style.display = 'block';
      if (target === 'rules') document.getElementById('tabRules').style.display = 'block';
    });
  });

  // Organizer Cheat Sheet Toggle
  const btnToggleGuide = document.getElementById('btnToggleGuide');
  const btnCloseGuide = document.getElementById('btnCloseGuide');
  const guideSection = document.getElementById('masterGuideSection');

  btnToggleGuide.addEventListener('click', () => {
    const isHidden = guideSection.style.display === 'none';
    guideSection.style.display = isHidden ? 'block' : 'none';
    if (isHidden) loadGuideTable();
  });

  btnCloseGuide.addEventListener('click', () => {
    guideSection.style.display = 'none';
  });

  // Change Host button
  document.getElementById('btnChangeHost').addEventListener('click', promptChangeHost);
}

async function promptChangeHost() {
  const current = document.getElementById('lblCurrentHost').textContent;
  const newBaseUrl = prompt("Enter new base URL for QR codes (e.g. http://192.168.1.50:3000):", current);
  if (!newBaseUrl || newBaseUrl === current) return;

  try {
    const res = await fetch('/api/regenerate-qrs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseUrl: newBaseUrl.trim().replace(/\/$/, '') })
    });
    const data = await res.json();
    if (data.success) {
      alert("✅ QR Codes regenerated with new base URL!");
      window.location.reload();
    } else {
      alert("Error regenerating QRs: " + data.error);
    }
  } catch (err) {
    alert("Network error updating host: " + err.message);
  }
}

// Fetch Game and QR Data
async function loadGameData() {
  try {
    const [manifestRes, infoRes] = await Promise.all([
      fetch('/qrs/manifest.json'),
      fetch('/api/game-info')
    ]);

    const manifest = await manifestRes.json();
    gameInfo = await infoRes.json();

    document.getElementById('lblCurrentHost').textContent = manifest.baseUrl;

    renderQRCards(manifest.stages);
    renderProgressBar();
  } catch (err) {
    console.error("Failed to load game data:", err);
  }
}

// Render 5 QR Checkpoint Cards (Shows ONLY QR code, no links)
function renderQRCards(stages) {
  const container = document.getElementById('qrCardsGrid');
  container.innerHTML = '';

  stages.forEach(stage => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.textAlign = 'center';

    card.innerHTML = `
      <div class="card-header" style="justify-content: center; margin-bottom: 0.5rem;">
        <div>
          <span class="stage-badge">CHECKPOINT 0${stage.stageId}</span>
          <h2 style="margin-top: 0.35rem; font-size: 1.3rem;">${stage.stageName}</h2>
        </div>
      </div>

      <div class="qr-box" style="margin: 1rem auto; max-width: 260px;">
        <img src="${stage.pngUrl}" alt="QR Stage ${stage.stageId}" loading="lazy" style="width: 100%; height: auto; display: block;" />
      </div>

      <div style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 0.75rem;">
        <a href="${stage.pngUrl}" download="QR_Stage_${stage.stageId}.png" class="btn btn-secondary btn-sm">
          📥 PNG
        </a>
        <a href="${stage.svgUrl}" download="QR_Stage_${stage.stageId}.svg" class="btn btn-secondary btn-sm">
          📥 SVG
        </a>
      </div>
    `;

    container.appendChild(card);
  });
}

// Load organizer walkthrough table
async function loadGuideTable() {
  try {
    const res = await fetch('/api/game-info?mode=master');
    const masterData = await res.json();
    const tbody = document.getElementById('guideTableBody');
    tbody.innerHTML = '';

    masterData.stages.forEach(stage => {
      const truePortal = stage.portals.find(p => p.type === 'true');
      let answerPreview = '';
      if (truePortal.puzzleType === 'caesar') answerPreview = truePortal.puzzleData.acceptedAnswers.join(', ');
      if (truePortal.puzzleType === 'matrix') answerPreview = '4x4 Matrix Parity Pattern';
      if (truePortal.puzzleType === 'runes') answerPreview = 'Order: Fire > Water > Earth > Air > Aether';
      if (truePortal.puzzleType === 'waveform') answerPreview = 'Freq: 4Hz, Amp: 75%, Phase: 180°';
      if (truePortal.puzzleType === 'cryptogram') answerPreview = truePortal.puzzleData.plaintext;

      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid rgba(255,255,255,0.06)';
      tr.innerHTML = `
        <td style="padding: 0.75rem 0.5rem; font-weight: bold; color: var(--accent-cyan);">Stage ${stage.id}</td>
        <td style="padding: 0.75rem 0.5rem;">${stage.name}</td>
        <td style="padding: 0.75rem 0.5rem; color: var(--accent-emerald); font-weight: bold;">Portal ${stage.correctPortalId.toUpperCase()}: ${truePortal.title}</td>
        <td style="padding: 0.75rem 0.5rem; font-family: var(--font-mono); text-transform: uppercase;">${truePortal.puzzleType}</td>
        <td style="padding: 0.75rem 0.5rem; font-family: var(--font-mono); color: #fff;">
          <code>${stage.rewardPasskey}</code> (${answerPreview})
        </td>
        <td style="padding: 0.75rem 0.5rem; font-size: 0.85rem; color: var(--text-muted);">${stage.nextStageClue}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {
    console.error("Error loading master guide:", e);
  }
}

// In-Browser QR Scanner Setup
function setupScannerModal() {
  const modal = document.getElementById('scannerModal');
  const btnOpen = document.getElementById('btnOpenScanner');
  const btnClose = document.getElementById('btnCloseScanner');

  btnOpen.addEventListener('click', () => {
    modal.classList.add('open');
    startQrScanner();
  });

  btnClose.addEventListener('click', () => {
    modal.classList.remove('open');
    stopQrScanner();
  });
}

function startQrScanner() {
  const resultDiv = document.getElementById('scannerResult');
  resultDiv.style.display = 'none';

  if (!html5QrScanner) {
    html5QrScanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true
    });
  }

  html5QrScanner.render((decodedText, decodedResult) => {
    window.soundFx.playSuccess();
    resultDiv.style.display = 'block';
    
    // Parse links from the decoded text
    const urlMatches = decodedText.match(/https?:\/\/[^\s]+/g) || [];
    
    let linksHtml = '';
    if (urlMatches.length > 0) {
      linksHtml = `
        <div style="margin-top: 0.5rem;">
          <strong>Detected Portals:</strong>
          <ul style="margin: 0.5rem 0 0 1.25rem; font-size: 0.85rem;">
            ${urlMatches.map(u => `<li><a href="${u}" target="_blank" style="color: var(--accent-cyan); word-break: break-all;">${u}</a></li>`).join('')}
          </ul>
        </div>
      `;
    }

    resultDiv.innerHTML = `
      <div style="font-weight: bold; color: var(--accent-emerald);">🎯 QR Checkpoint Scanned!</div>
      <div style="margin-top: 0.5rem; font-family: var(--font-mono); font-size: 0.8rem; white-space: pre-wrap; background: rgba(0,0,0,0.4); padding: 0.5rem; border-radius: 0.25rem;">${decodedText}</div>
      ${linksHtml}
    `;
  }, (errorMessage) => {
    // Scan frame parse errors are expected continuously while aiming camera
  });
}

function stopQrScanner() {
  if (html5QrScanner) {
    html5QrScanner.clear().catch(err => console.error("Scanner clear error", err));
  }
}

// Passkey Checkpoint Progression
function setupPasskeyValidator() {
  const btnVerify = document.getElementById('btnVerifyPasskey');
  const selStage = document.getElementById('selStageCheck');
  const txtPass = document.getElementById('txtPasskeyInput');
  const feedback = document.getElementById('validatorFeedback');

  btnVerify.addEventListener('click', async () => {
    const stageId = selStage.value;
    const passkey = txtPass.value.trim();

    if (!passkey) {
      alert("Please enter a passkey");
      return;
    }

    try {
      const res = await fetch('/api/verify-passkey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stageId, passkey })
      });
      const data = await res.json();

      feedback.className = 'alert-box ' + (data.success ? 'alert-success' : 'alert-error');
      feedback.style.display = 'block';

      if (data.success) {
        window.soundFx.playSuccess();
        feedback.innerHTML = `
          <strong>🎉 STAGE ${stageId} VERIFIED!</strong><br>
          ${data.message}<br>
          <div style="margin-top: 0.5rem; padding: 0.5rem; background: rgba(0,0,0,0.3); border-radius: 0.25rem;">
            ${data.nextStageClue}
          </div>
        `;
        markStageCompleted(stageId);
      } else {
        window.soundFx.playGlitch();
        feedback.textContent = `❌ ${data.message}`;
      }
    } catch (err) {
      feedback.className = 'alert-box alert-error';
      feedback.textContent = "Error verifying passkey: " + err.message;
    }
  });
}

function getCompletedStages() {
  try {
    return JSON.parse(localStorage.getItem('chronos_completed_stages') || '[]');
  } catch (e) {
    return [];
  }
}

function markStageCompleted(stageId) {
  const completed = getCompletedStages();
  const idNum = parseInt(stageId, 10);
  if (!completed.includes(idNum)) {
    completed.push(idNum);
    localStorage.setItem('chronos_completed_stages', JSON.stringify(completed));
    renderProgressBar();
  }
}

function renderProgressBar() {
  const bar = document.getElementById('stageProgressBar');
  if (!bar) return;
  const completed = getCompletedStages();

  bar.innerHTML = '';
  for (let s = 1; s <= 5; s++) {
    const isDone = completed.includes(s);
    const pill = document.createElement('div');
    pill.style.cssText = `
      flex: 1; min-width: 100px; padding: 0.75rem; border-radius: 0.5rem; text-align: center;
      font-size: 0.8rem; font-weight: bold; font-family: var(--font-mono);
      background: ${isDone ? 'rgba(16, 185, 129, 0.2)' : 'rgba(30, 41, 59, 0.5)'};
      border: 1px solid ${isDone ? 'var(--accent-emerald)' : 'var(--border-color)'};
      color: ${isDone ? 'var(--accent-emerald)' : 'var(--text-muted)'};
    `;
    pill.innerHTML = `
      ${isDone ? '✅ CLEARED' : `STAGE 0${s}`}
    `;
    bar.appendChild(pill);
  }
}
