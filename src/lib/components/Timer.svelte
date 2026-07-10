<script lang="ts">
	let date = $state(new Date());

	let timeLeft = $derived(24 - date.getUTCHours() - 1);
	let timeLeftMin = $derived(60 - date.getUTCMinutes() - 1);
	let timeLeftSec = $derived(60 - date.getUTCSeconds());

	$effect(() => {
		const interval = setInterval(() => {
			date = new Date();
		}, 1000);

		return () => clearInterval(interval);
	});

	function padZero(num: number): string {
		return num < 10 ? `0${num}` : `${num}`;
	}
</script>

<div class="inline-block">
	<p class="clockDisplay stardew-text text-xl">
		{padZero(timeLeft)}:{padZero(timeLeftMin)}:{padZero(timeLeftSec)}
	</p>
</div>