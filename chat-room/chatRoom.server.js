const eventBus = require('../Backend/eventBus')


module.exports = function () {
    eventBus.on('groupCreated', (group) => {
        const element = document.getElementById("conversation-list")
        element.innerHTML = ""
    
        const new_gc = document.createElement('div')
        new_gc.classList.add("conversation")
        new_gc.id = group.name
        new_gc.onclick = viewSwap(new_gc)
        
        element.appendChild(new_gc);
    
        lastRender[group.name] = null;

        console.log("Added!")
    })
}