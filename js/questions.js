/* ==========================================================================
   CLAT MOCK-1 (MOCK CLAT 45) — Official 120-Question Bank & Answer Key
   Stored at: clat-mock-1/js/questions.js
   ========================================================================== */

export const CLAT_SECTIONS = [
  { id: 'quant', name: 'Quantitative Techniques', shortName: 'Quantitative', startQ: 1, endQ: 12, count: 12, passageSizes: [6, 6] },
  { id: 'legal', name: 'Legal Reasoning', shortName: 'Legal Reasoning', startQ: 13, endQ: 44, count: 32, passageSizes: [6, 7, 7, 6, 6] },
  { id: 'logical', name: 'Logical Reasoning', shortName: 'Logical Reasoning', startQ: 45, endQ: 68, count: 24, passageSizes: [6, 6, 6, 6] },
  { id: 'english', name: 'English Language', shortName: 'English', startQ: 69, endQ: 92, count: 24, passageSizes: [6, 6, 6, 6] },
  { id: 'gk', name: 'Current Affairs & GK', shortName: 'Current Affairs & GK', startQ: 93, endQ: 120, count: 28, passageSizes: [4, 6, 6, 6, 6] }
];

export const TOTAL_EXAM_SECONDS = 120 * 60; // 120 Minutes

