(function () {

	'use strict';

	var assert = chai.assert;
	var fixture = document.querySelector( '#fixture' );

	fixture.style.position = 'fixed';
	fixture.style.right = 0;
	fixture.style.bottom = 0;

	describe( 'ramjet', function () {
		it( 'exists', function () {
			assert.ok( ramjet );
		});

		// TODO figure out how the hell to test this stuff!
	});

}());

