import { svgns } from './svg';
import { TRANSFORM, TRANSFORM_ORIGIN } from './detect';
import { findTransformParent } from './findParent';

export const IDENTITY = [ 1, 0, 0, 1, 0, 0 ];

export function multiply ( [ a1, b1, c1, d1, e1, f1 ], [ a2, b2, c2, d2, e2, f2 ] ) {
	return [
		( a1 * a2 ) + ( c1 * b2 ),      // a
		( b1 * a2 ) + ( d1 * b2 ),      // b
		( a1 * c2 ) + ( c1 * d2 ),      // c
		( b1 * c2 ) + ( d1 * d2 ),      // d
		( a1 * e2 ) + ( c1 * f2 ) + e1, // e
		( b1 * e2 ) + ( d1 * f2 ) + f1  // f
	];
}

export function invert ( [ a, b, c, d, e, f ] ) {
	const determinant = ( a * d ) - ( c * b );

	return [
		d /  determinant,
		b / -determinant,
		c / -determinant,
		a /  determinant,
		( ( c * f ) - ( e * d ) ) / determinant,
		( ( e * b ) - ( a * f ) ) / determinant
	];
}

export function parseMatrixTransformString ( transform ) {
	if ( transform.slice( 0, 7 ) !== 'matrix(' ) {
		throw new Error( 'Could not parse transform string (' + transform + ')' );
	}

	return transform.slice( 7, -1 ).split( ' ' ).map( parseFloat );
}

export function parseTransformString ( transform ) {
	const div = document.createElement( 'div' );
	div.style.webkitTransform = div.style.transform = transform;

	document.body.appendChild( div );
	const style = getComputedStyle( div );
	const matrix = parseMatrixTransformString( style[ TRANSFORM ] );
	document.body.removeChild( div );

	return matrix;
}

export function getCumulativeTransformMatrix ( node ) {
	if ( node.namespaceURI === svgns ) {
		const { a, b, c, d, e, f } = node.getCTM();
		return [ a, b, c, d, e, f ];
	}

	let matrix = [ 1, 0, 0, 1, 0, 0 ];

	while ( node instanceof Element ) {
		const parentMatrix = getTransformMatrix( node );

		if ( parentMatrix ) {
			matrix = multiply( parentMatrix, matrix );
		}

		node = findTransformParent( node );
	}

	return matrix;
}

export function getTransformMatrix ( node ) {
	if ( node.namespaceURI === svgns ) {
		const ctm = getCumulativeTransformMatrix( node );
		const parentCTM = getCumulativeTransformMatrix( node.parentNode );
		return multiply( invert( parentCTM ), ctm );
	}

	const style = getComputedStyle( node );
	const transform = style[ TRANSFORM ];

	if ( transform === 'none' ) {
		return null;
	}

	const origin = ( style[ TRANSFORM_ORIGIN ] ).split( ' ' ).map( parseFloat );

	let matrix = parseMatrixTransformString( transform );

	// compensate for the transform origin (we want to express everything in [0,0] terms)
	matrix = multiply( [ 1, 0, 0, 1, origin[0], origin[1] ], matrix );
	matrix = multiply( matrix, [ 1, 0, 0, 1, -origin[0], -origin[1] ] );

	// TODO if is SVG, multiply by CTM, to account for viewBox

	return matrix;
}
