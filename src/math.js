function randomItemIndex(length, random) {
  return Math.floor(random() * length)
}

function shuffle(items, random) {
  const shuffled = [...items]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const otherIndex = randomItemIndex(index + 1, random)
    ;[shuffled[index], shuffled[otherIndex]] = [shuffled[otherIndex], shuffled[index]]
  }

  return shuffled
}

function factorPairKey(left, right) {
  return [left, right].sort((a, b) => a - b).join(':')
}

export function generateMultiplicationProblems(random = Math.random) {
  const candidates = []

  for (let left = 1; left <= 10; left += 1) {
    for (let right = left; right <= 10; right += 1) {
      candidates.push({
        operation: 'multiply',
        left,
        right,
        answer: left * right,
      })
    }
  }

  return shuffle(candidates, random).slice(0, 5)
}

export function generateDivisionProblems(multiplication, random = Math.random) {
  const multiplicationPairs = new Set(
    multiplication.map(({ left, right }) => factorPairKey(left, right)),
  )
  const candidates = []

  for (let quotient = 1; quotient <= 10; quotient += 1) {
    for (let divisor = 1; divisor <= 10; divisor += 1) {
      if (multiplicationPairs.has(factorPairKey(quotient, divisor))) continue

      candidates.push({
        operation: 'divide',
        left: quotient * divisor,
        right: divisor,
        answer: quotient,
      })
    }
  }

  return shuffle(candidates, random).slice(0, 5)
}

export function generateRound(random = Math.random) {
  const multiplication = generateMultiplicationProblems(random)
  const division = generateDivisionProblems(multiplication, random)
  return { multiplication, division }
}
