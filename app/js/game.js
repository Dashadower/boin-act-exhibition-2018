
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

var networkHandler = {
    fetch: function () {
        $.ajax({
            type: "GET",
            url: "/gameinfo",
            dataType: "json",
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("ERROR", jqXHR.status, errorThrown, jqXHR.responseText)
            },
            success: function(data) {
                return data;
            }
        })
    },
    game_number: 0,
    other_player_state: null,
    update: function(){
        var _parent = this;
        var dta = _parent.fetch(null);
        _parent.game_number = dta.game_number;
        _parent.other_player_state = dta.other_player_state;
        _parent.game_state = dta.game_state;
        document.getElementById("game_number").innerText = dta.game_number;
        console.log("update()", dta);
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

$(document).ready(function () {
    console.log("           _____ _______ \n" +
        "     /\\   / ____|__   __|\n" +
        "    /  \\ | |       | |   \n" +
        "   / /\\ \\| |       | |   \n" +
        "  / ____ \\ |____   | |   \n" +
        " /_/    \\_\\_____|  |_|")
    console.log("Boin High School ACT Programming Group - Kim Shin Young - November 2018");
    console.log("보인고등학고 ACT 프로그래밍 동아리 - 김신영 - 2018년 11월");
    gameCanvas.start();
    console.log("setInterval handle:",setInterval(networkHandler.update, 2000));

});
