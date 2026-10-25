'use strict';
const assert = require('node:assert/strict');
const game = require('../docs/social-story.js');
const initial = game.initialState();
const sceneIds = ['join', 'personalize', 'activity', 'shop', 'post', 'thread', 'settings', 'evening'];
const responseValues = ['like', 'save', 'skip'];
const actionSets = [];
for (const trail of responseValues) for (const art of responseValues) for (const music of responseValues) actionSets.push({ trail, art, music });
const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};
const clone = value => JSON.parse(JSON.stringify(value));
const words = value => String(value || '').trim().split(/\s+/).filter(Boolean).length;
let visited = 0;
let routes = 0;
let outsideRoutes = 0;
let reducedRoutes = 0;
let linkedRoutes = 0;
let minimumWords = Infinity;
let maximumWords = -Infinity;
const completionExamples = {};

function invariant(state) {
  assert.equal(state.history.length, state.step);
  assert.equal(state.playerName, 'Alex', 'Default routes retain the backwards-compatible name.');
  assert(!Object.prototype.hasOwnProperty.call(state, 'score'), 'The contemporary story has no loyalty or morality score.');
  assert(['friends', 'close'].includes(state.audience));
  if (state.account === false) {
    assert.equal(state.contactsSynced, false);
    assert.equal(state.permissions.partnerActivity, false);
    for (const key of ['explicitData', 'inferredInterests', 'partnerEvents']) assert.equal(state[key].length, 0, 'Outside route must not upload or infer an account profile: ' + key);
    assert(state.activity.every(item => !item.retained));
    assert(state.adChanges.every(item => !item.linked));
  }
  for (const interest of state.inferredInterests) {
    assert.equal(interest.uncertain, true);
    assert.equal(state.account, true);
    assert(state.activity.some(action => action.card === interest.sourceCard && action.action === interest.sourceAction && action.retained && action.action !== 'skip'));
    assert(interest.detail.includes('Possible interest'));
  }
  if (state.step >= 3) {
    assert.equal(state.activity.length, 3);
    assert.equal(state.inferredInterests.length, state.activity.filter(action => action.retained).length);
    assert(state.activity.filter(action => action.action === 'skip').every(action => !action.retained));
  }
  const choices = Object.fromEntries(state.history.map(item => [item.scene, item.choice]));
  const permittedAtShop = state.account === true && choices.personalize === 'allow';
  const expectedHeadphoneEvent = permittedAtShop && choices.shop === 'visit';
  const expectedSupplyEvent = permittedAtShop && choices.settings === 'keep' && choices.evening === 'attend';
  assert.equal(state.partnerEvents.some(item => item.product === 'headphones'), Boolean(expectedHeadphoneEvent));
  assert.equal(state.partnerEvents.some(item => item.product === 'event-supplies'), Boolean(expectedSupplyEvent));
  for (const ad of state.adChanges) {
    assert.equal(typeof ad.linked, 'boolean');
    if (ad.linked) assert(state.partnerEvents.some(event => event.step === ad.step && event.product === ad.product));
    else assert.equal(ad.product, 'cafe');
  }
  if (state.flags.settings === 'reduce') {
    assert.equal(state.permissions.partnerActivity, false);
    assert.equal(state.audience, 'close');
    assert(!state.partnerEvents.some(event => event.step > state.flags.reducedAtStep));
  }
  if (state.flags.evening === 'quiet' || state.flags.evening === 'reminder') {
    assert(!state.adChanges.some(ad => ad.step === 7), 'No new ad impression when no evening browsing occurred.');
    assert(!state.partnerEvents.some(event => event.step === 7));
  }
  if (state.postingDecisions.length) {
    const post = state.postingDecisions[0];
    assert.equal(post.original, game.DRAFT);
    if (post.action === 'withhold') {
      assert.equal(post.published, false);
      assert.equal(post.text, null);
      assert.equal(post.audience, 'none');
    } else {
      assert.equal(post.published, true);
      assert.equal(post.text, post.action === 'revise' ? game.REVISION : game.DRAFT);
      assert.equal(post.audience, post.action === 'close' ? 'close' : 'friends');
    }
  }
}

