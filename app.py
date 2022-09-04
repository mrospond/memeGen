from flask import Flask, render_template, jsonify, redirect, send_from_directory, url_for

from flask_uploads import UploadSet, IMAGES, configure_uploads
from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileRequired, FileAllowed
from wtforms import SubmitField

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



@app.route("/", methods=["GET", "POST"])
def upload_image():
    form = UploadForm()
    if form.validate_on_submit():
        filename = photos.save(form.photo.data)
        file_url = url_for("get_file", filename=filename)
    else:
        file_url = None

    return render_template("index.html", form=form, file_url=file_url)


# @app.route('/home')
# @app.route("/")
# def hello_world():
#     title = "memeGen"
#     return render_template("home.html", title=title)



@app.route("/<text>")
def error(text):
    page = text
    return render_template("404.html", page=page)


@app.route("/rick")
def rick():
    return redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ", code=302)


if __name__ == "__main__":
    app.run(debug=True)