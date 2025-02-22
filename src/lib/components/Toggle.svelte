<script lang="ts">
	import Icon from "./Icon.svelte";

	interface Option {
		value?: string;
		text?: string;
		icon?: string;
	}

	interface Props {
		class?: string;
		checked: string | string[];
		options?: Option[];
		multiple?: boolean;
		onClickFunction?: () => void;
	}

	let {
		class: className = "",
		checked = $bindable(),
		options = [],
		multiple = false,
		onClickFunction,
		...rest
	}: Props = $props();

	const ToggleChecked = (option: Option) => {
		const optionValue = option.value ?? option.text ?? "";
		if (multiple) {
			if (Array.isArray(checked)) {
				checked = checked.includes(optionValue)
					? checked.filter((value) => value !== optionValue)
					: [...checked, optionValue];
			}
		} else {
			checked = optionValue;
		}
		onClickFunction?.();
	};

	const HandleKeyDown = (event: KeyboardEvent, option: Option) => {
		if (event.key === " " || event.key === "Enter") {
			event.preventDefault();
			ToggleChecked(option);
		}
	};
</script>

<div class="toggle-switch {className}" role="group" aria-label="Toggle options" {...rest}>
	{#each options as option, index}
		<button
			type="button"
			class="button {index === 0 ? 'left' : index === options.length - 1 ? 'right' : ''}"
			class:primary={Array.isArray(checked)
				? checked.includes(option.value ?? option.text ?? "")
				: checked === (option.value ?? option.text ?? "")}
			onclick={() => ToggleChecked(option)}
			onkeydown={(event) => HandleKeyDown(event, option)}
			aria-pressed={Array.isArray(checked)
				? checked.includes(option.value ?? option.text ?? "")
				: checked === (option.value ?? option.text ?? "")}
		>
			{#if option.icon}
				<Icon source={option.icon} height="1.75cap" />
			{/if}
			{option.text ?? option.value}
		</button>
	{/each}
</div>

<style>
	.toggle-switch {
		height: fit-content;
		max-width: fit-content;
		display: inline-flex;
		background-color: #eee;
		border: 1px solid #c9c9c9;
		border-radius: 0.75rem;
	}

	.button {
		min-width: 10ch;
		width: fit-content;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.4rem;
		color: #888;
		font-size: 1rem;
		font-weight: 500;
		text-decoration: none;
		line-height: 1;
		background-color: transparent;
		border: 1px solid transparent;
		padding: 0.4rem 0.5rem;
		overflow: hidden;
		white-space: nowrap;
		cursor: pointer;
		transition:
			background-color 0.25s ease-in-out,
			border 0.25s ease-in-out,
			color 0.25s ease-in-out;

		&:hover {
			color: #444;
			background-color: hsl(var(--accent-color) 70% 98%);
			border: 1px solid hsl(var(--accent-color) 65% 90%);
		}

		&.primary {
			color: #000;
			background-color: hsl(var(--accent-color) 95% 97.5%);
			border: 1px solid hsl(var(--accent-color) 80% 50%);
		}

		&.primary:hover {
			background-color: hsl(var(--accent-color) 85% 92.5%);
			border: 1px solid hsl(var(--accent-color) 80% 50%);
			box-shadow: 0 0 4px hsl(var(--accent-color) 90% 90%);
		}

		&.left {
			border-top-left-radius: 0.75rem;
			border-bottom-left-radius: 0.75rem;
		}

		&.right {
			border-top-right-radius: 0.75rem;
			border-bottom-right-radius: 0.75rem;
		}

		&:not(.left, .right) {
			border-right: 1px solid #c9c9c9;
		}

		&:focus {
			outline: 2px solid hsla(var(--accent-color) 80% 50% / 0.5);
		}
	}
</style>
