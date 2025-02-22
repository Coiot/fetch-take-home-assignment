<script lang="ts">
	import { onMount } from "svelte";
	import { WarningIcon, InfoIcon } from "../constants/icons";
	import { CleanNumber, FormatValue } from "../utilities/functions";
	import Icon from "./Icon.svelte";
	import Tooltip from "./Tooltip.svelte";

	interface Props {
		label?: string;
		value: string | number | boolean | null | undefined;
		id: string;
		class?: string;
		type?: string;
		format?: string | undefined;
		icon?: string | undefined;
		inline?: boolean;
		inputmode?: string | undefined;
		pattern?: string | undefined;
		disabled?: boolean;
		readonly?: boolean | undefined;
		required?: boolean | undefined;
		placeholder?: string | undefined;
		autocomplete?: string | undefined;
		maxlength?: number | null | undefined;
		minlength?: number | null | undefined;
		max?: string | number | undefined;
		min?: string | number | undefined;
		checked?: boolean | undefined;
		error?: string | undefined;
		mask?: string | undefined;
		replace?: string | undefined;
		accept?: string | RegExp | undefined;
		formatOnBlur?: boolean;
		group?: any;
		prependText?: string;
		appendText?: string;
		informationText?: string;
		warningText?: string;
		question?: boolean;
		inTransition?: any;
		password?: boolean;
		onchange?: (event: Event) => void;
	}

	let {
		label = "",
		value = $bindable(),
		id,
		class: className = "",
		type = "text",
		format = undefined,
		icon = undefined,
		inline = false,
		inputmode = undefined,
		pattern = undefined,
		disabled = false,
		readonly = undefined,
		required = undefined,
		placeholder = undefined,
		autocomplete = "off",
		maxlength = undefined,
		minlength = undefined,
		max = undefined,
		min = undefined,
		checked = $bindable(undefined),
		error = undefined,
		mask = undefined,
		replace = undefined,
		accept = undefined,
		formatOnBlur = false,
		group = undefined,
		prependText = undefined,
		appendText = undefined,
		informationText = undefined,
		warningText = undefined,
		question = false,
		inTransition = () => {},
		password = false,
		...rest
	}: Props = $props();

	let inputNode: HTMLInputElement | null = $state(null);
	let backspace = $state(false);
	let showPassword = $state(false);

	$effect(() => {
		placeholder = placeholder ?? mask;
	});

	let replaceSet = $derived(new Set(replace));
	let prev = $derived(((j) => Array.from(mask ?? "", (c, i) => (replaceSet.has(c) ? (j = i + 1) : j)))(0));
	let firstPlaceholderPos = $derived([...(mask ?? "")].findIndex((c) => replaceSet.has(c)));
	let acceptRegEx = $derived(accept instanceof RegExp ? accept : new RegExp(accept, "g"));

	const TypeWorkaround = (node: HTMLInputElement, type: string) => {
		node.setAttribute("type", type === "number" ? "text" : type);
	};

	$effect(() => {
		if (inputNode) {
			if (type === "checkbox") {
				checked = inputNode.checked;
			} else if (type === "date") {
				if (value) {
					value = new Date(value.toString()).toISOString().split("T").at(0);
				}
			}

			TypeWorkaround(inputNode, type);

			if (inputNode.value !== value && format) {
				value = FormatValue(CleanNumber(value), format);
				inputNode.value = value ? value.toString() : "";
			}
		}
	});

	function Clean(inputValue: string) {
		const inputMatch = inputValue?.match(acceptRegEx) || [];

		if (inputMatch.length === 0) {
			return [];
		}

		return Array.from(mask, (maskChar) => {
			if (inputMatch[0] === maskChar || replaceSet.has(maskChar)) {
				return inputMatch.shift() ?? maskChar;
			} else {
				return maskChar;
			}
		});
	}

	function HandleInput(e: Event & { currentTarget: HTMLInputElement }) {
		const el = e.currentTarget;
		if (mask) {
			ApplyMask(el, mask);
		} else if (accept) {
			ApplyAccept(el);
		}
	}

	function ApplyMask(el: HTMLInputElement, mask: string) {
		const [i, j] = [el.selectionStart, el.selectionEnd].map((i) => {
			i = Clean(el.value.slice(0, i ?? undefined)).findIndex((c) => replaceSet.has(c));
			return i < 0 ? prev[prev.length - 1] : backspace ? prev[i - 1] || firstPlaceholderPos : i;
		});
		value = Clean(el.value).join("");
		el.value = value;
		el.setSelectionRange(i, j);
		backspace = false;
	}

	function ApplyAccept(el: HTMLInputElement) {
		const cleanedValue = el.value.match(acceptRegEx)?.join("") ?? "";
		value = cleanedValue;
		el.value = value;
	}

	const ToggleShowPassword = () => {
		showPassword = !showPassword;
		if (inputNode) {
			inputNode.style.setProperty("-webkit-text-security", showPassword ? "none" : "square");
		}
	};

	$effect(() => {
		if (inputNode && password)
			inputNode.style.setProperty("-webkit-text-security", showPassword ? "none" : "square");
	});

	onMount(() => {
		if (mask) {
			value = Clean(String(value)).join("");
		}

		if (format === "currency") {
			accept = "[0-9.,\\$]";
			value = FormatValue(CleanNumber(value), format);
		}

		if (format === "percent") {
			accept = "[0-9.,%]";
			value = FormatValue(CleanNumber(value), format);
		}

		if (inputNode && value) {
			inputNode.value = value.toString();
		}

		if (password) {
			inputNode?.style.setProperty("-webkit-text-security", "square");
		}

		if (inputNode) {
			if (mask) ApplyMask(inputNode, mask);
			if (!mask && accept) ApplyAccept(inputNode);
		}
	});
