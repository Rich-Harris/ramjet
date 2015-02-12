import processNode from './utils/processNode';
import getTransform from './utils/getTransform';
import mogrifyWithTimer from './mogrifyWithTimer';
import mogrifyWithKeyframes from './mogrifyWithKeyframes';
import { easing } from './easing';

export default mogrify;

const USE_TIMER = false;

function mogrify ( fromNode, toNode, options = {} ) {
	var from, to;

	if ( typeof options === 'function' ) {
		options = { done: options };
	}

	from = processNode( fromNode );
	to = processNode( toNode );

	if ( USE_TIMER || options.useTimer ) {
		mogrifyWithTimer( from, to, options );
	} else {
		mogrifyWithKeyframes( from, to, options );
	}
}

mogrify.easing = easing; // expose this so we can add to it