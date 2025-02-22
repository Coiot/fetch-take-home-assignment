export function clickOutside(node) {
	window.addEventListener("click", handleClick);

	function handleClick(e) {
		if (!node.contains(e.target)) {
			node.dispatchEvent(new CustomEvent("outsideclick"));
		}
	}

	return {
		destroy() {
			window.removeEventListener("click", handleClick);
		}
	};
}

export async function GetCityState(zipcode) {
	try {
		const response = await fetch(`https://api.zippopotam.us/us/${zipcode}`);
		if (!response.ok) {
			throw new Error("Failed to fetch city and state information");
		}
		const data = await response.json();
		return {
			city: data.places[0]["place name"],
			state: data.places[0]["state abbreviation"]
		};
	} catch (error) {
		console.error("Error fetching city and state information:", error);
		return { city: "", state: "" };
	}
}

export async function DoFetch(url, request, throwsError = false, config = {}) {
	const response = await fetch(`${url}`, {
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json"
		},
		method: "POST",
		body: JSON.stringify(request),
		credentials: config.credentials || "same-origin"
	});

	if (response?.ok) {
		return response.json();
	} else {
		if (throwsError) {
			const errorString = `Error: ${response.statusText} - ${response.url} - ${response.status}`;
			throw new Error(errorString);
		}
	}
}

export async function DoFetchWithoutJSON(url, request, config = {}) {
	const response = await fetch(`${url}`, {
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json"
		},
		method: "POST",
		body: JSON.stringify(request),
		credentials: config.credentials || "same-origin"
	});

	if (response?.ok) {
		return response;
	} else {
		const errorString = `Error: ${response.statusText} - ${response.url} - ${response.status}`;
		throw new Error(errorString);
	}
}

export async function DoGet(url, config = {}) {
	const response = await fetch(`${url}`, {
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json"
		},
		method: "GET",
		credentials: config.credentials || "same-origin"
	});

	if (response?.ok) {
		return response.json();
	} else {
		const errorString = `Error: ${response.statusText} - ${response.url} - ${response.status}`;
		throw new Error(errorString);
	}
}

export function FormatValue(value, type, options = {}) {
	const { minimumFractionDigits = 0, maximumFractionDigits = 2, locale = "en-US" } = options;

	switch (type) {
		case "integer":
			return parseInt(value, 10).toLocaleString(locale);
		case "decimal":
			return parseFloat(value).toLocaleString(locale, {
				minimumFractionDigits,
				maximumFractionDigits
			});
		case "currency":
			return parseFloat(value).toLocaleString(locale, {
				style: "currency",
				currency: options.currency || "USD",
				minimumFractionDigits: 2,
				maximumFractionDigits
			});
		case "currencyRound":
			return parseFloat(value).toLocaleString(locale, {
				style: "currency",
				currency: options.currency || "USD",
				minimumFractionDigits: 0,
				maximumFractionDigits: 0
			});
		case "percent":
			return (parseFloat(value) / 100).toLocaleString(locale, {
				style: "percent",
				minimumFractionDigits,
				maximumFractionDigits: 4
			});
		case "percentRound":
			return (parseFloat(value) / 100).toLocaleString(locale, {
				style: "percent",
				minimumFractionDigits: 0,
				maximumFractionDigits: 0
			});
		case "percentFromDecimal":
			return (parseFloat(value) * 100).toLocaleString(locale, {
				style: "percent",
				minimumFractionDigits,
				maximumFractionDigits: 4
			});
		case "percentFromFraction":
			const [numerator, denominator] = value.split("/").map(Number);
			const fractionValue = numerator / denominator;
			return (fractionValue * 100).toLocaleString(locale, {
				style: "percent",
				minimumFractionDigits,
				maximumFractionDigits
			});
		case "number":
			value = value.toString();
			return (value = value.replace(/[^0-9]/g, ""));
		case "numbersFromCurrency":
			value = value.toString();
			return value.replace(/[^0-9.]/g, "").replace(/(\..*?)\./g, "$1");
		case "numberCommas":
			value = value.toString();
			return value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		case "phone":
			value = value.toString();
			return value.replace(/(\d{1,4})(\d{1,3})(\d{1,4})(\d{1,4})/, (match, p1, p2, p3, p4) => {
				return `(${p1}) ${p2}-${p3}${p4 ? "-" + p4 : ""}`;
			});
		case "date":
			return new Intl.DateTimeFormat(locale).format(new Date(value));
		case "longDate":
			return new Intl.DateTimeFormat(locale, {
				weekday: "long",
				year: "numeric",
				month: "long",
				day: "numeric"
			}).format(new Date(value));
		case "shortDate":
			return new Intl.DateTimeFormat(locale, { year: "2-digit", month: "numeric", day: "numeric" }).format(
				new Date(value)
			);
		case "datetime":
			return new Intl.DateTimeFormat(locale, { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
		case "time":
			return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
		case "timeWithSeconds":
			return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(
				new Date(value)
			);
		case "isoDate":
			return new Date(value).toISOString();
		case "relative":
			const diff = Date.now() - new Date(value).getTime();
			const seconds = Math.floor(diff / 1000);
			const minutes = Math.floor(seconds / 60);
			const hours = Math.floor(minutes / 60);
			const days = Math.floor(hours / 24);
			if (days > 0) return `${days} day${days !== 1 ? "s" : ""} ago`;
			if (hours > 0) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
			if (minutes > 0) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
			return `${seconds} second${seconds !== 1 ? "s" : ""} ago`;
		case "elapsedTime":
			const totalSeconds = parseInt(value, 10);
			const h = Math.floor(totalSeconds / 3600);
			const m = Math.floor((totalSeconds % 3600) / 60);
			const s = totalSeconds % 60;
			return [h, m, s].map((v) => (v < 10 ? "0" + v : v)).join(":");
		case "fileSize":
			const units = ["B", "KB", "MB", "GB", "TB"];
			let size = parseInt(value, 10);
			let unitIndex = 0;
			while (size >= 1024 && unitIndex < units.length - 1) {
				size /= 1024;
				unitIndex++;
			}
			return `${size.toFixed(2)} ${units[unitIndex]}`;

		default:
			return value;
	}
}

export function CleanNumber(val) {
	const NumbersAndDec = /[^\d.-]/g;
	if (val !== null && val !== undefined && typeof val !== "number") {
		let cleaned = val.toString().replace(NumbersAndDec, "");
		return cleaned !== "" ? Number(cleaned) : NaN;
	}
	return val;
}

export function outsideClick(node, callback) {
	document.addEventListener("click", handleClick, true);

	function handleClick(event) {
		if (!node.contains(event.target)) {
			callback();
		}
	}

	return {
		destroy() {
			document.removeEventListener("click", handleClick, true);
		}
	};
}