const PASSAGES = {
  /* ==================== SECTION A: QUANTITATIVE TECHNIQUES ==================== */
  'quant-p1': {
    passageIndex: 1,
    passageTitle: 'Quantitative Techniques — Suman\'s Grocery Shop Pricing',
    passageRange: 'Questions 1–6',
    passageParagraphs: [
      'Directions (Q.1–Q.6): Study the information given below and answer the questions that follow.',
      'Suman, a grocery shop owner, buys a few items for her business and puts them on sale. She labels the price of each item such that the cost of a Dairy Product is 27/2 times the cost of a pack of Detergent. The cost of a packet of Masala is 40% less than that of a Dairy Product. The cost of a Stationery Item is 400% more than that of a packet of Masala. The cost of a packet of Namkeen is 20% more than the cost of a packet of Masala. The cost of a pack of Dry Fruits is Rs. 1500 more than a Dairy Product, and a box of Sweets costs 4 times the cost of a pack of Detergent. The cost of a pack of Detergent is Rs. 1000.'
    ]
  },
  'quant-p2': {
    passageIndex: 2,
    passageTitle: 'Quantitative Techniques — Ice Hockey Competition (Briar & Maxton)',
    passageRange: 'Questions 7–12',
    passageParagraphs: [
      'Directions (Q.7–Q.12): In an ice hockey competition, members of two different teams, Briar and Maxton, appeared for an individual test round. The average score of the Briar team is 80, and the average score of the Maxton team is 73. The average scores of the females and males of the Briar team are 70 and 85, respectively, and those of the Maxton team are 70 and 74, respectively. The number of males in the Maxton team is 3 times the number of females in the Briar team.'
    ]
  },

  /* ==================== SECTION B: LEGAL REASONING ==================== */
  'legal-p1': {
    passageIndex: 1,
    passageTitle: 'Legal Reasoning — The Immigration and Foreigners Act, 2025',
    passageRange: 'Questions 13–18',
    passageParagraphs: [
      'The Foreigners Regional Registration Office (FRRO) have issued a notice to Bollywood actor Imran Khan, directing him to leave India by October 28 after he attended a protest against Chief Election Commissioner Gyanesh Kumar in Mumbai on October 10.',
      'The Immigration and Foreigners Act, 2025, which replaced the Foreigners Act, 1946, provides the legal framework for regulating the entry, stay and removal of foreign nationals in India.',
      'The notice to Khan was issued under Sections 29 and 7 of the Act over allegations that he participated in the protest despite not being an Indian citizen.',
      'Under Section 29, the central government may direct the removal of a foreign national from India for violating any provision of the Act, or any rule or order made under it, or on the basis of an adverse security report. The provision also empowers officials to enforce the removal and recover the associated costs from the individual.',
      'Section 7 empowers the government to regulate or restrict the entry, departure or continued presence of foreign nationals in India. Orders under this provision can require a foreign national to leave the country, restrict their movement or impose conditions governing their residence and activities.',
      'The Act also prescribes penalties for specific violations. Under Section 23, a foreign national who overstays a visa, remains in India without a valid passport or travel document, or breaches visa conditions can face imprisonment of up to three years, a fine of up to ₹3 lakh, or both.',
      'Section 21 provides punishment for entering India without the required valid travel documents, while Section 22 deals with the knowing use or supply of forged or fraudulently obtained passports, travel documents or visas.',
      'Removal is not restricted to a single offence. Grounds for action can include overstaying a visa, remaining in India without valid travel documents, violating visa conditions, entering the country without the documents required by law, using forged immigration documents, or disobeying a lawful order governing a foreign national\'s presence or movement. Section 29 also provides for removal on the basis of an adverse security report.',
      'Whether participation in a protest can also amount to a violation is another question. Article 19 of the Constitution guarantees Indian citizens the freedom of speech and expression and the right to assemble peacefully, subject to reasonable restrictions. These citizen-specific rights do not extend to foreign nationals in the same manner.'
    ]
  },
  'legal-p2': {
    passageIndex: 2,
    passageTitle: 'Legal Reasoning — AI Authorship & Copyright Act, 1957 (DABUS)',
    passageRange: 'Questions 19–25',
    passageParagraphs: [
      'On August 31, 2026, the Indian Copyright Office examined whether an artwork created through artificial intelligence could qualify for copyright registration when the AI system itself was identified as its author. The dispute concerned A Recent Entrance to Paradise, an artwork generated through DABUS, an AI system developed by Stephen L. Thaler. Although the Copyright Office found that the artwork satisfied the originality requirement, it rejected the application because DABUS continued to be named as the author. The decision highlighted the distinction between originality, authorship and ownership under Indian copyright law.',
      'Section 13 of the Copyright Act, 1957 recognises copyright in original literary, dramatic, musical and artistic works. Although the Act does not define originality, the Supreme Court in Eastern Book Company v. D.B. Modak explained that copyright protection does not require novelty or inventiveness. A work must instead originate independently and demonstrate a minimum degree of creativity. The arrangement of colours, shapes, spatial relationships and other expressive elements may satisfy this requirement where the resulting expression is not merely copied or mechanically reproduced from an existing work. Establishing originality, however, does not automatically resolve the question of legal authorship.',
      'Section 2(d)(vi) addresses computer-generated literary, dramatic, musical and artistic works and identifies the author as the person who causes the work to be created. Accordingly, determining authorship requires identifying the legally recognised person responsible for bringing the particular work into existence. Relevant considerations may include creating or configuring the system, supplying or curating the relevant inputs and initiating the process that produces the work. The fact that an AI system performs the computational operations resulting in the final output does not necessarily make that system the legally recognised author.',
      'Authorship also affects ownership. Under Section 17, the author is ordinarily the first owner of copyright, subject to statutory exceptions. Section 18 permits assignment of copyright, while Section 19 requires a valid assignment to be in writing and signed by the assignor or an authorised agent. It must identify the work, specify the rights assigned, the duration and territorial extent of the assignment, and the amount of royalty and any other consideration payable. Thus, claiming ownership of a work is distinct from establishing authorship or a legally valid transfer of copyright.',
      'In the DABUS dispute, the Registrar found that Thaler had created and configured the system, supplied and curated the relevant inputs, and initiated the process resulting in the artwork. DABUS was neither a natural nor a juristic person recognised by law and therefore could not be recognised as the statutory author. Thaler was given an opportunity to amend the authorship particulars but declined. Consequently, the application was rejected despite the artwork satisfying the originality requirement. The decision did not determine that every AI-assisted or AI-generated work is incapable of receiving copyright protection.'
    ]
  },
  'legal-p3': {
    passageIndex: 3,
    passageTitle: 'Legal Reasoning — Articles 14, 15 and 16 of the Constitution of India',
    passageRange: 'Questions 26–32',
    passageParagraphs: [
      'Article 14 of the Constitution of India reads as under: "The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India."',
      'The said Article is clearly in two parts — while it commands the State not to deny to any person "equality before law", it also commands the State not to deny the "equal protection of the laws". Equality before law prohibits discrimination. It is a negative concept. The concept of "equal protection of the laws" requires the State to give special treatment to persons in different situations in order to establish equality amongst all. It is positive in character. Therefore, the necessary corollary to this would be that equals would be treated equally, whilst un-equals would have to be treated unequally.',
      'Article 15 secures the citizens from every sort of discrimination by the State, on the grounds of religion, race, caste, sex or place of birth or any of them. However, this Article does not prevent the State from making any special provisions for women or children. Further, it also allows the State to extend special provisions for socially and economically backward classes for their advancement. It applies to the Scheduled Castes (SC) and Scheduled Tribes (ST) as well.',
      'Article 16 assures equality of opportunity in matters of public employment and prevents the State from any sort of discrimination on the grounds of religion, race, caste, sex, descent, place of birth, residence or any of them. This Article also provides the autonomy to the State to grant special provisions for the backward classes, under-represented States, SC & ST for posts under the State. Local candidates may also be given preference in certain posts. Reservation of posts for people of a certain religion or denomination in a religious or denominational institution will not be deemed illegal.'
    ]
  },
  'legal-p4': {
    passageIndex: 4,
    passageTitle: 'Legal Reasoning — Undue Influence (Section 16, Indian Contract Act, 1872)',
    passageRange: 'Questions 33–38',
    passageParagraphs: [
      'Section 16 of the Indian Contract Act, 1872 provides that a contract is said to be induced by undue influence where the relations between the parties are such that one party is in a position to dominate the will of the other and uses that position to obtain an unfair advantage.',
      'A person is deemed to be in a position to dominate the will of another where that person holds real or apparent authority over the other, stands in a fiduciary relationship with the other, or enters into a contract with a person whose mental capacity is temporarily or permanently affected by reason of age, illness, or mental or bodily distress. The existence of influence or inequality between the parties is not by itself sufficient; the relevant question is whether one party was in a position to dominate the other\'s will and used that position to obtain an unfair advantage.',
      'Where a person\'s mental capacity is relied upon, mere stress or difficulty is not necessarily sufficient. The circumstances must show that age, illness, or mental or bodily distress affected the person\'s mental capacity in a manner that made the person susceptible to the influence of the other party.',
      'Section 16(3) contains a special rule relating to the burden of proof. Where a person who is in a position to dominate the will of another enters into a transaction with that person, and the transaction appears on its face or from the evidence to be unconscionable, the burden of proving that the contract was not induced by undue influence shifts to the person who was in the position to dominate the other\'s will. Thus, for this burden to shift, it must first be shown that one party was in a position to dominate the other\'s will and that the transaction appears unconscionable.'
    ]
  },
  'legal-p5': {
    passageIndex: 5,
    passageTitle: 'Legal Reasoning — Chronological Concurrence in Criminal Law',
    passageRange: 'Questions 39–44',
    passageParagraphs: [
      'The concept of chronological concurrence in criminal law means that the mental state required for a crime (mens rea) must exist at the same time as the physical act that constitutes the crime (actus reus). This is because the law does not want to punish people for acts that they committed without the requisite mental state. Concurrence must be with the act rather than the outcome. A change of mind will not make the crime go away.',
      'For example, if D stabs his victim with the intent to kill him, but only wounds him, and then tosses the victim into a river believing the victim is dead, D is not guilty of murder. This is because D did not have the mens rea for murder at the time he committed the actus reus. D may be guilty of attempted murder or assault, but not murder.',
      'There are a few exceptions to the rule of chronological concurrence. One exception is insanity. If D was insane at the time he committed the actus reus, he is not guilty of any crime, even if he had the mens rea for the crime. Another exception is involuntary intoxication. If D was intoxicated by drugs or alcohol against his will and was unable to form the requisite mens rea, he is not guilty of the crime.',
      'Finally, there is the case of mistake of fact. If D makes a mistake about a material fact that negates the mens rea for the crime, he is not guilty of the crime. For example, if D believes that he is authorized to use force against his victim, but he is not, he may not be guilty of assault.',
      'The general rule is that if D\'s act causes a different harm than he intended, he is not liable for the greater harm. However, if the actual harm is related to the intended harm, D may be liable for the less serious crime. For example, if D intends to rob a bank but accidentally shoots and kills a bank teller, D may be guilty of manslaughter, but not murder.',
      'In conclusion, the principle of chronological concurrence is important because it ensures that people are only punished for crimes that they committed with the requisite mental state.'
    ]
  },

  /* ==================== SECTION C: LOGICAL REASONING ==================== */
  'logical-p1': {
    passageIndex: 1,
    passageTitle: 'Logical Reasoning — Students Opposing Under-16 Social Media Ban',
    passageRange: 'Questions 45–50',
    passageParagraphs: [
      'Students opposing a blanket social media ban for those under sixteen argue that such a measure oversimplifies a complex problem. For many young people, social media is not merely entertainment but also a space for communication, learning, maintaining friendships, discovering interests and participating in discussions on issues that affect them. Students acknowledge genuine risks such as cyberbullying, harmful content, compulsive use and contact with strangers, but they contend that these dangers should be addressed through stronger regulation rather than complete exclusion.',
      'In their view, greater responsibility should fall on technology companies whose platforms and algorithms shape online behaviour. Stricter moderation, age-appropriate feeds, better reporting systems, stronger privacy safeguards and effective parental controls could reduce harm without removing the benefits of digital participation. Students also question whether a ban would be practical, since age restrictions can often be bypassed through false information or alternative accounts, potentially pushing young users towards less regulated online spaces.',
      'They further argue that social media can provide educational resources, creative communities and opportunities for young people who may find face-to-face interaction difficult. Removing access, they say, does little to teach responsible digital behaviour. Instead, schools and families should strengthen digital literacy, critical thinking and awareness of online risks. Students therefore demand that governments focus on making social media safer rather than simply shutting young people out of it. They maintain that policies affecting teenagers should balance protection from harm with opportunities for learning, communication and responsible participation, and that young people themselves should have a meaningful voice in decisions governing the digital spaces they use.'
    ]
  },
  'logical-p2': {
    passageIndex: 2,
    passageTitle: 'Logical Reasoning — Covert AI Manipulation & Auto-Complete Bias',
    passageRange: 'Questions 51–56',
    passageParagraphs: [
      'Using AI to auto-complete written communications may be tempting. But the large language models may also auto-complete thoughts. Few people realize that generative AI chatbots are pushing them to think a certain way, says information scientist Mor Naaman of Cornell University. "It\'s the subtlest of manipulations." Such manipulation may not matter much when letting AI agents such as ChatGPT and Claude auto-complete a banal email. But when people use an AI\'s auto-complete function to opine on weightier societal matters, such as whether or not standardized testing should be used in education, the death penalty should be illegal or felons should be allowed to vote — three issues explored in the study — then the model\'s bias can have significant societal impact.',
      'Large swaths of people using the same biased model could sway an entire population\'s position on a given policy or politician. To flip a single election\'s outcome, "you only need 20,000 people in Pennsylvania," Naaman says. How to inoculate people against covert AI manipulation remains unclear. Many models include disclaimers, such as "ChatGPT can make mistakes. Check important info." But people remained strikingly susceptible to the study AI\'s persuasive power.'
    ]
  },
  'logical-p3': {
    passageIndex: 3,
    passageTitle: 'Logical Reasoning — Social Media, News Evolution & Misinformation',
    passageRange: 'Questions 57–62',
    passageParagraphs: [
      'Social media\'s evolution as a distributor of news and information has had serious consequences for what counts as fact and what gets conflated with the truth. A couple decades ago, not many people would have thought that an influencer or internet personality could be a source of news, but for many Americans their social media and news consumption are inextricably linked. When news started migrating to social media, it accelerated some of the changes already underway in the journalism industry. In the 50s and 60s, TV news in particular was more viewed by broadcasters as a public service. In the 80s, however, entertainment conglomerates began buying up networks and started expecting news networks to turn profits like other entertainment divisions. With cable came the 24-hour news cycle, and the emphasis on rapid and attention-grabbing stories. Then came the emphasis on pundits — journalist-esque figures designed to deliver opinions, not always facts. As the news industry changed, so too did people\'s expectations of what news should look like.',
      'With the shift to social media, these dynamics have intensified. When anyone can be a journalist the content is near-endless, supplying social media feeds 24/7/365. Instead of opinion sections or dedicated programs for pundits, social media feeds mix opinions and facts together. And the more outlandish a story, the better it does. With fast-paced, sensationalized news coverage and opinion-having taken to its extreme, more and more of what we see online is misinformation. The move towards social media as a source for news has allowed misinformation to flourish. Anyone with a social media account can become a "news" source. For individuals and outlets posting news, the goal is almost always to get seen by as many people as possible. What goes well on social media is not exactly even-keeled and well-researched stories. For posts on large platforms "outrage is the key to virality," as social psychologist Jonathan Haidt puts it. Out-of-context details distort what\'s real, and thanks to the "share" button, mistaken impressions can spread through a large network of people almost instantly.'
    ]
  },
  'logical-p4': {
    passageIndex: 4,
    passageTitle: 'Logical Reasoning — Circular Seating Arrangement (Policy Committee)',
    passageRange: 'Questions 63–68',
    passageParagraphs: [
      'Directions (Q.63–Q.68): Eight members of a policy committee — A, B, C, D, E, F, G and H — are seated around a circular table. All of them face the centre. References to clockwise and counterclockwise positions are made from the perspective of an observer looking down at the table.',
      'The following conditions apply:',
      '1. B sits second clockwise from A.',
      '2. C sits directly opposite B.',
      '3. D sits immediately counterclockwise from C.',
      '4. E sits adjacent to A.',
      '5. H sits adjacent to both B and F.',
      '6. G is adjacent to neither B nor D.'
    ]
  },

  /* ==================== SECTION D: ENGLISH LANGUAGE ==================== */
  'english-p1': {
    passageIndex: 1,
    passageTitle: 'Reading Comprehension — Solitude, Revision & the Craft of Writing',
    passageRange: 'Questions 69–74',
    passageParagraphs: [
      'A writer does not choose solitude; solitude chooses the writer. Long before I understood what it meant to arrange words on a page, I understood the particular silence of a room where someone is reading. My mother read constantly — novels, newspapers, recipes, letters from relatives abroad — and the household organised itself around her absorption. I learned early that language was not merely functional. It carried texture, temperature, the residue of feeling. A word spoken in anger lingered differently from the same word spoken in affection, and I grew fascinated by this capacity of language to hold more than its dictionary meaning.',
      'When I began to write, I imagined it as a performance — an exhibition of cleverness meant to impress. My early drafts were decorated with elaborate metaphors and obscure references, as though difficulty were proof of depth. It took years to understand that the real labour of writing is not addition but subtraction: the slow, sometimes painful removal of everything that stands between the writer and an honest sentence. Revision, I came to see, is less a matter of technique than of character. It asks whether you are willing to abandon what sounds impressive in favour of what is true.',
      'This is the central paradox of the craft. Writing demands withdrawal from the world, yet it exists only to reach another person. The writer retreats into solitude precisely in order to say something that could not be said in conversation — something too fragile, too layered, or too uncomfortable for the ordinary exchange of social life. If it succeeds, the reader feels not distance but intimacy, as though the writer were speaking directly to them across the silence of a room very much like the one in which the words were first set down.'
    ]
  },
  'english-p2': {
    passageIndex: 2,
    passageTitle: 'Reading Comprehension — Education, Obedience & Questioning',
    passageRange: 'Questions 75–80',
    passageParagraphs: [
      'The gravest danger in modern education is not ignorance but the systematic production of obedience. When a school measures its success by the uniformity of answers its students can reproduce, it has ceased to educate and has begun to train. Training has its place — one trains a carpenter to cut joints, a surgeon to suture wounds — but training alone cannot produce a thoughtful citizen. The thoughtful citizen is precisely the person who hesitates before a ready-made answer, who asks not merely "what is the correct response?" but "why is this considered correct, and by whom?"',
      'Yet our institutions reward the opposite temperament. The child who memorises efficiently is praised; the child who questions persistently is labelled difficult. Over time, this arrangement produces adults who are remarkably competent at following procedures and remarkably helpless when procedures fail. They can solve any problem that has been solved before, but they are bewildered by the genuinely new, because their education never required them to tolerate uncertainty or to think without a prescribed framework.',
      'The remedy is not to abolish structure — a classroom without structure is merely chaotic — but to make questioning the central activity rather than an interruption of it. A genuine question is not a sign of confusion; it is a sign of engagement. When a student asks why a historical event is interpreted one way rather than another, or why a mathematical proof takes a particular route, that student is doing the most important work education can offer: learning to think about thinking. If we dismiss such questions in favour of coverage and efficiency, we may produce graduates who pass every examination yet remain fundamentally uneducated, because they have never learned to interrogate the assumptions on which their knowledge rests.'
    ]
  },
  'english-p3': {
    passageIndex: 3,
    passageTitle: 'Reading Comprehension — Tradition, Reform & Judgment',
    passageRange: 'Questions 81–86',
    passageParagraphs: [
      'No civilisation can survive by standing still, nor can it survive by abandoning everything it has built. The challenge of reform is not to choose between tradition and modernity but to distinguish, within tradition, between what is valuable and what is merely inherited. A practice does not become virtuous simply because it is old, any more than a practice becomes wise simply because it is new. The reformer must exercise judgment — and judgment, unlike loyalty, requires the willingness to say that something cherished by one\'s own community is wrong.',
      'This is an uncomfortable position, and those who occupy it are attacked from both sides. Conservatives accuse the reformer of disloyalty, of importing foreign ideas to weaken the fabric of native culture. Radicals accuse the reformer of timidity, of preserving too much of a system that ought to be dismantled entirely. Yet both accusations miss the essential point. The reformer\'s loyalty is not to the past as it was, nor to the future as someone else imagines it, but to the principle that no society should ask its members to suffer for the sake of continuity.',
      'The difficulty is practical, not merely philosophical. Every institution — a family, a village council, a legal code — embodies assumptions that were once reasonable but may no longer be so. The work of reform is to examine these assumptions one by one, preserving those that serve human dignity and discarding those that do not. This is slower than revolution and less comfortable than conservatism, but it is the only approach that respects both the weight of experience and the demands of justice. Those who insist that tradition must be accepted whole, without scrutiny, confuse reverence with complacency.'
    ]
  },
  'english-p4': {
    passageIndex: 4,
    passageTitle: 'Reading Comprehension — Masterji and the Old School Building',
    passageRange: 'Questions 87–92',
    passageParagraphs: [
      'Masterji had not missed a morning walk in thirty-one years. He followed the same route — past the tamarind tree at the corner of Deshpande Lane, along the canal where women still washed clothes despite the new tap connections, and back through the temple courtyard where the priest\'s son, whom he had once taught to parse sentences, now sold mobile phone covers from a plastic sheet. The town had rearranged itself around him without asking his permission.',
      'He was spreading his newspaper on the veranda when Suresh appeared at the gate. Suresh had been a mediocre student but a decent human being, which Masterji had always considered the more important achievement. He now managed the local branch of a coaching institute that prepared students for entrance examinations.',
      '"They are converting the old school building," Suresh said, settling into the cane chair without being invited, in the manner of someone who had been visiting this veranda since childhood. "The trust has approved it. From next term, it will be our new centre."',
      'Masterji folded the newspaper with excessive care. The school building — with its high ceilings, its broad blackboards still bearing faint chalk ghosts of his own handwriting, its corridor where he had once confiscated a mango and shared it equally among five guilty boys — that building would now train students to eliminate wrong answers rather than to understand right ones.',
      '"You will be the chief guest at the inauguration," Suresh added, mistaking silence for hesitation.',
      'Masterji looked at the tamarind tree. It had survived the road-widening only because the municipality could not agree on who would pay for its removal. He wondered whether survival through indecision was something to be grateful for or merely the most common form of reprieve.'
    ]
  },

  /* ==================== SECTION E: CURRENT AFFAIRS & GK ==================== */
  'gk-p1': {
    passageIndex: 1,
    passageTitle: 'Current Affairs — Bhojshala Dispute',
    passageRange: 'Questions 93–96',
    passageParagraphs: [
      'The long-running dispute concerning the Bhojshala-Kamal Maula complex in Dhar, Madhya Pradesh, entered a significant legal phase in May 2026 when the Madhya Pradesh High Court delivered its judgment on competing claims relating to the protected monument. The structure has for decades been associated with different religious and historical narratives, resulting in litigation over its character and the right to worship at the site.',
      'The litigation followed a scientific investigation ordered by the High Court in 2024. Acting on the direction, the Archaeological Survey of India carried out surveys, excavations and documentation using archaeological and scientific techniques. The investigation examined inscriptions, sculptures, architectural fragments and other material recovered from the complex and its surrounding area. The Supreme Court had earlier directed that the investigation should not alter the character of the monument while the proceedings remained pending.',
      'In its May 2026 judgment, the High Court relied on archaeological material, historical literature and evidence concerning the site\'s architectural development. It also reconsidered an administrative arrangement that had regulated access by different communities on specified days. The Court directed that responsibility for conservation and supervision of the protected monument should continue with the Archaeological Survey of India.',
      'The judgment did not end the controversy. Challenges subsequently reached the Supreme Court, which in July declined to immediately restore the earlier arrangement and directed that an alternative space be made available for Friday prayers while the dispute awaited further consideration.',
      'The case therefore raises wider questions concerning archaeological evidence, protection of historic monuments, religious freedom and the role of constitutional courts in disputes involving contested places of worship.'
    ]
  },
  'gk-p2': {
    passageIndex: 2,
    passageTitle: 'Current Affairs — Greenland Crises',
    passageRange: 'Questions 97–102',
    passageParagraphs: [
      'The status of Greenland became a significant source of transatlantic tension during 2026 after United States President Donald Trump repeatedly argued that greater American control over the Arctic territory was necessary for national and regional security. The statements were rejected by political leaders in both Greenland and Denmark, who maintained that decisions concerning Greenland\'s political future must respect its people\'s right to self-determination and the sovereignty of the Kingdom of Denmark. In July, remarks made during a NATO summit again brought the disagreement into focus.',
      'The controversy emerged against the background of increasing strategic competition in the Arctic. Melting ice, potential shipping routes, critical-mineral deposits and increased Russian and Chinese activity have added to the region\'s geopolitical importance. Greenland also occupies a strategically significant position between North America and Europe and has long hosted American defence infrastructure.',
      'After months of tension, the United States, Denmark and Greenland signed a new security agreement in September 2026. The agreement allows expansion of American military activities and facilities while expressly recognising the sovereignty and territorial integrity of the Kingdom of Denmark and the Greenlandic people\'s right to self-determination. It also permits additional defence areas to be established through consultation among the parties.',
      'The arrangement supplements an earlier defence framework and provides for expanded American access while placing importance on Greenlandic interests, including traditional economic and cultural activities. It also envisages safeguards concerning strategic foreign investment.',
      'The dispute illustrates how questions of territorial sovereignty, indigenous self-government, military alliances and access to strategic resources increasingly intersect in Arctic politics. Although the September agreement eased immediate diplomatic tensions, debate over Greenland\'s long-term constitutional future and the strategic balance in the Arctic continues.'
    ]
  },
  'gk-p3': {
    passageIndex: 3,
    passageTitle: 'Current Affairs — 10 Years of UPI',
    passageRange: 'Questions 103–108',
    passageParagraphs: [
      'India marked ten years of the Unified Payments Interface (UPI) in 2026, highlighting the transformation of the country\'s retail-payment ecosystem since the platform was introduced a decade earlier. Developed as an interoperable payment architecture, UPI enabled users to transfer money instantly between bank accounts through mobile applications without relying on traditional account-number-based processes for every transaction.',
      'Over the decade, UPI expanded from a domestic payments innovation into a central component of India\'s digital public infrastructure. Its growth was supported by banks, payment-service providers, technology companies and public institutions. QR-based merchant payments became particularly widespread, helping digital transactions move beyond large urban centres into smaller towns and local markets.',
      'The platform also underwent continuous technological expansion. New features were introduced for low-value transactions, recurring payments and cross-border use, while interoperability allowed customers of different banks and applications to transact through a common network. India also began cooperating with foreign jurisdictions to enable acceptance of UPI or establish linkages between domestic instant-payment systems.',
      'The rapid growth of UPI has simultaneously raised policy questions relating to fraud prevention, cybersecurity, consumer protection, infrastructure costs and the financial sustainability of payment-service providers. Debates over charges on merchant transactions have illustrated the challenge of maintaining an affordable digital-payment system while ensuring adequate incentives for institutions operating the underlying infrastructure.',
      'The ten-year milestone therefore represents not merely the growth of a payment application but the development of a broader interoperable digital-payments ecosystem with increasing international relevance.'
    ]
  },
  'gk-p4': {
    passageIndex: 4,
    passageTitle: 'Current Affairs — Indus Water Treaty',
    passageRange: 'Questions 109–114',
    passageParagraphs: [
      'The Indus Waters Treaty (IWT) returned to the centre of India-Pakistan relations after the terrorist attack at Pahalgam on 22 April 2025. The following day, India\'s Cabinet Committee on Security announced that the Treaty would be held in abeyance with immediate effect until Pakistan "credibly and irrevocably" ended its support for cross-border terrorism. The Government of India continued to describe the Treaty as being in abeyance in 2026.',
      'The agreement had provided a framework for managing the waters of the Indus river system for more than six decades, surviving several periods of serious political and military tension between the two countries. Besides allocating rights over different rivers, it established arrangements for exchanging information, examining projects and resolving disagreements. A bilateral institutional mechanism was created through which representatives of both countries could regularly discuss questions arising from implementation of the agreement.',
      'The recent development has significant implications because the Indus basin supports extensive irrigation, hydropower generation and agriculture across the region. India has also renewed attention on projects intended to utilise more effectively the waters available to it, including projects associated with the Ravi river system. In 2026, the Union government highlighted progress on the Shahpurkandi project and revival of the Ujh Multipurpose Project.',
      'The controversy has consequently moved beyond the technical management of rivers. It raises questions concerning transboundary water cooperation, treaty obligations, hydroelectric development and the relationship between bilateral agreements and wider security disputes.'
    ]
  },
  'gk-p5': {
    passageIndex: 5,
    passageTitle: 'Current Affairs — Naxal Free India',
    passageRange: 'Questions 115–120',
    passageParagraphs: [
      'India\'s announcement of a major achievement in its fight against Left-Wing Extremism marked an important development in the country\'s internal security landscape. For decades, Naxalism had posed significant challenges to governance, public safety and socio-economic development, particularly in remote, forested and tribal-dominated regions. The movement\'s persistence raised broader questions concerning inequality, state capacity, land rights and access to essential public services.',
      'The government\'s response evolved from predominantly security-oriented interventions towards a more integrated framework combining law enforcement, infrastructure development, community participation and rehabilitation. This approach recognised that sustainable peace requires more than the reduction of armed violence. It also depends on the capacity of public institutions to deliver education, healthcare, livelihood opportunities and accountable governance.',
      'Geographical isolation was an important factor contributing to the persistence of extremist influence in certain regions. Difficult terrain, inadequate transportation networks and limited communication infrastructure historically restricted administrative access. The expansion of roads, telecommunications and public institutions was therefore viewed as an essential component of efforts to strengthen governance.',
      'The transition towards a post-extremism environment also presents important policy challenges. Areas previously affected by prolonged instability may continue to experience developmental deficits even after improvements in the security situation. Rehabilitation of former members of extremist organisations, restoration of community trust and protection of vulnerable populations remain significant considerations.',
      'From a constitutional perspective, the issue illustrates the relationship between Union and State governments in managing internal security. Effective coordination requires cooperation among institutions responsible for policing, welfare delivery, regional development and the protection of constitutional rights.',
      'The broader significance of this development extends beyond immediate security outcomes. It highlights the importance of institutional accountability, inclusive development and sustained public investment in preventing the recurrence of extremist violence. Ultimately, the durability of peace depends on whether improvements in security translate into meaningful social and economic opportunities for affected communities.'
    ]
  }
};

