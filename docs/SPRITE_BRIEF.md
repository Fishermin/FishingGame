# Sprite brief — Catch and Craft / Fishing Quest

A graphic-designer inventory of every element that is likely to need pixel
art. The playable Valleybrook Pond slice currently draws **colored
rectangles**. This list is what those rectangles are waiting to become.

Share this file as-is. Sizes and look are locked in
[`GAME_DESIGN.md`](GAME_DESIGN.md) §10. Species names live in
[`field-guide.md`](field-guide.md). Gear unlocks live in
[`progression.md`](progression.md).

---

## Art spec (give this to the artist first)

| Rule | Spec |
| --- | --- |
| Look | SNES outdoor RPG: EarthBound towns, Pokémon Gold/Silver overworld, Link’s Awakening DX color. Game Boy battle readability. |
| Internal canvas | **256×224**. Integer scale only. Pixelated, never blurred. |
| Overworld tiles | **16×16** |
| Player / NPC (walk) | **16×16** |
| Player on a boat | **16×32** |
| Fish (battle) | **48×48** typical |
| River monsters (battle) | **64×64** |
| Item / kit / pin icons | **16×16** (menu) |
| Type icons | **8×8** or **16×16**, colorblind-safe shapes, not color-only |
| Palette | **4–6 colors per sprite** (plus transparency). No photo textures, no drop shadows, no modern card UI. |
| Animation | Fish: 2-frame idle + 1 lunge. Walk: 4 directions × 2 frames is enough to start. |
| Tileset | **One** tileset. Eight habitat **palettes** (swap ramps, do not redraw towns). |
| Text | 8×8 pixel font, 2-line dialogue, Pokémon-style continue arrow. |
| Scope | Silhouettes before full color. Fish in batches of 10. A strong silhouette beats a painted illustration. |

**Tone:** Midwest lakeside, 16-bit cartridge, not cute mascot or photoreal
wildlife art. If it would not fit on a 1994 box, cut it.

**Do not draw:** a livewell of kept fish, a pet-fish “party,” or any
real-world personal name on a character.

---

## How to batch the work

1. **Valleybrook now** — everything on the first map and first battle.
2. **Chrome** — battle UI, menus, album, title, type icons.
3. **Fish 001–010** — pond + first reservoir (silhouette pass, then color).
4. **Rest of the circuit** — remaining waters as palette swaps + unique
   props, remaining fish in tens, remaining NPCs.

---

## A. Need now — Valleybrook Pond (hole 9)

The slice already plays. These replace the current placeholders.

### Characters (16×16 walk; 4 directions × 2 frames)

| ID | Who | Notes |
| --- | --- | --- |
| `player` | Named junior angler (player) | Neutral kid/teen angler. Not Catch. One sprite; the player names them. Optional: a couple of hair/hat color swaps later. |
| `catch` | Rival NPC | Gold cap. Starts adversarial on the east bank. Can later look friendlier (same body, softer pose is enough). |
| `zippy` | Bait shop owner | Always has the best bait. Sells from the trees / cattails, not a mall shop. |
| `groundskeeper` | Valleybrook Golf Course | Parked on the sand in the tutorial. Uniform, not a cartoon villain. |

Optional later: 32×32 dialogue mugshots of the same four.

### Overworld tiles (16×16, pond-green palette)

One autotile-friendly set. Corners and edges matter more than unique art.

| Tile | Use on hole 9 |
| --- | --- |
| Deep water | Pond interior |
| Shallow water / ripple | Animated 2-frame optional |
| Bank / mud edge | Water meets grass |
| Fairway | Short golf grass |
| Rough | Taller grass |
| Sand / bunker | Groundskeeper stands here |
| Cattails / reeds (walkable hide) | West column hide path to Zippy |
| Trees / woods | Blocking, Zippy’s cover |
| Clubhouse wall / brick | North building |
| Clubhouse door | Exit / stamp scene |
| Path / cart track | Optional |
| Collision solid (tree trunk, fence) | |

### Valleybrook props (16×16 or 16×32)

