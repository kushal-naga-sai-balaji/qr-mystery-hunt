# 🕵️ The Chronos Protocol: QR Mystery Hunt

An interactive 5-stage mystery hunt system featuring **5 scannable QR checkpoints**. Scanning each QR code intercepts **3 distinct puzzle links** (1 authentic portal and 2 deceptive decoy puzzles, totaling 15 unique interactive puzzles). Operatives must solve the authentic puzzle to obtain the stage passkey and clue to the next QR checkpoint, culminating in the Grand Vault.

---

## 🚀 Quick Start

### 1. Launch the Server
```bash
cd /Users/sangineedikushal/.gemini/antigravity/scratch/qr-mystery-hunt
npm start
```

### 2. Access the Command Hub
- **Local Access:** `http://localhost:3840`
- **Mobile / Local Network Access:** `http://<YOUR-IP>:3840` (auto-detected on startup)

---

## 🌟 Key Features

1. **5 High-Resolution QR Checkpoints**:
   - Pre-generated in `public/qrs/` as both PNG and SVG files.
   - Each QR encodes formatted text containing 3 direct puzzle links and a gateway hub.
   - Standard phone camera apps (iOS / Android) decode the text and display clickable links.

2. **The Tri-Portal Mechanism (1 True, 2 Decoys per Stage)**:
   - **Stage 1**: Decoy A (Mirage Clock) • Decoy B (False Constellation) • **True C (Caesar Cipher)**
   - **Stage 2**: Decoy A (Broken Prism) • **True B (Binary Logic Matrix)** • Decoy C (Whispering Echo)
   - **Stage 3**: **True A (Alchemical Runes Lock)** • Decoy B (Gilded Scales) • Decoy C (Labyrinth Map)
   - **Stage 4**: Decoy A (Quicksand Glyph) • Decoy B (Spectral Prism) • **True C (Frequency Waveform Tuner)**
   - **Stage 5**: Decoy A (Siren's Scroll) • **True B (Master Enigma Cryptogram)** • Decoy C (Ouroboros Loop)

3. **15 Interactive Puzzle Pages**:
   - Each portal features an interactive puzzle with custom mechanics (interactive cipher wheel, binary parity circuit, draggable elemental runes, real-time waveform canvas oscilloscope, and Vigenère cryptogram).
   - Decoy portals test players with lore-rich challenges, but when solved, trigger realistic decoy alarms and guide players back to the authentic path.

4. **Game Master / Organizer Dashboard**:
   - Side-by-side QR code station gallery with download options.
   - **Printable Field Cards** view (`/print.html`): Print formatted physical mystery cards with QR codes and clue logs for physical placement in rooms/venues.
   - Built-in live browser QR camera scanner for testing without extra apps.
   - Passkey Checkpoint Validator with mission progress tracker.
   - Organizer Walkthrough & Master Solution Cheat Sheet.

5. **Audio Effects & Polished UI**:
   - Synthesized audio effects via Web Audio API (success chords, wrong buzz, gear clicks).
   - Responsive dark cyberpunk / detective mystery aesthetic.

---

## 🖨️ Printing Field Cards for Real-World Play

1. Open `http://localhost:3840/print.html` (or click **🖨️ Print Field Cards** from the dashboard).
2. Use browser print (`Cmd + P` or `Ctrl + P`).
3. Cut and place the cards in 5 designated physical locations:
   - **Card 1**: Briefing desk / starting point
   - **Card 2**: Near mirrors or northern stairwell
   - **Card 3**: Near clockwork, gears, or mechanical storage
   - **Card 4**: Near audio consoles or laboratory desks
   - **Card 5**: Central Archive / Master Vault

---

## 🗝️ Master Solution Walkthrough (Organizer Reference)

| Stage | QR Checkpoint | Authentic Portal | Puzzle Type | Solution / Passkey | Next Stage Clue |
|---|---|---|---|---|---|
| **1** | The Gate of Whispers | **Portal C** | Caesar Cipher (+3) | Answer: `CHRONOS`<br>Passkey: `CHRONOS-74` | "Seek the mirror beneath the clock tower or northern wall" |
| **2** | The Hall of Reflections | **Portal B** | 4x4 Binary Circuit | Parity Balance<br>Passkey: `HELIOS-91` | "Search near the bronze gear or mechanical cabinet" |
| **3** | The Clockwork Vault | **Portal A** | Alchemical Runes | Fire &rarr; Water &rarr; Earth &rarr; Air &rarr; Aether<br>Passkey: `AETHER-33` | "Find the terminal by electronic lab or audio console" |
| **4** | The Neural Nexus | **Portal C** | Waveform Tuner | Freq: 4Hz, Amp: 75%, Phase: 180&deg;<br>Passkey: `VORTEX-58` | "Final Chamber: The Central Archive / Master Vault" |
| **5** | The Master Sanctum | **Portal B** | Vigenère Cryptogram | Key: `CHRONOS`<br>Answer: `OMEGA SANCTUM`<br>Master Vault: `OMEGA-SANCTUM-X` | **Mission Complete! Grand Vault Unlocked.** |
