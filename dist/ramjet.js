(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  global.ramjet = factory()
}(this, function () { 'use strict';

  // for the sake of Safari, may it burn in hell
  var BLACKLIST = ['length', 'parentRule'];

  var styleKeys = undefined;

  if (typeof CSS2Properties !== 'undefined') {
  	// why hello Firefox
  	styleKeys = Object.keys(CSS2Properties.prototype);
  } else {
  	styleKeys = Object.keys(document.createElement('div').style).filter(function (k) {
  		return ! ~BLACKLIST.indexOf(k);
  	});
  }

  var utils_styleKeys = styleKeys;

  var svgns = 'http://www.w3.org/2000/svg';
  var svgContainer = document.createElementNS(svgns, 'svg');

  svgContainer.style.position = 'fixed';
  svgContainer.style.top = svgContainer.style.left = '0';
  svgContainer.style.width = svgContainer.style.height = '100%';
  svgContainer.style.overflow = 'visible';
  svgContainer.style.pointerEvents = 'none';
  svgContainer.setAttribute('class', 'ramjet-svg');

  var svg__count = 0;

  function incrementSvg() {
  	if (!svg__count) {
  		document.body.appendChild(svgContainer);
  	}

  	svg__count += 1;
  }

  function decrementSvg() {
  	svg__count -= 1;

  	if (!svg__count) {
  		document.body.removeChild(svgContainer);
  	}
  }

  var utils_getCumulativeOpacity = getCumulativeOpacity;

  function getCumulativeOpacity(node) {
  	var opacity = 1;

  	while (node instanceof Element && opacity) {
  		var style = getComputedStyle(node);

  		if (style.visibility === 'hidden' || style.display === 'none') {
  			throw new Error('Ramjet: you cannot transition between nodes that have visibility: hidden or display: none (or their children)');
  		}

  		opacity *= parseFloat(style.opacity);
  		node = node.parentNode;
  	}

  	return opacity;
  }

  function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }

  function multiply(_ref, _ref3) {
  	var _ref2 = _slicedToArray(_ref, 6);

  	var a1 = _ref2[0];
  	var b1 = _ref2[1];
  	var c1 = _ref2[2];
  	var d1 = _ref2[3];
  	var e1 = _ref2[4];
  	var f1 = _ref2[5];

  	var _ref32 = _slicedToArray(_ref3, 6);

  	var a2 = _ref32[0];
  	var b2 = _ref32[1];
  	var c2 = _ref32[2];
  	var d2 = _ref32[3];
  	var e2 = _ref32[4];
  	var f2 = _ref32[5];

  	return [a1 * a2 + c1 * b2, // a
  	b1 * a2 + d1 * b2, // b
  	a1 * c2 + c1 * d2, // c
  	b1 * c2 + d1 * d2, // d
  	a1 * e2 + c1 * f2 + e1, // e
  	b1 * e2 + d1 * f2 + f1 // f
  	];
  }

  function invert(_ref4) {
  	var _ref42 = _slicedToArray(_ref4, 6);

  	var a = _ref42[0];
  	var b = _ref42[1];
  	var c = _ref42[2];
  	var d = _ref42[3];
  	var e = _ref42[4];
  	var f = _ref42[5];

  	var determinant = a * d - c * b;

  	return [d / determinant, -b / determinant, -c / determinant, a / determinant, (c * f - e * d) / determinant, (e * b - a * f) / determinant];
  }

  function parseMatrixTransformString(transform) {
  	if (transform.slice(0, 7) !== 'matrix(') {
  		throw new Error('Could not parse transform string (' + transform + ')');
  	}

  	return transform.slice(7, -1).split(' ').map(parseFloat);
  }

  function parseTransformString(transform) {
  	var div = document.createElement('div');
  	div.style.webkitTransform = div.style.transform = transform;

  	document.body.appendChild(div);
  	var style = getComputedStyle(div);
  	var matrix = parseMatrixTransformString(style.webkitTransform || style.transform);
  	document.body.removeChild(div);

  	return matrix;
  }

  var utils_getCumulativeTransform = getCumulativeTransform;
  function getCumulativeTransform(node) {
  	var matrix = [1, 0, 0, 1, 0, 0];

  	while (node instanceof Element) {
  		var style = getComputedStyle(node);
  		var transform = style.webkitTransform || style.transform;

  		if (transform !== 'none') {
  			var parentMatrix = parseMatrixTransformString(transform);
  			matrix = multiply(parentMatrix, matrix);
  		}

  		node = node.parentNode;
  	}

  	return matrix;
  }

  function cloneNode(node) {
  	var clone = node.cloneNode();

  	var style = undefined;
  	var len = undefined;
  	var i = undefined;

  	var attr = undefined;

  	if (node.nodeType === 1) {
  		style = window.getComputedStyle(node);

  		utils_styleKeys.forEach(function (prop) {
  			clone.style[prop] = style[prop];
  		});

  		len = node.childNodes.length;
  		for (i = 0; i < len; i += 1) {
  			clone.appendChild(cloneNode(node.childNodes[i]));
  		}
  	}

  	return clone;
  }

  function wrapNode(node, container) {
  	var isSvg = node.namespaceURI === svgns;

  	var bcr = node.getBoundingClientRect();
  	var style = window.getComputedStyle(node);
  	var opacity = utils_getCumulativeOpacity(node);

  	// node.backgroundColor will be a four element array containing the rgba values.
  	// The fourth element will be NaN if either equal to 1 or only an rgb value.
  	var bgColorRegexp = /^rgb[a]?\((\d+),\s*(\d+),\s*(\d+),?\s*(\d?.\d+)?\)$/;
  	// If the background color matches, then split the matched values and parse their values.
  	var backgroundColor = bgColorRegexp.test(style.backgroundColor) ? bgColorRegexp.exec(style.backgroundColor).slice(1).map(parseFloat) : null;

  	var clone = cloneNode(node);

  	var transform = undefined;
  	var borderRadius = undefined;

  	if (isSvg) {
  		var ctm = node.getScreenCTM();
  		transform = 'matrix(' + [ctm.a, ctm.b, ctm.c, ctm.d, ctm.e, ctm.f].join(',') + ')';
  		borderRadius = [0, 0, 0, 0];
  	} else {
  		var offsetParent = node.offsetParent;
  		var offsetParentStyle = window.getComputedStyle(offsetParent);
  		var offsetParentBcr = offsetParent.getBoundingClientRect();

  		transform = utils_getCumulativeTransform(node);

  		// temporarily invert the cumulative transform so that we can get the correct boundingClientRect
  		var transformStyle = node.style.transform || node.style.webkitTransform;
  		var transformStyleComputed = style.webkitTransform || style.transform;

  		if (transformStyleComputed !== 'none') {
  			var inverted = invert(parseMatrixTransformString(transformStyleComputed));
  			node.style.webkitTransform = node.style.transform = 'matrix(' + inverted.join(',') + ')';

  			bcr = node.getBoundingClientRect();

  			node.style.webkitTransform = node.style.transform = transformStyle;
  		}

  		clone.style.position = 'absolute';
  		clone.style.top = bcr.top - parseInt(style.marginTop, 10) + window.scrollY + 'px';
  		clone.style.left = bcr.left - parseInt(style.marginLeft, 10) + window.scrollX + 'px';

  		// TODO use matrices all the way down, this is silly
  		transform = 'matrix(' + transform.join(',') + ')';

  		// TODO this is wrong... need to account for corners with 2 radii
  		borderRadius = [parseFloat(style.borderTopLeftRadius), parseFloat(style.borderTopRightRadius), parseFloat(style.borderBottomRightRadius), parseFloat(style.borderBottomLeftRadius)];
  	}

  	var wrapper = {
  		node: node, clone: clone, isSvg: isSvg, transform: transform, borderRadius: borderRadius, opacity: opacity, backgroundColor: backgroundColor,
  		cx: (bcr.left + bcr.right) / 2,
  		cy: (bcr.top + bcr.bottom) / 2,
  		width: bcr.right - bcr.left,
  		height: bcr.bottom - bcr.top
  	};

  	return wrapper;
  }

  function hideNode(node) {
  	node.__ramjetOriginalTransition__ = node.style.webkitTransition || node.style.transition;
  	node.__ramjetOriginalOpacity__ = node.style.opacity;

  	node.style.webkitTransition = node.style.transition = '';

  	node.style.opacity = 0;
  }

  function showNode(node) {
  	if ('__ramjetOriginalOpacity__' in node) {
  		node.style.transition = '';
  		node.style.opacity = node.__ramjetOriginalOpacity__;

  		if (node.__ramjetOriginalTransition__) {
  			setTimeout(function () {
  				node.style.transition = node.__ramjetOriginalTransition__;
  			});
  		}
  	}
  }

  var utils_getTransform = getTransform;

  function getTransform(isSvg, cx, cy, dx, dy, dsx, dsy, t) {
  	var transform = isSvg ? "translate(" + cx + " " + cy + ") scale(" + (1 + t * dsx) + " " + (1 + t * dsy) + ") translate(" + -cx + " " + -cy + ") translate(" + t * dx + " " + t * dy + ")" : "translate(" + t * dx + "px," + t * dy + "px) scale(" + (1 + t * dsx) + "," + (1 + t * dsy) + ")";

  	return transform;
  }

  /**
   * Given two opacities and Time t it returns two new opacity values such that
   * the opacities can be smoothly transitioned between two values.
   */
  function transitionOpacities(fromOpacity, toOpacity, t) {
    var targetOpacity = (toOpacity - fromOpacity) * t + fromOpacity;
    // Based on the blending formula here. (http://en.wikipedia.org/wiki/Alpha_compositing#Alpha_blending)
    // This is a quadratic blending function that makes the top layer and bottom layer blend linearly.
    // However there is an asymptote at target=1 so that needs to be handled with an if else statement.
    if (targetOpacity == 1) {
      var newFromOpacity = 1;
      var newToOpacity = t;
    } else {
      var newFromOpacity = targetOpacity - t * t * targetOpacity;
      var newToOpacity = (targetOpacity - newFromOpacity) / (1 - newFromOpacity);
    }
    return [newFromOpacity, newToOpacity];
  }
  function getOpacity(from, to, t) {
    return transitionOpacities(from.opacity, to.opacity, t);
  }

  function getBackgroundColors(from, to, t) {
    var opacities;
    if (from.backgroundColor && !isNaN(from.backgroundColor[3]) && to.backgroundColor && !isNaN(to.backgroundColor[3])) {
      //We have rgbas on both nodes to animate between.
      opacities = transitionOpacities(from.backgroundColor[3], to.backgroundColor[3], t);
    } else if (from.backgroundColor && !isNaN(from.backgroundColor[3])) {
      //We have rgba on the from node but either rgb or nothing on the to node
      opacities = transitionOpacities(from.backgroundColor[3], !!to.backgroundColor ? 1 : 0, t);
    } else if (to.backgroundColor && !!!isNaN(to.backgroundColor[3])) {
      //We have rgba on the to node but either rgb or nothing on the from node
      opacities = transitionOpacities(!!from.backgroundColor ? 1 : 0, to.backgroundColor[3], t);
    } else {
      //No need to animate.
      return [false, false];
    }

    return [from.backgroundColor ? 'rgba(' + from.backgroundColor.slice(0, 3).join(',') + ', ' + opacities[0] + ')' : false, to.backgroundColor ? 'rgba(' + to.backgroundColor.slice(0, 3).join(',') + ', ' + opacities[1] + ')' : false];
  }

  var utils_getBorderRadius = getBorderRadius;

  function getBorderRadius(a, b, dsx, dsy, t) {
  	var sx = 1 + t * dsx;
  	var sy = 1 + t * dsy;

  	return a.map(function (from, i) {
  		var to = b[i];

  		var rx = (from + t * (to - from)) / sx;
  		var ry = (from + t * (to - from)) / sy;

  		return "" + rx + "px " + ry + "px";
  	});
  }

  var htmlContainer = document.createElement('div');

  htmlContainer.style.position = 'absolute';
  htmlContainer.style.top = htmlContainer.style.left = '0';
  htmlContainer.style.width = htmlContainer.style.height = '100%';
  htmlContainer.style.overflow = 'visible';
  htmlContainer.style.pointerEvents = 'none';
  htmlContainer.setAttribute('class', 'ramjet-html');

  var html__count = 0;

  function incrementHtml() {
  	if (!html__count) {
  		document.body.appendChild(htmlContainer);
  	}

  	html__count += 1;
  }

  function decrementHtml() {
  	html__count -= 1;

  	if (!html__count) {
  		document.body.removeChild(htmlContainer);
  	}
  }

  function linear(pos) {
  	return pos;
  }

  function easeIn(pos) {
  	return Math.pow(pos, 3);
  }

  function easeOut(pos) {
  	return Math.pow(pos - 1, 3) + 1;
  }

  function easeInOut(pos) {
  	if ((pos /= 0.5) < 1) {
  		return 0.5 * Math.pow(pos, 3);
  	}

  	return 0.5 * (Math.pow(pos - 2, 3) + 2);
  }

  var rAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function (fn) {
              return setTimeout(fn, 16);
  };

  var utils_rAF = rAF;

  function transformers_TimerTransformer___classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var transformers_TimerTransformer__TimerTransformer = function TimerTransformer(from, to, container, options) {
  	transformers_TimerTransformer___classCallCheck(this, transformers_TimerTransformer__TimerTransformer);

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
  		var timeNow = Date.now();
  		var elapsed = timeNow - startTime;

  		if (elapsed > duration) {
  			from.clone.parentNode.removeChild(from.clone);
  			to.clone.parentNode.removeChild(to.clone);

  			// remove containers if possible
  			(from.isSvg ? decrementSvg : decrementHtml)();
  			(to.isSvg ? decrementSvg : decrementHtml)();

  			if (options.done) {
  				options.done();
  			}

  			return;
  		}

  		var t = easing(elapsed / duration);

  		// opacity
  		var opacities = getOpacity(from, to, t);
  		from.clone.style.opacity = opacities[0];
  		to.clone.style.opacity = opacities[1];

  		// opacity
  		var backgroundColors = getBackgroundColors(from, to, t);
  		if (backgroundColors[0]) {
  			from.clone.style.backgroundColor = backgroundColors[0];
  		}
  		if (backgroundColors[1]) {
  			to.clone.style.backgroundColor = backgroundColors[1];
  		}

  		// border radius
  		var fromBorderRadius = utils_getBorderRadius(from.borderRadius, to.borderRadius, dsxf, dsyf, t);
  		var toBorderRadius = utils_getBorderRadius(to.borderRadius, from.borderRadius, dsxt, dsyt, 1 - t);

  		applyBorderRadius(from.clone, fromBorderRadius);
  		applyBorderRadius(to.clone, toBorderRadius);

  		var cx = from.cx + dx * t;
  		var cy = from.cy + dy * t;

  		var fromTransform = utils_getTransform(from.isSvg, cx, cy, dx, dy, dsxf, dsyf, t) + ' ' + from.transform;
  		var toTransform = utils_getTransform(to.isSvg, cx, cy, -dx, -dy, dsxt, dsyt, 1 - t) + ' ' + to.transform;

  		if (from.isSvg) {
  			from.clone.setAttribute('transform', fromTransform);
  		} else {
  			from.clone.style.transform = from.clone.style.webkitTransform = from.clone.style.msTransform = fromTransform;
  		}

  		if (to.isSvg) {
  			to.clone.setAttribute('transform', toTransform);
  		} else {
  			to.clone.style.transform = to.clone.style.webkitTransform = to.clone.style.msTransform = toTransform;
  		}

  		utils_rAF(tick);
  	}

  	tick();
  };

  var transformers_TimerTransformer = transformers_TimerTransformer__TimerTransformer;

  function applyBorderRadius(node, borderRadius) {
  	node.style.borderTopLeftRadius = borderRadius[0];
  	node.style.borderTopRightRadius = borderRadius[1];
  	node.style.borderBottomRightRadius = borderRadius[2];
  	node.style.borderBottomLeftRadius = borderRadius[3];
  }

  var div = document.createElement('div');

  var keyframesSupported = true;
  var TRANSFORM = undefined;
  var KEYFRAMES = undefined;
  var ANIMATION_DIRECTION = undefined;
  var ANIMATION_DURATION = undefined;
  var ANIMATION_ITERATION_COUNT = undefined;
  var ANIMATION_NAME = undefined;
  var ANIMATION_TIMING_FUNCTION = undefined;
  var ANIMATION_END = undefined;

  // We have to browser-sniff for IE11, because it was apparently written
  // by a barrel of stoned monkeys - http://jsfiddle.net/rich_harris/oquLu2qL/

  // http://stackoverflow.com/questions/17907445/how-to-detect-ie11
  var isIe11 = !window.ActiveXObject && 'ActiveXObject' in window;

  if (!isIe11 && ('transform' in div.style || 'webkitTransform' in div.style) && ('animation' in div.style || 'webkitAnimation' in div.style)) {
  	keyframesSupported = true;

  	TRANSFORM = 'transform' in div.style ? 'transform' : '-webkit-transform';

  	if ('animation' in div.style) {
  		KEYFRAMES = '@keyframes';

  		ANIMATION_DIRECTION = 'animationDirection';
  		ANIMATION_DURATION = 'animationDuration';
  		ANIMATION_ITERATION_COUNT = 'animationIterationCount';
  		ANIMATION_NAME = 'animationName';
  		ANIMATION_TIMING_FUNCTION = 'animationTimingFunction';

  		ANIMATION_END = 'animationend';
  	} else {
  		KEYFRAMES = '@-webkit-keyframes';

  		ANIMATION_DIRECTION = 'webkitAnimationDirection';
  		ANIMATION_DURATION = 'webkitAnimationDuration';
  		ANIMATION_ITERATION_COUNT = 'webkitAnimationIterationCount';
  		ANIMATION_NAME = 'webkitAnimationName';
  		ANIMATION_TIMING_FUNCTION = 'webkitAnimationTimingFunction';

  		ANIMATION_END = 'webkitAnimationEnd';
  	}
  } else {
  	keyframesSupported = false;
  }

  function transformers_KeyframeTransformer___classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function generateId() {
  	return '_' + ~ ~(Math.random() * 1000000);
  }

  function makeAnimatable(node, options, id) {
  	node.style[ANIMATION_DIRECTION] = 'alternate';
  	node.style[ANIMATION_DURATION] = '' + options.duration / 1000 + 's';
  	node.style[ANIMATION_ITERATION_COUNT] = 1;
  	node.style[ANIMATION_NAME] = id;
  	node.style[ANIMATION_TIMING_FUNCTION] = 'linear';
  }

  var transformers_KeyframeTransformer__KeyframeTransformer = function KeyframeTransformer(from, to, container, options) {
  	transformers_KeyframeTransformer___classCallCheck(this, transformers_KeyframeTransformer__KeyframeTransformer);

  	var _getKeyframes = getKeyframes(from, to, options);

  	var fromKeyframes = _getKeyframes.fromKeyframes;
  	var toKeyframes = _getKeyframes.toKeyframes;
  	var containerKeyframes = _getKeyframes.containerKeyframes;

  	var fromId = generateId();
  	var toId = generateId();
  	var containerId = generateId();

  	var css = '\n\t\t\t' + KEYFRAMES + ' ' + fromId + '      { ' + fromKeyframes + ' }\n\t\t\t' + KEYFRAMES + ' ' + toId + '        { ' + toKeyframes + ' }\n\t\t\t' + KEYFRAMES + ' ' + containerId + ' { ' + containerKeyframes + ' }';
  	var dispose = addCss(css);

  	makeAnimatable(from.clone, options, fromId);
  	makeAnimatable(to.clone, options, toId);
  	makeAnimatable(container, options, containerId);

  	var fromDone = undefined;
  	var toDone = undefined;

  	function done() {
  		if (fromDone && toDone) {
  			from.clone.parentNode.removeChild(from.clone);
  			to.clone.parentNode.removeChild(to.clone);

  			// remove containers if possible
  			decrementHtml();
  			decrementHtml();

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

  var transformers_KeyframeTransformer = transformers_KeyframeTransformer__KeyframeTransformer;

  function addCss(css) {
  	var styleElement = document.createElement('style');
  	styleElement.type = 'text/css';

  	var head = document.getElementsByTagName('head')[0];

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
  	var containerKeyframes = [];
  	var i = undefined;

  	function addKeyframes(pc, t) {
  		var cx = from.cx + dx * t;
  		var cy = from.cy + dy * t;

  		var fromBorderRadius = utils_getBorderRadius(from.borderRadius, to.borderRadius, dsxf, dsyf, t);
  		var toBorderRadius = utils_getBorderRadius(to.borderRadius, from.borderRadius, dsxt, dsyt, 1 - t);

  		var fromTransform = utils_getTransform(false, cx, cy, dx, dy, dsxf, dsyf, t) + ' ' + from.transform;
  		var toTransform = utils_getTransform(false, cx, cy, -dx, -dy, dsxt, dsyt, 1 - t) + ' ' + to.transform;

  		var opacities = getOpacity(from, to, t);
  		var backgroundColors = getBackgroundColors(from, to, t);
  		console.log(backgroundColors);

  		fromKeyframes.push('\n\t\t\t' + pc + '% {\n\t\t\t\topacity: ' + opacities[0] + ';\n\t\t\t\t' + (backgroundColors[0] ? 'background-color: ' + backgroundColors[0] : '') + ';\n\t\t\t\tborder-top-left-radius: ' + fromBorderRadius[0] + ';\n\t\t\t\tborder-top-right-radius: ' + fromBorderRadius[1] + ';\n\t\t\t\tborder-bottom-right-radius: ' + fromBorderRadius[2] + ';\n\t\t\t\tborder-bottom-left-radius: ' + fromBorderRadius[3] + ';\n\t\t\t\t' + TRANSFORM + ': ' + fromTransform + ';\n\t\t\t}');

  		toKeyframes.push('\n\t\t\t' + pc + '% {\n\t\t\t\topacity: ' + opacities[1] + ';\n\t\t\t\t' + (backgroundColors[1] ? 'background-color: ' + backgroundColors[1] : '') + ';\n\t\t\t\tborder-top-left-radius: ' + toBorderRadius[0] + ';\n\t\t\t\tborder-top-right-radius: ' + toBorderRadius[1] + ';\n\t\t\t\tborder-bottom-right-radius: ' + toBorderRadius[2] + ';\n\t\t\t\tborder-bottom-left-radius: ' + toBorderRadius[3] + ';\n\t\t\t\t' + TRANSFORM + ': ' + toTransform + ';\n\t\t\t}');
  		// console.log('to:'+toKeyframes);
  	}

  	for (i = 0; i < numFrames; i += 1) {
  		var pc = 100 * (i / numFrames);
  		var t = easing(i / numFrames);

  		addKeyframes(pc, t);
  	}

  	addKeyframes(100, 1);

  	fromKeyframes = fromKeyframes.join('\n');
  	toKeyframes = toKeyframes.join('\n');
  	containerKeyframes = containerKeyframes.join('\n');

  	return { fromKeyframes: fromKeyframes, toKeyframes: toKeyframes, containerKeyframes: containerKeyframes };
  }

  function makeContainer() {
  	var div = document.createElement('div');

  	div.style.position = 'absolute';
  	div.style.left = div.style.top = 0;

  	htmlContainer.appendChild(div);

  	return div;
  }

  var ramjet = {
  	transform: function (fromNode, toNode) {
  		var options = arguments[2] === undefined ? {} : arguments[2];

  		if (typeof options === 'function') {
  			options = { done: options };
  		}

  		if (!('duration' in options)) {
  			options.duration = 400;
  		}

  		var container = makeContainer();
  		var from = wrapNode(fromNode);
  		var to = wrapNode(toNode);

  		from.clone.style.opacity = 1;
  		to.clone.style.opacity = 0;

  		// create top-level containers if necessary
  		(from.isSvg ? incrementSvg : incrementHtml)();
  		(to.isSvg ? incrementSvg : incrementHtml)();

  		// TODO this breaks svg support!
  		container.appendChild(from.clone);
  		container.appendChild(to.clone);

  		if (!keyframesSupported || options.useTimer || from.isSvg || to.isSvg) {
  			return new transformers_TimerTransformer(from, to, container, options);
  		} else {
  			return new transformers_KeyframeTransformer(from, to, container, options);
  		}
  	},

  	hide: function () {
  		for (var _len = arguments.length, nodes = Array(_len), _key = 0; _key < _len; _key++) {
  			nodes[_key] = arguments[_key];
  		}

  		nodes.forEach(hideNode);
  	},

  	show: function () {
  		for (var _len2 = arguments.length, nodes = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
  			nodes[_key2] = arguments[_key2];
  		}

  		nodes.forEach(showNode);
  	},

  	// expose some basic easing functions
  	linear: linear, easeIn: easeIn, easeOut: easeOut, easeInOut: easeInOut
  };

  return ramjet;

}));