const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const gameData = require('./data/gameData');
const { generateAllQRs, getLocalIpAddress } = require('./scripts/generate_qrs');

const app = express();
const PORT = process.env.PORT || 3840;
const HOST = '0.0.0.0'; // Bind to all interfaces for local network access

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Submissions Logger & Persistence
const SUBMISSIONS_FILE = path.join(__dirname, 'data', 'submissions.json');
let submissions = [];

try {
  if (fs.existsSync(SUBMISSIONS_FILE)) {
    submissions = JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, 'utf8'));
  }
} catch (e) {
  submissions = [];
}

function saveSubmission(entry) {
  submissions.unshift({
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString(),
    ...entry
  });
  if (submissions.length > 500) submissions.pop();
  try {
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save submissions:', e);
  }
}

// Attempt Limits Tracking (Max 2 Attempts per portal / passkey)
const MAX_ATTEMPTS = 2;
const puzzleAttempts = {};   // key: `${team}_s${stageId}_p${portalId}` -> count
const passkeyAttempts = {};  // key: `${team}_s${stageId}` -> count

// API: Get Attempts Info for a portal
app.get('/api/attempts/:stageId/:portalId', (req, res) => {
  const team = String(req.query.teamName || 'Anonymous Operative').trim().toLowerCase();
  const stageId = parseInt(req.params.stageId, 10);
  const portalId = req.params.portalId.toLowerCase();
  const key = `${team}_s${stageId}_p${portalId}`;
  const used = puzzleAttempts[key] || 0;
  const left = Math.max(0, MAX_ATTEMPTS - used);
  res.json({
    maxAttempts: MAX_ATTEMPTS,
    attemptsUsed: used,
    attemptsLeft: left,
    isLocked: used >= MAX_ATTEMPTS
  });
});

// API: Get complete game information
app.get('/api/game-info', (req, res) => {
  const isMaster = req.query.mode === 'master';
  if (isMaster) {
    return res.json(gameData);
  }

  const sanitizedStages = gameData.stages.map((stage) => ({
    id: stage.id,
    name: stage.name,
    locationClue: stage.locationClue,
    portals: stage.portals.map((p) => ({
      id: p.id,
      title: p.title,
      subtitle: p.subtitle,
      description: p.description,
      themeColor: p.themeColor,
      puzzleType: p.puzzleType
    }))
  }));

  res.json({
    theme: gameData.theme,
    stages: sanitizedStages
  });
});

// API: Get details for a specific stage & portal
app.get('/api/puzzle/:stageId/:portalId', (req, res) => {
  const stageId = parseInt(req.params.stageId, 10);
  const portalId = req.params.portalId.toLowerCase();

  const stage = gameData.stages.find((s) => s.id === stageId);
  if (!stage) return res.status(404).json({ error: 'Stage not found' });

  const portal = stage.portals.find((p) => p.id === portalId);
  if (!portal) return res.status(404).json({ error: 'Portal not found' });

  res.json({
    stageId: stage.id,
    stageName: stage.name,
    portalId: portal.id,
    portalTitle: portal.title,
    portalSubtitle: portal.subtitle,
    portalDescription: portal.description,
    puzzleType: portal.puzzleType,
    themeColor: portal.themeColor,
    isTrue: portal.type === 'true',
    puzzleData: portal.puzzleData
  });
});

