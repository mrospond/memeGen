# from urllib import request
import base64

from flask import Flask, render_template, redirect, send_from_directory, url_for, request

import requests, json

# test blueprint
# from test.second import second

app = Flask(__name__)
imgFolder = 'memeGen/static/shared/'
# app.register_blueprint(second, url_prefix="/admin")

@app.route("/home")
@app.route("/")
def home():
    # req = requests.get("https://api.memegen.link/templates/")
    # data = json.loads(req.content)

    return render_template("home.html")


# test your templates here
@app.route("/test")
def test():
    return render_template("test.html")


@app.route("/share", methods = ['POST', 'GET'])
def share():
    upload = None
    if request.method == "POST":
        raw = request.get_data()
        index = len('data:image/png;base64,')
        upload = raw[index:len(raw)]
    img_data = base64.b64decode(upload)
    filename = str(hash(upload))
    with open(imgFolder + filename + '.png', 'wb') as f:
        f.write(img_data)

    return json.dumps({'redirect': '/images/' + filename}), 302, {'Content-Type': 'application/json;charset=UTF-8'}


@app.route("/images/<string:image_id>", methods=['GET'])
def images(image_id):
    print(image_id)
    img = image_id + '.png'
    print(img)
    return render_template("image.html", user_image=img)


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
    # return redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ", code=302)

@app.route("/rick")
@app.route("/matura-podlasie")
def rick():
    return redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ", code=302)


if __name__ == "__main__":
    app.run(debug=True)
