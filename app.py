from flask import Flask, render_template, jsonify, redirect
from test.second import second

app = Flask(__name__)
app.register_blueprint(second, url_prefix="/admin")

# @app.route('/home')
@app.route("/")
def hello_world():
    title = "memeGen"
    return render_template("home.html", title=title)



@app.route("/<text>")
def error(text):
    page = text
    return render_template("404.html", page=page)


@app.route("/rick")
def rick():
    return redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ", code=302)


if __name__ == "__main__":
    app.run(debug=True)