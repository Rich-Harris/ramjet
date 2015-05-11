export default function getBorderRadiusInterpolator ( a, b ) {
	// TODO fast path - no transition needed

	return function interpolator ( t ) {

	};
}



// const fromBorderRadius = getBorderRadius( from.borderRadius, to.borderRadius, dsxf, dsyf, t );
// const toBorderRadius = getBorderRadius( to.borderRadius, from.borderRadius, dsxt, dsyt, 1 - t );

// export default function getBorderRadius ( a, b, dsx, dsy, t ) {
// 	const sx = 1 + ( t * dsx );
// 	const sy = 1 + ( t * dsy );

// 	return a.map( ( from, i ) => {
// 		const to = b[i];

// 		const rx = ( from + t * ( to - from ) ) / sx;
// 		const ry = ( from + t * ( to - from ) ) / sy;

// 		return `${rx}px ${ry}px`;
// 	});
// }