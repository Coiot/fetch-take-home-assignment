<script lang="ts">
	import Icon from "./Icon.svelte";

	interface Props {
		id?: string;
		class?: string;
		text?: string;
		icon?: string | undefined;
		inline?: boolean;
		disabled?: boolean;
		fill?: string | undefined;
		children?: import("svelte").Snippet<[any]>;
	}

	let {
		id = "",
		class: className = "",
		text = "",
		icon = undefined,
		inline = false,
		disabled = false,
		fill = undefined,
		children,
		...rest
	}: Props = $props();
</script>

<div class="labeled-item {className ?? ''}" class:inline class:disabled {...rest}>
	<svelte:element this={id ? "label" : "strong"} {...id ? { for: id } : {}} class="label-text" style:color={fill}>
		{#if icon}
			<Icon source={icon} height=".9em" {fill} />
		{/if}
		{text}
	</svelte:element>
	<span class="item">
		{@render children?.({ id })}
	</span>
</div>

<style>
	.labeled-item {
		width: var(--width, 100%);
		display: flex;
		flex-direction: column;
		gap: 0.15rem;

		&.inline {
			flex-direction: row;
			align-items: center;
			gap: 1rem;
		}
		.label-text {
			width: max-content;
			color: #333;
			font-size: 0.95rem;
			text-wrap: pretty;

			*:has(:global(svg)) {
				display: flex;
				align-items: center;
				gap: 0.25rem;
			}
		}

		&:focus-within .label-text {
			color: #000;
		}

		&:has(:global(input:disabled, textarea:disabled)) .label-text,
		&.disabled .label-text {
			color: #666;
		}

		&:not(:has(input, textarea, select)) .label-text {
			cursor: default;
		}

		&.disabled :global(span) {
			color: #666;
		}
	}

	.item {
		width: 100%;
	}
</style>
