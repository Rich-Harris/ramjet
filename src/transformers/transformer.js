import { compare } from 'stacking-order';
import getOpacityInterpolator from '../interpolators/opacity';
import getRgbaInterpolator from '../interpolators/rgba';
import getBorderRadiusInterpolator from '../interpolators/borderRadius';
import getTransformInterpolator from '../interpolators/transform';
import { linear } from '../easing';
import {
	TRANSFORM_CSS,
	KEYFRAMES,
	ANIMATION_END,
	keyframesSupported
} from '../utils/detect';
import rAF from '../utils/rAF';

export default function transformer ( from, to, options ) {
	const duration = options.duration || 400;
	const easing = options.easing || linear;

	const useTimer = !keyframesSupported || !!options.useTimer;

	const order = compare( from._node, to._node );

	const interpolators = {
		opacity: getOpacityInterpolator( from.opacity, to.opacity, order ),
		backgroundColor: options.interpolateBackgroundColor ? getRgbaInterpolator( from.rgba, to.rgba, order ) : null,
		borderRadius: options.interpolateBorderRadius ? getBorderRadiusInterpolator( from, to ) : null,
		transformFrom: getTransformInterpolator( from, to ),
		transformTo: getTransformInterpolator( to, from )
	};

	let running;
	let disposeCss;
	let torndown;

	let remaining = duration;
	let endTime;

	function tick () {
		if ( !running ) return;

		const timeNow = Date.now();
		remaining = endTime - timeNow;

		if ( remaining < 0 ) {
			transformer.teardown();
			if ( options.done ) options.done();

			return;
		}

		const t = easing( 1 - ( remaining / duration ) );
		transformer.goto( t );

		rAF( tick );
	}

	const transformer = {
		teardown () {
			if ( torndown ) return transformer;

			running = false;
			torndown = true;

			from.detach();
			to.detach();

			from = null;
			to = null;

			return transformer;
		},

		goto ( pos ) {
			transformer.pause();

			const t = easing( pos );

			// opacity
			const opacity = interpolators.opacity( t );
			from.setOpacity( opacity.from );
			to.setOpacity( opacity.to );

			// transform
			const transformFrom = interpolators.transformFrom( t );
			const transformTo = interpolators.transformTo( 1 - t );
			from.setTransform( transformFrom );
			to.setTransform( transformTo );

			// background color
			if ( interpolators.backgroundColor ) {
				const backgroundColor = interpolators.backgroundColor( t );
				from.setBackgroundColor( backgroundColor.from );
				to.setBackgroundColor( backgroundColor.to );
			}

			// border radius
			if ( interpolators.borderRadius ) {
				const borderRadius = interpolators.borderRadius( t );
				from.setBorderRadius( borderRadius.from );
				to.setBorderRadius( borderRadius.to );
			}

			return transformer;
		},

		pause () {
			if ( !running ) return transformer;
			running = false;

			if ( !useTimer ) {
				// TODO derive current position somehow, use that rather than
				// current computed style (from and to get out of sync in
				// some browsers?)
				remaining = endTime - Date.now();

				from.freeze();
				to.freeze();
				disposeCss();
			}

			return transformer;
		},

		play () {
			if ( running ) return transformer;
			running = true;

			endTime = Date.now() + remaining;

			if ( useTimer ) {
				rAF( tick );
			} else {
				const { fromKeyframes, toKeyframes } = getKeyframes( from, to, interpolators, options.easing || linear, remaining, duration );

				const fromId = generateId();
				const toId = generateId();

				const css = `
					${KEYFRAMES} ${fromId} { ${fromKeyframes} }
					${KEYFRAMES} ${toId}   { ${toKeyframes} }`;

				disposeCss = addCss( css );

				from.animateWithKeyframes( fromId, remaining );
				to.animateWithKeyframes( toId, remaining );
			}

			return transformer;
		}
	};


	// handle animation end
	if ( !useTimer ) {
		let animating = 2;

		const done = () => {
			if ( !--animating ) {
				transformer.teardown();

				if ( options.done ) options.done();

				disposeCss();
			}
		};

		from._clone.addEventListener( ANIMATION_END, done );
		to._clone.addEventListener( ANIMATION_END, done );
	}

	transformer.play();

	return transformer;
}

function generateId () {
	return 'ramjet' + ~~( Math.random() * 1000000 );
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

function getKeyframes ( from, to, interpolators, easing, remaining, duration ) {
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
