import { wrapNode, showNode, hideNode } from './utils/node';
import TimerTransformer from './transformers/TimerTransformer';
import KeyframeTransformer from './transformers/KeyframeTransformer';
import { linear, easeIn, easeOut, easeInOut } from './easing';
import { keyframesSupported } from './utils/detect';
import { incrementSvg } from './utils/svg';
import { incrementHtml, htmlContainer } from './utils/html';

function makeContainer () {
	const div = document.createElement( 'div' );

	div.style.position = 'absolute';
	div.style.left = div.style.top = 0;

	htmlContainer.appendChild( div );

	return div;
}

export default {
	transform ( fromNode, toNode, options = {} ) {
		if ( typeof options === 'function' ) {
			options = { done: options };
		}

		if ( !( 'duration' in options ) ) {
			options.duration = 400;
		}

		const container = makeContainer();
		const from = wrapNode( fromNode );
		const to = wrapNode( toNode );

		from.clone.style.opacity = 1;
		to.clone.style.opacity = 0;

		// create top-level containers if necessary
		( from.isSvg ? incrementSvg : incrementHtml )();
		( to.isSvg ? incrementSvg : incrementHtml )();

		// TODO this breaks svg support!
		container.appendChild( from.clone );
		container.appendChild( to.clone );

		if ( !keyframesSupported || options.useTimer || from.isSvg || to.isSvg ) {
			return new TimerTransformer( from, to, container, options );
		} else {
			return new KeyframeTransformer( from, to, container, options );
		}
	},

	hide ( ...nodes ) {
		nodes.forEach( hideNode );
	},

	show ( ...nodes ) {
		nodes.forEach( showNode );
	},

	// expose some basic easing functions
	linear, easeIn, easeOut, easeInOut
};