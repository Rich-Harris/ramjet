// TODO refactor this, I have no idea how it works
export default function getTransformInterpolator ( a, b ) {
	const dx = b.left - a.left;
	const dy = b.top - a.top;

	const dsxf = ( b.width / a.width ) - 1;
	const dsyf = ( b.height / a.height ) - 1;

	const dsxt = ( a.width / b.width ) - 1;
	const dsyt = ( a.height / b.height ) - 1;

	let transform = {};

	return function ( t ) {
		transform.from = `translate(${( t * dx )}px,${( t * dy )}px) scale(${( 1 + ( t * dsxf ) )},${( 1 + ( t * dsyf ) )})`;

		t = 1 - t;
		transform.to   = `translate(${( -t * dx )}px,${( -t * dy )}px) scale(${( 1 + ( t * dsxt ) )},${( 1 + ( t * dsyt ) )})`;

		return transform;
	};
}