const eventBus = require('../Backend/eventBus')


/*eventBus.on('groupCreated', (group) => {
    console.log("Here!")
    const element = document.getElementById("conversation-list")
    element.innerHTML = ""
    
    const new_gc = document.createElement('div')
    new_gc.classList.add("conversation")
    new_gc.id = group.name
    new_gc.innerText = group.name;
    new_gc.onclick = viewSwap(new_gc)
        
    element.appendChild(new_gc);
    
    lastRender[group.name] = null;

    console.log("Added!")
})*/

function checkForNewGroups() {
    fetch('/new-groups')
      .then(response => response.json())
      .then(group => {
        if (group) {
          const conversationList = document.getElementById('conversation-list');
          
          const newConversation = document.createElement('div');
          newConversation.classList.add('conversation');
          newConversation.id = `conversation-${group.id}`;
          newConversation.innerText = group.name;
          
          conversationList.appendChild(newConversation);
        }
      });
  
    setTimeout(checkForNewGroups, 5000); // Poll every 5 seconds
  }
  
  // Start polling when the page loads
  document.addEventListener('DOMContentLoaded', checkForNewGroups);
   