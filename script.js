"use strict";
/* =============================================================================
   <ed> AND <s> ENDINGS — practice page
   Accurate English, Chapter 14 (sections 14.1, 14.2, 14.3)

   CONFIG.endpoint is the /exec URL of a deployed Google Apps Script web app
   (see Code.gs in this same folder). Leave it empty and every score still
   works and stays in this browser — the Send button simply does not appear.

   MOTION: motion.js (bundled locally, see index.html) drives the slide
   crossfade, the entrance stagger and the sound-diagram float. Everything
   still works with it absent — LIVE below is the single switch, and every
   Motion call sits behind it. revealAll() plus a 3-second timer guarantee
   the page is never left hidden, even if Motion throws mid-choreography.

   Structure of this file
     1.  DATA          the chapter, encoded
     2.  STATE         who is working and how they are doing
     3.  VOICE         browser speech + optional Kokoro server
     4.  ROUTER        slide navigation and the dot nav
     5.  RULES         the three rule slides, rendered from DATA
     6.  ARENA         the shared shell every practice draws into
     7.  PRACTICES     ten of them
     8.  REPORT        scoring table and export
     9.  PARTICLES     the ambient canvas the base stylesheet expects
     10. BOOT

   No dependencies. Nothing is fetched except the optional Kokoro endpoint the
   teacher types in themselves.
   ========================================================================== */

const CONFIG = {
  /* Paste the /exec URL from Code.gs here, e.g.
     'https://script.google.com/macros/s/AKfycb.../exec' */
  endpoint: 'https://script.google.com/macros/s/AKfycbxDHlRL7DlPMSUxgrKDPzh5JjTiP4sJ7Aq_Z_bKN4W9kw4RdM2RkuN_RtskO8NUw0aJqQ/exec',
};


/* =============================================================================
   1. DATA
   ========================================================================== */

/* ---- 14.1 · the three <ed> endings ------------------------------------- */
const ED_RULES = [
  {
    key:'id', tone:'', sound:'/ɪd/',
    when:'after <b>/t/</b> or <b>/d/</b> — and only here does the ending become <b>a whole extra syllable</b>',
    spell:'spelled &lt;d, dd, de, t, tt, te&gt;',
    words:[
      ['needed','ˈnidɪd'], ['added','ˈædɪd'], ['attended','əˈtɛndɪd'],
      ['exploded','ɪkˈsploʊdɪd'], ['wanted','ˈwɑntɪd'], ['departed','dɪˈpɑɚtɪd'],
      ['visited','ˈvɪzɪtɪd'], ['accepted','əkˈsɛptɪd'], ['admitted','ədˈmɪtɪd'],
      ['separated','ˈsɛpəreɪtɪd'], ['decided','dɪˈsaɪdɪd'], ['started','ˈstɑɚtɪd']
    ]
  },
  {
    key:'t', tone:'b', sound:'/t/',
    when:'after any <b>voiceless</b> sound except /t/ — <b>/p, k, f, θ, s, ʃ, tʃ/</b>',
    spell:'the &lt;e&gt; is silent',
    words:[
      ['hopped','hɑpt'], ['thanked','θæŋkt'], ['laughed','læft'],
      ['divorced','dɪˈvɔɚst'], ['finished','ˈfɪnɪʃt'], ['watched','wɑtʃt'],
      ['marched','mɑɚtʃt'], ['helped','hɛlpt'], ['relaxed','rɪˈlækst'],
      ['asked','æskt'], ['worked','wɚkt'], ['stopped','stɑpt'],
      ['promised','ˈprɑmɪst'], ['developed','dɪˈvɛləpt']
    ]
  },
  {
    key:'d', tone:'c', sound:'/d/',
    when:'after any <b>voiced</b> sound except /d/ — <b>/b, g, v, ð, z, ʒ, dʒ, m, n, ŋ, l/</b> and <b>all vowels</b>',
    spell:'the &lt;e&gt; is silent',
    words:[
      ['robbed','rɑbd'], ['begged','bɛgd'], ['loved','lʌvd'],
      ['surprised','sɚˈpraɪzd'], ['engaged','ɪnˈgeɪdʒd'], ['changed','tʃeɪndʒd'],
      ['returned','rɪˈtɚnd'], ['called','kɔld'], ['borrowed','ˈbɑroʊd'],
      ['married','ˈmærid'], ['planned','plænd'], ['removed','rɪˈmuvd'],
      ['enjoyed','ɪnˈdʒɔɪd'], ['organized','ˈɔɚgənaɪzd'], ['preferred','prɪˈfɚd']
    ]
  }
];

/* ---- 14.2 · the three <s> endings --------------------------------------- */
const S_RULES = [
  {
    key:'iz', tone:'', sound:'/ɪz/',
    when:'after <b>/s, z, ʃ, ʒ, tʃ, dʒ/</b> — <b>a whole extra syllable</b>',
    spell:'spelled &lt;s, ss, se, z, zz, ze, sh, ch, tch, ge, ce, x&gt;',
    words:[
      ['classes','ˈklæsɪz'], ['dances','ˈdænsɪz'], ['washes','ˈwɑʃɪz'],
      ['suitcases','ˈsutkeɪsɪz'], ['apologizes','əˈpɑlədʒaɪzɪz'], ['sandwiches','ˈsænwɪtʃɪz'],
      ['languages','ˈlæŋgwɪdʒɪz'], ['relaxes','rɪˈlæksɪz'], ["Alice's",'ˈælɪsɪz'],
      ['judges','ˈdʒʌdʒɪz'], ['foxes','ˈfɑksɪz'], ['matches','ˈmætʃɪz']
    ]
  },
  {
    key:'s', tone:'b', sound:'/s/',
    when:'after a <b>voiceless</b> consonant except /s, ʃ, tʃ/ — <b>/p, t, k, f, θ/</b>',
    spell:'the &lt;e&gt; is silent',
    words:[
      ['hopes','hoʊps'], ['beets','bits'], ['docks','dɑks'],
      ['laughs','læfs'], ['bumps','bʌmps'], ['departs','dɪˈpɑɚts'],
      ['thinks','θɪŋks'], ['states','steɪts'], ['results','rɪˈzʌlts'],
      ["Mark's",'mɑɚks'], ['takes','teɪks'], ['chocolates','ˈtʃɑklɪts']
    ]
  },
  {
    key:'z', tone:'c', sound:'/z/',
    when:'after a <b>voiced</b> sound except /z, ʒ, dʒ/ — <b>/b, d, g, v, ð, m, n, ŋ, l/</b> and <b>all vowels</b>',
    spell:'the &lt;e&gt; is silent',
    words:[
      ['robes','roʊbz'], ['beads','bidz'], ['dogs','dɔgz'],
      ['loves','lʌvz'], ['comes','kʌmz'], ['delivers','dɪˈlɪvɚz'],
      ['things','θɪŋz'], ['stays','steɪz'], ['animals','ˈænɪməlz'],
      ["Martha's",'ˈmɑɚθəz'], ['smiles','smaɪlz'], ['magazines','mægəˈzinz']
    ]
  }
];

/* ---- 14.3 · the five escapes from a consonant pile-up ------------------- */
const GROUP_RULES = [
  { key:'link', tone:'', sound:'1 · Link',
    when:'Make the consonant that <b>ends one word begin the next</b> when the next word starts with a vowel.',
    spell:'reduce pronouns, drop the /h/',
    words:[['gets up','gɛt sʌp'],['find out','faɪn daʊt'],['told her','toʊl dɚ'],
           ['grabbed it','græb dɪt'],['loves it','lʌv zɪt'],['most of them','moʊs təv ðəm'],
           ['first of all','fɚs tə vɔl'],['changed his mind','tʃeɪndʒ dɪz maɪnd']] },
  { key:'hold', tone:'b', sound:'2 · Hold',
    when:'Hold the first consonant and <b>go straight into the next</b> without opening your mouth. Never insert [h], [ə] or [ɪ] between them.',
    spell:'two of the same = one long one',
    words:[['a hard day','—'],['help Bob','—'],['the first time','—'],
           ['answered correctly','—'],['walked slowly','—'],['works fine','—']] },
  { key:'glottal', tone:'c', sound:'3 · Glottal',
    when:'A final <b>/t/ before a consonant</b> can become a glottal stop — the catch in the middle of <i>uh-oh</i>.',
    spell:'stops /t/ sounding like /s/',
    words:[['it was nice','—'],['built the house','—'],['felt fine','—'],
           ["can't remember",'—'],['hurt the dog','—'],['short sleeves','—']] },
  { key:'omit', tone:'', sound:'4 · Omit',
    when:'In three consonants you may <b>drop the middle one</b> — but never the grammatical &lt;ed&gt; or &lt;s&gt;.',
    spell:'native speakers do this too',
    words:[['acts','æks'],['asked','æst'],['lifts','lɪfs'],
           ['tests','tɛss'],['months','mʌns'],['fifths','fɪfs'],
           ['lengths','lɛŋs'],['depths','dɛps']] },
  { key:'pause', tone:'b', sound:'5 · Pause',
    when:'Some groups cannot be simplified at all. <b>Lengthen the word and pause after it</b> rather than chopping it off.',
    spell:'or use an easier synonym',
    words:[['wasps','—'],['marched','—'],['changed','—'],['girls','—'],['world','—']] }
];