- Hole 9 flag / pin
- Clubhouse roof strip (if the building is more than a wall tile)
- Package / inherited kit (title / intro)
- Club notice board (“clubs stamp a photo, not a story”)

### Start kit (16×16 icons + optional 32×32 kit-screen art)

| Item | Role |
| --- | --- |
| Warped spinning rod | Bent, cheap, still fishes |
| 6 lb line (spool) | LINE HP |
| Hand net | Small fish only |
| Worms | Zippy’s gift |
| Pocket camera | Proof. No camera, no album page |

### First fish (48×48, 2 idle + 1 lunge)

Must be recognizable from a silhouette.

| # | Name | Types | Priority |
| --- | --- | --- | --- |
| 001 | **Bluegill** | Sun | First photo. Always the tutorial fish. Do this one first. |
| 002 | Pumpkinseed | Sun | |
| 003 | Green Sunfish | Sun / Weed | |
| 004 | Black Crappie | Sun / Weed | |
| 005 | Largemouth Bass | Fang / Weed | |
| 006 | Bullhead | Night / Stone | |
| 007 | Carp | Stone | |
| 008 | Golden Shiner | Sun / Swift | Small forage fish |

### Battle chrome (Valleybrook)

- Pond-dawn **battle background** (256×112-ish upper half)
- LINE bar (player HP) + fish stamina bar
- 2×2 command block: REEL · SLACK · SNAP · RUN
- Text box + continue arrow
- Polaroid / PROOF frame (SNAP success)
- Grayed SNAP icon (tutorial / fish not tired)
- Kit readout: rod name, not a pet-fish sprite

### Menus / HUD (Valleybrook)

- Pause menu: ALBUM / KIT / SKILLS / SAVE / CLOSE
- HUD chips: worm count, `PIC n` photo count
- Field Guide album page (species photo + name + types)
- Name-entry panel (player types their name)

### Title / intro

- Wordmark: **Ol Catch N. Kraft’s Fishing Quest** (and/or Catch and Craft)
- Optional: 1980s Trail CRT bezel around the title only, then snap to SNES color for Quest
- Intro beats as stills or tiles: inherited package, warped rod, club photo-stamp notice, hole 9 at dawn

### Optional (currently HTML, could be pixels)

- On-screen D-pad, A, B, START for phones

---

## B. Overworld tilesets — eight habitats, one tile set

Same shapes. Swap the color ramp per water.

| # | Water | Palette / mood | Unique props (draw these, do not invent a new tileset) |
| --- | --- | --- | --- |
| 0 | Valleybrook Pond | Pond green, fairway, sand | Flag, clubhouse, cattails |
| 1 | Elysian Reservoir | Warm gold-green, pasture | Sheep, dock, ski-boat wake, spilled tackle box |
| 2 | Englehorn Creek | Clear riffle, gravel | Stepping stones, undercut bank, fly-shop hut |
| 3 | Cougar Slough | Tea-brown night, cypress | Lanterns, knees, stained water |
| 4 | Granite Falls Rapids | Granite gray, cold foam | Tailwater, flood stain, wrecked Dam Store, repaired hut |
| 5 | Rapidan Bend | Wide river, barge rust | Barges, spillway, logjam, repaired landing |
| 6 | Horseshoe Chain | Weed green, then ice blue-gray | Pads, fish house, ice hole, stove glow |
| 7 | Harbor of Champions | Mixed Great Lakes mouth | Harbor wall, circuit dais, vanishing timber at Heron Lake |

**Shared tiles that every palette should include:** water (deep/shallow),
bank, grass, path, tree, building wall/door/roof, bridge, dock planks,
rock, weed/pad, night overlay or lantern glow.

**Map-change story tiles** (same size, special frames):

- Disappearing trees (Heron Lake) — tree, stump, empty tile
- Flood stain / wrecked diner
- Net traps (Snag Crew) and cut-mesh cleared version
- Hidden current / seam marker (visible after Read the Seam)
- Night overlay (Cougar Slough / Night Eyes)

---

## C. Characters and NPCs

Walk sprites **16×16**. Unique faces matter more than unique walk cycles.
One idle + 4-dir walk is enough.

