var rAF = window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          fn => setTimeout( fn, 16 );

export { rAF };