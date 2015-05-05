const svgns = 'http://www.w3.org/2000/svg';
const svgContainer = document.createElementNS( svgns, 'svg' );

svgContainer.style.position = 'fixed';
svgContainer.style.top = svgContainer.style.left = '0';
svgContainer.style.width = svgContainer.style.height = '100%';
svgContainer.style.overflow = 'visible';
svgContainer.style.pointerEvents = 'none';
svgContainer.setAttribute( 'class', 'ramjet-svg' );

let count = 0;

function incrementSvg () {
	if ( !count ) {
		document.body.appendChild( svgContainer );
	}

	count += 1;
}

function decrementSvg () {
	count -= 1;

	if ( !count ) {
		document.body.removeChild( svgContainer );
	}
}

export { svgContainer, incrementSvg, decrementSvg, svgns };