// SpacesMate Condo Registry
// Canonical SEO-friendly names + aliases for autocomplete matching.
// Add new buildings here — they'll appear as suggestions in the admin listing form.
//
// `name`    → the exact string stored in the DB (SEO-optimised, title-case)
// `aliases` → lowercase strings the admin might type (abbreviations, brand codes, etc.)

export interface CondoEntry {
  name: string
  aliases: string[]
}

export const CONDO_REGISTRY: CondoEntry[] = [
  // ─── Lumpini (LPN) ─────────────────────────────────────────────────────────
  { name: 'Lumpini Place Suanplu-Sathorn',          aliases: ['lpn suanplu', 'lumpini suanplu', 'lpn suanplu sathorn', 'lumpini suanplu sathorn', 'lpn sathorn suanplu'] },
  { name: 'Lumpini Suite Sukhumvit 41',              aliases: ['lpn suite 41', 'lumpini suite 41', 'lpn suite sukhumvit 41'] },
  { name: 'Lumpini Suite Dindaeng-Ratchaprarop',    aliases: ['lpn suite dindaeng', 'lumpini suite dindaeng'] },
  { name: 'Lumpini Place Rama 4-Ratchadaphisek',    aliases: ['lpn rama 4', 'lumpini rama 4 ratchada', 'lpn rama4'] },
  { name: 'Lumpini Park Rama 9-Ratchada',           aliases: ['lpn park rama 9', 'lumpini park rama 9', 'lpn rama 9'] },
  { name: 'Lumpini Park Riverside-Rama 3',          aliases: ['lpn riverside', 'lumpini park riverside', 'lpn rama 3 riverside'] },
  { name: 'Lumpini Condotown Ratchada-Ladprao',     aliases: ['lpn ratchada ladprao', 'lumpini condotown ratchada', 'lpn condotown ladprao'] },
  { name: 'Lumpini Condotown Bearing-Sukhumvit 107',aliases: ['lpn bearing', 'lumpini bearing', 'lpn sukhumvit 107'] },
  { name: 'Lumpini Ville Sukhumvit 77-Suvarnabhumi',aliases: ['lpn ville 77', 'lumpini ville sukhumvit 77', 'lpn sukhumvit 77'] },
  { name: 'Lumpini Ville Sukhumvit 109',            aliases: ['lpn ville 109', 'lumpini ville 109'] },
  { name: 'Lumpini Ville Nawamin-Lat Phrao',        aliases: ['lpn ville nawamin', 'lumpini nawamin'] },
  { name: 'Lumpini 24',                             aliases: ['lpn 24', 'lumpini 24', 'lumpini sukhumvit 24'] },

  // ─── The Line (SC Asset) ────────────────────────────────────────────────────
  { name: 'The Line Sukhumvit 71',                  aliases: ['line 71', 'the line 71', 'the line sukhumvit 71'] },
  { name: 'The Line Asoke-Ratchada',                aliases: ['line asoke', 'the line asoke', 'line asoke ratchada'] },
  { name: 'The Line Jatujak-Mochit',                aliases: ['line jatujak', 'the line jatujak', 'line mochit'] },
  { name: 'The Line Wongsawang',                    aliases: ['line wongsawang', 'the line wongsawang'] },
  { name: 'The Line Vibe Sukhumvit 71',             aliases: ['line vibe 71', 'the line vibe'] },

  // ─── Sansiri ───────────────────────────────────────────────────────────────
  { name: 'The Base Park East Sukhumvit 77',        aliases: ['base park east', 'the base park east', 'the base 77'] },
  { name: 'The Base Saphankwai',                    aliases: ['base saphankwai', 'the base saphankwai'] },
  { name: 'The Monument Thong Lo',                  aliases: ['monument thong lo', 'monument thonglor', 'the monument thonglor'] },
  { name: 'The Nest Sukhumvit 22',                  aliases: ['nest sukhumvit 22', 'the nest 22', 'the nest sukhumvit 22'] },
  { name: 'The Nest Sukhumvit 64',                  aliases: ['nest sukhumvit 64', 'the nest 64'] },
  { name: 'Baan Sansiri Sukhumvit 67',              aliases: ['baan sansiri 67', 'baan sansiri sukhumvit 67'] },
  { name: 'Celes Asoke',                            aliases: ['celes asoke', 'celes'] },
  { name: '98 Wireless',                            aliases: ['98 wireless', 'ninety eight wireless'] },
  { name: 'Quintara MHy\'ra Sukhumvit 42',          aliases: ['quintara 42', 'quintara myra', 'quintara sukhumvit 42'] },

  // ─── Ananda (IDEO) ─────────────────────────────────────────────────────────
  { name: 'IDEO Q Sukhumvit 36',                    aliases: ['ideo q 36', 'ideo sukhumvit 36', 'ideo q 36 thonglor'] },
  { name: 'IDEO Q Siam-Ratchathewi',                aliases: ['ideo q siam', 'ideo siam ratchathewi'] },
  { name: 'IDEO Mobi Sukhumvit 81',                 aliases: ['ideo mobi 81', 'ideo sukhumvit 81'] },
  { name: 'IDEO Mobi Phayathai',                    aliases: ['ideo mobi phayathai', 'ideo phayathai'] },
  { name: 'IDEO Mix Phaholyothin 58',               aliases: ['ideo mix phaholyothin', 'ideo phaholyothin 58'] },
  { name: 'IDEO Ratchathewi',                       aliases: ['ideo ratchathewi'] },
  { name: 'IDEO Blucove Sathorn',                   aliases: ['ideo blucove', 'ideo blucove sathorn'] },
  { name: 'Aspire Sukhumvit 48',                    aliases: ['aspire 48', 'aspire sukhumvit 48'] },
  { name: 'Aspire Onnut-Rama 9',                    aliases: ['aspire onnut', 'aspire o-nut'] },
  { name: 'Aspire Sathorn-Thaphra',                 aliases: ['aspire sathorn', 'aspire thaphra'] },

  // ─── AP Thailand ───────────────────────────────────────────────────────────
  { name: 'Life Sukhumvit 65',                      aliases: ['life 65', 'life sukhumvit 65'] },
  { name: 'Life Ratchadaphisek',                    aliases: ['life ratchada', 'life ratchadaphisek'] },
  { name: 'Life Asoke-Hype',                        aliases: ['life asoke', 'life asoke hype'] },
  { name: 'Life Asoke',                             aliases: ['life asoke rama 9'] },
  { name: 'Rhythm Sukhumvit 44/1',                  aliases: ['rhythm 44', 'rhythm sukhumvit 44'] },
  { name: 'Rhythm Sukhumvit 36-38',                 aliases: ['rhythm 36', 'rhythm sukhumvit 36'] },
  { name: 'Rhythm Ekkamai',                         aliases: ['rhythm ekkamai'] },
  { name: 'The Address Sukhumvit 28',               aliases: ['the address 28', 'address sukhumvit 28', 'address 28'] },
  { name: 'The Address Siam-Ratchathewi',           aliases: ['address siam', 'the address siam'] },
  { name: 'Elio Del Nest Udomsuk',                  aliases: ['elio del nest', 'elio udomsuk'] },
  { name: 'Elio Sathorn-Wutthakat',                 aliases: ['elio sathorn', 'elio wutthakat'] },

  // ─── Supalai ───────────────────────────────────────────────────────────────
  { name: 'Supalai Premier Si Phraya',              aliases: ['supalai si phraya', 'supalai premier si phraya'] },
  { name: 'Supalai Premier Ratchathewi',            aliases: ['supalai ratchathewi', 'supalai premier ratchathewi'] },
  { name: 'Supalai City Resort Sukhumvit 107',      aliases: ['supalai sukhumvit 107', 'supalai city resort 107', 'supalai bearing'] },
  { name: 'Supalai Lite Ratchathewi-Phayathai',     aliases: ['supalai lite', 'supalai lite ratchathewi'] },
  { name: 'Supalai Wellington',                     aliases: ['supalai wellington'] },

  // ─── Pruksa ────────────────────────────────────────────────────────────────
  { name: 'Plum Condo Sukhumvit 107',               aliases: ['plum sukhumvit 107', 'plum condo 107'] },
  { name: 'Plum Condo Rangsit Klong 1',             aliases: ['plum rangsit', 'plum condo rangsit'] },

  // ─── Origin ────────────────────────────────────────────────────────────────
  { name: 'Knightsbridge Prime Sathorn',            aliases: ['knightsbridge sathorn', 'knightsbridge prime sathorn'] },
  { name: 'Knightsbridge Duplex Tiwanon',           aliases: ['knightsbridge tiwanon', 'knightsbridge duplex'] },
  { name: 'Kensington Sukhumvit 58',                aliases: ['kensington 58', 'kensington sukhumvit 58'] },
  { name: 'Park Origin Phromphong',                 aliases: ['park origin phromphong', 'park origin phrom phong'] },
  { name: 'Park Origin Thonglor',                   aliases: ['park origin thonglor', 'park origin thong lo'] },
  { name: 'Condo U Delight Residence Riverfront',   aliases: ['u delight riverfront', 'condo u delight'] },
  { name: 'Britania Sukhumvit 50',                  aliases: ['britania 50', 'britania sukhumvit 50'] },

  // ─── Grand Unity / Grande Centre Point ─────────────────────────────────────
  { name: 'Grande Centre Point Hotel & Residences Terminal 21', aliases: ['grande centre point terminal 21', 'gcp terminal 21'] },
  { name: 'Wyndham Grand Residences Sukhumvit 42',  aliases: ['wyndham residences', 'wyndham sukhumvit 42'] },

  // ─── High-end / Luxury ─────────────────────────────────────────────────────
  { name: 'The Ritz-Carlton Residences Bangkok',    aliases: ['ritz carlton', 'ritz carlton residences', 'ritz-carlton bangkok'] },
  { name: 'Magnolias Ratchadamri Boulevard',        aliases: ['magnolias ratchadamri', 'magnolias boulevard'] },
  { name: 'Four Seasons Private Residences Bangkok',aliases: ['four seasons residences', 'four seasons private residences'] },
  { name: 'The Residences at Mandarin Oriental Bangkok', aliases: ['mandarin oriental residences', 'mandarin oriental bangkok'] },
  { name: 'ESSE Asoke',                             aliases: ['esse asoke', 'esse'] },
  { name: 'Marque Sukhumvit',                       aliases: ['marque sukhumvit', 'marque'] },
  { name: 'Scope Langsuan',                         aliases: ['scope langsuan'] },
  { name: 'Noble Ploenchit',                        aliases: ['noble ploenchit', 'noble ploen chit'] },
  { name: 'Noble Ora Thonglor',                     aliases: ['noble ora', 'noble ora thong lo', 'noble thonglor'] },
  { name: 'Noble Recole',                           aliases: ['noble recole', 'noble recole sukhumvit'] },
  { name: 'Noble BE 19',                            aliases: ['noble be 19', 'noble be19'] },
  { name: 'Savanna Sands Condominium',              aliases: ['savanna sands'] },

  // ─── Standalone / Other well-known ─────────────────────────────────────────
  { name: 'Belle Grand Rama 9',                     aliases: ['belle grand', 'belle rama 9', 'belle grand rama 9'] },
  { name: 'Nusasiri Grand Ekkamai',                 aliases: ['nusasiri ekkamai', 'nusasiri grand', 'nusasiri grand ekkamai'] },
  { name: 'The Waterford Diamond Sukhumvit 30',     aliases: ['waterford diamond', 'waterford sukhumvit 30', 'waterford 30'] },
  { name: 'Baan Prompong',                          aliases: ['baan prompong', 'ban prompong'] },
  { name: 'Star View Rama 4',                       aliases: ['star view', 'star view rama 4'] },
  { name: 'Amanta Lumpini',                         aliases: ['amanta lumpini'] },
  { name: 'Amanta Ratchada',                        aliases: ['amanta ratchada'] },
  { name: 'The Empire Place Sathorn',               aliases: ['empire place', 'the empire place'] },
  { name: 'The Met Sathorn',                        aliases: ['the met', 'met sathorn'] },
  { name: 'Sathorn Gardens',                        aliases: ['sathorn gardens'] },
  { name: 'Silom Suite',                            aliases: ['silom suite'] },
  { name: 'Baan Siri Silom',                        aliases: ['baan siri silom', 'siri silom'] },
  { name: 'SC Grand Tower',                         aliases: ['sc grand tower', 'sc grand'] },
  { name: 'Thonglor Tower',                         aliases: ['thonglor tower', 'thong lo tower'] },
  { name: 'Avenue 61 Condominium',                  aliases: ['avenue 61', 'avenue61'] },
  { name: 'The Clover Thonglor 18',                 aliases: ['clover thonglor', 'the clover thonglor'] },
  { name: 'Ficus Lane',                             aliases: ['ficus lane'] },
  { name: 'Prime Sukhumvit',                        aliases: ['prime sukhumvit'] },
  { name: 'Millennium Residence',                   aliases: ['millennium residence', 'millennium sukhumvit'] },
  { name: 'Royce Private Residences',               aliases: ['royce private', 'royce residences'] },
  { name: 'The Park Chidlom',                       aliases: ['park chidlom', 'the park chidlom'] },
  { name: 'All Seasons Mansion',                    aliases: ['all seasons mansion', 'all seasons ploenchit'] },
  { name: 'Las Colinas',                            aliases: ['las colinas', 'las colinas sukhumvit'] },
  { name: 'Charoen Nakorn Residence',               aliases: ['charoen nakorn', 'charoen nakhon residence'] },
  { name: 'Icondo Salaya',                          aliases: ['icondo salaya', 'i condo salaya'] },
  { name: 'Chambers Chaan Ladprao 130',             aliases: ['chambers ladprao', 'chambers chaan'] },
]

/**
 * Fuzzy match against registry name + aliases.
 * Returns up to `limit` suggestions, sorted by match quality (starts-with before contains).
 */
export function searchCondoRegistry(query: string, limit = 8): CondoEntry[] {
  if (!query || query.trim().length < 2) return []
  const q = query.toLowerCase().trim()

  const startsWith: CondoEntry[] = []
  const contains:   CondoEntry[] = []

  for (const entry of CONDO_REGISTRY) {
    const nameL = entry.name.toLowerCase()
    const matchesName = nameL.startsWith(q)
    const containsName = nameL.includes(q)
    const matchesAlias = entry.aliases.some(a => a.startsWith(q))
    const containsAlias = entry.aliases.some(a => a.includes(q))

    if (matchesName || matchesAlias) {
      startsWith.push(entry)
    } else if (containsName || containsAlias) {
      contains.push(entry)
    }
  }

  return [...startsWith, ...contains].slice(0, limit)
}