/* ---- Practice 3 · the old adjectives (matching) ------------------------- */
const OLD_ADJ = [
  ['naked',      'wearing no clothes, nude'],
  ['crooked',    'not straight, with bends'],
  ['ragged',     'torn, in rags'],
  ['wretched',   'terrible, awful'],
  ['wicked',     'evil, very bad'],
  ['rugged',     'rough and strong'],
  ['learned',    'educated'],
  ['cross-legged','with the legs crossed'],
  ['allegedly',  'they say, with no proof'],
  ['markedly',   'noticeably, quite a lot'],
  ['supposedly', 'it appears that'],
  ['deservedly', 'rightly'],
  ['repeatedly', 'over and over again']
];

/* ---- Exercise A · is the <e> pronounced? -------------------------------- */
const SILENT_E_ED = [
  ['blinked',false],['improved',false],['pointed',true],['opened',false],
  ['attached',false],['allowed',false],['avoided',true],['charged',false],
  ['omitted',true],['handicapped',false],['discovered',false],['delighted',true],
  ['wanted',true],['stopped',false],['decided',true],['relaxed',false]
];

/* ---- Exercise F · verbs to put into the past --------------------------- */
const ED_VERBS = [
  ['open','d'],['refuse','d'],['attend','id'],['climb','d'],['persuade','id'],
  ['prefer','d'],['hurry','d'],['charge','d'],['arrive','d'],['last','id'],
  ['correct','id'],['relax','t'],['hope','t'],['enjoy','d'],['relate','id'],
  ['remember','d'],['control','d'],['ask','t'],['pretend','id'],['die','d'],
  ['shout','id'],['watch','t'],['explain','d'],['sew','d'],['slip','t'],
  ['exchange','d'],['remind','id'],['hug','d'],['wash','t'],['need','id'],
  ['laugh','t'],['call','d'],['visit','id'],['finish','t'],['plan','d'],['want','id']
];

/* ---- Exercise E · past or present? ------------------------------------- */
const PAST_PRESENT = [
  ['The stores','closed','close','at 6 p.m. on Saturday.','past'],
  ['Your chocolate cake','tasted','tastes','great.','present'],
  ['I think that they','lived','live','in Miami.','past'],
  ['The movie','started','starts','at eight o\u2019clock.','present'],
  ['They','received','receive','a lot of money from their parents.','past'],
  ['We','counted','count','the money before leaving.','past'],
  ['The children','needed','need','to go to the bathroom.','past'],
  ['We','studied','study','in the library every afternoon.','present'],
  ['After work, I usually','walked','walk','home.','present'],
  ['I','called','call','him up every Sunday.','past'],
  ['She really','loved','loves','her children.','past'],
  ['My parents','wanted','want','me to go to college.','past']
];

/* ---- Exercise A (14.2) · is the <e> pronounced? ------------------------- */
const SILENT_E_S = [
  ['refuses',true],['rides',false],['gloves',false],['replaces',true],
  ['matches',true],['knives',false],['pages',true],['tomatoes',false],
  ['foxes',true],['compares',false],['cigarettes',false],['headaches',false],
  ['dances',true],['hopes',false],['washes',true],['dogs',false]
];

/* ---- Exercise H · nouns to pluralise ----------------------------------- */
const S_NOUNS = [
  ['success','iz'],['word','z'],['window','z'],['service','iz'],['automobile','z'],
  ['crash','iz'],['eye','z'],['experiment','s'],['year','z'],['depart','s'],
  ['arrive','z'],['laugh','s'],['time','z'],['inch','iz'],['science','iz'],
  ['vegetable','z'],['conversation','z'],['minute','s'],['realize','iz'],
  ['snowflake','s'],['mile','z'],['arrange','iz'],['destroy','z'],['country','z'],
  ['building','z'],['page','iz'],['type','s'],['wristwatch','iz'],
  ['book','s'],['dress','iz'],['boy','z'],['cat','s'],['judge','iz'],['dog','z']
];

/* ---- Exercise F/G · singular or plural? -------------------------------- */
const SING_PLUR = [
  ['She put the','magazine','magazines','away.','plural'],
  ['They came out with','a new product','new products','.','singular'],
  ['The','Canadian','Canadians','came to our party.','plural'],
  ['Did you visit your','sister','sisters','?','plural'],
  ['Please read the','example','examples','.','plural'],
  ['She broke the','egg','eggs','into a bowl.','singular'],
  ['Did you see the','student','students','in the cafeteria?','plural'],
  ['I need','a match','matches','.','singular'],
  ['My','friend','friends','visited me over the weekend.','plural'],
  ['Do you know which','language','languages','he speaks?','singular'],
  ['The','waitress works','waitresses work','every weekend.','singular'],
  ['The','boy studies','boys study','hard.','plural']
];

/* ---- Reading I · Howard's Morning (the <ed> passage) -------------------- */
/* Each token is [word, ending] where ending is id | t | d.                  */
const HOWARD = [
  {t:'The clock radio '}, {w:'played', a:'d'}, {t:' soft music, but it '},
  {w:'sounded', a:'id'}, {t:' far away to Howard. At last, he '},
  {w:'opened', a:'d'}, {t:' his eyes, '}, {w:'rolled', a:'d'}, {t:' over, and '},
  {w:'looked', a:'t'}, {t:' at the clock. He '}, {w:'turned', a:'d'},
  {t:' away and '}, {w:'started', a:'id'}, {t:' to go back to sleep when suddenly he '},
  {w:'realized', a:'d'}, {t:' that it was already eight o\u2019clock. He was late. He '},
  {w:'jumped', a:'t'}, {t:' out of bed, quickly '}, {w:'shaved', a:'d'}, {t:', '},
  {w:'brushed', a:'t'}, {t:' his teeth, '}, {w:'combed', a:'d'}, {t:' his hair, and got '},
  {w:'dressed', a:'t'}, {t:'. He\u2019d '}, {w:'wanted', a:'id'}, {t:' to take a shower, but '},
  {w:'decided', a:'id'}, {t:' that there wasn\u2019t enough time. He '},
  {w:'rushed', a:'t'}, {t:' down the stairs and into the kitchen. He '},
  {w:'hated', a:'id'}, {t:' being late. Hurriedly, he '}, {w:'fixed', a:'t'},
  {t:' breakfast \u2014 coffee and a '}, {w:'toasted', a:'id'},
  {t:' English muffin (no time for his usual '}, {w:'fried', a:'d'}, {t:' egg) \u2014 and '},
  {w:'raced', a:'t'}, {t:' out the door. He '}, {w:'started', a:'id'},
  {t:' his car and had just '}, {w:'pulled', a:'d'},
  {t:' out the driveway when the thought '}, {w:'popped', a:'t'},
  {t:' into his mind: it was Saturday; he didn\u2019t have to go to work after all. He slowly '},
  {w:'returned', a:'d'}, {t:', '}, {w:'climbed', a:'d'}, {t:' the stairs, '},
  {w:'changed', a:'d'}, {t:' his clothes, and went back to bed again.'}
];

