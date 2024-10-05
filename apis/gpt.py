import requests
import bs4

def get_data_nonce():
    URL="https://chatgpti.info/"
    CLASS="wpaicg-chat-shortcode"
    ATTR="data-nonce"
    r=requests.get(URL)
    soup=bs4.BeautifulSoup(r.content,"lxml")
    #os.system("cls")
    html_class = soup.find(class_=CLASS)
    # print(html_class[ATTR])
    return html_class[ATTR]

def send_message(token,msg,cookies):
    headers = {
    'Content-Type': "multipart/form-data; boundary=---011000010111000001101001",
    'accept': "*/*",
    'accept-language': "es-ES,es;q=0.6",
    'origin': "https://chatgptunlimited.org",
    'priority': "u=1, i",
    'referer': "https://chatgptunlimited.org/",
    'sec-ch-ua-mobile': "?0",
    'sec-fetch-dest': "script",
    'sec-fetch-mode': "no-cors",
    'sec-fetch-site': "cross-site",
    'sec-gpc': "1",
    'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
    }
    payload = {"_wpnonce":"",
           "post_id":0,
           "url":"https://chatgpti.info",
           "action":"wpaicg_chat_shortcode_message",
           "message":"",
           "bot_id":0,
           "chatbot_identity":"shortcode",
           "wpaicg_chat_client_id":"",
           "wpaicg_chat_history":["Human: Hola quiero que me hables en español."]
           }


    NONCE = token                                               #Key
    URL="https://chatgpti.info/wp-admin/admin-ajax.php"         #URL a la que haremos la peticion
    payload["action"]="wpaicg_chat_shortcode_message"           #Send message action
    payload["_wpnonce"]=NONCE                                   #KEY
    payload["message"]=msg[len(msg)-1]                          #Ultimo mensaje enviado
    payload["post_id"]=payload["post_id"]+1                     #Id del mensaje +1  (DEPRECATED)
    payload["wpaicg_chat_history"].append(f"{msg}")             #Historial de mensajes  
    r=requests.post(URL,headers=headers,params=payload,cookies=cookies) #Request a la api
    cookie={}
    if r.status_code==200:
        #print(r.content)
        # La pagina ya no funciona con cookies
        # for i in range(len(r.headers.get("set-cookie").split("secure, "))):
        #     k=r.headers.get("set-cookie").split("secure, ")[i].split(";")[0].split("=")[0]
        #     c=r.headers.get("set-cookie").split("secure, ")[i].split(";")[0].split("=")[1]
        #     cookie[k]=c
        payload["wpaicg_chat_history"].append(f"AI: {r.json()["data"]}")#Añadimos mensajes al array
        # return {"message":f"AI: {r.json()["data"]}",
        #         "cookies":cookie}
        return {"message":f"AI: {r.json()["data"]}"}
    else:
        return "ERROR"