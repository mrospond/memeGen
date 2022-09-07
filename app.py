# from urllib import request
from flask import Flask, render_template, redirect, send_from_directory, url_for

import requests, json

# test blueprint
# from test.second import second

app = Flask(__name__)
# app.register_blueprint(second, url_prefix="/admin")

@app.route("/home")
@app.route("/")
def home():
    req = requests.get("https://api.memegen.link/templates/")
    data = json.loads(req.content)

    return render_template("home.html", data=data)


# test your templates here
@app.route("/test")
def test():
    return render_template("test.html")


# error page
@app.route("/<text>")
def error(text):
    page = text
    return render_template("404.html", page=page)
    # return redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ", code=302)

@app.route("/rick")
def rick():
    return redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ", code=302)


if __name__ == "__main__":
    app.run(debug=True)
