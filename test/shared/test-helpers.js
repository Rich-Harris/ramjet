(function () {
	window.actionHandlers = {};
	window.action = action;
	window.next = next;
	window.screenshot = screenshot;
	window.wait = wait;

	var uid = 1;

	function action ( type, options ) {
		return new Promise( ( fulfil, reject ) => {
			var id = '_' + uid++;

			window.actionHandlers[ id ] = wrap( fulfil, reject, id );

			console.log( '__action', {
				type,
				options,
				id
			});
		});
	}

	function next () {
		return action( 'next' );
	}

	function screenshot ( name ) {
		return wait().then( () => action( 'screenshot', { name }) );
	}

	function wait ( ms ) {
		return new Promise( fulfil => setTimeout( fulfil, ms ) );
	}

	function wrap ( fulfil, reject, id ) {
		return function ( err, result ) {
			if ( err ) {
				reject( err );
			} else {
				fulfil( result );
			}

			delete window.actionHandlers[ id ];
		};
	}
})();
