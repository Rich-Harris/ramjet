/**
 * Given two opacities and Time t it returns two new opacity values such that
 * the opacities can be smoothly transitioned between two values.
 */
function transitionOpacities(fromOpacity, toOpacity, t) {
  const targetOpacity = (toOpacity - fromOpacity) * t + fromOpacity;
  // Based on the blending formula here. (http://en.wikipedia.org/wiki/Alpha_compositing#Alpha_blending)
  // This is a quadratic blending function that makes the top layer and bottom layer blend linearly.
  // However there is an asymptote at target=1 so that needs to be handled with an if else statement.
  if(targetOpacity == 1){
        var newFromOpacity = 1;
        var newToOpacity = t;
  } else{
        var newFromOpacity = targetOpacity - (t * t * targetOpacity);
        var newToOpacity = (targetOpacity - newFromOpacity) / (1 - newFromOpacity);
  }
  return [newFromOpacity, newToOpacity];
}


/**
 * Given two opacities and Time t it returns two new opacity values such that
 * the opacities can be smoothly transitioned between two values.
 */
export function getOpacity (from, to, t){
  return transitionOpacities(from.opacity, to.opacity, t);
}


/**
 * This function takes a pair of nodes and a time, then returns the css values
 * for their background colors to be blended smoothly.
 *
 */
export function getBackgroundColors (from, to, t){
  var opacities;
  if(from.backgroundColor && !isNaN(from.backgroundColor[3]) && to.backgroundColor && !isNaN(to.backgroundColor[3]))
  { //We have rgbas on both nodes to animate between.
    opacities = transitionOpacities(from.backgroundColor[3], to.backgroundColor[3], t);
  } 
  else if(from.backgroundColor && !isNaN(from.backgroundColor[3]))
  { //We have rgba on the from node but either rgb or nothing on the to node
    opacities = transitionOpacities(from.backgroundColor[3], (!!to.backgroundColor ? 1 : 0), t);
  }
  else if(to.backgroundColor && !! !isNaN(to.backgroundColor[3]))
  { //We have rgba on the to node but either rgb or nothing on the from node
    opacities = transitionOpacities((!!from.backgroundColor ? 1 : 0), to.backgroundColor[3], t);
  }
  else
  { //No need to animate.
    return [false, false];
  }

  return [
    (from.backgroundColor ? `rgba(${from.backgroundColor.slice(0,3).join(',')}, ${opacities[0]})`: false),
    (to.backgroundColor ? `rgba(${to.backgroundColor.slice(0,3).join(',')}, ${opacities[1]})` : false),
  ]
}