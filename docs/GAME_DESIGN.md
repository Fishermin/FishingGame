# Derek's Fishing Quest — Game Design Document

A plan for turning Derek's Fishing Game from a 10-cast score trip into a
Pokemon-style freshwater RPG: explore a watershed, battle fish, capture a
field guide's worth of species, and earn gear by living through the story.

This document is the build contract. Existing trip modes
(`fishingtrip.html`, `fishingtrail.html`, `DereksGame.sh`) stay playable as
arcade side modes. The new campaign is a separate game that reuses their
tone, fish names, weather, bait jokes, and Derek.

---

## 1. Pitch

You are a junior angler who inherits a warped spinning rod and a coffee-can
livewell. The watershed's fishing clubs run a circuit the way old Pokemon
leagues ran gyms. Wild fish are fought and captured. Rival anglers duel you
with the champions in their livewells. Permits, rods, and skills are not
purchased from a full catalog — they are the natural result of the situations
you get into.

**Working title:** Derek's Fishing Quest
**Genre:** 16-bit overworld RPG + turn-based battles + collection
**Platform:** Browser (GitHub Pages), keyboard + gamepad, later touch
**Look:** Super Nintendo / Game Boy Color era pixel art, not modern UI
**Tone:** Midwest lakeside humor from the current game, plus a real story

The Pokemon analog is structural, not a clone. No monsters-in-orbs branding.
The mapping is:

| Old Pokemon structure | This game |
| --- | --- |
| Towns, routes, water tiles | Landings, creeks, lakes, backwaters |
| Wild encounter | Cast into a water tile |
| Trainer battle | Rival / club angler livewell duel |
| Gym | Regional fishing club + its water |
| Badge | Club pin + a permit that opens new water |
| Pokedex | Field Guide |
| Party of 6 | Livewell of 6 |
| PC boxes | Holding pond at home camp |
| Pokeballs | Nets (catch rate + fish size gates) |
| HMs | Angler skills earned from scenarios |
| Team Rocket | The Snag Crew (illegal netters) |
| Legendaries | River monsters tied to story |

---

## 2. Design pillars

1. **Hook, fight, keep.** Every wild fish is a battle. Landing it is a capture.
2. **Freshwater first.** A large North American inland roster, starting from
   the 20 species already in the trip game and growing to 70+ catchable fish.
3. **Story is the map.** New water, tools, and skills come from arcs, not from
   grinding a shop.
4. **Readable 16-bit.** SNES-era sprites, tilemaps, and battle chrome. If it
   would not fit on a 1994 cartridge box, cut it.
5. **The trip game's soul.** Weather, bait theater, Derek, ridiculous miss
   lines, Bullhead/Sheepshead luck — they belong in the RPG, not only in the
   arcade modes.

---

## 3. What already exists

The repo already has a complete arcade loop:

- 10 casts, weather factor, bait/lure choice, size tiers, point score
- Twenty freshwater species with length factors and rarity tiers
- A modern lakeside edition and a 1980s Trail edition
- Local high scores, Derek as partner, cut-bait risk/reward

**Reuse as systems, not as the whole game:**

- Weather chips become overworld time-of-day and encounter tables
- Bait and lure lists become encounter filters and held items
- Miss narratives become failed captures and overworld events
- Bullhead / Sheepshead free-cast becomes a real Field Guide perk
- High-score ledger becomes optional derby mode after clubs

Do not replace the trip games. Link them from the title screen as
"Quick Trip" and "The Fishing Trail."

---

## 4. Player fantasy and core loop

You walk a pixel-art watershed. At any water's edge you can cast. A bite
opens a battle screen. You fight with the fish already in your livewell.
When the wild fish's stamina is low, you throw a net. Caught fish go into
the livewell or the Field Guide / holding pond.

Between casts you talk to people, take on arcs, and travel to the next
club water. Clubs are story dungeons: a unique habitat, a warden, a
required permit, and a duel against the club champion.

```
Camp → walk the bank → cast
        → HOOK BATTLE vs wild fish
        → net capture or it breaks off
        → livewell / Field Guide update
        → town talk / story beat
        → club duel vs rival angler
        → pin + permit + a tool or skill
        → new region
```

A session should always produce one of: a new fish, a story beat, or a
piece of kit. Empty grinding loops are a design bug.

