import json
from flask import Flask,jsonify,render_template,make_response,request

from apis import gpt

app = Flask(__name__)

@app.route("/",methods=["GET"])
def index():
    return render_template("index.html")

@app.route('/hello/<name>')
def hello_name(name):
   return 'Hello %s!' % name

@app.route('/gpt/getNonce', methods=["GET"])
def get_nonce():
    if request.method=="GET":  
        return jsonify({"ApiKey":gpt.get_data_nonce()})
    
@app.route('/gpt/sendMessage', methods=["POST"])
def send_message():
    if request.method=="POST":              #Comprobamos que sea un metodo de tipo post
        data=request.json                   #almacenamos el json enviado en data
        # print(data)
        if "token" in data and "messages" in data:   #Comprobamos si el json tiene las claves "token" y "messages"
            r=gpt.send_message(data["token"],data["messages"],request.cookies)   #Ejecutamos el request a la api clon de chatgpt
            response=make_response({"message":r["message"]})    #devolvemos la respuesta de la ia como resultado
            for c in r["cookies"]:
                response.set_cookie(c,r["cookies"][c])          #Añadimos las cookies a la respuesta
            return response
        return "ERROR",500
    return "ERROR",500
    

if __name__ == '__main__':
   app.run(debug=True)