var div = document.createElement( 'div' );
var keyframesSupported = true;

var TRANSFORM, KEYFRAMES, ANIMATION_DIRECTION, ANIMATION_DURATION, ANIMATION_ITERATION_COUNT, ANIMATION_NAME, ANIMATION_TIMING_FUNCTION, ANIMATION_END;

if ( ( 'transform' in div.style || 'webkitTransform' in div.style ) && ( 'animation' in div.style || 'webkitAnimation' in div.style ) ) {
	keyframesSupported = true;

	TRANSFORM = 'transform' in div.style ? 'transform' : '-webkit-transform';

	if ( 'animation' in div.style ) {
		KEYFRAMES = '@keyframes';

		ANIMATION_DIRECTION       = 'animation-direction';
		ANIMATION_DURATION        = 'animation-duration';
		ANIMATION_ITERATION_COUNT = 'animation-iteration-count';
		ANIMATION_NAME            = 'animation-name';
		ANIMATION_TIMING_FUNCTION = 'animation-timing-function';

		ANIMATION_END             = 'animationend';
	} else {
		KEYFRAMES = '@-webkit-keyframes';

		ANIMATION_DIRECTION       = '-webkit-animation-direction';
		ANIMATION_DURATION        = '-webkit-animation-duration';
		ANIMATION_ITERATION_COUNT = '-webkit-animation-iteration-count';
		ANIMATION_NAME            = '-webkit-animation-name';
		ANIMATION_TIMING_FUNCTION = '-webkit-animation-timing-function';

		ANIMATION_END             = 'webkitAnimationEnd';
	}
} else {
	keyframesSupported = false;
}

console.log( 'TRANSFORM', TRANSFORM );
console.log( 'KEYFRAMES', KEYFRAMES );
console.log( 'ANIMATION_END', ANIMATION_END );

export { keyframesSupported, TRANSFORM, KEYFRAMES, ANIMATION_DIRECTION, ANIMATION_DURATION, ANIMATION_ITERATION_COUNT, ANIMATION_NAME, ANIMATION_TIMING_FUNCTION, ANIMATION_END };