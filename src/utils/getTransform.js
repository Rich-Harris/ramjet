export default function getTransform ( isSvg, cx, cy, dx, dy, dsx, dsy, t ) {
	if ( isSvg ) {
		return `translate(${cx}px,${cy}px) scale(${( 1 + ( t * dsx ) )},${( 1 + ( t * dsy ) )}) translate(-${cx}px,-${cy}px) translate(${( t * dx )}px,${( t * dy )}px)`;
	}

	return `translate(${( t * dx )}px,${( t * dy )}px) scale(${( 1 + ( t * dsx ) )},${( 1 + ( t * dsy ) )})`;
}
