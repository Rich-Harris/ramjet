export default function getOpacityInterpolator ( from, to, order ) {
	let opacity = {};

	return function interpolator ( t ) {
		const targetOpacity = ( to - from ) * t + from;

		// Based on the blending formula here. (http://en.wikipedia.org/wiki/Alpha_compositing#Alpha_blending)
		// This is a quadratic blending function that makes the top layer and bottom layer blend linearly.
		// However there is an asymptote at target=1 so that needs to be handled with an if else statement.
		if ( targetOpacity === 1 ) {
			if ( order === 1 ) {
				opacity.from = 1 - t;
				opacity.to = 1;
			} else {
				opacity.from = 1;
				opacity.to = t;
			}
		} else {
			opacity.from = targetOpacity - ( t * t * targetOpacity );
			opacity.to = ( targetOpacity - opacity.from ) / ( 1 - opacity.from );
		}

		return opacity;
	};
}
