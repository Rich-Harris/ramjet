import styleKeys from '../utils/styleKeys';

export default function cloneNode ( node ) {
	const clone = node.cloneNode();

	let style;
	let len;
	let i;

	let attr;

	if ( node.nodeType === 1 ) {
		style = window.getComputedStyle( node );

		styleKeys.forEach( function ( prop ) {
			clone.style[ prop ] = style[ prop ];
		});

		len = node.childNodes.length;
		for ( i = 0; i < len; i += 1 ) {
			clone.appendChild( cloneNode( node.childNodes[i] ) );
		}
	}

	return clone;
}