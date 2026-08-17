(function () {
  "use strict";

  const SAVE_KEY = "catchAndCraftQuestV1";
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

  // . fairway  , rough  w water  b bank  T tree  h hide  s sand  C club  p path
  const MAP_ROWS = [
    "TTTTTTTTTTTTTTTT",
    "TZCCCCCCCCCCCCCT",
    "T,,..........,,T",
    "T..............T",
    "T....ssss......T",
    "T..............T",
    "T,,..........,,T",
    "hhbb........bbhh",
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

  const keys = Object.create(null);
  const just = Object.create(null);

  let mode = "title";
  let tick = 0;
  let walkLock = 0;
  let keeperTimer = 0;
  let dialog = [];
  let dialogPage = 0;
  let flash = 0;
  let menuIndex = 0;
  let battle = null;
  let saveNote = 0;

  const game = {
    name: "Catch",
    worms: 0,
    warnings: 0,
    skills: { keepStill: false, dropALine: false, theNet: false },
    fieldGuide: {},
    livewell: [],
    loaner: null,
    talkedZippy: false,
    player: { c: 1, r: 7, facing: "down" },
    keeper: { c: 4, r: 4, facing: "right", pathI: 0 },
  };

  const KEEPER_PATH = [
    { c: 2, r: 3 },
    { c: 13, r: 3 },
    { c: 13, r: 6 },
    { c: 2, r: 6 },
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

  function fishable(c, r, facing) {
    const dc = facing === "left" ? -1 : facing === "right" ? 1 : 0;
    const dr = facing === "up" ? -1 : facing === "down" ? 1 : 0;
    if (tileAt(c, r) === "b" && (tileAt(c + dc, r + dr) === "w" || tileAt(c, r) === "b")) {
      return tileAt(c + dc, r + dr) === "w" || neighborsWater(c, r);
    }
    return neighborsWater(c, r) && tileAt(c, r) === "b";
  }

  function neighborsWater(c, r) {
    return ["w"].includes(tileAt(c + 1, r)) || ["w"].includes(tileAt(c - 1, r)) ||
      ["w"].includes(tileAt(c, r + 1)) || ["w"].includes(tileAt(c, r - 1));
  }

  function nearZippy() {
    const p = game.player;
    return Math.abs(p.c - 1) + Math.abs(p.r - 1) <= 2 && (p.r <= 2);
  }

  function chebyshev(a, b) {
    return Math.max(Math.abs(a.c - b.c), Math.abs(a.r - b.r));
  }

  function keeperSeesPlayer() {
    const p = game.player;
    const k = game.keeper;
    if (hiddenAt(p.c, p.r)) return false;
    const dist = chebyshev(p, k);
    if (dist > 4) return false;
    const t = tileAt(p.c, p.r);
    if (t === "T" || t === "C") return false;
    return t === "." || t === "," || t === "s" || t === "b" || t === "p";
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
    const roll = Math.random();
    if (roll < 0.28) return POND_FISH[0];
    if (roll < 0.46) return POND_FISH[1];
    if (roll < 0.6) return POND_FISH[2];
    if (roll < 0.72) return POND_FISH[5];
    if (roll < 0.82) return POND_FISH[3];
    if (roll < 0.9) return POND_FISH[7];
    if (roll < 0.97) return POND_FISH[4];
    return POND_FISH[6];
  }

  function partyFighters() {
    const list = [];
    if (game.loaner && !game.loaner.fainted) list.push(game.loaner);
    game.livewell.forEach((f) => list.push(f));
    return list.filter((f) => f.hp > 0);
  }

  function activeFighter() {
    const p = partyFighters();
    return p[0] || null;
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

  function spotted() {
    game.warnings += 1;
    flash = 12;
    const lines = [
      "GROUNDSKEEPER: Hey! This is a golf course, not a landing!",
      "GROUNDSKEEPER: Keep your line out of my water hazard!",
    ];
    if (game.warnings >= 3) {
      lines.push("He storms toward the 7th green, still yelling.");
      lines.push("Zippy hisses from the trees: Lay low. He'll loop back.");
      game.warnings = 0;
    } else {
      lines.push("You dive into the cattails.");
    }
    game.player.c = 1;
    game.player.r = 7;
    game.player.facing = "down";
    if (hiddenAt(game.player.c, game.player.r) && !game.skills.keepStill) {
      game.skills.keepStill = true;
      lines.push("You learned KEEP STILL!");
      lines.push("Cattails break his line of sight.");
    }
    showDialog(lines);
  }

  function talkZippy() {
    if (!game.talkedZippy) {
      game.talkedZippy = true;
      game.worms = 5;
      game.loaner = makeFighter(SHINER, 5, true);
      showDialog([
        "A man in a faded cap is somehow running a bait shop in the trees.",
        "ZIPPY: Keep your voice down. I sell the good stuff.",
        "ZIPPY: Worms. Don't ask where.",
        "ZIPPY: Take this shiner. You'll need a fish in the can.",
        "ZIPPY: If the groundskeeper sees you, hide in the cattails.",
        "Got 5 WORMS and a loaner GOLDEN SHINER.",
      ]);
      return;
    }
    const opts = [
      "ZIPPY: He's not keen on anglers. I noticed.",
      "ZIPPY: Worms are on the house while that guy watches the fairway.",
    ];
    game.worms = Math.max(game.worms, 5);
    if (game.loaner && game.loaner.hp <= 0) {
      game.loaner.hp = game.loaner.maxHp;
      game.loaner.fainted = false;
      opts.push("ZIPPY: I floated your shiner. Don't make a habit of it.");
    }
    opts.push("Your worms are topped off. Progress saved.");
    saveGame();
    saveNote = 90;
    showDialog(opts);
  }

  function startBattle() {
    if (game.worms <= 0) {
      showDialog(["You're out of worms.", "Someone is rustling in those trees..."]);
      return;
    }
    if (!activeFighter()) {
      showDialog(["The coffee-can is empty.", "Zippy might float you a fish."]);
      return;
    }
    if (keeperSeesPlayer()) {
      spotted();
      return;
    }
    game.worms -= 1;
    const wildSp = pickWild();
    const wildLv = 2 + Math.floor(Math.random() * 4);
    battle = {
      phase: "intro",
      cursor: 0,
      sub: 0,
      wild: makeFighter(wildSp, wildLv, false),
      mine: activeFighter(),
      log: "A wild " + wildSp.name + " splashed at hole 9!",
      netFails: 0,
      closed: false,
    };
    mode = "battle";
    if (!game.skills.dropALine) {
      game.skills.dropALine = true;
      battle.log = "You learned DROP A LINE! A wild " + wildSp.name + " splashed!";
    }
  }

  function damageFor(attacker, defender, power, special) {
    const atk = special ? attacker.wile : attacker.pull;
    const def = special ? defender.grit : (defender.hold * (1 + defender.holdStage * 0.2));
    const mod = typeMultiplier(attacker.types, defender.types);
    const swing = 0.85 + Math.random() * 0.15;
    return Math.max(2, Math.round((power * atk) / Math.max(8, def) * mod * swing));
  }

  function afterFaintCheck() {
    if (battle.wild.hp <= 0) {
      battle.phase = "lost";
      battle.log = "The " + battle.wild.name + " sank away. No net, no fish.";
      return;
    }
    if (battle.mine.hp <= 0) {
      battle.mine.fainted = true;
      const next = activeFighter();
      if (!next) {
        battle.phase = "wipe";
        battle.log = "The coffee-can is quiet. You have to RUN.";
      } else {
        battle.mine = next;
        battle.log = "Go, " + next.name + "!";
        battle.phase = "command";
      }
    }
  }

  function enemyTurn() {
    const w = battle.wild;
    const m = battle.mine;
    const power = 28 + Math.floor(Math.random() * 18);
    const dmg = damageFor(w, m, power, Math.random() < 0.3);
    m.hp = Math.max(0, m.hp - dmg);
    battle.log = "Wild " + w.name + " thrashed for " + dmg + "!";
    afterFaintCheck();
    if (battle.phase === "playerLog") battle.phase = "command";
  }

  function playerMove(kind) {
    const m = battle.mine;
    const w = battle.wild;
    if (kind === "cover") {
      m.holdStage = Math.min(3, m.holdStage + 1);
      battle.log = m.name + " used Lay Up! Hold rose.";
    } else {
      const special = kind === "sig";
      const power = kind === "sig" ? 50 : kind === "shake" ? 32 : 40;
      const dmg = damageFor(m, w, power, special);
      w.hp = Math.max(0, w.hp - dmg);
      const label = kind === "sig" ? m.species.signature : kind === "shake" ? "Headshake" : "Strike";
      const extra = typeMultiplier(m.types, w.types);
      battle.log = m.name + " used " + label + "! " + dmg + " pull.";
      if (extra > 1.05) battle.log += " It bit deep!";
      if (extra < 0.95) battle.log += " A dull hit.";
    }
    if (w.hp <= 0) {
      battle.phase = "lost";
      battle.log += " It rolled over. Too late to net.";
      return;
    }
    battle.phase = "playerLog";
  }

  function tryNet() {
    const w = battle.wild;
    if (w.hp <= 0) {
      battle.log = "Nothing left to land.";
      return;
    }
    if (w.species.lengthFactor > 28) {
      battle.netFails += 1;
      battle.log = "The " + w.name + " is too big for a hand net. It broke off.";
      battle.phase = "lost";
      return;
    }
    const stamPct = w.hp / w.maxHp;
    let chance = 0.42 * (1 - stamPct * 0.7) * (1 - w.slip / 120);
    if (w.species.lengthFactor > 20) chance *= 0.45;
    if (Math.random() < chance) {
      landFish(w);
    } else {
      battle.netFails += 1;
      const misses = [
        "The groundskeeper's cart horn startles you. Slack!",
        "It jumped and threw the hook.",
        "Zippy almost cheers. You almost drop the rod.",
        "Weeds. Just weeds. Then not weeds. Then gone.",
      ];
      battle.log = misses[Math.floor(Math.random() * misses.length)];
      if (battle.netFails >= 3) {
        battle.log += " Line snaps. It is gone.";
        battle.phase = "lost";
      } else {
        battle.phase = "playerLog";
      }
    }
  }

  function landFish(w) {
    const caught = makeFighter(w.species, w.level, false);
    caught.hp = Math.max(1, Math.round(caught.maxHp * 0.7));
    game.fieldGuide[w.species.id] = true;
    const canKeep = game.livewell.length < 3;
    battle.phase = "catch";
    battle.caught = caught;
    battle.canKeep = canKeep;
    battle.log = "You landed a Lv" + w.level + " " + w.name + "!";
    if (!game.skills.theNet) {
      game.skills.theNet = true;
      battle.log += " You learned THE NET!";
    }
    battle.sub = canKeep ? 0 : 1;
  }

  function finishCatch(keep) {
    if (keep && battle.canKeep) {
      game.livewell.push(battle.caught);
      battle.log = battle.caught.name + " went in the coffee-can.";
    } else {
      battle.log = "Released. The Field Guide still remembers.";
    }
    battle.phase = "done";
  }

  function endBattle() {
    battle = null;
    mode = "play";
    if (keeperSeesPlayer()) spotted();
  }

  function saveGame() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        name: game.name,
        worms: game.worms,
        warnings: game.warnings,
        skills: game.skills,
        fieldGuide: game.fieldGuide,
        livewell: game.livewell,
        loaner: game.loaner,
        talkedZippy: game.talkedZippy,
        player: game.player,
        keeper: game.keeper,
      }));
    } catch (err) { /* ignore */ }
  }

  function loadGame() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      Object.assign(game, data);
      return true;
    } catch (err) {
      return false;
    }
  }

  function newGame() {
    game.name = "Catch";
    game.worms = 0;
    game.warnings = 0;
    game.skills = { keepStill: false, dropALine: false, theNet: false };
    game.fieldGuide = {};
    game.livewell = [];
    game.loaner = null;
    game.talkedZippy = false;
    game.player = { c: 1, r: 7, facing: "down" };
    game.keeper = { c: 4, r: 4, facing: "right", pathI: 0 };
    showDialog([
      "VALLEYBROOK POND",
      "Valleybrook Golf Course, hole 9.",
      "You are Catch. The pond is full of panfish.",
      "The groundskeeper is not keen on people fishing his course.",
      "Stay in the cattails. Someone is whispering from the trees.",
    ]);
  }

  window.addEventListener("keydown", (e) => {
    const map = {
      ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
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
    if (!keys[k]) just[k] = true;
    keys[k] = true;
  });
  window.addEventListener("keyup", (e) => {
    const map = {
      ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
      z: "ok", Z: "ok", Enter: "ok",
      x: "cancel", X: "cancel", Shift: "cancel",
    };
    const k = map[e.key];
    if (k) keys[k] = false;
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
    if (nearZippy()) {
      talkZippy();
      return;
    }
    if (fishable(game.player.c, game.player.r, game.player.facing) || tileAt(game.player.c, game.player.r) === "b") {
      if (!game.talkedZippy) {
        showDialog(["You need bait first.", "Leaves are moving in the trees by the clubhouse."]);
        return;
      }
      startBattle();
      return;
    }
    showDialog(["Hole 9. Keep off the fairway if you can help it."]);
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
    game.player.c = nc;
    game.player.r = nr;
    walkLock = 8;
    if (hiddenAt(nc, nr) && keeperSeesPlayer() === false && chebyshev(game.player, game.keeper) <= 5 && !game.skills.keepStill) {
      // standing in cattails near him
      if (chebyshev(game.player, game.keeper) <= 4) {
        learnSkill("keepStill", "KEEP STILL", "He looked right past the cattails.");
        showDialog(dialog);
      }
    }
    if (keeperSeesPlayer()) spotted();
  }

  function moveKeeper() {
    keeperTimer += 1;
    if (keeperTimer < 22) return;
    keeperTimer = 0;
    const k = game.keeper;
    const dest = KEEPER_PATH[k.pathI];
    if (k.c === dest.c && k.r === dest.r) {
      k.pathI = (k.pathI + 1) % KEEPER_PATH.length;
    }
    const next = KEEPER_PATH[k.pathI];
    if (next.c > k.c) { k.c += 1; k.facing = "right"; }
    else if (next.c < k.c) { k.c -= 1; k.facing = "left"; }
    else if (next.r > k.r) { k.r += 1; k.facing = "down"; }
    else if (next.r < k.r) { k.r -= 1; k.facing = "up"; }
    if (mode === "play" && keeperSeesPlayer()) spotted();
  }

  function fitCanvas() {
    const s = Math.max(2, Math.floor(Math.min((window.innerWidth - 32) / WIDTH, (window.innerHeight - 80) / HEIGHT)));
    canvas.style.width = WIDTH * s + "px";
    canvas.style.height = HEIGHT * s + "px";
  }
  window.addEventListener("resize", fitCanvas);
  fitCanvas();

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
    text("VALLEYBROOK", 4, 2, "#f0e0a0", 8);
    text("W" + game.worms, 140, 2, "#f8f0d8", 8);
    text("CAN " + game.livewell.length + "/3", 176, 2, "#f8f0d8", 8);
    if (saveNote > 0) text("SAVED", 216, 2, "#70f070", 8);
  }

  function drawOverworld() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) drawTile(c, r);
    }
    drawPerson(game.keeper.c, game.keeper.r, "keeper", game.keeper.facing);
    drawPerson(1, 1, "zippy", "down");
    drawPerson(game.player.c, game.player.r, "player", game.player.facing);
    if (nearZippy() && tick % 40 < 20) {
      text("!", 18, 8, "#f0e0a0", 8);
    }
    drawHud();
    if (mode === "play") {
      drawBox(8, HEIGHT - 36, WIDTH - 16, 28);
      wrapText("Hole 9. Z: talk / fish   cattails hide you", 14, HEIGHT - 30, 26, "#203018");
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
    const m = battle.mine;
    drawFish(w, 186, 52, true);
    drawBox(8, 12, 120, 40);
    text(w.name, 14, 16, "#203018", 8);
    text("Lv" + w.level, 14, 26, "#405838", 8);
    hpBar(14, 38, 100, w.hp, w.maxHp);
    if (m) {
      drawFish(m, 70, 128, false);
      drawBox(128, 108, 120, 44);
      text(m.name, 134, 112, "#203018", 8);
      text("Lv" + m.level + (m.loaner ? " LOAN" : ""), 134, 122, "#405838", 8);
      hpBar(134, 136, 100, m.hp, m.maxHp);
    }
    drawBox(8, HEIGHT - 64, WIDTH - 16, 56);
    if (battle.phase === "command") {
      wrapText(battle.log, 16, HEIGHT - 58, 16, "#203018");
      const labels = ["FIGHT", "LIVEWELL", "NET", "RUN"];
      labels.forEach((lab, i) => {
        const x = 148 + (i % 2) * 50;
        const y = HEIGHT - 58 + Math.floor(i / 2) * 16;
        text((battle.cursor === i ? ">" : " ") + lab, x, y, "#203018", 8);
      });
    } else if (battle.phase === "fight") {
      const moves = ["Strike", "Headshake", "Lay Up", m.species.signature];
      moves.forEach((lab, i) => {
        const y = HEIGHT - 58 + i * 12;
        text((battle.sub === i ? ">" : " ") + lab, 16, y, "#203018", 8);
      });
    } else if (battle.phase === "live") {
      const party = [];
      if (game.loaner) party.push(game.loaner);
      game.livewell.forEach((f) => party.push(f));
      if (!party.length) text("No other fish.", 16, HEIGHT - 50, "#203018", 8);
      party.forEach((f, i) => {
        const mark = f.hp <= 0 ? "X" : (battle.sub === i ? ">" : " ");
        text(mark + f.name + " HP" + f.hp, 16, HEIGHT - 58 + i * 10, "#203018", 8);
      });
    } else if (battle.phase === "catch") {
      wrapText(battle.log, 16, HEIGHT - 58, 26, "#203018");
      text((battle.sub === 0 ? ">" : " ") + "KEEP in coffee-can", 16, HEIGHT - 28, "#203018", 8);
      text((battle.sub === 1 ? ">" : " ") + "RELEASE", 16, HEIGHT - 18, "#203018", 8);
    } else {
      wrapText(battle.log, 16, HEIGHT - 50, 26, "#203018");
    }
  }

  function drawTitle() {
    px(0, 0, WIDTH, HEIGHT, "#1a3a28");
    for (let i = 0; i < 16; i++) px(i * 16, 140, 16, 84, i % 2 ? "#1a6a9a" : "#16384a");
    px(0, 120, WIDTH, 24, "#3cb043");
    text("CATCH AND CRAFT", 24, 24, "#f0e0a0", 8);
    text("VALLEYBROOK POND", 28, 42, "#f8f0d8", 8);
    text("Hole 9  ·  Golf Course", 28, 58, "#b8c8a8", 8);
    const items = ["Sneak onto the course", "Continue", "How to play"];
    items.forEach((lab, i) => {
      text((menuIndex === i ? ">" : " ") + lab, 28, 88 + i * 14, "#f8f0d8", 8);
    });
    text("Z confirm", 28, 200, "#8aa878", 8);
  }

  function drawHelp() {
    px(0, 0, WIDTH, HEIGHT, "#f8f0d8");
    text("HOW TO FISH", 16, 12, "#203018", 8);
    wrapText("Arrows move. Z talks, fishes, confirms. X backs out. Enter opens your pack.", 16, 32, 26, "#203018");
    wrapText("Hide in cattails. The groundskeeper will run you off the fairway.", 16, 72, 26, "#203018");
    wrapText("FIGHT weakens a fish. NET lands it. LIVEWELL swaps. RUN bolts.", 16, 112, 26, "#203018");
    wrapText("Zippy is in the trees by the clubhouse.", 16, 152, 26, "#203018");
    text("Z back", 16, 200, "#405838", 8);
  }

  function drawMenu() {
    drawOverworld();
    drawBox(72, 24, 176, 160);
    const items = ["FIELD GUIDE", "COFFEE-CAN", "SKILLS", "SAVE", "CLOSE"];
    items.forEach((lab, i) => {
      text((menuIndex === i ? ">" : " ") + lab, 84, 36 + i * 14, "#203018", 8);
    });
    const caught = Object.keys(game.fieldGuide).length;
    if (menuIndex === 0) {
      text(caught + "/8 pond fish", 84, 120, "#405838", 8);
      POND_FISH.forEach((f, i) => {
        const mark = game.fieldGuide[f.id] ? "*" : "-";
        if (i < 4) text(mark + f.name.slice(0, 10), 84, 134 + i * 10, "#203018", 8);
      });
    } else if (menuIndex === 1) {
      const names = game.livewell.map((f) => f.name);
      if (game.loaner) names.unshift(game.loaner.name + " (loan)");
      wrapText(names.join(", ") || "empty", 84, 120, 16, "#405838");
    } else if (menuIndex === 2) {
      text((game.skills.keepStill ? "*" : "-") + " Keep Still", 84, 120, "#203018", 8);
      text((game.skills.dropALine ? "*" : "-") + " Drop a Line", 84, 132, "#203018", 8);
      text((game.skills.theNet ? "*" : "-") + " The Net", 84, 144, "#203018", 8);
    } else if (menuIndex === 3) {
      text("Talk to Zippy to save,", 84, 120, "#405838", 8);
      text("or press Z here.", 84, 132, "#405838", 8);
    }
  }

  function handleTitle() {
    if (consume("up")) menuIndex = (menuIndex + 2) % 3;
    if (consume("down")) menuIndex = (menuIndex + 1) % 3;
    if (consume("ok")) {
      if (menuIndex === 0) newGame();
      else if (menuIndex === 1) {
        if (loadGame()) {
          mode = "play";
          showDialog(["Welcome back to hole 9, Catch."]);
        } else newGame();
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
    if (b.phase === "catch") {
      if (consume("up") || consume("down")) b.sub = b.sub ? 0 : 1;
      if (consume("ok")) finishCatch(b.sub === 0);
      return;
    }
    if (b.phase === "fight") {
      if (consume("up")) b.sub = (b.sub + 3) % 4;
      if (consume("down")) b.sub = (b.sub + 1) % 4;
      if (consume("cancel")) b.phase = "command";
      if (consume("ok")) {
        const kinds = ["strike", "shake", "cover", "sig"];
        playerMove(kinds[b.sub]);
      }
      return;
    }
    if (b.phase === "live") {
      const party = [];
      if (game.loaner) party.push(game.loaner);
      game.livewell.forEach((f) => party.push(f));
      if (consume("up")) b.sub = (b.sub + party.length - 1) % Math.max(1, party.length);
      if (consume("down")) b.sub = (b.sub + 1) % Math.max(1, party.length);
      if (consume("cancel")) b.phase = "command";
      if (consume("ok") && party[b.sub] && party[b.sub].hp > 0) {
        b.mine = party[b.sub];
        b.log = "Go, " + b.mine.name + "!";
        b.phase = "command";
      }
      return;
    }
    if (b.phase === "command") {
      if (consume("up") || consume("down")) b.cursor = (b.cursor + 2) % 4;
      if (consume("left") || consume("right")) b.cursor = b.cursor ^ 1;
      if (consume("ok")) {
        if (b.cursor === 0) { b.phase = "fight"; b.sub = 0; }
        else if (b.cursor === 1) { b.phase = "live"; b.sub = 0; }
        else if (b.cursor === 2) tryNet();
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
    if (mode === "title") drawTitle();
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
