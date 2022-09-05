import json
import urllib.request

import requests
from flask import Flask, render_template, jsonify

app = Flask(__name__)

@app.route('/')
# def hello_world():
#     title = 'memeGen'
#     return render_template('index.html', title=title)
def get_memes():
    url = "https://api.memegen.link/templates"

    response = requests.get(url)
    data = response.json()
    #meme_urls = memes
    memes = []

    for meme in data:
        meme = {
            "name": meme["name"],
            "blank": meme["blank"],
        }

        memes.append(meme)

    return render_template("index.html", memes=memes)
    #print(memes)
    #meme_urls = [{meme["blank"], meme["name"]} for meme in memes]
    #return render_template("index.html", memes=meme_urls)

@app.route('/meme/<url>')
def return_meme(url):
    return url

@app.route('/data')
def data():
    my_data = {
        'title': "Chris",
        'names': ['one', 'two', 'three']
    }

    return jsonify(my_data)


@app.route("/memes")
def get_movies_list():
    url = "https://api.memegen.link/templates"

    response = requests.get(url)
    movies = response.json()
    dict = json.loads(movies)

    movies = []

    for movie in dict["results"]:
        movie = {
            "title": movie["title"],
            "overview": movie["overview"],
        }

        movies.append(movie)

    return {"results": movies}