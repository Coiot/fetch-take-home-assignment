<script lang="ts">
	import Button from "$lib/components/Button.svelte";
	import Select from "$lib/components/Select.svelte";
	import { ChevronLeftIcon, ChevronRightIcon } from "$lib/constants/icons";

	interface Props {
		currentPage?: number;
		dogsPerPage?: number;
		totalPages?: number;
		GetDogs?: () => void;
	}

	let {
		currentPage = $bindable(1),
		dogsPerPage = $bindable(10),
		totalPages = 1,
		GetDogs = () => {}
	}: Props = $props();

	const pageSizes = [
		{ value: 5, text: "5" },
		{ value: 10, text: "10" },
		{ value: 25, text: "25" },
		{ value: 50, text: "50" },
		{ value: 100, text: "100" }
	];

	function nextPage() {
		if (currentPage < totalPages) {
			currentPage++;
			GetDogs();
		}
	}

	function prevPage() {
		if (currentPage > 1) {
			currentPage--;
			GetDogs();
		}
	}

	let pageOptions = $derived(Array.from({ length: totalPages }, (_, i) => ({ value: i + 1, text: `Page ${i + 1}` })));
</script>

<div class="pagination">
	<Button
		class="prev-page"
		icon={ChevronLeftIcon}
		text="Previous"
		onclick={prevPage}
		disabled={currentPage === 1}
		--margin-inline="0 auto"
	/>

	<Select
		id="dogs-per-page"
		label="Dogs Per Page"
		bind:value={dogsPerPage}
		options={pageSizes}
		onchange={GetDogs}
		--min-width="8ch"
		--width="fit-content"
		inline
	/>

	<Select
		id="page-select"
		bind:value={currentPage}
		options={pageOptions}
		onchange={GetDogs}
		--width="fit-content"
		inline
	/>

	<span>of {totalPages}</span>

	<Button
		class="reversed next-page"
		icon={ChevronRightIcon}
		text="Next"
		onclick={nextPage}
		disabled={currentPage >= totalPages}
		--margin-inline="auto 0"
	/>
</div>

<style>
	.pagination {
		container: pagination / inline-size;
		width: 100%;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 1rem;
		background-color: #fff;
		border: 2px solid hsl(var(--accent-color), 40%, 40%);
		border-radius: 0.5rem;
		box-shadow: 0 2px 8px hsl(var(--accent-color), 20%, 60%);
		padding: 0.5rem;
	}

	@container pagination (max-width: 50rem) {
		:global(.prev-page) {
			order: 1;
			--width: 45%;
		}

		:global(.next-page) {
			order: 2;
			--width: 45%;
		}
	}
</style>
