(function () {

	'use strict';

	var mogrify;

	mogrify = function ( fromNode, toNode, options ) {
		var from, to, dx, dy, dsxf, dsyf, dsxt, dsyt, startTime, duration;

		from = process( fromNode );
		to = process( toNode );

		dx = to.cx - from.cx;
		dy = to.cy - from.cy;

		dsxf = ( to.width / from.width ) - 1;
		dsyf = ( to.height / from.height ) - 1;

		dsxt = ( from.width / to.width ) - 1;
		dsyt = ( from.height / to.height ) - 1;

		console.log( 'from, to', from, to );
		console.log( 'dx, dy', dx, dy );

		fromNode.parentNode.insertBefore( from.clone, fromNode.nextSibling );
		toNode.parentNode.insertBefore( to.clone, toNode.nextSibling );

		toNode.style.visibility = 'hidden';
		fromNode.style.visibility = 'hidden';

		startTime = Date.now();
		duration = options.duration || 400;

		function tick () {
			var timeNow, elapsed, t, transform;

			timeNow = Date.now();
			elapsed = timeNow - startTime;

			if ( elapsed > duration ) {
				from.clone.parentNode.removeChild( from.clone );
				to.clone.parentNode.removeChild( to.clone );

				to.node.style.visibility = 'visible';

				return;
			}

			t = elapsed / duration;

			from.clone.style.opacity = 1 - t;
			to.clone.style.opacity = t;

			from.clone.style.transform = getTransform( dx, dy, dsxf, dsyf, t );
			to.clone.style.transform = getTransform( -dx, -dy, dsxt, dsyt, 1 - t );

			from.clone.style.webkitTransform = getTransform( dx, dy, dsxf, dsyf, t );
			to.clone.style.webkitTransform = getTransform( -dx, -dy, dsxt, dsyt, 1 - t );

			requestAnimationFrame( tick );
		}

		tick();
	};

	function process ( node ) {
		var target, style, bcr, clone;

		bcr = node.getBoundingClientRect();
		style = window.getComputedStyle( node );

		clone = node.cloneNode( true );

		target = {
			node: node,
			bcr: bcr,
			clone: clone,
			cx: ( bcr.left + bcr.right ) / 2,
			cy: ( bcr.top + bcr.bottom ) / 2,
			width: bcr.right - bcr.left,
			height: bcr.bottom - bcr.top
		};

		Object.keys( style ).forEach( function ( prop ) {
			clone.style[ prop ] = style[ prop ];
		});

		clone.style.position = 'fixed';
		clone.style.top = ( bcr.top - parseInt( style.marginTop, 10 ) ) + 'px';
		clone.style.left = ( bcr.left - parseInt( style.marginLeft, 10 ) ) + 'px';

		return target;
	}

	function getTransform ( dx, dy, dsx, dsy, t ) {
		return 'translate(' + ( t * dx ) + 'px,' + ( t * dy ) + 'px) scale(' + ( 1 + ( t * dsx ) ) + ',' + ( 1 + ( t * dsy ) ) + ')';
	}

	window.mogrify = mogrify;

}());
