var borderRadiusRegex = /^(\d+)px(?: (\d+)px)?$/;

export default function parseBorderRadius ( str ) {
	const match = borderRadiusRegex.exec( str );

	return match[2] ?
		{ x: +match[1], y: +match[2] } :
		{ x: +match[1], y: +match[1] };
}