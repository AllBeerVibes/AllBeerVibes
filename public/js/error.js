const errorM = document.querySelector('.error_M');

console.log(window.scrollY);

window.onscroll = function() {removeM()};

function removeM() {
    if(window.pageYOffset > 0) {    
        errorM.style.opacity = 0;
    }
}
