import cloneNode from './cloneNode';
import parseColor from '../utils/parseColor';
import parseBorderRadius from '../utils/parseBorderRadius';
import { svgns } from '../utils/svg';
import { findTransformParent, findParentByTagName } from '../utils/findParent';
import {
	ANIMATION_DIRECTION,
	ANIMATION_DURATION,
	ANIMATION_ITERATION_COUNT,
	ANIMATION_NAME,
	ANIMATION_TIMING_FUNCTION,
	ANIMATION_END,
	TRANSFORM,
	TRANSFORM_ORIGIN
} from '../utils/detect';
import {
	invert,
	getCumulativeTransformMatrix,
	getTransformMatrix,
	multiply,
	IDENTITY
} from '../utils/matrix';

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

export default class HtmlWrapper {
	constructor ( node, options ) {
		this.init( node, options );
	}

	init ( node, options ) {
		this._node = node;

		this._clone = cloneNode( node );

		const style = window.getComputedStyle( node );
		this.style = style;

		// we need to get the 'naked' boundingClientRect, i.e.
		// without any transforms
		const parentCTM = node.namespaceURI === 'svg' ? node.parentNode.getScreenCTM() : getCumulativeTransformMatrix( node.parentNode );
		this.invertedParentCTM = invert( parentCTM );
		this.transform = getTransformMatrix( node ) || IDENTITY;
		this.ctm = multiply( parentCTM, this.transform );

		const bcr = getBoundingClientRect( node, this.invertedParentCTM );
		this.bcr = bcr;
		window.draw( bcr.left, bcr.top, bcr.width, bcr.height );

		console.group( node );
		console.log( 'this.invertedParentCTM', this.invertedParentCTM );
		console.log( 'this.transform', this.transform );
		console.log( 'this.ctm', this.ctm );
		console.log( 'bcr', bcr );
		console.groupEnd();

		const opacity = +( style.opacity );

		const rgba = parseColor( style.backgroundColor );



		// TODO create a flat array? easier to work with later?
		const borderRadius = {
			tl: parseBorderRadius( style.borderTopLeftRadius ),
			tr: parseBorderRadius( style.borderTopRightRadius ),
			br: parseBorderRadius( style.borderBottomRightRadius ),
			bl: parseBorderRadius( style.borderBottomLeftRadius )
		};

		this.borderRadius = borderRadius;
		this.opacity = opacity;
		this.rgba = rgba;

		this.left = bcr.left;
		this.top = bcr.top;
		this.width = bcr.width;
		this.height = bcr.height;
	}

	insert () {
		const container = findTransformParent( this._node );
		const containerStyle = window.getComputedStyle( container );
		const containerBcr = getBoundingClientRect( container, invert( getCumulativeTransformMatrix( container.parentNode ) ) );

		const bcr = this.bcr;

		this._clone.style.position = 'absolute';
		this._clone.style[ TRANSFORM_ORIGIN ] = '0 0';
		this._clone.style.top = ( bcr.top - parseInt( this.style.marginTop, 10 ) - ( containerBcr.top - parseInt( containerStyle.marginTop, 10 ) ) ) + 'px';
		this._clone.style.left = ( bcr.left - parseInt( this.style.marginLeft, 10 ) - ( containerBcr.left - parseInt( containerStyle.marginLeft, 10 ) ) ) + 'px';

		this._node.parentNode.appendChild( this._clone );
	}

	detach () {
		this._clone.parentNode.removeChild( this._clone );
	}

	getZIndex () {
		return parseFloat( this._clone.style.zIndex ) || 0;
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

	setZIndex ( index ) {
		this._clone.style.zIndex = index;
	}

	animateWithKeyframes ( id, duration, callback ) {
		this._clone.style[ ANIMATION_DIRECTION ] = 'alternate';
		this._clone.style[ ANIMATION_DURATION ] = `${duration/1000}s`;
		this._clone.style[ ANIMATION_ITERATION_COUNT ] = 1;
		this._clone.style[ ANIMATION_NAME ] = id;
		this._clone.style[ ANIMATION_TIMING_FUNCTION ] = 'linear';

		this._clone.addEventListener( ANIMATION_END, callback );
	}
}