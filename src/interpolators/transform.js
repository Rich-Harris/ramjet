import { multiply } from '../utils/matrix';

// TODO refactor this, I have no idea how it works
export default function getTransformInterpolator ( a, b ) {
	const a_start = a.transform;
	const a_to_b = [ b.width / a.width, 0, 0, b.height / a.height, b.left - a.left, b.top - a.top ];
	const a_end = multiply( multiply( a.invertedParentCTM, a_to_b ), b.ctm );

	let transform = [];

	return function ( t ) {
		transform = a_start.map( ( from, i ) => {
			const to = a_end[i];

			return from + t * ( to - from );
		});

		return `matrix(${transform.join(',')})`;
	};
}
