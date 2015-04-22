import getTransform from '../utils/getTransform';
import { linear } from '../easing';
import rAF from '../utils/rAF';

export default class TimerTransformer {
	constructor ( from, to, options ) {
		var dx = to.cx - from.cx;
		var dy = to.cy - from.cy;

		var dsxf = ( to.width / from.width ) - 1;
		var dsyf = ( to.height / from.height ) - 1;

		var dsxt = ( from.width / to.width ) - 1;
		var dsyt = ( from.height / to.height ) - 1;

		var startTime = Date.now();
		var duration = options.duration || 400;
		var easing = options.easing || linear;

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

			if ( from.isSvg ) {
				from.clone.setAttribute( 'transform', fromTransform );
			} else {
				from.clone.style.transform = from.clone.style.webkitTransform = fromTransform;
			}

			if ( to.isSvg ) {
				to.clone.setAttribute( 'transform', toTransform );
			} else {
				to.clone.style.transform = to.clone.style.webkitTransform = toTransform;
			}

			rAF( tick );
		}

		tick();
	}
}