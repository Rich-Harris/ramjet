import getTransform from './utils/getTransform';
import { getEasing } from './easing';

var TRANSFORM = 'transform';
var KEYFRAMES = '@-webkit-keyframes';

var ANIMATION_DIRECTION       = '-webkit-animation-direction';
var ANIMATION_DURATION        = '-webkit-animation-duration';
var ANIMATION_ITERATION_COUNT = '-webkit-animation-iteration-count';
var ANIMATION_NAME            = '-webkit-animation-name';
var ANIMATION_TIMING_FUNCTION = '-webkit-animation-timing-function';

var ANIMATION_END             = 'webkitAnimationEnd';

export default function mogrifyWithKeyframes ( from, to, options ) {
	var { fromKeyframes, toKeyframes } = getKeyframes( from, to, options );

	var css = `${KEYFRAMES} abc { ${fromKeyframes} } ${KEYFRAMES} def { ${toKeyframes} }`;
	var dispose = addCss( css );

	from.clone.style[ ANIMATION_DIRECTION ] = 'alternate';
	from.clone.style[ ANIMATION_DURATION ] = `${options.duration/1000}s`;
	from.clone.style[ ANIMATION_ITERATION_COUNT ] = 1;
	from.clone.style[ ANIMATION_NAME ] = 'abc';
	from.clone.style[ ANIMATION_TIMING_FUNCTION ] = 'linear';

	to.clone.style[ ANIMATION_DIRECTION ] = 'alternate';
	to.clone.style[ ANIMATION_DURATION ] = `${options.duration/1000}s`;
	to.clone.style[ ANIMATION_ITERATION_COUNT ] = 1;
	to.clone.style[ ANIMATION_NAME ] = 'def';
	to.clone.style[ ANIMATION_TIMING_FUNCTION ] = 'linear';

	var fromDone, toDone;

	function done () {
		if ( fromDone && toDone ) {
			from.clone.parentNode.removeChild( from.clone );
			to.clone.parentNode.removeChild( to.clone );

			options.done && options.done();
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

	var easing = getEasing( options.easing );

	var numFrames = options.duration / 50; // one keyframe per 50ms is probably enough... this may prove not to be the case though

	var fromKeyframes = [];
	var toKeyframes = [];
	var i;

	for ( i = 0; i < numFrames; i += 1 ) {
		let pc = 100 * ( i / numFrames );
		let t = easing( i / numFrames );

		let cx = from.cx + ( dx * t );
		let cy = from.cy + ( dy * t );

		let fromTransform = getTransform( from.isSvg, cx, cy, dx, dy, dsxf, dsyf, t ) + ' ' + from.transform;
		let toTransform = getTransform( to.isSvg, cx, cy, -dx, -dy, dsxt, dsyt, 1 - t ) + ' ' + to.transform;

		fromKeyframes.push( `${pc}% { opacity: ${1-t}; ${TRANSFORM}: ${fromTransform}; }` );
		toKeyframes.push( `${pc}% { opacity: ${t}; ${TRANSFORM}: ${toTransform}; }` );
	}

	let cx = from.cx + ( dx );
	let cy = from.cy + ( dy );

	let fromTransform = getTransform( from.isSvg, cx, cy, dx, dy, dsxf, dsyf, 1 ) + ' ' + from.transform;
	let toTransform = getTransform( to.isSvg, cx, cy, -dx, -dy, dsxt, dsyt, 0 ) + ' ' + to.transform;

	fromKeyframes.push( `100% { opacity: 0; ${TRANSFORM}: ${fromTransform}; }` );
	toKeyframes.push( `100% { opacity: 1; ${TRANSFORM}: ${toTransform}; }` );

	fromKeyframes = fromKeyframes.join( '\n' );
	toKeyframes = toKeyframes.join( '\n' );

	return { fromKeyframes, toKeyframes };
}