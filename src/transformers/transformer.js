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

	const opacityAt = getOpacityInterpolator( from.opacity, to.opacity );
	const backgroundColorAt = getRgbaInterpolator( from.rgba, to.rgba );
	const borderRadiusAt = getBorderRadiusInterpolator( from, to );
	const transformFromAt = getTransformInterpolator( from, to );
	const transformToAt = getTransformInterpolator( to, from );

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
			const opacity = opacityAt( t );
			from.setOpacity( opacity.from );
			to.setOpacity( opacity.to );

			// background color
			if ( backgroundColorAt ) {
				const backgroundColor = backgroundColorAt( t );
				from.setBackgroundColor( backgroundColor.from );
				to.setBackgroundColor( backgroundColor.to );
			}

			// border radius
			const borderRadius = borderRadiusAt( t );
			from.setBorderRadius( borderRadius.from );
			to.setBorderRadius( borderRadius.to );

			// transform
			const transformFrom = transformFromAt( t );
			const transformTo = transformToAt( 1 - t );
			from.setTransform( transformFrom );
			to.setTransform( transformTo );

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
				const { fromKeyframes, toKeyframes } = getKeyframes( from, to, options.easing || linear, remaining, duration );

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

function getKeyframes ( from, to, easing, remaining, duration ) {
	// TODO we already have these interpolators...
	const opacityAt = getOpacityInterpolator( from.opacity, to.opacity );
	const backgroundColorAt = getRgbaInterpolator( from.rgba, to.rgba );
	const borderRadiusAt = getBorderRadiusInterpolator( from, to );
	const transformFromAt = getTransformInterpolator( from, to );
	const transformToAt = getTransformInterpolator( to, from );

	const numFrames = remaining / 16;

	let fromKeyframes = '';
	let toKeyframes = '';

	function addKeyframes ( pc, t ) {
		const opacity = opacityAt( t );
		const backgroundColor = backgroundColorAt ? backgroundColorAt( t ) : null;
		const borderRadius = borderRadiusAt( t ); // TODO this needs to be optional, to avoid repaints
		const transformFrom = transformFromAt( t );
		const transformTo = transformToAt( 1 - t );

		fromKeyframes += '\n' +
			`${pc}% {` +
				`opacity: ${opacity.from};` +
				`${TRANSFORM_CSS}: ${transformFrom};` +
				( backgroundColor ? `background-color: ${backgroundColor.from};` : '' ) +
				`border-radius: ${borderRadius.from};` +
			`}`;

		toKeyframes += '\n' +
			`${pc}% {` +
				`opacity: ${opacity.to};` +
				`${TRANSFORM_CSS}: ${transformTo};` +
				( backgroundColor ? `background-color: ${backgroundColor.to};` : '' ) +
				`border-radius: ${borderRadius.to};` +
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
