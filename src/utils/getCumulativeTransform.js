import { multiply, parseMatrixTransformString } from './matrix';

export default function getCumulativeTransform ( node ) {
	let matrix = [ 1, 0, 0, 1, 0, 0 ];

	while ( node instanceof Element ) {
		const style = getComputedStyle( node );
		const transform = style.webkitTransform || style.transform;

		if ( transform !== 'none' ) {
			const parentMatrix = parseMatrixTransformString( transform );
			matrix = multiply( parentMatrix, matrix );
		}

		node = node.parentNode;
	}

	return matrix;
}
