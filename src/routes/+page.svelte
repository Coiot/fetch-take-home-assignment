<script lang="ts">
	import { DoFetchWithoutJSON, DoFetch, DoGet, GetCityState } from "$lib/utilities/functions";
	import {
		ChevronUpIcon,
		ChevronDownIcon,
		PawIcon,
		DogIcon,
		HandIcon,
		HeartIcon,
		BoneIcon,
		SadIcon,
		HumanIcon
	} from "$lib/constants/icons";
	import { favoriteDogs } from "$lib/stores/favorites";
	import Button from "$lib/components/Button.svelte";
	import Input from "$lib/components/Input.svelte";
	import CheckboxSelect from "$lib/components/CheckboxSelect.svelte";
	import Icon from "$lib/components/Icon.svelte";
	import Label from "$lib/components/Label.svelte";
	import Pagination from "$lib/components/Pagination.svelte";
	import Toggle from "$lib/components/Toggle.svelte";
	import { fly, slide } from "svelte/transition";

	let auth = $state(false);
	let name = $state("");
	let email = $state("");

	let dogs = $state<Dog[]>([]);
	let dogIDs = $state<string[]>([]);
	let totalDogs = $state(0);
	let selectedBreeds = $state<string[]>([]);
	let breedOptions = $state([]);
	let minAge = $state(0);
	let maxAge = $state(14);
	let selectedZipcodes = $state<string>("");

	let showFavorites = $state(false);
	let isFavorite = (dogId: string) => $favoriteDogs.includes(dogId);

	let filteredDogs = $derived.by(() => {
		let dogsToFilter = showFavorites ? dogs.filter((dog) => $favoriteDogs.includes(dog.id)) : dogs;
		if (selectedBreeds.length > 0) {
			dogsToFilter = dogsToFilter.filter((dog) => selectedBreeds.includes(dog.breed));
		}
		if (minAge) {
			dogsToFilter = dogsToFilter.filter((dog) => dog.age >= minAge);
		}
		if (maxAge) {
			dogsToFilter = dogsToFilter.filter((dog) => dog.age <= maxAge);
		}
		if (selectedZipcodes) {
			dogsToFilter = dogsToFilter.filter((dog) => dog.zip_code && selectedZipcodes.includes(dog.zip_code));
		}
		return dogsToFilter;
	});

	let matchedDog = $state<Dog | null>(null);
	let matchDialog: HTMLDialogElement | null = null;
	let lastMatchedDogId: string | null = null;

	let currentPage = $state(1);
	let dogsPerPage = $state(10);
	let totalPages = $derived(Math.ceil(totalDogs / dogsPerPage));

	let sortField = $state("breed");
	let sortDirection = $state("asc");

	const API_URL = "https://frontend-take-home-service.fetch.com";

	interface Dog {
		id: string;
		img: string;
		name: string;
		age: number;
		breed: string;
		city?: string;
		state?: string;
		zip_code?: string;
	}

	function SortDogs() {
		dogs = [...dogs].sort((a, b) => {
			let valA = a[sortField as keyof Dog];
			let valB = b[sortField as keyof Dog];
			if (typeof valA === "string") valA = valA.toLowerCase();
			if (typeof valB === "string") valB = valB.toLowerCase();
			if (valA === undefined) return sortDirection === "asc" ? -1 : 1;
			if (valB === undefined) return sortDirection === "asc" ? 1 : -1;
			return sortDirection === "asc" ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
		});
	}

	async function HandleLogin() {
		try {
			let request = { name, email };
			let response = await DoFetchWithoutJSON(`${API_URL}/auth/login`, request, {
				credentials: "include"
			});

			if (response.status === 200) {
				GetBreeds();
				await GetDogs();
				auth = true;
			}
		} catch (error) {
			console.error("Login failed:", error);
		}
	}

	async function GetDogs() {
		if (showFavorites) {
			dogs = await DoFetch(`${API_URL}/dogs`, $favoriteDogs, false, {
				credentials: "include"
			});
			SortDogs();
			for (let dog of dogs) {
				if (dog.zip_code) {
					const { city, state } = await GetCityState(dog.zip_code);
					dog.city = city;
					dog.state = state;
				}
			}
			return;
		}

		try {
			document.startViewTransition(async () => {
				let queryParams = new URLSearchParams();
				if (selectedBreeds.length > 0) selectedBreeds.forEach((breed) => queryParams.append("breeds", breed));
				if (minAge) queryParams.append("ageMin", minAge.toString());
				if (maxAge) queryParams.append("ageMax", maxAge.toString());
				if (selectedZipcodes) queryParams.append("zipCodes", selectedZipcodes);
				queryParams.append("size", dogsPerPage.toString());
				queryParams.append("from", ((currentPage - 1) * dogsPerPage).toString());
				queryParams.append("sort", `${sortField}:${sortDirection}`);

				let response: { resultIds: string[]; total: number } = await DoGet(
					`${API_URL}/dogs/search?${queryParams.toString()}`,
					{
						credentials: "include"
					}
				);

				dogIDs = response.resultIds;
				totalDogs = response.total;

				let dogsResponse: Dog[] = await DoFetch(`${API_URL}/dogs/`, dogIDs, false, {
					credentials: "include"
				});

				dogs = dogsResponse;

				for (let dog of dogs) {
					if (dog.zip_code) {
						const { city, state } = await GetCityState(dog.zip_code);
						dog.city = city;
						dog.state = state;
					}
				}
			});
		} catch (error) {
			console.error("Failed to fetch dogs:", error);
		}
	}

	async function GetBreeds() {
		try {
			let breedList = await DoGet(`${API_URL}/dogs/breeds`, {
				credentials: "include"
			});
			breedOptions = breedList.map((breed: string) => ({ value: breed, text: breed }));
		} catch (error) {
			console.error("Failed to fetch breeds:", error);
		}
	}

	async function ResetPage() {
		currentPage = 1;
		await GetDogs();
	}

	async function ToggleSortField(field: string) {
		if (sortField === field) {
			sortDirection = sortDirection === "asc" ? "desc" : "asc";
		} else {
			sortField = field;
			sortDirection = "asc";
		}
		await GetDogs();
	}

	function ToggleFavorite(dogId: string) {
		favoriteDogs.update((favorites) => {
			if (favorites.includes(dogId)) {
				return favorites.filter((id) => id !== dogId);
			} else {
				return [...favorites, dogId];
			}
		});
	}

	async function FindMatch() {
		if ($favoriteDogs.length === 0) {
			alert("You need to favorite at least one dog first!");
			return;
		}

		try {
			let response: { match: string };
			let matchedDogId;
			do {
				response = await DoFetch(`${API_URL}/dogs/match`, $favoriteDogs, false, {
					credentials: "include"
				});
				matchedDogId = response.match;
			} while ($favoriteDogs.length > 1 && matchedDogId === lastMatchedDogId);

			lastMatchedDogId = matchedDogId;

			let dogResponse: Dog[] = await DoFetch(`${API_URL}/dogs`, [matchedDogId], false, {
				credentials: "include"
			});
			if (dogResponse[0].zip_code) {
				const { city, state } = await GetCityState(dogResponse[0].zip_code);
				dogResponse[0].city = city;
				dogResponse[0].state = state;
			}
			matchedDog = dogResponse[0];
			matchDialog?.showModal();
		} catch (error) {
			console.error("Failed to find a match:", error);
			alert("Failed to find a match. Please try again.");
		}
	}

	function CloseMatchDialog() {
		matchDialog?.close();
		matchedDog = null;
	}

	function HandleLogout() {
		try {
			DoFetch(`${API_URL}/auth/logout`, {}, false, {
				credentials: "include"
			});
			auth = false;
		} catch (error) {
			console.error("Failed to logout:", error);
			alert("Failed to logout. Please try again.");
		}
	}