### Core (draw with Valleybrook)

- Player (named junior angler)
- Catch (gold cap; optional later “friend” palette/pose)
- Zippy
- Valleybrook groundskeeper

### Club / water NPCs

| Who | Water |
| --- | --- |
| Sioux Valley club champion / warden | Elysian |
| Elysian dockhand | Elysian |
| Ski-boat / pontooner | Elysian reservoir |
| Englehorn Creek old-timer | Englehorn |
| Englehorn fly kid | Englehorn |
| Catfish-club warden | Cougar Slough |
| Granite Falls Rapids warden | Granite Falls |
| Dam Keepers (2–3) | Dam / Rapidan |
| Big-river club warden | Rapidan Bend |
| Musky club warden | Horseshoe Chain |
| Ice-house regular | Horseshoe winter |
| Harbor / circuit champion | Harbor |
| Hook Protector (green angler who never catches) | Bankside |
| Warden’s kid (keep everything) | Catch-and-keep arc |
| Retired fly angler (keep nothing) | Catch-and-keep arc |

### Villains

- **Snag Crew** — illegal netters, stained coveralls. 2–3 variants (grunt,
  boss). Team Rocket analog; fishing crime, not cartoon mafia.

### Vehicles (overworld objects; player becomes 16×32 on deck)

| Asset | Notes |
| --- | --- |
| **Ruby II** | Beat-up junker boat. Faded paint, tired motor. Looks like nothing. Fishes like it knows every hole. Player skippers later; Catch may take the bow. |
| Rowboat | Landing-repair payoff. Smaller. |
| Ski boat / pontoon | Hazard NPC, miss gag |
| Fish house | Ice Moon Derby hub |
| Barge | Rapidan Bend background / blocking |

---

## D. Wildlife and gag sprites

Used as overworld decoration, side-arc NPCs, and SNAP-miss cut-ins.
Small (16×16) is fine unless they appear in battle.

### Miss gags (battle overlay, ~32×32 or 48×48)

Failed SNAP plays a joke, then the fish is still on. Need readable one-offs:

- Pelican stealing the fish
- Pontoon / ski boat wash
- Zippy knocking the net (nets the air)
- Sheep in the pasture
- Jackalope (rare gag)
- Snapping turtle (lure lost / turtle freed)

### Birds (overworld + pelican tax hat payoff)

Duck, goose, eagle, hawk, owl, pelican, cormorant, heron, crane, swan.

Pelican Tax reward: a **hat** item icon that slightly bothers birds.

### Critters

Bear, otter, beaver, mink, muskrat, skunk, raccoon, coyote, bobcat, lynx,
cougar (Cougar Slough signage / rare overworld), woodchuck, jackalope,
**sheep** (Sioux Valley pasture — need more than one; they clutter the derby).

### Pets (named NPCs from the trip game — “Rizzo, Get Back Here”)

Rizzo, Dixie, Suzie, Cooper, stray dog, Wicket, Henry, Kezzie, Rip.

These can share 2–3 dog/cat bodies with recolors and a unique collar/mark.

---

## E. Gear, items, and keys (16×16 icons)

Shown in KIT, shops (consumables only), and story handoffs.

### Rods

| Item | Look |
| --- | --- |
| Warped spinning rod | Bent blank, worn cork |
| Elysian Model 202 baitcaster | Baitcaster, reservoir-capable |
| LeSeuer Creek wand | Light, current |
| Model 67 Fly rod | Fly rod + reel |
| Rapidan Bend rod | Heavy big-river |
| Boot Lake Ice rod | Short ice stick |

### Line / tackle consumables

- 6 lb line (and later heavier spools if needed)
- Spare hooks
- Coffee (Dam Store / shop joke)

### Nets

- Hand net (small hoop)
- Landing net (medium)
- Rubber trophy net (large, gentler)
- Conservation net (Snag Crew payoff)
- Honor Net (conservation path)

### Cameras

- Pocket camera (Zippy)
- Club Polaroid (first pin; night shots)

### Bait

- Worms / nightcrawlers
- Minnows / fatheads
- Leeches
- Cut bait

