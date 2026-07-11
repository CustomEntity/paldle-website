// Paldle domain types. One guessable entity (Pal), shared by all three game modes.

interface Pal {
    id: number;
    key: string;               // slug, also the icon filename (/pals/<key>.webp)
    name: string;              // localized (EN fallback)
    paldeck: string;           // "100" | "84B"
    paldeck_num: number | null;
    elements: string[];        // 1-2, e.g. ["Fire","Dark"]
    rarity: number | null;
    size: string | null;       // XS | S | M | L | XL
    genus: string | null;
    mount: string;             // None | Ground | Flying | Swimming
    nocturnal: boolean;
    food_amount: number | null;
    work_keys: string[];       // e.g. ["Mining","Handiwork"]
    partner_skill: string | null;
    icon: string;              // /pals/<key>.webp
    description?: string | null; // localized paldeck text (Description mode)
}

interface DailyPal {
    id: number;
    game_id: number;
    date: string;
    pal: Pal;
}

interface PatchNote {
    id: number;
    date: string;
    mode: string;
    content: string;
}
