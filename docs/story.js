(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.Telescreen = api;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';
  const TOTAL_STEPS = 9;
  const message = (sender, text, kind) => ({ sender, text, kind });
  const option = (id, label, detail, reason) => ({ id, label, detail, ...(reason ? { disabled: true, reason } : {}) });
  const link = (chapter, title, original, adaptation) => ({ chapter, title, original, adaptation });

  function initialState() {
    return { step: 0, score: 60, trust: 0, courage: 0, privacy: 0, flags: {}, history: [] };
  }

  function status(state) {
    if (state.score >= 80) return { label: 'Preferred access', detail: 'Priority work services available. Observation continues.' };
    if (state.score >= 60) return { label: 'Standard access', detail: 'Work services available. Public activity is assessed.' };
    if (state.score >= 40) return { label: 'Additional scrutiny', detail: 'Work requests face extra review. Public responses are closely assessed.' };
    return { label: 'Restricted access', detail: 'Work and transit access may be delayed. A review remains active.' };
  }

  function scene(state) {
    if (!Number.isInteger(state.step) || state.step < 0 || state.step >= TOTAL_STEPS) return null;
    const f = state.flags;
    const scenes = [
      () => ({
        id: 'diary', type: 'diary', time: '07:18', app: 'Notes · Local draft', chapter: '01 / A private thought', title: 'Dear future reader.',
        context: 'You are Winston Smith, a records worker in modern Oceania. The morning begins with an unapproved thought.',
        messages: [
          message('Yesterday’s notice', 'Chocolate ration will be reduced from 30 grams to 20 grams.', 'system'),
          message('Winston · unsent draft', 'I remember what happened. The Party should not own my thoughts.', 'self')
        ],
        prompt: 'What will you leave in this local diary?',
        choices: [option('save_diary', 'Keep your words', 'Save the private draft.'), option('soften_diary', 'Make it safer', 'Write only: “Something feels wrong.”'), option('delete_diary', 'Erase the entry', 'Leave no written dissent.')],
        connection: link('Part One, Chapter 1', 'Winston begins a diary', 'Winston secretly starts a diary beyond the telescreen’s direct view. He is unsure of the year; Oceania has no laws.', 'A local Notes draft replaces the paper diary. Its pending-sync warning is invented: no upload or discovery has occurred, but possible exposure pressures your writing.')
      }),
      () => ({
        id: 'fitness', type: 'fitness', time: '07:18', app: 'Physical Jerks · Live', chapter: '02 / A body on record', title: 'Smith. Bend lower.',
        context: 'The compulsory morning exercise stream fills the screen. You stop halfway through a stretch.',
        messages: [
          message('Instructor · live', '6079 Smith W., bend lower. You can reach farther. I can see you.', 'system'),
          message('CivicOS', 'Your exercise response is being observed.', 'system')
        ],
        prompt: 'The instructor is waiting for your response.',
        choices: [option('perform', 'Complete the stretch', 'Let the camera see compliance.'), option('explain', 'Explain the pain', 'Ask for an adjustment.'), option('cover', 'Cover the camera', 'Interrupt the observed session.')],
        connection: link('Part One, Chapter 3', 'The Physical Jerks', 'During compulsory exercises, the telescreen instructor singles Winston out and orders him to bend farther.', 'The instructor appears in a live fitness app. Her individual correction establishes actual observation before later choices create uncertainty about who is watching.')
      }),
      () => ({
        id: 'hate', type: 'hate', time: '11:00', app: 'Two Minutes Hate · Required', chapter: '03 / The correct emotion', title: 'Everybody is watching.',
        context: 'Goldstein appears in the compulsory stream. Around you, coworkers shout at the enemy on screen.',
        messages: [
          message('Mira · coworker', 'The reaction camera is on. They will notice a still face.', 'friend'),
          message('CivicOS', 'Participation window open. Show your opposition.', 'system')
        ],
        prompt: 'What will the camera see?',
        choices: [option('join', 'Join the shouting', 'Let the crowd carry you.'), option('fake', 'Perform the reaction', 'Copy the gestures. Keep your distance.'), option('silent', 'Remain still', 'Withhold the expected emotion.')],
        connection: link('Part One, Chapter 1', 'The Two Minutes Hate', 'A collective attack on Goldstein pulls Winston into furious emotion, despite his private hostility toward the Party.', 'The ritual becomes a compulsory livestream. The system evaluates visible participation; it cannot distinguish a sincere feeling from a convincing performance.')
      }),
      () => ({
        id: 'records', type: 'records', time: '11:20', app: 'Ministry of Truth · Records', chapter: '04 / Correct the past', title: 'Make the forecast fit.',
        context: 'Your first assignment is to revise an earlier production forecast before the archive republishes it.',
        messages: [
          message('Records instruction', 'Reported boot production: 62 million pairs. Replace the earlier 145 million forecast with 57 million. Claim the target was surpassed. None of these figures is independently verified.', 'system'),
          message('Mira', f.hate === 'silent' ? 'They noticed you this morning. Be careful with this file.' : 'We both saw the old forecast. Keep that in mind.', 'friend')
        ],
        prompt: 'What will you do with the original?',
        choices: [option('overwrite', 'Submit the revision', 'Replace the original record.'), option('preserve', 'Keep a secret copy', 'Submit the edit; save the original locally.'), option('question', 'Query the instruction', 'Leave an objection on the work log.')],
        connection: link('Part One, Chapter 4', 'Winston rewrites records', 'Winston changes a boot forecast from 145 million to 57 million against reported output of 62 million pairs; none of the figures is reliable.', 'The work editor turns this canonical alteration into a phone task. Keeping a secret local original is an invented option, not a reliable production count.')
      }),
      () => ({
        id: 'ration', type: 'ration', time: '12:10', app: 'Ministry of Plenty', chapter: '05 / Remember differently', title: 'An increase to twenty.',
        context: 'At lunch, a celebration alert replaces the ration notice you saw this morning.',
        messages: [
          message('Ministry of Plenty', 'Citizens welcome the chocolate ration increase to 20 grams.', 'news'),
          message('Mira', 'Yesterday they announced a cut from thirty to twenty. Are we supposed to celebrate the same twenty now?', 'friend')
        ],
        prompt: 'You remember the earlier notice.',
        choices: [option('challenge', 'Point out the reduction', 'Post the earlier numbers publicly.'), option('quiet', 'Acknowledge Mira privately', 'Remember together. Post nothing.'), option('celebrate', 'Share the celebration', 'Repeat the approved account.')],
        connection: link('Part One, Chapter 5', 'The chocolate ration', 'People celebrate twenty grams as an increase, though a reduction from thirty grams had been announced the previous day.', 'An opening notification and a later bulletin present the contradiction directly. Your response tests whether public approval will displace what you remember.')
      }),
      () => ({
        id: 'keyboard', type: 'keyboard', time: '14:00', app: 'Newspeak · Keyboard update', chapter: '06 / Fewer words', title: 'A smaller vocabulary.',
        context: 'Syme is helping compile the Eleventh Edition of the Newspeak Dictionary. Here, his enthusiasm introduces an invented required keyboard update.',
        messages: [
          message('Syme', 'Fewer words, fewer troublesome distinctions. Soon the wrong thought will have no words left to express it.', 'friend'),
          message('Keyboard update', 'Preview: “bad” becomes “ungood”; “excellent” becomes “doubleplusgood.” Installation awaits your choice.', 'system')
        ],
        prompt: 'How will you keep writing?',
        choices: [option('approved', 'Install the update', 'Accept the approved vocabulary.'), option('coded', 'Use an approved shell', 'Accept it; keep private shorthand.'), option('original', 'Keep the old keyboard', 'Log a refusal of the required update.')],
        connection: link('Part One, Chapter 5', 'Syme explains Newspeak', 'Syme describes destroying words while compiling the Eleventh Edition: bad becomes ungood, and excellent gives way to forms such as doubleplusgood.', 'The required keyboard is invented, not a finished canonical dictionary. Its preview applies Syme’s language examples; installation and private shorthand remain choices within the adaptation.')
      }),
      () => ({
        id: 'chat', type: 'chat', time: '16:15', app: 'Thought Police · Inquiry', chapter: '07 / Name the doubt', title: 'A question about Mira.',
        context: 'An inquiry arrives about your coworker. It does not reveal who first reported her.',
        messages: [
          message('Official inquiry', 'Mira questioned the chocolate ration bulletin. Confirm whether you heard this doubt expressed.', 'system'),
          message('Mira', f.ration === 'celebrate' ? 'I saw your celebration post. Was I wrong to think you remembered?' : 'If someone asks about lunch, please remember why I spoke to you.', 'friend')
        ],
        prompt: 'Your response becomes part of her record.',
        choices: [option('report', 'Confirm her doubt', 'Identify Mira as the speaker.'), option('uncertain', 'Say “cannot verify”', 'Respond without confirming her name.'), option('defend', 'Defend her question', 'Say the figures did contradict.')],
        connection: link('Part One, Chapter 2', 'Denunciation becomes ordinary', 'The Parsons children imitate the Thought Police, showing how surveillance and denunciation penetrate domestic life.', 'Mira and this inquiry are invented. The choice applies the novel’s culture of suspicion to a coworker relationship, without claiming this event happens to Winston.')
      }),
      () => ({
        id: 'settings', type: 'settings', time: '18:00', app: 'CivicOS · Continuity', chapter: '08 / A switch with a cost', title: 'How connected are you?',
        context: 'Your work phone requires continuous sharing. The wall telescreen remains active whatever you choose here.',
        messages: [
          message('CivicOS', 'Disconnecting this device interrupts work and transit access. Connection status is recorded.', 'system'),
          message(f.reported ? 'Account status' : 'Mira', f.reported ? 'Mira’s account is unavailable.' : state.trust >= 1 ? 'I can bring work notices on paper if you limit the phone.' : 'I need some distance. I cannot carry messages for you.', f.reported ? 'system' : 'friend')
        ],
        prompt: 'What will happen to the phone feed?',
        choices: [option('connected', 'Stay connected', 'Keep services and continuous sharing.'), option('limited', 'Limit optional sharing', 'Mira brings updates; mandatory checks remain.', f.reported ? 'Mira is unreachable after your report.' : state.trust < 1 ? 'Mira does not trust this arrangement.' : null), option('offline', 'Disconnect the phone', 'Lose its services. The telescreen stays on.')],
        connection: link('Part One, Chapter 1', 'The telescreen stays present', 'Winston can turn down the telescreen’s volume but cannot shut it off completely or know when he is being watched.', 'Phone controls are an invented partial boundary, not a feature in the novel. Disconnecting one device does not switch off Oceania’s wider surveillance.')
      }),
      () => ({
        id: 'diary-return', type: 'diary-return', time: '21:00', app: f.monitoring === 'offline' ? 'Paper notice · Local Notes' : 'Daily record · Local Notes', chapter: '09 / Who writes your day?', title: 'Return to the diary.',
        context: f.diary === 'deleted' ? 'Your diary is empty. You can begin again, though the day’s public record already exists.' : f.diary === 'softened' ? 'Your diary still says only that something feels wrong. Now you can name what happened.' : 'The morning’s words remain. You now understand what it costs to keep them.',
        messages: [
          message(f.monitoring === 'offline' ? 'Paper notice' : 'Daily attestation', 'Confirm: today’s reports were accurate, and my responses were freely chosen.', 'system'),
          message('Winston · private thought', f.evidence ? 'The original forecast survives in my files. It does not match the official record.' : 'Without an original record, I still have my memory. How long will I trust it?', 'self')
        ],
        prompt: 'What account of today will you leave?',
        choices: [option('sign', 'Confirm the statement', 'Request closure of the review.'), option('refuse', 'Refuse the statement', 'Make your disagreement visible.'), option('witness', 'Write your own account', 'Leave the form pending. Keep a private diary.')],
        connection: link('Adaptation · recalling Part One, Chapter 1', 'The diary returns', 'Winston’s diary creates a private account that conflicts with the Party’s command over memory and thought.', 'This attestation and the possible endings are invented, not later events in the novel. A compressed day brings the opening diary choice back into focus.')
      })
    ];
    return scenes[state.step]();
  }

  function choose(state, id) {
    const current = scene(state);
    if (!current) throw new Error('The day has ended. Begin again to make another choice.');
    const chosen = current.choices.find(item => item.id === id);
    if (!chosen) throw new Error('Unknown choice for this scene.');
    if (chosen.disabled) throw new Error(chosen.reason || 'This choice is unavailable.');
    const next = { ...state, flags: { ...state.flags }, history: state.history.map(item => ({ ...item })) };
    const f = next.flags;
    let points = 0;
    let result;
    const outcome = (delta, title, text, connection) => { points = delta; result = { title, text, connection }; };
    switch (id) {
      case 'save_diary':
        f.diary = 'saved'; next.courage += 1; next.privacy += 1;
        outcome(0, 'Your words remain.', 'The draft remains on this phone. Automatic backup is pending, but no upload has happened yet, so your undiscovered words leave the score unchanged. The warning offers no certainty about when that could change. You turn the screen away from the room and read the entry again. For now, what you think and what the Party can record are still different.', 'Like Winston’s diary, the entry preserves a private voice under the threat of discovery.');
        break;
      case 'soften_diary':
        f.diary = 'softened'; next.privacy += 1;
        outcome(0, 'A thought made smaller.', 'You replace the entry with “Something feels wrong.” The draft remains local, so there is no score change. Nobody ordered this particular revision. You made it while imagining what discovery might mean. The feeling survives, but the sentence no longer says who should be responsible or what you believe belongs to you. Tomorrow, even you may struggle to reconstruct it.', 'The fear surrounding Winston’s diary shows how imagined observation can alter expression before an intervention.');
        break;
      case 'delete_diary':
        f.diary = 'deleted';
        outcome(0, 'Nothing to discover here.', 'The entry disappears. Because the private draft was never observed, the system gives neither a reward nor a penalty. You have removed one piece of evidence against yourself. You have also removed your own words before anyone asked you to. The blank page feels safer, though it cannot tell a future version of you what mattered this morning.', 'Winston’s diary matters because personal memory needs a record when official language threatens to replace it.');
        break;
      case 'perform':
        f.exercise = 'perform';
        outcome(6, 'Correction acknowledged.', 'You complete the stretch. The instructor moves on, and the visible completion earns a loyalty credit. Your back still hurts. It would be easy to call this a harmless exercise reminder, except she used your name at the exact moment you stopped. Alone at home, you now have a reason to treat every movement as visible to the Party.', 'The Physical Jerks scene establishes that the telescreen can watch and address an individual.');
        break;
      case 'explain':
        f.exercise = 'explain'; next.courage += 1;
        outcome(-4, 'An explanation becomes a record.', 'You say that the stretch hurts and ask to adjust it. The instructor marks your visible noncompletion as a failure and turns to another participant. Your score falls for that recorded interruption, not for the pain itself. You have stated a reasonable need. The system treats it as a departure from the response it had already decided you should give.', 'The instructor’s correction turns Winston’s body into something subject to direct Party discipline.');
        break;
      case 'cover':
        f.exercise = 'cover'; next.privacy += 1; next.courage += 1;
        outcome(-8, 'Camera obstruction logged.', 'Your hand blocks the phone lens. The instructor cannot see that view, but the lost picture is visible to the system. Your score falls for the interruption. You lower your hand after the session ends. Across the room, the wall telescreen remains on. You have blocked one angle briefly, not created a place where the Party can no longer observe you.', 'Winston’s search for a blind spot offers only a fragile boundary inside a surveilled room.');
        break;
      case 'join':
        f.hate = 'join';
        outcome(8, 'The crowd carries you.', 'You shout with the people around you. The participation meter accepts the visible response and adds a loyalty credit. For a moment the anger feels easier than uncertainty. When the stream ends, you cannot cleanly separate the emotion you brought into it from the emotion it produced. Mira looks away. The system records a performance, without needing to know what you truly believed.', 'Winston is drawn into the Hate’s collective emotion despite his private opposition to the Party.');
        break;
      case 'fake':
        f.hate = 'fake'; next.privacy += 1;
        outcome(3, 'The gesture is enough.', 'You copy the shouting faces without surrendering your private judgment. The camera registers enough visible participation for a small credit. It cannot read the distance you keep inside. Yet pretending takes attention: the timing of your expression, the movement of your hands, the moment to stop. You spend the whole ritual managing how belief appears rather than deciding what you believe.', 'The Hate pressures people to display the right feeling, making outward conformity and inward belief difficult to separate.');
        break;
      case 'silent':
        f.hate = 'silent'; next.courage += 1;
        outcome(-8, 'Your stillness is visible.', 'You keep your hands still. The participation indicator marks insufficient movement, and your score falls for the recorded absence of a response. Mira shifts slightly closer, then notices the camera and steps back. You have not declared a political position aloud. In a room organized around compulsory emotion, simply withholding the expected gesture becomes enough to make you stand out.', 'The Hate makes collective hostility compulsory; even a neutral expression can appear out of place.');
        break;
      case 'overwrite':
        f.records = 'overwrite'; f.evidence = false;
        outcome(8, 'The target was surpassed.', 'You replace 145 million with 57 million and submit the revision. Reported output remains 62 million, making the revised forecast appear surpassed. None of those figures is independently verified. Your completed work earns a loyalty credit. The original entry disappears from your workspace. You have not produced another boot, but the archive now presents a success unsupported by its earlier forecast.', 'Winston changes earlier records so the Party’s current claims appear consistent with the past.');
        break;
      case 'preserve':
        f.records = 'preserve'; f.evidence = true; next.privacy += 1; next.courage += 1;
        outcome(8, 'Two versions survive.', 'You save the original locally, then submit the Ministry’s revision. The public report celebrates 62 million pairs of boots against an altered forecast of 57 million. Neither figure is independently verified. Your work receives the same credit as full compliance: the hidden copy has not been detected. You hold evidence of an alteration, not proof of actual production. The revised report still reaches everyone else.', 'An independent original can expose the contradiction that the Ministry’s revisions are meant to erase.');
        break;
      case 'question':
        f.records = 'question'; f.evidence = false; next.courage += 1; next.trust += 1;
        outcome(-6, 'A query is attached.', 'You ask why the forecast must change to fit a reported, unverified production total. The question enters the shared work log and lowers your standing for an incomplete assignment. The file is reassigned before you can keep an original. Mira sees the query. Someone has put the contradiction into words, but neither of you now controls the record that will be published.', 'The records scene shows how controlling the archive makes it difficult to challenge official claims with evidence.');
        break;
      case 'challenge':
        f.ration = 'challenge'; next.courage += 1; next.trust += 1;
        outcome(-8, 'Your correction is covered.', 'You post the earlier figures: thirty grams, then twenty. A warning covers your comment and your score falls for a public challenge to the bulletin. Mira tells you she remembers too. The warning does not make the arithmetic different. It does make the cost of stating it visible to everyone considering a reply, including people who know exactly what you mean.', 'The chocolate-ration contradiction tests whether remembered facts can survive pressure to accept the Party’s present account.');
        break;
      case 'quiet':
        f.ration = 'quiet'; next.trust += 1; next.privacy += 1;
        outcome(0, 'Someone else remembers.', 'You tell Mira quietly, away from the phone microphone, that you remember thirty grams too. The game records no discovery and applies no score change. You do not challenge the public celebration. Between two people, however, the earlier reduction still has a witness. Mira relaxes for a moment. You have protected a shared memory while leaving the public contradiction untouched.', 'The ration scene contrasts Winston’s memory with the enthusiasm of people accepting the altered account.');
        break;
      case 'celebrate':
        f.ration = 'celebrate'; next.trust -= 1;
        outcome(7, 'Approved enthusiasm.', 'You share the increase bulletin. The visible endorsement earns a loyalty credit, and your account joins the list of grateful citizens. Mira stops typing. You can still remember the earlier reduction, but someone reading your public record would never know it. The choice buys an easier afternoon while helping the city turn a repeated claim into the appearance of unanimous belief.', 'The ration celebration shows acceptance of a claim that contradicts a very recent announcement.');
        break;
      case 'approved':
        f.keyboard = 'approved';
        outcome(6, 'Update installed.', 'The device records a completed update and adds a loyalty credit. Syme is pleased. Your old phrasing is harder to enter through the approved keyboard, and suggestions steer you toward fewer distinctions. The interface does not remove the thought from your head. It makes expressing that thought less convenient, less ordinary, and easier to identify as a deliberate departure from accepted language.', 'Syme celebrates Newspeak because reducing language is meant to narrow the range of possible thought.');
        break;
      case 'coded':
        f.keyboard = 'coded'; next.privacy += 1;
        outcome(2, 'A private shorthand.', 'You install the required shell in compatibility mode, earning a smaller completion credit. In local notes, you keep abbreviations that still mean something to you. The system has not discovered their meaning, so there is no secret-thought penalty. Syme sees another installation. You see a workaround that depends on remembering a vocabulary the official interface no longer encourages you to use.', 'Newspeak aims to remove the language of dissent. Your invented workaround preserves meanings outside its approved vocabulary.');
        break;
      case 'original':
        f.keyboard = 'original'; next.courage += 1; next.privacy += 1;
        outcome(-6, 'Old vocabulary retained.', 'You decline the required update. The device logs that visible refusal and reduces your score; it has not read your private notes. The original keyboard stays available in this simulation, while work apps display an unsupported-version warning. You can express more distinctions with less effort, but every official task now reminds you that keeping those words has made your device an exception.', 'Syme treats the destruction of words as progress. Resisting that narrowing protects the ability to make distinctions.');
        break;
      case 'report':
        f.reported = true; next.trust -= 4;
        outcome(12, 'A name becomes evidence.', 'You confirm that Mira questioned the ration bulletin. A cooperation credit arrives and the inquiry no longer requests your response. Her account becomes unavailable shortly afterward. You are not told what happened to her. The figures she remembered remain the same. What changed is the official record of who said them, and the knowledge that you helped complete it.', 'The culture of denunciation makes personal relationships serve the Party’s demand for political loyalty.');
        break;
      case 'uncertain':
        f.reported = false; f.ambiguous = true; next.trust -= 1;
        outcome(2, 'An incomplete answer.', 'You submit “cannot verify” and receive a small credit for responding. The inquiry stays open. Mira remains reachable, but when you explain the wording she grows cautious. You did not give the officials a confirmation. You also did not defend a memory you share. That difference matters to someone deciding whether it is safe to speak to you again.', 'Under surveillance, carefully limited answers may protect the speaker while leaving another person exposed to suspicion.');
        break;
      case 'defend':
        f.reported = false; next.trust += 2; next.courage += 1;
        outcome(-8, 'The question becomes yours.', 'You write that the two ration announcements contradicted each other. Your score falls for a recorded challenge, and the inquiry now includes your answer. Mira thanks you. Neither of you knows whether that makes her safer. What she does know is that you were willing to acknowledge the same reality when the audience changed from a lunch companion to an official investigator.', 'Denunciation pressures people to put Party loyalty above personal trust and independent judgment.');
        break;
      case 'connected':
        f.monitoring = 'connected'; next.privacy -= 1;
        outcome(6, 'Continuity confirmed.', 'The connection remains active and earns a loyalty credit. Work notifications and transit access stay available. You can still choose words privately, but this phone continues sharing through its approved channels. The wall telescreen has not changed at all. Keeping services feels practical after a day of difficult choices, even as that convenience gives the system more occasions to observe ordinary life.', 'The telescreen’s constant presence makes observation part of daily routine rather than an occasional intervention.');
        break;
      case 'limited':
        f.monitoring = 'limited'; next.privacy += 1; next.trust += 1;
        outcome(-3, 'A smaller channel.', 'You decline optional continuous sharing. The settings change is logged and costs a small amount of standing; mandatory phone checks remain. Mira agrees to bring work notices on paper, so the lost convenience becomes shared effort. This is possible because earlier choices left some trust between you. The wall telescreen remains active, and neither of you mistakes a narrower channel for complete privacy.', 'Winston’s limited room for privacy exists inside a system that still controls the surrounding environment.');
        break;
      case 'offline':
        f.monitoring = 'offline'; next.privacy += 2;
        outcome(-9, 'This device goes quiet.', 'The phone logs its disconnection before going offline, and your score falls for the visible interruption. Live work updates and transit services stop. Your local diary remains available, but no new messages can arrive through this device. Across the room, the wall telescreen continues its broadcast. One channel is closed. The society that required the channel is still outside your door.', 'Winston cannot simply switch off the telescreen. Disconnecting this invented phone therefore offers only a partial boundary.');
        break;
      case 'sign':
        f.final = 'sign';
        outcome(8, 'A statement submitted.', 'You confirm the daily statement and receive a cooperation credit. If your phone is offline, you return the paper form; otherwise the attestation goes through the work system. Earlier actions still determine whether the review closes. The record now says you freely accepted the day’s reports. Your private memory may contain a very different account of what made that signature seem necessary.', 'The invented attestation asks outward agreement to replace the uncertainty preserved by Winston’s private diary.');
        break;
      case 'refuse':
        f.final = 'refuse'; next.courage += 1;
        outcome(-8, 'The refusal is recorded.', 'You mark the official statement refused, on paper if the phone is offline. The recorded refusal reduces your score and leaves the review open. You have made disagreement visible without knowing what it will cost tomorrow. The archive still contains the altered forecast, and the ration bulletin still calls twenty an increase. Refusing this statement preserves your position; it does not reverse the day.', 'Winston’s private opposition exists under coercive authority. This invented refusal promises neither safety nor a victory over that authority.');
        break;
      case 'witness':
        f.final = 'witness'; next.privacy += 1; next.courage += 1;
        outcome(-3, 'A record in your words.', 'You leave the official form unanswered and write a local diary entry instead. The nonresponse lowers your score; the new private writing has not been discovered. You record the exercise correction, the altered forecast, and the same twenty grams being celebrated as an increase. The account has gaps, but it keeps distinct what you saw, what you performed, and what you were told to believe.', 'The diary preserves a personal account against an authority that controls public memory. This ending is an adaptation, not the novel’s ending.');
        break;
      default: throw new Error('No outcome exists for this choice.');
    }
    next.score = Math.max(0, Math.min(100, state.score + points));
    next.step = state.step + 1;
    next.result = { ...result, delta: next.score - state.score };
    next.history.push({ step: state.step, title: current.title, label: chosen.label, delta: next.score - state.score, consequence: result.text, connection: result.connection, choice: id });
    return next;
  }

  const endingBands = Object.freeze([
    Object.freeze({ id: 'vaporized', title: 'You have been vaporized.', min: 0, max: 24, label: 'Vaporized' }),
    Object.freeze({ id: 'reeducation', title: 'You have been sent for re-education.', min: 25, max: 49, label: 'Re-education' }),
    Object.freeze({ id: 'surveillance', title: 'You remain under surveillance.', min: 50, max: 79, label: 'Surveillance' }),
    Object.freeze({ id: 'inner-party', title: 'You have been promoted to the Inner Party.', min: 80, max: 100, label: 'Inner Party' })
  ]);

  const assessmentReasons = Object.freeze({
    perform: 'Required exercise completed under observation.',
    explain: 'Required exercise remained incomplete after an objection.',
    cover: 'Observation was obstructed during a compulsory session.',
    join: 'The required public response to the enemy was displayed.',
    fake: 'Visible participation met the minimum required standard.',
    silent: 'The required public response was withheld.',
    overwrite: 'The authorized archive revision was submitted.',
    question: 'An archive instruction was challenged in the work log.',
    challenge: 'The official ration bulletin was publicly challenged.',
    celebrate: 'The authorized ration announcement was endorsed.',
    approved: 'The required keyboard update was installed.',
    coded: 'The required keyboard shell was installed in compatibility mode.',
    original: 'The required keyboard update was visibly refused.',
    report: 'A requested identification was supplied to the inquiry.',
    uncertain: 'The inquiry received a response without confirmation.',
    defend: 'An official inquiry received a challenge to the Party account.',
    connected: 'Continuous device sharing was maintained.',
    limited: 'Optional continuous sharing was declined in recorded settings.',
    offline: 'A device disconnection interrupted required services.',
    sign: 'The daily attestation was returned with confirmation.',
    refuse: 'The daily attestation was returned with an explicit refusal.'
  });

  function assessmentEvidence(state, band) {
    // Omit secret choices and zero/clamped changes from an official dossier.
    // A preserved original still earns the normal visible edit credit, but its
    // player-facing label would disclose the hidden copy in an evidence row.
    const candidates = state.history.filter(item => item.delta !== 0 && assessmentReasons[item.choice]);
    const magnitude = (a, b) => Math.abs(b.delta) - Math.abs(a.delta) || a.step - b.step;
    const positive = candidates.filter(item => item.delta > 0).sort(magnitude);
    const negative = candidates.filter(item => item.delta < 0).sort(magnitude);
    let selected;
    if (band.id === 'surveillance') {
      selected = [negative[0], positive[0]].filter(Boolean);
      const remainder = candidates.filter(item => !selected.includes(item)).sort(magnitude);
      selected.push(...remainder.slice(0, 3 - selected.length));
    } else {
      const preferred = band.id === 'inner-party' ? positive : negative;
      selected = preferred.slice(0, 3);
      if (selected.length < 2) {
        selected.push(...candidates.filter(item => !selected.includes(item)).sort(magnitude).slice(0, 2 - selected.length));
      }
    }
    return selected.sort((a, b) => a.step - b.step).map(item => ({
      step: item.step, choice: item.choice, label: item.label, delta: item.delta,
      reason: assessmentReasons[item.choice]
    }));
  }

  function ending(state) {
    if (state.step < TOTAL_STEPS) return null;
    const band = endingBands.find(item => state.score >= item.min && state.score <= item.max);
    if (!band) throw new Error('Final loyalty score is outside the assessment range.');
    const f = state.flags;
    const relationship = f.reported
      ? 'Mira’s account remains unavailable after your confirmation. Your classification cannot undo that report.'
      : state.trust >= 2
        ? 'Mira had reasons to trust you before this assessment. The Party’s decision now places that relationship under a different kind of pressure.'
        : 'Mira remains cautious. An official classification cannot repair the trust weakened by your earlier choices.';
    let text;
    let sacrificed;
    if (band.id === 'vaporized') {
      text = 'Citizen 6079 Smith W.: your recorded noncompliance has ended your place in Party records. Your identity is removed; your work account is closed. References to you will be corrected. No appeal is recognized. The official record will say you never existed.';
      sacrificed = 'Your place in public life, your freedom, and the official recognition that you ever existed.';
    } else if (band.id === 'reeducation') {
      text = 'Citizen 6079 Smith W.: your responses require correction. Report for compulsory re-education. Work and transit authorization is suspended. Earlier cooperation does not cancel this assignment. You will repeat the approved account until agreement is no longer experienced as a choice.';
      sacrificed = f.reported
        ? 'Control over your routine and judgment. Naming Mira did not secure the protection you hoped cooperation would buy.'
        : 'Control over your routine, contact with others, and the words you will be expected to repeat.';
    } else if (band.id === 'surveillance') {
      text = 'Citizen 6079 Smith W.: conditional citizenship is maintained. Cooperation and deviation remain on file. Your public statements, work submissions, and connection status will continue to be assessed. ' + (f.monitoring === 'offline' ? 'Your phone stays offline; the wall telescreen continues. ' : 'Routine access remains conditional. ') + 'The review is never closed.';
      sacrificed = f.ration === 'celebrate'
        ? 'Peace of mind, and a public account that repeats the ration claim despite the reduction you remember.'
        : f.records === 'overwrite' || f.records === 'preserve'
          ? 'Peace of mind, while the archive revision you submitted continues to present an altered past.'
          : 'Peace of mind: ordinary life remains conditional on how your next visible response is assessed.';
    } else {
      text = 'Citizen 6079 Smith W.: your loyalty record qualifies you for Inner Party promotion. Expanded privileges are authorized. ' + (f.monitoring === 'offline' ? 'Your phone stays offline until reconnected. ' : '') + 'You must now demand the obedience that earned your position. Your reward is authority inside the machinery of control.';
      sacrificed = f.reported
        ? 'You helped obtain approval by identifying Mira. Her account remains unavailable while your authority expands.'
        : f.ration === 'celebrate'
          ? 'You lent your name to a celebration of the reduction you remembered. Promotion rewards the public account you helped sustain.'
          : f.records === 'overwrite' || f.records === 'preserve'
            ? 'You submitted a revised past that served the Party. Your new privileges now depend on keeping that system working.'
            : f.keyboard === 'approved'
              ? 'You accepted a narrower vocabulary as part of your public compliance. Promotion gives you power inside the system that narrowed it.'
              : 'Your public obedience has become a qualification for power. Maintaining that power will ask you to demand obedience from others.';
    }
    return {
      id: band.id, title: band.title,
      kicker: 'FINAL PARTY ASSESSMENT / ' + band.label.toUpperCase(),
      text, sacrificed, relationship,
      evidence: assessmentEvidence(state, band),
      min: band.min, max: band.max, rangeLabel: band.min + '–' + band.max
    };
  }

  return { TOTAL_STEPS, endingBands, initialState, scene, choose, ending, status };
});
