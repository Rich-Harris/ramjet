# ramjet

![ramjet](https://cloud.githubusercontent.com/assets/1162160/7279487/5d668dea-e8ea-11e4-9b0d-a9ba2f1165cc.gif)


## Installation

`npm install ramjet`, or download [ramjet.js](http://www.rich-harris.co.uk/ramjet/ramjet.js).


## Quick start

```html
<div id='a' style='background-color: red; font-size: 4em; padding: 1em;'>a</div>
<div id='b' style='background-color: blue; font-size: 4em; padding: 1em;'>b</div>

<script src='ramjet.js'></script>
<script>
	// to repeat, run this from the console!
	ramjet.transform( a, b );
</script>
```


## Okay, so... what does this do?

Ramjet makes it look like your DOM elements are capable of transforming into one another. It does this by cloning the elements (and all their children), transforming the second element (the one we're transforming *to*) so that it completely overlaps with the first, then animating the two elements together until the first element (the one we're transitioning *from*) has exactly the same position and dimensions as the second element originally did.

It's basically the same technique used in iOS 8 to make it appear as though each app lives inside its icon.

![ios8-effect](https://cloud.githubusercontent.com/assets/1162160/7281378/4f949858-e8f7-11e4-8acf-9a1d90049a92.gif)

In modern browsers, it uses CSS animations, so everything happens off the main thread. The result is **buttery-smooth performance**, even on mobile devices.


## API

### ramjet.transform( a, b[, options] )

* `a` is the DOM node we're transitioning from
* `b` is the DOM node we're transitioning to
* `options` can include the following properties:
    * `done` - a function that gets called once the transition completes
    * `duration` - the length of the transition, in milliseconds (default 400)
    * `easing` - a function used to control the animation. Should take a number between 0 and 1, and return something similar (though it can return a number outside those bounds, if you're doing e.g. an [elastic easing function](http://easings.net/#easeOutElastic)). I highly recommend [eases](https://www.npmjs.com/package/eases) by [Matt DesLauriers](https://github.com/mattdesl), which is a handy collection of these functions
    * `useTimer` - by default, ramjet will use CSS animations. Sometimes (when transitioning to or from SVG elements, or in very old browsers) it will fall back to timer-based animations (i.e. with `requestAnimationFrame` or `setTimeout`). If you want to always use timers, make this option `true` - but I don't recommend it (it's much more juddery on mobile)

### ramjet.hide( ...nodes )

Convenience function that sets the opacity of each node to 0 (temporarily disabling any transition that might otherwise interfere).

### ramjet.show( ...nodes )

Opposite of `ramjet.hide`.

### ramjet.linear, ramjet.easeIn, ramjet.easeOut, ramjet.easeInOut

A handful of easing functions, included for convenience.


## Browser support

Successfully tested in IE9+, Chrome (desktop and Android), Firefox, Safari 6+ and mobile Safari - please raise an issue if your experience differs!


## License

MIT.
