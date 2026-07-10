// Inline-style helper to render a 16px item tile from a game sprite sheet.
const SHEETS: Record<string, { url: string; cols: number; w: number; h: number }> = {
    springobjects: { url: '/ui/springobjects.png', cols: 24, w: 384, h: 624 },
    objects_2: { url: '/ui/objects_2.png', cols: 8, w: 128, h: 320 },
};

export function cropIconStyle(sprite: number | null | undefined, sheet: string | null | undefined, size = 40): string {
    if (sprite == null || !sheet || !SHEETS[sheet]) return '';
    const s = SHEETS[sheet];
    const scale = size / 16;
    const col = sprite % s.cols;
    const row = Math.floor(sprite / s.cols);
    return (
        `width:${size}px;height:${size}px;flex:0 0 auto;` +
        `background-image:url('${s.url}');` +
        `background-size:${s.w * scale}px ${s.h * scale}px;` +
        `background-position:-${col * size}px -${row * size}px;` +
        `image-rendering:pixelated;`
    );
}
