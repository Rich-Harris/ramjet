const htmlContainer = document.createElement( 'div' );

htmlContainer.style.position = 'absolute';
htmlContainer.style.top = htmlContainer.style.left = '0';
htmlContainer.style.width = htmlContainer.style.height = '100%';
htmlContainer.style.overflow = 'visible';
htmlContainer.style.pointerEvents = 'none';
htmlContainer.setAttribute( 'class', 'ramjet-html' );

let count = 0;

function incrementHtml () {
	if ( !count ) {
		document.body.appendChild( htmlContainer );
	}

	count += 1;
}

function decrementHtml () {
	count -= 1;

	if ( !count ) {
		document.body.removeChild( htmlContainer );
	}
}

export { htmlContainer, incrementHtml, decrementHtml };