/*
    contains all the game logic & rendering

    `gameInterface`
*/

const rand = function(min,max){
    return Math.floor(Math.random() * (max-min) + min);
};

(function(scope){

    const isCollision = function(rect1,rect2){
        return rect1.x < rect2.x + rect2.w && rect1.x + rect1.w > rect2.x && rect1.y < rect2.y + rect2.h && rect1.y + rect1.h > rect2.y;   
    };


    var entities = [];
    var player = {
        x: 50,
        y: 50,
        w: 40,
        h: 40,
        hasInit: false,
        isDead: true // reset at function `start`
    };
    window.player = player;

    var canvas, ctx, viewport = [0,0]; // dom stuff

    var keyboard = { // keyboard for moving the player
        left: false,
        right: false,
        boost: false,
        up: false
    };

    var boostAmount = 0; // nitro
    var shouldBoostRegenerate = true;

    var wave = 0; // wave vars
    var doNextWaveTick = false;

    const maxBoost = 10;
    var gravity = 1;

    function nextWave(forDisplay){
        wave++;
        entities = []; // reset entities
        
        $('#game-ui-wave-number').text('Wave #' + wave);
        const next = function(){

            var mega = viewport[0] * viewport[1];
            var entityCount = ((wave * wave)/5 + Math.random() * 15 * Math.min(wave,15) + 35)/700000 * mega;
            gravity = 2.9 * ( 1+ wave/30) * viewport[1] / 25;

            // set gravity and entityCount based on the wave number and Math.random() and screen res

            const y = function(){
                return forDisplay ? rand(0,viewport[1]) : rand(-2, -viewport[1] * 2 * wave) - (wave * wave);
            };

            // create entities
            for ( var i=0; i < entityCount; i++) {
                entities.push({
                    x: rand(-5,viewport[0]+5),
                    y: y(),
                    w: 40,
                    h: 40,
                    velocity: 1 + (Math.random() * Math.min(wave/4,4))/(Math.random() + 1),
                    tick: Math.random() * 2,
                    color: Math.random() > 0.5 ? "#ff1e1e" : "#7b8487",
                    type:"block"
                });
            }
            doNextWaveTick = !forDisplay;

            // make rare gems
            var gemsCount = wave * Math.random();
            for ( var i=0; i < gemsCount; i++ ) {
                entities.push({
                    x: rand(40, viewport[0]-40),
                    y: y(),
                    w: 30,
                    h: 30,
                    velocity: 0.6,
                    color: "#2bcc63",
                    type:"gem"
                });
            }
        };

        if ( forDisplay ) {
            next();
        } else {
            titleInterface.text("Wave #" + wave).then(next); // display text on the users screen
        }
    };

    $(()=>{
        var get = scope["canvasInterface"].get();
        canvas = get.canvas;
        ctx = get.ctx;
        viewport = get.viewport;

        scope["canvasInterface"].onResize(newViewport=>{
            viewport = newViewport;
            player.y = viewport[1] - 180;

            console.log("resize",...viewport);
            if ( !player.hasInit ) {
                
                player.x = viewport[0]/2 - player.w/2; // update x cord when not playing
            }
        });
    
        function update(){

            // calculate time delta
            var now = _time();
            var delta = (now-last)/1000;
            last = now;

            // boost regeneration
            if ( shouldBoostRegenerate ) {
                boostAmount += delta/2.5 + (wave/10 * delta);
                if ( boostAmount > maxBoost ) {
                    boostAmount = maxBoost; // cap boost to 10
                }
            }

            // entity logic
            // gravity & collision detection

            var isBoosting =keyboard.boost && boostAmount > 0;
            if  (isBoosting ) {
                delta /= 1.75;
            }

            if ( player.isDead ) {
                delta /= 10;
            }

            var gravityMultiplier = 1;
            if ( keyboard.up ) {
                gravityMultiplier = 1.25;
            }

            var entitiesAlive = 0; // count how many entities are "alive"
            entities.forEach(entity=>{

                if ( !entity.skip ) {
                    entity.y += delta * gravity * entity.velocity * gravityMultiplier;
                    entity.velocity += delta/10;

                    entity.tick += delta;
                    if ( entity.tick > 2 ) {
                        entity.tick = 0;
                    }

                    entity.alpha = entity.tick;
                    if ( entity.alpha > 1 ) {
                        entity.alpha = 2 - entity.alpha;
                    }

                    entity.alpha = Math.min(entity.alpha * 1.5, 1);

                    if ( entity.y < player.y ) {
                        entitiesAlive++;
                    }

                    // hit detection
                    if ( isCollision(entity, player) ) {
                        switch(entity.type){
                            case "gem":
                                boostAmount = 10;
                                entity.skip = true;
                            break;
                            default:

                                if ( !player.isDead ) {
                                    setTimeout(function(){
                                        pageInterface.showPage('menu');
                                    },600);
                                }

                                player.isDead = true;
                                entity.velocity = 0;
                                entity.alpha = 1;
                                doNextWaveTick = false;
                            break;
                        }
                    }
                }
            });

            // update the wave
            if (entitiesAlive < 1 && doNextWaveTick ) {
                doNextWaveTick = false;
                setTimeout(function(){
                    nextWave();
                },16.6);
            }

            // player logic
            if ( isBoosting ) { // boost logic
                speed *= 1.75; // boost 1.75 mut
                boostAmount -= delta * 5;
            } else {

                shouldBoostRegenerate = true;
            }
            
            var speed = delta * 0.25 * viewport[0]; // normal speed

            if ( !player.isDead ) {
                // move left
                if ( keyboard.left && !keyboard.right ) {
                    player.x -= speed;
                }

                // move right
                if ( keyboard.right && !keyboard.left ) {
                    player.x += speed;
                }
            }

            // clear canvas
            ctx.clearRect(0,0,...viewport);

            // render entities
            entities.forEach(k=>{

                if ( !k.skip ) {
                    ctx.fillStyle = k.color;
                    ctx.globalAlpha = k.alpha;
                    ctx.fillRect(k.x, k.y, k.w, k.h);
                }
            });

            ctx.globalAlpha = 1;

            // render player
            if ( player.hasInit ) {
                ctx.fillStyle = "#fff";
                ctx.fillRect(player.x, player.y, player.w, player.h);
            }


            // request for next frame
            requestAnimationFrame(update);

            // dom
            var percent = (boostAmount / maxBoost) * 100;
            if ( percent > 100 ) { percent = 100;}
            $('#game-ui-nitro-bar').css('height', percent + "%" );


            percent = (entitiesAlive / entities.length) * 100;
            if ( percent > 100 ) { percent = 100;}
            $('#game-ui-wave-bar').css('width', (percent) + "%" );
        };

        var last = _time();
        update();

        const keyEvent = function(type, event) {
            var value = type == "down";

            var keyCode = event.which || event.keycode || event.keyCode;
            
            // move left
            if ( keyCode == 65 || keyCode == 37 ) {
                keyboard.left = value;
            }

            // move right
            if ( keyCode == 68 || keyCode == 39 ) {
                keyboard.right = value;
            }

            // move up
            if ( keyCode == 87 || keyCode == 38) {
                keyboard.up = value;
            }

            // boost
            if ( keyCode == 16 || keyCode == 32 || keyCode == 13 ) {
                keyboard.boost = value;
            }
        };

        // dom events
        $(window).on('keydown', function(e){
            keyEvent("down", e);
        }); 
        $(window).on('keyup', function(e){
            keyEvent("up", e);
        }); 
    });

    // start the game
    const start = function(){
        wave = 0;
        boostAmount = 0;
        nextWave();

        player.isDead = false;
        player.x = viewport[0]/2 - player.w/2;
        player.hasInit = true;
    };


    scope["gameInterface"] = {
        start,
        nextWave
    };




})(window);
