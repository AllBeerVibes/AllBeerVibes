var array = [];

//sessionStorage.setItem('quizArray', array);

const quizMenu = document.querySelector('.quiz-process');
const result = document.querySelector('.quiz-result');

const resultContent = document.querySelector('.quiz-result .content');

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

            resultContent.innerHTML = `<h1>${nominate}</h1>`;

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


