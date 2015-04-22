export default function addClass ( node, className ) {
	if ( node.classList ) {
		node.classList.remove( className );
		return;
	}

	var pattern = new RegExp( `\\b${className}\\b`, 'g' );
	if ( pattern.test( node.className ) ) {
		node.className = node.className.replace( pattern, '' );
	}
}