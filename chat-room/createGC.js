window.onload = () => {
    const elements = document.querySelector(".conversation-list");
    console.log("Elements found:", elements);
};

export function createGC () {
    fetch("../server/data/rooms/groups.json")
    .then(res => res.json())
    .then(data => {
        for (const key in data) {
            console.log(data)
            if (key === 'groups') {
                data[key].forEach(obj => {
                    console.log(JSON.stringify(obj))
                    if (obj.status === false) {
                        setTimeout(() => {
                            const element = document.getElementsByClassName("conversation-list")
                            const new_chat = document.createElement('div');
                            new_chat.classList.add('conversation');
                            element.appendChild(new_chat);
                            console.log("Done")
                        }, 1000)
                    }
                })
            }
        }
    })
    console.log("Complete")
}
window.createGC = createGC;