import assert from 'node:assert/strict'
import test from 'node:test'
import {
  generateDivisionProblems,
  generateMultiplicationProblems,
  generateRound,
} from '../src/math.js'

const random = () => Math.random()
const factorKey = (left, right) => [left, right].sort((a, b) => a - b).join(':')

test('generates five valid, unique multiplication problems', () => {
  for (let round = 0; round < 100; round += 1) {
    const problems = generateMultiplicationProblems(random)
    assert.equal(problems.length, 5)
    assert.equal(new Set(problems.map(({ left, right }) => factorKey(left, right))).size, 5)

    for (const problem of problems) {
      assert.ok(problem.left >= 1 && problem.left <= 10)
      assert.ok(problem.right >= 1 && problem.right <= 10)
      assert.equal(problem.answer, problem.left * problem.right)
    }
  }
})

test('generates five unique division problems, disjoint from multiplication', () => {
  for (let round = 0; round < 100; round += 1) {
    const { multiplication, division } = generateRound(random)
    assert.equal(multiplication.length, 5)
    assert.equal(division.length, 5)
    assert.equal(
      new Set(division.map(({ left, right }) => `${left}:${right}`)).size,
      5,
    )

    const multiplicationPairs = new Set(
      multiplication.map(({ left, right }) => factorKey(left, right)),
    )
    for (const problem of division) {
      assert.equal(problem.left % problem.right, 0)
      assert.ok(problem.answer >= 1 && problem.answer <= 10)
      assert.equal(problem.left / problem.right, problem.answer)
      assert.ok(
        !multiplicationPairs.has(factorKey(problem.answer, problem.right)),
      )
    }
  }
})

test('rejects both division forms for every multiplication factor pair', () => {
  for (let left = 1; left <= 10; left += 1) {
    for (let right = left; right <= 10; right += 1) {
      const multiplication = [{ left, right }]
      const blockedKey = factorKey(left, right)

      for (const problem of generateDivisionProblems(multiplication, random)) {
        assert.notEqual(factorKey(problem.answer, problem.right), blockedKey)
      }
    }
  }
})

test('reversed multiplication factors are normalized as the same problem', () => {
  const problems = generateMultiplicationProblems(() => 0)
  const keys = problems.map(({ left, right }) => factorKey(right, left))
  assert.equal(new Set(keys).size, problems.length)

  const division = generateDivisionProblems([{ left: 6, right: 4 }], () => 0)
  assert.ok(division.every(({ answer, right }) => factorKey(answer, right) !== '4:6'))
})
