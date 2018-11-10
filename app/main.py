# -*- coding: utf-8 -*-
# Copyright 2018 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Documentation
# https://googleapis.github.io/google-cloud-python/latest/datastore/index.html
# https://cloud.google.com/datastore/docs/concepts/entities

# [START gae_python37_app]
from google.cloud import datastore
from flask import Flask, render_template, request, redirect, render_template_string
import json, logging, time
from hashlib import sha256

# If `entrypoint` is not defined in app.yaml, App Engine will look for an app
# called `app` in `main.py`.
app = Flask(__name__)

datastore_client = datastore.Client()

GAME_DURATION = 600
MIN_PLAYERS = 5


@app.route('/')
def index():
    return render_template("index.html")

@app.route("/game", methods=["post", "get"])
def game():
    if not request.values.get("username"):
        return redirect("../")
    username = request.values.get("username")
    logging.info(username)
    query = datastore_client.query(kind="User")
    query.add_filter("username", "=", username.encode())
    query.keys_only()
    results = list(query.fetch())
    if results:
        return render_template_string('''
        <html>
        <body>
        <script type="text/javascript">
        alert("이미 해당 아이디가 현재 회차에 존재합니다");
        window.location = "../";
        </script>
        </body>
        </html>
        ''')
    else:
        task = datastore.Entity(datastore_client.key("User"))
        task.update({
            "username": username,
            "score": 0
        })
        datastore_client.put(task)
        return render_template("game.html", username=username)

@app.route("/gameinfo", methods=["get"])
def gameinfo():
    game_query = datastore_client.query(kind="Game", order=["-starttime"])
    games_result = list(game_query.fetch(limit=2))

    gamedata = {}
    if not games_result or games_result[0]["state"] =="finished": # Need to make a game
        return json.dumps(games_result[0])

    elif games_result and games_result[0]["state"] == "starting":
        player_count = games_result[0]["players"] + 1
        games_result[0]["players"] = player_count
        if player_count >= MIN_PLAYERS:
            games_result[0]["state"] = "progress"
        datastore_client.put(games_result[0])
        gamedata = games_result[0]

    elif games_result and games_result[0]["state"] == "progress":
        if request.values.get("score"):
            find_user = datastore_client.query(kind="User")
            find_user.add_filter("username", "=", request.values.get("username").encode())
            find_user_results = list(find_user.fetch())
            if find_user_results:
                find_user_results[0]["score"] = int(request.values.get("score"))
                datastore_client.put(find_user_results[0])

        gamedata = games_result[0]

    user_scores = []
    if request.values.get("username"):
        found_user = False
    else:
        found_user = True
    query = datastore_client.query(kind="User", order=["-score"])
    user_results = list(query.fetch())
    for user in user_results:
        user_scores.append({"username": user["username"], "score": user["score"]})
        if request.values.get("username"):
            if user["username"] == request.values.get("username").encode():
                found_user = True
    if not found_user:
        new_user = datastore_client.Entity(datastore_client.key("User"))
        new_user.update({
            "username":request.values.get("username"),
            "score":0
        })
        datastore_client.put(new_user)
    gamedata["other_player_state"] = user_scores

    return json.dumps(gamedata)

@app.route("/creategame", methods=["get"])
def create_game():
    game_query = datastore_client.query(kind="Game", order=["-starttime"])
    games_result = list(game_query.fetch(limit=2))
    if not games_result or games_result[0]["state"] not in ["progress", "starting"]:
        task = datastore.Entity(datastore_client.key("Game"))
        dt = games_result[1]["gamenumber"] if len(games_result) >= 2 else 0
        gamedata = {
            "starttime": int(time.time()),
            "endtime": int(time.time() + GAME_DURATION),
            "players": 0,
            "state": "starting",
            "gamenumber": dt + 1
        }
        task.update(gamedata)
        datastore_client.put(task)
        user_query = datastore_client.query(kind="User")
        user_query.keys_only()
        user_result = list([entity.key for entity in user_query.fetch()])
        datastore_client.delete_multi(user_result)
        return "", 200
    elif games_result[0]["state"] == "progress":
        if games_result[0]["endtime"] <= time.time():
            games_result[0]["state"] = "finished"
            datastore_client.put(games_result[0])
    return "", 200

if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. This
    # can be configured by adding an `entrypoint` to app.yaml.
    app.run(host='127.0.0.1', port=8080, debug=True)

# [END gae_python37_app]