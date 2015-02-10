import processNode from './utils/processNode';
import getTransform from './utils/getTransform';

export default mogrify;

function mogrify ( fromNode, toNode, options ) {
	var from, to, dx, dy, dsxf, dsyf, dsxt, dsyt, startTime, duration, easing;

	options = options || {};

	if ( typeof options === 'function' ) {
		options = { done: options };
	}

	from = processNode( fromNode );
	to = processNode( toNode );

	dx = to.cx - from.cx;
	dy = to.cy - from.cy;

	dsxf = ( to.width / from.width ) - 1;
	dsyf = ( to.height / from.height ) - 1;

	dsxt = ( from.width / to.width ) - 1;
	dsyt = ( from.height / to.height ) - 1;

	startTime = Date.now();
	duration = options.duration || 400;
	easing = getEasing( options.easing );

	function tick () {
		var timeNow, elapsed, t, cx, cy, fromTransform, toTransform;

		timeNow = Date.now();
		elapsed = timeNow - startTime;

		if ( elapsed > duration ) {
			from.clone.parentNode.removeChild( from.clone );
			to.clone.parentNode.removeChild( to.clone );

			if ( options.done ) {
				options.done();
			}

			return;
		}

		t = easing( elapsed / duration );

		from.clone.style.opacity = 1 - t;
		to.clone.style.opacity = t;

		cx = from.cx + ( dx * t );
		cy = from.cy + ( dy * t );

		fromTransform = getTransform( from.isSvg, cx, cy, dx, dy, dsxf, dsyf, t ) + ' ' + from.transform;
		toTransform = getTransform( to.isSvg, cx, cy, -dx, -dy, dsxt, dsyt, 1 - t ) + ' ' + to.transform;

		from.clone.style.transform = from.clone.style.webkitTransform = fromTransform;
		to.clone.style.transform = to.clone.style.webkitTransform = toTransform;

		requestAnimationFrame( tick );
	}

	tick();
}

mogrify.easing = {
	linear: function ( pos ) { return pos; },
	easeIn: function ( pos ) { return Math.pow( pos, 3 ); },
	easeOut: function ( pos ) { return ( Math.pow( ( pos - 1 ), 3 ) + 1 ); },
	easeInOut: function ( pos ) {
		if ( ( pos /= 0.5 ) < 1 ) { return ( 0.5 * Math.pow( pos, 3 ) ); }
		return ( 0.5 * ( Math.pow( ( pos - 2 ), 3 ) + 2 ) );
	}
};

function getEasing ( easing ) {
	if ( !easing ) {
		return mogrify.easing.easeOut;
	}

	if ( typeof easing === 'function' ) {
		return easing;
	}

	if ( typeof easing === 'string' && mogrify.easing[ easing ] ) {
		return mogrify.easing[ easing ];
	}

	throw new Error( 'Could not find easing function' );
}
