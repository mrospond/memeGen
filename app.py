# from urllib import request
from flask import Flask, render_template, redirect
# from flask import send_from_directory, url_for

# import requests, json

# test blueprint
# from test.second import second

app = Flask(__name__)
# app.register_blueprint(second, url_prefix="/admin")

@app.route("/home")
@app.route("/")
def home():
    # req = requests.get("https://api.memegen.link/templates/")
    # data = json.loads(req.content)

    return render_template("home.html")

@app.route("/create-meme", methods = ['POST', 'GET'])
def create_meme():
    return render_template("create-meme.html")

@app.route("/snake")
def snake():
    return render_template("snake.html")

@app.route("/about")
def about():
    return render_template("about.html")

# error page
@app.route("/<text>")
def error(text):
    page = text
    return render_template("404.html", page=page)

@app.route("/rick")
@app.route("/matura-podlasie")
def rick():
    return redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ", code=302)


if __name__ == "__main__":
    app.run(debug=True)
