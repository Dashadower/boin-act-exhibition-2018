// needs jquery and fabric.js
var gameCanvas = {
    _canvas: document.getElementById("gamearea"),
    start: function() {
        this._canvas.style = "border: 1px solid #000000;";
        this._canvas.height = $(document).height() * 0.9;
        this._canvas.width = ($(document).height() * 0.9);

        this._context = this.canvas.getContext("2d");
    },
    canvas: new fabric.Canvas(this._canvas)

};

$(window).on("load",function () {
    //setInterval(function(){updateData("scoreboard");}, 1000);
    var rect = fabric.Rect({
        left: 100,
        top: 100,
        fill: "black",
        width: gameCanvas._canvas.width/4,
        height: gameCanvas._canvas.height/4
    });
    gameCanvas.canvas.add(rect)
});


