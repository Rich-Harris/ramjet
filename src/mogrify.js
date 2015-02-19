import processNode from './utils/processNode';
import mogrifyWithTimer from './mogrifyWithTimer';
import mogrifyWithKeyframes from './mogrifyWithKeyframes';
import { easing } from './easing';
import { keyframesSupported } from './utils/detect';

export default mogrify;

function mogrify ( fromNode, toNode, options = {} ) {
	var from, to;

	if ( typeof options === 'function' ) {
		options = { done: options };
	}

	from = processNode( fromNode );
	to = processNode( toNode );

	if ( !keyframesSupported || options.useTimer ) {
		mogrifyWithTimer( from, to, options );
	} else {
		mogrifyWithKeyframes( from, to, options );
	}
}

mogrify.hide = ( ...nodes ) => {
	nodes.forEach( hideNode );
};

function hideNode ( node ) {
	node.__mogrifyOriginalTransition__ = node.style.transition;
	node.style.transition = '';

	node.style.opacity = 0;
}

mogrify.show = ( ...nodes ) => {
	nodes.forEach( showNode );
};

function showNode ( node ) {
	node.style.transition = '';
	node.style.opacity = 1;

	if ( node.__mogrifyOriginalTransition__ ) {
		setTimeout( () => {
			node.style.transition = node.__mogrifyOriginalTransition__;
		});
	}
}

mogrify.easing = easing; // expose this so we can add to it