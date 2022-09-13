# memeGem

## Getting started

+ memeGenerator project for wwwjs course on AGH-UST


## Running the application (wsl-ubuntu)

1. `git clone https://github.com/mrospond/memeGen.git`

1. run `. run.sh`

2. or alternatively:

```
sudo apt install -y python3-venv
python3 -m venv /path/to/venv
source /path/to/venv/activate

pip3 install -r requirements.txt

export FLASK_APP=app.py
export FLASK_DEBUG=1

python3 -m flask run (OR flask run)
```
3. open http://127.0.0.1:5000

4. to install new modules use \
`pip3 install <newModule>` \
then to save the installed dependencies run (make sure you're using a virtual environment)\
`pip3 freeze > requirements.txt`

## Running the application (Docker)

1. build a docker image: `docker build -t memegem .`

2. run the container: `docker run -d -p 5000:5000 --name memegem-container memegem`

3. enable auto restart: `docker update --restart on-failure memegem-container`
