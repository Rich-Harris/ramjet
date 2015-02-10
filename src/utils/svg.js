var svgns = 'http://www.w3.org/2000/svg';
var svg = document.createElementNS( svgns, 'svg' );

svg.style.position = 'fixed';
svg.style.top = svg.style.left = '0';
svg.style.width = svg.style.height = '100%';
svg.style.overflow = 'visible';
svg.style.pointerEvents = 'none';
svg.setAttribute( 'class', 'mogrify-svg' );

document.body.appendChild( svg );

export { svg, svgns };