var array = [];
var charArray = ['a','b','c','d','e','f'];
var answerArray = ["IPA", "Stout", "Witbier", "Sour Ale", "Larger", "Barleywine"];
var answerStyle = '';

//sessionStorage.setItem('quizArray', array);

const quizMenu = document.querySelector('.quiz-process');
const result = document.querySelector('.quiz-result');

const resultContent = document.querySelector('.quiz-result .content');
const resultHead = document.querySelector('.quiz-result .like');

quizMenu.addEventListener('click', e => {
    
    console.log(array);

    var targetData = e.target.closest('button');

    array.push(targetData.value);

    if(targetData.id == 'last') {

        var currentQuiz = document.querySelector('.current');
        currentQuiz.classList.add('hidden');

        quizMenu.classList.add('hidden');
        result.classList.remove('hidden');

        console.log(array);

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
            
            console.log(nominate);

            var num = charArray.indexOf(nominate);

            console.log(num);

            answerStyle = answerArray[num];

            resultHead.innerHTML = answerStyle;
                       
            var content = 
                `<p>blah blah blah 2~3 sentence to explain this style</p>
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