/* ---- Reading K · Laundry Time (the <s> passage) ------------------------- */
const LAUNDRY = [
  {t:'Liz '}, {w:'hates', a:'s'}, {t:' doing the laundry. She '}, {w:'realizes', a:'iz'},
  {t:' that four '}, {w:'weeks', a:'s'}, {t:' have '}, {w:'passed', a:'t-skip'},
  {t:' since her last trip to the laundromat. There are '}, {w:'piles', a:'z'},
  {t:' of '}, {w:'clothes', a:'z'}, {t:' in the '}, {w:'closets', a:'s'},
  {t:', the '}, {w:'sheets', a:'s'}, {t:' and '}, {w:'towels', a:'z'},
  {t:' are dirty, she\u2019s been wearing the same pair of blue '}, {w:'jeans', a:'z'},
  {t:' for nine '}, {w:'days', a:'z'}, {t:', and she '}, {w:'doesn\u2019t', a:'z'},
  {t:' have any clean '}, {w:'socks', a:'s'}, {t:' or '}, {w:'blouses', a:'iz'},
  {t:' left. She '}, {w:'thinks', a:'s'}, {t:' about it while she '},
  {w:'watches', a:'iz'}, {t:' one of her favorite TV '}, {w:'shows', a:'z'},
  {t:'. She '}, {w:'wishes', a:'iz'}, {t:' she didn\u2019t have to do such '},
  {w:'chores', a:'z'}, {t:'. Then she '}, {w:'opens', a:'z'}, {t:' a book, '},
  {w:'turns', a:'z'}, {t:' the '}, {w:'pages', a:'iz'}, {t:', and '},
  {w:'tries', a:'z'}, {t:' to study. The phone '}, {w:'rings', a:'z'},
  {t:': one of Liz\u2019s '}, {w:'friends', a:'z'}, {t:' '}, {w:'reminds', a:'z'},
  {t:' her about Sally\u2019s party tomorrow evening. She '}, {w:'decides', a:'z'},
  {t:' that it\u2019s now or never. She can\u2019t go to the party unless she '},
  {w:'washes', a:'iz'}, {t:' one of her new '}, {w:'dresses', a:'iz'},
  {t:'. She '}, {w:'stuffs', a:'s'}, {t:' all her '}, {w:'clothes', a:'z'},
  {t:' into two laundry '}, {w:'bags', a:'z'}, {t:'. She '}, {w:'strips', a:'s'},
  {t:' the bed and '}, {w:'pulls', a:'z'}, {t:' the '}, {w:'pillowcases', a:'iz'},
  {t:' off the '}, {w:'pillows', a:'z'}, {t:'. She '}, {w:'goes', a:'z'},
  {t:' through the apartment, picking up everything in sight.'}
];

/* ---- Linking pairs for the consonant-group practice -------------------- */
const LINKING = [
  ['gets up',           'gɛt sʌp',        'gɛts ʌp'],
  ['find out',          'faɪn daʊt',      'faɪnd aʊt'],
  ['told her',          'toʊl dɚ',        'toʊld hɚ'],
  ['grabbed it',        'græb dɪt',       'græbd ɪt'],
  ['thanks him',        'θæŋk sɪm',       'θæŋks hɪm'],
  ['loves it',          'lʌv zɪt',        'lʌvz ɪt'],
  ['most of them',      'moʊs təv ðəm',   'moʊst ɒv ðɛm'],
  ['first of all',      'fɚs tə vɔl',     'fɚst ɒv ɔl'],
  ['changed his mind',  'tʃeɪndʒ dɪz maɪnd','tʃeɪndʒd hɪz maɪnd'],
  ['kept her promise',  'kɛp tɚ prɑmɪs',  'kɛpt hɚ prɑmɪs'],
  ['picked up his date','pɪk tə pɪz deɪt','pɪkt ʌp hɪz deɪt'],
  ['words are hard',    'wɚd zɚ hɑɚd',    'wɚdz ɑɚ hɑɚd']
];


/* =============================================================================
   2. STATE
   ========================================================================== */
const KEY = 'ten-thousand-page-v1';

const Store = (() => {
  let ok = false;
  try { localStorage.setItem(KEY+'-t','1'); localStorage.removeItem(KEY+'-t'); ok = true; } catch(e){}
  return {
    ok,
    load(){ if(!ok) return null; try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch(e){ return null; } },
    save(v){ if(!ok) return; try { localStorage.setItem(KEY, JSON.stringify(v)); } catch(e){} },
    wipe(){ if(!ok) return; try { localStorage.removeItem(KEY); } catch(e){} }
  };
})();

const State = {
  name: '',
  scores: {},                 // practice id -> {right, total, at}
  voice: { engine:'browser', voiceIndex:0, kokoroUrl:'', kokoroVoice:'af_heart', rate:0.9 }
};

(function restore(){
  const s = Store.load();
  if(!s) return;
  State.name   = s.name   || '';
  State.scores = s.scores || {};
  if(s.voice) Object.assign(State.voice, s.voice);
})();

function persist(){
  Store.save({ name:State.name, scores:State.scores, voice:State.voice });
}

/* small helpers used everywhere */
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const shuffle = a => { a = a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.random()*(i+1)|0; [a[i],a[j]]=[a[j],a[i]]; } return a; };
const pick = (a,n) => shuffle(a).slice(0,n);
const CALM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================================
   3b. MOTION — optional. Everything above and below this point works
   identically whether motion.js loaded or not; LIVE is the one gate.
   ========================================================================== */
const M = window.Motion || null;
const LIVE = !!M && !CALM;
if(LIVE) document.documentElement.classList.add('js-motion', 'anim-armed');
/* Un-hides anything the CSS pre-hid for the entrance animation. Called once
   the choreography finishes, from a catch block if anything throws, and
   unconditionally after 3s — so a broken motion.js can never leave the page
   blank, only less decorated. */
function revealAll(){ document.documentElement.classList.remove('anim-armed'); }
if(LIVE) setTimeout(revealAll, 3000);

/* Stagger the cards inside a slide into view. Safe to call on any slide —
   it only touches elements that are actually present. */
function entranceStagger(slideEl){
  if(!LIVE || !slideEl) return;
  const items = slideEl.querySelectorAll('.rule-card, .trial-card, .stat');
  if(!items.length) return;
  try{
    M.animate(items, { opacity:[0,1], y:[22,0] },
      { delay: M.stagger(.06), duration:.5, easing:[.22,1,.3,1] });
  }catch(e){ /* decoration only — never block the UI over this */ }
}

/* Magnetic pull toward the cursor. Pure transform + a CSS spring for the
   release, so it works with or without Motion and costs nothing on
   pointermove. */
function magnetize(el){
  let raf = null;
  el.addEventListener('pointermove', e => {
    if(raf) return;
    raf = requestAnimationFrame(() => {
      raf = null;
      const r = el.getBoundingClientRect();
      const mx = e.clientX - (r.left + r.width/2);
      const my = e.clientY - (r.top  + r.height/2);
      el.classList.add('pulling');
      el.style.transform = `translate3d(${mx*.22}px,${my*.28}px,0)`;
    });
  });
  el.addEventListener('pointerleave', () => {
    el.classList.remove('pulling');
    el.style.transform = '';
  });
}

/* Cursor-tracked spotlight — writes CSS custom properties the stylesheet
   already knows how to render (see .trial-card::after / .rule-card::after). */
function spotlight(el){
  el.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    el.style.setProperty('--my', (e.clientY - r.top)  + 'px');
  });
}

/* Reveals the gate slide's own [data-reveal] elements. This is separate
   from entranceStagger() because the gate is already .active in the raw
   HTML — go() is never called for it, so nothing else would trigger its
   entrance. Elements sharing the same data-reveal value animate together
   as one group (the paragraph and the illustration arrive at the same
   beat); groups are explicitly ordered by that value rather than by
   M.stagger()'s array-index delay, which would not group same-step items
   correctly on its own. */
function bootReveal(){
  if(!LIVE) return;
  try{
    const groups = {};
    document.querySelectorAll('[data-reveal]').forEach(el => {
      const k = el.dataset.reveal || '0';
      (groups[k] = groups[k] || []).push(el);
    });
    Object.keys(groups).sort((a,b) => a-b).forEach((k,i) => {
      M.animate(groups[k], { opacity:[0,1], y:[24,0] },
        { delay: .08 + i*.09, duration:.8, easing:[.22,1,.3,1] });
    });
  }catch(e){ /* revealAll()'s timeout still guarantees visibility */ }
}

function wireMicroInteractions(root=document){
  if(!CALM){
    root.querySelectorAll('.cta-btn, .nav-btn').forEach(el => {
      if(el._magnetized) return; el._magnetized = true; magnetize(el);
    });
    root.querySelectorAll('.trial-card, .rule-card').forEach(el => {
      if(el._spotlit) return; el._spotlit = true; spotlight(el);
    });
  }
}


/* =============================================================================
   3. VOICE
   Two engines. The browser one is always available; Kokoro is free and
   open-weight but it is a model, so it has to be running somewhere the page
   can reach. If the request fails we say so and fall back rather than going
   silent in the middle of a listening exercise.
   ========================================================================== */