function visit(state, routeWordCount) {
  visited++;
  freeze(state);
  const before = JSON.stringify(state);
  invariant(state);
  const current = game.scene(state);
  if (state.step === game.TOTAL_STEPS) {
    routes++;
    assert.equal(current, null);
    assert.throws(() => game.choose(state, 'attend'));
    const p = game.profile(state);
    assert.equal(p.title, 'Your Digital Profile');
    assert.equal(p.playerName, state.playerName);
    const mapping = { shared: 'explicitData', interests: 'inferredInterests', partnerActivity: 'partnerEvents', feed: 'feedChanges', ads: 'adChanges', posts: 'postingDecisions', privacy: 'privacyChoices', social: 'socialChoices' };
    for (const [profileKey, stateKey] of Object.entries(mapping)) {
      assert.deepEqual(p[profileKey], state[stateKey], 'Profile must use actual route data.');
      assert.notEqual(p[profileKey], state[stateKey], 'Profile must not expose mutable state arrays.');
    }
    assert.deepEqual(p.activity, state.activity.filter(action => action.retained));
    if (!state.account) {
      outsideRoutes++;
      for (const key of ['shared', 'activity', 'interests', 'partnerActivity']) assert.equal(p[key].length, 0);
    }
    if (state.flags.settings === 'reduce') reducedRoutes++;
    if (state.partnerEvents.length) linkedRoutes++;
    assert.equal(JSON.stringify(state), before);
    assert.deepEqual(game.initialState(), initial, 'Replay must produce the same clean state after every path.');
    minimumWords = Math.min(minimumWords, routeWordCount);
    maximumWords = Math.max(maximumWords, routeWordCount);
    const category = !state.account ? 'outside' : state.partnerEvents.length === 2 ? 'twoLinkedVisits' : state.flags.settings === 'reduce' && state.partnerEvents.length === 1 && state.flags.evening === 'attend' ? 'stoppedFutureVisit' : state.partnerEvents.length === 1 ? 'oneLinkedVisit' : 'noLinkedVisits';
    if (!completionExamples[category]) completionExamples[category] = state.history.map(item => ({ id: item.choice, ...(item.actions ? { actions: item.actions } : {}) }));
    return;
  }
  assert.equal(current.id, sceneIds[state.step]);
  for (const key of ['time', 'title', 'context', 'prompt']) assert.equal(typeof current[key], 'string');
  assert(Array.isArray(current.messages));
  assert(current.choices.length > 0);
  assert.equal(new Set(current.choices.map(item => item.id)).size, current.choices.length);
  assert.throws(() => game.choose(state, 'invalid-choice'));
  if (state.account === false && current.id === 'personalize') assert(current.choices.find(item => item.id === 'allow').disabled);
  const sceneWordCount = words([current.context, ...current.messages.map(item => item.text), current.prompt, ...current.choices.map(item => item.label + ' ' + item.detail)].join(' '));
  for (const choice of current.choices) {
    if (choice.disabled) {
      assert(choice.reason);
      assert.throws(() => game.choose(state, choice.id));
      continue;
    }
    const payloads = current.id === 'activity' ? actionSets.map(actions => ({ actions })) : [{}];
    for (const payload of payloads) {
      freeze(payload);
      const originalPayload = JSON.stringify(payload);
      const next = game.choose(state, choice.id, payload);
      assert.equal(JSON.stringify(payload), originalPayload);
      assert.equal(JSON.stringify(state), before, 'A choice must not mutate the prior state.');
      assert.equal(next.step, state.step + 1);
      assert.notEqual(next.history, state.history);
      assert.equal(next.history.at(-1).choice, choice.id);
      assert.equal(next.history.at(-1).step, state.step);
      for (const key of ['title', 'text']) assert.equal(typeof next.result[key], 'string');
      if (current.id === 'post' || current.id === 'thread') {
        for (const key of ['permissions', 'explicitData', 'activity', 'inferredInterests', 'partnerEvents', 'feedChanges', 'adChanges']) assert.deepEqual(next[key], state[key], 'Speech must not be punished through inferred interests or advertising: ' + key);
      }
      if (current.id === 'settings') {
        for (const key of ['explicitData', 'activity', 'inferredInterests', 'partnerEvents', 'feedChanges', 'adChanges', 'postingDecisions']) assert.deepEqual(next[key], state[key], 'Privacy review must not retroactively erase/change records: ' + key);
        if (choice.id === 'keep') assert.deepEqual(next.permissions, state.permissions, 'Keep must never silently enable a setting.');
      }
      visit(next, routeWordCount + sceneWordCount + words(next.result.text) + words(next.result.notification));
    }
  }
}
visit(game.initialState(), 0);
assert.equal(routes, 25920);
assert(outsideRoutes > 0 && reducedRoutes > 0 && linkedRoutes > 0);

