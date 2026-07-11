#!/usr/bin/env node
// Rebuilds static/og-image.png (1200x630) from real layers so the layout is
// reproducible and the spacing is tweakable. Composites the Palworld key-art
// background + the PALDLE wordmark + a divider + the subtitle + a row of Pal
// chips. Requires ImageMagick 7 (`magick`) on PATH.
//
//   node scripts/build-og-image.mjs [outPath]
//
// Tune the LAYOUT block below to move things around — every element is placed
// from a named constant, so "space the title and subtitle a bit more" is a
// one-line change (bump SUBTITLE_CY / PALS_CY, etc.).

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const STATIC = join(ROOT, "static");

const OUT = process.argv[2] ?? join(STATIC, "og-image.png");

// ── LAYOUT ──────────────────────────────────────────────────────────────────
const W = 1200;
const H = 630;

const LOGO_W = 616; // PALDLE wordmark width (keeps its 1480:520 aspect)
const LOGO_TOP = 74; // px from the top edge

const DIVIDER_CY = 352; // diamond + rules row
const DIVIDER_HALF = 96; // rule length on each side of the diamond

const SUBTITLE_TEXT = "THE DAILY PALWORLD GUESSING GAME";
const SUBTITLE_CY = 408; // more air between the wordmark and the subtitle
const SUBTITLE_SIZE = 41;
const SUBTITLE_KERNING = 6;

const UNDERLINE_CY = 448;
const UNDERLINE_HALF = 92; // half-width of the cyan underline

const PALS = ["lamball", "cattiva", "foxparks", "lifmunk", "pengullet", "grizzbolt"];
const PALS_CY = 552; // Pal-chip row centre
const CHIP_D = 100; // chip diameter
const CHIP_GAP = 24; // gap between chips
const PAL_FIT = 82; // Pal artwork size inside the chip

const ACCENT = "#57c8ff"; // cyan accent (divider / underline / ring)
const NAVY = "#0c2536"; // chip background

// ── helpers ───────────────────────────────────────────────────────────────
const tmp = mkdtempSync(join(tmpdir(), "paldle-og-"));
const t = (name) => join(tmp, name);
const magick = (args) => execFileSync("magick", args, { stdio: ["ignore", "pipe", "inherit"] });

try {
    // 1) Background: cover-fit the key art, then gently darken for legibility.
    magick([
        join(STATIC, "ui", "hero.webp"),
        "-resize", `${W}x${H}^`,
        "-gravity", "center",
        "-extent", `${W}x${H}`,
        "-modulate", "85,96",
        t("bg.png"),
    ]);

    // 2) Subtitle as its own layer (white text + soft drop shadow).
    magick([
        "-background", "none",
        "-font", "Arial-Bold",
        "-pointsize", String(SUBTITLE_SIZE),
        "-kerning", String(SUBTITLE_KERNING),
        "-fill", "white",
        `label:${SUBTITLE_TEXT}`,
        t("sub.png"),
    ]);
    magick([
        t("sub.png"),
        "(", "+clone", "-background", "black", "-shadow", "92x4+0+3", ")",
        "+swap", "-background", "none", "-layers", "merge", "+repage",
        t("sub_sh.png"),
    ]);

    // 3) Pal chips: navy disc + cyan ring + circular-masked Pal art.
    const R = CHIP_D / 2;
    // circle mask a hair smaller than the ring so art never spills past it
    magick([
        "-size", `${CHIP_D}x${CHIP_D}`, "xc:black",
        "-fill", "white", "-draw", `circle ${R - 0.5},${R - 0.5} ${R - 0.5},9`,
        t("mask.png"),
    ]);
    PALS.forEach((name, i) => {
        // chip background: filled disc + ring
        magick([
            "-size", `${CHIP_D}x${CHIP_D}`, "xc:none",
            "-fill", NAVY, "-stroke", ACCENT, "-strokewidth", "3",
            "-draw", `circle ${R - 0.5},${R - 0.5} ${R - 0.5},7`,
            t(`chipbg${i}.png`),
        ]);
        // Pal art fitted + centred on a transparent chip-sized canvas, then masked
        magick([
            join(STATIC, "pals", `${name}.webp`),
            "-resize", `${PAL_FIT}x${PAL_FIT}`,
            "-background", "none", "-gravity", "center", "-extent", `${CHIP_D}x${CHIP_D}`,
            t("mask.png"), "-alpha", "off", "-compose", "CopyOpacity", "-composite",
            t(`pal${i}.png`),
        ]);
        magick([
            t(`chipbg${i}.png`), t(`pal${i}.png`), "-compose", "over", "-composite",
            t(`chip${i}.png`),
        ]);
    });

    // 4) Compose everything onto the background.
    const rowW = PALS.length * CHIP_D + (PALS.length - 1) * CHIP_GAP;
    const rowX0 = Math.round((W - rowW) / 2);
    const chipY = Math.round(PALS_CY - CHIP_D / 2);

    const args = [t("bg.png")];

    // wordmark
    args.push(
        "(", join(STATIC, "logo.png"), "-resize", `${LOGO_W}x`, ")",
        "-gravity", "north", "-geometry", `+0+${LOGO_TOP}`, "-composite",
    );

    // divider (two rules + centre diamond)
    args.push(
        "-gravity", "northwest",
        "-stroke", "rgba(190,230,255,0.85)", "-strokewidth", "2", "-fill", "none",
        "-draw", `line ${W / 2 - DIVIDER_HALF},${DIVIDER_CY} ${W / 2 - 22},${DIVIDER_CY}`,
        "-draw", `line ${W / 2 + 22},${DIVIDER_CY} ${W / 2 + DIVIDER_HALF},${DIVIDER_CY}`,
        "-stroke", "none", "-fill", "rgba(190,230,255,0.95)",
        "-draw", `polygon ${W / 2},${DIVIDER_CY - 9} ${W / 2 + 9},${DIVIDER_CY} ${W / 2},${DIVIDER_CY + 9} ${W / 2 - 9},${DIVIDER_CY}`,
    );

    // subtitle
    args.push(
        "(", t("sub_sh.png"), ")",
        "-gravity", "north", "-geometry", `+0+${Math.round(SUBTITLE_CY - 28)}`, "-composite",
    );

    // cyan underline
    args.push(
        "-gravity", "northwest", "-fill", ACCENT, "-stroke", "none",
        "-draw", `roundrectangle ${W / 2 - UNDERLINE_HALF},${UNDERLINE_CY - 2} ${W / 2 + UNDERLINE_HALF},${UNDERLINE_CY + 2} 2,2`,
    );

    // Pal chips
    PALS.forEach((_, i) => {
        const x = rowX0 + i * (CHIP_D + CHIP_GAP);
        args.push(
            "(", t(`chip${i}.png`), ")",
            "-gravity", "northwest", "-geometry", `+${x}+${chipY}`, "-composite",
        );
    });

    args.push(OUT);
    magick(args);
    console.log(`✓ wrote ${OUT}`);
} finally {
    rmSync(tmp, { recursive: true, force: true });
}
