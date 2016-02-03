# changelog

## 0.6.0

* Use `cssText` instead of property enumeration when cloning computed styles, for better initial performance
* Disable `background-color` and `border-radius` interpolation by default, for faster transitions. `interpolateBorderRadius` and `interpolateBackgroundColor` options enable these transformations
* Total opacity is preserved ([#10](https://github.com/Rich-Harris/ramjet/issues/10))
* Starting opacities are respected ([#11](https://github.com/Rich-Harris/ramjet/issues/11))
* Handle pre-existing transforms
* Decompose matrices for natural-looking transforms

## 0.5.0

* Change `jsnext:main` build to point to Babelified bundle with ES6 export ([#45](https://github.com/Rich-Harris/ramjet/pull/45))

## 0.4.7

* fixed "position: fixed" issues [sithmel]
* added easingScale options [sithmel]
* fixed exceptions fired by IE8 [sithmel]
* added appendToBody, overrideClone options [sithmel]
* added spm support [afc163]

## 0.4.6

* Extend border-radius morphing to timer-based transformations

## 0.4.5

* Morph border-radius ([#25](https://github.com/Rich-Harris/ramjet/issues/25))
* Internal: add rudimentary [test suite](http://www.rich-harris.co.uk/ramjet/test.html)

## 0.4.4

* Add IE9 support ([#3](https://github.com/Rich-Harris/ramjet/issues/3)). Thanks crohrer!

## 0.4.3

* Fix Firefox SVG bug

## 0.4.2

* Account for offsetParent margin

## 0.4.1

* Tidy up npm package

## 0.4.0

* Renamed! mogrify is now ramjet
* Using `position: absolute` instead of fixed, so scrolling doesn't mess things up
* Added a default duration
* Added a demo page

## 0.3.2

* Use camel-cased style properties (`animationName` instead of `animation-name`), for the benefit of older Firefox

## 0.3.1

* Add `mogrify.show()` and `mogrify.hide()` convenience methods

## 0.3.0

* If possible, and `options.useTimer` is not used, mogrify will use precomputed CSS keyframes to move the work off the main thread. This results in a vastly smoother experience on mobile (and desktop in some cases), at the cost of a slight loss in visual fidelity (which is barely noticeable for animations less than ~500ms)

## 0.2.0

* Rewrote as ES6 modules
* Started maintaining a changelog