---

## 5. Combat — Pokemon-shaped, fishing-flavored

### 5.1 Two battle contexts, one ruleset

Both use the same turn-based engine and the same fish stats.

**Wild hook battle.** You vs a wild fish. Winning by KO is allowed, but
capture requires a net throw while the fish still has stamina. KO with no
net is a lost specimen (it sinks away). This makes nets matter.

**Livewell duel.** A rival angler sends fish from their livewell. You send
yours. Standard 1v1 with switches. No capturing the opponent's fish.
Win the match, not the specimen.

Boss fish (club legends, river monsters) are wild battles with unique
move sets and a scripted capture or release ending.

### 5.2 Screen layout (16-bit)

SNES Pokemon battle chrome, fishing-skinned:

- Top: habitat background (pond dawn, stained slough, rapids, ice hole)
- Wild / foe fish sprite facing left, name, level, stamina bar
- Player fish sprite facing right, name, level, stamina + XP bar
- Bottom text box: 2×2 commands

Commands: `FIGHT` · `LIVEWELL` · `NET` · `RUN`

Fight opens the four moves on the active fish. Net is grayed out in duels.
Run is easier in wild battles if your fish's Dart is higher; club duels
forbid it.

### 5.3 Stats

Each fish has six battle stats plus a hidden catch stat:

| Stat | Role |
| --- | --- |
| Stamina | Hit points |
| Pull | Physical attack (strikes, shakes) |
| Hold | Physical defense |
| Dart | Speed / turn order / run chance |
| Wile | Special attack (silt, flash, scent) |
| Grit | Special defense |
| Slip | Hidden. Lowers catch rate. Gar and eels are high Slip. |

Levels 1–50 for normal play, 50–70 postgame. Wild levels follow the region.

### 5.4 Types

Eight types. Dual-types are common. Super-effective is 1.6× (not 2×) so
early fish stay usable. Not-very-effective is 0.6×.

| Type | Flavor | Examples |
| --- | --- | --- |
| Fang | Ambush predators | Pike, musky, walleye, bass |
| Sun | Warm, sight-feeding panfish | Bluegill, crappie, perch |
| Stone | Bottom, barbels, armor-adjacent | Catfish, buffalo, redhorse |
| Swift | Current and open water | Smallmouth, trout, white bass |
| Weed | Cover, pads, timber | Largemouth, pickerel, bowfin |
| Night | Stained water, after dark | Bullhead, burbot, eel |
| Scale | Thick hide, plates, primitive | Gar, sturgeon, drum, paddlefish |
| Cold | North, deep, ice | Lake trout, whitefish, cisco, burbot |

Effectiveness (attacker → defender). Blank = 1.0.

| ↓ atk \ def → | Fang | Sun | Stone | Swift | Weed | Night | Scale | Cold |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Fang |  | 1.6 |  | 0.6 | 1.6 | 0.6 | 0.6 |  |
| Sun | 0.6 |  | 1.6 |  |  | 1.6 |  | 0.6 |
| Stone |  |  |  | 1.6 | 0.6 |  | 1.6 | 1.6 |
| Swift | 1.6 |  | 0.6 |  | 1.6 |  |  | 0.6 |
| Weed | 0.6 | 1.6 | 1.6 | 0.6 |  |  |  |  |
| Night | 1.6 | 0.6 |  |  |  |  | 1.6 | 1.6 |
| Scale | 1.6 |  | 0.6 |  | 1.6 | 0.6 |  |  |
| Cold |  | 1.6 | 0.6 | 1.6 |  | 0.6 |  |  |

### 5.5 Moves

Every fish has at most four moves. Moves are learned by level, by club
tutors, and by a few story items (old lures that teach a technique).

Families:

