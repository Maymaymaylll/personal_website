
var title = document.querySelector("h1");
title.innerHTML = "This is a new title from JavaScript";

var pressbutton = document.querySelector("#press_me");
pressbutton.addEventListener("click", myfunction1);
function myfunction1(){
    alert("You pressed the button!");
}

var aboutbutton = document.querySelector("#about_me");
aboutbutton.addEventListener("click", myfunction2);
function myfunction2(){
    alert("Thank you for clicking!");
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