// API: Verify puzzle solution with 2-Attempt Enforcement
app.post('/api/verify-puzzle', (req, res) => {
  const { stageId, portalId, answer, teamName } = req.body;
  const userTeam = String(teamName || 'Anonymous Operative').trim();
  const teamKey = userTeam.toLowerCase();

  const stage = gameData.stages.find((s) => s.id === parseInt(stageId, 10));
  if (!stage) return res.status(404).json({ success: false, message: 'Invalid stage' });

  const portal = stage.portals.find((p) => p.id === String(portalId).toLowerCase());
  if (!portal) return res.status(404).json({ success: false, message: 'Invalid portal' });

  const attemptKey = `${teamKey}_s${stage.id}_p${portal.id.toLowerCase()}`;
  const used = puzzleAttempts[attemptKey] || 0;

  // Enforce Max 2 Attempts
  if (used >= MAX_ATTEMPTS) {
    return res.json({
      success: false,
      locked: true,
      attemptsLeft: 0,
      message: `🚨 SECURITY LOCKDOWN: Maximum attempts (${MAX_ATTEMPTS}/${MAX_ATTEMPTS}) exceeded for this portal! Access is permanently locked.`
    });
  }

  // Increment attempt count
  puzzleAttempts[attemptKey] = used + 1;
  const attemptsLeft = Math.max(0, MAX_ATTEMPTS - puzzleAttempts[attemptKey]);

  const cleanAns = String(answer || '').trim().toUpperCase();

  // If this portal is a DECOY
  if (portal.type === 'decoy') {
    let decoyTriggered = false;
    let feedbackMsg = portal.puzzleData.decoyFeedback || '⚠️ This portal is a decoy!';

    if (portal.puzzleType === 'riddle') {
      const correctOpt = String(portal.puzzleData.correctOption).trim().toUpperCase();
      if (cleanAns === correctOpt) {
        decoyTriggered = true;
      } else {
        feedbackMsg = 'Incorrect option for this decoy puzzle. Try another choice or portal!';
      }
    } else {
      decoyTriggered = true;
    }

    saveSubmission({
      teamName: userTeam,
      stageId: stage.id,
      stageName: stage.name,
      portalId: portal.id.toUpperCase(),
      portalTitle: portal.title,
      type: 'DECOY',
      status: decoyTriggered ? 'DECOY_TRIGGERED' : 'INCORRECT',
      answer: answer || '(Interactive action)',
      passkeyAwarded: null,
      attemptsLeft,
      message: feedbackMsg
    });

    return res.json({
      success: false,
      isDecoy: true,
      attemptsLeft,
      locked: attemptsLeft === 0,
      message: `${feedbackMsg} (Attempts left: ${attemptsLeft}/${MAX_ATTEMPTS})`
    });
  }

  // TRUE PORTAL: check answers based on puzzle type
  let isSolved = false;

  if (portal.puzzleType === 'caesar') {
    isSolved = portal.puzzleData.acceptedAnswers.includes(cleanAns);
  } else if (portal.puzzleType === 'matrix') {
    if (req.body.solved === true) isSolved = true;
  } else if (portal.puzzleType === 'runes') {
    if (req.body.solved === true) isSolved = true;
  } else if (portal.puzzleType === 'waveform') {
    if (req.body.solved === true) isSolved = true;
  } else if (portal.puzzleType === 'cryptogram') {
    isSolved = portal.puzzleData.acceptedAnswers.includes(cleanAns);
  }

  if (isSolved) {
    saveSubmission({
      teamName: userTeam,
      stageId: stage.id,
      stageName: stage.name,
      portalId: portal.id.toUpperCase(),
      portalTitle: portal.title,
      type: 'TRUE_KEYSTONE',
      status: 'CORRECT',
      answer: answer || '(Solved Interactive Puzzle)',
      passkeyAwarded: stage.rewardPasskey,
      attemptsLeft,
      message: `Stage ${stage.id} Authentic Portal Cleared`
    });

    return res.json({
      success: true,
      isDecoy: false,
      attemptsLeft,
      locked: false,
      rewardPasskey: stage.rewardPasskey,
      nextStageClue: stage.nextStageClue,
      message: `🎉 AUTHENTIC PORTAL SOLVED! Stage ${stage.id} Cleared!`
    });
  } else {
    saveSubmission({
      teamName: userTeam,
      stageId: stage.id,
      stageName: stage.name,
      portalId: portal.id.toUpperCase(),
      portalTitle: portal.title,
      type: 'TRUE_KEYSTONE',
      status: 'INCORRECT',
      answer: answer || '(Incomplete Puzzle)',
      passkeyAwarded: null,
      attemptsLeft,
      message: 'Incorrect attempt on authentic puzzle'
    });

    return res.json({
      success: false,
      attemptsLeft,
      locked: attemptsLeft === 0,
      message: attemptsLeft > 0 
        ? `❌ Incorrect solution. Warning: Only ${attemptsLeft} attempt remaining!` 
        : `🚨 Incorrect solution. Maximum attempts (2/2) reached. Portal locked!`
    });
  }
});

// API: Verify Stage Passkey with 2-Attempt Enforcement
app.post('/api/verify-passkey', (req, res) => {
  const { stageId, passkey, teamName } = req.body;
  const userTeam = String(teamName || 'Anonymous Operative').trim();
  const teamKey = userTeam.toLowerCase();

  const stage = gameData.stages.find((s) => s.id === parseInt(stageId, 10));
  if (!stage) return res.status(404).json({ success: false, message: 'Invalid stage' });

  const attemptKey = `${teamKey}_s${stage.id}`;
  const used = passkeyAttempts[attemptKey] || 0;

  if (used >= MAX_ATTEMPTS) {
    return res.json({
      success: false,
      locked: true,
      attemptsLeft: 0,
      message: `🚨 MAXIMUM PASSKEY ATTEMPTS EXCEEDED (2/2)! Stage ${stage.id} passkey terminal locked.`
    });
  }

  passkeyAttempts[attemptKey] = used + 1;
  const attemptsLeft = Math.max(0, MAX_ATTEMPTS - passkeyAttempts[attemptKey]);

  const cleanKey = String(passkey || '').trim().toUpperCase();
  const isMatch = cleanKey === stage.rewardPasskey.toUpperCase();

  saveSubmission({
    teamName: userTeam,
    stageId: stage.id,
    stageName: stage.name,
    portalId: 'PASSKEY_CHECK',
    portalTitle: 'Passkey Validator',
    type: 'PASSKEY',
    status: isMatch ? 'CORRECT' : 'INCORRECT',
    answer: passkey,
    attemptsLeft,
    passkeyAwarded: isMatch ? stage.rewardPasskey : null,
    message: isMatch ? `Passkey verified for Stage ${stage.id}` : 'Invalid passkey attempt'
  });

  if (isMatch) {
    return res.json({
      success: true,
      attemptsLeft,
      nextStageId: stage.id < 5 ? stage.id + 1 : null,
      message: `Passkey verified! Next checkpoint unlocked.`,
      nextStageClue: stage.nextStageClue
    });
  } else {
    return res.json({
      success: false,
      attemptsLeft,
      locked: attemptsLeft === 0,
      message: attemptsLeft > 0
        ? `Invalid passkey. Warning: Only ${attemptsLeft} attempt remaining!`
        : `🚨 Invalid passkey. Maximum attempts (2/2) reached. Terminal locked!`
    });
  }
});

