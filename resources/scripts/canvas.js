/*
    get the canvas from the dom
    and makes sure its also 100% 100% of the screen resolution

*/
(function(scope){
    

    var canvas, ctx;
    var viewport;

    var _resizeCallback = ()=>{}; // nop

    // resize to 100%, 100%
    const resize = ()=>{
        viewport = [ $(window).width(), $(window).height() ];

        canvas.width = viewport[0];
        canvas.height  =viewport[1];

        canvas.style.width = viewport[0]+"px";
        canvas.style.height = viewport[1]+"px";

        _resizeCallback(viewport);
    };
    $(()=>{

        canvas = document.getElementById('game-ui-canvas'); // dom
        ctx = canvas.getContext('2d');

        resize();
        $(window).on('resize',resize); // attach resize event

    });

    const get = function(){ // getter function
        setTimeout(function(){
            resize();
        },100);
        return {
            canvas,
            ctx,
            viewport
        };
    };

    const onResize = function(cb){
        _resizeCallback = cb;
    };

    scope["canvasInterface"] = {
        get,
        resize,
        onResize
    };

})(window);
