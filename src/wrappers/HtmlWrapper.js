import cloneNode from './cloneNode';
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
import parseColor from '../utils/parseColor';
import parseBorderRadius from '../utils/parseBorderRadius';
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

	node.style[ TRANSFORM_ORIGIN ] = '0 0';
	node.style[ TRANSFORM ] = `matrix(${invertedParentCTM.join(',')})`;

	const bcr = node.getBoundingClientRect();

	// reset
	node.style[ TRANSFORM_ORIGIN ] = originalTransformOrigin;
	node.style[ TRANSFORM ] = originalTransform;

	return bcr;
}

export default class HtmlWrapper {
	constructor ( node, options ) {
		this.init( node, options );
	}

	init ( node, options ) {
		this.isSvg = false;
		this.node = node;

		this.clone = cloneNode( node );

		const style = window.getComputedStyle( node );

		// we need to get the 'naked' boundingClientRect, i.e.
		// without any transforms
		const parentCTM = getCumulativeTransformMatrix( node.parentNode );
		this.invertedParentCTM = invert( parentCTM );
		this.transform = getTransformMatrix( node ) || IDENTITY;
		this.ctm = multiply( parentCTM, this.transform );

		const bcr = getBoundingClientRect( node, this.invertedParentCTM );

		const opacity = +( style.opacity );

		const rgba = parseColor( style.backgroundColor );

		const container = node.parentNode;
		const containerStyle = window.getComputedStyle( container );
		const containerBcr = getBoundingClientRect( container, invert( getCumulativeTransformMatrix( container.parentNode ) ) );

		this.clone.style.position = 'absolute';
		this.clone.style[ TRANSFORM_ORIGIN ] = '0 0';
		this.clone.style.top = ( bcr.top - parseInt( style.marginTop, 10 ) - ( containerBcr.top - parseInt( containerStyle.marginTop, 10 ) ) ) + 'px';
		this.clone.style.left = ( bcr.left - parseInt( style.marginLeft, 10 ) - ( containerBcr.left - parseInt( containerStyle.marginLeft, 10 ) ) ) + 'px';

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
		this.node.parentNode.appendChild( this.clone );
	}

	detach () {
		this.clone.parentNode.removeChild( this.clone );
	}

	setOpacity ( opacity ) {
		this.clone.style.opacity = opacity;
	}

	setTransform( transform ) {
		this.clone.style.transform = this.clone.style.webkitTransform = this.clone.style.msTransform = transform;
	}

	setBackgroundColor ( color ) {
		this.clone.style.backgroundColor = color;
	}

	setBorderRadius ( borderRadius ) {
		this.clone.style.borderRadius = borderRadius;
	}

	animateWithKeyframes ( id, duration, callback ) {
		this.clone.style[ ANIMATION_DIRECTION ] = 'alternate';
		this.clone.style[ ANIMATION_DURATION ] = `${duration/1000}s`;
		this.clone.style[ ANIMATION_ITERATION_COUNT ] = 1;
		this.clone.style[ ANIMATION_NAME ] = id;
		this.clone.style[ ANIMATION_TIMING_FUNCTION ] = 'linear';

		this.clone.addEventListener( ANIMATION_END, callback );
	}
}