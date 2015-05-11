export default function cloneNode ( node ) {
	const clone = node.cloneNode();

	if ( node.nodeType === 1 ) {
		clone.setAttribute( 'style', window.getComputedStyle( node ).cssText );

		const len = node.childNodes.length;
		let i;

		for ( i = 0; i < len; i += 1 ) {
			clone.appendChild( cloneNode( node.childNodes[i] ) );
		}
	}

	return clone;
}