const socket = io()
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


const { username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true })


let currentChecker;
let currentCheckerKing;

socket.emit('joinGame', { username, room }, ({error, message}) => {
    if(error){
        throw Error(error);
    }
    if(message === "bright"){
        currentChecker = tools.brightSolider;
        currentCheckerKing = tools.brightKing; 
    }
    else if(message === "dark"){
        currentChecker = tools.darkSolider;
        currentCheckerKing = tools.darkKing; 
    }
    if(message != "watch")
        socket.emit("sendPlay",{currentChecker,currentCheckerKing, room, numbersOfRow: 8});
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})


const tools = {
    darkSolider: 1,
    brightSolider: 2,
    darkKing: 3,
    brightKing: 4,
    empty: 0
}


socket.on("play", (game)=>{
    game.id = 0 
    if(game.isGameOverProp && game.isGameOverProp.GameOver == true){
        let message = document.createElement("h1")
        message.innerHTML = game.isGameOverProp.message;
        document.body.appendChild(message);
    }
    const divCheckers = document.createElement("div");
    divCheckers.setAttribute("id", "divCheckers" + game.id);
    document.body.appendChild(divCheckers);
    let table = document.getElementById("checker" + game.id);
    if (table != null)
        table.remove();
    table = document.createElement("table");
    table.setAttribute("id", "checker" + game.id);
    document.getElementById("divCheckers" + game.id).appendChild(table);
    for (let rows = 0; rows < game.table.length; rows++) {
        var row = document.createElement("tr");
        table.appendChild(row);
        for (let columns = 0; columns < game.table[rows].length; columns++) {
            let column = document.createElement("td");
            row.appendChild(column);
            if (rows % 2 == 0)
                column.className = columns % 2 == 0 ? "bright" : "dark";
            else
                column.className = columns % 2 == 1 ? "bright" : "dark";
            column.setAttribute("name", rows + "/" + columns);
            if(!(game.isGameOverProp && game.isGameOverProp.GameOver == true)){
                column.addEventListener("click", () => {
                    element = {name: column.getAttribute("name") ,className: column.className}
                    socket.emit("sendPlay",{currentCheckerKing, currentChecker, game,element,targetLocation: column.getAttribute("name"),username, room});
                    socket.on("color",(game)=>{
                    if (game.elements.length == 1) {
                        document.querySelector("#" + table.getAttribute("id") + " td[name='" + game.elements[0].name + "']").className = game.elements[0].className;
                    } else if (game.elements.length > 1) {
                        document.querySelector("#" + table.getAttribute("id") + " td[name='" + game.elements[0].name + "']").className = game.elements[0].className;
                        document.querySelector("#" + table.getAttribute("id") + " td[name='" + game.elements[1].name + "']").className = game.elements[1].className;
                    }})
                });
            }
            if (game.table[rows][columns] == 2) {
                let bright = document.createElement("div");
                column.appendChild(bright);
                bright.className = "brightCharacter";
            } else if (game.table[rows][columns] == 1) {
                let dark = document.createElement("div");
                column.appendChild(dark);
                dark.className = "darkCharacter";
            } else if (game.table[rows][columns] == 3) {
                let darkKing = document.createElement("div");
                column.appendChild(darkKing);
                darkKing.className = "darkKing";
                darkKing.innerHTML = "K";
            } else if (game.table[rows][columns] == 4) {
                let brightKing = document.createElement("div");
                column.appendChild(brightKing);
                brightKing.className = "brightKing";
                brightKing.innerHTML = "K";
            }
        }
    }
})