const Voice = {
  list: [], current: null, audio: null,

  init(){
    const load = () => {
      this.list = speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang));
      const sel = $('#voice');
      if(!sel) return;
      sel.innerHTML = this.list.map((v,i) => `<option value="${i}">${esc(v.name)} · ${esc(v.lang)}</option>`).join('')
                   || '<option value="-1">No English voice found on this device</option>';
      let idx = State.voice.voiceIndex;
      if(!(idx >= 0 && idx < this.list.length)){
        idx = this.list.findIndex(v => /natural|premium|enhanced|samantha|google us/i.test(v.name));
        if(idx < 0) idx = 0;
      }
      sel.value = idx;
      this.current = this.list[idx] || null;
    };
    load();
    speechSynthesis.onvoiceschanged = load;

    $('#voice').addEventListener('change', e => {
      State.voice.voiceIndex = +e.target.value;
      this.current = this.list[+e.target.value] || null;
      persist();
    });

    const engine = $('#engine');
    engine.value = State.voice.engine;
    const sync = () => {
      const k = engine.value === 'kokoro';
      $('#kokoro-block').hidden = !k;
      $('#browser-block').hidden = k;
      State.voice.engine = engine.value;
      persist();
    };
    engine.addEventListener('change', sync);
    sync();

    const url = $('#kokoro-url');
    url.value = State.voice.kokoroUrl;
    url.addEventListener('change', () => { State.voice.kokoroUrl = url.value.trim(); persist(); });

    const kv = $('#kokoro-voice');
    kv.value = State.voice.kokoroVoice;
    kv.addEventListener('change', () => { State.voice.kokoroVoice = kv.value; persist(); });

    const rate = $('#rate');
    rate.value = State.voice.rate;
    $('#rate-val').textContent = (+State.voice.rate).toFixed(2);
    rate.addEventListener('input', () => {
      State.voice.rate = +rate.value;
      $('#rate-val').textContent = (+rate.value).toFixed(2);
      persist();
    });

    $('#test-voice').addEventListener('click', () => {
      this.say('He needed it. He walked in. He robbed a bank.');
    });
  },

  /* say() never throws — a listening exercise must not die because audio did */
  async say(text, slow){
    try{
      if(State.voice.engine === 'kokoro' && State.voice.kokoroUrl){
        const done = await this.kokoro(text);
        if(done) return;
        this.note('Kokoro did not answer — using the browser voice instead.');
      }
      this.browser(text, slow);
    }catch(e){
      this.browser(text, slow);
    }
  },

  browser(text, slow){
    if(!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if(this.current) { u.voice = this.current; u.lang = this.current.lang; }
    u.rate = slow ? Math.max(0.45, State.voice.rate - 0.3) : State.voice.rate;
    speechSynthesis.speak(u);
  },

  /* OpenAI-compatible shape, which is what kokoro-fastapi exposes */
  async kokoro(text){
    try{
      const res = await fetch(State.voice.kokoroUrl, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          model:'kokoro', input:text,
          voice: State.voice.kokoroVoice,
          response_format:'mp3', speed: State.voice.rate
        })
      });
      if(!res.ok) return false;
      const blob = await res.blob();
      if(this.audio) { this.audio.pause(); URL.revokeObjectURL(this.audio.src); }
      this.audio = new Audio(URL.createObjectURL(blob));
      await this.audio.play();
      return true;
    }catch(e){ return false; }
  },

  note(msg){
    const n = $('#engine-note');
    if(!n) return;
    const old = n.innerHTML;
    n.innerHTML = `<b style="color:#ff4db8">${esc(msg)}</b>`;
    clearTimeout(this._t);
    this._t = setTimeout(() => { n.innerHTML = old; }, 4000);
  }
};


/* =============================================================================
   4. ROUTER — the slide deck
   ========================================================================== */
const SLIDES = ['s-gate','s-voice','s-map','s-ed','s-s','s-groups','s-hub','s-arena','s-report'];
let currentSlide = 's-gate';

function go(id){
  const to = document.getElementById(id);
  if(!to) return;
  const from = document.getElementById(currentSlide);
  if(from === to) return;

  speechSynthesis && speechSynthesis.cancel();
  currentSlide = id;
  paintDots();

  to.scrollTop = 0;
  const area = $('.scroll-area', to);
  if(area) area.scrollTop = 0;

  if(!LIVE){
    /* Original CSS-only transition. Untouched, still exactly what it was. */
    if(from){
      from.classList.remove('active');
      if(!CALM){
        from.classList.add('exit-up');
        setTimeout(() => from.classList.remove('exit-up'), 420);
      }
    }
    to.classList.add('active');
    return;
  }

  /* Motion-driven crossfade. Motion owns opacity/transform/blur completely
     while it runs; once each animation finishes, the inline styles it wrote
     are cleared so the plain .active CSS rule is back in charge of the
     resting state — no stale inline value can outlive the transition. */
  try{
    to.style.pointerEvents = 'none';
    to.classList.add('active');
    Object.assign(to.style, { opacity:0, transform:'translateY(46px) scale(.985)', filter:'blur(6px)' });

    if(from){
      from.style.pointerEvents = 'none';
      M.animate(from, { opacity:[1,0], y:[0,-34], filter:['blur(0px)','blur(6px)'], scale:[1,.985] },
        { duration:.42, easing:[.55,0,1,.45] }
      ).finished.then(() => {
        from.classList.remove('active');
        from.style.opacity = from.style.transform = from.style.filter = from.style.pointerEvents = '';
      }).catch(() => { from.classList.remove('active'); });
    }

    M.animate(to, { opacity:[0,1], y:[46,0], filter:['blur(6px)','blur(0px)'], scale:[.985,1] },
      { duration:.62, easing:[.22,1,.36,1] }
    ).finished.then(() => {
      to.style.opacity = to.style.transform = to.style.filter = to.style.pointerEvents = '';
      entranceStagger(to);
    }).catch(() => { to.style.pointerEvents = ''; });
  }catch(e){
    /* Motion misbehaved mid-call — fall back to the plain, always-correct
       CSS state so navigation still works. */
    if(from) from.classList.remove('active');
    to.classList.add('active');
    to.style.opacity = to.style.transform = to.style.filter = to.style.pointerEvents = '';
  }
}

function paintDots(){
  const nav = $('#dot-nav');
  nav.innerHTML = SLIDES.map(id =>
    `<button class="dot ${id===currentSlide?'active':''}" data-dot="${id}"
             aria-label="${id.replace('s-','')}"></button>`).join('');
}

document.addEventListener('click', e => {
  const g = e.target.closest('[data-go]');
  if(g){ go(g.dataset.go); return; }
  const d = e.target.closest('[data-dot]');
  if(d){
    /* the gate has to be passed before anything else opens */
    if(!State.name && d.dataset.dot !== 's-gate'){ go('s-gate'); return; }
    go(d.dataset.dot);
  }
});


/* =============================================================================
   5. RULE SLIDES — built from DATA so the rules and the drills can never drift
   ========================================================================== */
function ruleCard(r){
  return `<div class="rule-card ${r.tone}">
    <div class="rule-sound">${r.sound}</div>
    <div class="rule-when">${r.when}<br><span style="opacity:.6">${r.spell}</span></div>
    <div class="rule-ex">
      ${r.words.map(([w,ip]) => `
        <button class="ex-word" data-say="${esc(w)}">${esc(w)}${
          ip && ip!=='—' ? `<span class="ip">/${esc(ip)}/</span>` : ''}</button>`).join('')}
    </div>
  </div>`;
}
function renderRules(){
  $('#ed-rules').innerHTML     = ED_RULES.map(ruleCard).join('');
  $('#s-rules').innerHTML      = S_RULES.map(ruleCard).join('');
  $('#group-rules').innerHTML  = GROUP_RULES.map(ruleCard).join('');
}
document.addEventListener('click', e => {
  const s = e.target.closest('[data-say]');
  if(s) Voice.say(s.dataset.say);
});


/* =============================================================================
   6. ARENA — the shell every practice draws into
   ========================================================================== */
const Arena = {
  id:null, items:[], i:0, right:0, locked:false,

  open(def){
    this.id = def.id; this.def = def;
    this.items = def.build();
    this.i = 0; this.right = 0; this.locked = false;
    $('#arena-name').textContent = def.name;
    go('s-arena');
    this.draw();
  },

  hud(){
    $('#hud-item').textContent  = `${Math.min(this.i+1, this.items.length)}/${this.items.length}`;
    $('#hud-score').textContent = this.right;
    $('#prog').style.width = `${(this.i / this.items.length) * 100}%`;
  },

  draw(){
    if(this.i >= this.items.length) return this.finish();
    this.locked = false;
    this.hud();
    $('#arena-body').innerHTML = this.def.render(this.items[this.i], this.i);
    if(this.def.after) this.def.after(this.items[this.i]);
    wireMicroInteractions($('#arena-body'));
  },

  /* every practice reports back through here */
  judge(ok, why){
    if(this.locked) return;
    this.locked = true;
    if(ok) this.right++;
    this.hud();
    const box = document.createElement('div');
    box.className = 'verdict';
    box.innerHTML = `
      <div class="verdict-head ${ok?'good':'bad'}">${ok?'Correct.':'Not that one.'}</div>
      <div class="verdict-why">${why}</div>
      <button class="cta-btn small-cta" id="next-item">
        ${this.i+1 < this.items.length ? 'Next' : 'See the result'} <span class="btn-arrow">→</span>
      </button>`;
    $('#arena-body').appendChild(box);
    wireMicroInteractions(box);
    $('#next-item').onclick = () => { this.i++; this.draw(); };
    $('#next-item').focus();
  },

  finish(){
    const total = this.items.length;
    const pct = Math.round(this.right / total * 100);
    const s = { right:this.right, total, at:new Date().toISOString(), name:this.def.name };
    State.scores[this.id] = s;
    persist();
    /* best-effort: does not block the result screen, and never throws */
    sendToSheet(this.id, s).then(ok => {
      if(CONFIG.endpoint) note('sheets-status', ok ? 'Sent to your teacher.' : 'Saved here, but could not reach your teacher\'s sheet.');
    });
    $('#prog').style.width = '100%';
    $('#hud-item').textContent = `${total}/${total}`;
    $('#arena-body').innerHTML = `
      <div class="center">
        <div class="stat-val ${pct>=80?'grad-teal':'grad-pink'}" style="font-size:64px">${pct}%</div>
        <p class="hero-sub" style="margin:12px auto 22px">
          ${this.right} of ${total} correct.
          ${pct>=90 ? 'You have this ending under control.'
            : pct>=70 ? 'Close. Re-read the rule card and run it once more — the items reshuffle.'
            : 'Go back to the rules for this ending, then try again. The items are not the same twice.'}
        </p>
        <div class="result-actions">
          <button class="cta-btn small-cta" id="again">Run it again</button>
          <button class="nav-btn" data-go="s-hub">Other practices</button>
          <button class="nav-btn" data-go="s-report">My report</button>
        </div>
      </div>`;
    $('#again').onclick = () => this.open(this.def);
    wireMicroInteractions($('#arena-body'));
    renderHub();
    renderReport();
  }
};

