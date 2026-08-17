(function () {
  "use strict";

  const SAVE_KEY = "catchAndCraftQuestV3";
  const TILE = 16;
  const COLS = 16;
  const ROWS = 14;
  const WIDTH = 256;
  const HEIGHT = 224;

  const TYPE_CHART = {
    Fang: { Sun: 1.6, Swift: 0.6, Weed: 1.6, Night: 0.6, Scale: 0.6 },
    Sun: { Fang: 0.6, Stone: 1.6, Night: 1.6, Cold: 0.6 },
    Stone: { Swift: 1.6, Weed: 0.6, Scale: 1.6, Cold: 1.6 },
    Swift: { Fang: 1.6, Stone: 0.6, Weed: 1.6, Cold: 0.6 },
    Weed: { Fang: 0.6, Sun: 1.6, Stone: 1.6, Swift: 0.6 },
    Night: { Fang: 1.6, Sun: 0.6, Scale: 1.6, Cold: 1.6 },
    Scale: { Fang: 1.6, Stone: 0.6, Weed: 1.6, Night: 0.6 },
    Cold: { Sun: 1.6, Stone: 0.6, Swift: 1.6, Night: 0.6 },
  };

  const POND_FISH = [
    { id: 1, name: "Bluegill", types: ["Sun"], lengthFactor: 13, signature: "Nest Guard", stats: { stamina: 55, pull: 48, hold: 52, dart: 62, wile: 50, grit: 58, slip: 8 }, color: "#d4a017" },
    { id: 2, name: "Pumpkinseed", types: ["Sun"], lengthFactor: 12, signature: "Orange Ear", stats: { stamina: 52, pull: 46, hold: 50, dart: 64, wile: 58, grit: 55, slip: 8 }, color: "#e09020" },
    { id: 3, name: "Green Sunfish", types: ["Sun", "Weed"], lengthFactor: 12, signature: "Tough Mouth", stats: { stamina: 58, pull: 55, hold: 60, dart: 48, wile: 42, grit: 55, slip: 10 }, color: "#3d7a55" },
    { id: 4, name: "Black Crappie", types: ["Sun", "Weed"], lengthFactor: 18, signature: "Paper Mouth", stats: { stamina: 50, pull: 44, hold: 40, dart: 72, wile: 60, grit: 48, slip: 16 }, color: "#4a4a48" },
    { id: 5, name: "Largemouth Bass", types: ["Fang", "Weed"], lengthFactor: 24, signature: "Topwater Blow", stats: { stamina: 62, pull: 70, hold: 55, dart: 58, wile: 48, grit: 52, slip: 12 }, color: "#2a4a38" },
    { id: 6, name: "Bullhead", types: ["Night", "Stone"], lengthFactor: 20, signature: "Barbel Grit", stats: { stamina: 70, pull: 50, hold: 68, dart: 35, wile: 40, grit: 72, slip: 6 }, color: "#3a3028" },
    { id: 7, name: "Carp", types: ["Stone"], lengthFactor: 32, signature: "Mud Root", stats: { stamina: 80, pull: 58, hold: 70, dart: 32, wile: 45, grit: 65, slip: 10 }, color: "#8a6a3a" },
    { id: 8, name: "Golden Shiner", types: ["Sun", "Swift"], lengthFactor: 8, signature: "Flash School", stats: { stamina: 38, pull: 30, hold: 32, dart: 85, wile: 55, grit: 40, slip: 20 }, color: "#e8c040" },
  ];

  const SHINER = POND_FISH[7];

  const RODS = {
    warped: { id: "warped", name: "Warped rod", drag: 8, backbone: 7 }
  };
  const LINES = {
    six: { id: "six", name: "6 lb line", tensile: 7, stealth: 8 }
  };
  const BAITS = {
    worm: { id: "worm", name: "Worm", hook: 8, attract: ["Sun", "Weed"] }
  };
  const NETS = {
    hand: { id: "hand", name: "Hand net", scoop: 9, sizeCap: 22 }
  };
  const CAMERAS = {
    pocket: { id: "pocket", name: "Pocket camera", proof: 10 }
  };

  function starterKit() {
    return { rod: "warped", line: "six", bait: null, net: "hand", camera: "pocket" };
  }

  // . fairway  , rough  w water  b bank  T tree  h hide  s sand  C club  p path
  const MAP_ROWS = [
    "TTTTTTTTTTTTTTTT",
    "TZCCCCCCCCCCCCCT",
    "Th,..........,hT",
    "Th............hT",
    "Th...ssss.....hT",
    "Th............hT",
    "Th,..........,hT",
    "hhbbbbbbbbbbbbhh",
    "hbbwwwwwwwwwwbbh",
    "TwwwwwwwwwwwwwwT",
    "TwwwwwwwwwwwwwwT",
    "TwwwwwwwwwwwwwwT",
    "TTTTTTTTTTTTTTTT",
    "TTTTTTTTTTTTTTTT",
  ];

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  const nameWrap = document.getElementById("nameWrap");
  const nameEntry = document.getElementById("nameEntry");

  const keys = Object.create(null);
  const just = Object.create(null);

  let mode = "intro";
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(SAVE_KEY) : null;
    if (raw) {
      const data = JSON.parse(raw);
      if (data && data.cleared) mode = "title";
    }
  } catch (err) { /* ignore */ }
  let tick = 0;
  let walkLock = 0;
  let keeperTimer = 0;
  let keeperDwell = 0;
  let introIndex = 0;
  let dialog = [];
  let dialogPage = 0;
  let flash = 0;
  let menuIndex = 0;
  let battle = null;
  let saveNote = 0;

  const game = {
    name: "Angler",
    worms: 0,
    warnings: 0,
    skills: { keepStill: false, dropALine: false, snapshot: false },
    fieldGuide: {},
    album: [],
    kit: starterKit(),
    talkedZippy: false,
    metCatch: false,
    catchBond: 0,
    catchFlags: { spotted: false, fish: false, zippy: false },
    cleared: false,
    player: { c: 1, r: 7, facing: "up" },
    keeper: { c: 8, r: 4, facing: "left", pathI: 0 },
    catchNpc: { c: 14, r: 7, facing: "left" },
  };

  const KEEPER_STEP = 50;
  const KEEPER_DWELL = 48;
  const INTRO_PAGES = [
    "A package is on the porch at dawn. There is no note.",
    "Inside: a warped spinning rod, a hand net, six-pound line, and a pocket camera.",
    "Fishing clubs run the lakes. Pictures or it never happened. No photo, they will not let you in.",
    "The closest water is a pond on a golf course. Valleybrook, hole 9. That is your first hole.",
  ];
  const KEEPER_PATH = [
    { c: 4, r: 3 },
    { c: 11, r: 3 },
    { c: 11, r: 5 },
    { c: 4, r: 5 },
  ];

  function tileAt(c, r) {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return "T";
    return MAP_ROWS[r][c];
  }

  function walkable(c, r) {
    const t = tileAt(c, r);
    return t === "." || t === "," || t === "b" || t === "h" || t === "s" || t === "p";
  }

  function hiddenAt(c, r) {
    return tileAt(c, r) === "h";
  }

  function fishable(c, r) {
    if (tileAt(c, r) !== "b") return false;
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        if (tileAt(c + dc, r + dr) === "w") return true;
      }
    }
    return false;
  }

  function formatName(raw) {
    const trimmed = String(raw || "").trim().replace(/\s+/g, " ");
    if (!trimmed) return "";
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  }

  function catchRank() {
    if (game.catchBond >= 2) return "friend";
    if (game.catchBond >= 1) return "wary";
    return "rival";
  }

  function bumpCatch(flag) {
    if (game.catchFlags[flag]) return false;
    game.catchFlags[flag] = true;
    if (game.catchBond < 2) game.catchBond += 1;
    return true;
  }

  function nearZippy() {
    const p = game.player;
    return Math.abs(p.c - 1) + Math.abs(p.r - 1) <= 2 && p.r <= 2;
  }

  function nearCatch() {
    const p = game.player;
    const c = game.catchNpc;
    return Math.abs(p.c - c.c) + Math.abs(p.r - c.r) <= 1;
  }

  function chebyshev(a, b) {
    return Math.max(Math.abs(a.c - b.c), Math.abs(a.r - b.r));
  }

  function objectiveLines() {
    if (game.cleared) {
      return ["Hole 9 is cleared.", "Fish more, or talk to Zippy."];
    }
    if (!game.talkedZippy) {
      return [
        "Press UP. Stay on the left reeds.",
        "Do not walk on the green grass.",
        "Press Z at the man in the trees.",
      ];
    }
    if (!game.skills.snapshot) {
      return [
        "Press DOWN to the brown bank.",
        "Stand next to the water.",
        "Press Z to cast.",
      ];
    }
    return ["Keep fishing, or talk to Zippy."];
  }

  function kitStats() {
    const rod = RODS[game.kit.rod] || RODS.warped;
    const line = LINES[game.kit.line] || LINES.six;
    const bait = BAITS[game.kit.bait] || { name: "No bait", hook: 4, attract: [] };
    const net = NETS[game.kit.net] || NETS.hand;
    const cam = CAMERAS[game.kit.camera] || { name: "No camera", proof: 0 };
    return {
      rod: rod,
      line: line,
      bait: bait,
      net: net,
      camera: cam,
      control: rod.drag + (bait.hook || 0) / 2,
      maxLine: rod.backbone * 6 + line.tensile * 4,
      scoop: net.scoop,
      sizeCap: net.sizeCap,
      proof: cam.proof,
      attract: bait.attract || []
    };
  }

  function photoCount() {
    return Object.keys(game.fieldGuide).length;
  }

  function scaleStats(base, level) {
    const f = 0.35 + level * 0.08;
    return {
      stamina: Math.max(12, Math.round(base.stamina * f)),
      pull: Math.max(5, Math.round(base.pull * f)),
      hold: Math.max(5, Math.round(base.hold * f)),
      dart: Math.max(5, Math.round(base.dart * f)),
      wile: Math.max(5, Math.round(base.wile * f)),
      grit: Math.max(5, Math.round(base.grit * f)),
      slip: base.slip,
    };
  }

  function makeFighter(species, level, loaner) {
    const st = scaleStats(species.stats, level);
    return {
      species: species,
      name: species.name,
      level: level,
      types: species.types.slice(),
      maxHp: st.stamina,
      hp: st.stamina,
      pull: st.pull,
      hold: st.hold,
      dart: st.dart,
      wile: st.wile,
      grit: st.grit,
      slip: st.slip,
      holdStage: 0,
      loaner: !!loaner,
      fainted: false,
    };
  }

  function typeMultiplier(atkTypes, defTypes) {
    let mod = 1;
    for (const a of atkTypes) {
      for (const d of defTypes) {
        const v = (TYPE_CHART[a] || {})[d];
        if (v) mod *= v;
      }
    }
    return mod;
  }

  function pickWild() {
    if (!game.skills.snapshot) return POND_FISH[0];
    const roll = Math.random();
    if (roll < 0.4) return POND_FISH[0];
    if (roll < 0.65) return POND_FISH[1];
    if (roll < 0.82) return POND_FISH[2];
    if (roll < 0.92) return POND_FISH[5];
    if (roll < 0.98) return POND_FISH[3];
    return POND_FISH[7];
  }

  function showDialog(lines) {
    dialog = Array.isArray(lines) ? lines.slice() : [String(lines)];
    dialogPage = 0;
    mode = "dialog";
  }

  function learnSkill(key, label, line) {
    if (game.skills[key]) return;
    game.skills[key] = true;
    dialog.push("You learned " + label + "!");
    if (line) dialog.push(line);
  }

  function bumpKeeper() {
    showDialog([
      "GROUNDSKEEPER: Stay off the green. I'm mowing.",
      "Leave him. Walk the left reeds.",
    ]);
  }

  function talkCatch() {
    const who = game.name;
    game.metCatch = true;
    const rank = catchRank();
    const lines = [];
    if (rank === "rival") {
      lines.push("A kid in a gold cap is already on the east bank.");
      if (who.toLowerCase() === "catch") {
        lines.push("CATCH: You're also Catch? Cute. Don't wear it out.");
      }
      lines.push("CATCH: This is my pond, " + who + ". Scram.");
      lines.push("CATCH: I had hole 9 first. The groundskeeper is my problem, not yours.");
    } else if (rank === "wary") {
      lines.push("CATCH: You're still here.");
      lines.push("CATCH: Fine. West bank is yours. East is mine. Don't splash.");
      if (game.talkedZippy && bumpCatch("zippy")) {
        lines.push("CATCH: You found Zippy. That bait is wasted on you.");
      }
    } else {
      lines.push("CATCH: ...If we're stuck sharing hole 9, I'll watch the cart path.");
      lines.push("CATCH: Don't make me cover for you, " + who + ".");
    }
    showDialog(lines);
  }

  function hideNameEntry() {
    if (!nameWrap) return;
    nameWrap.classList.add("hidden");
    if (nameEntry) nameEntry.blur();
    fitCanvas();
  }

  function showNameEntry() {
    mode = "name";
    menuIndex = 0;
    if (nameWrap) nameWrap.classList.remove("hidden");
    if (nameEntry) {
      nameEntry.value = "";
      setTimeout(() => nameEntry.focus(), 0);
    }
    fitCanvas();
  }

  function confirmName() {
    const n = formatName(nameEntry ? nameEntry.value : "");
    if (!n) {
      if (nameEntry) nameEntry.placeholder = "Need a name";
      return;
    }
    newGame(n);
  }

  function talkZippy() {
    if (!game.talkedZippy) {
      game.talkedZippy = true;
      game.worms = 5;
      game.kit.bait = "worm";
      showDialog([
        "ZIPPY: " + game.name + ". Worms. Don't ask.",
        "ZIPPY: That camera in the package is how you get in. Clubs stamp a photo.",
        "ZIPPY: Press DOWN to the bank. Press Z to cast.",
        "ZIPPY: REEL once. Then SNAP. The fish goes back. The photo stays.",
        "Got 5 WORMS.",
      ]);
      learnSkill("keepStill", "KEEP STILL", "Stay off the grass. He is mowing.");
      saveGame();
      saveNote = 90;
      return;
    }
    const opts = game.cleared
      ? ["ZIPPY: That's a club photo. They'll stamp it.", "ZIPPY: Worms are still on the house."]
      : ["ZIPPY: Pictures or it never happened. I noticed.", "ZIPPY: Worms are on the house."];
    game.worms = Math.max(game.worms, 5);
    opts.push("Your worms are topped off. Progress saved.");
    saveGame();
    saveNote = 90;
    showDialog(opts);
  }

  function startBattle() {
    if (game.worms <= 0) {
      showDialog(["You're out of worms.", "Zippy is in the trees."]);
      return;
    }
    if (!game.kit.camera) {
      showDialog(["Your pocket camera was in the package.", "Check KIT."]);
      return;
    }
    if (!game.kit.bait) {
      showDialog(["You need bait. Zippy has worms."]);
      return;
    }
    game.worms -= 1;
    const tutorial = !game.skills.snapshot;
    const wildSp = pickWild();
    const wildLv = tutorial ? 2 : 2 + Math.floor(Math.random() * 2);
    const kit = kitStats();
    battle = {
      phase: "intro",
      cursor: 0,
      fought: false,
      slack: 0,
      wild: makeFighter(wildSp, wildLv, false),
      lineHp: kit.maxLine,
      maxLine: kit.maxLine,
      log: tutorial
        ? "A bluegill! REEL to tire it, then SNAP. It goes back."
        : "A wild " + wildSp.name + " took the worm!",
      snapFails: 0
    };
    mode = "battle";
    if (!game.skills.dropALine) {
      game.skills.dropALine = true;
      battle.log = "You learned DROP A LINE! REEL, then SNAP.";
    }
  }

  function reelFish() {
    const w = battle.wild;
    const kit = kitStats();
    battle.fought = true;
    let power = kit.control * 3.2;
    if (kit.attract.some((t) => w.types.indexOf(t) !== -1)) power *= 1.2;
    const dmg = Math.max(4, Math.round(power / Math.max(8, w.hold) * 14));
    w.hp = Math.max(0, w.hp - dmg);
    battle.log = kit.rod.name + " reeled " + dmg + ".";
    if (!game.skills.snapshot && w.hp > 0) battle.log += " Now SNAP.";
    if (w.hp <= 0) {
      if (!game.skills.snapshot) {
        w.hp = 1;
        battle.log = "Tired enough. SNAP the picture.";
      } else {
        battle.phase = "lost";
        battle.log += " It rolled over. No photo.";
        return;
      }
    }
    battle.phase = "playerLog";
  }

  function slackLine() {
    battle.slack = Math.min(3, battle.slack + 1);
    battle.log = "You gave slack. The line eased.";
    battle.phase = "playerLog";
  }

  function enemyTurn() {
    const w = battle.wild;
    const kit = kitStats();
    const tutorial = !game.skills.snapshot;
    const raw = tutorial ? 6 + Math.floor(Math.random() * 4) : Math.max(4, Math.round(w.pull * 0.35));
    const dmg = Math.max(1, raw - battle.slack * 2);
    battle.lineHp = Math.max(0, battle.lineHp - dmg);
    battle.log = w.name + " thrashed the " + kit.line.name + " for " + dmg + ".";
    if (battle.lineHp <= 0) {
      battle.phase = "wipe";
      battle.log += " Line snapped.";
      return;
    }
    if (w.hp <= 0) {
      battle.phase = "lost";
      battle.log = "The " + w.name + " sank. No photo.";
      return;
    }
    if (battle.phase === "playerLog") battle.phase = "command";
  }

  function trySnap() {
    const w = battle.wild;
    const kit = kitStats();
    if (w.hp <= 0) {
      battle.log = "Nothing left to photograph.";
      return;
    }
    if (!battle.fought) {
      battle.log = "Still too lively. REEL first, then SNAP.";
      battle.phase = "playerLog";
      return;
    }
    if (w.species.lengthFactor > kit.sizeCap) {
      battle.phase = "lost";
      battle.log = "Too big for the " + kit.net.name + ". It broke off.";
      return;
    }
    if (!game.skills.snapshot) {
      takePhoto(w);
      return;
    }
    const stamPct = w.hp / w.maxHp;
    let chance = (kit.proof / 10) * (kit.scoop / 10) * (1 - stamPct * 0.55) * (1 - w.slip / 140);
    if (kit.attract.some((t) => w.types.indexOf(t) !== -1)) chance *= 1.15;
    if (Math.random() < chance) {
      takePhoto(w);
    } else {
      battle.snapFails += 1;
      battle.log = ["Blurry. SNAP again.", "It splashed the lens. SNAP.", "Thumb on the glass. SNAP."][Math.floor(Math.random() * 3)];
      if (battle.snapFails >= 5) {
        battle.log += " It is gone.";
        battle.phase = "lost";
      } else {
        battle.phase = "playerLog";
      }
    }
  }

  function takePhoto(w) {
    game.fieldGuide[w.species.id] = true;
    game.album.push({ id: w.species.id, name: w.name, level: w.level, water: "valleybrook-pond" });
    battle.phase = "photo";
    battle.caught = w;
    battle.log = "Click. Pictures or it never happened.";
    if (!game.skills.snapshot) {
      game.skills.snapshot = true;
      battle.log += " You learned THE SNAPSHOT!";
    }
    if (game.metCatch) bumpCatch("fish");
    flash = 10;
  }

  function finishPhoto() {
    battle.log = battle.caught.name + " slipped back into hole 9. Proof is in the album.";
    battle.phase = "done";
  }

  function clearValleybrook() {
    game.cleared = true;
    saveGame();
    saveNote = 90;
    const lines = ["You have a photograph. The fish is back in the pond."];
    if (game.metCatch) {
      lines.push("CATCH: ...Beginner's luck, " + game.name + ". Don't get used to my pond.");
    } else {
      lines.push("CATCH yells from the east bank. He saw the flash.");
    }
    lines.push("ZIPPY: Clubs stamp a photo, not a story. You're in.");
    lines.push("You slip off hole 9 before the cart comes back.");
    lines.push("VALLEYBROOK POND — CLEARED");
    showDialog(lines);
  }

  function endBattle() {
    const landed = battle && battle.phase === "done" && game.skills.snapshot;
    const tutorialFail = battle && !game.skills.snapshot && !landed;
    const phase = battle && battle.phase;
    battle = null;
    mode = "play";
    if (tutorialFail) {
      game.worms += 1;
      if (phase === "lost" || phase === "wipe") {
        showDialog(["ZIPPY: REEL once. Then SNAP. Put it back.", "Worm's on the house."]);
      }
      return;
    }
    if (landed && !game.cleared) clearValleybrook();
  }

  function saveGame() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        name: game.name,
        worms: game.worms,
        warnings: game.warnings,
        skills: game.skills,
        fieldGuide: game.fieldGuide,
        album: game.album,
        kit: game.kit,
        talkedZippy: game.talkedZippy,
        metCatch: game.metCatch,
        catchBond: game.catchBond,
        catchFlags: game.catchFlags,
        cleared: game.cleared,
        player: game.player,
        keeper: game.keeper,
        catchNpc: game.catchNpc,
      }));
    } catch (err) { /* ignore */ }
  }

  function loadGame() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      Object.assign(game, data);
      if (!game.catchNpc) game.catchNpc = { c: 14, r: 7, facing: "left" };
      if (!game.catchFlags) game.catchFlags = { spotted: false, fish: false, zippy: false };
      if (game.catchBond == null) game.catchBond = 0;
      if (game.cleared == null) game.cleared = false;
      if (!game.kit) game.kit = starterKit();
      if (!game.kit.camera) game.kit.camera = "pocket";
      if (!game.album) game.album = [];
      if (game.skills && game.skills.theNet && !game.skills.snapshot) game.skills.snapshot = true;
      keeperTimer = 0;
      keeperDwell = 0;
      return true;
    } catch (err) {
      return false;
    }
  }

  function beginIntro() {
    hideNameEntry();
    introIndex = 0;
    mode = "intro";
  }

  function newGame(name) {
    hideNameEntry();
    game.name = formatName(name) || "Angler";
    game.worms = 0;
    game.warnings = 0;
    game.skills = { keepStill: false, dropALine: false, snapshot: false };
    game.fieldGuide = {};
    game.album = [];
    game.kit = starterKit();
    game.talkedZippy = false;
    game.metCatch = false;
    game.catchBond = 0;
    game.catchFlags = { spotted: false, fish: false, zippy: false };
    game.pendingCatch = null;
    game.cleared = false;
    game.player = { c: 1, r: 7, facing: "up" };
    game.keeper = { c: 8, r: 4, facing: "left", pathI: 0 };
    game.catchNpc = { c: 14, r: 7, facing: "left" };
    keeperTimer = 0;
    keeperDwell = 0;
    showDialog([
      "You are in the cattails on the LEFT side of the screen.",
      "Press UP (arrow or D-pad). Stay on the left. Do not walk on the grass.",
      "The man in the trees is ZIPPY. Press Z or A when you reach him.",
      "He has worms. You already have the camera. One photo gets you in.",
    ]);
  }

  function pressKey(name) {
    if (mode === "name") {
      if (name === "ok" || name === "start") confirmName();
      if (name === "cancel") {
        hideNameEntry();
        mode = "title";
      }
      return;
    }
    if (name === "start") {
      if (mode === "play") {
        openMenu();
        return;
      }
      name = "ok";
    }
    if (!keys[name]) just[name] = true;
    keys[name] = true;
  }

  function releaseKey(name) {
    if (name === "start") name = "ok";
    keys[name] = false;
  }

  window.addEventListener("keydown", (e) => {
    if (mode === "name" || (nameEntry && document.activeElement === nameEntry)) {
      if (e.key === "Enter") {
        e.preventDefault();
        confirmName();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        hideNameEntry();
        mode = "title";
      }
      return;
    }
    const map = {
      ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
      w: "up", W: "up", s: "down", S: "down", a: "left", A: "left", d: "right", D: "right",
      z: "ok", Z: "ok", Enter: "ok",
      x: "cancel", X: "cancel", Shift: "cancel",
      Escape: "menu",
    };
    if (e.key === "Enter" && mode === "play") {
      e.preventDefault();
      openMenu();
      return;
    }
    const k = map[e.key];
    if (!k) return;
    e.preventDefault();
    pressKey(k === "menu" ? "start" : k);
  });
  window.addEventListener("keyup", (e) => {
    const map = {
      ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
      w: "up", W: "up", s: "down", S: "down", a: "left", A: "left", d: "right", D: "right",
      z: "ok", Z: "ok", Enter: "ok",
      x: "cancel", X: "cancel", Shift: "cancel",
    };
    const k = map[e.key];
    if (k) releaseKey(k);
  });

  function consume(k) {
    if (just[k]) {
      just[k] = false;
      return true;
    }
    return false;
  }

  function openMenu() {
    menuIndex = 0;
    mode = "menu";
  }

  function tryInteract() {
    if (nearCatch()) {
      talkCatch();
      return;
    }
    if (nearZippy()) {
      talkZippy();
      return;
    }
    if (fishable(game.player.c, game.player.r)) {
      if (!game.talkedZippy) {
        showDialog([
          "Not yet. You need bait.",
          "Press UP. Stay on the left reeds.",
          "Press Z at the man in the trees. That is Zippy.",
        ]);
        return;
      }
      startBattle();
      return;
    }
    if (!game.talkedZippy) {
      showDialog([
        "Press the UP ARROW. Stay on the left.",
        "Talk to Zippy in the trees. Press Z when you see him.",
      ]);
      return;
    }
    if (!game.skills.snapshot) {
      showDialog([
        "Press DOWN to the brown bank by the water.",
        "Stand on the bank. Press Z to cast.",
      ]);
      return;
    }
    showDialog(["Press Z on the bank to fish. Talk to Zippy if you need bait."]);
  }

  function movePlayer() {
    if (walkLock > 0) return;
    let dc = 0;
    let dr = 0;
    if (keys.up) dr = -1;
    else if (keys.down) dr = 1;
    else if (keys.left) dc = -1;
    else if (keys.right) dc = 1;
    else return;
    if (dr < 0) game.player.facing = "up";
    if (dr > 0) game.player.facing = "down";
    if (dc < 0) game.player.facing = "left";
    if (dc > 0) game.player.facing = "right";
    const nc = game.player.c + dc;
    const nr = game.player.r + dr;
    if (!walkable(nc, nr)) return;
    if (nc === game.keeper.c && nr === game.keeper.r) {
      bumpKeeper();
      return;
    }
    game.player.c = nc;
    game.player.r = nr;
    walkLock = 8;
  }

  function faceToward(k, dest) {
    if (dest.c > k.c) k.facing = "right";
    else if (dest.c < k.c) k.facing = "left";
    else if (dest.r > k.r) k.facing = "down";
    else if (dest.r < k.r) k.facing = "up";
  }

  function moveKeeper() {
    return;
  }

  function fitCanvas() {
    const extraEls = [
      document.querySelector(".hint-keys"),
      document.querySelector(".hint-touch"),
      document.querySelector(".home-link"),
      document.getElementById("pad"),
      nameWrap
    ];
    let extra = 20;
    extraEls.forEach((el) => {
      if (!el || el.classList.contains("hidden")) return;
      const st = window.getComputedStyle(el);
      if (st.display === "none") return;
      extra += el.getBoundingClientRect().height + 8;
    });
    const availW = Math.max(160, window.innerWidth - 16);
    const availH = Math.max(112, (window.visualViewport ? window.visualViewport.height : window.innerHeight) - extra);
    const s = Math.max(1, Math.floor(Math.min(availW / WIDTH, availH / HEIGHT)));
    canvas.style.width = WIDTH * s + "px";
    canvas.style.height = HEIGHT * s + "px";
  }
  window.addEventListener("resize", fitCanvas);
  if (window.visualViewport) window.visualViewport.addEventListener("resize", fitCanvas);
  window.addEventListener("load", fitCanvas);
  fitCanvas();

  function bindPad() {
    const pad = document.getElementById("pad");
    if (!pad) return;
    pad.querySelectorAll("[data-btn]").forEach((btn) => {
      const name = btn.getAttribute("data-btn");
      const down = (e) => {
        e.preventDefault();
        btn.classList.add("held");
        pressKey(name);
        if (e.pointerId != null && btn.setPointerCapture) btn.setPointerCapture(e.pointerId);
      };
      const up = (e) => {
        if (e) e.preventDefault();
        btn.classList.remove("held");
        releaseKey(name);
      };
      btn.addEventListener("pointerdown", down);
      btn.addEventListener("pointerup", up);
      btn.addEventListener("pointercancel", up);
      btn.addEventListener("lostpointercapture", up);
    });
    pad.addEventListener("contextmenu", (e) => e.preventDefault());
  }
  bindPad();

  const nameOk = document.getElementById("nameOk");
  if (nameOk) {
    nameOk.addEventListener("click", (e) => {
      e.preventDefault();
      confirmName();
    });
  }

  function px(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }

  function text(str, x, y, color, size) {
    ctx.fillStyle = color || "#f8f0d8";
    ctx.font = (size || 8) + 'px "Press Start 2P", monospace';
    ctx.textBaseline = "top";
    ctx.fillText(str, x, y);
  }

  function wrapText(str, x, y, maxChars, color) {
    const words = String(str).split(" ");
    let line = "";
    let row = 0;
    words.forEach((w) => {
      const next = line ? line + " " + w : w;
      if (next.length > maxChars) {
        text(line, x, y + row * 10, color, 8);
        line = w;
        row += 1;
      } else line = next;
    });
    if (line) text(line, x, y + row * 10, color, 8);
  }

  function drawTile(c, r) {
    const t = tileAt(c, r);
    const x = c * TILE;
    const y = r * TILE;
    if (t === "w") {
      px(x, y, TILE, TILE, r > 9 ? "#0d3a5c" : "#1a6a9a");
      if ((c + r + Math.floor(tick / 20)) % 5 === 0) px(x + 4, y + 8, 3, 1, "#8ec8e8");
    } else if (t === "b") {
      px(x, y, TILE, TILE, "#c4a574");
      px(x, y + 10, TILE, 6, "#1a6a9a");
    } else if (t === ".") {
      px(x, y, TILE, TILE, "#3cb043");
      if ((c + r) % 2 === 0) px(x + 8, y + 8, 2, 2, "#2d8a38");
    } else if (t === ",") {
      px(x, y, TILE, TILE, "#2d6b2d");
    } else if (t === "h") {
      px(x, y, TILE, TILE, "#3a5a28");
      px(x + 2, y + 2, 3, 10, "#6b5428");
      px(x + 8, y + 4, 3, 10, "#8a6a28");
      px(x + 5, y, 2, 6, "#d4a017");
    } else if (t === "T") {
      px(x, y, TILE, TILE, "#2d6b2d");
      px(x + 6, y + 10, 4, 6, "#6b4423");
      px(x + 2, y + 1, 12, 10, "#1e4d2b");
      px(x + 4, y + 3, 8, 6, "#2a6a38");
    } else if (t === "C" || t === "Z") {
      px(x, y, TILE, TILE, "#c4b8a0");
      px(x, y, TILE, 3, "#8b3a2f");
      if (t === "Z") px(x + 6, y + 6, 4, 6, "#6b4f2c");
    } else if (t === "s") {
      px(x, y, TILE, TILE, "#e0c070");
      px(x + 3, y + 5, 2, 2, "#d4a017");
    } else {
      px(x, y, TILE, TILE, "#3cb043");
    }
  }

  function drawPerson(c, r, kind, facing) {
    const x = c * TILE;
    const y = r * TILE;
    const hide = kind === "player" && hiddenAt(c, r);
    if (kind === "keeper") {
      px(x + 4, y + 3, 8, 8, "#c4a35a");
      px(x + 5, y + 4, 6, 3, "#f0d8b0");
      px(x + 3, y + 10, 10, 5, "#6b5428");
      px(x + 6, y + 1, 4, 3, "#3a3a30");
    } else if (kind === "zippy") {
      px(x + 4, y + 3, 8, 8, "#6b4f2c");
      px(x + 5, y + 4, 6, 3, "#e8c8a0");
      px(x + 3, y + 10, 10, 5, "#2a2a28");
      px(x + 5, y + 1, 6, 3, "#c45c2a");
    } else if (kind === "catch") {
      px(x + 4, y + 3, 8, 8, "#8b3a2f");
      px(x + 5, y + 4, 6, 3, "#f0d0b0");
      px(x + 3, y + 10, 10, 5, "#203018");
      px(x + 6, y + 1, 4, 3, "#d4a017");
    } else {
      px(x + 4, y + 3, 8, 8, hide ? "#2a4a38" : "#2a5aa8");
      px(x + 5, y + 4, 6, 3, "#f0d0b0");
      px(x + 3, y + 10, 10, 5, "#1a3a28");
      px(x + 6, y + 1, 4, 3, "#d4a017");
    }
    const fx = facing === "left" ? x + 3 : facing === "right" ? x + 11 : x + 7;
    const fy = facing === "up" ? y + 2 : y + 6;
    px(fx, fy, 2, 2, "#12232c");
  }

  function drawBox(x, y, w, h) {
    px(x, y, w, h, "#f8f0d8");
    ctx.strokeStyle = "#203018";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  }

  function drawFish(f, x, y, flip) {
    ctx.save();
    ctx.translate(x, y);
    if (flip) ctx.scale(-1, 1);
    ctx.fillStyle = f.species ? f.species.color : f.color || "#d4a017";
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(16, 0);
    ctx.lineTo(26, -8);
    ctx.lineTo(26, 8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#f8f0d8";
    ctx.fillRect(-8, -3, 3, 3);
    ctx.fillStyle = "#12232c";
    ctx.fillRect(-7, -2, 2, 2);
    ctx.restore();
  }

  function drawHud() {
    px(0, 0, WIDTH, 12, "#203018");
    text((game.name || "ANGLER").slice(0, 8).toUpperCase(), 4, 2, "#f0e0a0", 8);
    text("W" + game.worms, 132, 2, "#f8f0d8", 8);
    text("PIC " + photoCount(), 176, 2, "#f8f0d8", 8);
    if (saveNote > 0) text("SAVED", 216, 2, "#70f070", 8);
  }

  function drawOverworld() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) drawTile(c, r);
    }
    drawPerson(game.keeper.c, game.keeper.r, "keeper", game.keeper.facing);
    drawPerson(1, 1, "zippy", "down");
    drawPerson(game.catchNpc.c, game.catchNpc.r, "catch", game.catchNpc.facing);
    drawPerson(game.player.c, game.player.r, "player", game.player.facing);
    if (!game.talkedZippy && tick % 36 < 22) {
      for (let r = 3; r <= 6; r++) text("^", 4, r * TILE + 4, "#f0e0a0", 8);
    }
    if ((!game.talkedZippy || nearZippy()) && tick % 40 < 20) {
      text("!", 18, 8, "#f0e0a0", 8);
    }
    if (nearCatch() && tick % 40 < 20) {
      text("!", game.catchNpc.c * TILE + 4, game.catchNpc.r * TILE - 8, "#f0e0a0", 8);
    }
    drawHud();
    if (mode === "play") {
      const lines = objectiveLines();
      drawBox(8, HEIGHT - 52, WIDTH - 16, 44);
      lines.forEach((line, i) => text(line, 14, HEIGHT - 46 + i * 12, "#203018", 8));
    }
  }

  function drawDialog() {
    drawOverworld();
    drawBox(8, HEIGHT - 72, WIDTH - 16, 64);
    const line = dialog[dialogPage] || "";
    wrapText(line, 16, HEIGHT - 64, 26, "#203018");
    if (tick % 30 < 15) text("v", WIDTH - 22, HEIGHT - 18, "#203018", 8);
  }

  function hpBar(x, y, w, hp, max) {
    px(x, y, w, 6, "#203018");
    const p = max <= 0 ? 0 : hp / max;
    px(x + 1, y + 1, Math.max(0, Math.floor((w - 2) * p)), 4, p > 0.5 ? "#3d7a55" : p > 0.25 ? "#d4a017" : "#8b3a2f");
  }

  function drawBattle() {
    px(0, 0, WIDTH, HEIGHT, "#7eb6d9");
    px(0, 70, WIDTH, 80, "#1a6a9a");
    px(0, 100, WIDTH, 50, "#0d3a5c");
    const w = battle.wild;
    const kit = kitStats();
    drawFish(w, 186, 52, true);
    drawBox(8, 12, 120, 40);
    text(w.name, 14, 16, "#203018", 8);
    text("Lv" + w.level, 14, 26, "#405838", 8);
    hpBar(14, 38, 100, w.hp, w.maxHp);
    drawBox(128, 108, 120, 48);
    text(kit.rod.name, 134, 112, "#203018", 8);
    text(kit.bait.name + " / " + kit.net.name.split(" ")[0], 134, 122, "#405838", 8);
    text("LINE", 134, 132, "#405838", 8);
    hpBar(134, 142, 100, battle.lineHp, battle.maxLine);
    drawBox(8, HEIGHT - 64, WIDTH - 16, 56);
    if (battle.phase === "command") {
      const hint = !game.skills.snapshot
        ? (battle.fought ? "Now pick SNAP." : "Pick REEL, then SNAP.")
        : battle.log;
      wrapText(hint, 16, HEIGHT - 58, 14, "#203018");
      const labels = ["REEL", "SLACK", "SNAP", "RUN"];
      labels.forEach((lab, i) => {
        const x = 148 + (i % 2) * 50;
        const y = HEIGHT - 58 + Math.floor(i / 2) * 16;
        text((battle.cursor === i ? ">" : " ") + lab, x, y, "#203018", 8);
      });
    } else if (battle.phase === "photo") {
      px(88, 40, 80, 72, "#f8f0d8");
      px(92, 44, 72, 52, "#7eb6d9");
      drawFish(w, 128, 70, true);
      text("PROOF", 104, 100, "#8b3a2f", 8);
      wrapText(battle.log, 16, HEIGHT - 50, 26, "#203018");
    } else {
      wrapText(battle.log, 16, HEIGHT - 50, 26, "#203018");
    }
  }

  function drawTitle() {
    px(0, 0, WIDTH, HEIGHT, "#1a3a28");
    for (let i = 0; i < 16; i++) px(i * 16, 140, 16, 84, i % 2 ? "#1a6a9a" : "#16384a");
    px(0, 120, WIDTH, 24, "#3cb043");
    text("CATCH AND CRAFT", 24, 24, "#f0e0a0", 8);
    text("A fishing quest", 28, 42, "#b8c8a8", 8);
    const items = ["New game", "Continue", "How to play"];
    items.forEach((lab, i) => {
      text((menuIndex === i ? ">" : " ") + lab, 28, 88 + i * 14, "#f8f0d8", 8);
    });
    text("Z confirm", 28, 200, "#8aa878", 8);
    if (mode === "name") text("Type your name below.", 28, 176, "#f0e0a0", 8);
  }

  function drawIntro() {
    px(0, 0, WIDTH, HEIGHT, introIndex === 0 ? "#1a1410" : introIndex < 3 ? "#203018" : "#1a3a28");
    if (introIndex === 0) {
      px(40, 48, 48, 28, "#6b5428");
      px(48, 56, 32, 12, "#c4a35a");
      px(86, 62, 70, 4, "#8a6a3a");
      px(92, 50, 14, 10, "#3a3a30");
      px(95, 53, 8, 5, "#8aa8c8");
      text("A PACKAGE", 24, 16, "#f0e0a0", 8);
    } else if (introIndex === 1) {
      px(48, 52, 4, 40, "#6b5428");
      px(44, 48, 12, 8, "#c4a35a");
      px(160, 56, 28, 20, "#3a3a30");
      px(166, 60, 16, 10, "#8aa8c8");
      px(184, 62, 4, 4, "#d4a017");
      text("ROD AND CAMERA", 24, 16, "#f0e0a0", 8);
    } else if (introIndex === 2) {
      px(32, 40, 192, 56, "#3a2a18");
      px(40, 48, 176, 40, "#c4b8a0");
      text("NO PHOTO", 72, 56, "#8b3a2f", 8);
      text("NO ENTRY", 80, 72, "#203018", 8);
    } else {
      for (let i = 0; i < 16; i++) px(i * 16, 140, 16, 84, i % 2 ? "#1a6a9a" : "#16384a");
      px(0, 120, WIDTH, 24, "#3cb043");
      px(8, 88, 16, 32, "#2a4a38");
      text("FIRST WATER", 28, 16, "#f0e0a0", 8);
    }
    drawBox(8, HEIGHT - 88, WIDTH - 16, 80);
    wrapText(INTRO_PAGES[introIndex] || "", 16, HEIGHT - 80, 26, "#203018");
    text("Z or A", WIDTH - 70, HEIGHT - 18, "#405838", 8);
  }

  function drawHelp() {
    px(0, 0, WIDTH, HEIGHT, "#f8f0d8");
    text("HOW TO FISH", 16, 12, "#203018", 8);
    wrapText("Arrows or D-pad move. Z or A talks, fishes, confirms. X or B backs out. Enter or START opens your pack.", 16, 32, 26, "#203018");
    wrapText("1. Press UP. Stay on the left reeds. Talk to Zippy with Z.", 16, 72, 26, "#203018");
    wrapText("2. Press DOWN to the bank. Press Z to fish.", 16, 112, 26, "#203018");
    wrapText("3. REEL once, then SNAP. The fish goes back. The photo is proof.", 16, 152, 26, "#203018");
    text("Z back", 16, 200, "#405838", 8);
  }

  function drawMenu() {
    drawOverworld();
    drawBox(72, 24, 176, 160);
    const items = ["ALBUM", "KIT", "SKILLS", "SAVE", "CLOSE"];
    items.forEach((lab, i) => {
      text((menuIndex === i ? ">" : " ") + lab, 84, 36 + i * 14, "#203018", 8);
    });
    const caught = photoCount();
    if (menuIndex === 0) {
      text(caught + "/8 photos", 84, 120, "#405838", 8);
      POND_FISH.forEach((f, i) => {
        const mark = game.fieldGuide[f.id] ? "*" : "-";
        if (i < 4) text(mark + f.name.slice(0, 10), 84, 134 + i * 10, "#203018", 8);
      });
    } else if (menuIndex === 1) {
      const kit = kitStats();
      text(kit.rod.name + " DRG" + kit.rod.drag, 84, 120, "#203018", 8);
      text(kit.line.name + " TEN" + kit.line.tensile, 84, 132, "#203018", 8);
      text((game.kit.bait ? kit.bait.name : "No bait") + " HOK" + (kit.bait.hook || 0), 84, 144, "#203018", 8);
      text(kit.net.name + " SCP" + kit.scoop, 84, 156, "#203018", 8);
      text((game.kit.camera ? "Camera" : "No cam") + " PRF" + kit.proof, 84, 168, "#203018", 8);
    } else if (menuIndex === 2) {
      text((game.skills.keepStill ? "*" : "-") + " Keep Still", 84, 120, "#203018", 8);
      text((game.skills.dropALine ? "*" : "-") + " Drop a Line", 84, 132, "#203018", 8);
      text((game.skills.snapshot ? "*" : "-") + " Snapshot", 84, 144, "#203018", 8);
      text("Catch:" + catchRank(), 84, 156, "#405838", 8);
    } else if (menuIndex === 3) {
      text("Talk to Zippy to save,", 84, 120, "#405838", 8);
      text("or press Z here.", 84, 132, "#405838", 8);
    }
  }

  function handleIntro() {
    if (consume("ok") || consume("cancel")) {
      introIndex += 1;
      if (introIndex >= INTRO_PAGES.length) showNameEntry();
    }
  }

  function handleTitle() {
    if (consume("up")) menuIndex = (menuIndex + 2) % 3;
    if (consume("down")) menuIndex = (menuIndex + 1) % 3;
    if (consume("ok")) {
      if (menuIndex === 0) beginIntro();
      else if (menuIndex === 1) {
        if (loadGame()) {
          hideNameEntry();
          showDialog(["Welcome back, " + game.name + "."].concat(objectiveLines()));
        } else beginIntro();
      } else mode = "help";
    }
  }

  function handleHelp() {
    if (consume("ok") || consume("cancel")) mode = "title";
  }

  function handleDialog() {
    if (consume("ok") || consume("cancel")) {
      dialogPage += 1;
      if (dialogPage >= dialog.length) {
        dialog = [];
        mode = "play";
      }
    }
  }

  function handleMenu() {
    if (consume("up")) menuIndex = (menuIndex + 4) % 5;
    if (consume("down")) menuIndex = (menuIndex + 1) % 5;
    if (consume("cancel")) mode = "play";
    if (consume("ok")) {
      if (menuIndex === 3) {
        saveGame();
        saveNote = 90;
        mode = "play";
      } else if (menuIndex === 4) mode = "play";
    }
  }

  function handlePlay() {
    if (consume("ok")) tryInteract();
    if (consume("cancel")) { /* no-op */ }
    movePlayer();
    moveKeeper();
  }

  function handleBattle() {
    const b = battle;
    if (!b) return;
    if (b.phase === "intro") {
      if (consume("ok")) b.phase = "command";
      return;
    }
    if (b.phase === "playerLog") {
      if (consume("ok")) {
        enemyTurn();
        if (b.phase === "playerLog") b.phase = "command";
      }
      return;
    }
    if (b.phase === "lost" || b.phase === "wipe" || b.phase === "done") {
      if (consume("ok")) endBattle();
      return;
    }
    if (b.phase === "photo") {
      if (consume("ok")) finishPhoto();
      return;
    }
    if (b.phase === "command") {
      if (consume("up") || consume("down")) b.cursor = (b.cursor + 2) % 4;
      if (consume("left") || consume("right")) b.cursor = b.cursor ^ 1;
      if (consume("ok")) {
        if (b.cursor === 0) reelFish();
        else if (b.cursor === 1) slackLine();
        else if (b.cursor === 2) trySnap();
        else endBattle();
      }
    }
  }

  function update() {
    tick += 1;
    if (walkLock > 0) walkLock -= 1;
    if (flash > 0) flash -= 1;
    if (saveNote > 0) saveNote -= 1;

    if (mode === "title") handleTitle();
    else if (mode === "intro") handleIntro();
    else if (mode === "name") { /* HTML name field */ }
    else if (mode === "help") handleHelp();
    else if (mode === "dialog") handleDialog();
    else if (mode === "menu") handleMenu();
    else if (mode === "play") handlePlay();
    else if (mode === "battle") handleBattle();

    just.ok = false;
    just.cancel = false;
    just.up = false;
    just.down = false;
    just.left = false;
    just.right = false;
    just.menu = false;
  }

  function render() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    if (mode === "title" || mode === "name") drawTitle();
    else if (mode === "intro") drawIntro();
    else if (mode === "help") drawHelp();
    else if (mode === "dialog") drawDialog();
    else if (mode === "menu") drawMenu();
    else if (mode === "battle") drawBattle();
    else drawOverworld();
    if (flash > 0) {
      ctx.fillStyle = "rgba(200,40,40," + (flash / 18) + ")";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
  }

  function loop() {
    update();
    render();
    requestAnimationFrame(loop);
  }

  loop();
})();
