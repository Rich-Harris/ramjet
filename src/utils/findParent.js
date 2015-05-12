import { svgns } from './svg';

export function findParentByTagName ( node, tagName ) {
	while ( node ) {
		if ( node.tagName === tagName ) {
			return node;
		}

		node = node.parentNode;
	}
}

export function findTransformParent ( node ) {
	const isSvg = node.namespaceURI === svgns && node.tagName !== 'svg';
	return isSvg ? findParentByTagName( node, 'svg' ) : node.parentNode;
}