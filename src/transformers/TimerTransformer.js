import getTransform from '../utils/getTransform';
import getBorderRadius from '../utils/getBorderRadius';
import { linear } from '../easing';
import rAF from '../utils/rAF';

export default class TimerTransformer {
	constructor ( from, to, options ) {
		const dx = to.cx - from.cx;
		const dy = to.cy - from.cy;

		const dsxf = ( to.width / from.width ) - 1;
		const dsyf = ( to.height / from.height ) - 1;

		const dsxt = ( from.width / to.width ) - 1;
		const dsyt = ( from.height / to.height ) - 1;

		const startTime = Date.now();
		const duration = options.duration || 400;
		const easing = options.easing || linear;

		function tick () {
			const timeNow = Date.now();
			const elapsed = timeNow - startTime;

			if ( elapsed > duration ) {
				from.clone.parentNode.removeChild( from.clone );
				to.clone.parentNode.removeChild( to.clone );

				if ( options.done ) {
					options.done();
				}

				return;
			}

			const t = easing( elapsed / duration );

			// opacity
			from.clone.style.opacity = 1 - t;
			to.clone.style.opacity = t;

			// border radius
			const fromBorderRadius = getBorderRadius( from.borderRadius, to.borderRadius, dsxf, dsyf, t );
			const toBorderRadius = getBorderRadius( to.borderRadius, from.borderRadius, dsxt, dsyt, 1 - t );

			applyBorderRadius( from.clone, fromBorderRadius );
			applyBorderRadius( to.clone, toBorderRadius );

			const cx = from.cx + ( dx * t );
			const cy = from.cy + ( dy * t );

			const fromTransform = getTransform( from.isSvg, cx, cy, dx, dy, dsxf, dsyf, t ) + ' ' + from.transform;
			const toTransform = getTransform( to.isSvg, cx, cy, -dx, -dy, dsxt, dsyt, 1 - t ) + ' ' + to.transform;

			if ( from.isSvg ) {
				from.clone.setAttribute( 'transform', fromTransform );
			} else {
				from.clone.style.transform = from.clone.style.webkitTransform = from.clone.style.msTransform = fromTransform;
			}

			if ( to.isSvg ) {
				to.clone.setAttribute( 'transform', toTransform );
			} else {
				to.clone.style.transform = to.clone.style.webkitTransform = to.clone.style.msTransform = toTransform;
			}

			rAF( tick );
		}

		tick();
	}
}

function applyBorderRadius ( node, borderRadius ) {
	node.style.borderTopLeftRadius = borderRadius[0];
	node.style.borderTopRightRadius = borderRadius[1];
	node.style.borderBottomRightRadius = borderRadius[2];
	node.style.borderBottomLeftRadius = borderRadius[3];
}