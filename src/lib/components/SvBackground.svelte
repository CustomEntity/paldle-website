<!-- Stardew title-screen background: starfield sky + parallax mountains + grassy foreground + Junimos (real game sprites). -->
<div class="sv-bg" aria-hidden="true">
    <div class="stars"></div>
    <div class="mtn mtn-blue"></div>
    <div class="mtn mtn-green"></div>
    <div class="ground"></div>
    <div class="junimo junimo-l"></div>
    <div class="junimo junimo-r"></div>
</div>

<style>
    .sv-bg {
        position: fixed;
        inset: 0;
        z-index: -1;
        overflow: hidden;
        pointer-events: none;
    }

    .stars {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 55%;
        opacity: 0.9;
        background-image:
            radial-gradient(1.5px 1.5px at 12% 18%, #fff, transparent),
            radial-gradient(1.5px 1.5px at 28% 8%, #fff, transparent),
            radial-gradient(1px 1px at 42% 24%, #cfe6ff, transparent),
            radial-gradient(2px 2px at 58% 12%, #fff, transparent),
            radial-gradient(1px 1px at 71% 30%, #fff, transparent),
            radial-gradient(1.5px 1.5px at 85% 16%, #fff, transparent),
            radial-gradient(1px 1px at 93% 6%, #cfe6ff, transparent),
            radial-gradient(1px 1px at 6% 40%, #fff, transparent),
            radial-gradient(1.5px 1.5px at 34% 44%, #fff, transparent),
            radial-gradient(1px 1px at 64% 40%, #fff, transparent),
            radial-gradient(1.5px 1.5px at 78% 46%, #cfe6ff, transparent),
            radial-gradient(1px 1px at 50% 34%, #fff, transparent);
    }

    .mtn {
        position: absolute;
        left: 0;
        right: 0;
        background-repeat: repeat-x;
        background-position: bottom center;
        image-rendering: pixelated;
        -webkit-mask-image: linear-gradient(to top, #000 62%, transparent 100%);
        mask-image: linear-gradient(to top, #000 62%, transparent 100%);
    }
    .mtn-blue {
        bottom: 130px;
        height: 300px;
        background-image: url('/ui/mtn-blue.png');
        background-size: auto 300px;
        opacity: 0.9;
    }
    .mtn-green {
        bottom: 0;
        height: 340px;
        background-image: url('/ui/mtn-green.png');
        background-size: auto 340px;
    }

    /* grassy foreground line */
    .ground {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 30px;
        background: #6fbb3f url('/ui/grass.png') repeat-x bottom left;
        background-size: auto 30px;
        image-rendering: pixelated;
        box-shadow: inset 0 8px 10px rgba(0, 0, 0, 0.12);
    }

    /* Junimos sitting on the grass */
    .junimo {
        position: absolute;
        bottom: 18px;
        width: 46px;
        height: 46px;
        background: url('/ui/junimo.png') no-repeat center / contain;
        image-rendering: pixelated;
        /* tint the white base sprite to the classic Junimo green */
        filter: sepia(1) saturate(6) hue-rotate(55deg) brightness(0.78) drop-shadow(0 3px 0 rgba(0, 0, 0, 0.25));
        animation: hop 1.8s ease-in-out infinite;
    }
    .junimo-l { left: 4%; animation-delay: 0.2s; }
    .junimo-r { right: 5%; animation-delay: 0.9s; transform: scaleX(-1); }

    @keyframes hop {
        0%, 70%, 100% { transform: translateY(0); }
        82% { transform: translateY(-10px); }
    }
    .junimo-r { animation-name: hop-r; }
    @keyframes hop-r {
        0%, 70%, 100% { transform: scaleX(-1) translateY(0); }
        82% { transform: scaleX(-1) translateY(-10px); }
    }

    @media (max-width: 828px) {
        .mtn-blue { height: 200px; background-size: auto 200px; bottom: 90px; }
        .mtn-green { height: 220px; background-size: auto 220px; }
        .junimo { width: 38px; height: 38px; }
    }
    @media (prefers-reduced-motion: reduce) {
        .junimo { animation: none; }
    }
</style>
