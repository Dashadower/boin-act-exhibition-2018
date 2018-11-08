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

# [START gae_python37_app]
from google.cloud import datastore
from flask import Flask, render_template, request, redirect, render_template_string
import json, logging
from hashlib import sha256

# If `entrypoint` is not defined in app.yaml, App Engine will look for an app
# called `app` in `main.py`.
app = Flask(__name__)

datastore_client = datastore.Client()

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
        alert("이미 해당 아이디가 존재합니다");
        window.location = "../";
        </script>
        </body>
        </html>
        ''')
    else:
        task = datastore.Entity(datastore_client.key("User"))
        task.update({
            "username": username
        })
        datastore_client.put(task)
        return render_template("game.html", username=username)

@app.route("/gameinfo", methods=["get"])
def gameinfo():
    gdata = {
        "game_number": 1,
        "other_player_state": [],
        "game_state": "finished"
    }
    json_obj = json.dumps(gdata)
    return json_obj


if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. This
    # can be configured by adding an `entrypoint` to app.yaml.
    app.run(host='127.0.0.1', port=8080, debug=True)
# [END gae_python37_app]