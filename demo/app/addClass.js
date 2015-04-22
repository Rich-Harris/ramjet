export default function addClass ( node, className ) {
	if ( node.classList ) {
		node.classList.add( className );
		return;
	}

	var pattern = new RegExp( `\\b${className}\\b` );
	if ( !pattern.test( node.className ) ) {
		node.className += ' ' + className;
	}
}