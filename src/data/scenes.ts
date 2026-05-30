import { SceneData } from '../types';

export const scenes: SceneData[] = [
  {
    id: 'hunter',
    title: '森に入る、猟師になる',
    subtitle: '命の気配を追い、森の沈黙を歩く。',
    engTitle: 'Scene I. Forest & Hunter',
    shortCopy: '命の気配を追い、森の沈黙を歩く。',
    extendedCopy: [
      '木々が呼吸を止める、冷たい朝のしじま。',
      '雪の上に深く刻まれた足跡をなぞり、風の向きを指先で知る。',
      'ここでは、私たちはただの訪問者ではない。',
      '生と死の境界線を歩み、大いなる連鎖の一環となる。'
    ],
    englishSupportingCopy: 'Trace the unseen tremors of life through cold moss and ancient wood.',
    videoWebM: '/videos/hunter.webm',
    videoMP4: '/videos/hunter.mp4',
    posterImage: '/posters/hunter.jpg',
    accentColor: '#1d2a1d', // Quiet dark sage green
    particleColor: 0x8fa89b, // Frosty green particles
    particleSpeed: 0.25,
    particleSize: 0.04,
    particleCount: 800,
    bgTone: '#0d160e'
  },
  {
    id: 'temple',
    title: '静寂に入る寺修行',
    subtitle: '音が消えたあと、自分の呼吸が残る。',
    engTitle: 'Scene II. Temple & Silence',
    shortCopy: '音が消えたあと、自分の呼吸が残る。',
    extendedCopy: [
      '古い板張りの廊下に染み込む、お香のほのかな煙。',
      '蝋燭のゆらぎが、磨き上げられた床に影を落とす。',
      '耳を澄ませば聞こえる、内なる静寂。',
      '情報の海から遠く離れ、ただ息を吸い、吐き出す時間。'
    ],
    englishSupportingCopy: 'Sit with stillness in the ancient hall, watching candlelight dissolve modern noise.',
    videoWebM: '/videos/temple.webm',
    videoMP4: '/videos/temple.mp4',
    posterImage: '/posters/temple.jpg',
    accentColor: '#2d1e18', // Warm deep amber-charcoal
    particleColor: 0xdca878, // Floating embers/amber dust
    particleSpeed: 0.15,
    particleSize: 0.05,
    particleCount: 500,
    bgTone: '#130d0a'
  },
  {
    id: 'blade',
    title: '一瞬を斬る',
    subtitle: '刃を持つと、身体の迷いが見えてくる。',
    engTitle: 'Scene III. Blade & Body',
    shortCopy: '刃を持つと、身体の迷いが見えてくる。',
    extendedCopy: [
      '握りしめた冷徹な鋼が、己の身体を映し出す鏡となる。',
      '一寸の曇りもなく、ただひとつの軌道を描く一筋の光声。',
      '緊張と弛緩が極限で交わるその瞬間、',
      '身体は動きを忘れ、呼吸と重力が一体化する。'
    ],
    englishSupportingCopy: 'Understand tension, alignment, and the ultimate clarity of a single swift moment.',
    videoWebM: '/videos/blade.webm',
    videoMP4: '/videos/blade.mp4',
    posterImage: '/posters/blade.jpg',
    accentColor: '#22252a', // Sleek iron steel grey
    particleColor: 0xe2e8f0, // Sharp silver-white sparks
    particleSpeed: 0.35,
    particleSize: 0.03,
    particleCount: 600,
    bgTone: '#0e1013'
  }
];

export const conceptContent = {
  headline: '誰かの人生に、ひととき滞在する。',
  englishHeadline: 'A brief stay inside another way of living.',
  japaneseCopy: [
    '旅は、たんに「場所」を訪れることだけではない。',
    'ある人の朝に加わり、ある手の動きを追い、',
    'ある沈黙の中で同じ時間を過ごすこと。',
    'Hitotoki は、日本各地に息づく生活、仕事、修行、技を、',
    'ひとときの滞在体験として届けるブランドです。'
  ],
  englishCopy: [
    'True travel is not about checking coordinates on a map.',
    'It is about waking up to someone else’s morning, tracking the ancient curve of their hands,',
    'and resting in the quiet intervals of their silent devotion.',
    'Hitotoki invites you to slide into the quiet rhythms of Japan’s deep craft, devotion, and labor.'
  ]
};
