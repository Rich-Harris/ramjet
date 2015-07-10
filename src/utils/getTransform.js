export default function getTransform ( isSvg, cx, cy, dx, dy, dsx, dsy, t, t_scale ) {
	const transform = isSvg ?
		`translate(${cx} ${cy}) scale(${( 1 + ( t_scale * dsx ) )} ${( 1 + ( t_scale * dsy ) )}) translate(${-cx} ${-cy}) translate(${( t * dx )} ${( t * dy )})` :
		`translate(${( t * dx )}px,${( t * dy )}px) scale(${( 1 + ( t_scale * dsx ) )},${( 1 + ( t_scale * dsy ) )})`;

	return transform;
}
