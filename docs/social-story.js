(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.SocialDay = api;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';
  const TOTAL_STEPS = 8;
  const DRAFT = 'Our class fundraiser could be fun without an expensive dress code.';
  const REVISION = 'Could we offer a lower-cost dress-code option for the fundraiser?';
  const activityCards = [
    { id: 'trail', title: 'A walk before the weekend', text: 'A riverside route with room to slow down.', category: 'Outdoor activities' },
    { id: 'art', title: 'Make the fundraiser poster', text: 'An open studio with materials and a spare seat.', category: 'Creative workshops' },
    { id: 'music', title: 'Eli’s after-school playlist', text: 'Three songs for setting up the courtyard.', category: 'Music' }
  ];
  const copy = value => JSON.parse(JSON.stringify(value));
  const m = (sender, text, kind = 'friend') => ({ sender, text, kind });
  const c = (id, label, detail, reason) => ({ id, label, detail, ...(reason ? { disabled: true, reason } : {}) });
  const entry = (id, label, detail, extra = {}) => ({ id, label, detail, ...extra });

  function initialState() {
    return {
      step: 0, account: null, contactsSynced: false,
      permissions: { partnerActivity: false }, audience: 'friends',
      explicitData: [], activity: [], inferredInterests: [], partnerEvents: [],
      feedChanges: [], adChanges: [], postingDecisions: [], privacyChoices: [],
      socialChoices: [], history: [], flags: {}
    };
  }

  function scene(state) {
    if (!Number.isInteger(state.step) || state.step < 0 || state.step >= TOTAL_STEPS) return null;
    const outside = state.account === false;
    const scenes = [
      () => ({ id: 'join', time: '07:18', title: 'Everyone is already there.',
        context: 'Maya and Eli are organizing the class fundraiser through Loop. You are Alex, an 18-year-old student.',
        messages: [m('Maya', 'The plan is in our Loop group. Join us? I can text you updates too.'), m('Eli', 'The playlist vote is there. Finding everyone is easier with contact matching.')],
        prompt: 'How will you join the conversation?',
        choices: [c('sync', 'Join and sync contacts', 'Find Maya and Eli automatically.'), c('manual', 'Join without syncing', 'Find your friends by name.'), c('outside', 'Stay with text messages', 'Ask Maya to relay updates.')],
        connectionKey: 'monitoring', researchKey: 'contacts' }),
      () => ({ id: 'personalize', time: '08:05', title: 'An easier “For you.”',
        context: outside ? 'You are viewing a public preview. There is no Loop account to connect to shopping activity.' : 'The main button promises more relevant suggestions. The optional setting is separate from messaging.',
        messages: [m('Loop', outside ? 'Account-linked personalization is unavailable in this preview. Continuing will not create an account.' : 'Allow future partner-shop visits to be associated with your account? You can still message friends if you decline.', 'system')],
        prompt: 'Choose how this fictional setting works.',
        choices: [c('allow', 'Allow optional partner use', 'Connect later shop visits for relevant ads.', outside ? 'No Loop account exists. This choice cannot silently create one.' : null), c('decline', outside ? 'Continue without an account' : 'Keep optional partner use off', outside ? 'Keep the preview unlinked.' : 'Keep messaging and ordinary recommendations.')],
        connectionKey: 'monitoring', researchKey: 'personalization' }),
      () => ({ id: 'activity', time: '10:20', title: 'A pattern from small actions.',
        context: outside ? 'Maya sends a public preview. Your responses here stay local and create no Loop interest profile.' : 'A useful feed starts with ordinary choices. You have not entered a list of interests.',
        messages: [], cards: copy(activityCards), prompt: 'Choose one response on each of the three cards.',
        choices: [c('browse', 'Continue with these choices', 'Likes and saves can become clues; skips add no interest in this game.')],
        connectionKey: 'monitoring', researchKey: 'behavior' }),
      () => ({ id: 'shop', time: '11:50', title: 'A product, then a feed.',
        context: 'Eli shares a simulated Soundroom listing. Opening the preview is optional; no real store or purchase is involved.',
        messages: [m('Eli', 'Arc headphones, $49. Could be useful for the commute. Want to look?')],
        prompt: 'Open the product page or keep going?',
        choices: [c('visit', 'Visit the simulated shop', 'View the Arc headphones listing.'), c('skip', 'Skip the shopping link', 'Return directly to the feed.')],
        connectionKey: 'monitoring', researchKey: 'ads' }),
      () => ({ id: 'post', time: '12:30', title: 'Who might read this?',
        context: outside ? 'You draft a text for Maya. She can share it with the group only if you choose.' : 'The fundraiser’s dress-code discussion reaches your feed. You have a harmless opinion, and a mixed audience.',
        messages: [m('Maya', 'I agree about keeping costs down. Some organizers might take the wording personally.')],
        prompt: 'What happens to your draft?',
        choices: [c('publish', outside ? 'Let Maya share it' : 'Publish as written', 'Keep your exact words for the wider group.'), c('close', 'Limit it to Maya and Eli', 'Keep the original words; reduce the initial audience.'), c('revise', 'Soften and share it', 'Ask about a lower-cost option instead.'), c('withhold', 'Keep it unpublished', 'Do not send or publish the draft.')],
        connectionKey: 'expression', researchKey: 'audience' }),
      () => ({ id: 'thread', time: '14:10', title: 'The thread moves faster.',
        context: outside ? 'Maya texts you a preview of replies to Eli. You can respond through her relay.' : 'Eli posts about the fundraiser’s cost. Replies treat it as an attack on the organizers.',
        messages: [m('Maya', state.flags.post === 'withhold' ? 'You stayed out of the earlier debate. This one is getting personal.' : 'Nobody has asked what Eli meant yet. Everyone seems certain.')],
        prompt: 'How will you respond to the pile-on?',
        choices: [c('pile_on', outside ? 'Agree with the criticism by text' : 'Join the criticism', 'Repeat the assumption that Eli is ungrateful.'), c('context', 'Ask what Eli meant', 'Make room for an explanation.'), c('private', 'Support Eli privately', 'Check in without entering the thread.'), c('disengage', 'Leave the thread', 'Protect your attention. Leave it unresolved.')],
        connectionKey: 'crowd' }),
      () => ({ id: 'settings', time: '15:30', title: 'A boundary that works.',
        context: outside ? 'You still have no Loop account. You can also ask Maya to keep future relay messages within your close circle.' : 'Before the event, you review what is optional and what has already happened.',
        messages: [m('Loop', outside ? 'No account-linked history exists. The preview has not created an account or uploaded your responses.' : 'Turn off future partner association and limit the next post’s audience. Earlier records and published posts will remain.', 'system')],
        prompt: 'Which settings will you carry forward?',
        choices: [c('reduce', outside ? 'Keep the relay close' : 'Reduce optional sharing', outside ? 'No account; ask before forwarding beyond Maya and Eli.' : 'Partner use off. Next audience: close friends.'), c('keep', 'Keep the current choices', 'Preserve the settings you actually selected.')],
        connectionKey: 'monitoring', researchKey: 'settings' }),
      () => ({ id: 'evening', time: '16:05', title: 'You still have a place.',
        context: outside ? 'Maya sends the final courtyard plan by text. Staying outside Loop has not cancelled your invitation.' : 'The updated plan is easy to find in the group. The data choices are still yours to change next time.',
        messages: [m(outside ? 'Maya · text' : 'Maya · Loop', 'Courtyard, 4:30. Bring what you can. The supply listing has snack ideas, but you don’t need to buy anything.')],
        prompt: 'What is useful for the rest of your day?',
        choices: [c('attend', 'Open supplies and RSVP', 'View a simulated shop listing; tell Maya you’re coming.'), c('reminder', 'Set a local reminder', 'Keep the time handy without opening the shop.'), c('quiet', 'Keep the evening offline', 'Use the details you already have; no new shop visit.')],
        connectionKey: 'monitoring', researchKey: 'settings' })
    ];
    return scenes[state.step]();
  }

  function addAd(state, id, product, visited, step) {
    const linked = Boolean(visited && state.account && state.permissions.partnerActivity);
    if (linked) state.partnerEvents.push(entry(id + '-event', product === 'headphones' ? 'Soundroom product visit' : 'Event-supply product visit', product === 'headphones' ? 'The Arc headphones visit was associated with Alex’s account while optional partner use was on.' : 'The later supply-shop visit was associated with Alex’s account because optional partner use was still on.', { product, step, usedForAds: true }));
    state.adChanges.push(entry(id + '-ad', linked ? (product === 'headphones' ? 'Arc headphones: a related ad' : 'Event supplies: a related ad') : 'Community café: a contextual ad', linked ? 'This fictional ad uses the permitted partner visit. The match is explained by that event, not by private speech.' : visited ? 'The shop visit was not associated with a Loop account. This general event-page ad does not use that visit.' : 'No shop visit occurred. This general event-page ad does not come from a shopping event.', { linked, product: linked ? product : 'cafe', step }));
    return linked;
  }

  function choose(state, id, payload = {}) {
    const current = scene(state);
    if (!current) throw new Error('This day is complete. Start a new day to make another choice.');
    const selected = current.choices.find(choice => choice.id === id);
    if (!selected) throw new Error('Unknown choice for this scene.');
    if (selected.disabled) throw new Error(selected.reason);
    if (id === 'browse') {
      const a = payload && payload.actions;
      if (!a || typeof a !== 'object' || Array.isArray(a) || Object.keys(a).length !== 3 || activityCards.some(card => !Object.prototype.hasOwnProperty.call(a, card.id) || !['like', 'save', 'skip'].includes(a[card.id]))) throw new Error('Choose like, save, or skip for each of trail, art, and music.');
    }
    const next = copy(state);
    const outside = next.account === false;
    let result;
    const outcome = (title, text, notification) => { result = { title, text, ...(notification ? { notification } : {}) }; };
    switch (current.id) {
      case 'join':
        next.account = id !== 'outside'; next.contactsSynced = id === 'sync'; next.flags.join = id;
        if (next.account) next.explicitData.push(entry('account', 'Alex’s basic profile', 'Alex, age 18, student; membership in the class fundraiser group. These are fictional signup details.'));
        if (id === 'sync') {
          next.explicitData.push(entry('contacts', 'Contact matching', 'The story’s fictional address-book entries for Maya and Eli were shared with Loop.'));
          outcome('Your people appear.', 'Loop finds Maya and Eli immediately. The group plan and playlist vote are one tap away. The shortcut also places the fictional contact list in Loop’s record. That exchange feels small because the benefit arrives first.', 'Maya: Found you! The plan is pinned.');
        } else if (id === 'manual') {
          next.privacyChoices.push(entry('no-contacts', 'Contacts not uploaded', 'You joined by manually finding Maya and Eli. The address book was not shared.'));
          outcome('One extra search.', 'You find Maya and Eli by name, then open the same group plan. Contact matching would have saved a step, but declining it has not removed the conversation. Your basic profile exists; the address book stays out.', 'Eli: You’re in. Vote whenever you want.');
        } else {
          next.privacyChoices.push(entry('outside', 'No Loop account', 'Maya relays plans by text. Preview responses do not upload an account profile.'));
          next.socialChoices.push(entry('relay', 'Maya’s text relay', 'You still receive invitations, although Maya must forward updates and you cannot vote directly in Loop.'));
          outcome('A different route in.', 'Maya agrees to text important changes. You remain invited, though the live playlist vote is less convenient to follow. Public previews can show you the conversation without creating an account or attaching a profile to your browsing.', 'Maya: I’ll send the final time. You’re still coming, right?');
        }
        break;
      case 'personalize':
        next.permissions.partnerActivity = id === 'allow' && next.account === true;
        next.privacyChoices.push(entry('partner-choice', next.permissions.partnerActivity ? 'Optional partner use allowed' : 'Optional partner use declined', next.permissions.partnerActivity ? 'Future simulated partner-shop visits may be associated with Alex’s account for related ads.' : 'Future partner visits remain unassociated unless this option is later enabled. This is Loop’s fictional rule.'));
        outcome(next.permissions.partnerActivity ? 'A useful shortcut, with a link.' : 'The choice takes effect.', next.permissions.partnerActivity ? 'Future participating-shop visits can help Loop select relevant ads. You did not need this permission to message friends. A convenient suggestion may now carry information from a different app into the same account.' : outside ? 'The preview stays unlinked. No account or partner permission has been created. Maya’s messages still get through by text; you have accepted some extra coordination rather than an automatic signup.' : 'Optional partner association stays off. Messaging still works, and likes or saves inside Loop can still shape recommendations. The boundary is specific: it limits this extra connection, not every kind of activity the app can observe.');
        break;
      case 'activity': {
        const actions = payload.actions;
        activityCards.forEach(card => {
          const action = actions[card.id];
          const retained = next.account === true && action !== 'skip';
          next.activity.push(entry(card.id, action[0].toUpperCase() + action.slice(1) + ': ' + card.title, retained ? 'Loop retained this chosen in-app action. It is an observation, not a statement of identity.' : outside ? 'Local preview response only; not uploaded to Loop.' : 'Skipped. No interest is inferred from this skip in the simulation.', { card: card.id, action, retained, scope: retained ? 'Loop account' : 'local simulation' }));
          if (retained) {
            next.inferredInterests.push(entry(card.id, card.category, 'Possible interest inferred from a ' + action + ' on “' + card.title + '.” The action could have another explanation.', { uncertain: true, sourceCard: card.id, sourceAction: action }));
            next.feedChanges.push(entry(card.id + '-recommendation', 'More ' + card.category.toLowerCase() + ' recommendations', 'This feed now brings similar cards forward because you chose to ' + action + ' the ' + card.id + ' post.'));
          }
        });
        if (!next.inferredInterests.length) next.feedChanges.push(entry('general-feed', 'A general event feed', outside ? 'The unlinked preview stays general. No account interests were inferred from its local responses.' : 'You skipped all three cards. No interest tags were added; the feed keeps its general mix.'));
        outcome(next.inferredInterests.length ? 'A guess takes shape.' : 'No new interest guesses.', next.inferredInterests.length ? 'Similar posts move forward in your feed. They may be useful, but the categories remain guesses: saving a poster could mean helping Maya, not loving art. A profile can grow from ordinary actions without you ever typing an interest list.' : outside ? 'You explored the preview without sending those responses to a Loop account. Its general feed remains unchanged. The simulation remembers your choices only so you can review this day.' : 'Skipping the cards adds no interest categories in this simulation. Loop still offers a general feed. Choosing less did not block the event plan or require you to invent preferences.');
        next.flags.actions = copy(actions);
        break;
      }
      case 'shop': {
        const visited = id === 'visit'; next.flags.shopVisited = visited;
        const linked = addAd(next, 'headphones', 'headphones', visited, state.step);
        outcome(linked ? 'The product returns.' : 'No shopping link is made.', linked ? 'Back in Loop, Arc headphones appear in an ad. This time there is a specific explanation: the simulated Soundroom visit was associated with your account under the optional setting. A similar ad alone would not prove the same mechanism elsewhere.' : visited ? 'You viewed the headphones, then saw a general café ad. Loop did not associate the shop visit with Alex’s account in this playthrough. Your permission choice genuinely changed the mechanism; it did not make all advertising disappear.' : 'You never opened the product page, so there is no headphone visit to connect. A general café ad appears beside the event content. Not every ad match or coincidence demonstrates cross-app tracking.');
        break;
      }
      case 'post': {
        next.flags.post = id;
        const audience = id === 'close' ? 'close' : 'friends';
        if (id === 'close') next.audience = 'close';
        const text = id === 'revise' ? REVISION : DRAFT;
        const channel = outside ? 'Maya’s text relay' : 'Loop';
        const labels = { publish: 'Original opinion shared', close: 'Original opinion limited', revise: 'Opinion revised before sharing', withhold: 'Opinion withheld' };
        const details = {
          publish: outside ? 'With your permission, Maya relayed the exact draft to the class group. No Alex account was created.' : 'The exact draft went to your friends list, including classmates and family.',
          close: outside ? 'The original wording stayed in texts with Maya and Eli; Maya was asked not to relay it to the class group.' : 'The original wording went only to Maya and Eli. This limits initial recipients, not possible screenshots.',
          revise: 'You replaced “' + DRAFT + '” with “' + REVISION + '” before ' + (outside ? 'asking Maya to relay it to the class group.' : 'sharing with friends, classmates, and family.'),
          withhold: 'The draft was neither sent nor published. This private decision is only in your local playthrough record.'
        };
        next.postingDecisions.push(entry('fundraiser-opinion', labels[id], details[id], { action: id, original: DRAFT, text: id === 'withhold' ? null : text, audience: id === 'withhold' ? 'none' : audience, channel: id === 'withhold' ? 'local draft' : channel, published: id !== 'withhold' }));
        if (id === 'close') next.privacyChoices.push(entry('post-audience', 'A smaller initial audience', 'You kept the draft’s words but limited its recipients to Maya and Eli.'));
        const response = {
          publish: 'Your opinion reaches the wider group. Maya agrees; an organizer asks whether you are criticizing their effort. The same sentence can mean different things to different readers. Loop does not change your ads because you expressed this opinion.',
          close: 'Maya and Eli receive the original words. You get a useful conversation without addressing the whole group. The organizers do not receive this post directly, though nobody can promise it will never be repeated.',
          revise: 'The gentler question gets a practical reply about cheaper options. It also removes some of the frustration you wanted to express. Anticipating an audience has changed your wording without any platform penalty or instruction to do so.',
          withhold: 'Nothing is posted, and no audience sees the draft. You avoid an awkward exchange, but the opinion does not enter the discussion. This is a choice shaped by expected reactions, not evidence that an ad system punished disagreement.'
        };
        outcome(labels[id] + '.', response[id]);
        break;
      }
      case 'thread': {
        next.flags.thread = id;
        const rows = {
          pile_on: ['Criticism amplified', outside ? 'You repeated the assumption to Maya by text. You did not post in Loop.' : 'You added agreement to the public criticism of Eli before asking for context.'],
          context: ['Context requested', outside ? 'Maya relayed your request for context. Eli explained that he meant cost, not anyone’s effort.' : 'You asked what Eli meant. He explained that he meant cost, not anyone’s effort.'],
          private: ['Private support for Eli', 'You checked in privately. Eli felt heard, but your message did not correct the public thread.'],
          disengage: ['Attention protected', 'You left the thread without adding a reaction. The disagreement continued without your participation.']
        };
        next.socialChoices.push(entry('thread-response', rows[id][0], rows[id][1], { action: id }));
        const responses = {
          pile_on: 'Agreement arrives quickly. Later, Eli explains that he meant the dress-code cost, not the organizers’ work. You helped a confident interpretation travel before it was checked. The consequence is social; no ad preference or permission changes.',
          context: 'Eli explains that he was worried about affordability, not dismissing anyone’s work. Some replies soften; others remain defensive. Asking slowed the rush to judge without guaranteeing agreement. Your advertising settings and inferred interests stay unchanged.',
          private: 'Eli thanks you for checking in. He was worried about costs and now feels less alone. The group thread still contains its assumptions because your support was private. You gained connection without resolving the public misunderstanding.',
          disengage: 'You stop reading and return to your afternoon. That protects your attention, while leaving Eli’s explanation and the group’s assumptions unresolved. You do not owe every thread a response; disengagement still has consequences for what you hear next.'
        };
        outcome(rows[id][0] + '.', responses[id]);
        break;
      }
      case 'settings': {
        next.flags.settings = id;
        if (id === 'reduce') {
          next.permissions.partnerActivity = false; next.audience = 'close'; next.flags.reducedAtStep = state.step;
          next.privacyChoices.push(entry('reduced-sharing', outside ? 'Close text relay retained' : 'Future optional association stopped', outside ? 'No account was created. Maya is asked to check before forwarding beyond the close circle.' : 'Later partner visits will not be associated in this simulation. The next post defaults to close friends; old records and earlier post audiences remain unchanged.', { step: state.step }));
          outcome('The boundary applies from here.', outside ? 'You still have no Loop profile. Maya agrees to check before forwarding future texts beyond your close circle. Previous messages cannot be unsent, but the next conversation has a clearer boundary.' : 'Optional partner association is now off, and the next post defaults to close friends. Earlier likes, uploads, or permitted shop visits remain in the record. The next shop visit will test this new boundary; changing a setting is not the same as deleting history.');
        } else {
          next.privacyChoices.push(entry('settings-kept', 'Existing settings retained', 'Partner activity remains ' + (next.permissions.partnerActivity ? 'on' : 'off') + '. No earlier choice was silently reversed.'));
          outcome('Your existing choices stay.', outside ? 'You keep the text relay and unlinked preview. No account or new permission appears. Staying connected through Maya is workable, although it asks a friend to keep carrying updates.' : next.permissions.partnerActivity ? 'You keep optional partner use on because relevant suggestions have value for you. Future partner visits can still be connected. This preserves a convenience and its data trade-off; it does not mean every part of your day is visible.' : 'Optional partner use was already off, and it stays off. You keep the current audience choice. Reviewing a setting does not require switching it on or sacrificing the group conversation.');
        }
        break;
      }
      case 'evening': {
        next.flags.evening = id;
        const linked = id === 'attend' ? addAd(next, 'supplies', 'event-supplies', true, state.step) : false;
        if (id === 'attend') {
          next.socialChoices.push(entry('evening-plan', 'Coming to the fundraiser', outside ? 'You RSVP through Maya’s text relay and view the simulated supply listing. No Loop account is created.' : 'You RSVP to Maya and view the simulated supply listing.'));
          outcome('Plans made. A boundary tested.', linked ? 'You tell Maya you are coming. The supply-shop visit produces a related ad because optional partner use is still on. The same account made planning easier and connected another piece of activity from outside Loop.' : 'You tell Maya you are coming and view the supply listing. That new visit is not associated with a Loop account. A general ad still appears. You keep the useful event information without giving this extra activity the same route into a profile.', 'Maya: Great. Bring yourself; buying something is optional.');
        } else if (id === 'reminder') {
          next.socialChoices.push(entry('evening-plan', 'A local reminder', 'You keep the 4:30 courtyard plan in a simulated local reminder. No shop page is opened or linked.'));
          outcome('The useful part stays.', 'A local reminder keeps the time and place handy. No supply-shop page opens, so no new partner event exists to associate. The convenience you needed was remembering a plan, not necessarily adding another activity to a platform profile.', outside ? 'Maya’s text: Same courtyard, 4:30. See you if you can make it.' : 'Maya: Same courtyard, 4:30. See you if you can make it.');
        } else {
          next.socialChoices.push(entry('evening-plan', 'An offline evening', 'You keep the event details already received and stop browsing. No additional shop visit is made.'));
          outcome('Enough information for now.', 'You close the preview with the time and place already noted. No new shop visit occurs. You can still turn up, although you will not follow every live update. The invitation survives the boundary you put around the rest of your attention.');
        }
        break;
      }
      default: throw new Error('This scene has no outcome.');
    }
    next.step = state.step + 1;
    next.result = result;
    next.history.push({ step: state.step, scene: current.id, title: current.title, choice: id, label: selected.label, consequence: result.text, ...(id === 'browse' ? { actions: copy(payload.actions) } : {}) });
    return next;
  }

  function profile(state) {
    const outside = state.account === false;
    return copy({
      title: 'Your Digital Profile', account: state.account,
      summary: outside ? 'Alex stayed outside Loop. The app received no account profile, uploaded preview responses, or linked shop visits. This local record still shows the choices, text relays, and extra coordination that kept the day connected.' : 'Alex’s day left explicit information, selected activity, and possible interpretations. Each entry below comes from a choice you actually made. The guesses are uncertain, and the record does not diagnose your real personality or beliefs.',
      shared: state.explicitData,
      activity: state.activity.filter(item => item.retained),
      interests: state.inferredInterests,
      partnerActivity: state.partnerEvents,
      feed: state.feedChanges,
      ads: state.adChanges,
      posts: state.postingDecisions,
      privacy: state.privacyChoices,
      social: state.socialChoices
    });
  }
  return { TOTAL_STEPS, DRAFT, REVISION, activityCards: copy(activityCards), initialState, scene, choose, profile };
});