/* the three-way sound question used by several practices */
function soundOptions(choices, correctKey, onPick){
  return `<div class="options">
    ${choices.map((c,k) => `
      <button class="opt" data-key="${c.key}">
        <span class="opt-key">${'ABC'[k]}</span>
        <span><b style="font-family:'Spline Sans Mono',monospace">${c.label}</b>
        <span style="opacity:.6"> — ${c.hint}</span></span>
      </button>`).join('')}
  </div>`;
}
function wireOptions(correctKey, explain){
  $$('#arena-body .opt').forEach(b => {
    b.onclick = () => {
      if(Arena.locked) return;
      const ok = b.dataset.key === correctKey;
      $$('#arena-body .opt').forEach(x => {
        x.disabled = true;
        if(x.dataset.key === correctKey) x.classList.add('correct');
        else if(x === b) x.classList.add('wrong');
        else x.classList.add('dim');
      });
      Arena.judge(ok, explain);
    };
  });
}

const ED_CHOICES = [
  {key:'id', label:'/ɪd/', hint:'an extra syllable'},
  {key:'t',  label:'/t/',  hint:'no extra syllable, voiceless'},
  {key:'d',  label:'/d/',  hint:'no extra syllable, voiced'}
];
const S_CHOICES = [
  {key:'iz', label:'/ɪz/', hint:'an extra syllable'},
  {key:'s',  label:'/s/',  hint:'no extra syllable, voiceless'},
  {key:'z',  label:'/z/',  hint:'no extra syllable, voiced'}
];

/* past-tense spelling, good enough for the verbs in this chapter */
function toPast(v){
  if(/e$/.test(v)) return v + 'd';
  if(/[^aeiou]y$/.test(v)) return v.slice(0,-1) + 'ied';
  if(/^(plan|hug|slip|stop|beg|rob|plan)$/.test(v)) return v + v.slice(-1) + 'ed';
  return v + 'ed';
}
function toPlural(n){
  if(/(s|z|x|sh|ch)$/.test(n)) return n + 'es';
  if(/[^aeiou]y$/.test(n)) return n.slice(0,-1) + 'ies';
  if(/e$/.test(n)) return n + 's';
  return n + 's';
}
const SOUND_NAME = { id:'/ɪd/', t:'/t/', d:'/d/', iz:'/ɪz/', s:'/s/', z:'/z/' };


/* =============================================================================
   7. THE TEN PRACTICES
   ========================================================================== */
