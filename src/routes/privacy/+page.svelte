<script lang="ts">
    function revokeConsent() {
        // Google Funding Choices, present only in production with ads enabled.
        if (typeof (globalThis as any).googlefc !== "undefined") {
            (globalThis as any).googlefc.callbackQueue.push((globalThis as any).googlefc.showRevocationMessage);
        }
    }
</script>

<div class="pal-frame p-6 w-[92%] max-w-[760px] text-white">
    <h1 class="text-3xl pal-title mb-4">Privacy Policy</h1>
    <p class="mb-4 text-white/70">Last updated: 2026-07-11</p>

    <p class="mb-4">
        Welcome to Paldle (paldle.gg, the "Website"). This Privacy Policy outlines how we collect,
        use, and protect your information. By using the Website, you agree to the practices described here.
    </p>

    <h2 class="text-xl pal-title mb-2">Information we collect</h2>
    <p class="mb-4">
        Paldle stores your game progress (streaks, guesses) locally in your browser via localStorage.
        We do not require an account and do not collect personal information you do not choose to provide.
    </p>

    <h2 class="text-xl pal-title mb-2">Cookies and analytics</h2>
    <p class="mb-4">
        We use privacy-friendly analytics to understand aggregate usage, and cookies or similar
        technologies may be used to enhance your experience. If advertising is enabled, you can manage
        your consent below.
    </p>
    <button class="text-[#57e0f0] text-lg underline cursor-pointer mb-4" onclick={revokeConsent}>
        Click here to revoke the cookie consent
    </button>

    <h2 class="text-xl pal-title mb-2">Third-party links</h2>
    <p class="mb-4">
        The Website may link to third-party websites. We are not responsible for their content or
        privacy practices. Please review their policies.
    </p>

    <h2 class="text-xl pal-title mb-2">Changes to this policy</h2>
    <p class="mb-4">
        We may update this policy from time to time. Changes will be posted on this page.
    </p>

    <h2 class="text-xl pal-title mb-2">Contact</h2>
    <p class="mb-4">
        Questions? Contact us at contact@paldle.gg.
    </p>

    <p class="mb-2">
        Paldle is a fan project and is not affiliated with Pocketpair, Inc. Thanks for playing!
    </p>
    <span class="text-white" data-ccpa-link="1"></span>
</div>
