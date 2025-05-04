import eventBus from '../server/eventBus.js';


let current_gc = "";
const backend = 'http://localhost:3000';


window.lastRender = {}

eventBus.addEventListener('groupCreated', (group) => {
  const element = document.getElementById("conversation-list")
  element.innerHTML = ""

  const new_gc = document.createElement('div')
  new_gc.classList.add("conversation")
  new_gc.id = group.name
  new_gc.onclick = viewSwap(new_gc)
  
  element.appendChild(new_gc);

  lastRender[group.name] = null;
})

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
    lastRender[current_gc] = null;
    rendermsg(group)
}


export function createGroup(element) {
    element.innerHTML = ""

    const new_gc = document.createElement('div')
    new_gc.classList.add("conversation")
    element.appendChild(new_gc);
    
}


async function fetchmsg(group, after = null) {
  let call = `${backend}/groups/${encodeURIComponent(group)}/messages`

  if (after) {
    call += `?after=${encodeURIComponent(after)}`
  }

  try {
    const response = await fetch(call)

    if (!response.ok) {
      throw new Error(`Error fetching for current group`)
    }

    const data = await response.json()
    return data;
  } catch (e) {
    console.error(`New Error: ${e}`)
  }
}


async function rendermsg(group) {

    let id = group.id;
    current_gc = id;

    document.getElementById("chatView").style.display = "none";

    document.getElementById("chatContainer").style.display = "flex";

    document.getElementById("chatHeader").innerText = id;


      let last_r ;

      if (!lastRender[current_gc]) {
        lastRender[current_gc] = null;
      }
        last_r = lastRender[current_gc]

        const container = document.getElementById("chatMessages");


        await fetchmsg(current_gc, last_r)
        .then((messages) => {  
          if (messages.length > 0) { 
            lastRender[current_gc] = messages[messages.length - 1].timestamp;  
            messages.forEach(msg => {
              console.log(msg);
              const bubble = document.createElement('div');
              bubble.className = 'chat-bubble';
              bubble.innerHTML = `
                ${msg.content}
                <div class = "timestamp"> ${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit'})}</div>`
              container.prepend(bubble)
            })
          }
        })
}
  
async function create_group_indb(groupName) {
  const res = await fetch (`${backend}/groups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json'},
    body: JSON.stringify({
      name: groupName
    })
  })

  if (!res.ok) {
    return new Error (`Cannot create group: ${res.status}`)
  }
}


export async function handleSend(input_id) {

    let msg = document.getElementById(input_id).value;
    let sender = "Anonymous"


    await fetch(`${backend}/groups/${current_gc}/messages`, {
      method: 'POST',
      headers: {'Content-Type': "application/json"},
      body: JSON.stringify({
        sender: sender,
        content: msg,
      })
    })
    .then(res => res.json())
    .then(data => console.log(data))
    .catch(err => console.error("Error:", err));


    document.getElementById(input_id).value = ""
  
    rendermsg(document.getElementById(current_gc));
}

window.viewSwap = viewSwap;
window.handleSend = handleSend;
window.createGroup = createGroup;