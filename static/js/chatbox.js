const txtBox = document.getElementById("text-box"); //TextBox object
const chat = document.getElementById("chat");       //obtenemos el ul de la conversacion
let log;                                            //Creamos un array
try{
  log = localStorage.getItem("messages").split(",");//le asignamos los valores almacenados en el localStorage
}
catch(ReferenceError){
  log = []                                          //En caso de que no haya lo declaramos vacio
}
let key = "";                                       //Clave para usar la api
let AiResponse=false;                               //Comprobacion de si la api respondio o no

fetch('/gpt/getNonce')                            //Fetch para obtener la api key
  .then(data => data.json())                      //convertimos la promise a json
  .then(success => {key = success["ApiKey"];AiResponse=true});  //asignamos la apiKey a la variable y decimos que la ia respondio

try{
  localStorage.getItem("messages").split(",")     //si hay una conversacion previa la cargamos en el chat
  .forEach(e=> {
    var sender = decodeURIComponent(e).split(":")[0];
    addMsgToChat(decodeURIComponent(e),sender==="Human" ? true : false);
  })
}
catch(TypeError){                                 //si no hay conversacion previa mandamos un mensaje por consola
  console.log("No existe conversacion previa.")
}

function openMenu(){                              //Funcion para mostrar o esconder el menu desplegable
  if (document.getElementById("left-bar").style.display==="none"){
    document.getElementById("left-bar").style.display="block";
  }else{
    document.getElementById("left-bar").style.display="none";
  }
}

function deleteCookies(){                       //Funcion para borrar todos los datos y asi las conversaciones
    if (confirm("¿Estas seguro que deseas borrar todas las cookies con el historial de las conversaciones?")){
      document.cookie.split(';').forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    });
    localStorage.removeItem("messages")
}

}

function addMsgToChat(msg, isHuman) {         //funcion para colocar texto en el chat

  const li = document.createElement("li");    //Creamos un <li>
  const container = document.createElement("div");  //Creamos un <div>
  const message = document.createElement("div")     //Creamos otro <div>
  const textnode = document.createTextNode(msg);    //Creamos un texto 
  if (isHuman)                                      //Decimos si el mensaje es del usuario o de la ia
    container.classList.add("human-container")
  else
    container.classList.add("ai-container")
  message.appendChild(textnode)
  container.appendChild(message)
  li.appendChild(container)

  chat.appendChild(li);
}

function sendMessage() {                      //Funcion para enviar y recibir respuesta de la ia
  if (txtBox.value.length > 0 && AiResponse) {              //Comprobamos si el texto tiene algo y si la ia ya respondio
    log.push(encodeURIComponent("Human: " + txtBox.value)); //Almacenamos los mensajes en un array
    localStorage.setItem("messages", log);  //lo guardamos en el localstorage
    // console.log(localStorage.getItem("messages").split(","))
    addMsgToChat(txtBox.value, true);                     //Añadimos el mensaje al chat
    AiResponse=false;        //Decimos que la ia aun no responde para bloquear el spam de mensajes del usuario
    var options = {         //Creamos los parametros del metodo post que haremos a la ia
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        "token": key,    //asignamos como token la api key que recibimos al inicio del programa
        "messages": localStorage.getItem("messages").split(",")     
          .map(e => decodeURIComponent(e))                          //Deocodificamos el historial de mensajes que esta guardado en el localStorage
      })
    };

    fetch("/gpt/sendMessage", options).then(res => res.json())//Enviamos el mensaje a la api y lo recibimos como json
      .then(response => {     //En caso de que la respuesta sea satisfactoria
        addMsgToChat(response["message"], false); //Añadimos el mensaje de la ia al chat
        AiResponse=true;                          //Decimos que la ia respondio
        log.push(encodeURIComponent(response["message"]));  //Añadimos la respuesta de la ia a nuestro historial
        localStorage.setItem("messages", log);  //y lo guardamos en nuestro localStorage
      });   //Obtenemos la respuesta de la ia

    txtBox.value = "";              //Borra el contenido del txtbox
  }
}


txtBox.addEventListener("keydown", (e) => {       //Evento que detecta cuando se presiona una tecla
  if (e.key == "Enter" && !e.shiftKey) {              //Cuando se presiona enter y no se presiona shift
    e.preventDefault();           //Desactiva la funcion por defecto de la tecla enter
    sendMessage();                //Ejecuta la funcion para enviar un mensaje a la ia
  }
});



