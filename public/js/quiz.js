var array = [];
var charArray = ['a','b','c','d','e','f'];
var answerArray = ["IPA", "Stout", "Witbier", "Sour Ale", "Lager", "Barleywine"];
var styleExplanationArray = ["IPAs (short for India pale ales) boast strong hop bitterness with piney and floral flavors. These beers also have high alcohol content.", "Stouts are dark beers that are similar to porters, but with stronger roasted flavors. This style also features mid to high alcohol levels.", "Witbier, white beer, bière blanche, or simply witte is a barley/wheat, top-fermented beer brewed mainly in Belgium and the Netherlands. It gets its name due to suspended yeast and wheat proteins which cause the beer to look hazy, or white, when cold.", "Sour beer is the oldest type of beer in history. Nearly all beer used to be at least somewhat sour before pasteurization and sterilization was entirely understood. Sours today are tart-tasting, and made with wild bacteria and yeasts, whereas more familiar beers are made in sterile environments with specific yeast strains.", "Lagers are the crisp, thirst-quenching yellow beers like Budweiser and the like. Lagers are made with bottom-fermenting yeasts that need the liquid they’re fermenting to be cold and still for a longish time.", "Lively and fruity, sometimes sweet or bittersweet. A brew of this strength and complexity can be a challenge to the palate. Expect anything from an amber to a dark brown color, with aromas ranging from rich fruits to bold hops."];
var answerStyle = '';
var answerExplanation = '';

//sessionStorage.setItem('quizArray', array);

const quizMenu = document.querySelector('.quiz-process');
const result = document.querySelector('.quiz-result');

const resultContent = document.querySelector('.quiz-result .content');
const resultHead = document.querySelector('.quiz-result .like');

quizMenu.addEventListener('click', e => {
    var targetData = e.target.closest('button');

    array.push(targetData.value);

    if(targetData.id == 'last') {

        var currentQuiz = document.querySelector('.current');
        currentQuiz.classList.add('hidden');

        quizMenu.classList.add('hidden');
        result.classList.remove('hidden');

        array.sort();
            
            var nominate = array[0];
            var candidate = array[0];
            var count = 1, saveComp = 0;
            
            for(let i=1; i< array.length ; i++) {

                if(array[i] == candidate) {
                    count++;
                }
                
                if(array[i] != candidate || i == array.length - 1) {
                    
                    if(count > saveComp) {
                        nominate = candidate;
                        saveComp = count;
                    }

                    candidate = array[i];
                    count = 1;
                }
            }
            
            var num = charArray.indexOf(nominate);

            answerStyle = answerArray[num];
            answerExplanation = styleExplanationArray[num];;

            resultHead.innerHTML = answerStyle;
                       
            var content = 
                `<p>${answerExplanation}</p>
                <form method='GET' action="/beer/result">
                    <input type="hidden" name="searchterm" value=${answerStyle}/>
                    <button type="submit">Search Beer</button>
                </form>
                `
            resultContent.innerHTML = content;

    }

    else {
    
        var currentQuiz = document.querySelector('.current');
        var nextQuiz = currentQuiz.nextElementSibling;

        console.log(currentQuiz);
        console.log(nextQuiz);

        currentQuiz.classList.remove('current');
        currentQuiz.classList.add('hidden');
        nextQuiz.classList.remove('hidden');
        nextQuiz.classList.add('current');

    }

})


