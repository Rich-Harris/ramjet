export default function getBorderRadius ( a, b, dsx, dsy, t ) {
	const sx = 1 + ( t * dsx );
	const sy = 1 + ( t * dsy );

	return a.map( ( from, i ) => {
		const to = b[i];

		const rx = ( from + t * ( to - from ) ) / sx;
		const ry = ( from + t * ( to - from ) ) / sy;

		return `${rx}px ${ry}px`;
	});
}