const bgColorRegexp= /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d?.\d+))?\)$/;

export default function parseColor ( str ) {
	const match = bgColorRegexp.exec( str );

	if ( !match ) return null;

	return {
		r: +match[1],
		g: +match[2],
		b: +match[3],
		alpha: match[4] ? +match[4] : 1
	};
}