const PRACTICES = [

  /* ---------- 1 · listening, <ed> ------------------------------------- */
  {
    id:'ed-listen', name:'Listen · the <ed> ending', tag:'Listening', n:10,
    desc:'Hear a past-tense verb and decide which of the three endings you heard.',
    build(){
      const pool = ED_RULES.flatMap(r => r.words.map(([w,ip]) => ({w, ip, a:r.key})));
      return pick(pool, 10);
    },
    render(it){
      return `<p class="arena-prompt">Play the word. Which ending did you hear?</p>
        <button class="play-big" id="play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></button>
        <p class="repair-note center" style="margin-bottom:14px">
          Press <span class="kbd">P</span> to hear it again · <span class="kbd">S</span> for slower
        </p>
        ${soundOptions(ED_CHOICES)}`;
    },
    after(it){
      const play = $('#play');
      const hit = slow => { play.classList.add('ringing'); Voice.say(it.w, slow);
                            setTimeout(()=>play.classList.remove('ringing'), 900); };
      play.onclick = () => hit(false);
      setTimeout(() => hit(false), 260);
      Arena._keys = e => {
        if(e.key === 'p' || e.key === 'P') hit(false);
        if(e.key === 's' || e.key === 'S') hit(true);
      };
      wireOptions(it.a, `<b>${esc(it.w)}</b> is /${esc(it.ip)}/ — the ending is
        <span class="fix">${SOUND_NAME[it.a]}</span>.
        ${it.a==='id' ? 'The verb ends in /t/ or /d/, so the ending becomes its own syllable.'
          : it.a==='t' ? 'The verb ends in a voiceless sound, so the ending is voiceless too.'
          : 'The verb ends in a voiced sound or a vowel, so the ending is voiced.'}`);
    }
  },

  /* ---------- 2 · listening, past or present -------------------------- */
  {
    id:'past-present', name:'Listen · past or present?', tag:'Listening', n:10,
    desc:'The only difference between these sentences is the ending. Catch it.',
    build(){ return pick(PAST_PRESENT, 10); },
    render(it){
      const [lead, past, pres, tail] = it;
      return `<p class="arena-prompt">Listen, then choose the form you heard.</p>
        <button class="play-big" id="play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></button>
        <div class="specimen-wrap"><div class="specimen">
          ${esc(lead)} <span class="gap-mark">______</span> ${esc(tail)}
        </div></div>
        <div class="options">
          <button class="opt" data-key="past"><span class="opt-key">A</span><span><b>${esc(past)}</b> <span style="opacity:.6">— past</span></span></button>
          <button class="opt" data-key="present"><span class="opt-key">B</span><span><b>${esc(pres)}</b> <span style="opacity:.6">— present</span></span></button>
        </div>`;
    },
    after(it){
      const [lead, past, pres, tail, ans] = it;
      const said = `${lead} ${ans==='past'?past:pres} ${tail}`;
      const play = $('#play');
      const hit = slow => { play.classList.add('ringing'); Voice.say(said, slow);
                            setTimeout(()=>play.classList.remove('ringing'), 1100); };
      play.onclick = () => hit(false);
      setTimeout(() => hit(false), 280);
      Arena._keys = e => { if(e.key==='p'||e.key==='P') hit(false); if(e.key==='s'||e.key==='S') hit(true); };
      wireOptions(ans, `The sentence was <b>${esc(said)}</b>
        ${ans==='past' ? '— the ending is what tells you it already happened.'
                       : '— no ending on the verb, so it is the present.'}`);
    }
  },

  /* ---------- 3 · reading, is the <e> pronounced? ---------------------- */
  {
    id:'silent-e-ed', name:'Read · is the &lt;e&gt; pronounced?', tag:'Reading', n:10,
    desc:'Cross out the <e> whenever it is silent. Only /t/ and /d/ verbs keep it.',
    build(){ return pick(SILENT_E_ED, 10).map(([w,voiced]) => ({w, a: voiced ? 'yes' : 'no'})); },
    render(it){
      return `<p class="arena-prompt">Is the &lt;e&gt; in this ending pronounced?</p>
        <div class="specimen-wrap"><div class="specimen center" style="font-size:34px;font-family:'Fraunces',serif">
          ${esc(it.w)}
        </div></div>
        <div class="options">
          <button class="opt" data-key="yes"><span class="opt-key">A</span><span><b>Yes</b> <span style="opacity:.6">— it adds a syllable, /ɪd/</span></span></button>
          <button class="opt" data-key="no"><span class="opt-key">B</span><span><b>No</b> <span style="opacity:.6">— the &lt;e&gt; is silent</span></span></button>
        </div>
        <div class="repair-row" style="justify-content:center;margin-top:12px">
          <button class="nav-btn" data-say="${esc(it.w)}">Hear it</button>
        </div>`;
    },
    after(it){
      wireOptions(it.a, it.a==='yes'
        ? `<b>${esc(it.w)}</b> — the verb ends in /t/ or /d/, so the ending is a separate syllable <span class="fix">/ɪd/</span>.`
        : `<b>${esc(it.w)}</b> — the &lt;e&gt; is silent. Only the consonant is added, and the word keeps the same number of syllables.`);
    }
  },

  /* ---------- 4 · production, make it past ---------------------------- */
  {
    id:'make-past', name:'Build · put it in the past', tag:'Production', n:12,
    desc:'Write the past tense, then say which of the three endings it takes.',
    build(){ return pick(ED_VERBS, 12).map(([v,a]) => ({v, a, past: toPast(v)})); },
    render(it){
      return `<p class="arena-prompt">Put <b>${esc(it.v)}</b> into the past tense, then choose its ending.</p>
        <div class="repair-box">
          <input class="repair-input" id="typed" style="min-height:0;padding:13px 15px"
                 placeholder="type the past tense of &quot;${esc(it.v)}&quot;" autocomplete="off">
          <p class="repair-hint">Spelling first, sound second. Remember <b>the sound decides the ending, not the letters</b>.</p>
        </div>
        ${soundOptions(ED_CHOICES)}`;
    },
    after(it){
      const inp = $('#typed');
      inp.focus();
      inp.addEventListener('keydown', e => {
        if(e.key === 'Enter'){
          e.preventDefault();
          if(inp.value.trim().toLowerCase() !== it.past){
            inp.classList.add('shake');
            setTimeout(()=>inp.classList.remove('shake'), 450);
          } else { Voice.say(it.past); }
        }
      });
      wireOptions(it.a, () => '');
      /* re-wire so the typed spelling counts as well as the sound */
      $$('#arena-body .opt').forEach(b => {
        b.onclick = () => {
          if(Arena.locked) return;
          const spellOk = inp.value.trim().toLowerCase() === it.past;
          const soundOk = b.dataset.key === it.a;
          $$('#arena-body .opt').forEach(x => {
            x.disabled = true;
            if(x.dataset.key === it.a) x.classList.add('correct');
            else if(x === b) x.classList.add('wrong');
            else x.classList.add('dim');
          });
          inp.disabled = true;
          Voice.say(it.past);
          Arena.judge(spellOk && soundOk,
            `<b>${esc(it.v)} → ${esc(it.past)}</b>, ending <span class="fix">${SOUND_NAME[it.a]}</span>.
             ${spellOk ? '' : `You wrote “${esc(inp.value.trim() || '—')}”. `}
             ${it.a==='id' ? 'It ends in /t/ or /d/, so the ending is its own syllable.'
               : it.a==='t' ? 'It ends in a voiceless sound, so the ending is voiceless.'
               : 'It ends in a voiced sound or a vowel, so the ending is voiced.'}`);
        };
      });
    }
  },

  /* ---------- 5 · listening, <s> --------------------------------------- */
  {
    id:'s-listen', name:'Listen · the &lt;s&gt; ending', tag:'Listening', n:10,
    desc:'Hear a plural or a third-person verb and name the ending.',
    build(){
      const pool = S_RULES.flatMap(r => r.words.map(([w,ip]) => ({w, ip, a:r.key})));
      return pick(pool, 10);
    },
    render(it){
      return `<p class="arena-prompt">Play the word. Which ending did you hear?</p>
        <button class="play-big" id="play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></button>
        <p class="repair-note center" style="margin-bottom:14px">
          <span class="kbd">P</span> again · <span class="kbd">S</span> slower
        </p>
        ${soundOptions(S_CHOICES)}`;
    },
    after(it){
      const play = $('#play');
      const hit = slow => { play.classList.add('ringing'); Voice.say(it.w, slow);
                            setTimeout(()=>play.classList.remove('ringing'), 900); };
      play.onclick = () => hit(false);
      setTimeout(() => hit(false), 260);
      Arena._keys = e => { if(e.key==='p'||e.key==='P') hit(false); if(e.key==='s'||e.key==='S') hit(true); };
      wireOptions(it.a, `<b>${esc(it.w)}</b> is /${esc(it.ip)}/ — the ending is
        <span class="fix">${SOUND_NAME[it.a]}</span>.
        ${it.a==='iz' ? 'The word already ends in a hissing sound, so a vowel has to go in between.'
          : it.a==='s' ? 'The word ends in a voiceless consonant, so the ending is voiceless.'
          : 'The word ends in a voiced sound or a vowel, so the ending is voiced.'}`);
    }
  },

  /* ---------- 6 · listening, singular or plural ------------------------ */
  {
    id:'sing-plur', name:'Listen · singular or plural?', tag:'Listening', n:10,
    desc:'Sometimes the ending is the only clue you get. Train your ear on it.',
    build(){ return pick(SING_PLUR, 10); },
    render(it){
      const [lead, sg, pl, tail] = it;
      return `<p class="arena-prompt">Listen, then choose what you heard.</p>
        <button class="play-big" id="play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></button>
        <div class="specimen-wrap"><div class="specimen">
          ${esc(lead)} <span class="gap-mark">______</span> ${esc(tail)}
        </div></div>
        <div class="options">
          <button class="opt" data-key="singular"><span class="opt-key">A</span><span><b>${esc(sg)}</b> <span style="opacity:.6">— singular</span></span></button>
          <button class="opt" data-key="plural"><span class="opt-key">B</span><span><b>${esc(pl)}</b> <span style="opacity:.6">— plural</span></span></button>
        </div>`;
    },
    after(it){
      const [lead, sg, pl, tail, ans] = it;
      const said = `${lead} ${ans==='singular'?sg:pl} ${tail}`;
      const play = $('#play');
      const hit = slow => { play.classList.add('ringing'); Voice.say(said, slow);
                            setTimeout(()=>play.classList.remove('ringing'), 1100); };
      play.onclick = () => hit(false);
      setTimeout(() => hit(false), 280);
      Arena._keys = e => { if(e.key==='p'||e.key==='P') hit(false); if(e.key==='s'||e.key==='S') hit(true); };
      wireOptions(ans, `The sentence was <b>${esc(said)}</b>. Drop that ending and the
        listener has no way of knowing how many you meant.`);
    }
  },

  /* ---------- 7 · production, pluralise -------------------------------- */
  {
    id:'make-plural', name:'Build · make it plural', tag:'Production', n:12,
    desc:'Write the plural, then choose the ending it takes.',
    build(){ return pick(S_NOUNS, 12).map(([n,a]) => ({n, a, plural: toPlural(n)})); },
    render(it){
      return `<p class="arena-prompt">Write the plural of <b>${esc(it.n)}</b>, then choose its ending.</p>
        <div class="repair-box">
          <input class="repair-input" id="typed" style="min-height:0;padding:13px 15px"
                 placeholder="plural of &quot;${esc(it.n)}&quot;" autocomplete="off">
          <p class="repair-hint">Watch the ones that take <b>&lt;es&gt;</b> — they are the ones that gain a syllable.</p>
        </div>
        ${soundOptions(S_CHOICES)}`;
    },
    after(it){
      const inp = $('#typed');
      inp.focus();
      $$('#arena-body .opt').forEach(b => {
        b.onclick = () => {
          if(Arena.locked) return;
          const spellOk = inp.value.trim().toLowerCase() === it.plural;
          const soundOk = b.dataset.key === it.a;
          $$('#arena-body .opt').forEach(x => {
            x.disabled = true;
            if(x.dataset.key === it.a) x.classList.add('correct');
            else if(x === b) x.classList.add('wrong');
            else x.classList.add('dim');
          });
          inp.disabled = true;
          Voice.say(it.plural);
          Arena.judge(spellOk && soundOk,
            `<b>${esc(it.n)} → ${esc(it.plural)}</b>, ending <span class="fix">${SOUND_NAME[it.a]}</span>.
             ${spellOk ? '' : `You wrote “${esc(inp.value.trim() || '—')}”. `}
             ${it.a==='iz' ? 'It already ends in a hissing sound, so the ending is a separate syllable.'
               : it.a==='s' ? 'It ends in a voiceless consonant, so the ending is voiceless.'
               : 'It ends in a voiced sound or a vowel, so the ending is voiced.'}`);
        };
      });
    }
  },

  /* ---------- 8 · reading passage, <ed> -------------------------------- */
  {
    id:'howard', name:'Read · Howard’s Morning', tag:'Reading', n:12,
    desc:'Tap each <ed> in the passage and label how it is pronounced.',
    build(){
      const idx = HOWARD.map((p,i) => p.w ? i : -1).filter(i => i >= 0);
      return pick(idx, 12).map(i => ({i, w:HOWARD[i].w, a:HOWARD[i].a}));
    },
    render(it){
      const html = HOWARD.map((p,i) => p.w
        ? `<span class="tok ${i===it.i?'':'done'}" data-i="${i}">${esc(p.w)}</span>`
        : esc(p.t)).join('');
      return `<p class="arena-prompt">
          In the passage, how is <b style="color:#00f5c4">${esc(it.w)}</b> pronounced?</p>
        <div class="specimen-wrap"><div class="specimen is-paragraph passage">${html}</div></div>
        ${soundOptions(ED_CHOICES)}
        <div class="repair-row" style="justify-content:center;margin-top:12px">
          <button class="nav-btn" data-say="${esc(it.w)}">Hear the word</button>
        </div>`;
    },
    after(it){
      const tok = $(`#arena-body .tok[data-i="${it.i}"]`);
      if(tok){ tok.classList.remove('done'); tok.scrollIntoView({block:'center', behavior:CALM?'auto':'smooth'}); }
      wireOptions(it.a, () => '');
      $$('#arena-body .opt').forEach(b => {
        b.onclick = () => {
          if(Arena.locked) return;
          const ok = b.dataset.key === it.a;
          $$('#arena-body .opt').forEach(x => {
            x.disabled = true;
            if(x.dataset.key === it.a) x.classList.add('correct');
            else if(x === b) x.classList.add('wrong');
            else x.classList.add('dim');
          });
          if(tok){
            tok.classList.toggle('bad', !ok);
            tok.insertAdjacentHTML('beforeend', `<span class="lab">${SOUND_NAME[it.a]}</span>`);
          }
          Voice.say(it.w);
          Arena.judge(ok, `<b>${esc(it.w)}</b> takes <span class="fix">${SOUND_NAME[it.a]}</span>.
            ${it.a==='id' ? 'It is one of the few in this passage that gains a syllable.'
              : it.a==='t' ? 'Voiceless before it, voiceless ending.'
              : 'Voiced before it, voiced ending.'}`);
        };
      });
    }
  },

  /* ---------- 9 · reading passage, <s> --------------------------------- */
  {
    id:'laundry', name:'Read · Laundry Time', tag:'Reading', n:12,
    desc:'Same idea, this time for the plural and third-person endings.',
    build(){
      const idx = LAUNDRY.map((p,i) => (p.w && p.a !== 't-skip') ? i : -1).filter(i => i >= 0);
      return pick(idx, 12).map(i => ({i, w:LAUNDRY[i].w, a:LAUNDRY[i].a}));
    },
    render(it){
      const html = LAUNDRY.map((p,i) => p.w
        ? `<span class="tok ${i===it.i?'':'done'}" data-i="${i}">${esc(p.w)}</span>`
        : esc(p.t)).join('');
      return `<p class="arena-prompt">
          In the passage, how is <b style="color:#ff4db8">${esc(it.w)}</b> pronounced?</p>
        <div class="specimen-wrap"><div class="specimen is-paragraph passage">${html}</div></div>
        ${soundOptions(S_CHOICES)}
        <div class="repair-row" style="justify-content:center;margin-top:12px">
          <button class="nav-btn" data-say="${esc(it.w)}">Hear the word</button>
        </div>`;
    },
    after(it){
      const tok = $(`#arena-body .tok[data-i="${it.i}"]`);
      if(tok){ tok.classList.remove('done'); tok.scrollIntoView({block:'center', behavior:CALM?'auto':'smooth'}); }
      $$('#arena-body .opt').forEach(b => {
        b.onclick = () => {
          if(Arena.locked) return;
          const ok = b.dataset.key === it.a;
          $$('#arena-body .opt').forEach(x => {
            x.disabled = true;
            if(x.dataset.key === it.a) x.classList.add('correct');
            else if(x === b) x.classList.add('wrong');
            else x.classList.add('dim');
          });
          if(tok){
            tok.classList.toggle('bad', !ok);
            tok.insertAdjacentHTML('beforeend', `<span class="lab">${SOUND_NAME[it.a]}</span>`);
          }
          Voice.say(it.w);
          Arena.judge(ok, `<b>${esc(it.w)}</b> takes <span class="fix">${SOUND_NAME[it.a]}</span>.
            ${it.a==='iz' ? 'It ends in a hissing sound, so the ending becomes its own syllable.'
              : it.a==='s' ? 'Voiceless before it, voiceless ending.'
              : 'Voiced before it, voiced ending.'}`);
        };
      });
    }
  },

  /* ---------- 10 · consonant groups ------------------------------------ */
  {
    id:'groups', name:'Say it · consonant groups', tag:'Linking', n:10,
    desc:'Choose the version a fluent speaker actually produces.',
    build(){
      const link = pick(LINKING, 6).map(([p, good, careful]) =>
        ({kind:'link', p, good, careful}));
      const omit = pick([
        ['acts','æks','the middle /t/ goes, the grammatical /s/ stays'],
        ['asked','æst','the middle /k/ goes, the grammatical /t/ stays'],
        ['months','mʌns','the middle /θ/ goes, the grammatical /s/ stays'],
        ['lengths','lɛŋs','the middle /θ/ goes, the grammatical /s/ stays'],
        ['tests','tɛss','the middle /t/ goes and the /s/ is held long'],
        ['depths','dɛps','the middle /θ/ goes, the grammatical /s/ stays'],
        ['lifts','lɪfs','the middle /t/ goes, the grammatical /s/ stays']
      ], 4).map(([w, red, why]) => ({kind:'omit', w, red, why}));
      return shuffle([...link, ...omit]);
    },
    render(it){
      if(it.kind === 'link'){
        return `<p class="arena-prompt">Which one is the fluent version of <b>${esc(it.p)}</b>?</p>
          <div class="gap-context">Rule 1 — make the consonant that ends one word begin the next.</div>
          <div class="options">
            <button class="opt" data-key="good"><span class="opt-key">A</span>
              <span style="font-family:'Spline Sans Mono',monospace">/${esc(it.good)}/</span></button>
            <button class="opt" data-key="careful"><span class="opt-key">B</span>
              <span style="font-family:'Spline Sans Mono',monospace">/${esc(it.careful)}/</span></button>
          </div>
          <div class="repair-row" style="justify-content:center;margin-top:12px">
            <button class="nav-btn" data-say="${esc(it.p)}">Hear it</button>
          </div>`;
      }
      return `<p class="arena-prompt">Which consonant may you drop in <b>${esc(it.w)}</b>?</p>
        <div class="gap-context">Rule 4 — you may drop a middle consonant, never the grammatical ending.</div>
        <div class="options">
          <button class="opt" data-key="mid"><span class="opt-key">A</span>
            <span>The <b>middle</b> one — /${esc(it.red)}/</span></button>
          <button class="opt" data-key="end"><span class="opt-key">B</span>
            <span>The <b>final</b> &lt;s&gt; or &lt;ed&gt;</span></button>
          <button class="opt" data-key="none"><span class="opt-key">C</span>
            <span>None — every consonant must be said</span></button>
        </div>`;
    },
    after(it){
      const key = it.kind === 'link' ? 'good' : 'mid';
      const why = it.kind === 'link'
        ? `<b>${esc(it.p)}</b> → <span class="fix">/${esc(it.good)}/</span>.
           The final consonant moves across and starts the next word. Option B is not wrong,
           it is just slow and over-careful, and it is what makes speech sound word-by-word.`
        : `<b>${esc(it.w)}</b> → <span class="fix">/${esc(it.red)}/</span> — ${esc(it.why)}.
           Native speakers do this too. Dropping the ending instead would change the grammar.`;
      wireOptions(key, why);
    }
  },

  /* ---------- bonus · the old adjectives ------------------------------- */
  {
    id:'old-adj', name:'Match · the old adjectives', tag:'Vocabulary', n:6,
    desc:'The words that keep /ɪd/ even though they are not verbs.',
    build(){ return pick(OLD_ADJ, 6).map(([w,m]) => ({w, m})); },
    render(it, i){
      const wrong = pick(OLD_ADJ.filter(p => p[0] !== it.w), 2).map(p => p[1]);
      const opts = shuffle([it.m, ...wrong]);
      return `<p class="arena-prompt">What does <b>${esc(it.w)}</b> mean?</p>
        <div class="specimen-wrap"><div class="specimen center"
             style="font-size:30px;font-family:'Fraunces',serif">${esc(it.w)}
             <span style="font-family:'Spline Sans Mono',monospace;font-size:15px;color:rgba(255,255,255,.4);display:block;margin-top:6px">
             the &lt;ed&gt; here is a separate syllable /ɪd/</span></div></div>
        <div class="options">
          ${opts.map((o,k) => `<button class="opt" data-key="${esc(o)}">
            <span class="opt-key">${'ABC'[k]}</span><span>${esc(o)}</span></button>`).join('')}
        </div>
        <div class="repair-row" style="justify-content:center;margin-top:12px">
          <button class="nav-btn" data-say="${esc(it.w)}">Hear it</button>
        </div>`;
    },
    after(it){
      wireOptions(it.m, `<b>${esc(it.w)}</b> means “${esc(it.m)}”, and it is pronounced with
        <span class="fix">/ɪd/</span> as a separate syllable — one of the small group of very old
        words that keep it.`);
    }
  }
];

