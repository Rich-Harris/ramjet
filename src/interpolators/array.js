export default function interpolateArray ( a, b ) {
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
