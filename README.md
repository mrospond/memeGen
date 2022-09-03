# memeGen

## Getting started

+ memeGenerator project for wwwjs course on AGH-UST

<br/>

## Running the application (wsl)

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
`pip3 install <new module>` \
then to save the installed dependencies run (make sure you're using a virtual environment)\
`pip3 freeze > requirements.txt`