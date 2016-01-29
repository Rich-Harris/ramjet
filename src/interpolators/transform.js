import { IDENTITY, multiply } from '../utils/matrix';

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

	let transform = [];

	return function ( t ) {
		a_start.forEach( ( from, i ) => {
			const to = matrix[i];
			transform[i] = from + t * ( to - from );
		});

		return `matrix(${transform.join(',')})`;
	};
}
