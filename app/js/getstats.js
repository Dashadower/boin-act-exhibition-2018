// prerequisites: JQuery
var networkHandler = {
    update: function () {
        var _parent = this;
        $.getJSON(
            url="../gameinfo",
            success=function(data, status, xhr){
                _parent.game_number = data.game_number;
                _parent.other_player_state = data.other_player_state;
                _parent.game_state = data.game_state;
                document.getElementById("game_number").innerText = data.game_number;
                console.log("update()", data);
            }
        )
    },
    game_number: 0,
    other_player_state: null,
    game_state : "finished"
};