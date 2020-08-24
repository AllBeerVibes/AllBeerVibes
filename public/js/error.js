const errorM = document.querySelector('.error_M');

window.onclick = function(e) {
    errorM.style.opacity = 0;
}

window.onscroll = function(e) {
    errorM.style.opacity = 0;
}

const topButton = document.querySelector('.toTop');

topButton.addEventListener('click', e => {
    window.scrollTo({top:0,left:0, behavior:'smooth'});
})