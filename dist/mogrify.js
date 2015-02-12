(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	global.mogrify = factory()
}(this, function () { 'use strict';

	var styleKeys = (function () {
		if (typeof CSS2Properties !== "undefined") {
			// why hello Firefox
			return Object.keys(CSS2Properties.prototype);
		}

		return Object.keys(document.createElement("div").style);
	})();

	function cloneNode(node) {
		var style, clone, len, i, attr;

		clone = node.cloneNode();

		if (node.nodeType === 1) {
			style = window.getComputedStyle(node);

			styleKeys.forEach(function (prop) {
				clone.style[prop] = style[prop];
			});

			len = node.attributes.length;
			for (i = 0; i < len; i += 1) {
				attr = node.attributes[i];
				clone.setAttribute(attr.name, attr.value);
			}

			len = node.childNodes.length;
			for (i = 0; i < len; i += 1) {
				clone.appendChild(cloneNode(node.childNodes[i]));
			}
		}

		return clone;
	}

	var svgns = "http://www.w3.org/2000/svg";
	var svg = document.createElementNS(svgns, "svg");

	svg.style.position = "fixed";
	svg.style.top = svg.style.left = "0";
	svg.style.width = svg.style.height = "100%";
	svg.style.overflow = "visible";
	svg.style.pointerEvents = "none";
	svg.setAttribute("class", "mogrify-svg");

	document.body.appendChild(svg);

	function processNode(node) {
		var target, style, bcr, clone, i, len, child, ctm;

		bcr = node.getBoundingClientRect();
		style = window.getComputedStyle(node);

		clone = node.cloneNode();
		styleKeys.forEach(function (prop) {
			clone.style[prop] = style[prop];
		});

		clone.style.position = "fixed";
		clone.style.top = bcr.top - parseInt(style.marginTop, 10) + "px";
		clone.style.left = bcr.left - parseInt(style.marginLeft, 10) + "px";

		// clone children recursively. We don't do this at the top level, because we want
		// to use the reference to `style`
		len = node.childNodes.length;
		for (i = 0; i < len; i += 1) {
			child = cloneNode(node.childNodes[i]);
			clone.appendChild(child);
		}

		target = {
			node: node,
			bcr: bcr,
			clone: clone,
			cx: (bcr.left + bcr.right) / 2,
			cy: (bcr.top + bcr.bottom) / 2,
			width: bcr.right - bcr.left,
			height: bcr.bottom - bcr.top,
			isSvg: node.namespaceURI === svgns
		};

		if (target.isSvg) {
			ctm = node.getScreenCTM();
			target.transform = "matrix(" + [ctm.a, ctm.b, ctm.c, ctm.d, ctm.e, ctm.f].join(",") + ")";

			svg.appendChild(clone);
		} else {
			target.transform = ""; // TODO...?
			node.parentNode.appendChild(clone);
		}

		return target;
	}

	function getTransform(isSvg, cx, cy, dx, dy, dsx, dsy, t) {
		if (isSvg) {
			return "translate(" + cx + "px," + cy + "px) scale(" + (1 + t * dsx) + "," + (1 + t * dsy) + ") translate(-" + cx + "px,-" + cy + "px) translate(" + t * dx + "px," + t * dy + "px)";
		}

		return "translate(" + t * dx + "px," + t * dy + "px) scale(" + (1 + t * dsx) + "," + (1 + t * dsy) + ")";
	}

	var easing = {
		linear: function (pos) {
			return pos;
		},
		easeIn: function (pos) {
			return Math.pow(pos, 3);
		},
		easeOut: function (pos) {
			return Math.pow(pos - 1, 3) + 1;
		},
		easeInOut: function (pos) {
			if ((pos /= 0.5) < 1) {
				return 0.5 * Math.pow(pos, 3);
			}
			return 0.5 * (Math.pow(pos - 2, 3) + 2);
		}
	};

	function getEasing(nameOrFn) {
		if (!nameOrFn) {
			return easing.easeOut;
		}

		if (typeof nameOrFn === "function") {
			return nameOrFn;
		}

		if (typeof nameOrFn === "string" && easing[nameOrFn]) {
			return easing[nameOrFn];
		}

		throw new Error("Could not find easing function");
	}

	function mogrifyWithTimer(from, to, options) {
		var dx = to.cx - from.cx;
		var dy = to.cy - from.cy;

		var dsxf = to.width / from.width - 1;
		var dsyf = to.height / from.height - 1;

		var dsxt = from.width / to.width - 1;
		var dsyt = from.height / to.height - 1;

		var startTime = Date.now();
		var duration = options.duration || 400;
		var easing = getEasing(options.easing);

		function tick() {
			var timeNow, elapsed, t, cx, cy, fromTransform, toTransform;

			timeNow = Date.now();
			elapsed = timeNow - startTime;

			if (elapsed > duration) {
				from.clone.parentNode.removeChild(from.clone);
				to.clone.parentNode.removeChild(to.clone);

				if (options.done) {
					options.done();
				}

				return;
			}

			t = easing(elapsed / duration);

			from.clone.style.opacity = 1 - t;
			to.clone.style.opacity = t;

			cx = from.cx + dx * t;
			cy = from.cy + dy * t;

			fromTransform = getTransform(from.isSvg, cx, cy, dx, dy, dsxf, dsyf, t) + " " + from.transform;
			toTransform = getTransform(to.isSvg, cx, cy, -dx, -dy, dsxt, dsyt, 1 - t) + " " + to.transform;

			from.clone.style.transform = from.clone.style.webkitTransform = fromTransform;
			to.clone.style.transform = to.clone.style.webkitTransform = toTransform;

			requestAnimationFrame(tick);
		}

		tick();
	}

	var TRANSFORM = "transform";
	var KEYFRAMES = "@-webkit-keyframes";

	var ANIMATION_DIRECTION = "-webkit-animation-direction";
	var ANIMATION_DURATION = "-webkit-animation-duration";
	var ANIMATION_ITERATION_COUNT = "-webkit-animation-iteration-count";
	var ANIMATION_NAME = "-webkit-animation-name";
	var ANIMATION_TIMING_FUNCTION = "-webkit-animation-timing-function";

	var ANIMATION_END = "webkitAnimationEnd";function mogrifyWithKeyframes(from, to, options) {
		var _getKeyframes = getKeyframes(from, to, options);

		var fromKeyframes = _getKeyframes.fromKeyframes;
		var toKeyframes = _getKeyframes.toKeyframes;


		var css = "" + KEYFRAMES + " abc { " + fromKeyframes + " } " + KEYFRAMES + " def { " + toKeyframes + " }";
		var dispose = addCss(css);

		from.clone.style[ANIMATION_DIRECTION] = "alternate";
		from.clone.style[ANIMATION_DURATION] = "" + options.duration / 1000 + "s";
		from.clone.style[ANIMATION_ITERATION_COUNT] = 1;
		from.clone.style[ANIMATION_NAME] = "abc";
		from.clone.style[ANIMATION_TIMING_FUNCTION] = "linear";

		to.clone.style[ANIMATION_DIRECTION] = "alternate";
		to.clone.style[ANIMATION_DURATION] = "" + options.duration / 1000 + "s";
		to.clone.style[ANIMATION_ITERATION_COUNT] = 1;
		to.clone.style[ANIMATION_NAME] = "def";
		to.clone.style[ANIMATION_TIMING_FUNCTION] = "linear";

		var fromDone, toDone;

		function done() {
			if (fromDone && toDone) {
				from.clone.parentNode.removeChild(from.clone);
				to.clone.parentNode.removeChild(to.clone);

				options.done && options.done();
				dispose();
			}
		}

		from.clone.addEventListener(ANIMATION_END, function () {
			fromDone = true;
			done();
		});

		to.clone.addEventListener(ANIMATION_END, function () {
			toDone = true;
			done();
		});
	}function addCss(css) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";

		var head = document.getElementsByTagName("head")[0];

		// Internet Exploder won't let you use styleSheet.innerHTML - we have to
		// use styleSheet.cssText instead
		var styleSheet = styleElement.styleSheet;

		if (styleSheet) {
			styleSheet.cssText = css;
		} else {
			styleElement.innerHTML = css;
		}

		head.appendChild(styleElement);

		return function () {
			return head.removeChild(styleElement);
		};
	}

	function getKeyframes(from, to, options) {
		var dx = to.cx - from.cx;
		var dy = to.cy - from.cy;

		var dsxf = to.width / from.width - 1;
		var dsyf = to.height / from.height - 1;

		var dsxt = from.width / to.width - 1;
		var dsyt = from.height / to.height - 1;

		var easing = getEasing(options.easing);

		var numFrames = options.duration / 50; // one keyframe per 50ms is probably enough... this may prove not to be the case though

		var fromKeyframes = [];
		var toKeyframes = [];
		var i;

		for (i = 0; i < numFrames; i += 1) {
			var pc = 100 * (i / numFrames);
			var t = easing(i / numFrames);

			var _cx = from.cx + dx * t;
			var _cy = from.cy + dy * t;

			var _fromTransform = getTransform(from.isSvg, _cx, _cy, dx, dy, dsxf, dsyf, t) + " " + from.transform;
			var _toTransform = getTransform(to.isSvg, _cx, _cy, -dx, -dy, dsxt, dsyt, 1 - t) + " " + to.transform;

			fromKeyframes.push("" + pc + "% { opacity: " + (1 - t) + "; " + TRANSFORM + ": " + _fromTransform + "; }");
			toKeyframes.push("" + pc + "% { opacity: " + t + "; " + TRANSFORM + ": " + _toTransform + "; }");
		}

		var cx = from.cx + dx;
		var cy = from.cy + dy;

		var fromTransform = getTransform(from.isSvg, cx, cy, dx, dy, dsxf, dsyf, 1) + " " + from.transform;
		var toTransform = getTransform(to.isSvg, cx, cy, -dx, -dy, dsxt, dsyt, 0) + " " + to.transform;

		fromKeyframes.push("100% { opacity: 0; " + TRANSFORM + ": " + fromTransform + "; }");
		toKeyframes.push("100% { opacity: 1; " + TRANSFORM + ": " + toTransform + "; }");

		fromKeyframes = fromKeyframes.join("\n");
		toKeyframes = toKeyframes.join("\n");

		return { fromKeyframes: fromKeyframes, toKeyframes: toKeyframes };
	}

	var USE_TIMER = false;

	function mogrify(fromNode, toNode) {
		var options = arguments[2] === undefined ? {} : arguments[2];
		var from, to;

		if (typeof options === "function") {
			options = { done: options };
		}

		from = processNode(fromNode);
		to = processNode(toNode);

		if (USE_TIMER || options.useTimer) {
			mogrifyWithTimer(from, to, options);
		} else {
			mogrifyWithKeyframes(from, to, options);
		}
	}

	mogrify.easing = easing; // expose this so we can add to it

	return mogrify;

}));