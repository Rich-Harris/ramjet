// Border radius is given as a string in the following form
//
//     tl.x tr.x br.x bl.x / tl.y tr.y br.y bl.y
//
// ...where t, r, b and l are top, right, bottom, left, and
// x and y are self-explanatory. Each value is followed by 'px'

// TODO it must be possible to do this more simply. Maybe have
// a flat array from the start?

export default function getBorderRadiusInterpolator ( a, b ) {
	// TODO fast path - no transition needed

	const aWidth = a.width;
	const aHeight = a.height;

	const bWidth = b.width;
	const bHeight = b.height;

	a = a.borderRadius;
	b = b.borderRadius;

	const a_x_t0 = [ a.tl.x, a.tr.x, a.br.x, a.bl.x ];
	const a_y_t0 = [ a.tl.y, a.tr.y, a.br.y, a.bl.y ];

	const b_x_t1 = [ b.tl.x, b.tr.x, b.br.x, b.bl.x ];
	const b_y_t1 = [ b.tl.y, b.tr.y, b.br.y, b.bl.y ];

	const a_x_t1 = b_x_t1.map( x => x * aWidth / bWidth );
	const a_y_t1 = b_y_t1.map( y => y * aHeight / bHeight );

	const b_x_t0 = a_x_t0.map( x => x * bWidth / aWidth );
	const b_y_t0 = a_y_t0.map( y => y * bHeight / aHeight );

	const ax = interpolateArray( a_x_t0, a_x_t1 );
	const ay = interpolateArray( a_y_t0, a_y_t1 );

	const bx = interpolateArray( b_x_t0, b_x_t1 );
	const by = interpolateArray( b_y_t0, b_y_t1 );

	let borderRadius = {};

	return function interpolator ( t ) {
		let x = ax( t );
		let y = ay( t );

		borderRadius.from = `${x.join('px ')}px / ${y.join('px ')}px`;

		x = bx( t );
		y = by( t );

		borderRadius.to = `${x.join('px ')}px / ${y.join('px ')}px`;

		return borderRadius;
	};
}

function interpolateArray ( a, b ) {
	const len = a.length;
	let array = new Array( len );

	return function ( t ) {
		let i = len;
		while ( i-- ) {
			array[i] = a[i] + t * ( b[i] - a[i] );
		}

		return array;
	};
}