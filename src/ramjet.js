import { wrapNode, showNode, hideNode, isNodeFixed } from './utils/node';
import TimerTransformer from './transformers/TimerTransformer';
import KeyframeTransformer from './transformers/KeyframeTransformer';
import { linear, easeIn, easeOut, easeInOut } from './easing';
import { keyframesSupported } from './utils/detect';
import { appendedSvg, appendSvg } from './utils/svg';

export default {
	transform ( fromNode, toNode, options = {} ) {
		if ( typeof options === 'function' ) {
			options = { done: options };
		}

		if ( !( 'duration' in options ) ) {
			options.duration = 400;
		}

		const appendToBody = !!options.appendToBody;
		const destinationIsFixed = isNodeFixed(toNode);
		const from = wrapNode( fromNode, destinationIsFixed, options.overrideClone, appendToBody);
		const to = wrapNode( toNode, destinationIsFixed, options.overrideClone, appendToBody );

		if ( from.isSvg || to.isSvg && !appendedSvg ) {
			appendSvg();
		}

		if ( !keyframesSupported || options.useTimer || from.isSvg || to.isSvg ) {
			return new TimerTransformer( from, to, options );
		} else {
			return new KeyframeTransformer( from, to, options );
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
