from urllib import request
from flask import Flask, render_template, jsonify, redirect, send_from_directory, url_for

from flask_uploads import UploadSet, IMAGES, configure_uploads
from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileRequired, FileAllowed
from wtforms import SubmitField

import requests
import json

# testowy blueprint
from test.second import second

app = Flask(__name__)
app.register_blueprint(second, url_prefix="/admin")

app.config["SECRET_KEY"] = "asdfghjkl"
app.config["UPLOADED_PHOTOS_DEST"] = "uploads"

photos = UploadSet("photos", IMAGES)
configure_uploads(app, photos)

class UploadForm(FlaskForm):
    photo = FileField(
        validators=[
            FileAllowed(photos, "Only images are allowed"),
            FileRequired("File field should not be empty")
        ]
    )
    submit = SubmitField("Upload")

@app.route("/uploads/<filename>")
def get_file(filename):
    return send_from_directory(app.config["UPLOADED_PHOTOS_DEST"], filename)


# image upload
@app.route("/", methods=["GET", "POST"])
def upload_image():
    form = UploadForm()
    if form.validate_on_submit():
        filename = photos.save(form.photo.data)
        file_url = url_for("get_file", filename=filename)
    else:
        file_url = None

    req = requests.get("https://api.memegen.link/templates/")
    data = json.loads(req.content)

    return render_template("index.html", form=form, file_url=file_url, data=data)

# get templates from api
@app.route("/api", methods=["GET"])
def api():
    req = requests.get("https://api.memegen.link/templates/")
    data = json.loads(req.content)
    # json.data = json.loads(data)
    return render_template("layout.html", data=data)

# testowanie bootstrapa
@app.route("/test")
def test():
    return render_template("test.html")

# error page
@app.route("/<text>")
def error(text):
    page = text
    # return render_template("404.html", page=page)
    return redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ", code=302)


@app.route("/rick")
def rick():
    return redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ", code=302)


if __name__ == "__main__":
    app.run(debug=True)