const socket = io()
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
const $divContent = document.querySelector('div.content');


const { username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true })



let currentChecker;
let currentCheckerKing;
let status;

socket.emit('joinGame', { username, room }, ({error, message}) => {
    if(error){
        throw Error(error);
    }
    if(message != null)
        status = message;
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

socket.on('roomData', ({ room, users, points, status }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users,
        points,
        status
    })
    document.querySelector('#sidebar').innerHTML = html
    let rules = document.createElement("button");
    rules.addEventListener("click",(e)=>{
        alert(appendRules())
    })
    rules.innerHTML = "חוקים"
    rules.setAttribute("id","rules");
    $divContent.appendChild(rules);
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
    let divCheckers = document.getElementById("divCheckers" + game.id);
    let table = document.getElementById("checker" + game.id);
    if (table != null)
        table.remove();
    else{
        divCheckers = document.createElement("div");
        divCheckers.setAttribute("id", "divCheckers" + game.id);
        $divContent.appendChild(divCheckers);
    }
    table = document.createElement("table");
    table.setAttribute("id", "checker" + game.id);
    divCheckers.prepend(table);
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
                    if (game.selectedElements.length == 1) {
                        document.querySelector("#" + table.getAttribute("id") + " td[name='" + game.selectedElements[0].name + "']").className = game.selectedElements[0].className;
                    } else if (game.selectedElements.length > 1) {
                        document.querySelector("#" + table.getAttribute("id") + " td[name='" + game.selectedElements[0].name + "']").className = game.selectedElements[0].className;
                        document.querySelector("#" + table.getAttribute("id") + " td[name='" + game.selectedElements[1].name + "']").className = game.selectedElements[1].className;
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
    let turnMessage = document.getElementById("turnMessage");
    if(turnMessage == null){
        turnMessage = document.createElement("h3")
        turnMessage.setAttribute("id", "turnMessage")
        divCheckers.appendChild(turnMessage);
    }
    if(game.isGameOverProp && game.isGameOverProp.GameOver == true){
        turnMessage.innerHTML = game.isGameOverProp.message;
    }
    else
        turnMessage.innerHTML = "now it's turn of "+(game.isTurnBright?"bright":"dark")+" player"; 
})
const appendRules= ()=>{
    rulesArray = ['החיילים יכולים ללכת רק קדימה באלכסון',
    '"אכילה" מתבצעת בכך שהשחקן מדלג באלכסון מעל יריבו',
    'כאשר חייל פוגש את יריבו הוא חייב "לאכול"',
    'חובה ל"אכול" גם לאחור (אין דבר כזה "שרופים")',
    'חובה לבצע "אכילת שרשרת", בה אוכלים יותר מחייל אחד',
    'כאשר חייל מגיע לצד של יריבו הוא הופך למלכה',
    'למלכה מותר ללכת באלכסון כמה צעדים שהיא רוצה, גם קדימה וגם אחורה',
    'למלכה מותר לאכול יותר מחייל אחד, גם ברווחים גדולים בין חייל לחייל',
    'במידה והחייל מגיע לצידו השני של הלוח בזמן אכילת שרשרת, הוא הופך למלכה ללא קשר למקום בו סיים את האכילות.'];
    let rulesStr = "";
    for(let i=0; i<rulesArray.length;i++){
        rulesStr += (i + 1) + ". " + rulesArray[i] + "\r\n";
    }
    return rulesStr;
}