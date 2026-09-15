const fs = require('fs');
const path = require('path');
const gameData = require('./data/gameData');

let errors = 0;
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    errors++;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log("=== RUNNING QR MYSTERY HUNT AUTOMATED TESTS ===");

// 1. Validate Stages Count and Structure
assert(gameData.stages.length === 5, `Game must have 5 stages (found ${gameData.stages.length})`);

gameData.stages.forEach(stage => {
  assert(stage.portals.length >= 3, `Stage ${stage.id} must contain at least 3 portals (found ${stage.portals.length})`);
  
  const truePortals = stage.portals.filter(p => p.type === 'true');
  const decoyPortals = stage.portals.filter(p => p.type === 'decoy');
  
  assert(truePortals.length === 1, `Stage ${stage.id} must have exactly 1 true portal (found ${truePortals.length})`);
  assert(decoyPortals.length >= 2, `Stage ${stage.id} must have at least 2 decoy portals (found ${decoyPortals.length})`);
  assert(!!stage.rewardPasskey, `Stage ${stage.id} must have a reward passkey`);
  assert(!!stage.nextStageClue, `Stage ${stage.id} must have a next stage clue`);
});

// 2. Validate Generated QR Images
const qrsDir = path.join(__dirname, 'public/qrs');
for (let i = 1; i <= 5; i++) {
  const pngPath = path.join(qrsDir, `qr_stage_${i}.png`);
  const svgPath = path.join(qrsDir, `qr_stage_${i}.svg`);
  assert(fs.existsSync(pngPath) && fs.statSync(pngPath).size > 1000, `Stage ${i} PNG QR exists and has data`);
  assert(fs.existsSync(svgPath) && fs.statSync(svgPath).size > 1000, `Stage ${i} SVG QR exists and has data`);
}

// 3. Validate Manifest Content
const manifestPath = path.join(qrsDir, 'manifest.json');
assert(fs.existsSync(manifestPath), "QR manifest.json exists");
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
assert(manifest.stages.length === 5, "Manifest contains 5 stages");

manifest.stages.forEach(s => {
  assert(s.links.length === 3, `Manifest stage ${s.stageId} has 3 links`);
  s.links.forEach(l => {
    assert(l.url.includes(`/stage/${s.stageId}/${l.portal}`), `Link URL is well formed: ${l.url}`);
  });
  assert(s.payloadText.includes(s.links[0].url), `QR payload includes Link 1`);
  assert(s.payloadText.includes(s.links[1].url), `QR payload includes Link 2`);
  assert(s.payloadText.includes(s.links[2].url), `QR payload includes Link 3`);
});

// 4. Validate Server Route Logic Simulation
console.log("\n=== VALIDATING PUZZLE LOGIC & PASSKEYS ===");

// Stage 1: Caesar Cipher
const s1True = gameData.stages[0].portals.find(p => p.type === 'true');
assert(s1True.puzzleData.acceptedAnswers.includes("CHRONOS"), "Stage 1 Caesar accepts 'CHRONOS'");

// Stage 2: Matrix Grid
const s2True = gameData.stages[1].portals.find(p => p.type === 'true');
const s2Solution = s2True.puzzleData.solution;
const rowSums = s2Solution.map(r => r.reduce((a, b) => a + b, 0));
const colSums = [0, 1, 2, 3].map(c => [0, 1, 2, 3].reduce((acc, r) => acc + s2Solution[r][c], 0));
assert(JSON.stringify(rowSums) === JSON.stringify(s2True.puzzleData.rowTargets), "Stage 2 Matrix row targets match solution");
assert(JSON.stringify(colSums) === JSON.stringify(s2True.puzzleData.colTargets), "Stage 2 Matrix col targets match solution");

// Stage 3: Runes
const s3True = gameData.stages[2].portals.find(p => p.type === 'true');
assert(s3True.puzzleData.solutionOrder.join(' > ') === "FIRE > WATER > EARTH > AIR > AETHER", "Stage 3 Runes cosmological order correct");

// Stage 4: Waveform
const s4True = gameData.stages[3].portals.find(p => p.type === 'true');
assert(s4True.puzzleData.targetFreq === 4 && s4True.puzzleData.targetAmp === 75 && s4True.puzzleData.targetPhase === 180, "Stage 4 Waveform targets correct");

// Stage 5: Master Cryptogram
const s5True = gameData.stages[4].portals.find(p => p.type === 'true');
assert(s5True.puzzleData.acceptedAnswers.includes("OMEGA SANCTUM"), "Stage 5 Cryptogram accepts 'OMEGA SANCTUM'");

// Decoys validation
gameData.stages.forEach(s => {
  const decoys = s.portals.filter(p => p.type === 'decoy');
  decoys.forEach(d => {
    assert(!!d.puzzleData.decoyFeedback, `Decoy portal '${d.title}' in Stage ${s.id} has warning feedback`);
  });
});

if (errors === 0) {
  console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY! (0 errors)\n");
  process.exit(0);
} else {
  console.error(`\n❌ TEST SUITE FAILED with ${errors} errors.\n`);
  process.exit(1);
}
