// Switch between screens
const screen1 = document.querySelector('#introduction');
const screen2 = document.querySelector('#attempt-quiz');
const screen3 = document.querySelector('#review-quiz');

// Start the quiz
const startBtn = document.querySelector('#start');
startBtn.addEventListener('click', onClickStart);
startBtn.addEventListener('click', scrollToTop);

function onClickStart() {
    screen1.classList.toggle('hidden');
    screen2.classList.toggle('hidden');
}

// Submit answers
const submitBtn = document.querySelector('#submit');
submitBtn.addEventListener('click', onClickSubmit);
submitBtn.addEventListener('click', scrollToTop);

function onClickSubmit() {
    screen3.classList.toggle('hidden');
    document.querySelector('#submit-button').classList.toggle('hidden');
}

// Retry quiz
const retryBtn = document.querySelector('#try-again')
retryBtn.addEventListener('click', tryAgain);
retryBtn.addEventListener('click', scrollToTop);

function tryAgain() {
  location.reload();
}

function scrollToTop() {
  document.getElementById('course-name').scrollIntoView(true); // Top
}

// Click an answer
const listLabel = document.querySelectorAll('label');
for (label of listLabel) {
  label.addEventListener('click', onClick);
}
function onClick(event) {
    const radio = event.currentTarget;
    const input = radio.querySelector('input');
    input.checked = true;
    //from heeh
}

// Highlight selected item
const colorButton = document.querySelectorAll('.option');

for (const c of colorButton) {
    c.addEventListener('click', onClickColor);
}
function onClickColor(event) {
    event.currentTarget.style.backgroundColor = "#ddd";
}

// Start the quiz
let attemptID;
fetch('https://wpr-quiz-api.herokuapp.com/attempts', {
  method: 'POST'
// Show questions
}).then((response) => {
  response.json().then((jsonResponse) => {
    attemptID = jsonResponse._id;
    let array = jsonResponse.questions;
    array.forEach(loadQueAns);
    function loadQueAns(item, index) {
      const questionList = document.querySelector('#question-container');
      const ques = document.createElement('div');
      ques.classList.add("ques");
      const queNum = document.createElement('h1');
      queNum.textContent = 'Question ' + (index + 1) + ' of 10';
      const que = document.createElement('p');
      que.textContent = item.text;
      ques.appendChild(queNum);
      ques.appendChild(que);
      questionList.appendChild(ques);
      const divAnswer = document.createElement('div');
      divAnswer.classList.add("answer")
      divAnswer.id = item._id;
      questionList.appendChild(divAnswer);
      let valueAns = 0;
      for (ans of item.answers) {
        const labelAnswer = document.createElement('label');
        const divOption = document.createElement('div');
        divOption.classList.add('option');
        labelAnswer.appendChild(divOption);

        labelAnswer.addEventListener('click', clickAnswer);
        const answerContent = document.createElement('span');
        answerContent.textContent = ans;
        labelAnswer.classList.add('choice');
        labelAnswer.classList.add('label');
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.value = valueAns;
        radio.id = 'radio-id-' + valueAns;
        radio.name = 'question' + (index + 1);
        divOption.appendChild(radio);
        divOption.appendChild(answerContent);
        divAnswer.appendChild(labelAnswer);
        valueAns++;
      }
    }
  })

}).catch((err) => {
  console.log(`Error: ${err}`)
});

// Submit your answer
document.querySelector('#submit').addEventListener('click', submitAnswer);

function submitAnswer() {
  var selector = document.querySelectorAll('input:checked');
  console.log(selector);
  if (selector) {
    var answerJSON = '{ "answers": {';
    
    if (selector) {
      for (let i = 0; i < selector.length; i++) {
        if (i == (selector.length - 1)) {
          answerJSON += '"' + selector[i].parentElement.parentElement.parentElement.getAttribute('id') + '"' + ':' + selector[i].value + '}}';
          break;
        }
        answerJSON += '"' + selector[i].parentElement.parentElement.parentElement.getAttribute('id') + '"' + ':' + selector[i].value + ',';

      }
    }

  } else {
    var answerJSON = '{ "answers": {}}';
  }
  console.log(answerJSON);

  // Show result & review question
  fetch('https://wpr-quiz-api.herokuapp.com/attempts/' + String(attemptID) + '/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: answerJSON

  }).then((response) => {
    response.json().then((jsonResponse) => {
      console.log(jsonResponse);
      document.querySelector('#score').textContent = jsonResponse.score + '/10';
      document.querySelector('#percent').textContent = jsonResponse.score * 10 + ' %';
      document.querySelector('#feedback-text').textContent = jsonResponse.scoreText;
      
      // gray all correct answers
      for (const queId in jsonResponse.correctAnswers) {
        const que = document.getElementById(queId);
        const radioCorrectAns = que.querySelector('#radio-id-' + jsonResponse.correctAnswers[queId]);
        const correctAns = document.createElement('span');
        correctAns.textContent = 'Correct answer';

        correctAns.style.position = 'absolute';
        correctAns.style.right = '10px';
        correctAns.style.color = 'white';
        
        radioCorrectAns.parentElement.appendChild(correctAns);
        radioCorrectAns.parentElement.classList.add('correct-answer');
        radioCorrectAns.parentElement.style = "background-color: #ddd";
      }

      // Show wrong answers
      for (let i = 0; i < selector.length; i++) {
        var selection = selector[i].parentElement.querySelector('correct-answer');
        if (selection == null) {
          // answer is wrong
          const yourAns = document.createElement('span');
          yourAns.textContent = 'Your answer';

          yourAns.style.position = 'absolute';
          yourAns.style.right = '10px';
          yourAns.style.color = 'white';

          selector[i].parentElement.appendChild(yourAns);
          selector[i].parentElement.classList.add('wrong-answer');
          selector[i].parentElement.style = "background-color: #f8d7da;";
        } else {
          // your answer is correct
          var correctAns = document.querySelectorAll('correct-answer wrong-answer');
          correctAns.style = "background-color: #d4edda;";
        }
      }
      }
    )
  }).catch((err) => {
    console.log(`Error: ${err}`)
  });
  const listRadio = document.querySelectorAll('input');
  for (a of listRadio) {
    a.disabled = true;
  }
  const listLabel = document.querySelectorAll('label');
  for (label of listLabel) {
    label.removeEventListener('click', clickAnswer);
  }
  const submit = document.querySelector('#submit');
  submit.style.display = "none";
  const result = document.querySelector('#result');
  result.style.display = "block";
}

function clickAnswer(event) {
  const clickedAnswer = event.currentTarget;
  const clickAns = clickedAnswer.parentElement.querySelector('.clicked');
  if (clickAns != null) {
    clickAns.classList.remove('clicked');
  }
  clickedAnswer.classList.add('clicked');
}