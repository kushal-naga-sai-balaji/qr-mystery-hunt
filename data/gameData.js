module.exports = {
  theme: {
    title: "Project Chronos: The QR Mystery Hunt",
    subtitle: "5 Stages • 15 Puzzle Portals • 1 True Path",
    description: "Scan the QR checkpoint, choose your portal, solve the enigma, and unravel the secret."
  },
  stages: [
    {
      id: 1,
      name: "The Gate of Whispers",
      locationClue: "Initial Starting Point (Check your briefing envelope or QR 1 Station)",
      rewardPasskey: "CHRONOS-74",
      nextStageClue: "🔎 Proceed to Stage 2: 'Seek the mirror beneath the clock tower or northern wall'",
      correctPortalId: "c",
      qrQuestion: "An encrypted Roman dispatch was intercepted: [ FKURQRV ]. Decode the Caesar cipher (shifted by +3 letters) to uncover the ancient secret word! Which portal holds the true cipher chamber to submit the answer?",
      portals: [
        {
          id: "a",
          title: "Portal A: The Mirage Clock",
          type: "decoy",
          themeColor: "amber",
          subtitle: "Temporal Distortion Chamber",
          description: "An ancient chronometer ticks backwards. Align the hands according to the riddle: 'I speak without a mouth and hear without ears. I have no body, but I come alive with wind.'",
          puzzleType: "riddle",
          puzzleData: {
            question: "What am I?",
            options: ["An Echo", "A Shadow", "A Windmill", "A Clock"],
            correctOption: "An Echo",
            decoyFeedback: "⚠️ DECOY PROTOCOL TRIGGERED! The clock shatters into sand. 'You found an echo of truth, but not the truth itself.' Portal A is a diversion! Hint: The true portal holds an ancient Roman cipher."
          }
        },
        {
          id: "b",
          title: "Portal B: The False Constellation",
          type: "decoy",
          themeColor: "rose",
          subtitle: "Stellar Navigational Trap",
          description: "Starlight glimmers across obsidian tiles. Which star never moves in the northern night sky?",
          puzzleType: "riddle",
          puzzleData: {
            question: "Identify the anchor star of the north:",
            options: ["Sirius", "Polaris", "Betelgeuse", "Vega"],
            correctOption: "Polaris",
            decoyFeedback: "⚠️ DECOY NODE! Polaris glows bright, but reveals only an empty void. 'Looking at the stars will not open this gate.' Hint: Seek the cipher wheel at Portal C!"
          }
        },
        {
          id: "c",
          title: "Portal C: The Caesar Cipher Cryptograph",
          type: "true",
          themeColor: "emerald",
          subtitle: "The Authentic Keystone",
          description: "An encrypted military dispatch from Emperor Augustus. The message has been shifted by +3 letters (A becomes D, B becomes E, etc.). Decode the encrypted word to unlock the gate.",
          puzzleType: "caesar",
          puzzleData: {
            shift: 3,
            ciphertext: "FKURQRV",
            hint: "Shift each letter BACK by 3 positions in the alphabet. (F -> C, K -> H, U -> R, R -> O, Q -> N, R -> O, V -> S)",
            acceptedAnswers: ["CHRONOS"]
          }
        }
      ]
    },
    {
      id: 2,
      name: "The Hall of Reflections",
      locationClue: "Found near the reflective mirrors or northern stairwell",
      rewardPasskey: "HELIOS-91",
      nextStageClue: "🔎 Proceed to Stage 3: 'Search near the bronze gear or mechanical cabinet'",
      correctPortalId: "b",
      qrQuestion: "A 4x4 binary logic matrix is unpowered. Row energy targets are [2, 1, 3, 2] and Column targets are [2, 2, 2, 2]. Which portal connects the true binary circuit without triggering a blackout?",
      portals: [
        {
          id: "a",
          title: "Portal A: The Broken Prism",
          type: "decoy",
          themeColor: "amber",
          subtitle: "Optical Refraction Trap",
          description: "Light hits a cracked quartz crystal. Which wavelength of visible light possesses the highest energy?",
          puzzleType: "riddle",
          puzzleData: {
            question: "Which color ray carries the highest photon energy?",
            options: ["Red", "Green", "Violet", "Yellow"],
            correctOption: "Violet",
            decoyFeedback: "⚠️ ILLUSION NODE! Violet beam fractures the chamber. 'Knowledge of light will not bridge the logic matrix.' Return and inspect Portal B!"
          }
        },
        {
          id: "b",
          title: "Portal B: The Binary Matrix Circuit",
          type: "true",
          themeColor: "cyan",
          subtitle: "The Logic Core",
          description: "A 4x4 matrix logic grid is powered down. Click the cells to match the binary parity code. Each row and column must total the required target counts!",
          puzzleType: "matrix",
          puzzleData: {
            gridSize: 4,
            rowTargets: [2, 1, 3, 2],
            colTargets: [2, 2, 2, 2],
            solution: [
              [1, 0, 1, 0],
              [0, 1, 0, 0],
              [1, 0, 1, 1],
              [0, 1, 0, 1]
            ],
            hint: "Toggle cells on/off until every row and column counter matches its target number exactly."
          }
        },
        {
          id: "c",
          title: "Portal C: The Whispering Echo",
          type: "decoy",
          themeColor: "purple",
          subtitle: "Acoustic Mirage",
          description: "A voice repeats numbers in reverse: 'NINE, SEVEN, FOUR, TWO, ONE'. Enter the digits in forward chronological order.",
          puzzleType: "riddle",
          puzzleData: {
            question: "Enter the inverted numeric string:",
            options: ["12479", "12749", "97421", "24791"],
            correctOption: "12479",
            decoyFeedback: "⚠️ SOUND TRAP! The echo fades into silence. 'A recording from a ghost terminal.' Portal C is empty. Try the binary matrix in Portal B!"
          }
        }
      ]
    },
    {
      id: 3,
      name: "The Clockwork Vault",
      locationClue: "Found near the bronze gears or mechanical storage",
      rewardPasskey: "AETHER-33",
      nextStageClue: "🔎 Proceed to Stage 4: 'Find the terminal by the electronic laboratory or audio console'",
      correctPortalId: "a",
      qrQuestion: "Five ancient alchemical seals guard the inner lock: Fire, Water, Earth, Air, and Aether. Align the runes in cosmological progression. Which portal unlocks the authentic elemental keystone?",
      portals: [
        {
          id: "a",
          title: "Portal A: The Alchemical Runes Lock",
          type: "true",
          themeColor: "emerald",
          subtitle: "Elemental Transmutation Keystone",
          description: "Five ancient alchemical seals guard the inner lock. Rotate each dial to place the elements in cosmological order: [FIRE 🔥] -> [WATER 💧] -> [EARTH 🌍] -> [AIR 💨] -> [AETHER ⚛️].",
          puzzleType: "runes",
          puzzleData: {
            elements: ["FIRE", "WATER", "EARTH", "AIR", "AETHER"],
            solutionOrder: ["FIRE", "WATER", "EARTH", "AIR", "AETHER"],
            hint: "Use the swap buttons to align the five elemental seals in cosmic progression: Fire first, then Water, Earth, Air, and finally Aether."
          }
        },
        {
          id: "b",
          title: "Portal B: The Gilded Scales",
          type: "decoy",
          themeColor: "amber",
          subtitle: "Counterfeit Weight Vault",
          description: "You have 8 coins that look identical. 7 have equal weight, but 1 is heavier counterfeit gold. What is the minimum number of balance weighings needed to guarantee finding the fake?",
          puzzleType: "riddle",
          puzzleData: {
            question: "Minimum balance scale weighings needed for 8 coins:",
            options: ["1", "2", "3", "4"],
            correctOption: "2",
            decoyFeedback: "⚠️ TRAP VAULT! The scale drops into a counterfeit pit. 'Smart deduction, but this vault contains fool's gold!' Hint: Return and unlock the elemental runes in Portal A."
          }
        },
        {
          id: "c",
          title: "Portal C: The Labyrinth Map",
          type: "decoy",
          themeColor: "rose",
          subtitle: "Minotaur's Corridor",
          description: "Theseus left a golden thread through the maze. Which direction does the thread lead at the third junction if the map reads: N, E, [?], W?",
          puzzleType: "riddle",
          puzzleData: {
            question: "Next compass coordinate:",
            options: ["South", "North", "East", "Northwest"],
            correctOption: "South",
            decoyFeedback: "⚠️ DEAD END! You entered a blind corridor with blank stone walls. 'The labyrinth leads nowhere.' Check Portal A for the true elemental lock!"
          }
        }
      ]
    },
    {
      id: 4,
      name: "The Neural Nexus",
      locationClue: "Found near the electronic research desk or audio console",
      rewardPasskey: "VORTEX-58",
      nextStageClue: "🔎 Proceed to Stage 5: 'Final Chamber: The Grand Archive / Central Vault'",
      correctPortalId: "c",
      qrQuestion: "A secret carrier frequency is hidden beneath static noise: Target 4 Hz Frequency, 75% Amplitude, 180° Phase. Which portal tunes into the authentic resonance transmitter?",
      portals: [
        {
          id: "a",
          title: "Portal A: The Quicksand Glyph",
          type: "decoy",
          themeColor: "amber",
          subtitle: "Sinking Sand Protocol",
          description: "Unscramble the corrupted security word: 'N-E-T-A-G-L-E-M-E-N-T'",
          puzzleType: "riddle",
          puzzleData: {
            question: "Unscramble the word:",
            options: ["ENTANGLEMENT", "MAGNETOMETER", "ENLIGHTENMENT", "TELEMETRY"],
            correctOption: "ENTANGLEMENT",
            decoyFeedback: "⚠️ DECOY SUBROUTINE! Quantum entanglement simulated, but the output bus is unplugged! Hint: Tune into the resonant waveform in Portal C!"
          }
        },
        {
          id: "b",
          title: "Portal B: The Spectral Prism",
          type: "decoy",
          themeColor: "purple",
          subtitle: "Chromatic Dispersion Trap",
          description: "Mixing primary colors of additive light (Red, Green, Blue) produces which luminous frequency?",
          puzzleType: "riddle",
          puzzleData: {
            question: "Additive RGB light combined equals:",
            options: ["Black", "White", "Amber", "Cyan"],
            correctOption: "White",
            decoyFeedback: "⚠️ BLINDING FLARE! Bright white flash obscures the terminal. 'You found pure light, but no frequency key.' Head to Portal C for wave synthesis!"
          }
        },
        {
          id: "c",
          title: "Portal C: The Frequency Waveform Tuner",
          type: "true",
          themeColor: "cyan",
          subtitle: "Resonance Transmitter",
          description: "A secret carrier frequency is hidden beneath the static noise. Adjust the Frequency (Hz) and Harmonic Phase sliders until your waveform matches the target green sine wave exactly!",
          puzzleType: "waveform",
          puzzleData: {
            targetFreq: 4,
            targetAmp: 75,
            targetPhase: 180,
            hint: "Tune Frequency to 4 Hz, Amplitude to 75%, and Phase angle to 180° to achieve 100% resonance harmony."
          }
        }
      ]
    },
    {
      id: 5,
      name: "The Master Sanctum",
      locationClue: "The Central Archive / Master Vault",
      rewardPasskey: "OMEGA-SANCTUM-X",
      nextStageClue: "🏆 CONGRATULATIONS! You have unlocked the Grand Vault and solved the Chronos Protocol!",
      correctPortalId: "b",
      qrQuestion: "The grand vault door requires the master keyword. Use Vigenère keyword 'CHRONOS' to decrypt ciphertext [ QASVE XOFFVWE ]. Which portal will accept the master phrase to unlock the vault?",
      portals: [
        {
          id: "a",
          title: "Portal A: The Siren's Scroll",
          type: "decoy",
          themeColor: "rose",
          subtitle: "Hypnotic Verse Trap",
          description: "A poem carved into marble: 'I have cities, but no houses. I have mountains, but no trees. I have water, but no fish.' What am I?",
          puzzleType: "riddle",
          puzzleData: {
            question: "Solve the riddle of the scroll:",
            options: ["A Map", "A Globe", "A Painting", "A Book"],
            correctOption: "A Map",
            decoyFeedback: "⚠️ SIREN'S TRAP! The scroll bursts into harmless blue sparkles. 'A map shows the world, but not the final master key.' Portal B holds the true cryptographic cipher!"
          }
        },
        {
          id: "b",
          title: "Portal B: The Master Enigma Cryptogram",
          type: "true",
          themeColor: "emerald",
          subtitle: "The Master Vault Seal",
          description: "The grand vault door requires the master keyword. Use the Vigenère keyword 'CHRONOS' to decrypt the secret ciphertext: 'QASVE XOFFVWE'.",
          puzzleType: "cryptogram",
          puzzleData: {
            cipherMethod: "Vigenere",
            keyword: "CHRONOS",
            ciphertext: "QASVE XOFFVWE",
            plaintext: "OMEGA SANCTUM",
            hint: "Use keyword CHRONOS to decode the two words: QASVE -> OMEGA, XOFFVWE -> SANCTUM. Enter: 'OMEGA SANCTUM'",
            acceptedAnswers: ["OMEGA SANCTUM", "OMEGASANCTUM", "OMEGA-SANCTUM"]
          }
        },
        {
          id: "c",
          title: "Portal C: The Ouroboros Loop",
          type: "decoy",
          themeColor: "amber",
          subtitle: "Infinite Recursion Trap",
          description: "A serpent biting its own tail. If a statement says: 'The next statement is true. The previous statement is false.', what is this called?",
          puzzleType: "riddle",
          puzzleData: {
            question: "Identify the logical construct:",
            options: ["Paradox", "Tautology", "Syllogism", "Analogy"],
            correctOption: "Paradox",
            decoyFeedback: "⚠️ RECURSION TRAP! You are trapped in an infinite loop: True -> False -> True. Break out and head to Portal B to crack the Enigma seal!"
          }
        }
      ]
    }
  ]
};