function play(sequence, name) {
  return sequence.reduce((state, item) => typeof item === 'string' ? game.choose(state, item) : game.choose(state, item.id, item.payload), game.initialState(name));
}
const preActivity = play(['manual', 'decline']);
const badPayloads = [undefined, null, {}, { actions: null }, { actions: {} }, { actions: [] }, { actions: { trail: 'like', art: 'save' } }, { actions: { trail: 'like', art: 'save', music: 'unknown' } }, { actions: { trail: 'like', art: 'save', music: 'skip', extra: 'like' } }];
for (const payload of badPayloads) assert.throws(() => game.choose(preActivity, 'browse', payload));
const allSkip = game.choose(preActivity, 'browse', { actions: { trail: 'skip', art: 'skip', music: 'skip' } });
assert.equal(allSkip.inferredInterests.length, 0);
assert.equal(game.profile(allSkip).activity.length, 0);
const allLikeOutside = play(['outside', 'decline', { id: 'browse', payload: { actions: { trail: 'like', art: 'like', music: 'like' } } }, 'visit', 'publish', 'context', 'reduce', 'attend']);
assert.equal(allLikeOutside.account, false);
assert.equal(allLikeOutside.partnerEvents.length, 0);
assert.equal(allLikeOutside.inferredInterests.length, 0);
assert.equal(allLikeOutside.postingDecisions[0].channel, 'Maya’s text relay');
const twoVisits = play(['sync', 'allow', { id: 'browse', payload: { actions: { trail: 'like', art: 'save', music: 'skip' } } }, 'visit', 'revise', 'private', 'keep', 'attend']);
assert.equal(twoVisits.partnerEvents.length, 2);
const reduced = play(['sync', 'allow', { id: 'browse', payload: { actions: { trail: 'like', art: 'save', music: 'skip' } } }, 'visit', 'publish', 'private', 'reduce', 'attend']);
assert.equal(reduced.partnerEvents.length, 1);
assert.equal(reduced.adChanges.at(-1).linked, false);
assert.equal(reduced.contactsSynced, true);
assert.equal(reduced.inferredInterests.length, 2);
assert.equal(reduced.postingDecisions[0].audience, 'friends', 'Changing the next audience must not rewrite the original post audience.');
const newGame = game.initialState();
newGame.history.push({}); newGame.permissions.partnerActivity = true; newGame.flags.changed = true;
assert.deepEqual(game.initialState(), initial);

// Names are plain local story data. Rendering escapes them at the UI boundary.
assert.equal(game.normalizePlayerName(' \t\n '), '');
assert.equal(game.normalizePlayerName(null), '');
assert.equal(game.normalizePlayerName(undefined), '');
assert.equal(game.normalizePlayerName('  A\u0000  B\t C\u007f '), 'A B C');
assert.equal(game.initialState(' \n ').playerName, 'Alex');
assert.equal(game.initialState().playerName, 'Alex');
assert.equal(game.normalizePlayerName('🌿'.repeat(41)), '🌿'.repeat(40));
assert.equal(Array.from(game.initialState('🌿'.repeat(41)).playerName).length, 40);
const nameCases = [
  { input: '  지민   O’Connor\n🌿 ', expected: '지민 O’Connor 🌿' },
  { input: "  D’Arcy  O'Neil  ", expected: "D’Arcy O'Neil" },
  { input: '<img src=x onerror=alert(1)>', expected: '<img src=x onerror=alert(1)>' }
];
const namedActions = { id: 'browse', payload: { actions: { trail: 'like', art: 'save', music: 'skip' } } };
for (const { input, expected } of nameCases) {
  const namedStart = game.initialState(input);
  assert.equal(namedStart.playerName, expected);
  assert(game.scene(namedStart).context.includes(expected + ', a 16-year-old student.'));
  const connected = play(['sync', 'allow', namedActions, 'visit', 'publish', 'context', 'keep', 'attend'], input);
  const connectedProfile = game.profile(connected);
  assert.equal(connected.playerName, expected);
  assert.equal(connectedProfile.playerName, expected);
  assert.equal(connected.explicitData[0].label, expected + '’s basic profile');
  assert(connected.explicitData[0].detail.startsWith(expected + ', age 16, student;'));
  assert(connected.partnerEvents.every(event => event.detail.includes(expected + '’s account')));
  assert(connected.privacyChoices.find(item => item.id === 'partner-choice').detail.includes(expected));
  assert(connectedProfile.summary.startsWith(expected + '’s day'));
  assert(!JSON.stringify(connected).includes('Alex'), 'No default-name remnants may appear in a named playthrough.');
  const declined = play(['manual', 'decline', namedActions, 'visit'], input);
  assert(declined.result.text.includes(expected + '’s account'));
  const outsideNamed = play(['outside', 'decline', namedActions, 'visit', 'publish', 'private', 'reduce', 'quiet'], input);
  assert(outsideNamed.postingDecisions[0].detail.includes('No account for ' + expected + ' was created.'));
  assert(game.profile(outsideNamed).summary.startsWith(expected + ' stayed outside Instagram.'));
  assert.equal(game.profile(outsideNamed).playerName, expected);
  assert(!JSON.stringify(outsideNamed).includes('Alex'));
  assert.deepEqual(game.initialState(), initial, 'Reset must discard the previous custom name.');
}
console.log(JSON.stringify({ passed: true, statesVisited: visited, completeRoutes: routes, decisionsPerRoute: 8, outsideRoutes, reducedRoutes, routesWithLinkedVisits: linkedRoutes, engineWordsWithoutWidgetsOrProfile: { min: minimumWords, max: maximumWords }, completionExamples }, null, 2));
