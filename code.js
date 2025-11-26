
//var title = document.querySelector("h1");
//title.innerHTML = "This is a new title from JavaScript";


var portbutton = document.querySelector("#port");
portbutton.addEventListener("click", myfunction3);
function myfunction3(){
    alert("This is my portfolio");
}


var mynode =document.createElement("div");
mynode.id = "work1_intro";
mynode.innerHTML = "This is my work 1";
mynode.style.border = "blue";

mynode.addEventListener("click", welcomeToWork1);
document.querySelector("#my_work1").appendChild(mynode);

function welcomeToWork1(){
    mynode.innerHTML = "Welcome to my work 1 page!";
}
//button.appendChild(mynode);