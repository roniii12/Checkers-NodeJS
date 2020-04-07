
const socket = io();

const $formLogin = document.querySelector("#formLogin");
const $errorMessage = document.querySelector("#errorMessage");
const $submitButton = document.querySelector("#submitButton");
const $emailField = document.querySelector("[name='email']")




$formLogin.addEventListener("submit", (e)=>{
    e.preventDefault();
    const email = e.target.elements.email.value;
    const password = e.target.elements.password.value;
    $submitButton.setAttribute("disabled", "disabled");
    const js = JSON.stringify({email, password})
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", `/login`,false);
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(js);
    e = JSON.parse(xhttp.responseText);
    console.log(e);
    //socket.emit("login",{email,password}, (e)=>{
        if(e.errMsg){
            $formLogin.reset();
            $submitButton.removeAttribute("disabled");
            $emailField.focus();
            $errorMessage.innerHTML = e.errMsg
        }else{
            window.location.reload();
        }
    //})
})