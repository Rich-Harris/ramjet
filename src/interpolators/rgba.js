import getOpacityInterpolator from './opacity';

export default function getRgbaInterpolator ( a, b ) {
	if ( a.alpha === 1 && b.alpha === 1 ) {
		// no need to animate anything
		return null;
	}

	let rgba = {};
	let opacityAt = getOpacityInterpolator( a.alpha, b.alpha );

	return function interpolator ( t ) {
		const opacity = opacityAt( t );

		rgba.from = `rgba(${a.r},${a.g},${a.b},${opacity.from})`;
		rgba.to = `rgba(${b.r},${b.g},${b.b},${opacity.to})`;

		return rgba;
	};
}