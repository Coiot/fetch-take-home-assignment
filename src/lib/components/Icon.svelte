<script lang="ts">
	interface Props {
		source?: string;
		height?: string;
		width?: string;
		class?: string;
		fill?: string;
		stroke?: string;
		title?: string;
		ariahidden?: boolean;
		tabindex?: string;
	}

	let {
		source = "",
		height = "1rem",
		width,
		class: className = "",
		fill,
		stroke,
		title = "icon",
		ariahidden,
		tabindex = "-1"
	}: Props = $props();
</script>

{@html source.replace(
	/<svg/,
	`<svg
        ${className ? `class='${className}'` : ""}
        style="flex-shrink: 0"
        ${fill ? `fill="${fill}"` : ""}
        height="${height}"
        ${width ? `width="${width}"` : ""}
        ${stroke ? `stroke="${stroke}"` : ""}
        role="img"
        title="${title}"
        ${ariahidden !== undefined ? `aria-hidden="${ariahidden}"` : ""}
        focusable="false"
        ${tabindex ? `tabindex="${tabindex}"` : ""}
    `.trim()
)}
