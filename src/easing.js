var easing = {
	linear: function ( pos ) { return pos; },
	easeIn: function ( pos ) { return Math.pow( pos, 3 ); },
	easeOut: function ( pos ) { return ( Math.pow( ( pos - 1 ), 3 ) + 1 ); },
	easeInOut: function ( pos ) {
		if ( ( pos /= 0.5 ) < 1 ) { return ( 0.5 * Math.pow( pos, 3 ) ); }
		return ( 0.5 * ( Math.pow( ( pos - 2 ), 3 ) + 2 ) );
	}
};

function getEasing ( nameOrFn ) {
	if ( !nameOrFn ) {
		return easing.easeOut;
	}

	if ( typeof nameOrFn === 'function' ) {
		return nameOrFn;
	}

	if ( typeof nameOrFn === 'string' && easing[ nameOrFn ] ) {
		return easing[ nameOrFn ];
	}

	throw new Error( 'Could not find easing function' );
}

export { easing, getEasing };