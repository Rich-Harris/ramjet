const svgns = 'http://www.w3.org/2000/svg';
const svg = document.createElementNS( svgns, 'svg' );

svg.style.position = 'fixed';
svg.style.top = svg.style.left = '0';
svg.style.width = svg.style.height = '100%';
svg.style.overflow = 'visible';
svg.style.pointerEvents = 'none';
svg.setAttribute( 'class', 'mogrify-svg' );

let appendedSvg = false;

function appendSvg () {
	document.body.appendChild( svg );
	appendedSvg = true;
}

export { svg, svgns, appendSvg, appendedSvg };