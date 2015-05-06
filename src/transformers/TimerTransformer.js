import getTransform from '../utils/getTransform';
import { getOpacity, getBackgroundColors } from '../utils/getOpacity';
import getBorderRadius from '../utils/getBorderRadius';
import { decrementHtml } from '../utils/html';
import { decrementSvg } from '../utils/svg';
import { linear } from '../easing';
import rAF from '../utils/rAF';

export default class TimerTransformer {
	constructor ( from, to, container, options ) {
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
				from.clone.parentNode.removeChild( from.clone );
				to.clone.parentNode.removeChild( to.clone );

				// remove containers if possible
				decrementHtml();

				if ( options.done ) {
					options.done();
				}

				return;
			}

			const t = easing( elapsed / duration );

			// opacity
			const opacities = getOpacity(from, to, t);
			from.clone.style.opacity = opacities[0];
			to.clone.style.opacity = opacities[1];

			// opacity
			const backgroundColors = getBackgroundColors(from, to, t);
			if(backgroundColors[0]){
				from.clone.style.backgroundColor = backgroundColors[0];
			}
			if(backgroundColors[1]){
				to.clone.style.backgroundColor = backgroundColors[1];
			}

			// border radius
			const fromBorderRadius = getBorderRadius( from.borderRadius, to.borderRadius, dsxf, dsyf, t );
			const toBorderRadius = getBorderRadius( to.borderRadius, from.borderRadius, dsxt, dsyt, 1 - t );

			applyBorderRadius( from.clone, fromBorderRadius );
			applyBorderRadius( to.clone, toBorderRadius );

			const left = from.left + ( dx * t );
			const top = from.top + ( dy * t );

			const fromTransform = getTransform( false, left, top, dx, dy, dsxf, dsyf, t ) + ' ' + from.transform;
			const toTransform = getTransform( false, left, top, -dx, -dy, dsxt, dsyt, 1 - t ) + ' ' + to.transform;

			// if ( from.isSvg ) {
			// 	from.clone.setAttribute( 'transform', fromTransform );
			// } else {
				from.clone.style.transform = from.clone.style.webkitTransform = from.clone.style.msTransform = fromTransform;
			// }

			// if ( to.isSvg ) {
			// 	to.clone.setAttribute( 'transform', toTransform );
			// } else {
				to.clone.style.transform = to.clone.style.webkitTransform = to.clone.style.msTransform = toTransform;
			// }

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