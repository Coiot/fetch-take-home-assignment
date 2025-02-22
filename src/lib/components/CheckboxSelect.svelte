<script lang="ts">
	import { slide } from "svelte/transition";
	import { XCircleIcon, WarningIcon, SearchIcon } from "../constants/icons";
	import { outsideClick } from "$lib/utilities/functions";
	import Button from "./Button.svelte";
	import Icon from "./Icon.svelte";
	import Tooltip from "./Tooltip.svelte";

	interface Option {
		value: string | number;
		text?: string;
		icon?: string;
		forced?: boolean;
	}

	interface Props {
		label?: string;
		icon?: string | undefined;
		id: string;
		class?: string;
		name?: string;
		value?: (string | number)[] | null;
		options?: (string | Option)[];
		optionText?: string;
		optionValue?: string;
		searchDisplayNumber?: number;
		selectAll?: boolean;
		search?: boolean;
		placeholder?: string | null;
		inline?: boolean;
		autocomplete?: string;
		disabled?: boolean;
		required?: boolean | undefined;
		error?: string | undefined;
		customLabel?: ((item: any) => string) | null;
		onchange?: () => void;
		onCloseClick?: (() => void) | null;
		inTransition?: any;
	}

	let {
		label = "",
		icon = undefined,
		id,
		class: className = "",
		name = id,
		value = $bindable(null),
		options = [],
		optionText = "text",
		optionValue = "value",
		searchDisplayNumber = 8,
		selectAll = false,
		search = false,
		placeholder = null,
		inline = false,
		autocomplete = "off",
		disabled = false,
		required = undefined,
		error = undefined,
		customLabel = null,
		onchange = () => {},
		onCloseClick = null,
		inTransition = () => {},
		...rest
	}: Props = $props();

	export function UpdateOptions(newOptions) {
		options = newOptions;
		options?.forEach((option) => {
			if (typeof option !== "string" && option.forced) {
				HandleSelect(option);
			}
		});
	}

	let query: string = $state("");
	let searchInput: HTMLInputElement | null = $state(null);
	let details: HTMLDetailsElement | null = $state(null);
	let detailsWidth: number = $state(0);
	let listbox: HTMLUListElement | null = $state(null);
	let open: boolean = $state(false);
	const listboxId = `${id}-listbox`;
	let focusedIndex: number = 0;
	let uniqueId = `combobox-${crypto.randomUUID()}`;

	function OptionFunction(option: string | Option): Option {
		return typeof option === "string" ? { value: option, [optionText]: option } : option;
	}

	const OptionLabel = (item: Option): string => {
		return customLabel ? customLabel(item) : (item[optionText] ?? item[optionValue]);
	};

	const HandleSelect = (item: Option) => {
		if (value) {
			if (value.includes(item[optionValue])) {
				value = value.filter((val) => val !== item[optionValue]);
			} else {
				value = [...value, item[optionValue]];
			}
		} else {
			value = [item[optionValue]];
		}
		query = "";
		onchange();
	};

	const HandleSelectAll = (e) => {
		if (e.currentTarget.checked) {
			value = options.map((option) => OptionFunction(option)[optionValue]);
		} else {
			value = [];
		}
	};

	const HandleRemove = (item: Option) => {
		if (Array.isArray(value)) {
			value = value.filter((val) => val !== item[optionValue]);
			onchange();
		}
	};

	const HandleKeyDown = (event: KeyboardEvent) => {
		const focusableElements =
			listbox?.querySelectorAll('input, button, [href], [tabindex]:not([tabindex="-1"])') ?? [];
		if (event.key === "Escape") {
			open = false;
		} else if (event.key === "ArrowDown" || (event.key === "Tab" && !event.shiftKey)) {
			focusedIndex = (focusedIndex + 1) % focusableElements.length;
			event.preventDefault();
			(focusableElements[focusedIndex] as HTMLElement).focus();
		} else if (event.key === "ArrowUp" || (event.key === "Tab" && event.shiftKey)) {
			focusedIndex = (focusedIndex - 1 + focusableElements.length) % focusableElements.length;
			event.preventDefault();
			(focusableElements[focusedIndex] as HTMLElement).focus();
		} else if (event.key === "Enter" && open) {
			event.preventDefault();
			const currentItem = focusableElements[focusedIndex];
			if (currentItem && (currentItem as HTMLInputElement).type === "checkbox") {
				(currentItem as HTMLElement).click();
			} else if (currentItem && (currentItem as HTMLInputElement).type === "button") {
				(currentItem as HTMLElement).click();
			}
		}
	};

	function GetListboxPosition() {
		if (open) {
			const rect = details?.getBoundingClientRect();
			if (rect && listbox) {
				listbox.style.top = `${rect.top + rect.height}px`;
				listbox.style.left = `${rect.left}px`;
			}
		}
	}

	function CloseFunction() {
		if (onCloseClick) onCloseClick();
		open = false;
	}

	function OnClick(option: Option) {
		if (typeof option !== "string" && option.forced) {
			return "return false;";
		}
	}

	$effect(() => {
		if (open) {
			if (listbox) listbox.style.minWidth = `${detailsWidth}px`;
			if (details) details.style.position = "";
			searchInput?.focus();
			if (!CSS.supports("position-anchor", "--details")) {
				GetListboxPosition();
				window.addEventListener("scroll", GetListboxPosition, true);
			}
		} else {
			if (!CSS.supports("position-anchor", "--details")) {
				window.removeEventListener("scroll", GetListboxPosition, true);
			}
		}
	});

	let Selected = $derived(
		options.filter((option) => {
			const val = option?.[optionValue];
			return Array.isArray(value) ? value.includes(val) : value === val;
		})
	);

	let OptionList = $derived(
		options.filter((option) => {
			const label = (customLabel ? customLabel(option) : option?.[optionText]).toLowerCase();
			return label.includes(query.toLowerCase());
		})
	);
