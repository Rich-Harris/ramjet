import { compare } from 'stacking-order';
import getOpacityInterpolator from './interpolators/opacity.js';
import getRgbaInterpolator from './interpolators/rgba.js';
import getBorderRadiusInterpolator from './interpolators/borderRadius.js';
import getTransformInterpolator from './interpolators/transform.js';
import { linear } from './easing.js';
import addCss from './utils/addCss.js';
import getKeyframes from './utils/getKeyframes.js';
import generateId from './utils/generateId.js';
import {
	KEYFRAMES,
	ANIMATION_END,
	keyframesSupported
} from './utils/detect.js';
import rAF from './utils/rAF.js';

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

	return transformer.play();
}