/* keyboard shortcuts belong to whichever practice is on screen */
document.addEventListener('keydown', e => {
  if(currentSlide !== 's-arena') return;
  if(e.target.matches('input, textarea')) return;
  if(Arena._keys) Arena._keys(e);
  const n = 'abc'.indexOf(e.key.toLowerCase());
  if(n >= 0){
    const btn = $$('#arena-body .opt')[n];
    if(btn && !btn.disabled) btn.click();
  }
  if(e.key === 'Enter'){
    const nx = $('#next-item');
    if(nx) nx.click();
  }
});


/* =============================================================================
   7b. SEND TO SHEETS
   Same technique as the Sentence Foundry template this page borrows its
   stylesheet from: post as text/plain so the browser treats it as a "simple
   request" and skips the CORS preflight, which a bare Apps Script web app
   cannot answer. Unlike a no-cors post, this gets a real response back, so
   the status message on screen is honest about whether it worked.
   ========================================================================== */
function sheetRow(practiceId, s){
  return {
    kind: 'score',
    name: State.name,
    practice: (PRACTICES.find(p => p.id === practiceId) || {}).name || practiceId,
    right: s.right, total: s.total,
    percent: Math.round(s.right / s.total * 100),
    at: s.at
  };
}

function sendToSheet(practiceId, s){
  if(!CONFIG.endpoint) return Promise.resolve(false);
  return fetch(CONFIG.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(sheetRow(practiceId, s))
  })
  .then(r => r.text())
  .then(raw => { try { return !!JSON.parse(raw).ok; } catch(e){ return true; /* non-JSON but not an error */ } })
  .catch(() => false);
}

