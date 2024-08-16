const txtBox = document.getElementById("text-box"); //TextBox object
const chat = document.getElementById("chat");
let log;
try{
  log = localStorage.getItem("messages").split(",");                                     //Historial de mensajes
}
catch(ReferenceError){
  log = []
}
let key = "";                                        //Clave para usar la api
let AiResponse=false;

fetch('/gpt/getNonce')                            //Fetch para obtener la api key
  .then(data => data.json())
  .then(success => {key = success["ApiKey"];AiResponse=true});

try{
  localStorage.getItem("messages").split(",")
  .forEach(e=> {
    var sender = decodeURIComponent(e).split(":")[0];
    addMsgToChat(decodeURIComponent(e),sender==="Human" ? true : false);
  })
}
catch(TypeError){
  console.log("No existe conversacion previa.")
}



function deleteCookies(){
    if (confirm("¿Estas seguro que deseas borrar todas las cookies con el historial de las conversaciones?")){
      document.cookie.split(';').forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    });
    localStorage.removeItem("messages")
}

}

function addMsgToChat(msg, isHuman) {

  const li = document.createElement("li");
  const container = document.createElement("div");
  const message = document.createElement("div")
  const textnode = document.createTextNode(msg);
  if (isHuman)
    container.classList.add("human-container")
  else
    container.classList.add("ai-container")
  message.appendChild(textnode)
  container.appendChild(message)
  li.appendChild(container)

  chat.appendChild(li);
}

function sendMessage() {
  if (txtBox.value.length > 0 && AiResponse) {
    log.push(encodeURIComponent("Human: " + txtBox.value)); //Almacenamos los mensajes en un array
    localStorage.setItem("messages", log);  //lo guardamos en el localstorage
    // console.log(localStorage.getItem("messages").split(","))
    addMsgToChat(txtBox.value, true);
    AiResponse=false;
    var options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        "token": key,
        "messages": localStorage.getItem("messages").split(",")
          .map(e => decodeURIComponent(e))
      })
    };
    // console.log(options)
    fetch("/gpt/sendMessage", options).then(res => res.json())
      .then(response => {
        addMsgToChat(response["message"], false);
        AiResponse=true;
        log.push(encodeURIComponent(response["message"]));
        localStorage.setItem("messages", log);
      });   //Obtenemos la respuesta de la ia

    txtBox.value = "";              //Borra el contenido
  }
}


txtBox.addEventListener("keydown", (e) => {       //Evento que detecta cuando se presiona una tecla
  if (e.key == "Enter" && !e.shiftKey) {              //Cuando se presiona enter y no se presiona shift
    e.preventDefault();           //Desactiva la funcion por defecto de la tecla enter
    sendMessage();
  }
});



