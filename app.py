from flask import Flask, render_template, jsonify

app = Flask(__name__)

@app.route('/')
def hello_world():
    title = 'memeGen'
    return render_template('index.html', title=title)

@app.route('/data')
def data():
    my_data = {
        'title': "Chris",
        'names': ['one', 'two', 'three']
    }

    return jsonify(my_data)