async function sendAllToSheet(){
  if(!CONFIG.endpoint){ note('sheets-status', 'No teacher endpoint is set up for this page.'); return; }
  const entries = Object.entries(State.scores);
  if(!entries.length){ note('sheets-status', 'Nothing to send yet — finish a practice first.'); return; }
  note('sheets-status', `Sending ${entries.length} result${entries.length>1?'s':''}…`);
  let okCount = 0;
  for(const [id, s] of entries){
    if(await sendToSheet(id, s)) okCount++;
  }
  note('sheets-status', okCount === entries.length
    ? `Sent — ${okCount} result${okCount>1?'s':''} reached the sheet.`
    : `Sent ${okCount} of ${entries.length}. Check your connection and try again for the rest.`);
}

function note(id, msg){ const el = $('#'+id); if(el) el.textContent = msg; }


/* =============================================================================
   8. HUB AND REPORT
   ========================================================================== */
function renderHub(){
  $('#hub-grid').innerHTML = PRACTICES.map((p, i) => {
    const s = State.scores[p.id];
    const pct = s ? Math.round(s.right / s.total * 100) : null;
    return `<button class="trial-card" data-practice="${p.id}">
      <div class="tc-num">Practice ${String(i+1).padStart(2,'0')} · ${esc(p.tag)}</div>
      <div class="tc-title">${p.name}</div>
      <div class="tc-desc">${p.desc}</div>
      <span class="tc-tag">${s ? `Best: ${pct}%` : `${p.n} items`}</span>
    </button>`;
  }).join('');

  if(State.name){
    $('#hub-greeting').textContent = `Working: ${State.name}`;
  }
  wireMicroInteractions($('#hub-grid'));
}

document.addEventListener('click', e => {
  const c = e.target.closest('[data-practice]');
  if(!c) return;
  const def = PRACTICES.find(p => p.id === c.dataset.practice);
  if(def) Arena.open(def);
});

function renderReport(){
  const rows = PRACTICES.map(p => {
    const s = State.scores[p.id];
    if(!s) return `<tr class="pending"><td>${p.name}</td><td class="n">—</td><td>not attempted</td></tr>`;
    const pct = Math.round(s.right / s.total * 100);
    return `<tr>
      <td>${p.name}</td>
      <td class="n ${pct < 70 ? 'low' : ''}">${s.right}/${s.total} · ${pct}%</td>
      <td>${new Date(s.at).toLocaleDateString()} ${new Date(s.at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</td>
    </tr>`;
  }).join('');

  $('#score-table').innerHTML =
    `<thead><tr><th>Practice</th><th>Score</th><th>When</th></tr></thead><tbody>${rows}</tbody>`;

  const done = Object.values(State.scores);
  const items = done.reduce((a,s) => a + s.total, 0);
  const right = done.reduce((a,s) => a + s.right, 0);
  $('#r-done').textContent  = done.length;
  $('#r-items').textContent = items;
  $('#r-pct').textContent   = items ? Math.round(right/items*100) + '%' : '—';

  $('#report-title').textContent = State.name ? `${State.name}’s results` : 'Your results';
  $('#report-lead').textContent = done.length
    ? `${done.length} of ${PRACTICES.length} practices attempted. Copy the report and send it to your teacher.`
    : 'Finish a practice and it will appear here.';

  $('#save-status').textContent = Store.ok
    ? 'Saved in this browser.'
    : 'This browser is blocking storage, so the score will be lost when you reload.';

  $('#send-report').hidden = !CONFIG.endpoint;
}

$('#copy-report').addEventListener('click', async () => {
  const done = Object.values(State.scores);
  const items = done.reduce((a,s) => a + s.total, 0);
  const right = done.reduce((a,s) => a + s.right, 0);
  const lines = [
    `<ed> and <s> Endings — practice report`,
    `Student: ${State.name || '—'}`,
    `Date: ${new Date().toLocaleString()}`,
    `Overall: ${right}/${items}${items ? ' · ' + Math.round(right/items*100) + '%' : ''}`,
    ''
  ];
  PRACTICES.forEach(p => {
    const s = State.scores[p.id];
    lines.push(`${s ? String(Math.round(s.right/s.total*100)).padStart(3) + '%' : '  —'}  ${p.name.replace(/<[^>]+>/g,'')}${s ? `  (${s.right}/${s.total})` : ''}`);
  });
  const text = lines.join('\n');
  try{
    await navigator.clipboard.writeText(text);
    $('#save-status').textContent = 'Report copied — paste it into an email or a message.';
  }catch(e){
    $('#save-status').textContent = 'Could not reach the clipboard. Select the table and copy it by hand.';
  }
});

$('#send-report').addEventListener('click', sendAllToSheet);

$('#reset-all').addEventListener('click', () => {
  if(!confirm('Clear every score on this page?')) return;
  State.scores = {};
  persist();
  renderHub(); renderReport();
  $('#save-status').textContent = 'Scores cleared.';
});


/* =============================================================================
   9. PARTICLES — the ambient field the base stylesheet reserves space for
   ========================================================================== */
(function particles(){
  if(CALM) return;
  const cv = $('#particles'), ctx = cv.getContext('2d');
  let w, h, dots = [], raf = null;
  const COLORS = ['0,245,196', '200,80,240', '255,77,184', '0,200,255'];

  const build = () => {
    const dpr = window.devicePixelRatio || 1;
    w = cv.width = innerWidth * dpr;
    h = cv.height = innerHeight * dpr;
    cv.style.width = innerWidth + 'px';
    cv.style.height = innerHeight + 'px';
    const n = Math.min(70, Math.round(innerWidth / 22));
    dots = Array.from({length:n}, () => ({
      x: Math.random()*w, y: Math.random()*h,
      r: (Math.random()*1.6 + 0.4) * dpr,
      vx: (Math.random()-0.5) * 0.18 * dpr,
      vy: (Math.random()-0.5) * 0.18 * dpr,
      a: Math.random()*0.4 + 0.1,
      c: COLORS[Math.random()*COLORS.length|0]
    }));
  };

  const tick = () => {
    ctx.clearRect(0,0,w,h);
    for(const d of dots){
      d.x += d.vx; d.y += d.vy;
      if(d.x < -10) d.x = w+10; if(d.x > w+10) d.x = -10;
      if(d.y < -10) d.y = h+10; if(d.y > h+10) d.y = -10;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(${d.c},${d.a})`;
      ctx.fill();
    }
    raf = requestAnimationFrame(tick);
  };

  build(); tick();
  addEventListener('resize', build, {passive:true});
  document.addEventListener('visibilitychange', () => {
    if(document.hidden){ cancelAnimationFrame(raf); raf = null; }
    else if(raf === null) tick();
  });
})();


/* =============================================================================
   10. BOOT
   ========================================================================== */
$('#gate-form').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('#student-name').value.trim();
  if(!name) { $('#student-name').focus(); return; }
  State.name = name;
  persist();
  renderHub(); renderReport();
  go('s-voice');
});

/* a returning student does not have to sign in twice */
if(State.name){
  $('#student-name').value = State.name;
}

renderRules();
renderHub();
renderReport();
paintDots();
Voice.init();
wireMicroInteractions();
bootReveal();
