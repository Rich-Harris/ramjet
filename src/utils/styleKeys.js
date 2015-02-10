var styleKeys = ( function () {
	if ( typeof CSS2Properties !== 'undefined' ) {
		// why hello Firefox
		return Object.keys( CSS2Properties.prototype );
	}

	return Object.keys( document.createElement( 'div' ).style );
})();

export default styleKeys;