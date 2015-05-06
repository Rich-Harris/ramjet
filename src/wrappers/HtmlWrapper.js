import cloneNode from './cloneNode';

export default class HtmlWrapper {
	constructor ( node, options ) {
		this.init( node, options );
	}

	init ( node, options ) {
		let bcr = node.getBoundingClientRect();
		const style = window.getComputedStyle( node );
		const opacity = +( style.opacity );

		let clone = cloneNode( node, options.copyStyles );

		// node.backgroundColor will be a four element array containing the rgba values.
		// The fourth element will be NaN if either equal to 1 or only an rgb value.
		var bgColorRegexp = /^rgb[a]?\((\d+),\s*(\d+),\s*(\d+),?\s*(\d?.\d+)?\)$/
		// If the background color matches, then split the matched values and parse their values.
		const backgroundColor = (bgColorRegexp.test(style.backgroundColor) ? bgColorRegexp.exec(style.backgroundColor).slice(1).map(parseFloat) : null);

		let transform;
		let borderRadius;

		const offsetParent = node.offsetParent;
		const offsetParentStyle = window.getComputedStyle( offsetParent );
		const offsetParentBcr = offsetParent.getBoundingClientRect();

		clone.style.position = 'absolute';
		clone.style.top = ( bcr.top - parseInt( style.marginTop, 10 ) - ( offsetParentBcr.top - parseInt( offsetParentStyle.marginTop, 10 ) ) ) + 'px';
		clone.style.left = ( bcr.left - parseInt( style.marginLeft, 10 ) - ( offsetParentBcr.left - parseInt( offsetParentStyle.marginLeft, 10 ) ) ) + 'px';

		// TODO use matrices all the way down, this is silly
		//transform = `matrix(${transform.join(',')})`;
		transform = '';

		// TODO this is wrong... need to account for corners with 2 radii
		borderRadius = [
			parseFloat( style.borderTopLeftRadius ),
			parseFloat( style.borderTopRightRadius ),
			parseFloat( style.borderBottomRightRadius ),
			parseFloat( style.borderBottomLeftRadius )
		];

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
		// TODO handle corners with two radii
		this.clone.style.borderTopLeftRadius     = borderRadius[0];
		this.clone.style.borderTopRightRadius    = borderRadius[1];
		this.clone.style.borderBottomRightRadius = borderRadius[2];
		this.clone.style.borderBottomLeftRadius  = borderRadius[3];
	}
}