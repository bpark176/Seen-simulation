'use strict';
const assert = require('node:assert/strict');
const game = require('../docs/story.js');
const pristine = { step: 0, score: 60, trust: 0, courage: 0, privacy: 0, flags: {}, history: [] };
const types = ['diary', 'fitness', 'hate', 'records', 'ration', 'keyboard', 'chat', 'settings', 'diary-return'];
const expectedChoices = [
  ['save_diary', 'soften_diary', 'delete_diary'], ['perform', 'explain', 'cover'], ['join', 'fake', 'silent'],
  ['overwrite', 'preserve', 'question'], ['challenge', 'quiet', 'celebrate'], ['approved', 'coded', 'original'],
  ['report', 'uncertain', 'defend'], ['connected', 'limited', 'offline'], ['sign', 'refuse', 'witness']
];
const flagValues = { diary: ['saved', 'softened', 'deleted'], exercise: ['perform', 'explain', 'cover'], hate: ['join', 'fake', 'silent'], records: ['overwrite', 'preserve', 'question'], ration: ['challenge', 'quiet', 'celebrate'], keyboard: ['approved', 'coded', 'original'], monitoring: ['connected', 'limited', 'offline'], final: ['sign', 'refuse', 'witness'] };
const freeze = object => { Object.values(object).forEach(value => { if (value && typeof value === 'object') freeze(value); }); return Object.freeze(object); };
const wordCount = text => String(text || '').trim().split(/\s+/).filter(Boolean).length;
const sceneWords = s => wordCount([s.context, ...s.messages.map(m => m.text), s.prompt, ...s.choices.map(c => c.label + ' ' + c.detail)].join(' '));
let routes = 0;
let visited = 0;
let blockedOptions = 0;
let minWords = Infinity;
let maxWords = -Infinity;
let minResultWords = Infinity;
let maxResultWords = -Infinity;
const endings = {};
const signatureEndings = new Set();
const examples = {};
const flagNames = new Set();
const originalSummaries = new Map();

