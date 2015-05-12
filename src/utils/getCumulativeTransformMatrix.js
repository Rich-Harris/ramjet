import { multiply, parseMatrixTransformString } from './matrix';

// TODO it may turn out we don't need this after all

export default function getCumulativeTransformMatrix ( node ) {
	let matrix = [ 1, 0, 0, 1, 0, 0 ];

	while ( node instanceof Element ) {
		const parentMatrix = getTransformMatrix( node );

		if ( parentMatrix ) {
			matrix = multiply( parentMatrix, matrix );
		}

		node = node.parentNode;
	}

	return matrix;
}

function getTransformMatrix ( node ) {
	const style = getComputedStyle( node );
	const transform = style.webkitTransform || style.transform;

	if ( transform === 'none' ) {
		return null;
	}

	const origin = ( style.webkitTransformOrigin || style.transformOrigin ).split( ' ' ).map( parseFloat );

	let matrix = parseMatrixTransformString( transform );

	// compensate for the transform origin (we want to express everything in [0,0] terms)
	matrix = multiply( [ 1, 0, 0, 1, origin[0], origin[1] ], matrix );
	matrix = multiply( matrix, [ 1, 0, 0, 1, -origin[0], -origin[1] ] );

	return matrix;
}