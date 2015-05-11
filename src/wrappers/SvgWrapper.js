import HtmlWrapper from './HtmlWrapper';
import { svgns } from '../utils/svg';
import cloneNode from './cloneNode';
import { invert } from '../utils/matrix';
import parseColor from '../utils/parseColor';

export default class SvgWrapper extends HtmlWrapper {
	constructor ( node, options ) {
		super( node, options );
	}

	init ( node, options ) {
		let { top, right, bottom, left } = node.getBoundingClientRect();
		const width = right - left;
		const height = bottom - top;

		const style = window.getComputedStyle( node );
		const opacity = style.opacity;

		const ctm = node.getCTM();

		let clone = wrapWithSvg( cloneNode( node ), width, height, ctm );

		const rgba = parseColor( style.fill );

		let transform;
		let borderRadius;

		transform = '';
		borderRadius = {
			tl: { x: 0, y: 0 },
			tr: { x: 0, y: 0 },
			br: { x: 0, y: 0 },
			bl: { x: 0, y: 0 }
		};

		const offsetParent = node.offsetParent;
		const offsetParentStyle = window.getComputedStyle( offsetParent );
		const offsetParentBcr = offsetParent.getBoundingClientRect();

		clone.style.position = 'absolute';
		clone.style.top = ( top - parseInt( style.marginTop, 10 ) - ( offsetParentBcr.top - parseInt( offsetParentStyle.marginTop, 10 ) ) ) + 'px';
		clone.style.left = ( left - parseInt( style.marginLeft, 10 ) - ( offsetParentBcr.left - parseInt( offsetParentStyle.marginLeft, 10 ) ) ) + 'px';

		clone.style.webkitTransformOrigin = clone.style.transformOrigin = '0 0';

		this.isSvg = false;
		this.node = node;
		this.clone = clone;
		this.transform = transform;
		this.borderRadius = borderRadius;
		this.opacity = opacity;
		this.rgba = rgba;

		this.left = left;
		this.top = top;
		this.width = width;
		this.height = height;
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
function wrapWithSvg ( node, width, height, { a, b, c, d, e, f } ) {
	const svg = document.createElementNS( svgns, 'svg' );
	svg.style.position = 'absolute';
	svg.style.width = width + 'px';
	svg.style.height = height + 'px';
	svg.style.overflow = 'visible';

	const g = document.createElementNS( svgns, 'g' );
	g.setAttribute( 'transform', `matrix(${a},${b},${c},${d},${e},${f})` );
	g.appendChild( node );

	svg.appendChild( g );

	return svg;
}