# Paldle datamine pipeline

In-house datamine of the **Palworld** game (Unreal Engine 5.1) → `pals.json` + icons + cries.
Replaces the old `scrape-wikily.mjs` placeholder (kept for reference). Everything reads the
game's own DataTables, so the output shape matches what `db/seed-pals.mjs` already consumes.

## What it produces
- `pals.json` — 288 pals (the full current Paldeck), each with attributes + **EN & FR** name /
  description / partner-skill. Same shape as before, plus `name_fr` / `description_fr` /
  `partner_skill_fr`.
- `../../static/pals/<key>.webp` — 288 pal icons (128², lossless webp).
- `../../static/sounds/<key>.ogg` — 288 pal cries (one representative per pal).
- `out/cry_ogg/<id>.ogg` — full deduped cry library (1224 cries, ~6 emotions/pal).

## Requirements
- Palworld installed (default `D:\Palworld-Game\Palworld\Pal\Content\Paks\Pal-Windows.pak`).
  The pak is **unencrypted** (zero AES key) — no AES needed.
- A **mappings.usmap** matching the installed build, at
  `extractor/PaldleExtractor/assets/mappings.usmap`. (A working public one is checked in;
  a version-mismatched usmap fails to deserialize `DT_PalMonsterParameter`.)
- .NET 10 SDK, ffmpeg (libwebp + libvorbis), and vgmstream-cli
  (`extractor/tools/vgmstream/vgmstream-cli.exe`, auto-downloaded).

## The extractor (`extractor/PaldleExtractor`)
C# / CUE4Parse (`EGame.GAME_UE5_1`). Commands (`dotnet run -- <cmd>`, or run the built dll):
- `list [filter]` — dump every pak path → `out/manifest.txt`
- `tables <dir> name=path …` — dump DataTables to JSON in one mount
- `textures <substr> <dir>` — decode `UTexture2D` → PNG
- `media <idlist> <dir>` — extract streamed `WwiseAudio/Media/<id>.wem`
- `wwise` / `wwiseinspect` — parse `.bnk` (HIRC) → wems

## Run order
```bash
cd extractor/PaldleExtractor && dotnet build -c Release
export PALDLE_USMAP=".../assets/mappings.usmap"
# 1. dump datatables (monster params, icon table, EN/FR text tables)
dotnet bin/Release/net10.0/PaldleExtractor.dll tables tables monster=... icon=... nameEN=... (see git history)
# 2. decode icons
dotnet bin/Release/net10.0/PaldleExtractor.dll textures "Pal/Content/Pal/Texture/PalIcon/Normal/" icons_raw

# 3. scan pal blueprints for mount classification
dotnet bin/Release/net10.0/PaldleExtractor.dll bpscan bpscan

cd ../..                                    # scripts/datamine
node build-mount-map.mjs                    # out/bpscan/bp-markers.json -> out/mount-map.json
node datamine-local.mjs                     # tables/*.json + mount-map  -> pals.json + out/icon-assets.json
node build-icons.mjs                        # out/icons_raw/*.png -> static/pals/*.webp
node build-cry-map.mjs                      # AKB_Voice_PalCry.bnk -> out/cry-map.json + cry-sourceids.txt
# extract the cry wems the map needs, then:
dotnet .../PaldleExtractor.dll media out/cry-sourceids.txt cry_wems
node build-sounds.mjs                       # cry_wems/*.wem -> static/sounds/*.ogg (+ Sound game mode)
```

## How the tricky bits work
- **Text**: `DT_PalMonsterParameter` rows key into `DT_PalNameText_Common` (`PAL_NAME_<row>`),
  `DT_PalLongDescriptionText` (`PAL_LONG_DESC_<row>`) and `DT_SkillNameText_Common`
  (`PARTNERSKILL_<row>`), per language under `L10N/<lang>/`. Lookups are case-insensitive
  (the game mixes `CowPal`/`Cowpal`).
- **`mount`** has no clean enum in the tables. `PaldleExtractor bpscan` scans every pal actor
  blueprint (`PalActorBP/<X>/BP_<X>`) for ride markers; `build-mount-map.mjs` classifies:
  rideable = has a ride marker/RideCall; **Flying** = + `PalFlyMeshHeightCtrl`; **Swimming** =
  + Water element; else **Ground** (~92% vs the curated roster). `datamine-local.mjs` keeps the
  curated value for known pals and uses this datamined value for new ones. Pal `key`s are reused
  by `tribe`, preserving daily-puzzle history.
- **Cries** are a Wwise switch-container system (`BP_PalCryComponent` → native `PlayCry`).
  The master bank `WwiseAudio/AKB_Voice_PalCry.bnk` switches on `SwitchId = FNV(palInternalName)`;
  `build-cry-map.mjs` walks that tree to each pal's `SoundSfxVoice` → `SourceId` →
  `WwiseAudio/Media/<id>.wem`. Element variants (Ignis/Lux/Cryst/…) fall back to the base pal.
