import getTransform from '../utils/getTransform';
import { getOpacity, getBackgroundColors } from '../utils/getOpacity';
import getBorderRadius from '../utils/getBorderRadius';
import { decrementHtml } from '../utils/html';
import { decrementSvg } from '../utils/svg';
import { linear } from '../easing';
import rAF from '../utils/rAF';

export default class TimerTransformer {
	constructor ( from, to, options ) {
		const dx = to.left - from.left;
		const dy = to.top - from.top;

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
				from.detach();
				to.detach();

				if ( options.done ) {
					options.done();
				}

				return;
			}

			const t = easing( elapsed / duration );

			// opacity
			const [ fromOpacity, toOpacity ] = getOpacity( from, to, t );
			from.setOpacity( fromOpacity );
			to.setOpacity( toOpacity );

			// opacity
			const [ fromBg, toBg ] = getBackgroundColors( from, to, t );

			if ( fromBg ) {
				from.clone.style.backgroundColor = fromBg;
			}

			if ( toBg ) {
				to.clone.style.backgroundColor = toBg;
			}

			// border radius
			const fromBorderRadius = getBorderRadius( from.borderRadius, to.borderRadius, dsxf, dsyf, t );
			const toBorderRadius = getBorderRadius( to.borderRadius, from.borderRadius, dsxt, dsyt, 1 - t );

			from.setBorderRadius( fromBorderRadius );
			to.setBorderRadius( toBorderRadius );

			const left = from.left + ( dx * t );
			const top = from.top + ( dy * t );

			const fromTransform = getTransform( false, left, top, dx, dy, dsxf, dsyf, t ) + ' ' + from.transform;
			const toTransform = getTransform( false, left, top, -dx, -dy, dsxt, dsyt, 1 - t ) + ' ' + to.transform;

			from.setTransform( fromTransform );
			to.setTransform( toTransform );

			rAF( tick );
		}

		tick();
	}
}