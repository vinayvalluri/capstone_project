import cv2
import base64
from flask.helpers import send_file

import numpy as np
import tensorflow as tf

from flask import Flask, request, render_template
from flask_cors import CORS
from numpy.core.fromnumeric import size

from db import Databse, new_user

app = Flask(__name__, template_folder='./templates')
db = Databse(root='./data/userdb')
haar = cv2.CascadeClassifier()

model = tf.keras.models.load_model("./notebooks/model/")
haar.load("./data/haarcascade_frontalface_default.xml")

CORS(app)

def get_face ( image:np.ndarray, pad:int=15 )->np.ndarray:
    (x,y,w,h), *_ = haar.detectMultiScale(image)
    roi =  image[y:y+h, x:x+w].copy()
    roi = cv2.resize(roi,(128, 128), interpolation= cv2.INTER_AREA)
    return roi

def decode_image(string:str)->np.ndarray:
    image = string.replace("data:image/png;base64,","")
    image = np.fromstring(base64.b64decode(image,), np.uint8)
    image = cv2.imdecode(image, cv2.IMREAD_ANYCOLOR)
    return image

def encode_image(image:np.ndarray)->str:
    _, string = cv2.imencode('.png',image,)
    string = base64.b64encode(string)
    string = "data:image/png;base64," + string.decode()
    return string

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/static/<string:_type>/<string:_file>")
def serve_static(_type, _file):
    return send_file(f"templates\\static\\{_type}\\{_file}")

@app.route("/validate", methods=['GET', 'POST'])
def detect():
    data = request.get_json()
    image = data['image']
    image = decode_image(image,)
    roi = get_face(image,)

    embedding = model.predict(roi.reshape(1,128,128,3)) 
    user, score = db.validate(embedding)
    roi_string = encode_image(roi)
    print ('Score : ', score)
    return {
        'roi':roi_string,
        'user':user
    }

@app.route("/order", methods=['GET', 'POST'])
def order():
    data = request.get_json()
    order_id = db.update_order_history( **data )
    return {
        'id':order_id,
    }

@app.route("/newuser", methods=['GET','POST'])
def newuser():
    data = request.get_json()
    
    user = data['user']
    image = data['photo']
    image = decode_image(image)
    embedding = model.predict(image.reshape(1,128,128,3))

    user.update({
        "embedding":embedding
    })
    user = db + new_user(**user)
    return {
        "user":user.json()
    }

if __name__ == '__main__':
    app.run(
        host='localhost',
        port=8080,
        # debug=True
    )