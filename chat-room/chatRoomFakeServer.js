export class chatRoomFakeServer {

    #groupName
    #chatLogs
    #group_members

    constructor(group_id) {
        this.#groupName = group_id;
        this.#chatLogs = [];
        this.#group_members = [];
    }

    get_members() {
        return [...this.#group_members]
    }


    get_msg(input_id) {

        const txt = document.getElementById(input_id).value.trim();

        if (txt !== "") {
            const new_message = {
                //text: JSON.stringify(document.getElementById(input_id).value),
                text: txt,
                name: "Anonymous",
                created: new Date(),
            }

            this.#chatLogs.push(new_message)
        }
    }


    store_msg(new_message) {
        /*const fs = require('fs')
        const path = require('path')

        const filePath = path.join('frontend\Source', `${this.#groupName}.txt`)

        //check if file exists if not create one
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                fs.writeFile(filePath, '', (err) => {
                    if (err) {
                        console.error(`Error creating file ${fileName}:`, err);
                    } else {
                        console.log(`File ${fileName} created successfully.`)
                    }
                });
            } else {
                console.log(`File ${fileName} already exists.`)
            }
        })

        const mod_str = JSON.stringify(new_message, null, 2);

        fs.writeFile(filePath, mod_str, (err) => {
            if (err) {
                console.error(`Failed to write to ${filePath}:`, err);
            } else {
                console.log(`Object written to ${filePath}`)
            }
        });*/

    }


    fetch () {
        /*const fs = require('fs')
        const path = require('path')*/

        return this.#chatLogs;
        
    }

}

window.chatRoomFakeServer = chatRoomFakeServer;

