(function (global, factory) {
            typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
            typeof define === 'function' && define.amd ? define(factory) :
            global.ramjet = factory()
}(this, function () { 'use strict';

            // for the sake of Safari, may it burn in hell
            var BLACKLIST = ["length", "parentRule"];

            var styleKeys = (function () {
            	var keys;

            	if (typeof CSS2Properties !== "undefined") {
            		// why hello Firefox
            		keys = Object.keys(CSS2Properties.prototype);
            	} else {
            		keys = Object.keys(document.createElement("div").style).filter(function (k) {
            			return ! ~BLACKLIST.indexOf(k);
            		});
            	}

            	return keys;
            })();

            var svgns = "http://www.w3.org/2000/svg";
            var svg = document.createElementNS(svgns, "svg");

            svg.style.position = "fixed";
            svg.style.top = svg.style.left = "0";
            svg.style.width = svg.style.height = "100%";
            svg.style.overflow = "visible";
            svg.style.pointerEvents = "none";
            svg.setAttribute("class", "mogrify-svg");

            document.body.appendChild(svg);

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
            }function processNode(node) {
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
            		node: node, bcr: bcr, clone: clone,
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
            }function hideNode(node) {
            	node.__ramjetOriginalTransition__ = node.style.transition;
            	node.style.transition = "";

            	node.style.opacity = 0;
            }function showNode(node) {
            	node.style.transition = "";
            	node.style.opacity = 1;

            	if (node.__ramjetOriginalTransition__) {
            		setTimeout(function () {
            			node.style.transition = node.__ramjetOriginalTransition__;
            		});
            	}
            }

            function getTransform(isSvg, cx, cy, dx, dy, dsx, dsy, t) {
            	if (isSvg) {
            		return "translate(" + cx + "px," + cy + "px) scale(" + (1 + t * dsx) + "," + (1 + t * dsy) + ") translate(-" + cx + "px,-" + cy + "px) translate(" + t * dx + "px," + t * dy + "px)";
            	}

            	return "translate(" + t * dx + "px," + t * dy + "px) scale(" + (1 + t * dsx) + "," + (1 + t * dsy) + ")";
            }

            function linear(pos) {
            	return pos;
            }function easeIn(pos) {
            	return Math.pow(pos, 3);
            }function easeOut(pos) {
            	return Math.pow(pos - 1, 3) + 1;
            }function easeInOut(pos) {
            	if ((pos /= 0.5) < 1) {
            		return 0.5 * Math.pow(pos, 3);
            	}
            	return 0.5 * (Math.pow(pos - 2, 3) + 2);
            }

            var rAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function (fn) {
                        return setTimeout(fn, 16);
            };

            var TimerTransformer___classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

            var TimerTransformer__TimerTransformer = function TimerTransformer__TimerTransformer(from, to, options) {
            	TimerTransformer___classCallCheck(this, TimerTransformer__TimerTransformer);

            	var dx = to.cx - from.cx;
            	var dy = to.cy - from.cy;

            	var dsxf = to.width / from.width - 1;
            	var dsyf = to.height / from.height - 1;

            	var dsxt = from.width / to.width - 1;
            	var dsyt = from.height / to.height - 1;

            	var startTime = Date.now();
            	var duration = options.duration || 400;
            	var easing = options.easing || linear;

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

            		rAF(tick);
            	}

            	tick();
            };

            var TimerTransformer__default = TimerTransformer__TimerTransformer;

            var div = document.createElement("div");

            var keyframesSupported = true;
            var TRANSFORM = undefined;
            var KEYFRAMES = undefined;
            var ANIMATION_DIRECTION = undefined;
            var ANIMATION_DURATION = undefined;
            var ANIMATION_ITERATION_COUNT = undefined;
            var ANIMATION_NAME = undefined;
            var ANIMATION_TIMING_FUNCTION = undefined;
            var ANIMATION_END = undefined;

            if (("transform" in div.style || "webkitTransform" in div.style) && ("animation" in div.style || "webkitAnimation" in div.style)) {
            	keyframesSupported = true;

            	TRANSFORM = "transform" in div.style ? "transform" : "-webkit-transform";

            	if ("animation" in div.style) {
            		KEYFRAMES = "@keyframes";

            		ANIMATION_DIRECTION = "animationDirection";
            		ANIMATION_DURATION = "animationDuration";
            		ANIMATION_ITERATION_COUNT = "animationIterationCount";
            		ANIMATION_NAME = "animationName";
            		ANIMATION_TIMING_FUNCTION = "animationTimingFunction";

            		ANIMATION_END = "animationend";
            	} else {
            		KEYFRAMES = "@-webkit-keyframes";

            		ANIMATION_DIRECTION = "webkitAnimationDirection";
            		ANIMATION_DURATION = "webkitAnimationDuration";
            		ANIMATION_ITERATION_COUNT = "webkitAnimationIterationCount";
            		ANIMATION_NAME = "webkitAnimationName";
            		ANIMATION_TIMING_FUNCTION = "webkitAnimationTimingFunction";

            		ANIMATION_END = "webkitAnimationEnd";
            	}
            } else {
            	keyframesSupported = false;
            }

            var KeyframeTransformer___classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

            var KeyframeTransformer__KeyframeTransformer = function KeyframeTransformer__KeyframeTransformer(from, to, options) {
            	KeyframeTransformer___classCallCheck(this, KeyframeTransformer__KeyframeTransformer);

            	console.log("options.duration", options.duration);
            	var _getKeyframes = getKeyframes(from, to, options);

            	var fromKeyframes = _getKeyframes.fromKeyframes;
            	var toKeyframes = _getKeyframes.toKeyframes;


            	var fromId = "_" + ~ ~(Math.random() * 1000000);
            	var toId = "_" + ~ ~(Math.random() * 1000000);

            	var css = "" + KEYFRAMES + " " + fromId + " { " + fromKeyframes + " } " + KEYFRAMES + " " + toId + " { " + toKeyframes + " }";
            	var dispose = addCss(css);

            	from.clone.style[ANIMATION_DIRECTION] = "alternate";
            	from.clone.style[ANIMATION_DURATION] = "" + options.duration / 1000 + "s";
            	from.clone.style[ANIMATION_ITERATION_COUNT] = 1;
            	from.clone.style[ANIMATION_NAME] = fromId;
            	from.clone.style[ANIMATION_TIMING_FUNCTION] = "linear";

            	to.clone.style[ANIMATION_DIRECTION] = "alternate";
            	to.clone.style[ANIMATION_DURATION] = "" + options.duration / 1000 + "s";
            	to.clone.style[ANIMATION_ITERATION_COUNT] = 1;
            	to.clone.style[ANIMATION_NAME] = toId;
            	to.clone.style[ANIMATION_TIMING_FUNCTION] = "linear";

            	var fromDone, toDone;

            	function done() {
            		if (fromDone && toDone) {
            			from.clone.parentNode.removeChild(from.clone);
            			to.clone.parentNode.removeChild(to.clone);

            			if (options.done) options.done();

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
            };

            var KeyframeTransformer__default = KeyframeTransformer__KeyframeTransformer;

            function addCss(css) {
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

            	var easing = options.easing || linear;

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

            var ramjet = {
            	transform: function transform(fromNode, toNode) {
            		var options = arguments[2] === undefined ? {} : arguments[2];
            		if (typeof options === "function") {
            			options = { done: options };
            		}

            		if (!("duration" in options)) {
            			options.duration = 400;
            		}

            		var from = processNode(fromNode);
            		var to = processNode(toNode);

            		if (!keyframesSupported || options.useTimer) {
            			return new TimerTransformer__default(from, to, options);
            		} else {
            			return new KeyframeTransformer__default(from, to, options);
            		}
            	},

            	hide: function hide() {
            		for (var _len = arguments.length, nodes = Array(_len), _key = 0; _key < _len; _key++) {
            			nodes[_key] = arguments[_key];
            		}

            		nodes.forEach(hideNode);
            	},

            	show: function show() {
            		for (var _len = arguments.length, nodes = Array(_len), _key = 0; _key < _len; _key++) {
            			nodes[_key] = arguments[_key];
            		}

            		nodes.forEach(showNode);
            	},

            	// expose some basic easing functions
            	linear: linear, easeIn: easeIn, easeOut: easeOut, easeInOut: easeInOut
            };

            return ramjet;

}));