### Named lures (held items — trip-game list)

Each can be a 16×16 lure silhouette plus a **color swap**. Do not need 29
unique bodies. One body per *shape family*, then palette:

**Bodies (group these):**

- Minnow crank (Original Rapala, Jointed Rapala, Husky Jerk, Berkly Flickershad)
- Spoon (Swedish Pimple, Spoon, Silver Minnow, Daredevil, Kastmaster)
- Spinner (Mepps Agilia, Panther Martin, Beetlespin, Spinnerbait)
- Jig (Bucktail Jig, Jig and Mr.Twister, Jigging Rap, Tube Bait)
- Topwater (Hula Popper, Whopper Plopper, Topwater Frog, Buzzbait)
- Blade / lipless (RattleTrap, Blade Bait, Chatter Bait)
- Other (SuperDuper, Lazy Ike, Lindy-Rig, Jawbreaker, Wally Diver)

**Story lure:** **Swedish Pimple** — that exact name. Needs a distinct
icon (Lost Swedish Pimple arc).

**Lure colors** (palette swaps): pink-and-white, pink, white, black-and-green,
chartreuse, black-and-orange, silver, blue-and-black, yellow, firetiger,
purple, green, glowing, red-and-white, lime, pumpkin, chrome, gold, rusty,
lucky.

### Keys / stamps / currency

- Shore license
- Reservoir pin, creek-walk pin, night permit, fly-water pin, big-river pin,
  ice-house pin
- Circuit cup
- Conservation tokens
- Field Guide completion ribbons
- Pelican-tax hat
- Zippy’s cache / map scraps
- Spilled tackle box (quest prop)

### Vessels (also overworld; see C)

- Rowboat (icon)
- Ruby II (icon)
- Fish house (icon)

---

## F. UI, type icons, weather

### Type icons (8) — colorblind-safe

Fang · Sun · Stone · Swift · Weed · Night · Scale · Cold

### Weather chips (HUD / trip leftover)

Dawn, fair, wind, rain, overcast, heat, whiteout / ice. Simple 16×16.

### Battle / menu chrome (full game)

- Eight habitat battle backgrounds (and night / ice / flood variants)
- LINE bar, stamina bar
- 2×2 battle menu
- Dialogue box + arrow
- Polaroid / album page template (species photo sits inside)
- KIT panel (five slots: rod, line, bait, net, camera — **not** a fish party)
- SKILLS list icons (optional; text is enough for v1)
- SAVE / CONTINUE
- Club stamp animation (photo gets a pin)
- Size-gate break-off flash (line snap)
- Optional Game Boy green palette mode (recolor pass, not new art)

### Font

8×8 pixel caps for menus. If a custom font is in scope, it is a sprite
sheet too.

---

## G. Fish battle sprites — full roster (79)

**48×48**, 2-frame idle + 1 lunge, facing left on the battle screen.
**64×64** for river monsters (075–079). Silhouette first.

Trip-game originals (keep these names; they already have fans) are marked
†. First photo is always **Bluegill**.

### Valleybrook Pond — 001–008

001 Bluegill ★ · 002 Pumpkinseed · 003 Green Sunfish · 004 Black Crappie ·
005 Largemouth Bass · 006 Bullhead † · 007 Carp † · 008 Golden Shiner

### Elysian Reservoir — 009–017

009 White Crappie · 010 Yellow Perch † · 011 White Bass · 012 Channel Catfish † ·
013 Common Shiner · 014 Gizzard Shad · 015 Warmouth · 016 Spotted Bass ·
017 Hybrid Striper (Wiper)

### Englehorn Creek — 018–024

018 Smallmouth Bass † · 019 Rock Bass · 020 Creek Chub · 021 White Sucker ·
022 Northern Hogsucker · 023 Shortnose Gar · 024 Brook Trout

### Cougar Slough — 025–033

025 Brown Bullhead · 026 Yellow Bullhead · 027 Dogfish (Bowfin) † ·
028 Longnose Gar † · 029 Spotted Gar · 030 Flathead Catfish † ·
031 American Eel · 032 Grass Pickerel · 033 Chain Pickerel

