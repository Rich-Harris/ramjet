// for the sake of Safari, may it burn in hell
const BLACKLIST = [ 'length', 'parentRule' ];

let styleKeys;

if ( typeof CSS2Properties !== 'undefined' ) {
	// why hello Firefox
	styleKeys = Object.keys( CSS2Properties.prototype );
} else {
	styleKeys = Object.keys( document.createElement( 'div' ).style ).filter( k => !~BLACKLIST.indexOf( k ) );
}

export default styleKeys;