const rAF = window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            ( fn => setTimeout( fn, 16 ) );

export default rAF;