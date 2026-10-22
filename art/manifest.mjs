// 美术资源清单。所有图片共用同一组画师串、质量词和负面词，按类型固定画布尺寸，
// 保证画风和大小统一。改提示词后删除对应 PNG 再运行 `npm run art` 即可重新生成。

// 画风：厚涂插画（novalai 技能画师串 00000043），加灰调与电影感光影。
const ARTIST = "{swav}, minaba hideo, grey theme";
const LIGHTING = "cinematic lighting, dramatic lighting, high contrast, rim lighting, film grain";
const QUALITY = "very aesthetic, masterpiece, no text";

const NEGATIVE =
  "nsfw, revealing clothes, cleavage, cleavage cutout, underboob, sideboob, highleg, " +
  // 紧身衣容易透出身体轮廓，这几项加重权重。
  "{{{covered nipples}}}, {{{nipples}}}, {{{cameltoe}}}, " +
  "lowres, artistic error, scan artifacts, worst quality, bad quality, jpeg artifacts, very displeasing, " +
  "chromatic aberration, dithering, halftone, screentone, multiple views, logo, too many watermarks, negative space, " +
  "blank page, @_@, mismatched pupils, glowing eyes, bad anatomy, text, signature, " +
  // 避免画面里出现Q版小人和挂件。
  "chibi, doll, stuffed toy, figurine, keychain, mascot";

// 学生和年龄不明的角色：不使用紧身对魔忍服，并压低身材强调。
const STUDENT_NEGATIVE = `${NEGATIVE}, taimanin suit, bodysuit, skin tight, large breasts, huge breasts, mature female`;

// 成年角色的对魔忍服统一为全覆盖紧身服，和阿莎姬的立绘保持一致。
const ADULT_NEGATIVE = `${NEGATIVE}, leotard, playboy bunny, rabbit ears, highleg leotard, bare legs, bare shoulders`;

const BG_NEGATIVE =`${NEGATIVE}, 1girl, 1boy, people, person, character`;

// 五车在远离城市的深山里（docs/lorebook/world.md），能看到窗外的画面不能出现城市。
const NO_CITY = "skyscraper, cityscape";

export const kinds = {
  // 立绘：竖版透明背景，统一大腿以上构图。
  portrait: {
    dir: "portraits",
    size: "832x1216",
    prompt: (a) =>
      `${ARTIST}, 1girl, solo, ${a.subject}, cowboy shot, standing, looking at viewer, ${a.pose}, official art, transparent background, has alpha, ${LIGHTING}, ${QUALITY}`,
  },
  // 场景背景：16:9 无人物。
  bg: {
    dir: "bg",
    size: "1472x832",
    prompt: (a) => `${ARTIST}, no humans, scenery, ${a.subject}, detailed background, ${LIGHTING}, depth of field, ${QUALITY}`,
  },
  // 事件 CG：16:9 带人物和场景。
  cg: {
    dir: "cg",
    size: "1472x832",
    prompt: (a) => `${ARTIST}, ${a.subject}, game cg, detailed background, ${LIGHTING}, depth of field, ${QUALITY}`,
  },
};

const ADULT_SUIT = "taimanin (series), mature female, taimanin suit";
const STUDENT_UNIFORM = "taimanin (series), school uniform, blazer, pleated skirt";

