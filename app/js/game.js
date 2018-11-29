// needs jquery and fabric.js
var gameCanvas = {
    _canvas: document.getElementById("gamearea"),
    //canvas: new fabric.Canvas("gamearea"),
    ctx: undefined,
    gamewidth: 0,
    gameheight: 0,
    score: 0,
    tiles: [], // array of numbers for tiles, from 0 to 3
    current_tick: 0, // tick, in rendering, coordinate for bottom of rect
    tile_width: 0,
    tile_height: 0,
    pps: this.default_pps, // portion of screen moving per second; max tested pps before rendering screws up is about 7.x
    pps_increment_per_second: 0.02,
    default_pps: 0.5,
    fps: 30,
    touch_bounds: [],
    setInterval_handle: undefined,
    default_bomb_frequency: 50,
    current_bomb_frequency: this.default_bomb_frequency,

    resize: function(){

        var gamewidth = $(window).width() * 0.85;
        var gameheight = (gamewidth*5)/3;
        this._canvas.width = gamewidth;
        this._canvas.height = gameheight;
        this._canvas.style.width = gamewidth;
        this._canvas.style.height = gameheight;
        this.gamewidth = gamewidth;
        this.gameheight = gameheight;
        //console.log(gamewidth, gameheight);
    },
    draw_Base: function () {
        this.ctx.strokeStyle = "#000000";
        this.ctx.lineWidth = 1;
        for(var i = 1; i <= 3; i++ ){
            //console.log([(this.gamewidth/4)*i, 0, (this.gamewidth/4)*i+1, this.gameheight]);

            this.ctx.beginPath();
            this.ctx.moveTo(this.gamewidth/4*i, 0);
            this.ctx.lineTo(this.gamewidth/4*i, this.gameheight);
            this.ctx.stroke();
        }
    },
    get_context: function () {
        this.ctx = this._canvas.getContext("2d");
    },
    clear: function () {
        this.ctx.clearRect(0, 0, this.gamewidth, this.gameheight);
    },
    initiate_game: function () {
        var self = this;
        this.get_context();
        this.clear();
        this.score = 0;
        this.current_tick = 0;
        this.pps = this.default_pps;
        this.tile_width = this.gamewidth/4;
        this.tile_height = this.gameheight/4;
        this.tiles = [];
        this.current_bomb_frequency = this.default_bomb_frequency;
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = "black";
        this.ctx.font = "30px Arial";
        //console.log("tickrate", this.tickrate);
        for(var i = 0; i <= 5; i++){
            this.tiles.push(rng());
        }
        //this._canvas.addEventListener("touchstart", function(e){self.onTouch(e)}, false);
        this.create_ready_screen();
        $("#gamearea").on("touchstart", function(e){self.onTouch(e);});
    },
    create_ready_screen: function(){
        this.clear();
        this.ctx.fillText("터치하여 게임 시작", this.gamewidth/2, this.gameheight*0.2);
    },
    onTouch: function(event){
        event.preventDefault();
        var touch = event.changedTouches;
        var rect = this._canvas.getBoundingClientRect();
        var x = touch[0].clientX - rect.left;
        var y = touch[0].clientY - rect.top;
        //console.log(this.tiles);
        if (x >= this.touch_bounds[0] &&
            x <= this.touch_bounds[1] &&
            y >= this.touch_bounds[2] &&
            y <= this.touch_bounds[3]) {

            this.score = this.score + 1;

            if (this.tiles[0] > 3){
                this.tiles.shift();
                this.current_tick = this.current_tick - this.tile_height;
                this.current_bomb_frequency = this.default_bomb_frequency;
            }
            else{
                this.current_bomb_frequency = this.current_bomb_frequency - 1;
            }
            this.tiles.shift();
            if (this.current_bomb_frequency === 1 && networkHandler.mode === "bomb"){
                this.tiles.push(bomb_rng());
                this.current_bomb_frequency = 0;
            }
            else{
                this.tiles.push(rng())
            }

            if(this.current_bomb_frequency < 0){ //make it fail proof
                this.current_bomb_frequency = this.default_bomb_frequency;
            }

            this.current_tick = this.current_tick - this.tile_height;


            submitting_score = this.score;
            submitting_username = username;
        }
        else {
            // Game over, touched wrong
            this.onGameOver();
        }

    },
    onGameOver: function(){
        this.unbind_and_clear();
        fetchStats(submitting_username, submitting_score);
        submitting_username = undefined;
        submitting_score = undefined;

        this.ctx.fillStyle = "red";
        this.ctx.fillText("게임 오버", this.gamewidth/2, this.gameheight*0.2 - 40);
        //this.ctx.fillText(this.score.toString(), this.gamewidth/2, this.gameheight*0.2);
        this.ctx.fillText("게임 오버", this.gamewidth/2, this.gameheight*0.2 - 40);
        //setTimeout(function(){$("#tab_info_button").click();}, 3000);
    },
    set_interval: function(){
        var self = this;
        var hwnd = setInterval(function(){self.tick();}, 1000/this.fps);
        this.setInterval_handle = hwnd;
    },
    unbind_and_clear: function(){
        this.unbind();
        clearInterval(this.setInterval_handle);
    },
    unbind: function(){
        $("#gamearea").off();
    },
    tick: function () {
        this.clear();
        this.draw_Base();
        if(this.current_tick <= 0){
            this.current_tick = this.current_tick + 1;

            return 0;
        }
        //console.log("tick",this.current_tick);
        //console.log("tiles", this.tiles);

        if(this.current_tick > this.gameheight + this.tile_height){
            this.tiles.shift();
            this.tiles.push(rng());
            this.current_tick = this.current_tick - this.tile_height;
            //should be game over here
            this.onGameOver();
        }
        this.ctx.fillStyle = "black";
        var draw_y = this.current_tick;
        var arr_index = 0;
        while(1){
            if(draw_y <= -this.tile_height){
                break;
            }
            if(this.tiles[arr_index] > 3){
                this.ctx.fillStyle = "red"
            }
            else{
                this.ctx.fillStyle = "black";
            }
            if(this.tiles[arr_index] > 3){
                this.ctx.fillRect((this.tiles[arr_index]-4)*this.tile_width, draw_y-this.tile_height, this.tile_width, this.tile_height);
            }
            else {
                this.ctx.fillRect(this.tiles[arr_index] * this.tile_width, draw_y - this.tile_height, this.tile_width, this.tile_height);
            }
            if(arr_index === 0 && this.tiles[arr_index] <= 3){
                this.touch_bounds = [this.tiles[arr_index]*this.tile_width, (this.tiles[arr_index]+1)*this.tile_width, draw_y-this.tile_height, draw_y]
            }
            else if(arr_index === 1) {
                if (this.tiles[0] > 3) {
                    this.touch_bounds = [this.tiles[arr_index] * this.tile_width, (this.tiles[arr_index] + 1) * this.tile_width, draw_y - this.tile_height, draw_y]
                }
            }
            //this.ctx.fillText("tb", (this.touch_bounds[0]+this.touch_bounds[1])/2,(this.touch_bounds[2]+this.touch_bounds[3])/2); // for debugging, plz remove
            draw_y = draw_y - this.tile_height;
            arr_index = arr_index + 1;
        }
        this.current_tick = this.current_tick + this.gameheight* (this.pps/this.fps);
        this.pps = this.pps + this.pps_increment_per_second/this.fps;
        this.ctx.fillStyle = "red";
        this.ctx.fillText(this.score.toString(), this.gamewidth/2, this.gameheight*0.2);
        if(networkHandler.state !== "progress"){
            this.ctx.fillText("! 점수 반영 안됨 !", this.gamewidth/2, this.gameheight*0.1)
        }
        return 0;
    }
};

function rng(){
    return Math.floor((Math.random() * 4));
}
function bomb_rng(){
       return Math.floor(Math.random() * (4) + 4);
}
$(window).on("load",function () {
    gameCanvas.resize();
    //setInterval(function(){updateData("scoreboard");}, 1000);

});


