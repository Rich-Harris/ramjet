import getOpacityInterpolator from '../interpolators/opacity';
import getRgbaInterpolator from '../interpolators/rgba';
import getBorderRadiusInterpolator from '../interpolators/borderRadius';
import getTransformInterpolator from '../interpolators/transform';
import { linear } from '../easing';
import {
	TRANSFORM,
	KEYFRAMES
} from '../utils/detect';

function generateId () {
	return 'ramjet' + ~~( Math.random() * 1000000 );
}

export default class KeyframeTransformer {
	constructor ( from, to, options ) {
		const { fromKeyframes, toKeyframes } = getKeyframes( from, to, options );

		const fromId = generateId();
		const toId = generateId();

		const css = `
			${KEYFRAMES} ${fromId}      { ${fromKeyframes} }
			${KEYFRAMES} ${toId}        { ${toKeyframes} }`;
		const dispose = addCss( css );

		let animating = 2;

		from.animateWithKeyframes( fromId, options.duration, done );
		to.animateWithKeyframes( toId, options.duration, done );

		function done () {
			if ( !--animating ) {
				from.detach();
				to.detach();

				if ( options.done ) options.done();

				dispose();
			}
		}
	}
}

function addCss ( css ) {
	var styleElement = document.createElement( 'style' );
	styleElement.type = 'text/css';

	var head = document.getElementsByTagName( 'head' )[0];

	// Internet Exploder won't let you use styleSheet.innerHTML - we have to
	// use styleSheet.cssText instead
	var styleSheet = styleElement.styleSheet;

	if ( styleSheet ) {
		styleSheet.cssText = css;
	} else {
		styleElement.innerHTML = css;
	}

	head.appendChild( styleElement );

	return () => head.removeChild( styleElement );
}

function getKeyframes ( from, to, options ) {
	const easing = options.easing || linear;

	const opacityAt = getOpacityInterpolator( from.opacity, to.opacity );
	const backgroundColorAt = getRgbaInterpolator( from.rgba, to.rgba );
	const borderRadiusAt = getBorderRadiusInterpolator( from, to );
	const transformAt = getTransformInterpolator( from, to );

	const numFrames = options.duration / 16;

	let fromKeyframes = '';
	let toKeyframes = '';

	function addKeyframes ( pc, t ) {
		const opacity = opacityAt( t );
		const backgroundColor = backgroundColorAt ? backgroundColorAt( t ) : null;
		const borderRadius = borderRadiusAt( t ); // TODO this needs to be optional, to avoid repaints
		const transform = transformAt( t );

		fromKeyframes += '\n' +
			`${pc}% {` +
				`opacity: ${opacity.from};` +
				`${TRANSFORM}: ${transform.from};` +
				( backgroundColor ? `background-color: ${backgroundColor.from};` : '' ) +
				`border-radius: ${borderRadius.from};` +
			`}`;

		toKeyframes += '\n' +
			`${pc}% {` +
				`opacity: ${opacity.to};` +
				`${TRANSFORM}: ${transform.to};` +
				( backgroundColor ? `background-color: ${backgroundColor.to};` : '' ) +
				`border-radius: ${borderRadius.to};` +
			`}`;
	}

	let i;

	for ( i = 0; i < numFrames; i += 1 ) {
		const pc = 100 * ( i / numFrames );
		const t = easing( i / numFrames );

		addKeyframes( pc, t );
	}

	addKeyframes( 100, 1 );

	return { fromKeyframes, toKeyframes };
}
