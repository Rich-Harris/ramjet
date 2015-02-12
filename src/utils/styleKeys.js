// for the sake of Safari, may it burn in hell
const BLACKLIST = [ 'length', 'parentRule' ];

var styleKeys = ( function () {
	var keys;

	if ( typeof CSS2Properties !== 'undefined' ) {
		// why hello Firefox
		keys = Object.keys( CSS2Properties.prototype );
	} else {
		keys = Object.keys( document.createElement( 'div' ).style ).filter( k => !~BLACKLIST.indexOf( k ) );
	}

	return keys;
})();

export default styleKeys;