// API: Admin - Get All Submissions
app.get('/api/admin/submissions', (req, res) => {
  res.json({
    totalCount: submissions.length,
    correctCount: submissions.filter((s) => s.status === 'CORRECT').length,
    submissions
  });
});

// API: Admin - Reset Attempts
app.post('/api/admin/reset-attempts', (req, res) => {
  for (const k in puzzleAttempts) delete puzzleAttempts[k];
  for (const k in passkeyAttempts) delete passkeyAttempts[k];
  res.json({ success: true, message: 'All operative attempt counters have been reset to 2.' });
});

// API: Admin - Manual Answer Verifier
app.post('/api/admin/verify-manual', (req, res) => {
  const { stageId, query } = req.body;
  const cleanQ = String(query || '').trim().toUpperCase();

  const results = [];
  const stagesToCheck = stageId ? gameData.stages.filter((s) => s.id === parseInt(stageId, 10)) : gameData.stages;

  for (const s of stagesToCheck) {
    if (cleanQ === s.rewardPasskey.toUpperCase()) {
      results.push({
        match: true,
        type: 'PASSKEY',
        stageId: s.id,
        stageName: s.name,
        details: `Valid Passkey for Stage ${s.id}!`,
        passkey: s.rewardPasskey,
        nextStageClue: s.nextStageClue
      });
    }

    for (const p of s.portals) {
      if (p.type === 'true') {
        const answers = p.puzzleData.acceptedAnswers || [];
        if (answers.map((a) => a.toUpperCase()).includes(cleanQ)) {
          results.push({
            match: true,
            type: 'TRUE_PORTAL_ANSWER',
            stageId: s.id,
            stageName: s.name,
            portalId: p.id.toUpperCase(),
            portalTitle: p.title,
            details: `Correct Answer for Stage ${s.id} Authentic Portal!`,
            passkey: s.rewardPasskey,
            nextStageClue: s.nextStageClue
          });
        }
      } else if (p.type === 'decoy' && p.puzzleType === 'riddle') {
        if (cleanQ === String(p.puzzleData.correctOption).trim().toUpperCase()) {
          results.push({
            match: true,
            type: 'DECOY_ANSWER',
            stageId: s.id,
            stageName: s.name,
            portalId: p.id.toUpperCase(),
            portalTitle: p.title,
            details: `This is a solution to a DECOY puzzle! (Trap: ${p.puzzleData.decoyFeedback})`
          });
        }
      }
    }
  }

  if (results.length > 0) {
    res.json({ match: true, results });
  } else {
    res.json({ match: false, message: 'No matching correct answer or passkey found for this input.' });
  }
});

// API: Admin - Clear submissions
app.post('/api/admin/clear-submissions', (req, res) => {
  submissions = [];
  try {
    fs.writeFileSync(SUBMISSIONS_FILE, '[]', 'utf8');
  } catch (e) {}
  res.json({ success: true, message: 'All submissions cleared.' });
});

// API: Regenerate QRs with custom URL
app.post('/api/regenerate-qrs', async (req, res) => {
  try {
    const { baseUrl } = req.body;
    const manifest = await generateAllQRs(baseUrl);
    res.json({ success: true, manifest });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Routes
app.get('/play', (req, res) => res.sendFile(path.join(__dirname, 'public', 'play.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/qr/:stageId', (req, res) => res.sendFile(path.join(__dirname, 'public', 'single_qr.html')));
app.get('/qr', (req, res) => res.redirect('/qr/1'));
app.get('/stage/:stageId', (req, res) => res.sendFile(path.join(__dirname, 'public', 'stage.html')));
app.get('/stage/:stageId/:portalId', (req, res) => res.sendFile(path.join(__dirname, 'public', 'puzzle.html')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'single_qr.html')));

if (!process.env.VERCEL) {
  app.listen(PORT, HOST, async () => {
    const localIp = getLocalIpAddress();
    console.log(`\n==============================================`);
    console.log(`🕵️ QR MYSTERY HUNT SERVER (2-ATTEMPT LIMIT ACTIVE)`);
    console.log(`🎮 Player Frontend:  http://localhost:${PORT}/play`);
    console.log(`📱 Mobile Players:   http://${localIp}:${PORT}/play`);
    console.log(`🛠️ Admin Verifier:   http://localhost:${PORT}/admin`);
    console.log(`🏠 Command Hub:      http://localhost:${PORT}`);
    console.log(`==============================================\n`);

    try {
      await generateAllQRs();
    } catch (err) {
      console.error('Failed to generate QRs on startup:', err);
    }
  });
}

module.exports = app;
