import HtmlWrapper from './HtmlWrapper';
import { svgns } from '../utils/svg';
import cloneNode from './cloneNode';

export default class SvgWrapper extends HtmlWrapper {
	constructor ( node, options ) {
		super( node, options );
	}

	init ( node, options ) {
		let bcr = node.getBoundingClientRect();
		const style = window.getComputedStyle( node );
		const opacity = style.opacity;

		let clone = wrapWithSvg( cloneNode( node, options.copyStyles ) );

		// node.backgroundColor will be a four element array containing the rgba values.
		// The fourth element will be NaN if either equal to 1 or only an rgb value.
		var bgColorRegexp = /^rgb[a]?\((\d+),\s*(\d+),\s*(\d+),?\s*(\d?.\d+)?\)$/
		// If the background color matches, then split the matched values and parse their values.
		const backgroundColor = (bgColorRegexp.test(style.fill) ? bgColorRegexp.exec(style.fill).slice(1).map(parseFloat) : null);

		let transform;
		let borderRadius;

		const ctm = node.getScreenCTM();
		//transform = 'matrix(1,0,0,1,0,0)';
		transform = '';
		//transform = 'matrix(' + [ ctm.a, ctm.b, ctm.c, ctm.d, ctm.e, ctm.f ].join( ',' ) + ')';
		borderRadius = [ 0, 0, 0, 0 ];

		// clone.style.top = ( bcr.top + window.scrollY ) + 'px';
		// clone.style.left = ( bcr.left + window.scrollX ) + 'px'
		const offsetParent = node.offsetParent;
		const offsetParentStyle = window.getComputedStyle( offsetParent );
		const offsetParentBcr = offsetParent.getBoundingClientRect();

		clone.style.position = 'absolute';
		clone.style.top = ( bcr.top - parseInt( style.marginTop, 10 ) - ( offsetParentBcr.top - parseInt( offsetParentStyle.marginTop, 10 ) ) ) + 'px';
		clone.style.left = ( bcr.left - parseInt( style.marginLeft, 10 ) - ( offsetParentBcr.left - parseInt( offsetParentStyle.marginLeft, 10 ) ) ) + 'px';

		clone.style.webkitTransformOrigin = clone.style.transformOrigin = '0 0';

		this.isSvg = false;
		this.node = node;
		this.clone = clone;
		this.transform = transform;
		this.borderRadius = borderRadius;
		this.opacity = opacity;
		this.backgroundColor = backgroundColor;

		this.left = bcr.left;
		this.top = bcr.top;
		this.width = bcr.width;
		this.height = bcr.height;
	}

	insert () {
		const svg = findParent( this.node, 'svg' );
		svg.parentNode.appendChild( this.clone );
	}

	setBackgroundColor ( color ) {
		throw new Error( 'TODO' ); // need to store reference to the cloned node, not just the <svg> wrapper...
	}

	setBorderRadius ( borderRadius ) {
		// noop. TODO we can make this work with <rect>, <circle> and possible <ellipse> elements.
		// would only work in timer mode
	}
}

function findParent ( node, tagName ) {
	while ( node ) {
		if ( node.tagName === tagName ) {
			return node;
		}

		node = node.parentNode;
	}
}

// TODO refactor this
function wrapWithSvg ( node ) {
	const svg = document.createElementNS( svgns, 'svg' );
	svg.style.position = 'absolute';
	svg.style.width = svg.style.height = '100%';

	svg.appendChild( node );
	return svg;
}