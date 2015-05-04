export default function getBorderRadius ( a, b, t ) {
	return a.map( ( from, i ) => {
		const to = b[i];
		return ( from + t * ( to - from ) ) + 'px';
	});
}