</script>

<label for={id} class="input {className ?? ''} {error ? 'error' : ''}" class:inline {...rest} in:inTransition>
	<span class="label-text">
		{#if icon}
			<Icon source={icon} height=".9em" ariahidden />
		{/if}
		{label}{#if required}<span class="required" aria-hidden="true">*</span
			>{/if}{#if !(type == "checkbox" || group || type == "search" || question) && label !== ""}:{/if}
		{#if error}
			<Tooltip id={`${id}-error`} text={error} icon={WarningIcon} fill="red" live="assertive" />
		{/if}
	</span>

	{#if informationText}
		<span id="{id}-info" class="text-sm text-normal padding-block-end-quarter">
			<Icon source={InfoIcon} height=".9em" ariahidden />
			{informationText}
		</span>
	{/if}

	{#if warningText}
		<span id="{id}-warning" class="text-sm text-normal">
			<Icon source={WarningIcon} height=".9em" fill="red" ariahidden />
			{warningText}
		</span>
	{/if}

	<span class="input-container inline half">
		{#if prependText}
			<span class="self-align-end">
				{prependText}
			</span>
		{/if}
		{#if type === "textarea"}
			<textarea
				{id}
				name={id}
				bind:value
				{placeholder}
				{autocomplete}
				aria-autocomplete={autocomplete ? "none" : undefined}
				{maxlength}
				{minlength}
				{readonly}
				{disabled}
				{required}
				aria-invalid={!!error}
				aria-describedby={(() => {
					const describedBy = [
						error ? `${id}-error` : null,
						informationText ? `${id}-info` : null,
						warningText ? `${id}-warning` : null
					]
						.filter(Boolean)
						.join(" ");
					return describedBy ? describedBy : undefined;
				})()}
				spellcheck
			></textarea>
		{:else}
			<input
				bind:this={inputNode}
				{id}
				class:password
				name={id}
				bind:value
				type="text"
				{pattern}
				{inputmode}
				{placeholder}
				{autocomplete}
				aria-autocomplete={autocomplete ? "none" : undefined}
				{maxlength}
				{minlength}
				{max}
				{min}
				{readonly}
				{disabled}
				{required}
				{checked}
				aria-invalid={!!error}
				aria-required={required ? "true" : undefined}
				aria-describedby={(() => {
					const describedBy = [
						error ? `${id}-error` : null,
						informationText ? `${id}-info` : null,
						warningText ? `${id}-warning` : null
					]
						.filter(Boolean)
						.join(" ");
					return describedBy ? describedBy : undefined;
				})()}
				onblur={(e) => {
					if (value === mask) {
						value = "";
					}
					if (value && formatOnBlur) {
						value = FormatValue(CleanNumber(value), format);
					}
				}}
				onkeydown={(e) => (backspace = e.key === "Backspace")}
				oninput={HandleInput}
			/>
		{/if}

		{#if password && value}
			<button type="button" onclick={ToggleShowPassword} class="toggle-password">
				{showPassword ? "Hide" : "Show"}
			</button>
		{/if}

		{#if appendText}
			<span class="self-align-end">
				{appendText}
			</span>
		{/if}
	</span>
</label>

<style>
	.input {
		width: var(--width, 100%);
		display: flex;
		flex-direction: column;
		gap: 0.15rem;

		&.inline {
			flex-direction: row;
			align-items: center;
			gap: 1rem;
		}

		&:has(:global(input[type="checkbox"])) {
			--width: fit-content;
			min-height: auto;
			flex-direction: row-reverse;
			align-self: flex-start;
			gap: 0.5rem;

			& input,
			.input-container {
				min-width: fit-content;
				accent-color: hsl(var(--accent-color) 80% 50%);
			}

			input {
				accent-color: hsl(var(--accent-color) 80% 50%);
			}
		}

		& :global([type="checkbox"]) {
			min-height: auto !important;
		}

		.label-text {
			width: max-content;
			color: #333;
			text-wrap: nowrap;

			*:has(:global(svg)) {
				display: flex;
				align-items: center;
				gap: 0.25rem;
			}
		}

		.input-container {
			position: relative;
			min-width: var(--min-width, 10ch);
			width: var(--width, 100%);
		}

		&:has(:global(:is(input:not([type="checkbox"]):focus, textarea:focus))) .label-text {
			color: #000;
		}

		&:has(:global(input:disabled, textarea:disabled)) .label-text {
			color: #666;
		}
	}

	input,
	textarea {
		min-width: var(--min-width, 10ch);
		width: var(--width, 100%);
		color: #333;
		border: 1px solid #aaa;
		border-radius: 0.25rem;

		&:global(::placeholder) {
			color: #888;
			font-style: italic;
		}

		&:disabled {
			color: #666;
			border-color: #444;
			cursor: text;
		}

		&:not(:focus):user-invalid {
			color: red;
		}
	}

	input {
		min-height: 1.75rem;
		text-align: var(--text-align, left);
		field-sizing: content;
		padding-inline: 0.25rem;
	}

	textarea {
		min-height: 4cap;
		field-sizing: content;
		padding: 0.5rem;
		resize: vertical;

		&:disabled {
			resize: none;
		}
	}

	.toggle-password {
		position: absolute;
		right: 0.5rem;
		top: 50%;
		transform: translateY(-50%);
		color: hsl(220 100% 60%);
		background: transparent;
		border: none;
		cursor: pointer;

		&:hover {
			color: hsl(220 80% 40%);
		}
	}

	.password {
		padding-inline-end: 3.5rem !important;
	}
</style>
