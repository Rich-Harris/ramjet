(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	global.Ractive.transitions.fade = factory()
}(this, function () { 'use strict';

	var ractive_transitions_fade = fade;
	var DEFAULTS = {
		delay: 0,
		duration: 300,
		easing: "linear"
	};
	function fade(t, params) {
		var targetOpacity;

		params = t.processParams(params, DEFAULTS);

		if (t.isIntro) {
			targetOpacity = t.getStyle("opacity");
			t.setStyle("opacity", 0);
		} else {
			targetOpacity = 0;
		}

		t.animateStyle("opacity", targetOpacity, params).then(t.complete);
	}

	return ractive_transitions_fade;

}));