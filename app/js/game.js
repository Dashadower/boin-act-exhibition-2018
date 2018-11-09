// needs jquery and fabric.js
var gameCanvas = {
    canvas: document.getElementById("gamearea"),
    start: function() {
        this.canvas.style = "border: 1px solid #000000;";
        this.canvas.width = $(document).width();
        this.canvas.height = $(document).height() * 0.8;
        this.context = this.canvas.getContext("2d");
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
};




function player_model(x, y) {
    this.xpos = x;
    this.ypos = y;

    ctx = gameCanvas.context;
    ctx.fillStyle = "red";
    ctx.arc(x,y,10, 0,Math.PI*2);
    ctx.fill();

}


