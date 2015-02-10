import styleKeys from './styleKeys';
import cloneNode from './cloneNode';
import { svg, svgns } from './svg';

export default function processNode ( node ) {
	var target, style, bcr, clone, i, len, child, ctm;

	bcr = node.getBoundingClientRect();
	style = window.getComputedStyle( node );

	clone = node.cloneNode();
	styleKeys.forEach( function ( prop ) {
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
		height: bcr.bottom - bcr.top,
		isSvg: node.namespaceURI === svgns
	};

	if ( target.isSvg ) {
		ctm = node.getScreenCTM();
		target.transform = 'matrix(' + [ ctm.a, ctm.b, ctm.c, ctm.d, ctm.e, ctm.f ].join( ',' ) + ')';

		svg.appendChild( clone );
	} else {
		target.transform = ''; // TODO...?
		node.parentNode.appendChild( clone );
	}

	return target;
}