import { showNode, hideNode } from './utils/node';
import wrapNode from './wrappers/wrapNode';
import TimerTransformer from './transformers/TimerTransformer';
import KeyframeTransformer from './transformers/KeyframeTransformer';
import { linear, easeIn, easeOut, easeInOut } from './easing';
import { keyframesSupported } from './utils/detect';

// TEMP
import * as matrix from './utils/matrix';

export default {
	transform ( fromNode, toNode, options = {} ) {
		if ( typeof options === 'function' ) {
			options = { done: options };
		}

		if ( !( 'duration' in options ) ) {
			options.duration = 400;
		}

		const from = wrapNode( fromNode, options );
		const to = wrapNode( toNode, options );

		from.setOpacity( 1 );
		to.setOpacity( 0 );

		from.insert();
		to.insert();

		// This will fail if `from` is inside a different (higher)
		// stacking context than `to`. Not much we can do ¯\_(ツ)_/¯
		to.setZIndex( Math.max( to.getZIndex(), from.getZIndex() + 1 ) );

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
	linear, easeIn, easeOut, easeInOut,

	// TEMP
	matrix
};