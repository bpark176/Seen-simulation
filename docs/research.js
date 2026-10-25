/* Research notes for the educational Instagram simulation. No external requests are made here. */
window.TelescreenResearch = {
  checkedAt: '2026-10-25',
  checkedLabel: 'Sources checked 25 October 2026',
  framing: 'This project argues that when social plans, useful recommendations, and convenient features come together, sharing data can start to feel like the ordinary price of participation. This Instagram simulation makes that trade-off visible through invented characters, events, and simplified controls. Commercial profiling and peer pressure differ from the Party’s violent, compulsory political control.',
  sources: [
    {
      id: 'ftc-2024',
      title: 'FTC Staff Report Finds Large Social Media and Video Streaming Companies Have Engaged in Vast Surveillance of Users with Lax Privacy Controls and Inadequate Safeguards for Kids and Teens',
      url: 'https://www.ftc.gov/news-events/news/press-releases/2024/09/ftc-staff-report-finds-large-social-media-video-streaming-companies-have-engaged-vast-surveillance',
      publisher: 'Federal Trade Commission',
      date: 'September 2024',
      summary: 'FTC staff linked extensive collection and targeted-advertising incentives to privacy risks. The report draws on responses to December 2020 orders to nine companies, including Facebook. Its findings are not a current audit of every platform or feature.'
    },
    {
      id: 'meta-partner-controls',
      title: 'Better Personalization and Changes to Controls for Your Activity From Other Businesses',
      url: 'https://about.fb.com/news/2026/06/better-personalization-and-changes-to-controls-for-your-activity-from-other-businesses/',
      publisher: 'Meta Newsroom',
      date: '9 June 2026',
      summary: 'Meta describes using business-supplied activity for ads and expanding it to other personalization. It announced a regional rollout of revised controls, replacing the separate off-Meta activity disconnect setting. A control over use does not necessarily stop receipt of data.'
    },
    {
      id: 'meta-ranking',
      title: 'How AI Influences What You See on Facebook and Instagram',
      url: 'https://about.fb.com/news/2023/06/how-ai-ranks-content-on-facebook-and-instagram/',
      publisher: 'Meta Newsroom',
      date: '29 June 2023',
      summary: 'Meta explains that behavior and feedback inform predictions used to rank content, and that no single prediction perfectly measures what someone values. It also describes ways to influence recommendations.'
    },
    {
      id: 'meta-business-tools',
      title: 'Connect your website data for better ad performance',
      url: 'https://www.facebookblueprint.com/student/activity/714073',
      publisher: 'Meta Blueprint',
      date: 'Publication date not shown',
      summary: 'Meta’s advertiser training identifies the Meta Pixel and Conversions API as tools for connecting website data to improve advertising. This explains a possible data pathway, not why any particular person received an ad.'
    },
    {
      id: 'meta-contacts',
      title: 'Upload your contacts to Facebook from your mobile phone or other accounts',
      url: 'https://www.facebook.com/help/messenger-app/561688620598358',
      publisher: 'Meta Help Center',
      date: 'Publication date not shown',
      summary: 'Documents contact uploading and links to managing or deleting uploaded contacts. Feature-specific menus can change. The article’s indexed text was checked; the direct Help Center page may require sign-in.'
    },
    {
      id: 'meta-audience',
      title: 'Protect personal information',
      url: 'https://www.meta.com/safety/topics/safety-basics/tools/privacy/',
      publisher: 'Meta Safety Center',
      date: 'Publication date not shown',
      summary: 'Explains Facebook’s audience selector and Instagram follower approval. Tagging and posting on another person’s profile can affect who sees content. Visibility controls address audiences, not every use of data by the platform.'
    },
    {
      id: 'meta-teen-ads',
      title: 'Continuing to Create Age-Appropriate Ad Experiences for Teens',
      url: 'https://about.fb.com/news/2023/01/age-appropriate-ads-for-teens/',
      publisher: 'Meta Newsroom',
      date: '10 January 2023; updated 18 January 2023',
      summary: 'Meta says teen ad targeting is limited to age and location and that teens’ engagement does not inform the ads they see. The game’s 18-year-old character and simplified advertising example do not represent a Meta teen account.'
    },
    {
      id: 'orwell-part-one',
      title: 'Nineteen Eighty-Four — Part One, Chapter 1',
      url: 'https://gutenberg.net.au/ebooks01/0100021h.html',
      publisher: 'George Orwell · Project Gutenberg Australia',
      date: 'Novel published 1949; e-text updated November 2008',
      summary: 'Primary text for the telescreen, Winston’s guarded expression, and the Two Minutes Hate. The connections use paraphrases and stay within Part One.'
    }
  ],
  connections: {
    monitoring: {
      chapter: 'Part One, Chapter 1',
      title: 'Who can see the record?',
      original: 'The telescreen receives as well as broadcasts. Winston cannot turn it fully off or know when the Thought Police are watching.',
      comparison: 'The simulation turns ordinary actions into a profile. The comparison asks who can observe, and how clearly the observed person understands the record.',
      difference: 'Commercial profiling has different purposes and controls from the Party’s compulsory political surveillance.',
      sourceIds: ['orwell-part-one', 'meta-ranking']
    },
    expression: {
      chapter: 'Part One, Chapter 1',
      title: 'An audience changes the draft',
      original: 'Before facing the telescreen, Winston deliberately arranges his expression to appear reassuringly positive.',
      comparison: 'The player may revise a harmless opinion after noticing classmates and family in its audience. Anticipated reactions can influence expression.',
      difference: 'Here the pressure comes from peers. The game does not claim that advertising systems punish disagreement.',
      sourceIds: ['orwell-part-one', 'meta-audience']
    },
    crowd: {
      chapter: 'Part One, Chapter 1',
      title: 'When hostility becomes participation',
      original: 'During the Two Minutes Hate, Winston is pulled into the crowd’s rage despite his private hostility toward the Party.',
      comparison: 'The simulated ambiguous post invites a quick public reaction. Its thread explores the appeal and pressure of joining a group.',
      difference: 'This invented argument is peer conflict, not a state-organized ritual enforced through political terror.',
      sourceIds: ['orwell-part-one']
    }
  },
  claims: {
    overview: {
      title: 'Why make this trade-off visible?',
      text: 'The FTC’s 2024 staff report found that many examined companies’ advertising models encouraged extensive data collection, creating tensions with privacy. It examined responses to orders issued in December 2020, not every platform’s current settings. This project uses those findings to ask how everyday benefits can make sharing feel normal; its social events and consequences are invented.',
      sourceIds: ['ftc-2024', 'meta-partner-controls']
    },
    contacts: {
      title: 'Connection has a data cost',
      text: 'Facebook documents contact uploading and ways to manage or delete uploaded contacts. This Instagram simulation turns that choice into faster friend suggestions from a fictional address book; manual search leaves that book unshared. Stopping future uploads and deleting earlier uploads are separate actions. This game never accesses your contacts.',
      sourceIds: ['meta-contacts']
    },
    personalization: {
      title: 'Useful does not mean data-free',
      text: 'Meta says activity supplied by other businesses can personalize ads and, under its 2026 rollout, other content. Its revised control governs that use. The game simplifies this into an optional partner-activity choice. Declining works in the story, while ordinary actions in the simulation can still shape its feed.',
      sourceIds: ['meta-partner-controls', 'meta-ranking']
    },
    behavior: {
      title: 'An action can become a guess',
      text: 'Meta describes ranking systems that combine behavior and feedback to predict useful content. A like or save is evidence of an action, not proof of a lasting interest. The game’s categories are tentative guesses from this playthrough, with deliberately simple rules. They do not describe your real personality or beliefs.',
      sourceIds: ['meta-ranking']
    },
    ads: {
      title: 'One possible route from shop to ad',
      text: 'Businesses can connect website activity to Meta through tools such as the Meta Pixel and Conversions API. Depending on applicable controls, business-supplied activity can inform personalized ads. The game’s immediate matching ad simplifies that pathway; it is not a guaranteed sequence. The story’s student character is 18: Meta documents different teen rules, including excluding teens’ engagement from ad selection.',
      sourceIds: ['meta-business-tools', 'meta-partner-controls', 'meta-teen-ads']
    },
    audience: {
      title: 'Visible to whom?',
      text: 'Facebook offers audience selection; Instagram supports approving followers. These can meaningfully limit who sees a post, although tagging and other sharing contexts matter. Choosing an audience is different from controlling the platform’s data processing. The classmates and their reactions are fictional, and the game’s restricted audience genuinely limits simulated delivery.',
      sourceIds: ['meta-audience']
    },
    settings: {
      title: 'A boundary can still matter',
      text: 'Meta’s June 2026 announcement replaces the separate off-Meta disconnect setting with an expanded “Activity from other businesses” use control, through a regional rollout. It does not promise to stop receiving business events or erase history. Real controls vary by region, age, and product. The game’s settings are simplified; its record distinguishes earlier activity from what you stop sharing next.',
      sourceIds: ['meta-partner-controls', 'meta-teen-ads', 'meta-contacts']
    }
  }
};