</script>

<label
	for={id}
	{...rest}
	class="checkbox-select {className} {error ? 'error' : ''}"
	class:inline
	class:disabled
	in:inTransition
>
	<span class="label-text">
		{#if icon}
			<Icon source={icon} />
		{/if}
		{label}{#if required}<span class="required" aria-hidden="true">*</span>{/if}:
		{#if error}
			<Tooltip id={`${id}-error`} text={error} icon={WarningIcon} fill="red" />
		{/if}
	</span>

	<details
		bind:this={details}
		style="anchor-name: --{uniqueId}"
		bind:clientWidth={detailsWidth}
		bind:open
		use:outsideClick={() => CloseFunction()}
	>
		<summary
			class="select"
			role="combobox"
			aria-expanded={open}
			aria-haspopup="listbox"
			aria-controls={listboxId}
			aria-owns={listboxId}
		>
			{#if Selected.length > searchDisplayNumber}
				<span class="option-text">{Selected.length} options selected</span>
			{:else}
				{#each Selected as val (val[optionValue])}
					<span class="badge">
						<span class="option-text">{OptionLabel(val)} </span>
						<Button
							variant="icon"
							onclick={() => HandleRemove(val)}
							icon={XCircleIcon}
							height="1rem"
							--padding-inline="0"
							--paddig-block="0"
							aria-label={`Remove ${OptionLabel(val)}`}
						/>
					</span>
					<input
						{id}
						type="hidden"
						{name}
						value={val[optionValue]}
						aria-required={required ? "true" : undefined}
						aria-describedby={error ? `${id}-error` : undefined}
					/>
				{/each}
			{/if}
		</summary>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<ul
			bind:this={listbox}
			onkeydown={HandleKeyDown}
			id={listboxId}
			style="position-anchor: --{uniqueId}"
			in:slide={{ duration: 200 }}
		>
			{#if search}
				<li class="filter-search">
					<Icon source={SearchIcon} height="1em" />
					<input
						bind:this={searchInput}
						{id}
						placeholder={placeholder ?? "Search..."}
						type="search"
						bind:value={query}
						aria-label="Search options"
						{autocomplete}
						aria-autocomplete={autocomplete ? "none" : undefined}
					/>
				</li>
			{/if}
			{#if selectAll}
				<li class="selector">
					<label for="{id}-checkboxselect-selectall" class="option">
						<input
							type="checkbox"
							id="{id}-checkboxselect-selectall"
							checked={value?.length === options.length}
							onchange={HandleSelectAll}
							aria-label="Select All"
						/>
						<span>Select All</span>
					</label>
				</li>
			{/if}
			{#each OptionList as item (OptionFunction(item)[optionValue])}
				{@const option = OptionFunction(item)}
				<li class="option">
					<label for={`${id}-option-${OptionLabel(option)}`}>
						<input
							type="checkbox"
							id={`${id}-option-${OptionLabel(option)}`}
							class:forced={option.forced}
							onclick={() => OnClick(option)}
							checked={value?.includes(option[optionValue])}
							onchange={() => HandleSelect(option)}
							aria-label={`Select ${OptionLabel(option)}`}
						/>
						<span>{OptionLabel(option)}</span>
					</label>
				</li>
			{/each}
			<li class="close">
				<input type="button" onclick={() => CloseFunction()} aria-label="Close options" />
				<span>Close</span>
			</li>
		</ul>
	</details>
</label>

<style>
	.checkbox-select {
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
			display: inline-flex;
			align-items: center;
			gap: 0.25rem;
			color: #333;
			text-wrap: pretty;
		}

		&:focus-within .label-text {
			color: #000;
		}

		&.disabled {
			& .label-text {
				color: #666;
			}

			& details {
				pointer-events: none;
				background-color: light-dark(rgba(239, 239, 239, 0.3), rgba(59, 59, 59, 0.3));
			}

			& summary {
				border-color: #444;
				cursor: text;
				color: #444;
			}

			cursor: text;
		}
	}

	details {
		position: relative;
		anchor-name: --details;
		anchor-scope: --details;
		min-width: 20ch;
		width: var(--width, 100%);

		@supports (position-anchor: --details) {
			position: initial;
		}
	}

	summary {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		flex-wrap: wrap;
		padding: 0.25rem;

		.badge {
			min-inline-size: fit-content;
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 0.25rem;
			color: #222;
			font-size: 0.8rem;
			text-decoration: none !important;
			white-space: nowrap;
			background: #eee;
			border: 1px solid #cecece;
			border-radius: 0.25rem;
			padding-block: 0.15rem;
			padding-inline-start: 0.25rem;
			margin: 0.1rem;

			&:not(:has(button)) {
				padding-inline: 0.5rem;
			}
		}
	}

	summary::-webkit-details-marker,
	summary::marker {
		display: none;
		content: none;
	}

	details ul {
		position: fixed;
		min-width: 12rem;
		min-height: 100px;
		max-height: 400px;
		list-style: none;
		overflow-y: auto;
		border-radius: 0.3rem;
		background: #fff;
		box-shadow: 0 0 8px rgba(0, 0, 0, 0.25);
		overscroll-behavior: contain;
		z-index: 1000;

		@supports (position-anchor: --details) {
			position-anchor: --details;
			position-try-fallbacks: flip-block;
			top: anchor(bottom);
		}

		& li {
			padding: 0.25rem;

			& input[type="button"] {
				position: absolute;
				inset: 0;
				opacity: 0;
			}

			&.option {
				input {
					accent-color: hsl(var(--accent-color) 80% 50%);

					&:focus {
						outline: none;
					}

					&.forced {
						accent-color: #444;
					}
				}

				label {
					width: 100%;
					display: flex;
					align-items: center;
					gap: 0.5rem;
					padding-inline: 0.5rem;

					&:hover,
					&:focus-within {
						color: #fff;
						background-color: #444;
						cursor: pointer;
					}
				}
			}

			&.selector {
				position: sticky;
				top: 0;
				display: flex;
				gap: 1rem;
				border-block-end: 1px solid #888;
				background-color: #fbfbfb;
				z-index: 1001;
				cursor: default;

				& label {
					width: 100%;
					display: flex;
					align-items: center;
					gap: 0.5rem;
					white-space: nowrap;
					padding: 0.25rem 0.5rem;
					cursor: pointer;

					&:hover,
					&:focus-within {
						color: #fff;
						background-color: #444;
						cursor: pointer;
					}

					& input {
						accent-color: hsl(var(--accent-color) 80% 50%);

						&:focus {
							outline: none;
						}
					}
				}
			}

			&.close {
				position: sticky;
				bottom: 0;
				height: 2rem;
				width: 100%;
				text-align: center;
				padding: 0.3rem 0.5rem;
				border-block-start: 1px solid #bbb;
				border-bottom-left-radius: 0.25rem;
				border-bottom-right-radius: 0.25rem;
				background-color: #fbfbfb;
				cursor: pointer;

				&:hover,
				&:focus-within {
					color: #fff;
					background-color: #444;
				}
			}
		}
	}

	.option-text {
		max-width: 20ch;
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.filter-search {
		position: sticky;
		top: 0;
		width: 100%;
		display: flex;
		align-items: center;
		color: currentColor;
		font-size: 1rem;
		font-weight: 600;
		background-color: #fff;
		border-block-end: 1px solid #bbb;
		border-top-left-radius: 0.25rem;
		border-top-right-radius: 0.25rem;
		padding-inline: 0.75rem;
		padding-block-end: 0.1rem;
		z-index: 100;

		& input {
			width: 100%;
			font-size: 1rem;
			font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
			font-weight: 600;
			border: none;
			padding-inline: 0.25rem;
			margin-inline-start: 0.5rem;

			&::placeholder {
				font-variant-caps: petite-caps;
			}
		}
	}
</style>
