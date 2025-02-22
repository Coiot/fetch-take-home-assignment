<script lang="ts">
	import { InfoIcon } from "../constants/icons";
	import Icon from "./Icon.svelte";

	interface Props {
		id?: string;
		icon?: string;
		text?: string;
		fill?: string | undefined;
		height?: string | undefined;
		live?: "polite" | "off" | "assertive" | null | undefined;
	}

	let {
		id = "",
		icon = InfoIcon,
		text = "",
		fill = undefined,
		height = undefined,
		live = "polite"
	}: Props = $props();

	let tooltip: HTMLSpanElement | null = null;
	let trigger: HTMLSpanElement | null = null;

	function GetTooltipPosition() {
		if (!tooltip || !trigger) return;
		const rect = trigger.getBoundingClientRect();
		const tooltipHeight = tooltip.offsetHeight;
		tooltip.style.top = `${rect.bottom + window.scrollY - tooltipHeight - 16}px`;
		tooltip.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
	}
</script>

<span
	bind:this={trigger}
	{id}
	class="tooltip-component"
	role="tooltip"
	aria-label={text}
	aria-describedby="tooltip-text"
	onmouseenter={GetTooltipPosition}
	onfocus={GetTooltipPosition}
>
	<Icon source={icon} {fill} {height} />
</span>

<span bind:this={tooltip} id="tooltip-text" class="tooltip" aria-live={live}>
	{text}
</span>

<style>
	.tooltip-component {
		cursor: pointer;
	}

	.tooltip {
		position: fixed;
		transform: translateX(-50%);
		width: 25ch;
		color: var(--primary-text-color);
		font-size: 0.9rem;
		font-weight: 600;
		text-align: center;
		text-wrap: wrap;
		padding: 0.25rem;
		border-radius: 0.5rem;
		background-color: var(--primary-background-color);
		box-shadow: 0 0 6px hsla(var(--accent-color), 20%, 30%, 0.75);
		z-index: 120;
		transition: opacity 0.3s ease;
		opacity: 0;
		pointer-events: none;
	}

	.tooltip-component:hover + .tooltip,
	.tooltip-component:focus + .tooltip,
	.tooltip:focus,
	.tooltip:hover {
		opacity: 1;
		pointer-events: initial;
	}
</style>