const SECTION_NAMES = Object.fromEntries(CLAT_SECTIONS.map((s) => [s.id, s.name]));

// Format: [id, sectionId, passageId, questionText, [optA, optB, optC, optD], correctOptionIndex (0=A, 1=B, 2=C, 3=D)]
const RAW_QUESTIONS = [
  /* ==================== SECTION A: QUANTITATIVE TECHNIQUES (Q1–Q12) ==================== */
  [
    1, 'quant', 'quant-p1',
    'Find the total cost of a Dairy Product and 2 packets of Masala.',
    ['Rs. 29,700', 'Rs. 28,790', 'Rs. 31,500', 'Rs. 35,670'],
    0
  ],
  [
    2, 'quant', 'quant-p1',
    'Find the ratio of the cost of a pack of Dry Fruits to the combined cost of a box of Sweets and a pack of Detergent.',
    ['1:4', '4:3', '3:1', '4:7'],
    2
  ],
  [
    3, 'quant', 'quant-p1',
    'If the cost of a box of Sweets and a pack of Detergent are increased by 20% and 15% respectively, find the average of the newly increased costs of these two items.',
    ['Rs. 2700', 'Rs. 2975', 'Rs. 3000', 'Rs. 3890'],
    1
  ],
  [
    4, 'quant', 'quant-p1',
    'A customer visits the shop and buys a Stationery Item, whereas a second customer buys a packet of Namkeen and a pack of Dry Fruits. Find the difference between the total amounts paid by these two customers.',
    ['Rs. 13,456', 'Rs. 15,897', 'Rs. 14,000', 'Rs. 15,780'],
    3
  ],
  [
    5, 'quant', 'quant-p1',
    'Find the difference between the average cost of a Stationery Item and a box of Sweets, and the average cost of a pack of Dry Fruits, a Dairy Product, and a packet of Masala.',
    ['Rs. 9,500', 'Rs. 10,050', 'Rs. 11,250', 'Rs. 12,050'],
    1
  ],
  [
    6, 'quant', 'quant-p1',
    'Suman introduces a "Festive Combo" consisting of 1 pack of Dry Fruits, 2 boxes of Sweets, and 1 packet of Namkeen. If she prices this combo at 15% less than the sum of their individual costs, what is the final selling price of the Festive Combo?',
    ['Rs. 27,812', 'Rs. 28,450', 'Rs. 26,900', 'Rs. 27,218'],
    0
  ],
  [
    7, 'quant', 'quant-p2',
    'Find the ratio of the number of females to males in the Briar team.',
    ['1:2', '1:3', '2:3', '3:4'],
    0
  ],
  [
    8, 'quant', 'quant-p2',
    'Find the combined average score of all the members of the Briar and Maxton teams.',
    ['68', '72', '76', '82'],
    2
  ],
  [
    9, 'quant', 'quant-p2',
    'Find the difference between the number of males in the Maxton team and the Briar team if the number of females in the Maxton team is 8.',
    ['6', '8', '10', '12'],
    1
  ],
  [
    10, 'quant', 'quant-p2',
    'Find the sum of the overall average score of all females and the overall average score of all males across both teams.',
    ['148.4', '152.5', '162.6', '172.4'],
    0
  ],
  [
    11, 'quant', 'quant-p2',
    'Suppose the initial number of females in the Briar team is 12. If 25% of the male members from the Maxton team are transferred to the Briar team (assuming the transferred members have an average score equal to the overall male average of the Maxton team), what will be the new overall average score of the Briar team?',
    ['78.2', '78.8', '79.4', '80.1'],
    1
  ],
  [
    12, 'quant', 'quant-p2',
    'Find the ratio of the total combined score of all male participants across both teams to the total combined score of all female participants across both teams.',
    ['12:5', '14:5', '16:7', '18:7'],
    1
  ],

  /* ==================== SECTION B: LEGAL REASONING (Q13–Q44) ==================== */
  [
    13, 'legal', 'legal-p1',
    'Mira, a foreign national student studying in India, received a government-issued notice asking her to seek approval before travelling outside the city listed in her registration records. Her visa remained valid for six more months. When her college selected her for a debate competition in another state, she travelled with the team without contacting immigration authorities. Officials later questioned her journey, and Mira referred to her visa. Can Mira rely on her valid visa to challenge the movement restriction imposed under Section 7?',
    [
      'Yes, because a valid visa permits travel throughout India unless removal proceedings have been initiated under Section 29.',
      'Yes, because Section 7 regulates the residence of foreign nationals but does not authorise restrictions on their movement.',
      'No, because Section 7 permits the government to restrict a foreign national\'s movement even during the validity of a visa.',
      'No, because travelling beyond the registered city without approval necessarily amounts to overstaying under Section 23.'
    ],
    2
  ],
  [
    14, 'legal', 'legal-p1',
    'Omar, a foreign researcher, had recently renewed his visa and kept his residential registration updated. Security officials sent the central government a written assessment warning that his meetings with an overseas organisation posed a risk. The government directed him to leave India. Omar challenged the direction, producing his valid passport, visa and residence records and arguing that his immigration documents were in order. Is the central government\'s direction to remove Omar supported by Section 29 on the stated facts?',
    [
      'Yes, because an adverse assessment from security officials may independently support removal despite compliance with visa conditions.',
      'No, because removal under Section 29 requires proof that the foreign national violated a visa condition or immigration order.',
      'No, because security concerns may justify restrictions under Section 7 but cannot independently justify removal under Section 29.',
      'Yes, because security concerns are treated as visa violations punishable under Section 23, even without a separate breach.'
    ],
    0
  ],
  [
    15, 'legal', 'legal-p1',
    'Elena entered India with a valid passport and a visa expiring on 31 March. Her university offered her an internship beginning in April, and she accepted without first extending her visa. She continued living in India until 20 June. When proceedings began, Elena produced her valid passport, admission letter and internship agreement, maintaining that these documents established the legitimacy of her stay. Does Elena\'s continued stay attract liability under the Act?',
    [
      'No, because her lawful entry and possession of a valid passport prevent liability under Section 23.',
      'Yes, because accepting an internship after entering India constitutes unlawful entry punishable under Section 21.',
      'No, because her university documents provide an independent basis for continuing her stay after visa expiry.',
      'Yes, because remaining in India beyond the visa\'s validity is punishable under Section 23 despite lawful initial entry.'
    ],
    3
  ],
  [
    16, 'legal', 'legal-p1',
    'Idris held a visa for India but misplaced his passport shortly before travelling. Rather than postponing his journey, he presented a photograph of its identification page on his phone at a border checkpoint and crossed into India. Officials discovered the situation shortly afterward. Idris argued that the photograph proved his identity and that his visa had not expired when he entered. Which provision most directly governs Idris\'s act of entering India in these circumstances?',
    [
      'Section 23, because the validity of his visa determines whether his entry without a passport is punishable.',
      'Section 21, because crossing into India without the required valid travel documents is a separately punishable act.',
      'Section 22, because presenting a photograph of a passport amounts to knowingly using a forged travel document.',
      'Section 7, because the entry of a visa holder is governed exclusively by restrictions on movement and residence.'
    ],
    1
  ],
  [
    17, 'legal', 'legal-p1',
    'Sofia\'s application to extend her visa was refused. A travel broker then sent her a new visa image showing a later expiry date. In their messages, he explained that he had replaced the date on the old file instead of applying to the consulate. Sofia saved the file and presented a printout at an immigration desk, saying the broker had handled the paperwork. Does Sofia\'s conduct fall within the scope of Section 22 of the Act?',
    [
      'Yes, because knowingly presenting an altered visa falls within Section 22 even when another person prepared the document.',
      'No, because Section 22 applies to the person preparing a forged document rather than the person presenting it.',
      'Yes, because Section 23 treats every unsuccessful visa renewal application as fraudulent use of immigration documents.',
      'No, because Section 22 covers forged passports and travel documents but excludes alterations to visa validity.'
    ],
    0
  ],
  [
    18, 'legal', 'legal-p1',
    'Leila, a foreign student whose visa was still valid, joined a peaceful demonstration outside a government office. A photograph of her holding a placard appeared online. Days later, the central government directed her to leave India under Section 29. The accompanying notice referred to the photograph and her foreign nationality. Leila challenged the direction, while officials pointed to Article 19\'s wording. Do the reasons stated in Leila\'s removal notice establish a ground for removal under Section 29?',
    [
      'Yes, because the absence of an Article 19 assembly guarantee for foreign nationals makes participation in a protest a ground for removal.',
      'No, because a foreign national holding a valid visa enjoys the same constitutional freedom of assembly as an Indian citizen.',
      'Yes, because Section 7 authorises restrictions on foreign nationals, making participation in public demonstrations independently punishable.',
      'No, because foreign nationality and participation in a protest do not, without more, establish a violation or adverse security report under Section 29.'
    ],
    3
  ],
  [
    19, 'legal', 'legal-p2',
    'According to the passage, which of the following best reflects the standard for determining originality in a copyrightable work?',
    [
      'The work must introduce an innovative technique and demonstrate substantial creativity beyond existing artistic expressions.',
      'The work must be independently produced, regardless of whether its expression involves any creative choices.',
      'The work must originate independently and involve a minimum degree of creativity, without necessarily demonstrating novelty.',
      'The work must differ from existing creations and demonstrate technical inventiveness in its method of production.'
    ],
    2
  ],
  [
    20, 'legal', 'legal-p2',
    'Which consideration is most relevant to identifying the author of a computer-generated work under Section 2(d)(vi) of the Copyright Act, 1957?',
    [
      'Whether the person\'s involvement and creative decisions caused the particular work to be created.',
      'Whether a person possesses ownership rights over the computer system through which the work was generated.',
      'Whether a person was the first to publish the computer-generated work and claim copyright over its expression.',
      'Whether the computer system independently selected the final arrangement without receiving further human instructions.'
    ],
    0
  ],
  [
    21, 'legal', 'legal-p2',
    'Why did the recognition of originality in the DABUS artwork not establish DABUS as its legal author?',
    [
      'Because originality determines whether an artwork is independently created but requires the artwork to be registered before authorship arises.',
      'Because originality establishes creative expression, whereas authorship requires the artwork to have been produced without computational assistance.',
      'Because originality concerns the creative arrangement of a work, whereas authorship depends exclusively on who owns the software.',
      'Because satisfaction of the originality requirement does not determine authorship, and DABUS was not a natural or juristic person recognised as the statutory author.'
    ],
    3
  ],
  [
    22, 'legal', 'legal-p2',
    'Which of the following most accurately explains the relationship between authorship and copyright ownership under the provisions discussed in the passage?',
    [
      'Copyright ownership belongs to the person who registers the work, irrespective of who caused its creation.',
      'The author is ordinarily the first owner of copyright, although ownership may subsequently change through a valid assignment.',
      'Copyright ownership belongs to the person who supplies the technological infrastructure, regardless of creative involvement.',
      'The author retains copyright ownership throughout the protection period because statutory rights cannot be assigned.'
    ],
    1
  ],
  [
    23, 'legal', 'legal-p2',
    'What is the most accurate inference from the Copyright Office\'s decision to reject the DABUS application despite recognising the artwork\'s originality?',
    [
      'Recognition of originality becomes ineffective whenever a computer system performs a substantial part of the creative process.',
      'Recognition of originality establishes copyright ownership but prevents an applicant from correcting the identity of the author.',
      'Satisfaction of the originality requirement does not cure a defect concerning the legally recognised authorship of the work.',
      'Satisfaction of the originality requirement requires registration once the applicant demonstrates involvement in configuring the system.'
    ],
    2
  ],
  [
    24, 'legal', 'legal-p2',
    'Naina entered a digital-art competition using software developed by Aarav. She experimented with several detailed prompts, changed the colour arrangements, rejected multiple generated images and selected a final composition for submission. Aarav had created the software but had no involvement in producing Naina\'s particular image. The organisers questioned whether the software, its developer or Naina should be identified as the author. Who has the strongest claim to authorship under Section 2(d)(vi), applying the principles in the passage?',
    [
      'Naina, because her inputs, creative selections and decisions were responsible for causing the particular artwork to be created.',
      'Aarav, because developing the underlying software establishes authorship over the works subsequently generated through that system.',
      'The software, because independently producing the final visual arrangement establishes its legal authorship over the artwork.',
      'Neither Naina nor Aarav, because a work generated through artificial intelligence cannot have a legally recognised author.'
    ],
    0
  ],
  [
    25, 'legal', 'legal-p2',
    'Ria, the recognised author and first copyright owner of an AI-assisted illustration, agreed with a publishing company to transfer reproduction rights for three years throughout India for ₹20,000. The company paid her and published the illustration. Their agreement was discussed over a telephone call, and neither party signed any document recording the transfer. A dispute arose when Ria later licensed the illustration elsewhere. Has the publishing company acquired copyright through a valid assignment under Sections 18 and 19?',
    [
      'Yes, because payment of consideration and publication establish an effective assignment of the agreed reproduction rights.',
      'Yes, because identifying the duration and territorial extent makes an oral assignment enforceable under Section 19.',
      'No, because copyright in an AI-assisted illustration cannot be transferred through an assignment under Section 18.',
      'No, because a copyright assignment must be recorded in writing and signed by the assignor or an authorised agent.'
    ],
    3
  ],
  [
    26, 'legal', 'legal-p3',
    'Raghav, a businessman, constructed a water reservoir on land owned by a private residents\' association in Madhya Pradesh. The reservoir was funded and managed entirely by the association, without government involvement, and was intended for its members. When Aditya, a visitor born in Rajasthan, requested access, the association refused because he was not born locally. Aditya filed a writ petition alleging discrimination. Will Aditya succeed in his claim under Article 15?',
    [
      'Yes, because Article 15 prohibits discrimination based on place of birth, irrespective of the authority responsible for it.',
      'Yes, because providing water to some individuals while excluding others necessarily violates the constitutional guarantee of equality.',
      'No, because an association that constructs a reservoir may restrict access without regard to constitutional equality principles.',
      'No, because the restriction was imposed by a private association rather than the State, against which Article 15 operates.'
    ],
    3
  ],
  [
    27, 'legal', 'legal-p3',
    'The Madhya Pradesh government developed a public water distribution centre in Sehore through a public-private partnership. The centre was operated under government directions and provided drinking water to residents. During a shortage, officials introduced a rule allowing access only to persons born in Madhya Pradesh. Neeraj, an Indian citizen born in Gujarat but residing in Sehore, was denied water and challenged the restriction under Article 15. Is Neeraj\'s challenge sustainable under Article 15?',
    [
      'No, because the government may distinguish between residents based on their place of birth when distributing public resources.',
      'No, because facilities developed through public-private partnerships are excluded from the prohibition against State discrimination.',
      'Yes, because the State-supported facility denies access to an Indian citizen solely on the prohibited ground of place of birth.',
      'Yes, because Article 15 requires every government facility to provide identical services irrespective of financial or administrative limitations.'
    ],
    2
  ],
  [
    28, 'legal', 'legal-p3',
    'Sophia, a Canadian citizen, travelled to India for a research project and stayed in a town where a government-operated water centre served local residents. When she requested access, an official refused because she was a foreign national. Can Sophia successfully invoke Article 15 against the restriction?',
    [
      'Yes, because Article 15 protects every person within Indian territory against discrimination by government authorities.',
      'Yes, because foreign nationals temporarily residing in India enjoy the same citizenship-specific guarantees as Indian citizens.',
      'No, because Article 15 protects citizens against specified forms of State discrimination and does not extend that guarantee to foreign nationals.',
      'No, because foreign nationals are excluded from every constitutional guarantee concerning equality and government action.'
    ],
    2
  ],
  [
    29, 'legal', 'legal-p3',
    'During a severe summer, the Rajasthan government established additional drinking-water distribution counters near several public schools. These counters were reserved for women and children, who had experienced particular difficulties accessing existing facilities. The original public counters remained available to everyone. A group of male residents challenged the arrangement, arguing that publicly funded facilities could not provide preferential access to particular sections of society. Is the government\'s arrangement constitutionally permissible under Article 15?',
    [
      'No, because the State must provide identical facilities to every citizen regardless of differences in their circumstances.',
      'Yes, because Article 15 expressly permits the State to make special provisions for women and children.',
      'No, because preferential access based on sex is prohibited even when the measure benefits women and children.',
      'Yes, because the State may create preferential facilities for any group without considering constitutional equality requirements.'
    ],
    1
  ],
  [
    30, 'legal', 'legal-p3',
    'Parliament introduced a hypothetical tax scheme under which individuals earning up to ₹8 lakh annually would pay income tax at 12%, while those earning above ₹8 lakh would pay 22%. A group of higher-income taxpayers challenged the scheme, arguing that the Constitution required the government to impose an identical tax rate on every individual, regardless of income. The government defended the distinction between the two income groups. Does the difference in tax rates necessarily violate Article 14?',
    [
      'Yes, because equality before the law requires the government to impose the same tax rate on every taxpayer.',
      'No, because persons in different income categories may be treated differently when the classification reflects their differing circumstances.',
      'No, because Article 15 expressly authorises different income-tax rates for economically distinct groups of taxpayers.',
      'Yes, because Article 14 prohibits the State from creating classifications that impose different financial obligations.'
    ],
    1
  ],
  [
    31, 'legal', 'legal-p3',
    'A State-administered Jain denominational institution advertised a post involving the teaching of Jain religious practices and the supervision of religious ceremonies. Under the applicable statutory rule, the position was reserved for a person professing the Jain faith. Daniel, who followed Christianity but possessed substantial knowledge of Jain philosophy, applied for the position. His application was rejected because he did not satisfy the religious qualification. Daniel challenged the decision. Is Daniel\'s challenge likely to succeed?',
    [
      'Yes, because Article 16 prohibits religious qualifications for every public post, including offices connected with religious institutions.',
      'No, because Article 16 recognises an exception permitting religious qualifications for specified posts in religious or denominational institutions.',
      'Yes, because knowledge of religious practices must be treated as equivalent to membership of the denomination concerned.',
      'No, because every appointment made by a religious institution falls entirely outside the constitutional provisions governing public employment.'
    ],
    1
  ],
  [
    32, 'legal', 'legal-p3',
    'Aditi, a transgender woman, applied for an administrative assistant position in a government-run educational institution. She satisfied the educational qualifications and performed well in the recruitment examination. However, the selection committee rejected her application under an internal policy that permitted applications only from male candidates. Aditi challenged the decision, arguing that the rejection was unrelated to her qualifications or performance and was based on sex. Is Aditi\'s challenge sustainable under Article 16?',
    [
      'No, because the State may prescribe sex-based eligibility conditions for administrative positions without constitutional scrutiny.',
      'No, because Article 16 protects equality in public employment only against discrimination based on religion and caste.',
      'Yes, because Article 16 prohibits discrimination based on sex in matters of public employment, and the rejection rests on that ground.',
      'Yes, because Article 16 requires government employers to appoint every applicant who satisfies the prescribed educational qualifications.'
    ],
    2
  ],
  [
    33, 'legal', 'legal-p4',
    'Subhash, an eighty-year-old man suffering from dementia and physical infirmity, depended entirely on Mohan, his caretaker, as his son lived in another city. Mohan persuaded Subhash to sell him an ancestral house worth ₹80,00,000 for ₹6,00,000, repeatedly reminding him that he alone cared for him and that Subhash should "think wisely." Subhash eventually executed the sale deed. After learning of the transaction, Subhash, with the assistance of his son, challenged the sale deed in court alleging undue influence. How should the court decide?',
    [
      'In favour of Mohan, because execution of a registered deed establishes that Subhash acted independently and voluntarily.',
      'In favour of Subhash, because Mohan used his position of dominance to obtain an unfair advantage from him.',
      'In favour of Mohan, because persuasion by a caretaker cannot amount to undue influence without an express threat.',
      'In favour of Subhash solely because the sale consideration was substantially below the property\'s market value.'
    ],
    1
  ],
  [
    34, 'legal', 'legal-p4',
    'After Subhash, assisted by his son, challenged the sale deed, he produced medical records showing serious cognitive decline and official valuation records showing that the ₹80,00,000 property had been transferred to Mohan for ₹6,00,000. The trial judge directed Mohan to prove that the transaction was not induced by undue influence. Mohan objected, arguing that the burden must always remain on Subhash. Was the trial judge\'s direction justified under the passage?',
    [
      'No, because registration of the sale deed requires Subhash to prove undue influence throughout the proceedings.',
      'No, because the burden can shift only after Subhash conclusively proves that Mohan actually exercised undue influence.',
      'Yes, because Mohan was in a position to dominate Subhash\'s will and the transaction appeared unconscionable.',
      'Yes, because a substantial difference between market value and sale price automatically shifts the burden irrespective of the parties\' relationship.'
    ],
    2
  ],
  [
    35, 'legal', 'legal-p4',
    'While Subhash\'s property dispute with Mohan was pending, he agreed to sell his antique clock collection to Dr. Kapoor, his family physician of four years. Before the sale, Dr. Kapoor arranged an independent valuation in the presence of Subhash\'s lawyer. The collection was valued at ₹4,50,000, and Dr. Kapoor paid ₹4,75,000 by bank transfer. Subhash\'s son challenged the transaction on Subhash\'s behalf, alleging that the doctor-patient relationship itself established undue influence. Is the transaction voidable under the passage?',
    [
      'Yes, because a physician standing in a fiduciary relationship with a patient cannot enter into a property transaction with that patient.',
      'Yes, because Subhash\'s age and dependence automatically make every transaction with a trusted adviser unconscionable.',
      'No, because Section 16 applies only to transfers of immovable property and not to movable assets such as antiques.',
      'No, because the existence of a fiduciary relationship alone is insufficient where the facts do not show that Dr. Kapoor used his position to obtain an unfair advantage.'
    ],
    3
  ],
  [
    36, 'legal', 'legal-p4',
    'Rajeev, an auto-parts trader facing loan recall and possible auction of his warehouse, suffered anxiety and insomnia. To raise funds, he offered competitor Sunil his inventory at a 30% discount, discussed the transaction with his accountant and completed the sale. Three weeks later, after securing an independent loan, Rajeev filed a suit to avoid the sale under Section 16. Will Rajeev\'s claim succeed under the passage?',
    [
      'Yes, because serious financial pressure automatically amounts to mental distress sufficient to establish undue influence.',
      'Yes, because selling commercial goods below their usual value necessarily shows that Sunil obtained an unfair advantage.',
      'No, because Rajeev\'s stress and insomnia do not by themselves establish that his mental capacity was affected or that Sunil dominated his will.',
      'No, because persons engaged in commercial transactions cannot rely on mental or bodily distress under Section 16.'
    ],
    2
  ],
  [
    37, 'legal', 'legal-p4',
    'Mahesh was detained as a suspect in an investigation conducted by Inspector Dev. While Mahesh remained in custody awaiting a bail hearing, Dev offered to purchase Mahesh\'s orchard, worth ₹50,00,000, for ₹10,00,000. Dev repeatedly reminded Mahesh that he was the officer handling the investigation and suggested that Mahesh should "cooperate wisely" while considering the offer. Mahesh signed the agreement. After being released on bail, Mahesh challenged the transaction in court under Section 16, alleging undue influence. How should the court decide based on the passage?',
    [
      'In favour of Dev, because undue influence can arise only where the parties stand in a fiduciary relationship.',
      'In favour of Dev, because a person facing criminal investigation cannot challenge a separate commercial agreement under Section 16.',
      'In favour of Mahesh only if he proves that Dev expressly threatened him with physical injury before the agreement was signed.',
      'In favour of Mahesh, because Dev held real or apparent authority over him and used that position to obtain an unfair advantage.'
    ],
    3
  ],
  [
    38, 'legal', 'legal-p4',
    'Ashwin, a Class XII student, faced rustication for placing firecrackers in the girls\' washroom. His father, Rajat, was a trustee of the school and feared that a rustication record could affect Ashwin\'s future application to the Armed Forces. The Principal privately asked Rajat what he wished to do. Rajat donated ₹30 lakh to the school and requested that no rustication letter be issued. He made no threat, referred to no trustee powers and placed no condition on the donation. Does the passage establish undue influence?',
    [
      'Yes, because Rajat\'s status as a trustee automatically placed him in a position to dominate the Principal\'s will.',
      'Yes, because making a substantial donation while requesting favourable treatment necessarily amounts to undue influence.',
      'No, because the facts do not show that Rajat used any position of dominance or authority to obtain the requested advantage.',
      'No, because undue influence can arise only where the affected party suffers from age, illness or mental distress.'
    ],
    2
  ],
  [
    39, 'legal', 'legal-p5',
    'Aarav, angry with Kabir, deliberately drove his scooter towards him intending to kill him. Kabir moved aside in time and was unharmed. Several hours later, while Aarav was reversing his car in a crowded parking area without noticing Kabir behind it, he accidentally struck Kabir, causing his death. Can Aarav be held responsible for intentionally causing Kabir\'s death?',
    [
      'Aarav is liable for murder because his earlier intention to harm Kabir continued until Kabir eventually died.',
      'Aarav is liable for murder because intention at any earlier point is sufficient if the intended victim later dies.',
      'Aarav is not liable for murder because the intention to harm Kabir did not concur with the accidental act that caused his death.',
      'Aarav bears no responsibility whatsoever because neither of his acts had any connection with Kabir.'
    ],
    2
  ],
  [
    40, 'legal', 'legal-p5',
    'Ritika and Sana attended the same coaching class and owned identical black calculators. After class, Ritika mistakenly placed Sana\'s calculator in her bag believing it to be her own. At home, she noticed Sana\'s name written on the back and immediately decided to return it the next morning. Sana discovered the calculator was missing and accused Ritika of theft. Can Ritika be held liable for having mens rea for theft according to the passage?',
    [
      'Yes, because removing another person\'s property without permission necessarily establishes the required mens rea.',
      'Yes, because Ritika subsequently discovered that the calculator belonged to Sana and retained it overnight.',
      'No, because Ritika neither took the calculator nor exercised control over another person\'s property.',
      'No, because although Ritika performed the physical act of taking the calculator, she lacked the required dishonest intention at that time.'
    ],
    3
  ],
  [
    41, 'legal', 'legal-p5',
    'Nisha suffered temporary bouts of insanity arising from a medical condition. While driving, she suddenly experienced such a bout and lost awareness of her surroundings. Her vehicle struck a pedestrian. Medical evidence established that she was experiencing the episode when the incident occurred and was unable to form an intention to injure anyone. Can Nisha be held liable for intentionally causing hurt under the passage?',
    [
      'Yes, because causing physical injury is sufficient even when the required mental state is absent.',
      'No, because the facts establish that Nisha lacked the required mens rea when the act causing the injury occurred.',
      'Yes, because mens rea can be presumed whenever a person voluntarily begins driving before an accident occurs.',
      'No, because the physical act of causing injury itself did not occur while Nisha was driving.'
    ],
    1
  ],
  [
    42, 'legal', 'legal-p5',
    'Rohan, facing serious financial problems, decided to kidnap the young son of a wealthy businessman in the hope of obtaining money. He persuaded the child to enter his car and drove several kilometres away. Shortly afterwards, Rohan regretted what he had done and voluntarily drove the child back to the same place without making any demand. Can Rohan still be held liable for kidnapping according to the passage?',
    [
      'Yes, because the required intention and physical act existed together when Rohan took the child away, and his later change of mind does not erase the completed conduct.',
      'No, because voluntarily returning the child retrospectively removes the intention that existed when the child was taken away.',
      'No, because liability requires the wrongful intention to continue until the victim is ultimately released.',
      'Yes, but only if Rohan had actually demanded money before returning the child.'
    ],
    0
  ],
  [
    43, 'legal', 'legal-p5',
    'Vikram deliberately struck Sameer during a confrontation with the intention of causing his death. Sameer remained alive immediately after the incident and was taken to hospital, where he died two days later from the injuries caused by Vikram\'s act. Vikram argued that he could not be responsible for Sameer\'s death because Sameer did not die at the exact moment when Vikram intended him to die. Is Vikram\'s argument consistent with the passage?',
    [
      'Yes, because mens rea and death must occur at exactly the same moment for chronological concurrence to exist.',
      'No, because the required intention existed when Vikram performed the act that caused the injuries resulting in Sameer\'s death.',
      'Yes, because survival for any period after the intentional act necessarily breaks the concurrence between mens rea and actus reus.',
      'No, but only because Vikram continued to possess the intention to kill Sameer throughout the two days before his death.'
    ],
    1
  ],
  [
    44, 'legal', 'legal-p5',
    'Which of the following statements most accurately reflects the principle of chronological concurrence discussed in the passage?',
    [
      'The required mens rea must exist when the harmful consequence finally occurs, irrespective of the defendant\'s mental state during the relevant act.',
      'The required mens rea and actus reus must exist together at the time of the relevant act constituting the offence.',
      'A later change of mind prevents liability whenever the defendant attempts to undo the consequences of the act.',
      'Mens rea is unnecessary where the defendant\'s conduct ultimately produces a more serious harm than originally intended.'
    ],
    1
  ],

  /* ==================== SECTION C: LOGICAL REASONING (Q45–Q68) ==================== */
  [
    45, 'logical', 'logical-p1',
    'Which among the following can be most reasonably inferred from the students\' argument in the passage?',
    [
      'The harmful effects of social media arise largely because teenagers lack sufficient awareness of online behaviour.',
      'Restricting access may reduce certain risks without necessarily developing the ability to deal with those risks.',
      'Digital participation becomes beneficial when young users are permitted to choose the platforms they prefer.',
      'Greater parental supervision would make statutory restrictions on social media substantially less necessary.'
    ],
    1
  ],
  [
    46, 'logical', 'logical-p1',
    'Which of the following, if established, would most strengthen the students\' objection to a blanket ban on the ground of its practical effectiveness?',
    [
      'Teenagers using social media frequently participate in educational and creative communities outside school hours.',
      'Technology companies are capable of modifying recommendation systems for accounts belonging to younger users.',
      'Countries imposing age restrictions continue to report that many teenagers create accounts by misrepresenting their age.',
      'Parents differ considerably in the amount of time they permit their children to spend on digital devices.'
    ],
    2
  ],
  [
    47, 'logical', 'logical-p1',
    'The students\' preference for stronger regulation over complete exclusion depends most significantly upon which of the following assumptions?',
    [
      'At least some of the risks associated with social media can be reduced without removing teenagers\' access to the platforms.',
      'Teenagers generally understand online risks better when they receive guidance from schools rather than from their families.',
      'Technology companies are more capable than governments of deciding what forms of online content are suitable for teenagers.',
      'Educational and social benefits obtained through digital platforms cannot be provided through other forms of communication.'
    ],
    0
  ],
  [
    48, 'logical', 'logical-p1',
    'In light of the reasoning contained in the passage, which of the following policy measures would be most consistent with the students\' position?',
    [
      'Permitting teenagers to use social media after obtaining parental consent while leaving platform design unchanged.',
      'Restricting younger users to educational platforms while removing their access to social and creative communities.',
      'Requiring platforms to provide safer feeds, stronger privacy settings and accessible reporting tools for younger users.',
      'Allowing schools to determine individually whether their students should maintain personal social media accounts.'
    ],
    2
  ],
  [
    49, 'logical', 'logical-p1',
    'Which of the following best expresses the MAIN IDEA of the passage?',
    [
      'Teenagers should retain social media access because its benefits for learning and friendship clearly outweigh the risks it poses.',
      'The dangers of social media for teenagers stem mainly from platform design, so technology companies alone should be held responsible.',
      'Rather than banning under-sixteens from social media, policymakers should make these spaces safer while building young users\' capacity to use them.',
      'A blanket social media ban is impractical because determined teenagers can always bypass age checks using false information or alternative accounts.'
    ],
    2
  ],
  [
    50, 'logical', 'logical-p1',
    'Which of the following best states the main conclusion that the students\' argument is intended to establish?',
    [
      'Technology companies should bear greater responsibility because their platforms and algorithms shape young people\'s online behaviour.',
      'Governments should make social media safer for young people rather than simply banning those under sixteen from it.',
      'Age-based bans are ineffective because teenagers can bypass them and drift towards less regulated online spaces.',
      'Young people deserve a meaningful voice in decisions about the digital spaces that they themselves regularly use.'
    ],
    1
  ],
  [
    51, 'logical', 'logical-p2',
    'Which among the following most appropriately reflects the concern raised by the author regarding the use of generative AI for written communication?',
    [
      'Repeated reliance on the same AI model may gradually influence users\' views without their being fully aware of such influence.',
      'Generative AI becomes unreliable when users ask it to draft opinions instead of ordinary professional communications.',
      'AI-assisted writing may weaken a person\'s ability to express an independent opinion on controversial public matters.',
      'Language models are likely to produce similar political opinions whenever users ask them questions on public policy.'
    ],
    0
  ],
  [
    52, 'logical', 'logical-p2',
    'Which of the following situations would most closely illustrate the kind of manipulation described as "the subtlest of manipulations" in the passage?',
    [
      'An AI system refuses to draft a political statement because the subject is considered controversial.',
      'An AI writing tool repeatedly suggests language favouring one position while appearing merely to complete the user\'s sentences.',
      'A chatbot gives an incorrect factual answer about an election and later corrects the information after being challenged.',
      'An AI platform displays political advertisements based on the browsing history previously provided by the user.'
    ],
    1
  ],
  [
    53, 'logical', 'logical-p2',
    'Which among the following, if found to be true, would most weaken the concern that a biased AI model could influence public opinion on important societal issues?',
    [
      'Users generally prefer AI assistance when drafting longer messages on subjects about which they have limited knowledge.',
      'Different AI models frequently provide different formulations when asked to complete the same political statement.',
      'Users exposed to biased AI suggestions retain their original views after completing the same opinion-based writing tasks.',
      'AI-generated suggestions are more persuasive when users believe that the system has access to reliable information.'
    ],
    2
  ],
  [
    54, 'logical', 'logical-p2',
    'The reference to the disclaimer, "ChatGPT can make mistakes. Check important info," is used in the passage primarily to show that:',
    [
      'warnings concerning factual accuracy may not be sufficient to prevent users from being influenced by the model\'s suggestions.',
      'users generally ignore safety warnings when interacting with AI systems on politically sensitive matters.',
      'disclaimers are designed mainly to protect technology companies from responsibility for biased AI-generated responses.',
      'the persuasive effect of AI arises principally because users assume that generated information has been independently verified.'
    ],
    0
  ],
  [
    55, 'logical', 'logical-p2',
    'Which of the following best identifies a flaw in the author\'s reasoning that covert AI bias could flip an election\'s outcome?',
    [
      'It treats a shift in opinion measured during a writing study as equivalent to a change in actual votes cast.',
      'It assumes that generative AI will continue to carry the same biases that the original study happened to detect.',
      'It overlooks that some users may consciously disagree with the AI\'s suggestions and reject the language it proposes.',
      'It fails to consider that different societies may regulate generative AI platforms in widely differing ways.'
    ],
    0
  ],
  [
    56, 'logical', 'logical-p2',
    'The author\'s claim that covert AI bias could flip an election\'s outcome depends most significantly on which assumption?',
    [
      'At least some changes in political preferences produced by AI-generated suggestions can translate into changes in actual voting behaviour.',
      'Users who rely on AI auto-complete are generally less informed about politics than users who do not.',
      'The disclaimers attached to AI models are deliberately worded so as to be ignored by most ordinary users.',
      'Generative AI will eventually replace human-written communication across most political and professional settings.'
    ],
    0
  ],
  [
    57, 'logical', 'logical-p3',
    'Which among the following most appropriately explains how the shift of news to social media intensified the changes already taking place in journalism?',
    [
      'It replaced professional journalism with opinion-based content produced mainly by internet personalities.',
      'It reduced the influence of traditional broadcasters by making social media the principal source of public information.',
      'It extended the existing preference for speed and attention by mixing factual reporting with opinion in continuous feeds.',
      'It transferred the responsibility of deciding what constitutes news from professional journalists to entertainment companies.'
    ],
    2
  ],
  [
    58, 'logical', 'logical-p3',
    'Which of the following, if found to be true, would most weaken the author\'s argument that the structure of social media encourages the spread of misinformation?',
    [
      'Social media platforms give greater distribution to posts supported by verified sources than to highly emotional posts lacking supporting evidence.',
      'Many users obtain news from social media while also regularly consulting newspapers and television news channels.',
      'Influencers who discuss current affairs frequently include personal opinions along with links to published news reports.',
      'News organisations increasingly publish shortened versions of their reports on their social media accounts to attract readers.'
    ],
    0
  ],
  [
    59, 'logical', 'logical-p3',
    'The statement that "outrage is the key to virality" most nearly suggests that:',
    [
      'social media users generally accept controversial information as true when it is repeatedly shared by others.',
      'news organisations deliberately produce inaccurate stories because factual reporting attracts limited public attention.',
      'political disagreement has become more intense because social media permits a large number of people to express opinions.',
      'content capable of provoking strong reactions may circulate more widely than material presented with restraint and context.'
    ],
    3
  ],
  [
    60, 'logical', 'logical-p3',
    'Which among the following situations most closely illustrates the process by which mistaken impressions may spread as described in the passage?',
    [
      'A newspaper publishes a detailed investigation and later modifies part of the report after receiving additional evidence.',
      'A journalist publishes a breaking report before preparing a longer analysis containing additional background and explanatory material.',
      'A television channel invites two commentators holding different views to discuss the implications of a recently announced public policy.',
      'A short post isolates one dramatic detail from a longer event, attracts strong reactions and is repeatedly shared without its original context.'
    ],
    3
  ],
  [
    61, 'logical', 'logical-p3',
    'The author\'s argument that the shift of news to social media has allowed misinformation to flourish depends most significantly on which assumption?',
    [
      'Social media platforms attract a larger total audience than newspapers and television news channels combined.',
      'Traditional broadcasters produced news that was consistently free of sensationalism before entertainment conglomerates arrived.',
      'Most people are unable to tell the difference between factual reporting and opinion when the two appear together.',
      'At least some misleading content receives substantial additional exposure through the sharing and attention-driven features of social media.'
    ],
    3
  ],
  [
    62, 'logical', 'logical-p3',
    'Which of the following, if true, most clearly exposes a weakness in the author\'s reasoning that social media is responsible for the flourishing of misinformation?',
    [
      'The sensational and opinion-mixed style the author criticises was already widespread in cable news before social media existed.',
      'Many social media users say they distrust the news content they encounter on their feeds.',
      'Some verified news organisations maintain active and widely followed accounts on major social media platforms.',
      'Misinformation has occasionally been corrected quickly after being shared by large numbers of users.'
    ],
    0
  ],
  [
    63, 'logical', 'logical-p4',
    'Who sits directly opposite E?',
    ['B', 'C', 'D', 'F'],
    2
  ],
  [
    64, 'logical', 'logical-p4',
    'Which pair consists of A\'s immediate neighbours?',
    ['B and G', 'C and E', 'E and G', 'D and H'],
    2
  ],
  [
    65, 'logical', 'logical-p4',
    'Who sits third clockwise from G?',
    ['A', 'B', 'E', 'H'],
    1
  ],
  [
    66, 'logical', 'logical-p4',
    'How many people sit between C and H when counted along the shorter arc?',
    ['One', 'Two', 'Three', 'Four'],
    1
  ],
  [
    67, 'logical', 'logical-p4',
    'Suppose E and G exchange their positions while everyone else remains seated. Which original condition would be violated?',
    [
      'B sits second clockwise from A.',
      'C sits opposite B.',
      'H sits adjacent to both B and F.',
      'G is adjacent to neither B nor D.'
    ],
    3
  ],
  [
    68, 'logical', 'logical-p4',
    'How many persons sit between F and A?',
    ['Four', 'One', 'Three', 'Two'],
    2
  ],

  /* ==================== SECTION D: ENGLISH LANGUAGE (Q69–Q92) ==================== */
  [
    69, 'english', 'english-p1',
    'The writer\'s early experience of reading in the household primarily revealed that:',
    [
      'Reading inevitably isolates individuals from the social rhythms of everyday domestic life',
      'The practical function of language carries more significance than any emotional undertones it may possess',
      'Verbal expression possesses an affective dimension that extends well beyond its surface-level definitions',
      'A parent\'s sustained engagement with books decisively shapes the professional trajectory of a child'
    ],
    2
  ],
  [
    70, 'english', 'english-p1',
    'The writer\'s early drafts were primarily characterised by:',
    [
      'Embellished prose designed to project intellectual sophistication and literary depth',
      'A deliberate avoidance of all figurative expression in pursuit of austere simplicity',
      'A natural directness and clarity that emerged from years of disciplined observation',
      'Close stylistic imitation of the literary models the writer encountered in childhood'
    ],
    0
  ],
  [
    71, 'english', 'english-p1',
    'According to the passage, meaningful revision most essentially requires:',
    [
      'Technical mastery of grammatical conventions and structural composition',
      'Deep familiarity with the established traditions and norms of literary craft',
      'The capacity to generate complex and rhetorically striking figurative language',
      'The readiness to sacrifice polished phrasing in pursuit of genuine truthfulness'
    ],
    3
  ],
  [
    72, 'english', 'english-p1',
    'The "central paradox" of writing described in the passage refers to:',
    [
      'The conflict between desiring wide recognition and requiring creative anonymity',
      'The tension between a writer\'s necessary solitude and the communicative purpose that drives the craft',
      'The contradiction between pursuing personal beliefs and yielding to commercial pressures',
      'The struggle between expressing oneself honestly and constructing a version that pleases the audience'
    ],
    1
  ],
  [
    73, 'english', 'english-p1',
    'In the context of the passage, the word "residue" most nearly means:',
    [
      'A lingering trace or remaining emotional impression left behind in expression',
      'A chemical deposit remaining after a process of evaporation or distillation',
      'An unwanted by-product generated incidentally during a manufacturing process',
      'A formal classification for discarded or surplus material in a production cycle'
    ],
    0
  ],
  [
    74, 'english', 'english-p1',
    'The author\'s overall tone in the passage can best be described as:',
    [
      'Nostalgic and self-congratulatory, celebrating the personal journey from amateur experimentation to literary accomplishment',
      'Detached and clinical, offering an impersonal analysis of compositional technique without personal investment',
      'Reflective and forthright, providing measured personal insight into the demands and contradictions of writing',
      'Restless and self-critical, voicing persistent dissatisfaction with the inherent limitations of written expression'
    ],
    2
  ],
  [
    75, 'english', 'english-p2',
    'Which of the following best captures the central idea of the passage?',
    [
      'Modern schools should replace structured curricula entirely with open-ended discussion forums and peer dialogue',
      'Contemporary schooling\'s most serious failing lies in its tendency to reward compliance at the expense of autonomous critical reasoning',
      'Developing professional competence through specialised skill training matters less than teaching abstract philosophical analysis',
      'Students who demonstrate efficient memorisation consistently outperform those who engage in persistent questioning'
    ],
    1
  ],
  [
    76, 'english', 'english-p2',
    'According to the passage, the author draws a distinction between training and education primarily to argue that:',
    [
      'Vocational skills have become increasingly obsolete in the contemporary knowledge-based economy',
      'Schools should discontinue all forms of practical skill instruction from their academic programmes',
      'Rote memorisation acquires genuine educational value only when it is supplemented by structured inquiry',
      'Skill-based instruction, by itself, is insufficient for nurturing the reflective civic engagement a society requires'
    ],
    3
  ],
  [
    77, 'english', 'english-p2',
    'The passage suggests that the long-term consequence of rewarding memorisation over questioning is that students become:',
    [
      'Proficient within familiar procedural frameworks yet ill-equipped to navigate situations that lack established protocols',
      'Rebellious against institutional authority and increasingly resistant to all forms of structured learning',
      'Indifferent to both the demands of practical training and the value of theoretical knowledge',
      'Skilled at creative and lateral thinking but deficient in the systematic analysis required for academic rigour'
    ],
    0
  ],
  [
    78, 'english', 'english-p2',
    'According to the author, the appropriate remedy for the problem identified in the passage is to:',
    [
      'Eliminate all forms of structured learning and allow students to determine their own educational pathways',
      'Replace formal examinations with open-ended group discussions and peer-led collaborative seminars',
      'Redefine structured learning so that inquiry becomes its primary objective rather than an obstacle to curriculum delivery',
      'Reduce the emphasis on coverage and efficiency by significantly shortening the prescribed academic curriculum'
    ],
    2
  ],
  [
    79, 'english', 'english-p2',
    'In the context of the passage, the phrase "interrogate the assumptions on which their knowledge rests" most nearly means:',
    [
      'Question the professional qualifications of teachers who deliver the prescribed curriculum',
      'Critically examine the foundational premises underlying what is accepted as established knowledge',
      'Reject all established theories and frameworks in favour of purely personal lived experience',
      'Memorise the historical origins and developmental trajectory of various academic disciplines'
    ],
    1
  ],
  [
    80, 'english', 'english-p2',
    'The passage implies that a student who asks why a historical event is interpreted in a particular way is engaged in:',
    [
      'A deliberate act of defiance against the institutional authority that governs established academic standards',
      'An unproductive disruption of classroom efficiency that compromises the collective progress of other learners',
      'An effort to demonstrate intellectual superiority over the teacher\'s prescribed interpretation of the subject',
      'The most meaningful form of educational work — scrutinising the reasoning behind prevailing interpretive frameworks'
    ],
    3
  ],
  [
    81, 'english', 'english-p3',
    'The central argument of the passage is that reform requires:',
    [
      'A complete rejection of inherited practices in favour of rationally designed modern alternatives',
      'Absolute fidelity to inherited customs regardless of whether they remain relevant or humane',
      'A revolutionary approach that dismantles existing institutional structures swiftly and decisively',
      'A deliberate evaluation that separates inherited practices upholding human worth from those that merely perpetuate convention'
    ],
    3
  ],
  [
    82, 'english', 'english-p3',
    'According to the passage, conservatives criticise the reformer primarily for:',
    [
      'Being unwilling to take decisive and confrontational action against embedded social injustice',
      'Preserving too much of the existing institutional system that ought to be dismantled entirely',
      'Drawing upon external concepts in a manner that compromises the cohesion of indigenous cultural traditions',
      'Failing to articulate a clear set of principles for distinguishing valuable traditions from harmful ones'
    ],
    2
  ],
  [
    83, 'english', 'english-p3',
    'The passage suggests that the reformer\'s loyalty is ultimately directed toward:',
    [
      'The preservation of native cultural identity against the encroachment of external ideological influences',
      'A fundamental ethical commitment against those compelling individuals who endure hardship merely to preserve established social arrangements',
      'A future envisioned by progressive intellectuals and social activists working toward systemic transformation',
      'The philosophical traditions and founding principles of the community as they were originally conceived'
    ],
    1
  ],
  [
    84, 'english', 'english-p3',
    'The author describes the process of reform as:',
    [
      'More gradual than revolutionary upheaval yet uniquely positioned to honour both accumulated wisdom and the imperatives of fairness',
      'More comfortable than conservatism because it eliminates the burden of confronting difficult moral choices',
      'Equally criticised by conservatives and radicals primarily because it lacks genuine political conviction',
      'Primarily philosophical and abstract in its orientation rather than practical in its application'
    ],
    0
  ],
  [
    85, 'english', 'english-p3',
    'In the context of the passage, the word "complacency" most nearly means:',
    [
      'Active hostility toward reform initiatives and organised resistance to institutional change',
      'A calculated political strategy designed to preserve existing power structures within institutions',
      'A philosophical commitment to the intrinsic value of historical continuity and precedent',
      'Uncritical acceptance of inherited practices without the willingness to examine or improve them'
    ],
    3
  ],
  [
    86, 'english', 'english-p3',
    'The author\'s concluding statement "Those who insist that tradition must be accepted whole, without scrutiny, confuse reverence with complacency" serves primarily to:',
    [
      'Distinguish between genuine respect for tradition, which involves critical examination, and passive acceptance that avoids scrutiny altogether',
      'Accuse conservative thinkers of deliberately undermining the reform process through institutional resistance and political obstructionism',
      'Propose that inherited practices should ultimately be replaced by rationally designed alternatives based on contemporary evidence',
      'Offer a balanced summary of the longstanding disagreement between radical reformers and conservative defenders of tradition'
    ],
    0
  ],
  [
    87, 'english', 'english-p4',
    'The detail that the priest\'s son now sells mobile phone covers from a plastic sheet primarily suggests that:',
    [
      'The town has undergone significant social and economic transformation during Masterji\'s lifetime',
      'Religious institutions have lost their authority and moral influence over younger generations',
      'Masterji\'s teaching had no lasting intellectual or professional influence on his former students',
      'The local economy has experienced a sustained decline, forcing educated individuals into informal work'
    ],
    0
  ],
  [
    88, 'english', 'english-p4',
    'The phrase "settling into the cane chair without being invited" most likely indicates that Suresh:',
    [
      'Is deliberately disrespectful toward Masterji\'s authority and personal boundaries',
      'Has a familiarity with Masterji rooted in a relationship that spans several decades',
      'Considers himself socially superior to Masterji due to his current professional success',
      'Is anxious about delivering unwelcome news and compensates by projecting casual confidence'
    ],
    1
  ],
  [
    89, 'english', 'english-p4',
    'The anecdote about Masterji confiscating a mango and sharing it among five guilty boys reveals that his approach to teaching involved:',
    [
      'Strict punishment designed to ensure unwavering classroom discipline at all times',
      'A deliberate strategy of ignoring rule-breaking in order to maintain popularity among students',
      'Combining the exercise of authority with empathy and a genuine sense of fairness',
      'Using food as a systematic reward mechanism to motivate participation and good behaviour'
    ],
    2
  ],
  [
    90, 'english', 'english-p4',
    'The significance of Suresh\'s offer to make Masterji the "chief guest at the inauguration" is that it:',
    [
      'Demonstrates Suresh\'s genuine desire to honour Masterji\'s enduring contribution to the town\'s educational legacy',
      'Reveals that the coaching institute values and intends to incorporate traditional teaching methods into its curriculum',
      'Suggests that the broader community recognises the school building\'s historical importance and cultural significance',
      'Extends to Masterji a ceremonial role in a process that effectively dismantles what he spent his professional life building'
    ],
    3
  ],
  [
    91, 'english', 'english-p4',
    'In the final paragraph, the word "reprieve" most nearly means:',
    [
      'A permanent victory achieved through sustained resistance against institutional forces',
      'A deliberate compromise carefully negotiated between opposing administrative parties',
      'A temporary escape from an unfavourable outcome, granted by circumstance rather than by design',
      'An official pardon formally granted by an authority following a comprehensive review process'
    ],
    2
  ],
  [
    92, 'english', 'english-p4',
    'The narrator\'s reflection on the tamarind tree in the final paragraph serves primarily to suggest that:',
    [
      'Municipal inefficiency constitutes the single greatest obstacle to meaningful urban development in small-town India',
      'Masterji perceives a parallel between the tree\'s accidental survival and his own increasingly uncertain relevance in the town',
      'The natural environment provides Masterji with a source of spiritual comfort against the disruptions of rapid modernisation',
      'Natural landmarks in rapidly changing communities deserve institutional protection as repositories of collective historical memory'
    ],
    1
  ],

  /* ==================== SECTION E: CURRENT AFFAIRS & GK (Q93–Q120) ==================== */
  [
    93, 'gk', 'gk-p1',
    'Which legislation principally governs centrally protected ancient monuments and archaeological sites in India today?',
    [
      'Ancient Monuments and Archaeological Sites and Remains Act, 1958',
      'Ancient Monuments Preservation and Protection Act, 1956',
      'National Archaeological Heritage Protection Act, 1961',
      'Historical Monuments and Cultural Sites Act, 1958'
    ],
    0
  ],
  [
    94, 'gk', 'gk-p1',
    'Which constitutional provision empowers a High Court to issue writs for enforcement of fundamental rights as well as "for any other purpose"?',
    ['Article 32', 'Article 136', 'Article 226', 'Article 227'],
    2
  ],
  [
    95, 'gk', 'gk-p1',
    'The Paramara dynasty, with which Raja Bhoja is associated, principally ruled which region of medieval India?',
    ['Malwa', 'Bundelkhand', 'Konkan', 'Mithila'],
    0
  ],
  [
    96, 'gk', 'gk-p1',
    'Which of the following rulers of the Paramara dynasty is associated with inscriptions containing Sanskrit grammatical formulations discovered at the Bhojshala complex in Dhar?',
    ['Vakpati Munja', 'Sindhuraja', 'Udayaditya', 'Siyaka II'],
    2
  ],
  [
    97, 'gk', 'gk-p2',
    'Which of the following legislations forms the principal legal basis for Greenland\'s expanded self-government within the Danish constitutional framework?',
    [
      'Greenland Autonomy and Territorial Administration Act, 1998',
      'Greenland Constitutional Settlement Act, 2004',
      'Greenland Home Rule Consolidation Act, 1995',
      'Act on Greenland Self-Government, 2009'
    ],
    3
  ],
  [
    98, 'gk', 'gk-p2',
    'The principal United States military installation presently operating in Greenland is known as:',
    [
      'Pituffik Space Base',
      'Keflavik Space Base',
      'Thule Naval Station',
      'Nuuk Defence Base'
    ],
    0
  ],
  [
    99, 'gk', 'gk-p2',
    'Which of the following countries is not one of the eight members of the Arctic Council?',
    ['Denmark', 'Canada', 'China', 'Iceland'],
    2
  ],
  [
    100, 'gk', 'gk-p2',
    'Greenland\'s capital is:',
    ['Longyearbyen', 'Tórshavn', 'Reykjavík', 'Nuuk'],
    3
  ],
  [
    101, 'gk', 'gk-p2',
    'Greenland geographically forms part of which continent?',
    ['North America', 'Europe', 'Asia', 'Antarctica'],
    0
  ],
  [
    102, 'gk', 'gk-p2',
    'Which of the following best describes the outcome of the 2026 U.S.-Greenland dispute?',
    [
      'Greenland was transferred to the United States under a bilateral territorial agreement',
      'The United States gained expanded defence access while Danish sovereignty was reaffirmed',
      'Greenland became independent and entered a separate defence pact with the United States',
      'Denmark withdrew Greenland from NATO and placed its defence under Arctic Council control'
    ],
    1
  ],
  [
    103, 'gk', 'gk-p3',
    'Which NPCI product is principally associated with India\'s domestic card-payment network?',
    ['AePS', 'BHIM', 'RuPay', 'NETC'],
    2
  ],
  [
    104, 'gk', 'gk-p3',
    'The international arm established to expand NPCI\'s payment solutions globally is known as:',
    [
      'Unified Payments International Limited',
      'NPCI Global Payments Corporation',
      'National International Payments Limited',
      'NPCI International Payments Limited'
    ],
    3
  ],
  [
    105, 'gk', 'gk-p3',
    'NPCI was established with the initiative and support of which two institutions?',
    [
      'RBI and Indian Banks\' Association',
      'RBI and Ministry of Finance',
      'SEBI and Indian Banks\' Association',
      'NABARD and Ministry of Finance'
    ],
    0
  ],
  [
    106, 'gk', 'gk-p3',
    'Which of the following is the correct full form of QR, widely used in UPI-based merchant payments?',
    ['Qualified Response', 'Quick Response', 'Quick Recognition', 'Query Response'],
    1
  ],
  [
    107, 'gk', 'gk-p3',
    'With reference to the passage, which of the following best explains "interoperability" in the context of UPI?',
    [
      'Transfers restricted to one service provider',
      'Transactions within a single banking network',
      'Payments limited to one mobile application',
      'Transactions across different banks and apps'
    ],
    3
  ],
  [
    108, 'gk', 'gk-p3',
    'Which UPI feature was introduced primarily to facilitate small-value transactions with reduced dependence on the issuing bank\'s core banking system for every payment?',
    ['UPI Circle', 'UPI AutoPay', 'UPI Lite', 'UPI Global'],
    2
  ],
  [
    109, 'gk', 'gk-p4',
    'The Indus Waters Treaty was signed in 1960 by Jawaharlal Nehru and which Pakistani leader?',
    ['Yahya Khan', 'Ayub Khan', 'Liaquat Ali Khan', 'Zulfikar Ali Bhutto'],
    1
  ],
  [
    110, 'gk', 'gk-p4',
    'Which of the following projects is situated on the Chenab river and has figured prominently in India-Pakistan disputes under the Treaty framework?',
    [
      'Baglihar Hydroelectric Project',
      'Tehri Hydroelectric Project',
      'Nathpa Jhakri Project',
      'Sardar Sarovar Project'
    ],
    0
  ],
  [
    111, 'gk', 'gk-p4',
    'Which of the following rivers is a tributary of the Indus and flows through the Kashmir Valley before entering Pakistan?',
    ['Ravi', 'Beas', 'Jhelum', 'Sutlej'],
    2
  ],
  [
    112, 'gk', 'gk-p4',
    'The bilateral body established under the Treaty for continuing cooperation between India and Pakistan is known as the:',
    [
      'Indus Water Council',
      'Indus Basin Authority',
      'Joint River Commission',
      'Permanent Indus Commission'
    ],
    3
  ],
  [
    113, 'gk', 'gk-p4',
    'Which of the following correctly identifies the three "Eastern Rivers" under the Indus Waters Treaty?',
    [
      'Jhelum, Chenab and Ravi',
      'Indus, Ravi and Beas',
      'Ravi, Beas and Sutlej',
      'Indus, Jhelum and Chenab'
    ],
    2
  ],
  [
    114, 'gk', 'gk-p4',
    'Under the Treaty framework, a dispute that cannot be resolved through the specified preliminary mechanisms may ultimately be referred to:',
    [
      'Permanent Court of Arbitration',
      'International Court of Justice',
      'UN Security Council',
      'Court of Arbitration'
    ],
    3
  ],
  [
    115, 'gk', 'gk-p5',
    'According to the Government of India, the country achieved the milestone of becoming effectively free from Left-Wing Extremism on which of the following dates?',
    ['15 August 2025', '26 January 2026', '31 March 2026', '1 July 2026'],
    2
  ],
  [
    116, 'gk', 'gk-p5',
    'With reference to the origin of the Naxalite movement in India, consider the following statements:\n1. The movement originated in Naxalbari in West Bengal.\n2. The Naxalbari uprising occurred in 1967.\n3. The movement was initially associated with agrarian discontent and radical land reform demands.\n4. The movement originated as an organised campaign against British colonial rule.\nWhich of the statements given above are correct?',
    ['1 and 4 only', '1, 2 and 3 only', '2, 3 and 4 only', '1, 2, 3 and 4'],
    1
  ],
  [
    117, 'gk', 'gk-p5',
    'Which of the following best describes the term Red Corridor in the context of India\'s internal security?',
    [
      'A designated international trade corridor connecting India with Southeast Asia.',
      'A geographical expression referring to regions historically affected by Left-Wing Extremism.',
      'A protected ecological corridor connecting India\'s major tiger reserves.',
      'A government-designated defence corridor connecting military establishments.'
    ],
    1
  ],
  [
    118, 'gk', 'gk-p5',
    'Which of the following correctly expands the abbreviation CoBRA, a specialised unit associated with India\'s counter-insurgency framework?',
    [
      'Central Operational Battalion for Regional Assistance',
      'Commando Battalion for Resolute Action',
      'Counter Operations Brigade for Regional Administration',
      'Central Organisation for Border Reconnaissance and Action'
    ],
    1
  ],
  [
    119, 'gk', 'gk-p5',
    'Which constitutional list includes Police and Public Order?',
    ['Union List', 'State List', 'Concurrent List', 'Residuary Powers'],
    1
  ],
  [
    120, 'gk', 'gk-p5',
    'Which scheme provides support for security-related expenditure in areas affected by Left-Wing Extremism?',
    [
      'National Livelihood Mission',
      'Border Area Development Programme',
      'Aspirational Blocks Programme',
      'Security Related Expenditure Scheme'
    ],
    3
  ]
];

export const QUESTIONS = RAW_QUESTIONS.map(
  ([id, sectionId, passageId, questionText, options, correctOption]) => {
    const passage = PASSAGES[passageId];
    return {
      id,
      sectionId,
      sectionName: SECTION_NAMES[sectionId],
      passageId,
      passageIndex: passage.passageIndex,
      passageTitle: passage.passageTitle,
      passageRange: passage.passageRange,
      passageParagraphs: passage.passageParagraphs,
      questionText,
      options,
      correctOption
    };
  }
);