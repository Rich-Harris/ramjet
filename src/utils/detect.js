const div = document.createElement( 'div' );

let keyframesSupported = true;
let TRANSFORM;
let KEYFRAMES;
let ANIMATION_DIRECTION;
let ANIMATION_DURATION;
let ANIMATION_ITERATION_COUNT;
let ANIMATION_NAME;
let ANIMATION_TIMING_FUNCTION;
let ANIMATION_END;

// We have to browser-sniff for IE11, because it was apparently written
// by a barrel of stoned monkeys - http://jsfiddle.net/rich_harris/oquLu2qL/

// http://stackoverflow.com/questions/17907445/how-to-detect-ie11
const isIe11 = !window.ActiveXObject && 'ActiveXObject' in window;

if (
	!isIe11 &&
	( 'transform' in div.style || 'webkitTransform' in div.style ) &&
	( 'animation' in div.style || 'webkitAnimation' in div.style )
) {
	keyframesSupported = true;

	TRANSFORM = 'transform' in div.style ? 'transform' : '-webkit-transform';

	if ( 'animation' in div.style ) {
		KEYFRAMES = '@keyframes';

		ANIMATION_DIRECTION       = 'animationDirection';
		ANIMATION_DURATION        = 'animationDuration';
		ANIMATION_ITERATION_COUNT = 'animationIterationCount';
		ANIMATION_NAME            = 'animationName';
		ANIMATION_TIMING_FUNCTION = 'animationTimingFunction';

		ANIMATION_END             = 'animationend';
	} else {
		KEYFRAMES = '@-webkit-keyframes';

		ANIMATION_DIRECTION       = 'webkitAnimationDirection';
		ANIMATION_DURATION        = 'webkitAnimationDuration';
		ANIMATION_ITERATION_COUNT = 'webkitAnimationIterationCount';
		ANIMATION_NAME            = 'webkitAnimationName';
		ANIMATION_TIMING_FUNCTION = 'webkitAnimationTimingFunction';

		ANIMATION_END             = 'webkitAnimationEnd';
	}
} else {
	keyframesSupported = false;
}

export {
	keyframesSupported,
	TRANSFORM,
	KEYFRAMES,
	ANIMATION_DIRECTION,
	ANIMATION_DURATION,
	ANIMATION_ITERATION_COUNT,
	ANIMATION_NAME,
	ANIMATION_TIMING_FUNCTION,
	ANIMATION_END
};
