import { TRANSFORM_CSS } from './detect.js';

export default function getKeyframes ( from, to, interpolators, easing, remaining, duration ) {
	const numFrames = remaining / 16;

	let fromKeyframes = '';
	let toKeyframes = '';

	function addKeyframes ( pc, t ) {
		const opacity = interpolators.opacity( t );
		const backgroundColor = interpolators.backgroundColor ? interpolators.backgroundColor( t ) : null;
		const borderRadius = interpolators.borderRadius ? interpolators.borderRadius( t ) : null;
		const transformFrom = interpolators.transformFrom( t );
		const transformTo = interpolators.transformTo( 1 - t );

		fromKeyframes += '\n' +
			`${pc}% {` +
				`opacity: ${opacity.from};` +
				`${TRANSFORM_CSS}: ${transformFrom};` +
				( backgroundColor ? `background-color: ${backgroundColor.from};` : '' ) +
				( borderRadius ? `border-radius: ${borderRadius.from};` : '' ) +
			`}`;

		toKeyframes += '\n' +
			`${pc}% {` +
				`opacity: ${opacity.to};` +
				`${TRANSFORM_CSS}: ${transformTo};` +
				( backgroundColor ? `background-color: ${backgroundColor.to};` : '' ) +
				( borderRadius ? `border-radius: ${borderRadius.to};` : '' ) +
			`}`;
	}

	let i;
	let startPos = 1 - ( remaining / duration );

	for ( i = 0; i < numFrames; i += 1 ) {
		const relPos = i / numFrames;
		const absPos = startPos + ( ( remaining / duration ) * relPos );

		const pc = 100 * relPos;
		const t = easing( absPos );

		addKeyframes( pc, t );
	}

	addKeyframes( 100, 1 );

	return { fromKeyframes, toKeyframes };
}
