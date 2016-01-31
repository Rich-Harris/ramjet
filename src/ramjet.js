import { compare } from 'stacking-order';
import { showNode, hideNode } from './utils/node';
import wrapNode from './wrappers/wrapNode';
import transformer from './transformers/transformer.js';
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

		const order = compare( from._node, to._node );

		from.setOpacity( 1 );
		to.setOpacity( 0 );

		// in many cases, the stacking order of `from` and `to` is
		// determined by their relative location in the document –
		// so we need to preserve it
		if ( order === 1 ) {
			to.insert();
			from.insert();
		} else {
			from.insert();
			to.insert();
		}

		return transformer( from, to, options );
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
