import './style.css'
import { generateRound } from './math.js'
import { registerSW } from 'virtual:pwa-register'

const app = document.querySelector('#app')
const multiplicationList = document.querySelector('#multiplication-list')
const divisionList = document.querySelector('#division-list')
const progress = document.querySelector('#progress')
const completion = document.querySelector('#completion')
const checkButton = document.querySelector('#check-answers')
const newRoundButton = document.querySelector('#new-round')

let round
let answers

function problemLabel(problem) {
  if (problem.operation === 'multiply') {
    return `${problem.left} krát ${problem.right}`
  }

  return `${problem.left} děleno ${problem.right}`
}

function renderProblem(problem, index) {
  const label = problemLabel(problem)
  const row = document.createElement('div')
  row.className = 'problem'

  const expression = document.createElement('span')
  expression.className = 'expression'
  expression.setAttribute('aria-hidden', 'true')

  const operator = problem.operation === 'multiply' ? '×' : '÷'
  expression.textContent = `${problem.left} ${operator} ${problem.right}`

  const equals = document.createElement('span')
  equals.className = 'equals'
  equals.setAttribute('aria-hidden', 'true')
  equals.textContent = '='

  const input = document.createElement('input')
  input.className = 'answer-input'
  input.type = 'text'
  input.inputMode = 'numeric'
  input.pattern = '[0-9]*'
  input.maxLength = 3
  input.autocomplete = 'off'
  input.setAttribute('aria-label', `Výsledek příkladu ${label}`)
  input.setAttribute('aria-describedby', `feedback-${problem.operation}-${index}`)
  input.dataset.operation = problem.operation
  input.dataset.index = String(index)

  const feedback = document.createElement('span')
  feedback.className = 'feedback'
  feedback.id = `feedback-${problem.operation}-${index}`
  feedback.setAttribute('aria-live', 'polite')

  input.addEventListener('input', () => {
    input.value = input.value.replace(/[^0-9]/g, '').slice(0, 3)
    if (answers[problem.operation][index].status !== 'correct') {
      setProblemStatus(input, feedback, '')
      answers[problem.operation][index].status = ''
    }
  })

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      checkAnswers()
    }
  })

  row.append(expression, equals, input, feedback)
  return row
}

function renderProblems(problems, list) {
  list.replaceChildren(...problems.map(renderProblem))
}

function setProblemStatus(input, feedback, status) {
  input.classList.remove('is-correct', 'is-incorrect', 'is-empty')
  feedback.className = 'feedback'

  if (status === 'correct') {
    input.classList.add('is-correct')
    feedback.classList.add('feedback-correct')
    feedback.textContent = '✓ Správně'
    input.disabled = true
  } else if (status === 'incorrect') {
    input.classList.add('is-incorrect')
    feedback.classList.add('feedback-incorrect')
    feedback.textContent = '✕ Zkus to znovu'
    input.disabled = false
  } else if (status === 'empty') {
    input.classList.add('is-empty')
    feedback.classList.add('feedback-empty')
    feedback.textContent = '○ Zadej odpověď'
    input.disabled = false
  } else {
    feedback.textContent = ''
  }
}

function checkGroup(problems, groupAnswers, list) {
  const inputs = list.querySelectorAll('.answer-input')

  problems.forEach((problem, index) => {
    const answer = groupAnswers[index]
    if (answer.status === 'correct') return

    const input = inputs[index]
    const value = input.value
    const status = value === ''
      ? 'empty'
      : Number(value) === problem.answer
        ? 'correct'
        : 'incorrect'

    answer.status = status
    setProblemStatus(input, list.querySelector(`#feedback-${problem.operation}-${index}`), status)
  })

  return groupAnswers.filter((answer) => answer.status === 'correct').length
}

function checkAnswers() {
  const correctCount = checkGroup(
    round.multiplication,
    answers.multiply,
    multiplicationList,
  ) + checkGroup(round.division, answers.divide, divisionList)
  const remaining = 10 - correctCount

  progress.textContent = `Správně ${correctCount} z 10 · Ještě zbývá ${remaining}`
  completion.textContent = correctCount === 10
    ? 'Paráda! Všech 10 správně.'
    : ''
  newRoundButton.disabled = correctCount !== 10
}

function startNewRound() {
  round = generateRound()
  answers = {
    multiply: round.multiplication.map(() => ({ status: '' })),
    divide: round.division.map(() => ({ status: '' })),
  }

  renderProblems(round.multiplication, multiplicationList)
  renderProblems(round.division, divisionList)
  progress.textContent = 'Správně 0 z 10 · Ještě zbývá 10'
  completion.textContent = ''
  newRoundButton.disabled = true
  multiplicationList.querySelector('.answer-input')?.focus()
}

function connectForm() {
  checkButton.addEventListener('click', checkAnswers)
  newRoundButton.addEventListener('click', startNewRound)
}

app.setAttribute('aria-label', 'Procvičování malé násobilky')
connectForm()
startNewRound()
registerSW({ immediate: true })