### Granite Falls Rapids — 034–041

034 Rainbow Trout · 035 Brown Trout · 036 Cutthroat Trout ·
037 Mountain Whitefish · 038 Slimy Sculpin · 039 Longnose Dace ·
040 Splake · 041 Landlocked Atlantic

### Rapidan Bend — 042–054

042 Sheepshead (Freshwater Drum) † · 043 Bigmouth Buffalo † ·
044 Smallmouth Buffalo · 045 Quillback · 046 Shorthead Redhorse ·
047 Blue Catfish † · 048 Paddlefish · 049 Shovelnose Sturgeon ·
050 Lake Sturgeon † · 051 Mooneye · 052 Goldeye · 053 Silver Carp ·
054 Bighead Carp

### Horseshoe Chain — 055–066

055 Pike (Northern) † · 056 Musky † · 057 Tiger Musky · 058 Walleye † ·
059 Sauger † · 060 Saugeye · 061 Cisco · 062 Lake Whitefish ·
063 Lake Trout · 064 Eelpout (Burbot) † · 065 Round Whitefish ·
066 Rainbow Smelt

### Harbor of Champions — 067–074

067 Chinook · 068 Coho · 069 Round Goby · 070 Sea Lamprey ·
071 Alligator Gar · 072 Pallid Sturgeon · 073 Redear Sunfish ·
074 Longear Sunfish

### River monsters — 075–079 (64×64)

| # | Name | Types | Look |
| --- | --- | --- | --- |
| 075 | Cattail King | Fang / Weed | Pad-crowned largemouth, postgame hole 9 |
| 076 | Redfin Widow | Cold / Swift | Widow-rise trout after the river is cleaned |
| 077 | The Dam Ghost | Scale / Stone | Pale / albino sturgeon under the spillway |
| 078 | Old Copper | Fang / Weed | Catch’s dusk-jump musky |
| 079 | Ice-Eye | Cold / Night | Staring burbot under the ice hole |

Album pages can reuse the battle sprite cropped into the polaroid. A
separate “photo” illustration is not required.

Tiny forage fish (shiners, dace, smelt, sculpin) should read as small in
the 48×48 box (more water around them). Giants (sturgeon, alligator gar,
buffalo, musky) should fill the frame.

---

## H. Suggested file naming

```
assets/
  tiles/overworld.png          # 16×16 atlas + 8 palettes
  sprites/player.png
  sprites/npc-catch.png
  sprites/npc-zippy.png
  sprites/npc-groundskeeper.png
  sprites/npc-*.png
  sprites/ruby-ii.png
  fish/001-bluegill.png        # 48×48 strip: idleA, idleB, lunge
  fish/075-cattail-king.png    # 64×64
  ui/battle-hud.png
  ui/polaroid.png
  ui/types.png
  items/kit-*.png
  bg/battle-valleybrook.png
```

PNG with 1-bit transparency. Indexed or a tight unique-color count.
No JPEG.

---

## I. Count (for quoting)

Rough unique drawings if silhouettes are reused smartly:

| Bucket | Unique drawings | Notes |
| --- | --- | --- |
| Tiles (one set) | ~40–80 tiles | × 8 palettes, not × 8 redraws |
| Player | 1 body | Optional recolors |
| Named NPCs | ~20 | Share walk cycles |
| Snag Crew | 2–3 | |
| Boats / houses | 5 | Ruby II, rowboat, ski boat, barge, fish house |
| Wildlife / pets / gags | ~25–40 | Recolor pets; sheep herd |
| Kit / items / pins | ~40 | Lure *shapes* ~8, then color swaps |
| Type + weather UI | ~15 | |
| Battle / menu chrome | ~15 sheets | |
| Battle backgrounds | 8 + variants | |
| Fish | 74 + 5 | Batches of 10; monsters last |
| Title / intro | 3–6 stills | |

**First commission that unblocks the slice:** player, Catch, Zippy,
groundskeeper, Valleybrook tiles, Bluegill, warped rod + hand net + worms
+ pocket camera, battle box + polaroid, pond battle background.
