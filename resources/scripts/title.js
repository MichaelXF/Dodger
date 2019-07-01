/*
    displays a title on the screen for 3 seconds
*/

(function(scope){

    const text = function(text){
        return new Promise((resolve, reject) => {

            $('#game-ui-title > h1').text(text);

            $('#game-ui-title').show();
            setTimeout(function(){
                $('#game-ui-title').addClass('game-ui-title-animate-in');
            },16.6);

            setTimeout(function(){
                $('#game-ui-title').addClass('game-ui-title-animate-out');
            },3000);

            setTimeout(function(){
                resolve();
                $('#game-ui-title').hide().removeClass('game-ui-title-animate-in').removeClass('game-ui-title-animate-out');;
            }, 3500);
        });
    };

    scope["titleInterface"] = {
        text
    };

})(window);