</script>

{#if !auth}
	<form class="login-form">
		<h1>Welcome to Fi-Do</h1>
		<p class="inline quarter flex-wrap">
			<strong>Fi-Do</strong> will help you
			<strong class="inline quarter">Find your Dog <Icon height="2rem" source={DogIcon} /></strong>
		</p>
		<p>Start by entering your name and email</p>
		<Input id="name" label="Name" bind:value={name} />
		<Input id="email" label="Email" bind:value={email} />
		<Button
			variant="action"
			class="margin-block-start-half"
			icon={PawIcon}
			height="1.5rem"
			text="Login"
			--font-size="1.15rem"
			--align-self="end"
			onclick={HandleLogin}
		/>
	</form>
{/if}

{#if auth}
	<a href="#dogs" class="skip-link">Skip to Dogs</a>

	<section class="page-content">
		<aside class="sidebar">
			<div class="inline between">
				<strong class="inline half"><Icon height="1.75rem" source={HumanIcon} /> {name}</strong>

				<Button text="Logout" onclick={HandleLogout} />
			</div>

			<hr />

			<Toggle
				checked={showFavorites ? "favorites" : "all"}
				options={[
					{ value: "all", text: "View All", icon: DogIcon },
					{ value: "favorites", text: "View Favorites", icon: HeartIcon }
				]}
				onClickFunction={() => {
					showFavorites = !showFavorites;
					selectedBreeds = [];
					minAge = 0;
					maxAge = 14;
					selectedZipcodes = "";
					sortField = "breed";
					sortDirection = "asc";
					currentPage = 1;
					GetDogs();
				}}
			/>

			<Button
				variant="action"
				icon={BoneIcon}
				height="1.25rem"
				text="Find your Match"
				onclick={FindMatch}
				title={$favoriteDogs.length === 0 ? "Find a match from your favorites!" : undefined}
				disabled={$favoriteDogs.length === 0}
				--width="100%"
			/>

			<Label text="Sort by Category:">
				<div class="inline half">
					<Button
						text="Breed"
						variant={sortField === "breed" ? "action" : ""}
						class="reversed"
						icon={sortField === "breed"
							? sortDirection === "asc"
								? ChevronUpIcon
								: ChevronDownIcon
							: ChevronDownIcon}
						onclick={() => ToggleSortField("breed")}
					/>
					<Button
						text="Name"
						variant={sortField === "name" ? "action" : ""}
						class="reversed"
						icon={sortField === "name"
							? sortDirection === "asc"
								? ChevronUpIcon
								: ChevronDownIcon
							: ChevronDownIcon}
						onclick={() => ToggleSortField("name")}
					/>
					<Button
						text="Age"
						variant={sortField === "age" ? "action" : ""}
						class="reversed"
						icon={sortField === "age"
							? sortDirection === "asc"
								? ChevronUpIcon
								: ChevronDownIcon
							: ChevronDownIcon}
						onclick={() => ToggleSortField("age")}
					/>
				</div>
			</Label>

			<CheckboxSelect
				id="breeds"
				label="Search by Breed"
				options={breedOptions}
				bind:value={selectedBreeds}
				onchange={ResetPage}
				search
				--width="fit-content"
			/>

			<div class="inline">
				<Input
					id="minAge"
					type="number"
					label="Min Age"
					bind:value={minAge}
					accept="\d+$"
					--width="8ch"
					onchange={ResetPage}
				/>
				<Input
					id="maxAge"
					type="number"
					label="Max Age"
					bind:value={maxAge}
					accept="\d+$"
					--width="8ch"
					onchange={ResetPage}
				/>
			</div>

			<Input
				id="zipcodes"
				label="Search by Zipcode"
				bind:value={selectedZipcodes}
				onchange={ResetPage}
				--width="fit-content"
			/>
		</aside>

		<section class="stack">
			{#if !showFavorites}
				<Pagination bind:currentPage bind:dogsPerPage {totalPages} {GetDogs} />
			{/if}

			{#if filteredDogs.length > 0}
				<div id="dogs" class="dogs-container">
					{#each filteredDogs as dog}
						<article class="dog-card" transition:fly>
							<img src={dog.img} alt={dog.name} />
							<div class="stack half">
								<strong class="text-lg">{dog.name}</strong>
								<span class="inline center">
									<p>{dog.age}</p>
									|
									<p>{dog.breed}</p>
								</span>
								<p>{dog.city}, {dog.state} ({dog.zip_code})</p>
							</div>

							<Button
								icon={isFavorite(dog.id) ? SadIcon : HandIcon}
								height="1.5rem"
								text={isFavorite(dog.id) ? "Remove from Favorites" : "Add to Favorites"}
								variant={isFavorite(dog.id) ? "danger" : "action"}
								onclick={() => ToggleFavorite(dog.id)}
							/>
						</article>
					{/each}
				</div>

				{#if !showFavorites}
					<Pagination bind:currentPage bind:dogsPerPage {totalPages} {GetDogs} />
				{/if}
			{:else}
				<section class="card">
					{#if showFavorites}
						<strong>You have not added any dogs as favorites!</strong>
					{:else}
						<strong>No dogs found! Try adjusting the filters.</strong>
					{/if}
				</section>
			{/if}
		</section>
	</section>
{/if}

<dialog bind:this={matchDialog} class="match-dialog">
	<h2>Your Match!</h2>
	{#if matchedDog}
		<img src={matchedDog.img} alt={matchedDog.name} />
		<div class="stack half">
			<strong class="text-lg">{matchedDog.name}</strong>
			<span class="inline center">
				<p>{matchedDog.age}</p>
				|
				<p>{matchedDog.breed}</p>
			</span>
			<p>{matchedDog.city}, {matchedDog.state} ({matchedDog.zip_code})</p>
		</div>
	{:else}
		<p>No match found. Try again!</p>
	{/if}
	<div class="inline between margin-block-start">
		<Button text="Another Match" onclick={FindMatch} />
		<Button text="Keep Searching" onclick={CloseMatchDialog} />
	</div>
</dialog>

<style>
	.skip-link {
		position: absolute;
		top: -5rem;
		left: 0;
		color: #fff;
		font-size: 1.1rem;
		font-weight: 600;
		background: #000;
		padding: 1rem 2rem;
		z-index: 100;
	}

	.skip-link:focus {
		top: 0;
	}

	.login-form {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		min-height: 20rem;
		min-inline-size: 20rem;
		max-inline-size: fit-content;
		display: flex;
		flex-direction: column;
		align-items: start;
		justify-content: center;
		gap: 1rem;
		background-color: #fff;
		border: 2px solid hsl(var(--accent-color), 40%, 40%);
		border-radius: 0.5rem;
		box-shadow: 0 2px 4px hsl(var(--accent-color), 70%, 70%);
		padding: 2rem;
		margin: auto;
	}

	.page-content {
		display: grid;
		grid-template-columns: 25rem auto;
		gap: 2rem;

		@media (max-width: 60rem) {
			grid-template-columns: 1fr;
		}
	}

	.sidebar {
		inline-size: 100%;
		block-size: max-content;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		background-color: #fff;
		border: 2px solid hsl(var(--accent-color), 40%, 40%);
		border-radius: 0.5rem;
		box-shadow: 0 2px 4px hsl(var(--accent-color), 70%, 70%);
		padding: 1rem;

		@media (min-width: 60.01rem) {
			position: sticky;
			top: 2rem;
		}
	}

	.dogs-container {
		height: 100%;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
		gap: 2rem;
		scroll-margin-top: 2rem;

		.dog-card {
			block-size: fit-content;
			max-block-size: 30rem;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 1rem;
			padding: 1rem;
			border: 2px solid hsl(var(--accent-color), 40%, 40%);
			border-radius: 0.5rem;
			box-shadow: 0 2px 4px hsl(var(--accent-color), 70%, 70%);
			background-color: #fff;
			text-align: center;
			view-timeline-name: dogs-transition;

			img {
				width: 18rem;
				height: 18rem;
				object-fit: cover;
				border: 2px solid hsl(var(--accent-color), 40%, 20%);
				border-radius: 0.5rem;

				@media (max-width: 60rem) {
					width: 15rem;
					height: 15rem;
				}
			}
		}
	}

	.card {
		font-size: 1.5rem;
		background-color: #fff;
		border: 2px solid hsl(var(--accent-color), 40%, 40%);
		border-radius: 0.5rem;
		box-shadow: 0 2px 4px hsl(var(--accent-color), 70%, 70%);
		padding: 4rem;
		margin: auto;
	}

	.match-dialog {
		max-inline-size: 25rem;
		position: absolute;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
		background-color: #fff;
		border: 2px solid hsl(var(--accent-color), 40%, 40%);
		border-radius: 0.5rem;
		box-shadow: 0 2px 8px hsl(var(--accent-color), 20%, 60%);
		padding: 2rem;

		&[open] {
			opacity: 1;
			top: 50%;
			transition:
				opacity 0.4s ease-in-out,
				top 0.25s ease-in-out;

			@starting-style {
				opacity: 0;
				top: -10%;
			}
		}

		img {
			width: 20rem;
			height: 20rem;
			height: auto;
			object-fit: cover;
			border: 2px solid hsl(var(--accent-color), 40%, 20%);
			border-radius: 0.5rem;
			margin-block: 1rem;

			@media (max-width: 60rem) {
				width: 12rem;
				height: 12rem;
			}
		}

		&::backdrop {
			background-color: hsla(var(--accent-color) 60% 10% / 0.5);
		}

		@media (max-width: 60rem) {
			padding: 1rem;
		}
	}

	:global(html:has(dialog[open])) {
		overflow: hidden;
	}
</style>
