<!-- Vivid Palworld-ish backdrop: soft drifting light orbs over the body's sky→plains gradient. -->
<div class="pal-bg" aria-hidden="true">
    <span class="orb orb-a"></span>
    <span class="orb orb-b"></span>
    <span class="orb orb-c"></span>
    <span class="orb orb-d"></span>
    <div class="grain"></div>
</div>

<style>
    .pal-bg {
        position: fixed;
        inset: 0;
        z-index: -1;
        overflow: hidden;
        pointer-events: none;
    }

    .orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(60px);
        opacity: 0.5;
        will-change: transform;
    }
    .orb-a { width: 520px; height: 520px; left: -120px; top: -80px;
        background: radial-gradient(circle, #6fe6ff 0%, transparent 70%);
        animation: drift1 26s ease-in-out infinite; }
    .orb-b { width: 460px; height: 460px; right: -100px; top: 12%;
        background: radial-gradient(circle, #7cf0b8 0%, transparent 70%);
        animation: drift2 32s ease-in-out infinite; }
    .orb-c { width: 620px; height: 620px; left: 8%; bottom: -180px;
        background: radial-gradient(circle, #4bd6a0 0%, transparent 70%);
        animation: drift3 30s ease-in-out infinite; }
    .orb-d { width: 380px; height: 380px; right: 14%; bottom: 6%;
        background: radial-gradient(circle, #66c8ff 0%, transparent 70%);
        animation: drift1 24s ease-in-out infinite reverse; }

    /* faint sun glow at the top */
    .grain {
        position: absolute;
        inset: 0;
        background: radial-gradient(120% 60% at 50% -10%, rgba(255, 255, 255, 0.22), transparent 60%);
    }

    @keyframes drift1 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(40px, 30px); } }
    @keyframes drift2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-50px, 24px); } }
    @keyframes drift3 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(30px, -40px); } }

    @media (prefers-reduced-motion: reduce) {
        .orb { animation: none; }
    }
</style>
