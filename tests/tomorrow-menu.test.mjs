import test from 'node:test';
import assert from 'node:assert/strict';
import { dateKey, restaurants, coffees, generatePlan, pairKey, validPlan } from '../public/tomorrow/menu.mjs';

test('calendar dates cross months and years in local time', () => {
  assert.equal(dateKey(new Date(2026, 11, 31, 23, 59), 1), '2027-01-01');
  assert.equal(dateKey(new Date(2026, 0, 1), -1), '2025-12-31');
  assert.equal(dateKey(new Date(2028, 1, 28), 1), '2028-02-29');
});
test('all previous restaurant pairs avoid duplicate meals and consecutive-day pairs', () => {
  for (let a = 0; a < restaurants.length; a++) {
    for (let b = 0; b < restaurants.length; b++) {
      if (a === b) continue;
      const previous = { lunch: { restaurant: a }, dinner: { restaurant: b } };
      let current;
      for (let i = 0; i < 200; i++) {
        const plan = generatePlan(previous, current);
        assert.ok(validPlan(plan));
        assert.notEqual(pairKey(plan), pairKey(previous));
        if (current) assert.notEqual(pairKey(plan), pairKey(current));
        current = plan;
      }
    }
  }
});
test('all noodle options and coffees can be selected', () => {
  const dishes = new Set(); const drinks = new Set();
  const original = Math.random;
  try {
    // Sweep random values deterministically instead of relying on probabilistic coverage.
    for (let i = 0; i < 1000; i++) {
      Math.random = () => i / 1000;
      const plan = generatePlan();
      for (const meal of [plan.lunch, plan.dinner]) if (meal.restaurant === 0) dishes.add(meal.dish);
      drinks.add(plan.coffee);
    }
  } finally { Math.random = original; }
  assert.deepEqual([...dishes].sort(), [...restaurants[0].dishes].sort());
  assert.deepEqual([...drinks].sort(), [...coffees].sort());
});
test('invalid stored plans are rejected', () => {
  for (const plan of [null, {}, { lunch: null }, { lunch: { restaurant: 99 }, dinner: {} }, { lunch: { restaurant: 0, dish: 'unknown' }, dinner: { restaurant: 1, dish: '一人餐' }, coffee: coffees[0] }]) assert.equal(validPlan(plan), false);
});
