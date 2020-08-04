const favorite__modal = document.querySelector('#fav__modal');
const content = document.querySelector('.mod__content');
const list_button = document.querySelectorAll('.list_button');

const id = document.querySelector(".beerResult__userId");

for (const button  of list_button) {
//pop-up the select menu to add to favorite list
button.addEventListener('click', e => {

    content.innerHTML = '';

    const targetData = e.target.value;

    console.log(targetData);
    
    if(id.value == '') {

        window.alert("you should sign-on before use this function")
        //will update the layout like modal form later
    }

    else {
        
        content.innerHTML = `
        <form method="POST" action='' class="modal_form">
                        <table class="submit">
                            <tr>
                                <td>
                                <button class="button__like" name="button" value='1/${targetData}' type="submit">I like it</td>
                            </tr>
                            <tr>
                                <td>
                                <button class="button__dislike" name="button" value='-1/${targetData}' type="submit">I don't like it</td>
                            </tr>
                            <tr>
                                <td>
                                <button class="button__dislike" name="button" value='0/${targetData}' type="submit">Set it later</td>
                            </tr>
                        </table>
                    </form>
        `;

        favorite__modal.style.display= "block";
    }
});

}

window.onclick = function(e) {
    if(e.target == favorite__modal) {
    favorite__modal.style.display = "none";
    }
  }