function visit(state, words, route) {
  visited++;
  freeze(state);
  const before = JSON.stringify(state);
  assert(state.score >= 0 && state.score <= 100);
  assert.equal(state.history.length, state.step);
  assert.equal(typeof game.status(state).detail, 'string');
  for (const [flag, values] of Object.entries(flagValues)) if (flag in state.flags) assert(values.includes(state.flags[flag]), `Unexpected ${flag}`);
  if (state.step >= 4) assert.equal(state.flags.evidence, state.flags.records === 'preserve');
  if (state.step === 9) {
    routes++;
    assert.equal(game.scene(state), null);
    const final = game.ending(state);
    assert(final && final.id);
    const expectedBand = game.endingBands.find(band => state.score >= band.min && state.score <= band.max);
    assert.equal(final.id, expectedBand.id);
    assert.equal(final.title, expectedBand.title);
    assert.equal(final.min, expectedBand.min);
    assert.equal(final.max, expectedBand.max);
    assert.equal(final.rangeLabel, expectedBand.min + '–' + expectedBand.max);
    if (state.flags.final === 'sign') signatureEndings.add(final.id);
    for (const key of ['kicker', 'title', 'text', 'sacrificed', 'relationship']) assert.equal(typeof final[key], 'string');
    assert(final.evidence.length >= 2 && final.evidence.length <= 3, 'Every reachable assessment needs two or three recorded contributions.');
    assert.equal(new Set(final.evidence.map(item => item.step)).size, final.evidence.length);
    for (const item of final.evidence) {
      const recorded = state.history.find(entry => entry.step === item.step && entry.choice === item.choice);
      assert(recorded, 'Every evidence row must come from this route.');
      assert.equal(item.label, recorded.label);
      assert.equal(item.delta, recorded.delta);
      assert.notEqual(item.delta, 0, 'Zero or fully clamped changes did not contribute to the score.');
      assert.equal(typeof item.reason, 'string');
      assert(item.reason.length > 0);
      assert(!['save_diary', 'soften_diary', 'delete_diary', 'preserve', 'quiet', 'witness'].includes(item.choice), 'Official evidence must not expose hidden actions through their player-facing labels.');
      if (state.score <= 49) assert(item.delta < 0, 'Low classifications should cite negative contributions.');
      if (state.score >= 80) assert(item.delta > 0, 'Promotion should cite positive contributions.');
    }
    if (final.id === 'surveillance') {
      assert(final.evidence.some(item => item.delta < 0));
      assert(final.evidence.some(item => item.delta > 0));
    }
    assert.equal(JSON.stringify(state), before, 'Assessment must not mutate the completed state.');
    endings[final.id] = (endings[final.id] || 0) + 1;
    if (!examples[final.id]) examples[final.id] = route;
    const totalWords = words + wordCount([final.text, final.sacrificed, final.relationship, ...final.evidence.map(item => item.label + ' ' + item.reason)].join(' '));
    minWords = Math.min(minWords, totalWords);
    maxWords = Math.max(maxWords, totalWords);
    assert.throws(() => game.choose(state, 'sign'));
    assert.deepEqual(game.initialState(), pristine);
    return;
  }
  assert.equal(game.ending(state), null);
  const s = game.scene(state);
  assert(s && s.messages.length && s.context && s.prompt && s.title && s.app && s.time);
  assert.equal(s.type, types[state.step]);
  assert.equal(s.id, types[state.step]);
  assert.deepEqual(s.choices.map(c => c.id), expectedChoices[state.step]);
  assert(s.choices.filter(c => !c.disabled).length >= 2);
  for (const key of ['chapter', 'title', 'original', 'adaptation']) assert.equal(typeof s.connection[key], 'string');
  originalSummaries.set(s.id, s.connection.original);
  if (state.step === 8 && state.flags.monitoring === 'offline') {
    assert.equal(s.messages[0].sender, 'Paper notice');
    assert.equal(s.messages[1].sender, 'Winston · private thought');
    assert(s.app.includes('Local Notes'));
  }
  assert.throws(() => game.choose(state, 'invalid-choice'));
  for (const c of s.choices) {
    if (c.disabled) {
      blockedOptions++;
      assert(c.reason);
      assert.throws(() => game.choose(state, c.id));
      continue;
    }
    const next = game.choose(state, c.id);
    assert.equal(JSON.stringify(state), before, 'choose must not mutate its input.');
    assert.notEqual(next.flags, state.flags);
    assert.notEqual(next.history, state.history);
    assert.equal(next.step, state.step + 1);
    assert.equal(next.history.at(-1).delta, next.score - state.score);
    assert.equal(next.result.delta, next.score - state.score);
    assert.equal(next.history.at(-1).label, c.label);
    for (const key of ['title', 'text', 'connection']) assert.equal(typeof next.result[key], 'string');
    if (state.step === 0) assert.equal(next.score, state.score, 'An undiscovered private diary choice must not affect loyalty.');
    if (c.id === 'preserve') assert.equal(next.score, game.choose(state, 'overwrite').score, 'Undiscovered preservation must get the same visible work credit.');
    if (c.id === 'quiet') assert.equal(next.score, state.score, 'Undiscovered private conversation must not affect loyalty.');
    const resultWords = wordCount(next.result.text);
    minResultWords = Math.min(minResultWords, resultWords);
    maxResultWords = Math.max(maxResultWords, resultWords);
    Object.keys(next.flags).forEach(f => flagNames.add(f));
    visit(next, words + sceneWords(s) + resultWords, [...route, c.id]);
  }
}
visit(game.initialState(), 0, []);
assert.equal(Object.keys(endings).length, 4);
assert(blockedOptions > 0);
assert.equal(signatureEndings.size, 4, 'Signing must not override the final-score classification.');
const originalSummaryWords = [...originalSummaries.values()].reduce((total, text) => total + wordCount(text), 0);
assert(originalSummaryWords <= 200, 'Keep the original-scene summaries concise.');
assert(minResultWords >= 55 && maxResultWords <= 80, 'Consequences should remain within the requested reading length.');

