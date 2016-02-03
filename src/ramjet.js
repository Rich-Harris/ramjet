import { compare } from 'stacking-order';
import { showNode, hideNode } from './utils/node.js';
import Wrapper from './Wrapper.js';
import transformer from './transformer.js';

export function transform ( fromNode, toNode, options = {} ) {
	if ( typeof options === 'function' ) {
		options = { done: options };
	}

	if ( !( 'duration' in options ) ) {
		options.duration = 400;
	}

	const from = new Wrapper( fromNode, options );
	const to = new Wrapper( toNode, options );

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
}

export function hide ( ...nodes ) {
	nodes.forEach( hideNode );
}

export function show ( ...nodes ) {
	nodes.forEach( showNode );
}

// expose some basic easing functions
export { linear, easeIn, easeOut, easeInOut } from './easing.js';
