// prerequisites: JQuery
var networkHandler = {
    update: function (_username, _score) {
        var _parent = this;
        if(_username==undefined){
            $.getJSON(
                url="../gameinfo",
                success=function(data, status, xhr){
                    if(data.state == "starting"){
                        _parent.game_state = data.state
                    }
                    else {
                        _parent.gamenumber = data.gamenumber;
                        _parent.other_player_state = data.other_player_state;
                        _parent.state = data.state;
                        _parent.starttime = data.starttime;
                        _parent.endtime = data.endtime;
                        //document.getElementById("game_number").innerText = data.game_number;
                        console.log("update()", data);
                    }
                }
            ).always(
                function () {
                    setTimeout(networkHandler.update, 2000);
                }
            )
        }
        else{
            $.getJSON(
                url="../gameinfo",
                {username: _username, score: _score},
                success=function(data, status, xhr){
                    if(data.state == "starting"){
                        _parent.game_state = data.state
                    }
                    else {
                        _parent.gamenumber = data.gamenumber;
                        _parent.other_player_state = data.other_player_state;
                        _parent.state = data.state;
                        _parent.starttime = data.starttime;
                        _parent.endtime = data.endtime;
                        //document.getElementById("game_number").innerText = data.game_number;
                        console.log("update()", data);
                    }
                }
            ).always(
                function () {
                    setTimeout(networkHandler.update, 2000);
                }
            )
        }
    },
    gamenumber: 0,
    other_player_state: null,
    state : "starting",
    starttime: 0,
    endtime: 0
};

$(document).ready(function () {
    console.log("           _____ _______ \n" +
        "     /\\   / ____|__   __|\n" +
        "    /  \\ | |       | |   \n" +
        "   / /\\ \\| |       | |   \n" +
        "  / ____ \\ |____   | |   \n" +
        " /_/    \\_\\_____|  |_|")
    console.log("Boin High School ACT Programming Group - Kim Shin Young - November 2018");
    console.log("보인고등학고 ACT 프로그래밍 동아리 - 김신영 - 2018년 11월");
    //console.log("setInterval handle:",setInterval(networkHandler.update, 2000));
    networkHandler.update();
});