function play(choices) { return choices.reduce((state, id) => game.choose(state, id), game.initialState()); }
const opening = game.scene(game.initialState());
assert(opening.messages.some(m => m.text.includes('30 grams to 20 grams')));
const savedDiary = game.choose(game.initialState(), 'save_diary');
assert.equal(savedDiary.score, pristine.score);
assert(savedDiary.result.text.includes('Automatic backup is pending'));
assert(savedDiary.result.text.includes('no upload has happened yet'));
assert(opening.connection.adaptation.includes('pending-sync warning is invented'));
const recordState = play(['save_diary', 'perform', 'fake']);
const recordScene = game.scene(recordState);
assert(recordScene.messages.some(m => m.text.includes('Reported boot production: 62 million') && m.text.includes('145 million') && m.text.includes('57 million') && m.text.includes('independently verified')));
const rationState = game.choose(recordState, 'preserve');
assert.equal(rationState.flags.evidence, true);
assert(game.scene(rationState).messages.some(m => m.text.includes('increase to 20 grams')));
const keyboardPreview = game.scene(game.choose(rationState, 'quiet'));
assert(keyboardPreview.messages.some(m => m.text.includes('Preview: “bad” becomes “ungood”; “excellent” becomes “doubleplusgood.”') && m.text.includes('Installation awaits your choice')));
const reported = play(['save_diary', 'perform', 'fake', 'preserve', 'quiet', 'coded', 'report']);
assert(game.scene(reported).choices.find(c => c.id === 'limited').disabled);
const trusting = play(['save_diary', 'perform', 'fake', 'preserve', 'quiet', 'coded', 'defend']);
assert(!game.scene(trusting).choices.find(c => c.id === 'limited').disabled);
const compliant = play(['delete_diary', 'perform', 'join', 'overwrite', 'celebrate', 'approved', 'report', 'connected', 'sign']);
assert.equal(game.ending(compliant).id, 'inner-party');
const lateSignature = play(['save_diary', 'cover', 'silent', 'question', 'challenge', 'original', 'defend', 'offline', 'sign']);
assert.equal(game.ending(lateSignature).id, 'vaporized');
const hiddenCopyPath = ['save_diary', 'perform', 'join', 'overwrite', 'celebrate', 'coded', 'uncertain', 'offline', 'sign'];
const withoutHiddenCopy = play(hiddenCopyPath);
hiddenCopyPath[3] = 'preserve';
const withHiddenCopy = play(hiddenCopyPath);
assert.equal(withoutHiddenCopy.score, withHiddenCopy.score);
assert.equal(game.ending(withoutHiddenCopy).id, game.ending(withHiddenCopy).id, 'A secret original must not change the official review outcome.');
const expectedBands = [
  { id: 'vaporized', title: 'You have been vaporized.', min: 0, max: 24, label: 'Vaporized' },
  { id: 'reeducation', title: 'You have been sent for re-education.', min: 25, max: 49, label: 'Re-education' },
  { id: 'surveillance', title: 'You remain under surveillance.', min: 50, max: 79, label: 'Surveillance' },
  { id: 'inner-party', title: 'You have been promoted to the Inner Party.', min: 80, max: 100, label: 'Inner Party' }
];
assert.deepEqual(game.endingBands, expectedBands);
for (let score = 0; score <= 100; score++) {
  const expected = expectedBands.find(band => score >= band.min && score <= band.max);
  for (const variant of [
    { flags: {}, trust: 0, courage: 0, privacy: 0 },
    { flags: { final: 'sign', reported: true, monitoring: 'connected', diary: 'deleted', evidence: false }, trust: -10, courage: -10, privacy: -10 },
    { flags: { final: 'witness', reported: false, monitoring: 'offline', diary: 'saved', evidence: true }, trust: 10, courage: 10, privacy: 10 },
    { flags: { final: 'refuse', reported: false, monitoring: 'limited', records: 'question' }, trust: 1, courage: 1, privacy: 1 }
  ]) {
    const assessment = game.ending({ ...game.initialState(), ...variant, step: 9, score });
    assert.equal(assessment.id, expected.id, 'All scores 0–100 must classify independently of flags and hidden metrics.');
    assert.equal(assessment.title, expected.title);
  }
}
const reset = game.initialState();
reset.flags.changed = true;
reset.history.push({});
assert.deepEqual(game.initialState(), pristine);
console.log(JSON.stringify({ passed: true, visitedStates: visited, completeRoutes: routes, decisionsPerRoute: 9, endings, signatureEndings: [...signatureEndings], visibleStoryWords: { min: minWords, max: maxWords }, consequenceWords: { min: minResultWords, max: maxResultWords }, originalSummaryWords, branchFlags: [...flagNames], examples }, null, 2));