export const assets = [
  // ---------- 立绘 ----------
  { id: "asagi", kind: "portrait", seed: 20261021, negative: NEGATIVE,
    subject: `igawa asagi, black hair, straight hair, ${ADULT_SUIT}, purple bodysuit, long sleeves, gloves, scarf, katana at hip, confident smile`,
    pose: "hand on hip" },
  { id: "sakura", kind: "portrait", seed: 20261022, negative: `${ADULT_NEGATIVE}, orange hair, blonde hair, see-through`,
    subject: `igawa sakura, ${ADULT_SUIT}, {{pink hair}}, short hair, short twintails, black bodysuit, pink trim, full bodysuit, covered legs, high collar, long sleeves, gloves, cheerful smile, open mouth`,
    pose: "waving" },
  { id: "murasaki", kind: "portrait", seed: 20261123, negative: `${ADULT_NEGATIVE}, blue hair, straight hair`,
    subject: `yatsu murasaki, ${ADULT_SUIT}, {{dark purple hair}}, long hair, {{wavy hair}}, narrow eyes, black and purple bodysuit, full bodysuit, covered legs, high collar, long sleeves, gloves, serious, closed mouth`,
    pose: "arms crossed" },
  { id: "shiranui", kind: "portrait", seed: 20261124, negative: `${ADULT_NEGATIVE}, red hair, brown hair, purple hair, pink hair`,
    subject: `mizuki shiranui, ${ADULT_SUIT}, {{{dark blue hair}}}, {black hair}, hair bun, teal bodysuit, full bodysuit, covered legs, high collar, long sleeves, gloves, gentle smile`,
    pose: "hand on own chest" },
  { id: "yukikaze", kind: "portrait", seed: 20261025, negative: STUDENT_NEGATIVE,
    subject: `mizuki yukikaze, ${STUDENT_UNIFORM}, light brown hair, long hair, two side up, tan, smug, grin`,
    pose: "hand on hip" },
  { id: "rinko", kind: "portrait", seed: 20261126, negative: `${STUDENT_NEGATIVE}, purple hair, blue hair`,
    subject: `akiyama rinko, ${STUDENT_UNIFORM}, {{{black hair}}}, long hair, high ponytail, holding sheathed katana, calm, serious`,
    pose: "hand on hilt" },
  { id: "asuka", kind: "portrait", seed: 20261027, negative: STUDENT_NEGATIVE,
    subject: `koukawa asuka, ${STUDENT_UNIFORM}, blonde hair, short hair, fluffy hair, amber eyes, {{mechanical arms}}, {{mechanical legs}}, prosthetic limbs, energetic, smile, open mouth`,
    pose: "clenched hand" },
  { id: "kurenai", kind: "portrait", seed: 20261028, negative: `${STUDENT_NEGATIVE}, school uniform`,
    subject: "shinganji kurenai, taimanin (series), white hair, very long hair, red eyes, pale skin, grey hooded cloak, hood down, two short swords at hip, expressionless",
    pose: "arms at sides" },

  // ---------- 背景 ----------
  { id: "academy", kind: "bg", seed: 30261001, negative: BG_NEGATIVE,
    subject: "japanese school building, school gate, cherry blossoms, mountains in background, blue sky, clouds, day" },
  { id: "academy_dusk", kind: "bg", seed: 30261002, negative: BG_NEGATIVE,
    subject: "japanese school building, courtyard, cherry blossoms, sunset, orange sky, evening, long shadows" },
  { id: "office", kind: "bg", seed: 30261003, negative: `${BG_NEGATIVE}, ${NO_CITY}`,
    subject: "indoors, principal office, wooden desk, leather chair, bookshelf, large window, view of mountains and forest, small town below, afternoon sunlight" },
  { id: "dojo", kind: "bg", seed: 30261004, negative: BG_NEGATIVE,
    subject: "indoors, dojo, wooden floor, weapon rack, wooden swords, sunlight through windows, dust particles" },
  { id: "classroom", kind: "bg", seed: 30261005, negative: BG_NEGATIVE,
    subject: "indoors, classroom, school desks, chalkboard, windows, afternoon, warm light" },
  { id: "rooftop", kind: "bg", seed: 30261006, negative: `${BG_NEGATIVE}, ${NO_CITY}`,
    subject: "school rooftop, chain-link fence, water tower, sunset, mountains, forest, small town below, orange sky" },
  { id: "dorm", kind: "bg", seed: 30261007, negative: BG_NEGATIVE,
    subject: "indoors, dormitory room, bed, desk lamp, bookshelf, window, night, warm lighting" },
  { id: "infirmary", kind: "bg", seed: 30261008, negative: BG_NEGATIVE,
    subject: "indoors, school infirmary, white curtains, hospital bed, medicine cabinet, soft daylight" },
  { id: "city_night", kind: "bg", seed: 30261009, negative: BG_NEGATIVE,
    subject: "city, night, neon lights, skyscrapers, rain, wet street, reflections, cyberpunk, back alley" },

  // ---------- CG ----------
  { id: "title", kind: "cg", seed: 40261001, negative: NEGATIVE,
    subject: "1girl, solo, igawa asagi, taimanin (series), mature female, taimanin suit, scarf, katana, standing on rooftop, from side, night, full moon, city lights, wind, floating hair, wide shot" },
  { id: "prologue", kind: "cg", seed: 40261002, negative: NEGATIVE,
    subject: "1girl, solo, igawa asagi, taimanin (series), mature female, business suit, black jacket, pencil skirt, school gate, cherry blossoms, petals, reaching towards viewer, smile, day" },
  { id: "cg_sakura", kind: "cg", seed: 40261004, negative: `${NEGATIVE}, orange hair, blonde hair`,
    subject: "1girl, solo, igawa sakura, taimanin (series), mature female, {{{pink hair}}}, short twintails, yukata, summer festival, fireworks, night, holding cotton candy, laughing, lanterns" },
  { id: "cg_murasaki", kind: "cg", seed: 40261005, negative: NEGATIVE,
    subject: "1girl, solo, yatsu murasaki, taimanin (series), mature female, dark purple hair, long hair, wavy hair, track jacket, dojo, dawn, fighting stance, focused, sweat, sunlight" },
  { id: "cg_shiranui", kind: "cg", seed: 40261006, negative: `${NEGATIVE}, red hair, brown hair`,
    subject: "1girl, solo, mizuki shiranui, taimanin (series), mature female, {{dark blue hair}}, hair bun, sweater, apron, kitchen, cooking, holding ladle, warm smile, looking at viewer, evening" },
  { id: "cg_yukikaze", kind: "cg", seed: 40261007, negative: `${STUDENT_NEGATIVE}, ${NO_CITY}`,
    subject: "1girl, solo, mizuki yukikaze, taimanin (series), school uniform, light brown hair, two side up, tan, school rooftop, sunset, mountains, wind, looking back, grin, chain-link fence" },
  { id: "cg_rinko", kind: "cg", seed: 40261008, negative: `${STUDENT_NEGATIVE}, purple hair, blue hair`,
    subject: "1girl, solo, akiyama rinko, taimanin (series), school uniform, {{black hair}}, high ponytail, cherry blossoms, petals, drawing katana, iaido, serene, courtyard" },
  { id: "cg_asuka", kind: "cg", seed: 40261009, negative: STUDENT_NEGATIVE,
    subject: "1girl, solo, koukawa asuka, taimanin (series), school uniform, blonde hair, short hair, amber eyes, mechanical arms, mechanical legs, workshop, tools, screwdriver, maintenance, grin, sparks" },
  { id: "cg_kurenai", kind: "cg", seed: 40261010, negative: `${STUDENT_NEGATIVE}, school uniform`,
    subject: "1girl, solo, shinganji kurenai, taimanin (series), white hair, very long hair, red eyes, pale skin, grey hooded cloak, hood down, courtyard, night, full moon, sitting on veranda, japanese house, two short swords beside her, contemplative" },

  // ---------- 井河阿莎姬 · 羁绊 2～5 / 秘传 / 营救 ----------
  { id: "cg_asagi_cell", kind: "cg", seed: 40261138, negative: NEGATIVE,
    subject: "1girl, solo, igawa asagi, taimanin (series), mature female, black hair, straight hair, long hair, sitting in stone cell corner, knee hugged, chain on wrist, iron bars with glowing runes, torn bodysuit, dim green light, damp walls" },
  { id: "cg_asagi_dojo", kind: "cg", seed: 40261110, negative: NEGATIVE,
    subject: "1girl, solo, igawa asagi, taimanin (series), mature female, black hair, hair tied back, hakama, holding wooden sword, dojo, wooden floor, morning light through paper windows, focused" },
  { id: "cg_asagi_doorway", kind: "cg", seed: 40261105, negative: NEGATIVE,
    subject: "1girl, solo, igawa asagi, taimanin (series), mature female, black hair, straight hair, long hair, leaning on door frame, one hand on door, half-lit corridor, night, looking back over shoulder, faint smile" },
  { id: "cg_asagi_guidance", kind: "cg", seed: 40261111, negative: NEGATIVE,
    subject: "1girl, igawa asagi, taimanin (series), mature female, black hair, hair tied back, standing behind viewer, hand on viewer's shoulder, correcting stance, dojo, morning, close, soft light" },
  { id: "cg_asagi_hikari", kind: "cg", seed: 40261118, negative: NEGATIVE,
    subject: "1girl, solo, igawa asagi, taimanin (series), mature female, black hair, straight hair, long hair, mid slash, huge crescent energy wave, blue purple light, dojo wall cut open, dust, motion blur, dramatic" },
  { id: "cg_asagi_infirmary", kind: "cg", seed: 40261121, negative: NEGATIVE,
    subject: "1girl, igawa asagi, taimanin (series), mature female, black hair, straight hair, lying in infirmary bed, white blanket, red marks on wrists, pink haired girl holding her hand, night, warm lamp, tears" },
  { id: "cg_asagi_late_night", kind: "cg", seed: 40261101, negative: `${NEGATIVE}, ${NO_CITY}`,
    subject: "1girl, solo, igawa asagi, taimanin (series), mature female, black hair, straight hair, long hair, white shirt, office, night, desk lamp, sitting at desk, signing documents, tired, hand on forehead, tea cup, mountains out of window, low light" },
  { id: "cg_asagi_memorial", kind: "cg", seed: 40261106, negative: `${NEGATIVE}, ${NO_CITY}`,
    subject: "1girl, solo, igawa asagi, taimanin (series), mature female, black hair, straight hair, long hair, plain kimono, kneeling, memorial room, stone walls, white candles, thick name register, low candle light, solemn" },
  { id: "cg_asagi_rain", kind: "cg", seed: 40261113, negative: `${NEGATIVE}, ${NO_CITY}`,
    subject: "1girl, solo, igawa asagi, taimanin (series), mature female, black hair, straight hair, wet hair, white shirt, wet shoulders, standing at rainy window, rain drops on glass, night, dim room, tired" },
  { id: "cg_asagi_register", kind: "cg", seed: 40261107, negative: `${NEGATIVE}, ${NO_CITY}`,
    subject: "no humans, thick old name register open on wooden desk, blank last page, small printed line at bottom, pen resting on paper, dawn light, office, dust in air, still life" },
  { id: "cg_asagi_rescue", kind: "cg", seed: 40261220, negative: `${NEGATIVE}, ${NO_CITY}`,
    subject: "2girls, yatsu murasaki, {{dark purple hair}}, long wavy hair, black and purple bodysuit, standing, princess carry, carrying igawa asagi in her arms, igawa asagi, black hair, straight hair, purple bodysuit, unconscious, eyes closed, limp, broken chain on wrist, elevator platform, underground, purple light" },
  { id: "cg_asagi_sake", kind: "cg", seed: 40261114, negative: NEGATIVE,
    subject: "1girl, solo, igawa asagi, taimanin (series), mature female, black hair, straight hair, long hair, kneeling, pouring sake, white porcelain flask, two cups, low table, night, warm lamp, faint smile" },
  { id: "cg_asagi_sakura_walk", kind: "cg", seed: 40261108, negative: `${NEGATIVE}, ${NO_CITY}`,
    subject: "1girl, solo, igawa asagi, taimanin (series), mature female, black hair, straight hair, long hair, dark coat, walking on cherry blossom avenue, cherry trees in bloom, petals on ground and on shoulders, dusk, mountains, looking back, calm expression" },
  { id: "cg_asagi_scar", kind: "cg", seed: 40261102, negative: `${NEGATIVE}, ${NO_CITY}`,
    subject: "1girl, solo, igawa asagi, taimanin (series), mature female, close-up on bare forearm, rolled up sleeve, old scar, pale skin, office, night, warm lamp light, gentle expression" },
  { id: "cg_asagi_scroll", kind: "cg", seed: 40261116, negative: `${NEGATIVE}, ${NO_CITY}`,
    subject: "no humans, old japanese scroll unrolled on wooden desk, dense brush calligraphy, red seal, katana in black scabbard beside it, morning light, office, dust in air, still life" },
  { id: "cg_asagi_shoulder", kind: "cg", seed: 40261115, negative: `${NEGATIVE}, ${NO_CITY}`,
    subject: "1girl, igawa asagi, taimanin (series), mature female, black hair, straight hair, long hair, eyes closed, head resting on viewer's shoulder, office, night, empty sake cup, blanket, peaceful" },
  { id: "cg_asagi_smile", kind: "cg", seed: 40261112, negative: NEGATIVE,
    subject: "1girl, solo, igawa asagi, taimanin (series), mature female, black hair, straight hair, long hair, close-up, gentle genuine smile, slightly tired eyes, morning light, shallow depth of field" },
  { id: "cg_asagi_tea", kind: "cg", seed: 40261103, negative: `${NEGATIVE}, ${NO_CITY}`,
    subject: "1girl, solo, igawa asagi, taimanin (series), mature female, black hair, straight hair, long hair, holding tea bowl with both hands, steam, sitting across table, office, night, warm lamp light, soft smile" },
  { id: "cg_asagi_trial", kind: "cg", seed: 40261217, negative: `${NEGATIVE}, blue hair`,
    subject: "2girls, igawa asagi, taimanin (series), mature female, black hair, straight hair, long hair, purple bodysuit, hand on katana hilt, facing yatsu murasaki, {{dark purple hair}}, long wavy hair, black and purple bodysuit, full bodysuit, holding battle axe, ten steps apart, wide shot, dojo, blue purple particles in air, floor cracking, tension" },
  { id: "cg_asagi_window", kind: "cg", seed: 40261104, negative: `${NEGATIVE}, ${NO_CITY}`,
    subject: "1girl, solo, igawa asagi, taimanin (series), mature female, black hair, straight hair, long hair, standing by large window, from behind, looking at town lights below, mountains, night, arms crossed, reflections on glass" },
  { id: "cg_asagi_winter_walk", kind: "cg", seed: 40261109, negative: `${NEGATIVE}, ${NO_CITY}`,
    subject: "1girl, solo, igawa asagi, taimanin (series), mature female, black hair, straight hair, long hair, winter coat, walking on cherry tree avenue, bare branches, thin snow on branches and ground, winter dusk, mountains, looking back, calm expression" },
];
