import json
from typing import Any, List, Tuple
import numpy as np

from json import load, dump
from os import mkdir, path as pathlib, waitpid
from shutil import rmtree
from glob import glob
from numpy import random
from datetime import datetime as dt

VECTOR_SIZE = 64

class User(object):
    
    name = "name",
    phone = 0,
    email = 'tets@',
    history = [
        {
            "date":"1/1/21",
            "orders":[
                {
                    "name":"Burger",
                    "price":"10$",
                    "count":10
                }
            ]
        }
    ]
    
    def __init__(self,root:str, idx:str, new_user:dict = False) -> None:
        self.__idx = idx 
        self.__root = pathlib.abspath(pathlib.join(root, self.__idx + '.json'))

        if new_user:
            self.__dict__.update(new_user)

        if not pathlib.isfile(self.__root):
            with open(self.__root, "w+") as file:
                dump(self.json(), file)

        with open(self.__root, "r") as file:
            self.__dict__.update(load( file))

    def __iter__(self,):
        for key, val in self.__dict__.items():
            yield key, val

    def json(self,)->dict:
        return { key:val for key, val in self.__dict__.items() if not key.startswith("_User") }

    def save(self,)->dict:
        with open(self.__root, "w+") as file:
            dump(self.json(), file) 

class FaceDB(object):
    users = np.ndarray
    faces = np.ndarray
    def __init__(self, root:str) -> None:
        self.root = root
        self._users = pathlib.join(self.root, "user.npy" )
        self._faces = pathlib.join(self.root, "face.npy" )

        if not pathlib.isfile(self._users):
            np.save(self._faces, np.array( [[ 128 ]*VECTOR_SIZE] ))
            np.save(self._users, np.array([ 'unidentified' ]))

        self.users = np.load(self._users)
        self.faces = np.load(self._faces)

    def __setitem__(self, user:str, face:np.ndarray):
        if user not in self.users:
            self.users = np.concatenate((np.array([user]), self.users), axis=0)
            self.faces = np.concatenate((face, self.faces), axis=0)
            self.save()

    def __getitem__(self, embedding:np.ndarray)->Tuple[ str, int ]:
        scores = np.sqrt(np.square(self.faces - embedding).mean(axis=-1))
        score = 1 - scores.min()
        idx = scores.argmin()
        idx = self.users[idx]
        return idx, score

    def __repr__(self,):
        return f"""FaceDB(\n face_count = {len(self.users)}\n emb_count = {len(self.faces)} \n)"""

    def save(self,):
        np.save(self._faces, self.faces )
        np.save(self._users, self.users )


class Databse(object):
    def __init__(self, root:str = './') -> None:
        
        self.root = pathlib.abspath(root)
        self.users = pathlib.join(self.root, 'users')
        self.order_id = pathlib.join( self.root, "orders.id" )

        if not pathlib.isdir(self.root):
            mkdir(self.root)
            mkdir(self.users)
            with open( self.order_id , "w+" ) as file:
                file.write("0")

        self.facedb = FaceDB(self.root)

    def __add__(self, user:dict)->User:
        idx,*_ = user['email'].split("@")
        embedding = user.pop("embedding")

        user = User(self.users, idx, user)
        self.facedb[idx] = embedding
        return user

    def __getitem__(self,idx:str)->User:
        return User(self.users, idx)

    @property
    def new_order_id(self,):
        with open(self.order_id, "r") as file:
            order_id = int(file.read())

        with open(self.order_id, "w+") as file:
            file.write(str(order_id + 1))
        
        return order_id

    def validate(self, embedding:np.ndarray):
        idx, score = self.facedb[embedding]
        if idx == 'unidentified' or score < 0.8 or score > 1:
            return False, score
        return self[idx].json(), score

    def update_order_history(self,user:dict, cart:dict)->int:
        cart = list(cart.values())
        if len(cart):
            idx,*_ = user['email'].split("@")
            date = dt.now().strftime("%d/%m/%y")
            order_id = self.new_order_id
            user:User = self[idx]
            user.history.append({
                "date":date,
                "id":order_id,
                "orders":cart
            })
            user.save()
            return order_id
        return "None"

def new_user( 
    name:str, 
    phone:str, 
    email:str, 
    embedding:np.ndarray,
    history:list=[]):
    return {
        "name":name,
        "phone":phone,
        "email":email,
        "embedding":embedding,
        "history":history,
    }

def new_user_random():
    return {
        "name":"".join( np.random.randint(0, 64, 6).astype(str) ),
        "phone":"".join( np.random.randint(0, 64, 10).astype(str) ),
        "email":"".join( np.random.randint(0, 64, 6).astype(str) ) + "@gmail.com",
        "embedding":np.random.uniform(0,1,(1,64)),
        "history":[
            {
                "date":f"{np.random.randint(1, 31)}/{np.random.randint(1, 13)}/21",
                "id":"".join( np.random.randint(0, 64, 6).astype(str)),
                "orders":[
                    {
                        "name":np.random.choice([ "Burger", "Burger M", "Burger  L" ]),
                        "price":"10",
                        "count":np.random.randint(3, 12),
                    }
                    for _ in range(np.random.randint(3, 12))
                ]
            }
            for _ in range(np.random.randint(3, 12))
        ],
    }