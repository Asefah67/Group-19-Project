let current_gc = "";
const backend = 'http://localhost:3000';


window.lastRender = {}

const menu = document.getElementById("menu-button");
const viewMembersButton = document.getElementById("members");


function showProfile(memberName) {
  // Implement the logic to show the member's profile 
  let profileOverlay = document.getElementById("profileOverlay");
  let profileName = document.getElementById("profileName");

  profileName.innerText = memberName;
  profileOverlay.style.display = "flex";
}

document.getElementById("close_profile").addEventListener("click", function(e) {
  document.getElementById("profileOverlay").style.display = "none"
});

viewMembersButton.addEventListener("click", async function() {
  let modalOverlay = document.getElementById("modalOverlay");
  let membersListContainer = document.getElementById("members-list");


  membersListContainer.innerHTML = "";

  try {
      const response = await fetch(`${backend}/groups/${current_gc}/members`);
      const members = await response.json();

      if (members.length > 0) {
          members.forEach(member => {
              let memberElement = document.createElement("div");
              memberElement.classList.add("member-list", "clickable");
              memberElement.innerText = member.name; // Assuming each member has a 'name'
              memberElement.addEventListener("click", function() {
                showProfile(member.name); // Assuming you have a function to show the profile
              })
              membersListContainer.appendChild(memberElement);
          });
      } else {
          membersListContainer.innerHTML = "<p>No members found.</p>";
      }
  } catch (error) {
      console.error("Error fetching members:", error);
      membersListContainer.innerHTML = "<p>Error loading members.</p>";
  }
  modalOverlay.style.display = "flex";
});

document.getElementById("close_members").addEventListener("click", function(e) {
    document.getElementById("modalOverlay").style.display = "none"
});



let last_gc = null;
async function checkForNewGroups() {
  console.log("Checking for new groups...")
  try {
    console.log("Fetching new groups...")
    const response = await fetch(`${backend}/new-groups`);
    console.log("Response:", response)
    if (!response.ok) throw new Error('Network response was not ok');
    const group = await response.json();

    console.log("Group data:", group)
    if (group.name && (group.name !== last_gc)) {
        last_gc = group.name; 
        const conversationList = document.getElementById('conversation-list');
        const new_gc = document.createElement('div');
        new_gc.classList.add('conversation');
        new_gc.id = group.name;
        new_gc.innerText = group.name;
        new_gc.onclick = viewSwap(new_gc)
        conversationList.appendChild(new_gc);
        lastRender[group.name] = null;
        console.log("Added new group:", group.name);
    } else {
      console.log("No new groups found.")
    }
  } catch (error) {
    console.error('Error fetching new groups:', error); 
  }

  setTimeout(checkForNewGroups, 5000); 
}


document.addEventListener('DOMContentLoaded', async() => {

  try {
    const response = await fetch(`${backend}/get-groups`);
    if (!response.ok) throw new Error('Network response was not ok');
    const groups = await response.json();

    if (groups.length > 0) {
      const conversationList = document.getElementById('conversation-list');
      groups.forEach(group => {
        const new_gc = document.createElement('div');
        new_gc.classList.add('conversation');
        new_gc.id = group.name;
        new_gc.innerText = group.name;
        new_gc.onclick = () => viewSwap(new_gc)
        conversationList.appendChild(new_gc);
        lastRender[group.name] = null;
      });

      console.log("Groups loaded:", groups);
    } else {
      console.log("No groups found.");
    }
  } catch (error) {
    console.error('Error fetching groups:', error); 
  }
  
  checkForNewGroups();
  const savedGroup = localStorage.getItem('selectedGroup');
    
  if (savedGroup) {
      const group = JSON.parse(savedGroup);
      rendermsg(group); 
  }

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
    if (!lastRender[current_gc]) {
      lastRender[current_gc] = null;
    }
    rendermsg(group)
}


export function createGroup(groupName) {
  const element = document.getElementById("conversation-list")
  element.innerHTML = ""

  const new_gc = document.createElement('div')
  new_gc.classList.add("conversation")
  new_gc.id = groupName
  new_gc.onclick = viewSwap(new_gc)
  
  element.appendChild(new_gc);

  lastRender[groupName] = null;
    
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

    localStorage.setItem('selectedGroup', JSON.stringify(group));

    document.getElementById("chatView").style.display = "none";

    document.getElementById("chatContainer").style.display = "flex";

    document.getElementById("chatHeader").innerText = group.id;

    try {

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
    }catch (e) {
      console.error(`Error: ${e}`)
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