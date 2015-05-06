export default function getTransform ( isSvg, left, top, dx, dy, dsx, dsy, t ) {
	const transform = isSvg ?
		`translate(${left} ${top}) scale(${( 1 + ( t * dsx ) )} ${( 1 + ( t * dsy ) )}) translate(${-left} ${-top}) translate(${( t * dx )} ${( t * dy )})` :
		`translate(${( t * dx )}px,${( t * dy )}px) scale(${( 1 + ( t * dsx ) )},${( 1 + ( t * dsy ) )})`;

	return transform;
}
