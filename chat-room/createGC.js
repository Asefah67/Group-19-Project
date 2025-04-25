function createGC () {
    fetch("../server/data/rooms/groups.json")
    .then(res => res.json())
    .then(data => {
        for (const key in data) {
            console.log(data)
            if (key === 'groups') {
                data[key].forEach(obj => {
                console.log(JSON.stringify(obj))
                    if (obj.status === false) {
                        const element = document.getElementById("conversation-list")
                        console.log(element)
                        const new_chat = document.createElement('div');
                        new_chat.classList.add('conversation');
                        element.appendChild(new_chat);
                        obj.status = true;
                        console.log("Complete!")
                    }
                })
            }
        }
    })
}



window.createGC = createGC;