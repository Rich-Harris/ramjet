import styleKeys from './styleKeys';
import { svg, svgns } from './svg';

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

export function wrapNode ( node, destinationIsFixed ) {
	const isSvg = node.namespaceURI === svgns;

	const { left, right, top, bottom } = node.getBoundingClientRect();
	const style = window.getComputedStyle( node );
	const clone = cloneNode( node );

	const wrapper = {
		node, clone, isSvg,
		cx: ( left + right ) / 2,
		cy: ( top + bottom ) / 2,
		width: right - left,
		height: bottom - top,
		transform: null,
		borderRadius: null
	};

	if ( isSvg ) {
		const ctm = node.getScreenCTM();
		wrapper.transform = 'matrix(' + [ ctm.a, ctm.b, ctm.c, ctm.d, ctm.e, ctm.f ].join( ',' ) + ')';
		wrapper.borderRadius = [ 0, 0, 0, 0 ];

		svg.appendChild( clone );
	} else {

    if ( destinationIsFixed ){
			clone.style.position = 'fixed';
			clone.style.top = ( top - parseInt( style.marginTop, 10 )) + 'px';
			clone.style.left = ( left - parseInt( style.marginLeft, 10 )) + 'px';
		}
		else {
			if (style.position === "fixed"){
				// position relative to the document
				const docElem = document.documentElement;
				clone.style.position = 'absolute';
				clone.style.top = (top + window.pageYOffset - docElem.clientTop - parseInt( style.marginTop, 10 )) + 'px';
				clone.style.left = (left + window.pageXOffset - docElem.clientLeft - parseInt( style.marginLeft, 10 )) + 'px';
			}
			else {
				// position relative to the parent
				const offsetParent = node.offsetParent;
				const offsetParentStyle = window.getComputedStyle( offsetParent );
				const offsetParentBcr = offsetParent.getBoundingClientRect();

				clone.style.position = 'absolute';
				clone.style.top = ( top - parseInt( style.marginTop, 10 ) - ( offsetParentBcr.top - parseInt( offsetParentStyle.marginTop, 10 ) ) ) + 'px';
				clone.style.left = ( left - parseInt( style.marginLeft, 10 ) - ( offsetParentBcr.left - parseInt( offsetParentStyle.marginLeft, 10 ) ) ) + 'px';
			}
		}

		wrapper.transform = ''; // TODO...?
		wrapper.borderRadius = [
			parseFloat( style.borderTopLeftRadius ),
			parseFloat( style.borderTopRightRadius ),
			parseFloat( style.borderBottomRightRadius ),
			parseFloat( style.borderBottomLeftRadius )
		];

		node.parentNode.appendChild( clone );
	}

	return wrapper;
}

export function hideNode ( node ) {
	node.__ramjetOriginalTransition__ = node.style.transition;
	node.style.transition = '';

	node.style.opacity = 0;
}

export function showNode ( node ) {
	node.style.transition = '';
	node.style.opacity = 1;

	if ( node.__ramjetOriginalTransition__ ) {
		setTimeout( () => {
			node.style.transition = node.__ramjetOriginalTransition__;
		});
	}
}
