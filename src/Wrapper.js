import { cloneNode } from './utils/node.js';
import parseColor from './utils/parseColor.js';
import parseBorderRadius from './utils/parseBorderRadius.js';
import { svgns } from './utils/svg.js';
import { findParentByTagName } from './utils/findParent.js';
import {
	ANIMATION,
	ANIMATION_DIRECTION,
	ANIMATION_DURATION,
	ANIMATION_ITERATION_COUNT,
	ANIMATION_NAME,
	ANIMATION_TIMING_FUNCTION,
	TRANSFORM,
	TRANSFORM_ORIGIN
} from './utils/detect.js';
import {
	invert,
	getCumulativeTransformMatrix,
	getTransformMatrix,
	multiply,
	IDENTITY
} from './utils/matrix.js';

function getBoundingClientRect ( node, invertedParentCTM ) {
	const originalTransformOrigin = node.style[ TRANSFORM_ORIGIN ];
	const originalTransform = node.style[ TRANSFORM ];
	const originalTransformAttribute = node.getAttribute( 'transform' ); // SVG

	node.style[ TRANSFORM_ORIGIN ] = '0 0';
	node.style[ TRANSFORM ] = `matrix(${invertedParentCTM.join(',')})`;

	const bcr = node.getBoundingClientRect();

	// reset
	node.style[ TRANSFORM_ORIGIN ] = originalTransformOrigin;
	node.style[ TRANSFORM ] = originalTransform;
	node.setAttribute( 'transform', originalTransformAttribute || '' ); // TODO remove attribute altogether if null?

	return bcr;
}

export default class Wrapper {
	constructor ( node, options ) {
		this.init( node, options );
	}

	init ( node ) {
		this._node = node;
		this._clone = cloneNode( node );

		const style = window.getComputedStyle( node );
		this.style = style;

		// we need to get the 'naked' boundingClientRect, i.e.
		// without any transforms
		// TODO what if the node is the root <svg> node?
		const parentCTM = node.namespaceURI === 'svg' ? node.parentNode.getScreenCTM() : getCumulativeTransformMatrix( node.parentNode );
		this.invertedParentCTM = invert( parentCTM );
		this.transform = getTransformMatrix( node ) || IDENTITY;
		this.ctm = multiply( parentCTM, this.transform );

		const bcr = getBoundingClientRect( node, this.invertedParentCTM );
		this.bcr = bcr;

		// TODO create a flat array? easier to work with later?
		const borderRadius = {
			tl: parseBorderRadius( style.borderTopLeftRadius ),
			tr: parseBorderRadius( style.borderTopRightRadius ),
			br: parseBorderRadius( style.borderBottomRightRadius ),
			bl: parseBorderRadius( style.borderBottomLeftRadius )
		};

		this.borderRadius = borderRadius;
		this.opacity = +( style.opacity );
		this.rgba = parseColor( style.backgroundColor );

		this.left = bcr.left;
		this.top = bcr.top;
		this.width = bcr.width;
		this.height = bcr.height;
	}

	insert () {
		const bcr = this.bcr;

		const offsetParent = this._node.offsetParent;

		let clone;

		if ( this._node.namespaceURI === svgns ) { // TODO what if it's the <svg> itself, not a child?
			const svg = findParentByTagName( this._node, 'svg' ); // TODO should be the namespace boundary - could be SVG inside SVG

			clone = svg.cloneNode( false );
			clone.appendChild( this._clone ); // TODO what about transforms?
		} else {
			clone = this._clone;
		}

		const offsetParentStyle = window.getComputedStyle( offsetParent );
		const offsetParentBcr = getBoundingClientRect( offsetParent, invert( getCumulativeTransformMatrix( offsetParent.parentNode ) ) );

		clone.style.position = 'absolute';
		clone.style[ TRANSFORM_ORIGIN ] = '0 0';
		clone.style.top = ( bcr.top - parseInt( this.style.marginTop, 10 ) - ( offsetParentBcr.top - parseInt( offsetParentStyle.marginTop, 10 ) ) ) + 'px';
		clone.style.left = ( bcr.left - parseInt( this.style.marginLeft, 10 ) - ( offsetParentBcr.left - parseInt( offsetParentStyle.marginLeft, 10 ) ) ) + 'px';

		// TODO we need to account for transforms *between* the offset parent and the node

		offsetParent.appendChild( clone );
	}

	detach () {
		this._clone.parentNode.removeChild( this._clone );
	}

	setOpacity ( opacity ) {
		this._clone.style.opacity = opacity;
	}

	setTransform( transform ) {
		this._clone.style.transform = this._clone.style.webkitTransform = this._clone.style.msTransform = transform;
	}

	setBackgroundColor ( color ) {
		this._clone.style.backgroundColor = color;
	}

	setBorderRadius ( borderRadius ) {
		this._clone.style.borderRadius = borderRadius;
	}

	animateWithKeyframes ( id, duration ) {
		this._clone.style[ ANIMATION_DIRECTION ] = 'alternate';
		this._clone.style[ ANIMATION_DURATION ] = `${duration/1000}s`;
		this._clone.style[ ANIMATION_ITERATION_COUNT ] = 1;
		this._clone.style[ ANIMATION_NAME ] = id;
		this._clone.style[ ANIMATION_TIMING_FUNCTION ] = 'linear';
	}

	freeze () {
		const computedStyle = getComputedStyle( this._clone );

		this.setOpacity( computedStyle.opacity );
		this.setTransform( computedStyle.transform );
		this.setBackgroundColor( computedStyle.backgroundColor );
		this.setBorderRadius( computedStyle.borderRadius );

		this._clone.style[ ANIMATION ] = 'none';
	}
}
