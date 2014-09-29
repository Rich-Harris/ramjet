(function ( global ) {

	'use strict';

	if ( typeof define === 'function' && define.amd ) {
		define( function () { return mogrify; });
	} else if ( typeof module !== 'undefined' && module.exports ) {
		module.exports = mogrify;
	} else {
		global.mogrify = mogrify;
	}

	var styleKeys;

	function mogrify ( fromNode, toNode, options ) {
		var fulfil, reject, from, to, dx, dy, dsxf, dsyf, dsxt, dsyt, startTime, duration, easing;

		options = options || {};

		if ( typeof options === 'function' ) {
			options = { done: options };
		}

		from = process( fromNode );
		to = process( toNode );

		dx = to.cx - from.cx;
		dy = to.cy - from.cy;

		dsxf = ( to.width / from.width ) - 1;
		dsyf = ( to.height / from.height ) - 1;

		dsxt = ( from.width / to.width ) - 1;
		dsyt = ( from.height / to.height ) - 1;

		startTime = Date.now();
		duration = options.duration || 400;
		easing = getEasing( options.easing );

		function tick () {
			var timeNow, elapsed, t, fromTransform, toTransform;

			timeNow = Date.now();
			elapsed = timeNow - startTime;

			if ( elapsed > duration ) {
				from.clone.parentNode.removeChild( from.clone );
				to.clone.parentNode.removeChild( to.clone );

				if ( options.done ) {
					options.done();
				}

				return;
			}

			t = easing( elapsed / duration );

			from.clone.style.opacity = 1 - t;
			to.clone.style.opacity = t;

			fromTransform = getTransform( dx, dy, dsxf, dsyf, t );
			toTransform = getTransform( -dx, -dy, dsxt, dsyt, 1 - t );

			from.clone.style.transform = from.clone.style.webkitTransform = fromTransform;
			from.clone.style.transform = to.clone.style.webkitTransform = toTransform;

			requestAnimationFrame( tick );
		}

		tick();
	}

	mogrify.easing = {
		linear: function ( pos ) { return pos; },
		easeIn: function ( pos ) { return Math.pow( pos, 3 ); },
		easeOut: function ( pos ) { return ( Math.pow( ( pos - 1 ), 3 ) + 1 ); },
		easeInOut: function ( pos ) {
			if ( ( pos /= 0.5 ) < 1 ) { return ( 0.5 * Math.pow( pos, 3 ) ); }
			return ( 0.5 * ( Math.pow( ( pos - 2 ), 3 ) + 2 ) );
		}
	};

	function process ( node ) {
		var target, style, bcr, clone, i, len, child;

		bcr = node.getBoundingClientRect();
		style = window.getComputedStyle( node );

		clone = node.cloneNode();
		( styleKeys || ( styleKeys = Object.keys( style ) ) ).forEach( function ( prop ) {
			clone.style[ prop ] = style[ prop ];
		});

		clone.style.position = 'fixed';
		clone.style.top = ( bcr.top - parseInt( style.marginTop, 10 ) ) + 'px';
		clone.style.left = ( bcr.left - parseInt( style.marginLeft, 10 ) ) + 'px';

		// clone children recursively. We don't do this at the top level, because we want
		// to use the reference to `style`
		len = node.childNodes.length;
		for ( i = 0; i < len; i += 1 ) {
			child = cloneNode( node.childNodes[i] );
			clone.appendChild( child );
		}

		target = {
			node: node,
			bcr: bcr,
			clone: clone,
			cx: ( bcr.left + bcr.right ) / 2,
			cy: ( bcr.top + bcr.bottom ) / 2,
			width: bcr.right - bcr.left,
			height: bcr.bottom - bcr.top
		};

		node.parentNode.insertBefore( clone, node.nextSibling );

		return target;
	}

	function getTransform ( dx, dy, dsx, dsy, t ) {
		return 'translate(' + ( t * dx ) + 'px,' + ( t * dy ) + 'px) scale(' + ( 1 + ( t * dsx ) ) + ',' + ( 1 + ( t * dsy ) ) + ')';
	}

	function getEasing ( easing ) {
		if ( !easing ) {
			return mogrify.easing.easeOut;
		}

		if ( typeof easing === 'function' ) {
			return easing;
		}

		if ( typeof easing === 'string' && mogrify.easing[ easing ] ) {
			return mogrify.easing[ easing ];
		}

		throw new Error( 'Could not find easing function' );
	}

	function cloneNode ( node ) {
		var node, style, clone, len, i, attr;

		clone = node.cloneNode();

		if ( node.nodeType === 1 ) {
			style = getComputedStyle( node );

			styleKeys.forEach( function ( prop ) {
				clone.style[ prop ] = style[ prop ];
			});

			len = node.attributes.length;
			for ( i = 0; i < len; i += 1 ) {
				attr = node.attributes[i];
				clone.setAttribute( attr.name, attr.value );
			}

			len = node.childNodes.length;
			for ( i = 0; i < len; i += 1 ) {
				clone.appendChild( cloneNode( node.childNodes[i] ) );
			}
		}

		return clone;
	}

}( typeof window !== 'undefined' ? window : this ));
