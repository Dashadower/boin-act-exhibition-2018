// needs jquery and fabric.js
var gameCanvas = {
    _canvas: document.getElementById("gamearea"),
    canvas: new fabric.Canvas("gamearea"),
    gamewidth: 0,
    gameheight: 0,
    resize: function(){

        var gamewidth = $(window).width() * 0.9;
        var gameheight = (gamewidth*5)/3;
        this._canvas.width = gamewidth;
        this._canvas.height = gameheight;
        this._canvas.style.width = gamewidth;
        this._canvas.style.height =gameheight;
        this.gamewidth = gamewidth;
        this.gameheight = gameheight;
        console.log(gamewidth, gameheight);
    },
    drawBase: function () {
        for(var i = 1; i <= 3; i++ ){
            console.log([(this.gamewidth/4)*i, 0, (this.gamewidth/4)*i+1, this.gameheight]);
            this.canvas.add(new fabric.Line([(this.gamewidth/4)*i, 0, (this.gamewidth/4)*i+1, this.gameheight], {
                stroke: "black",
                strokeWidth: 1
            }));
        }
    }
};

$(window).on("load",function () {
    gameCanvas.resize();
    setInterval(function(){updateData("scoreboard");}, 1000);
    var rect = new fabric.Rect({
        left: 100,
        top: 100,
        fill: "black",
        width: gameCanvas._canvas.width/4,
        height: gameCanvas._canvas.height/4
    });

    //gameCanvas.canvas.add(rect);
});


