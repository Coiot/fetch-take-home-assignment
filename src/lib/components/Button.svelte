<script lang="ts">
	import type { Snippet } from "svelte";
	import Icon from "./Icon.svelte";

	interface Props {
		variant?: string;
		class?: string;
		icon?: string;
		text?: string;
		label?: string;
		href?: string;
		title?: string;
		disabled?: boolean;
		round?: boolean;
		height?: string | undefined;
		width?: string | undefined;
		fill?: string | undefined;
		custom?: Snippet;
		onclick?: () => void;
	}

	let {
		variant = "",
		class: className = "",
		icon = "",
		text = "",
		label = "",
		href = "",
		disabled = false,
		round = false,
		height = undefined,
		width = undefined,
		fill = undefined,
		custom,
		...rest
	}: Props = $props();
</script>

{#if href}
	<a
		role="button"
		{...rest}
		class="button {variant} {className}"
		{href}
		aria-describedby={variant == "icon" || variant == "blank" ? "icon-only-text" : undefined}
	>
		{#if icon}
			<Icon
				source={icon}
				height={text && !height ? "1em" : height}
				width={width ?? ""}
				{fill}
				stroke={fill === "none" ? "currentColor" : undefined}
				ariaHidden="true"
			/>
		{/if}
		{#if text}
			<span class="text">{text}</span>
		{/if}
		{#if (variant == "icon" || variant == "blank") && !text}
			<span id="icon-only-text" class="sr-only">{label}</span>
		{/if}
		{@render custom?.()}
	</a>
{:else}
	<button
		type="button"
		{...rest}
		class="button {variant} {className}"
		class:round
		class:disabled
		{disabled}
		aria-describedby={variant == "icon" || variant == "blank" ? "icon-only-text" : undefined}
	>
		{#if icon}
			<Icon
				source={icon}
				height={text && !height ? "1em" : height}
				width={width ?? ""}
				{fill}
				stroke={fill === "none" ? "currentColor" : undefined}
				ariaHidden="true"
			/>
		{/if}
		{#if text}
			<span class="text">{text}</span>
		{/if}
		{#if (variant == "icon" || variant == "blank") && !text}
			<span id="icon-only-text" class="sr-only">{label}</span>
		{/if}
		{@render custom?.()}
	</button>
{/if}

<style>
	.button {
		min-height: var(--min-height, 1.75rem);
		height: fit-content;
		width: var(--width, min(1.5rem, fit-content));
		max-width: var(--max-width);
		display: flex;
		justify-content: center;
		align-items: center;
		justify-self: var(--justify-self, center);
		align-self: var(--align-self, center);
		gap: 0.4rem;
		color: inherit;
		font-size: var(--font-size, 1rem);
		font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
		font-weight: 500;
		text-decoration: none;
		background-color: #fff;
		border: 1px solid var(--border-color, #222);
		border-radius: 0.25rem;
		box-shadow: 0 0 4px var(--box-shadow, #fefefe);
		padding-block: var(--padding-block, 0.5rem) !important;
		padding-inline: var(--padding-inline, 0.75rem) !important;
		margin-inline: var(--margin-inline, 0);
		white-space: var(--wrap, nowrap);
		cursor: pointer;
		transition: all 0.25s;

		& :global(svg) {
			pointer-events: none;
		}

		&:hover {
			background-color: hsl(var(--accent-color) 75% 95%);
			border: 1px solid hsl(var(--accent-color) 60% 50%);
			box-shadow: 0 0 4px hsl(var(--accent-color) 60% 90%);
		}

		&.action {
			background-color: hsl(var(--accent-color), 97.5%, 92.5%);
			border: 1px solid hsl(var(--accent-color) 80% 20%);
			box-shadow: 0 0 4px hsl(var(--accent-color) 65% 80%);
		}

		&.light {
			background-color: hsl(var(--accent-color), 95%, 97.5%);
			border: 1px solid hsl(var(--accent-color), 80%, 50%);
			box-shadow: 0 0 4px hsl(var(--accent-color), 65%, 80%);
		}

		&.action:hover,
		&.light:hover {
			background-color: hsl(var(--accent-color) 85% 85%);
			border: 1px solid hsl(var(--accent-color) 65% 40%);
			box-shadow: 0 0 4px hsl(var(--accent-color) 65% 85%);
		}

		&.disabled,
		&.aria-disabled {
			background-color: hsl(var(--accent-color) 5% 90%);
			border: 1px solid hsl(var(--accent-color) 0% 50%) !important;
			opacity: 0.85;
			cursor: not-allowed;

			&:hover {
				background-color: hsl(var(--accent-color) 5% 80%);
				border: 1px solid hsl(var(--accent-color) 0% 40%) !important;
			}
		}

		&.blank {
			position: relative;
			min-height: fit-content;
			color: var(--action-blue-color);
			font-size: 1.05rem;
			font-weight: 400;
			background-color: transparent;
			padding: 0;
			border: none;
			box-shadow: none;
			cursor: pointer;

			& :global(svg) {
				fill: var(--action-blue-color);
			}

			&:hover {
				background-color: transparent;
				border: none;
				box-shadow: none;
				text-decoration: underline;

				& :global(svg) {
					fill: hsl(210, 70%, 45%);
				}
			}

			&.disabled,
			&.disabled:hover {
				border: none !important;
			}
		}

		&.icon {
			position: relative;
			min-height: fit-content;
			background-color: transparent;
			border: none;
			box-shadow: none;
			cursor: pointer;

			&:hover {
				background-color: transparent;
				border: none;
				box-shadow: none;
				text-decoration: underline;

				& :global(svg) {
					filter: brightness(0.85) saturate(115%);
				}
			}

			&.disabled,
			&.disabled:hover {
				background-color: #f0f0f0;
				border: none !important;

				& :global(svg) {
					fill: #aaa;
				}
			}
		}

		.text {
			min-height: 1rem;
			text-box-edge: cap alphabetic;
			text-box-trim: trim-both;
			align-content: center;
		}

		&.border-accent {
			border: 1px solid hsl(var(--accent-color) 70% 60%);

			&:hover {
				border: 1px solid hsl(var(--accent-color) 90% 40%);
				box-shadow: 0 0 4px hsl(var(--accent-color) 65% 85%);
			}
		}

		&.reversed {
			flex-direction: row-reverse;
		}

		&.danger {
			color: hsl(0 70% 25%);
			background-color: hsl(0 100% 95%);
			border: 1px solid hsl(0 60% 40%);
			box-shadow: 0 0 4px hsl(0 65% 85%);
		}

		&.danger:hover {
			color: hsl(0 100% 20%);
			background-color: hsl(0 80% 85%);
			border: 1px solid hsl(0 60% 30%);
			box-shadow: 0 0 4px hsl(0 65% 75%);
		}

		&.success {
			background-color: hsl(140, 100%, 95%);
			border: 1px solid hsl(140 80% 40%);
			box-shadow: 0 0 4px hsl(140 65% 85%);
		}

		&.success:hover {
			background-color: hsl(140 80% 85%);
			border: 1px solid hsl(140 60% 30%);
			box-shadow: 0 0 4px hsl(140 65% 75%);
		}

		&.ghost {
			color: hsl(var(--accent-color) 70% 15%);
			background-color: transparent;
			border: 1px solid transparent;
			box-shadow: none;

			&:hover {
				color: hsl(var(--accent-color) 70% 15%);
				background-color: hsl(var(--accent-color) 90% 97.5%);
				border: 1px solid hsl(var(--accent-color) 80% 50%);
				box-shadow: 0 0 4px hsl(var(--accent-color) 65% 85%);
			}

			&.disabled,
			&.disabled:hover {
				border: none !important;
			}
		}

		&.round {
			width: 2rem;
			height: 2rem;
			border-radius: 50%;
			padding: 0.25rem;
		}

		&.stack {
			gap: 0.25rem;
		}
	}

	.gold {
		color: hsl(25 90% 20%);
		font-size: 1.5rem;
		text-shadow: 0 2px 3px hsl(48 95% 75%);
		text-transform: uppercase;
		border: 1px solid hsl(35 90% 30%);
		box-shadow:
			0 3px 6px hsla(0, 0%, 0%, 0.15),
			0 3px 6px hsla(40, 70%, 25%, 0.4),
			inset 0 -2px 5px 1px hsl(27 89% 29%),
			inset 0 -1px 1px 3px hsl(48 92% 75%);
		background-image: linear-gradient(
			160deg,
			hsl(30 90% 42.5%),
			hsl(40 85% 45%),
			hsl(50 92.5% 82.5%),
			hsl(50 95% 85%),
			hsl(40 80% 45%),
			hsl(30 90% 42.5%)
		);
		background-size: 100% 100%;
		background-position: center;
		transition: all 0.2s ease-in-out;
		overflow: hidden;

		&:hover {
			color: hsla(25, 95%, 20%, 0.9);
			text-shadow: 0 2px 2px hsl(48 95% 60%);
			border: 1px solid hsla(35, 95%, 35%, 0.6);
			background-size: 150% 150%;
			background-position: 75% 75%;
			box-shadow:
				0 4px 6px hsla(0, 0%, 0%, 0.1),
				0 4px 6px hsla(0, 0%, 0%, 0.15),
				inset 0 -2px 5px 1px hsl(45 85% 35%),
				inset 0 -1px 1px 3px hsl(48 90% 70%);
		}
	}
</style>
