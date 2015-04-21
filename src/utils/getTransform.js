export default function getTransform ( isSvg, cx, cy, dx, dy, dsx, dsy, t ) {
	const transform = isSvg ?
		`translate(${cx} ${cy}) scale(${( 1 + ( t * dsx ) )} ${( 1 + ( t * dsy ) )}) translate(${-cx} ${-cy}) translate(${( t * dx )} ${( t * dy )})` :
		`translate(${( t * dx )}px,${( t * dy )}px) scale(${( 1 + ( t * dsx ) )},${( 1 + ( t * dsy ) )})`;

	return transform;
}
