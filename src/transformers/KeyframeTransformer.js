import getTransform from '../utils/getTransform';
import {getOpacity, getBackgroundColors} from '../utils/getOpacity';
import getBorderRadius from '../utils/getBorderRadius';
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

	const numFrames = options.duration / 50; // one keyframe per 50ms is probably enough... this may prove not to be the case though

	let fromKeyframes = [];
	let toKeyframes = [];
	let i;

	function addKeyframes ( pc, t ) {
		const left = from.left + ( dx * t );
		const top = from.top + ( dy * t );

		const fromBorderRadius = getBorderRadius( from.borderRadius, to.borderRadius, dsxf, dsyf, t );
		const toBorderRadius = getBorderRadius( to.borderRadius, from.borderRadius, dsxt, dsyt, 1 - t );

		const fromTransform = getTransform( false, left, top, dx, dy, dsxf, dsyf, t ) + ' ' + from.transform;
		const toTransform = getTransform( false, left, top, -dx, -dy, dsxt, dsyt, 1 - t ) + ' ' + to.transform;

		const opacities = getOpacity(from, to, t);
		const backgroundColors = getBackgroundColors(from, to, t);

		fromKeyframes.push( `
			${pc}% {
				opacity: ${opacities[0]};
				${(backgroundColors[0] ? "background-color: "+backgroundColors[0]: '')};
				border-top-left-radius: ${fromBorderRadius[0]};
				border-top-right-radius: ${fromBorderRadius[1]};
				border-bottom-right-radius: ${fromBorderRadius[2]};
				border-bottom-left-radius: ${fromBorderRadius[3]};
				${TRANSFORM}: ${fromTransform};
			}`
		);

		toKeyframes.push( `
			${pc}% {
				opacity: ${opacities[1]};
				${(backgroundColors[1] ? "background-color: "+backgroundColors[1]: '')};
				border-top-left-radius: ${toBorderRadius[0]};
				border-top-right-radius: ${toBorderRadius[1]};
				border-bottom-right-radius: ${toBorderRadius[2]};
				border-bottom-left-radius: ${toBorderRadius[3]};
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
