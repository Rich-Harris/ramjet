import getTransform from '../utils/getTransform';
import getOpacityInterpolator from '../interpolators/opacity';
import getRgbaInterpolator from '../interpolators/rgba';
import getBorderRadiusInterpolator from '../interpolators/borderRadius';
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
	const dx = to.left - from.left;
	const dy = to.top - from.top;

	const dsxf = ( to.width / from.width ) - 1;
	const dsyf = ( to.height / from.height ) - 1;

	const dsxt = ( from.width / to.width ) - 1;
	const dsyt = ( from.height / to.height ) - 1;

	const easing = options.easing || linear;

	const opacityAt = getOpacityInterpolator( from.opacity, to.opacity );
	const backgroundColorAt = getRgbaInterpolator( from.rgba, to.rgba );
	const borderRadiusAt = getBorderRadiusInterpolator( from, to );

	const numFrames = options.duration / 50; // one keyframe per 50ms is probably enough... this may prove not to be the case though

	let fromKeyframes = [];
	let toKeyframes = [];
	let i;

	function addKeyframes ( pc, t ) {
		const left = from.left + ( dx * t );
		const top = from.top + ( dy * t );

		const fromTransform = getTransform( false, left, top, dx, dy, dsxf, dsyf, t ) + ' ' + from.transform;
		const toTransform = getTransform( false, left, top, -dx, -dy, dsxt, dsyt, 1 - t ) + ' ' + to.transform;

		const opacity = opacityAt( t );
		const backgroundColor = backgroundColorAt ? backgroundColorAt( t ) : null;
		const borderRadius = borderRadiusAt( t ); // TODO this needs to be optional, to avoid repaints

		fromKeyframes.push( `
			${pc}% {
				opacity: ${opacity.from};
				${(backgroundColor ? "background-color: "+backgroundColor.from: '')};
				border-radius: ${borderRadius.from};
				${TRANSFORM}: ${fromTransform};
			}`
		);

		toKeyframes.push( `
			${pc}% {
				opacity: ${opacity.to};
				${(backgroundColor ? "background-color: "+backgroundColor.to: '')};
				border-radius: ${borderRadius.to};
				${TRANSFORM}: ${toTransform};
			}`
		);
	}

	for ( i = 0; i < numFrames; i += 1 ) {
		const pc = 100 * ( i / numFrames );
		const t = easing( i / numFrames );

		addKeyframes( pc, t );
	}

	addKeyframes( 100, 1 );

	fromKeyframes = fromKeyframes.join( '\n' );
	toKeyframes = toKeyframes.join( '\n' );

	return { fromKeyframes, toKeyframes };
}
