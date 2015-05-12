// TODO refactor this, I have no idea how it works
export default function getTransformInterpolator ( a, b ) {
	const dx = b.left - a.left;
	const dy = b.top - a.top;

	const dsxf = ( b.width  / a.width  ) - 1;
	const dsyf = ( b.height / a.height ) - 1;

	const dsxt = ( a.width  / b.width  ) - 1;
	const dsyt = ( a.height / b.height ) - 1;

	let transform = {};

	return function ( t ) {
		let x = t * dx;
		let y = t * dy;

		let sx = 1 + t * dsxf;
		let sy = 1 + t * dsyf;
		//transform.from = `translate(${( t * dx )}px,${( t * dy )}px) scale(${( 1 + ( t * dsxf ) )},${( 1 + ( t * dsyf ) )})`;
		transform.from = `matrix(${sx},0,0,${sy},${x},${y})`;

		t = 1 - t;

		x = t * -dx;
		y = t * -dy;

		sx = 1 + t * dsxt;
		sy = 1 + t * dsyt;
		//transform.to   = `translate(${( -t * dx )}px,${( -t * dy )}px) scale(${( 1 + ( t * dsxt ) )},${( 1 + ( t * dsyt ) )})`;
		transform.to = `matrix(${sx},0,0,${sy},${x},${y})`;

		return transform;
	};
}