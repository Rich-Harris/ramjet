import getTransform from '../utils/getTransform';
import getBorderRadius from '../utils/getBorderRadius';
import { linear } from '../easing';
import {
	TRANSFORM,
	KEYFRAMES,
	ANIMATION_DIRECTION,
	ANIMATION_DURATION,
	ANIMATION_ITERATION_COUNT,
	ANIMATION_NAME,
	ANIMATION_TIMING_FUNCTION,
	ANIMATION_END
} from '../utils/detect';

export default class KeyframeTransformer {
	constructor ( from, to, options ) {
		const { fromKeyframes, toKeyframes } = getKeyframes( from, to, options );

		const fromId = '_' + ~~( Math.random() * 1000000 );
		const toId = '_' + ~~( Math.random() * 1000000 );

		const css = `${KEYFRAMES} ${fromId} { ${fromKeyframes} } ${KEYFRAMES} ${toId} { ${toKeyframes} }`;
		const dispose = addCss( css );

		from.clone.style[ ANIMATION_DIRECTION ] = 'alternate';
		from.clone.style[ ANIMATION_DURATION ] = `${options.duration/1000}s`;
		from.clone.style[ ANIMATION_ITERATION_COUNT ] = 1;
		from.clone.style[ ANIMATION_NAME ] = fromId;
		from.clone.style[ ANIMATION_TIMING_FUNCTION ] = 'linear';

		to.clone.style[ ANIMATION_DIRECTION ] = 'alternate';
		to.clone.style[ ANIMATION_DURATION ] = `${options.duration/1000}s`;
		to.clone.style[ ANIMATION_ITERATION_COUNT ] = 1;
		to.clone.style[ ANIMATION_NAME ] = toId;
		to.clone.style[ ANIMATION_TIMING_FUNCTION ] = 'linear';

		let fromDone;
		let toDone;

		function done () {
			if ( fromDone && toDone ) {
				from.clone.parentNode.removeChild( from.clone );
				to.clone.parentNode.removeChild( to.clone );

				if ( options.done ) options.done();

				dispose();
			}
		}

		from.clone.addEventListener( ANIMATION_END, () => {
			fromDone = true;
			done();
		});

		to.clone.addEventListener( ANIMATION_END, () => {
			toDone = true;
			done();
		});
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
	var dx = to.cx - from.cx;
	var dy = to.cy - from.cy;

	var dsxf = ( to.width / from.width ) - 1;
	var dsyf = ( to.height / from.height ) - 1;

	var dsxt = ( from.width / to.width ) - 1;
	var dsyt = ( from.height / to.height ) - 1;

	var easing = options.easing || linear;

	var numFrames = options.duration / 50; // one keyframe per 50ms is probably enough... this may prove not to be the case though

	var fromKeyframes = [];
	var toKeyframes = [];
	var i;

	function addKeyframes ( pc, t ) {
		const cx = from.cx + ( dx * t );
		const cy = from.cy + ( dy * t );

		const borderRadius = getBorderRadius( from.borderRadius, to.borderRadius, t );

		const fromTransform = getTransform( from.isSvg, cx, cy, dx, dy, dsxf, dsyf, t ) + ' ' + from.transform;
		const toTransform = getTransform( to.isSvg, cx, cy, -dx, -dy, dsxt, dsyt, 1 - t ) + ' ' + to.transform;

		fromKeyframes.push( `
			${pc}% {
				opacity: ${1-t};
				border-top-left-radius: ${borderRadius[0]};
				border-top-right-radius: ${borderRadius[1]};
				border-bottom-right-radius: ${borderRadius[2]};
				border-bottom-left-radius: ${borderRadius[3]};
				${TRANSFORM}: ${fromTransform};
			}`
		);

		toKeyframes.push( `
			${pc}% {
				opacity: ${t};
				border-top-left-radius: ${borderRadius[0]};
				border-top-right-radius: ${borderRadius[1]};
				border-bottom-right-radius: ${borderRadius[2]};
				border-bottom-left-radius: ${borderRadius[3]};
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
