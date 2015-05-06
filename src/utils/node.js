import styleKeys from './styleKeys';
import { svgContainer, svgns } from './svg';
import getCumulativeOpacity from './getCumulativeOpacity';
import getCumulativeTransform from './getCumulativeTransform';
import { invert, parseMatrixTransformString } from './matrix';

export function cloneNode ( node ) {
	const clone = node.cloneNode();

	let style;
	let len;
	let i;

	let attr;

	if ( node.nodeType === 1 ) {
		style = window.getComputedStyle( node );

		styleKeys.forEach( function ( prop ) {
			clone.style[ prop ] = style[ prop ];
		});

		len = node.childNodes.length;
		for ( i = 0; i < len; i += 1 ) {
			clone.appendChild( cloneNode( node.childNodes[i] ) );
		}
	}

	return clone;
}

export function wrapNode ( node, container ) {
	const isSvg = node.namespaceURI === svgns;

	let bcr = node.getBoundingClientRect();
	const style = window.getComputedStyle( node );
	const opacity = getCumulativeOpacity( node );

	// node.backgroundColor will be a four element array containing the rgba values.
	// The fourth element will be NaN if either equal to 1 or only an rgb value.
	var bgColorRegexp = /^rgb[a]?\((\d+),\s*(\d+),\s*(\d+),?\s*(\d?.\d+)?\)$/
	// If the background color matches, then split the matched values and parse their values.
	const backgroundColor = (bgColorRegexp.test(style.backgroundColor) ? bgColorRegexp.exec(style.backgroundColor).slice(1).map(parseFloat) : null);

	const clone = cloneNode( node );

	let transform;
	let borderRadius;

	if ( isSvg ) {
		const ctm = node.getScreenCTM();
		transform = 'matrix(' + [ ctm.a, ctm.b, ctm.c, ctm.d, ctm.e, ctm.f ].join( ',' ) + ')';
		borderRadius = [ 0, 0, 0, 0 ];
	} else {
		const offsetParent = node.offsetParent;
		const offsetParentStyle = window.getComputedStyle( offsetParent );
		const offsetParentBcr = offsetParent.getBoundingClientRect();

		transform = getCumulativeTransform( node );

		// temporarily invert the cumulative transform so that we can get the correct boundingClientRect
		const transformStyle = node.style.transform || node.style.webkitTransform;
		const transformStyleComputed = style.webkitTransform || style.transform;

		if ( transformStyleComputed !== 'none' ) {
			const inverted = invert( parseMatrixTransformString( transformStyleComputed ) );
			node.style.webkitTransform = node.style.transform = `matrix(${inverted.join(',')})`;

			bcr = node.getBoundingClientRect();

			node.style.webkitTransform = node.style.transform = transformStyle;
		}

		clone.style.position = 'absolute';
		clone.style.top = ( bcr.top - parseInt( style.marginTop, 10 ) + window.scrollY ) + 'px';
		clone.style.left = ( bcr.left - parseInt( style.marginLeft, 10 ) + window.scrollX ) + 'px';

		// TODO use matrices all the way down, this is silly
		transform = `matrix(${transform.join(',')})`;

		// TODO this is wrong... need to account for corners with 2 radii
		borderRadius = [
			parseFloat( style.borderTopLeftRadius ),
			parseFloat( style.borderTopRightRadius ),
			parseFloat( style.borderBottomRightRadius ),
			parseFloat( style.borderBottomLeftRadius )
		];
	}

	const wrapper = {
		node, clone, isSvg, transform, borderRadius, opacity, backgroundColor,
		cx: ( bcr.left + bcr.right ) / 2,
		cy: ( bcr.top + bcr.bottom ) / 2,
		width: bcr.right - bcr.left,
		height: bcr.bottom - bcr.top
	};

	return wrapper;
}

export function hideNode ( node ) {
	node.__ramjetOriginalTransition__ = node.style.webkitTransition || node.style.transition;
	node.__ramjetOriginalOpacity__ = node.style.opacity;

	node.style.webkitTransition = node.style.transition = '';

	node.style.opacity = 0;
}

export function showNode ( node ) {
	if ( '__ramjetOriginalOpacity__' in node ) {
		node.style.transition = '';
		node.style.opacity = node.__ramjetOriginalOpacity__;

		if ( node.__ramjetOriginalTransition__ ) {
			setTimeout( () => {
				node.style.transition = node.__ramjetOriginalTransition__;
			});
		}
	}
}