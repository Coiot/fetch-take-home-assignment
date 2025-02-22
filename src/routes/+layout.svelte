<script lang="ts">
	import "../reset.css";
	import "../global.css";
	import "../utilities.css";

	interface Props {
		children?: import("svelte").Snippet;
	}

	let { children }: Props = $props();
</script>

<main>
	{@render children?.()}
</main>

<style>
	main {
		min-height: 100%;
		height: fit-content;
		width: 100%;
		background-color: hsl(var(--accent-color), 100%, 90%);
		background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'><defs><pattern id='a' patternUnits='userSpaceOnUse' width='50' height='50' patternTransform='scale(2) rotate(0)' fill='none' stroke='hsl(35 100% 80%)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><g transform='rotate(45, 15, 15) translate(15,0)'><path d='M11.25 16.25h1.5L12 17z'/><path d='M16 14v.5'/><path d='M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444a11.702 11.702 0 0 0-.493-3.309'/><path d='M8 14v.5'/><path d='M8.5 8.5c-.384 1.05-1.083 2.028-2.344 2.5-1.931.722-3.576-.297-3.656-1-.113-.994 1.177-6.53 4-7 1.923-.321 3.651.845 3.651 2.235A7.497 7.497 0 0 1 14 5.277c0-1.39 1.844-2.598 3.767-2.277 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5'/></g></pattern></defs><rect width='100%' height='100%' transform='translate(0,0)' fill='url(%23a)'/></svg>");
		padding: 2rem;
	}
</style>
