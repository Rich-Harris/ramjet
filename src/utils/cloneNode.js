import styleKeys from './styleKeys';

export default function cloneNode ( node ) {
	var style, clone, len, i, attr;

	clone = node.cloneNode();

	if ( node.nodeType === 1 ) {
		style = window.getComputedStyle( node );

		styleKeys.forEach( function ( prop ) {
			clone.style[ prop ] = style[ prop ];
		});

		len = node.attributes.length;
		for ( i = 0; i < len; i += 1 ) {
			attr = node.attributes[i];
			clone.setAttribute( attr.name, attr.value );
		}

		len = node.childNodes.length;
		for ( i = 0; i < len; i += 1 ) {
			clone.appendChild( cloneNode( node.childNodes[i] ) );
		}
	}

	return clone;
}