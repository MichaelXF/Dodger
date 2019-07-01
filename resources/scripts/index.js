/*
    handles dom ready &
    defines `_time` function
*/

(function(scope){


    const showPage = (pageID)=>{
        var pages = $('#game-ui-screens > .game-ui-screen:not(#game-ui-screen-' + pageID +')');
        pages.removeClass('page-animate-in'); // fade out other pages
        setTimeout(function(){
            pages.hide(); // hide them after animation is complete
        },300);

        var page = $('#game-ui-screen-' + pageID); // get page
        page.removeClass('page-animate-in').show(); // show it
        
        setTimeout(function(){
            page.addClass('page-animate-in'); // fade in
        },16.6);
    };


    $(()=>{
        showPage("menu");
        setTimeout(function(){
            gameInterface.nextWave(true);

            $('#game-ui-canvas').removeClass('fade-out');
        },150);
    });


    scope["pageInterface"] = {
        showPage
    };

    const play = function(){
        pageInterface.showPage('play');
        gameInterface.start();

    };
    scope.play = play;

    const _time = function(){
        return performance.now();
    };
    scope._time = _time;

})(window);
