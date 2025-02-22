<script lang="ts">
	import { WarningIcon, InfoIcon } from "../constants/icons";
	import Icon from "./Icon.svelte";
	import Tooltip from "./Tooltip.svelte";

	interface Option {
		value: string | number | null;
		text?: string;
		icon?: string;
		group?: string;
	}

	interface Props {
		label?: string;
		icon?: string | undefined;
		value: string | number | null | undefined;
		id: string;
		class?: string;
		options?: (Option | string)[];
		inline?: boolean;
		disabled?: boolean;
		required?: boolean | undefined;
		error?: string | undefined;
		informationText?: string | undefined;
		question?: boolean;
		inTransition?: any;
		onchange?: (event: Event) => void;
	}

	let {
		label = "",
		icon = undefined,
		value = $bindable(),
		id,
		class: className = "",
		options = [],
		inline = false,
		disabled = false,
		required = undefined,
		error = undefined,
		informationText = undefined,
		question = false,
		inTransition = () => {},
		...rest
	}: Props = $props();

	const Options = (option: Option | string): Option => {
		if (typeof option === "string") {
			return { value: option, text: option };
		}
		return option;
	};
</script>

<label for={id} {...rest} class="select-wrapper {className ?? ''} {error ? 'error' : ''}" class:inline in:inTransition>
	<span class="label-text">
		{#if icon}
			<Icon source={icon} />
		{/if}
		{label}{#if required}<span class="required" aria-hidden="true">*</span
			>{/if}{#if !question && label !== ""}:{/if}
		{#if error}
			<Tooltip id={`${id}-error`} text={error} icon={WarningIcon} fill="red" />
		{/if}
	</span>

	{#if informationText}
		<span class="text-sm text-normal padding-block-end-quarter">
			<Icon source={InfoIcon} height=".9em" ariahidden />
			{informationText}
		</span>
	{/if}

	<select
		class="select"
		bind:value
		{id}
		name={id}
		aria-label={label}
		{disabled}
		{required}
		aria-invalid={!!error}
		aria-required={required ? "true" : undefined}
		aria-describedby={error ? `${id}-error` : undefined}
	>
		{#each options as opt}
			{@const option = Options(opt)}
			{#if option.group}
				<optgroup label={option.group}>
					<option value={option.value}>
						{#if option.icon}
							<Icon source={option.icon} />
						{/if}
						{option.text ?? option.value}
					</option>
				</optgroup>
			{:else}
				<option value={option.value}>
					{#if option.icon}
						<Icon source={option.icon} />
					{/if}
					{option.text ?? option.value}
				</option>
			{/if}
		{/each}
	</select>
</label>

<style>
	.select-wrapper {
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

		&:has(:global(select:disabled)) .label-text {
			color: #666;
		}
	}

	.select {
		appearance: none;
		min-width: var(--min-width, 10ch);
		width: var(--width, 100%);
		min-height: 1.75rem;
		border: 1px solid #aaa;
		border-radius: 0.25rem;
		background-color: #fff;
		background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' class='selectSVG' fill='currentColor' viewBox='0 0 16 16' stroke='currentColor' stroke-width='1'> <path fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z' /> </svg>");
		background-position: right 0.5rem top 0.35rem;
		padding-inline: 0.5rem 2rem;

		&:hover {
			background-color: #444;
			background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' class='selectSVG' fill='white' viewBox='0 0 16 16' stroke='white' stroke-width='1'> <path fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z' /> </svg>");
			background-position: right 0.5rem top 0.35rem;
		}

		&:hover:not(:disabled) {
			color: #fff;
		}

		option {
			color: #444;
			font-size: 0.95rem;
			font-weight: 500;
			background-color: #fff;
			cursor: pointer;

			&:has(:global(svg)) {
				display: flex;
				align-items: center;
				gap: 0.25rem;
			}

			&:checked,
			&:active,
			&:hover {
				color: #fff;
				background-color: #444;
				box-shadow: 0 0 100px #444;
			}
		}

		&:disabled {
			color: #444;
			background-color: rgba(239, 239, 239, 0.3) !important;
			border-color: #444;
			cursor: text;

			&:hover {
				background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' class='selectSVG' fill='currentColor' viewBox='0 0 16 16' stroke='currentColor' stroke-width='1'> <path fill-rule='evenodd' d='M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z' /> </svg>") !important;
				background-position: right 0.5rem top 0.35rem !important;
			}
		}
	}
</style>
