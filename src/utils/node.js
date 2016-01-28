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
