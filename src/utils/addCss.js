const head = document.getElementsByTagName( 'head' )[0];

export default function addCss ( css ) {
	let styleElement = document.createElement( 'style' );
	styleElement.type = 'text/css';

	// Internet Exploder won't let you use styleSheet.innerHTML - we have to
	// use styleSheet.cssText instead
	let styleSheet = styleElement.styleSheet;

	if ( styleSheet ) {
		styleSheet.cssText = css;
	} else {
		styleElement.innerHTML = css;
	}

	head.appendChild( styleElement );

	return () => head.removeChild( styleElement );
}
