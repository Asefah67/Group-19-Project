import { chatRoomFakeServer } from "./chatRoomFakeServer.js";


const div = document.querySelectorAll('div.conversation');
window.message_logs = {};
window.lastRender = {}

div.forEach(div => {
  const id = String(div.id) + "fakeServer";
  if (div.id) {
    message_logs[id] = new chatRoomFakeServer(div.id);
    lastRender[id] = 0;

  }
})


let current_gc = "Group19StudyGroup";

const menu = document.getElementById("menu-button");
const viewMembersButton = document.getElementById("members");

viewMembersButton.addEventListener("click", function(e) {
    let modal_over = document.getElementById("modalOverlay");
    let members = message_logs[current_gc + "fakeServer"].get_members()

    document.getElementById("modalOverlay").style.display = 'flex';
})


menu.addEventListener("click", function(e) {
    const dropdown = menu.nextElementSibling;

    document.querySelectorAll(".dropdown").forEach(item => {
      if (item !== dropdown) {
        item.style.display = 'none';
      }
    });

    dropdown.style.display = dropdown.style.display === 'block'? 'none': 'block'
})


document.addEventListener("click", function(e) {
    if (!e.target.closest('.menu-button')) {
      document.querySelectorAll('.dropdown').forEach(item => item.style.display = 'none')
    }
});

document.getElementById("close_members").addEventListener("click", function(e) {
    document.getElementById("modalOverlay").style.display = "none"
})


export function viewSwap(group) {
    current_gc = group.id;
    document.getElementById("chatMessages").innerHTML = '';
    lastRender[current_gc + "fakeServer"] = 0;
    rendermsg(group)
}

export function createGroup(element) {
    element.innerHTML = ""

    const new_gc = document.createElement('div')
    new_gc.classList.add("conversation")
    element.appendChild(new_gc);
    
}


function rendermsg(group) {

    let id = group.id;

    document.getElementById("chatView").style.display = "none";

    document.getElementById("chatContainer").style.display = "flex";

    document.getElementById("chatHeader").innerText = id;



    const log = message_logs[id + "fakeServer"]
    //log.get_msg(input_id);
    const messages = log.fetch();

    let lastR = lastRender[id + "fakeServer"];


    const container = document.getElementById("chatMessages");

    if (!messages) {
      return;
    }

    for (let i = lastR; i < messages.length; i++) {
      console.log(i);
      const msg = messages[i];
      const bubble = document.createElement('div');
      bubble.className = 'chat-bubble';
      bubble.innerHTML = `
        ${msg.text}
        <div class = "timestamp"> ${new Date(msg.created).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit'})}</div>`
      container.prepend(bubble)
    }

    lastRender[id + "fakeServer"] = messages.length;
}

  
export function handleSend(input_id) {
    let log = message_logs[current_gc + "fakeServer"]
    if (!log) {
      message_logs[current_gc + "fakeServer"] = new chatRoomFakeServer(current_gc);
      log = message_logs[current_gc + "fakeServer"]
    }

    log.get_msg(input_id);

    document.getElementById(input_id).value = ""
  
    rendermsg(document.getElementById(current_gc));
}

window.viewSwap = viewSwap;
window.handleSend = handleSend;
window.createGroup = createGroup;