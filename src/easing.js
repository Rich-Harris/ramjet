export function linear ( pos ) {
	return pos;
}

export function easeIn ( pos ) {
	return Math.pow( pos, 3 );
}

export function easeOut ( pos ) {
	return ( Math.pow( ( pos - 1 ), 3 ) + 1 );
}

export function easeInOut ( pos ) {
	if ( ( pos /= 0.5 ) < 1 ) {
		return ( 0.5 * Math.pow( pos, 3 ) ); }
	return ( 0.5 * ( Math.pow( ( pos - 2 ), 3 ) + 2 ) );
}