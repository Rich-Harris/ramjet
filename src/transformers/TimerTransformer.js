import getOpacityInterpolator from '../interpolators/opacity';
import getRgbaInterpolator from '../interpolators/rgba';
import getBorderRadiusInterpolator from '../interpolators/borderRadius';
import getTransformInterpolator from '../interpolators/transform';
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

		const opacityAt = getOpacityInterpolator( from.opacity, to.opacity );
		const backgroundColorAt = getRgbaInterpolator( from.rgba, to.rgba );
		const borderRadiusAt = getBorderRadiusInterpolator( from, to );
		const transformAt = getTransformInterpolator( from, to );

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
			const opacity = opacityAt( t );
			from.setOpacity( opacity.from );
			to.setOpacity( opacity.to );

			// background color
			if ( backgroundColorAt ) {
				const backgroundColor = backgroundColorAt( t );
				from.clone.style.backgroundColor = backgroundColor.from;
				to.clone.style.backgroundColor = backgroundColor.to;
			}

			// border radius
			const borderRadius = borderRadiusAt( t );
			from.setBorderRadius( borderRadius.from );
			to.setBorderRadius( borderRadius.to );

			// transform
			const transform = transformAt( t );
			from.setTransform( transform.from );
			to.setTransform( transform.to );

			rAF( tick );
		}

		tick();
	}
}