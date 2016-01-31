import { IDENTITY, decompose, multiply } from '../utils/matrix';

function interpolateMatrices ( a, b ) {
	let transform = [];

	return function ( t ) {
		a.forEach( ( from, i ) => {
			const to = b[i];
			transform[i] = from + t * ( to - from );
		});

		return `matrix(${transform.join(',')})`;
	};
}

function interpolate ( a, b ) {
	const d = b - a;
	return t => a + t * d;
}

function getRotation ( radians ) {
	while ( radians > Math.PI ) radians -= Math.PI * 2;
	while ( radians < -Math.PI ) radians += Math.PI * 2;
	return radians;
}

function interpolateDecomposedTransforms ( a, b ) {
	const rotate = interpolate( getRotation( a.rotate ), getRotation( b.rotate ) );
	const skewX = interpolate( a.skewX, b.skewX );
	const scaleX = interpolate( a.scaleX, b.scaleX );
	const scaleY = interpolate( a.scaleY, b.scaleY );
	const translateX = interpolate( a.translateX, b.translateX );
	const translateY = interpolate( a.translateY, b.translateY );

	return function ( t ) {
		const transform = `translate(${translateX(t)}px, ${translateY(t)}px) rotate(${rotate(t)}rad) skewX(${skewX(t)}rad) scale(${scaleX(t)}, ${scaleY(t)})`;
		return transform;
	};
}

// TODO refactor this, I have no idea how it works
export default function getTransformInterpolator ( a, b ) {
	const scale_x = b.width / a.width;
	const scale_y = b.height / a.height;
	const d_x = b.left - a.left;
	const d_y = b.top - a.top;

	const a_start = a.transform;

	const move_a_to_b = [ 1, 0, 0, 1, d_x, d_y ];
	const scale_a_to_b = [ scale_x, 0, 0, scale_y, 0, 0 ];

	let matrix = IDENTITY;

	matrix = multiply( matrix, a.invertedParentCTM );
	matrix = multiply( matrix, move_a_to_b );
	matrix = multiply( matrix, b.ctm );
	matrix = multiply( matrix, scale_a_to_b );

	const decomposed_start = decompose( a_start );
	const decomposed_end = decompose( matrix );

	if ( !decomposed_start || !decomposed_end ) return interpolateMatrices( a_start, matrix );
	return interpolateDecomposedTransforms( decomposed_start, decomposed_end );
}
