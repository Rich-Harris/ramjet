export default function getCumulativeOpacity ( node ) {
	let opacity = 1;

	while ( node instanceof Element && opacity ) {
		const style = getComputedStyle( node );

		if ( style.visibility === 'hidden' || style.display === 'none' ) {
			throw new Error( 'Ramjet: you cannot transition between nodes that have visibility: hidden or display: none (or their children)' );
		}

		opacity *= parseFloat( style.opacity );
		node = node.parentNode;
	}

	return opacity;
}