export interface ExperienceListing {
  id: string;
  category: 'craft' | 'nature' | 'silence' | 'culinary' | 'maritime';
  categoryLabel: string;
  title: string;
  hostName: string;
  location: string;
  duration: string;
  rhythmDescription: string;
  pricePerDay: string;
  details: string[];
  slots: string[];
}

export const extraExperiences: ExperienceListing[] = [
  {
    id: 'bamboo-weaver',
    category: 'craft',
    categoryLabel: '伝統工芸・技術',
    title: '京都・黒竹細工職人の日々を編む',
    hostName: '石川 陽介 (竹細工工芸士)',
    location: '京都府向日市',
    duration: '3日間',
    rhythmDescription: '早朝に竹林に入り、竹を選定・伐採するところから始まります。削り出された節と繊維を編み込み、静寂な手仕事の呼吸を身に付けます。',
    pricePerDay: '12,000円 / 日',
    details: [
      '朝 8:30 - 竹林の整調と選定眼',
      '昼 11:00 - 火炙りによる乾燥と矯正の極意',
      '夕 15:00 - 剥ぎ・割り込み、そして指先で触る伝統の編み込み',
      '夜 18:30 - 庵での茶の湯と沈黙'
    ],
    slots: ['08:30 - 竹林随行', '11:00 - 火入れ矯正', '15:00 - 竹皮剥ぎ', '18:30 - 土間茶話']
  },
  {
    id: 'wasabi-cultivator',
    category: 'nature',
    categoryLabel: '大自然・半野生の暮らし',
    title: '安曇野・清流山葵田の調律',
    hostName: '望月 正義 (山葵栽培十三代目)',
    location: '長野県安曇野市',
    duration: '2日間',
    rhythmDescription: '平均水温13℃の湧き水の中で過ごす二日間。ひたすら透き通る清らかな冷水に足を浸し、砂利の清掃と、野生わさびの苗植えを行います。',
    pricePerDay: '14,000円 / 日',
    details: [
      '朝 6:00 - 湧き水池の水路整備・落葉除去',
      '午前 9:30 - 山葵の成熟選別と地道な収穫',
      '午後 14:00 - 石積みの清掃と泥落としの極意',
      '夕 17:00 - 湧水割の蕎麦と生わさびの呼吸'
    ],
    slots: ['06:00 - 清流点検', '09:30 - 砂礫選別', '14:00 - 石積み補修']
  },
  {
    id: 'tea-ceremonist',
    category: 'silence',
    categoryLabel: '静寂・生活の作法',
    title: '裏千家・茶室庭師の「塵払い」同調',
    hostName: '千野 宗寛 (数寄屋茶庭調律帥)',
    location: '京都府上京区',
    duration: '3日間',
    rhythmDescription: '名席の露地（茶庭）を整える精神。一葉の落ち葉をも見逃さず、苔の湿り具合と日射しの差し込みが調和した瞬間の美を静かに保つ作法。',
    pricePerDay: '18,000円 / 日',
    details: [
      '朝 7:00 - 露地（茶庭）の掃き清めと、苔地の朝霧散水',
      '午前 10:30 - 手水鉢（ちょうずばち）の清掃、竹筧の調整',
      '午後 14:00 - 庭木・低木の控えめな剪定（影を呼ぶ調律）',
      '夕 18:00 - 一汁一菜の静寂ご飯と同座の対話'
    ],
    slots: ['07:00 - 朝の掃き清め', '10:30 - 手水清め', '14:00 - 割竹調律', '18:00 - 夕庵一座']
  },
  {
    id: 'sake-yeast',
    category: 'culinary',
    categoryLabel: '食の醸造・時間の味',
    title: '能登・寒造り銘酒の仕込み唄',
    hostName: '藤本 昭雄 (能登杜氏)',
    location: '石川県珠洲市',
    duration: '4日間',
    rhythmDescription: '極寒の麹室で菌に耳を澄まし、深夜に及ぶ蒸し米の管理。仕込み樽の微細な泡の音から、酵母が織りなす「時の形」を読み取ります。',
    pricePerDay: '15,000円 / 日',
    details: [
      '早朝 4:30 - 氷点下の酒米蒸し上げと手揉み放冷',
      '朝 8:00 - 麹室（こうじむろ）での手返し、温度・湿度制御',
      '昼 13:30 - 櫂入れ（仕込み樽の攪拌）と歌の調律',
      '夜 22:00 - 麹の見守り、深夜の巡回呼吸'
    ],
    slots: ['04:30 - 早起仕込', '08:00 - 麹室手返', '13:30 - 櫂入同調', '22:00 - 深夜巡回']
  },
  {
    id: 'seaweed-dryer',
    category: 'maritime',
    categoryLabel: '潮風と海の営み',
    title: '伊豆・岩ノリ寒干し漁師の磯朝',
    hostName: '木村 慎吾 (沿岸岩海苔漁二十年)',
    location: '静岡県西伊豆',
    duration: '2日間',
    rhythmDescription: '波しぶきが舞う厳冬の岩場に通い詰め、天然の岩ノリを板状に干し上げる。自然とのギリギリの対峙の中で生きる、シンプルで力強いリズム。',
    pricePerDay: '11,000円 / 日',
    details: [
      '朝 5:00 - 潮目読みと磯場の岩ノリ手摘み採取',
      '午前 9:00 - 塩抜き・真水での手洗い、ゴミ除去の極意',
      '午後 13:00 - すのこ（簀の子）での寒干し配列と風当て',
      '夕 16:30 - 囲炉裏での炙り乾海苔と潮風茶杯'
    ],
    slots: ['05:00 - 手摘採取', '09:00 - 潮抜精製', '13:00 - 天日干配置']
  },
  {
    id: 'washi-artisan',
    category: 'craft',
    categoryLabel: '伝統工芸・技術',
    title: '黒谷・流し漉き和紙の繊維合わせ',
    hostName: '長谷川 達男 (無形文化財和紙職人)',
    location: '京都府綾部市',
    duration: '3日間',
    rhythmDescription: '楮（こうじ）の樹皮を叩き、冷水と「ねり」を混ぜ合わせて一枚一枚を漉き上げます。水底で揺れる繊維が、指先の間隔を通して規則を宿す。',
    pricePerDay: '13,500円 / 日',
    details: [
      '朝 8:00 - 楮皮の煮沸と不純物の手仕事除去',
      '午前 10:30 - 叩解（こうかい）繊維叩きのリズム同調',
      '午後 14:00 - 流し漉き・均等な水の呼吸と揺らし',
      '朝 9:00 - 板張り天日乾燥の点検と剥がし'
    ],
    slots: ['08:00 - 不純物除', '10:30 - 繊維叩き', '14:00 - 流漉揺動']
  }
];
