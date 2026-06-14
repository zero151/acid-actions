from fastapi import FastAPI
import json
import random
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rand = []
name_file_load = "action.json"
try:
    with open(name_file_load, "r") as file:
        rand = json.load(file)
except FileNotFoundError:
    print("File not found, starting with empty list")
except:
    print("error, starting with empty list")

def save_file():
    with open(name_file_load, "w") as file:
        json.dump(rand,file)



@app.get("/random", summary="выбор одного и больше рандомных действий с повторениями или без")
def get_random_action(count : int = 1, unique: bool = False):
    print(unique)
    if not rand:
        return {"message": "no action"}
    if count < 1:
        return {"error": "count must be > 0"}
    if unique:
        if count > len(rand):
            return {"error": "count must not be greater that actions count"}
        temp = rand.copy()
        result = []
        for _ in range(count):
            choice = random.choice(temp)
            result.append(choice)
            temp.remove(choice)
        return {"message": result}
    else:
        result = [random.choice(rand) for _ in range(count)]
        return {"message": result}
    

@app.post("/add/{text}")
def add_action(text: str):
    text = text.strip()
    if not text:
        return {"error": "write the action"}
    if text in rand:
        return {"error": "there is already such an action"}
    rand.append(text)
    save_file()
    return {"added": text}

@app.get("/all")
def get_all():
    if not rand:
        return {"message": "no action"}
    all_action = {}
    for i in range(len(rand)):
        all_action[i+1] = rand[i]
    return {"total": len(rand), "actions" : all_action}

@app.delete("/del/all", summary = "удаление всего списка")
def delete_all():
    deleted = rand.clear()
    save_file()
    return {"message": deleted}

@app.delete("/del/{index}", summary = "index начинается с 1")
def delete_action(index: int):
    if not rand:
        return {"message": "no action"}
    if index < 1 or index > len(rand):
        return {"error": "invalid index"}
    deleted = rand.pop(index - 1)
    save_file()
    return {"message": deleted}

app.mount("/", StaticFiles(directory="static", html=True), name="static")