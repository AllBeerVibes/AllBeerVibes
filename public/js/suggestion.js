const userId = document.querySelector(".beerResult__userId").innerHTML;
const favorite__modal = document.querySelector('#fav__modal');
const content = document.querySelector('.mod__content');

const beer__list = document.querySelector('#beerResult');

//pop-up the select menu to add to favorite list
beer__list.addEventListener('click', e => {
    
    content.innerHTML = '';

    const targetData = e.target.closest('button');
    
    if(userId == '') {
        window.alert("you should sign-on before use this function")
    }

    else {
        content.innerHTML = `
        <form method="POST" action='' class="modal_form">
                        <table class="submit">
                            <tr>
                                <td>
                                <button class="button__like" name="button" value='1/${targetData.value}' type="submit">I like it</td>
                            </tr>
                            <tr>
                                <td>
                                <button class="button__dislike" name="button" value='-1/${targetData.value}' type="submit">I don't like it</td>
                            </tr>
                            <tr>
                                <td>
                                <button class="button__dislike" name="button" value='0/${targetData.value}' type="submit">Set it later</td>
                            </tr>
                        </table>
                    </form>
        `;

        favorite__modal.style.display= "block";
    }
})

//close the pop-up
window.onclick = function(e) {
    if(e.target == favorite__modal) {
    favorite__modal.style.display = "none";
    }
  }