- **Strike** — Pull damage (Charge, Hammer Handle, Topwater Blow)
- **Shake** — chance to flinch (Tailwalk, Headshake)
- **Foul** — Wile damage + stage drops (Silt Cloud, Ink of the Slough)
- **Cover** — raise Hold/Grit (Weed Wrap, Lay Up)
- **Current** — Dart buff or priority (Ride the Seam, Tail Dart)
- **Night** — accuracy games (False Bite, After-Dark)
- **Hook** — status: Bleed Line (residual), Thrown Hook (can't net this turn)

Signature examples: Musky gets *Figure-Eight*. Sturgeon gets *River Plate*.
Bluegill gets *Nest Guard*. Burbot gets *Eelpout Stare*.

### 5.6 Capture math

On the NET command, catch chance is roughly:

```
chance = netPower * (1 - stamina% * 0.7) * (1 - slip)
          * anglerSkill * baitMatch
          * sizeGate
```

`sizeGate` is 0 if the fish's length class exceeds the current net/livewell.
A coffee-can livewell cannot hold a lake sturgeon. That is a story beat,
not a tooltip buried in a shop.

Failed nets play miss lines from the trip game (pelican, pontoon, snapping
turtle, Derek knocks it off with the net). Three failures in one battle and
the fish breaks off.

Catch-and-release is always offered after a successful land. Release still
fills the Field Guide and can award a conservation token used in the
pollution arc.

---

## 6. Field Guide — the freshwater roster

Target: **72 regular species + 5 river monsters = 77**. All freshwater.
Midwest core first (the current 20), then the rest of the inland map.

Starter pool (player chooses one, rival takes a type-advantage neighbor):

| Starter | Type | Why |
| --- | --- | --- |
| Bluegill | Sun | The fish everyone actually starts with |
| Bullhead | Night / Stone | Joke fish of the trip game, secretly tough |
| Largemouth Bass | Fang / Weed | The poster fish |

Derek always starts with the one that beats yours, then later shows up
with a Musky he "definitely meant to catch."

Rarity bands: Common, Uncommon, Rare, Trophy, Legend. Trophy fish are
regional; Legends are story-locked.

Full species tables live in [`docs/field-guide.md`](field-guide.md) and
machine-readable stats in [`data/fish-dex.json`](../data/fish-dex.json).

Encounter rules that keep variety real:

- Bait and lure **change the table**, they do not only add flavor text
- Time of day matters (Night types after dusk, Cold types in winter)
- Weather from the trip game modifies bite rate and which table is used
- Some species exist only in one club water on purpose

---

## 7. World — eight waters, one watershed

The map is one connected drainage, read south to north like a Pokemon
region. Each water is a "gym town" plus routes.

| # | Water | Habitat | Club champion theme | Permit you earn |
| --- | --- | --- | --- | --- |
| 0 | Home Camp / Cattail Pond | Weedy farm pond | Tutorial with Derek | Shore license |
| 1 | Milltown Reservoir | Warm reservoir | Bass club, docks, ski boats | Reservoir pin |
| 2 | Cedar Creek | Clear stream | Smallmouth and current | Creek walk pin |
| 3 | Stainwater Slough | Backwater, cypress, night | Catfish club, lanterns | Night permit |
| 4 | Granite Rapids | Cold tailwater | Fly shop wardens | Fly water pin |
| 5 | Big River Bend | Wide river, barges | Drum, buffalo, sturgeon | Big-river pin |
| 6 | Northwoods Chain | Lakes, weeds, ice | Musky club, then freeze-up | Ice house pin |
| 7 | Harbor of Champions | Mixed Great Lakes mouth | All types, gauntlet | Circuit cup |

Overworld scale: SNES 16×16 tiles, 256×224 camera, pixel-perfect integer
scale. Towns are small. Routes are banks, bridges, cuts, and one boat
crossing that you cannot take until the landing is repaired.

---

## 8. Story arcs

The main spine is the River Circuit. Side arcs are not fetch quests; each
one leaves a tool, a skill, a fish, or a permanent map change.

### 8.1 Main spine — The Circuit

1. **The Warped Rod.** Inherit the rod. Catch the starter. Derek races you
   to the pond and loses on purpose, then does not.
2. **Milltown Open.** First club. Learn livewell duels. A ski boat (the
   trip game's pontooner) becomes a recurring hazard NPC.
3. **Pins and Permits.** Each club win is a pin *and* a legal reason to
   enter the next water. Wardens actually check.
4. **Harbor Gauntlet.** Four club champions plus Derek. End of the first
   loop, not the end of the game.

### 8.2 Villain arc — The Snag Crew

Illegal netters in stained coveralls. They drain a hole, spike a livewell,
and try to sell a tagged brood musky. You stop them with club wardens.
Payoff: the **conservation net** (high catch, forces a release option) and
the **Cut the Mesh** skill (escape from overworld snare tiles).

This is the Team Rocket analog, written as a fishing crime, not a cartoon
mafia.

### 8.3 The river is sick

A paper mill (or old dump) upstream turns Granite Rapids milky. Cold-water
fish vanish from the table. You sample water, ferry evidence, and a club
vote follows. Payoff: **Read Stain** skill (see polluted tiles) and the
return of brook trout to the encounter table. Optional bad ending if you
side with the mill for cheap gear — those lures work, but the Field Guide
in that water stays broken.

### 8.4 Derek's fish that got away

Derek will not talk about a jump at dusk on the Northwoods Chain. The arc
unlocks after club 6. Payoff: the river monster **Old Copper** (Fang/Weed
musky) and Derek as a postgame partner who can sit in the overworld boat.

### 8.5 Lost lure of Milltown

A named Rapala in a tree, visible from the first visit, unreachable until
you have **Walk the Gunwale** (boat skill). Payoff: a held item that boosts
Swift moves, plus a Field Guide page on the original lure colors from the
trip game.

### 8.6 Ice Moon Derby

Northwoods freezes. You cannot fish open water. The ice house pin is
earned by surviving a night event (whiteout, stove, a burbot under the
hole). Payoff: ice rod, **Jig in the Dark** skill, Cold-type encounter
table, and the monster **Ice-Eye**.

### 8.7 The Dam Keepers

Big River Bend will not let you below the dam without a keeper's blessing.
You run messages, then a choice: help blast a logjam (opens sturgeon
spawning tiles) or leave it (protects a rare redhorse). Either way you get
the **Heavy Rod** and a different Legend path.

### 8.8 Catch and keep

A warden's kid wants you to keep everything. A retired fly angler wants
you to keep nothing. The game tracks a quiet Conservation score. High
score unlocks the **Honor Net** and a Field Guide ribbon. Low score unlocks
easier trophy encounters and a colder ending with the Snag Crew.

### 8.9 Smaller bankside arcs

Each should be one sitting, one reward:

- **Pelican Tax** — the trip-game pelican. Scare it off, earn a hat that
  slightly raises wild run-away chance (it bothers the bird, not you).
- **Rizzo, Get Back Here** — named pets from the trip game as NPCs. Return
  them, earn a spare net attempt in wild battles.
- **Hook Protector** — a green angler never catches. Teach them. Earn
  **Check the Knot** (critical hits can no longer snap your own line).
- **Bull & Mutton** — catch a Bullhead and a Sheepshead in the same day,
  recreate the free-cast joke as a real extra livewell swap in the next
  duel.
- **Snapping Turtle Stone** — a stone-type tutor move, after you free a
  turtle instead of stealing the lure.
- **The Night Bite** — stay out after the town closes. Unlocks Night
  encounters on waters that were Sun-only.

### 8.10 River monsters (legendaries)

Story-locked, one per late water. Not random shiny chases.

| Name | Water | Types | How you meet them |
| --- | --- | --- | --- |
| Cattail King | Pond, postgame | Fang / Weed | Record largemouth after Field Guide 20 |
| Redfin Widow | Granite Rapids | Cold / Swift | After the river is cleaned |
| The Dam Ghost | Big River | Scale / Stone | Albino sturgeon under the spillway |
| Old Copper | Northwoods | Fang / Weed | Derek's dusk jump |
| Ice-Eye | Frozen chain | Cold / Night | Ice Moon Derby hole |

---

## 9. Progression — tools, skills, assets

Nothing important is sitting in a store with a price tag on day one. Shops
sell consumables (line, spare hooks, coffee, bait). The kit that changes
how you play is earned.

### 9.1 Tools (equipment slots)

Slots: Rod, Reel, Line, Net, Vessel, Livewell, Held lure.

| Tool | How you get it | What it changes |
| --- | --- | --- |
| Warped spinning rod | Opening | Short casts, pond + creek only |
| Milltown baitcaster | Beat bass club | Reservoir distance, heavier lures |
| Creek wand | Help the Cedar fly kid *before* you own a fly rod | Accuracy in current tiles |
| Fly rod | Granite Rapids warden, after you repair the hut | Fly water encounters |
| Heavy river rod | Dam Keepers | Size gate for sturgeon / blue cat |
| Ice rod | Ice Moon Derby | Frozen tiles become fishable |
| Hand net | Start | Small fish only |
| Landing net | Milltown dockhand, after you return a spilled tackle box | Medium size gate |
| Rubber trophy net | Northwoods club | Large size gate, gentler Slip penalty |
| Conservation net | Stop the Snag Crew | Best catch rate, release prompt |
| Coffee-can livewell | Start | 3 fish, tiny size cap |
| Dock cooler | Reservoir pin | 4 fish |
| Boat livewell | Repair the landing | 6 fish, standard party |
| Holding pond | Home camp, after 12 Field Guide entries | Storage boxes |
| Rowboat | Landing repair arc | Cross cuts, gunwale skill |
| Ice house | Ice pin | Northwoods winter hub |

Line ratings are a soft size gate: 6 lb on a musky is a story loss, not a
soft lock, if you have not earned heavier gear.

### 9.2 Skills (angler, not fish)

Skills are the HM analog. They are learned in scenes and then available on
the overworld or as a battle passive.

| Skill | Earned from | Use |
| --- | --- | --- |
| Read the Seam | Cedar Creek old-timer | See hidden current encounter tiles |
| Set the Hook | First club loss to Derek, then a rematch lesson | +catch on the turn after a crit |
| Drag Control | Milltown ski-boat rescue | Wild fish with high Pull no longer auto-snap |
| Night Eyes | Stainwater lantern walk | Towns and banks stay walkable after dark |
| Fly Presentation | Granite hut | Required to even hook some Cold/Swift fish |
| Walk the Gunwale | First boat trip | Reach island trees / lost lure |
| Cut the Mesh | Snag Crew | Clear net traps on the map |
| Read Stain | Pollution arc | Polluted water is visible and avoidable |
| Jig in the Dark | Ice Moon | Ice-hole battles, Cold table |
| Check the Knot | Hook Protector arc | Stops self-crit line snaps |
| Honor Release | Conservation path | Extra Field Guide XP on release |

You cannot skip the scene and buy the skill.

### 9.3 Assets that are not gear

- **Club pins** — story keys
- **Permits** — warden checks
- **Field Guide pages** — completion ribbons, not just a %, unlock postgame
- **Conservation tokens** — currency for the pollution vote and Honor Net
- **Named lures** — held items with histories from the existing lure list
- **Derek** — later, a guest in the boat who can net for you once per wild
  battle (and still knock one off, because of course)

XP goes to fish. Reputation goes to the angler and gates which NPCs will
talk. Reputation is earned by finishing arcs, not by grinding the same
weed bed.

---

## 10. Art and sound — 8/16-bit Nintendo

**Target look:** Super Nintendo outdoor RPGs (EarthBound towns, Pokemon
Gold/Silver overworld, Link's Awakening DX color) with Game Boy battle
readability.

Rules:

- Internal resolution **256×224**, integer scale only (`image-rendering:
  pixelated`). No fractional camera scroll.
- Overworld tiles **16×16**. Player sprite **16×16** walk, **16×32** on
  the boat.
- Fish battle sprites **48×48** typical, **64×64** river monsters, 2-frame
  idle, 1 lunge frame.
- Four-to-six color ramps per sprite. No photo textures, no drop shadows,
  no modern card UI.
- Text boxes: 8×8 pixel font, 2-line dialogue, Pokemon-style arrow.
- Battle menus: 2×2, chunky, high contrast.
- Habitats get unique palettes (pond green, slough tea-brown, rapids
  granite, ice blue-gray). Same tile shapes, swapped ramps — a 16-bit
  trick, not a new tileset every town.
- Title screen can homage the Trail edition CRT, then snap to SNES color
  when you pick Quest.

**Audio:** Square/triangle/noise chiptune. A bank theme, a wild battle
sting, a club duel theme, a night slough theme, a quiet ice theme. Keep
the trip game's humor in jingles (a sad tuba when Derek nets the air).

**Scope control:** One tileset, one player sprite, eight habitat palettes,
and fish sprites in batches of 10. Silhouettes before full color. A fish
with a strong silhouette and two frames beats a painted illustration.

---

## 11. Technical plan

Stay on GitHub Pages. No account server required for v1.

**Recommended stack**

- Phaser 3 (Arcade physics off; we need tilemaps and sprite scaling, not
  a physics sandbox)
- Tiled `.tmj` maps
- JSON data for fish, moves, encounters, dialogue
- `localStorage` saves (plus an export code)
- Existing trip HTML games left as static pages

**Why not the current single-file HTML for the RPG:** the quest will have
maps, a dex, and dialogue. One 1,200-line file will collapse. Keep the
trip games as they are; put the quest under `quest/`.

Proposed layout:

```
quest/
  index.html
  src/          boot, overworld, battle, ui, save
  data/         copies or imports of /data/*.json
  assets/       tiles, sprites, fonts, chiptune
docs/           this design
data/           fish-dex.json, moves.json (later)
```

**Save data:** Field Guide bits, livewell, holding pond, pins, skills,
story flags, clock, conservation score. Version the save from day one.

**Input:** arrows + Z/X (A/B), Enter. On-screen buttons only if they do
not break the 16-bit layout.

**Performance:** 60 fps at 4× scale on a laptop. No webGL filters.

---

## 12. Build phases

Ship a playable slice before a region, a region before a circuit, a
circuit before legendaries. Each phase should be fun alone.

### Phase 0 — Design (this PR)

Documents and a starter dex. No quest code yet.

### Phase 1 — Vertical slice

One screen of Cattail Pond. Walk, face water, cast, one wild battle,
catch a Bluegill, talk to Derek, save. 8 fish max. Placeholder tiles are
fine if the silhouette reads. **Exit test:** a stranger understands
FIGHT / NET / LIVEWELL without a manual.

### Phase 2 — Livewell duels + Field Guide UI

Derek rematch as a 2v2 duel. Field Guide pages for whatever you caught.
Holding pond at the camp shack. Starter choice.

### Phase 3 — Milltown Reservoir

First real map, first club, baitcaster, landing net, ski-boat NPC,
weather affecting tables. Link Quick Trip from the title screen.

### Phase 4 — Types, moves, and the first 30 fish

Type chart live. Tutors. Encounter tables by bait. Sprites for the
original 20 trip-game species plus 10 more.

### Phase 5 — Circuit waters 2–4

Cedar Creek, Stainwater Slough, Granite Rapids. Skills: Read the Seam,
Night Eyes, Fly Presentation. Snag Crew intro. Pollution arc start.

### Phase 6 — Circuit waters 5–7 and the Harbor

Big River, Northwoods, ice, gauntlet. Heavy rod, boat, ice house. Derek's
fish that got away. Five river monsters as optional at this point if the
slice is stable; otherwise stubs.

### Phase 7 — Full dex and remaining arcs

72 species, all bankside side arcs, conservation ending variants,
chiptune pass, sprite pass, derby-as-postgame using the old scoring math.

### Phase 8 — Polish

Pixel-perfect camera, colorblind type icons, gamepad, a Game Boy palette
mode as an option, Trail-edition CRT frame around the title only.

If a phase starts sliding, cut sprite count before cutting the capture
loop or the "gear comes from story" rule.

---

## 13. What we are explicitly not doing in v1

- Multiplayer or live tournaments
- Real-money anything
- Photoreal maps or 3D water
- Saltwater, sharks, or invented cartoon fish as the common roster
  (river monsters are the exception, and they are still fish)
- Open-world survival meters
- A shop that sells the fly rod on day one

---

## 14. Open decisions (defaults if nobody picks)

These are settled enough to build against. Change them in the doc before
changing the code.

| Question | Default |
| --- | --- |
| Fish vs fish, or angler vs fish on the line? | Fish vs fish for all battles; nets are the capture verb |
| Permadeath of caught fish? | No. Release is a choice. KO in a duel sends them to the livewell fainted |
| Starter | Bluegill / Bullhead / Largemouth |
| Livewell size | 3 → 4 → 6 |
| Level cap | 50 story, 70 postgame |
| Engine | Phaser 3 on GitHub Pages |
| Derek | Rival + later boat partner, never a silent oak in a lab |

---

## 15. Success bar

The quest is working when:

1. A player can name a fish they are hunting and know which water, bait,
   and time of day to try.
2. A club pin is remembered as a scene, not as a menu unlock.
3. The warped rod feeling is real: early tools cannot fake a late fish.
4. The screen looks like a cartridge game from ten feet away.
5. The trip game still exists, and its jokes still land inside the RPG.
