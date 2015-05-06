import { showNode, hideNode } from './utils/node';
import wrapNode from './wrappers/wrapNode';
import TimerTransformer from './transformers/TimerTransformer';
import KeyframeTransformer from './transformers/KeyframeTransformer';
import { linear, easeIn, easeOut, easeInOut } from './easing';
import { keyframesSupported } from './utils/detect';

export default {
	transform ( fromNode, toNode, options = {} ) {
		if ( typeof options === 'function' ) {
			options = { done: options };
		}

		if ( !( 'duration' in options ) ) {
			options.duration = 400;
		}

		const from = wrapNode( fromNode );
		const to = wrapNode( toNode );

		from.setOpacity( 1 );
		to.setOpacity( 0 );

		// TODO this breaks svg support!
		from.insert();
		to.insert();

		if ( !keyframesSupported || options.useTimer ) {
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