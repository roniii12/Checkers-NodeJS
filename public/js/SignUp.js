const socket = io();


const $formSignUp = document.querySelector("#signUp");
const $errorUsername = document.querySelector("#errorUsername");
const $errorEmail = document.querySelector("#errorEmail");
const $errorPassword = document.querySelector("#errorPassword");
const $submitButton = document.querySelector("#submitButton");


$formSignUp.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = e.target.elements.username.value;
    const email = e.target.elements.email.value;
    const password = e.target.elements.password.value;
    $submitButton.setAttribute("disabled", "disabled");
    socket.emit("addUser",{name,email,password},(error)=>{
        $submitButton.removeAttribute("disabled");
        if(error){
            handleError(error);
        }
        else{
            window.location.href = "/successfullSignUp.html"
        }
    })
})

let handleError = (error) =>{
    if(error.errors)
        error=error.errors;
    
        $errorUsername.innerHTML = error.name ? error.name.message || "": "";

        $errorEmail.innerHTML = error.email ? error.email.message || "":"";

        errorPassword.innerHTML = error.password ? error.password.message || "": "";

    if(error.code == 11000){
        $errorEmail.innerHTML = error.keyValue.email ? "this email is already exist" : "";
        $errorUsername.innerHTML = error.keyValue.name ? "this username is already exist" : "";
    }
}