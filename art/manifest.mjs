// 美术资源清单。所有图片共用同一组画师串、质量词和负面词，按类型固定画布尺寸，
// 保证画风和大小统一。改提示词后删除对应 PNG 再运行 `npm run art` 即可重新生成。

const ARTIST = "rella, atdan, omone hokoma agm";
const QUALITY = "very aesthetic, masterpiece, no text";

const NEGATIVE =
  "nsfw, revealing clothes, cleavage, cleavage cutout, underboob, sideboob, covered nipples, cameltoe, highleg, " +
  "lowres, artistic error, film grain, scan artifacts, worst quality, bad quality, jpeg artifacts, very displeasing, " +
  "chromatic aberration, dithering, halftone, screentone, multiple views, logo, too many watermarks, negative space, " +
  "blank page, @_@, mismatched pupils, glowing eyes, bad anatomy, text, signature";

// 学生角色：不使用紧身对魔忍服，改穿校服，并压低身材强调。
const STUDENT_NEGATIVE = `${NEGATIVE}, taimanin suit, bodysuit, skin tight, large breasts, huge breasts, mature female`;

// 成年角色的对魔忍服统一为全覆盖紧身服，和阿莎姬的立绘保持一致。
const ADULT_NEGATIVE = `${NEGATIVE}, leotard, playboy bunny, rabbit ears, highleg leotard, bare legs, bare shoulders`;

const BG_NEGATIVE =`${NEGATIVE}, 1girl, 1boy, people, person, character`;

export const kinds = {
  // 立绘：竖版透明背景，统一大腿以上构图。
  portrait: {
    dir: "portraits",
    size: "832x1216",
    prompt: (a) =>
      `${ARTIST}, 1girl, solo, ${a.subject}, cowboy shot, standing, looking at viewer, ${a.pose}, official art, transparent background, has alpha, ${QUALITY}`,
  },
  // 场景背景：16:9 无人物。
  bg: {
    dir: "bg",
    size: "1472x832",
    prompt: (a) => `${ARTIST}, no humans, scenery, ${a.subject}, detailed background, ${QUALITY}`,
  },
  // 事件 CG：16:9 带人物和场景。
  cg: {
    dir: "cg",
    size: "1472x832",
    prompt: (a) => `${ARTIST}, ${a.subject}, game cg, detailed background, ${QUALITY}`,
  },
};

const ADULT_SUIT = "taimanin (series), mature female, taimanin suit";
const STUDENT_UNIFORM = "taimanin (series), school uniform, blazer, pleated skirt";

export const assets = [
  // ---------- 立绘 ----------
  { id: "asagi", kind: "portrait", seed: 20261021, negative: NEGATIVE,
    subject: `igawa asagi, ${ADULT_SUIT}, purple bodysuit, long sleeves, gloves, scarf, katana at hip, confident smile`,
    pose: "hand on hip" },
  { id: "sakura", kind: "portrait", seed: 20261022, negative: ADULT_NEGATIVE,
    subject: `igawa sakura, ${ADULT_SUIT}, full bodysuit, covered legs, high collar, long sleeves, gloves, cheerful smile, open mouth`,
    pose: "waving" },
  { id: "murasaki", kind: "portrait", seed: 20261023, negative: ADULT_NEGATIVE,
    subject: `yatsu murasaki, ${ADULT_SUIT}, full bodysuit, covered legs, high collar, long sleeves, gloves, serious, closed mouth`,
    pose: "arms crossed" },
  { id: "shiranui", kind: "portrait", seed: 20261024, negative: ADULT_NEGATIVE,
    subject: `mizuki shiranui, ${ADULT_SUIT}, full bodysuit, covered legs, high collar, long sleeves, gloves, gentle smile`,
    pose: "hand on own chest" },
  { id: "yukikaze", kind: "portrait", seed: 20261025, negative: STUDENT_NEGATIVE,
    subject: `mizuki yukikaze, ${STUDENT_UNIFORM}, twintails, smug, grin`,
    pose: "hand on hip" },
  { id: "rinko", kind: "portrait", seed: 20261026, negative: STUDENT_NEGATIVE,
    subject: `akiyama rinko, ${STUDENT_UNIFORM}, long hair, ponytail, holding sheathed katana, calm, serious`,
    pose: "hand on hilt" },
  { id: "asuka", kind: "portrait", seed: 20261027, negative: STUDENT_NEGATIVE,
    subject: `koukawa asuka, ${STUDENT_UNIFORM}, mechanical arms, cyborg, energetic, smile, open mouth`,
    pose: "clenched hand" },
  { id: "kurenai", kind: "portrait", seed: 20261028, negative: STUDENT_NEGATIVE,
    subject: `shinganji kurenai, ${STUDENT_UNIFORM}, red eyes, holding sheathed katana, expressionless`,
    pose: "arms at sides" },

  // ---------- 背景 ----------
  { id: "academy", kind: "bg", seed: 30261001, negative: BG_NEGATIVE,
    subject: "japanese school building, school gate, cherry blossoms, mountains in background, blue sky, clouds, day" },
  { id: "academy_dusk", kind: "bg", seed: 30261002, negative: BG_NEGATIVE,
    subject: "japanese school building, courtyard, cherry blossoms, sunset, orange sky, evening, long shadows" },
  { id: "office", kind: "bg", seed: 30261003, negative: BG_NEGATIVE,
    subject: "indoors, principal office, wooden desk, leather chair, bookshelf, large window, afternoon sunlight" },
  { id: "dojo", kind: "bg", seed: 30261004, negative: BG_NEGATIVE,
    subject: "indoors, dojo, wooden floor, weapon rack, wooden swords, sunlight through windows, dust particles" },
  { id: "classroom", kind: "bg", seed: 30261005, negative: BG_NEGATIVE,
    subject: "indoors, classroom, school desks, chalkboard, windows, afternoon, warm light" },
  { id: "rooftop", kind: "bg", seed: 30261006, negative: BG_NEGATIVE,
    subject: "school rooftop, chain-link fence, water tower, sunset, cityscape, orange sky" },
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
  { id: "cg_asagi", kind: "cg", seed: 40261003, negative: NEGATIVE,
    subject: "1girl, solo, igawa asagi, taimanin (series), mature female, white shirt, office, standing by window, night, holding cup, tea, looking outside, soft smile, city lights" },
  { id: "cg_sakura", kind: "cg", seed: 40261004, negative: NEGATIVE,
    subject: "1girl, solo, igawa sakura, taimanin (series), mature female, yukata, summer festival, fireworks, night, holding cotton candy, laughing, lanterns" },
  { id: "cg_murasaki", kind: "cg", seed: 40261005, negative: NEGATIVE,
    subject: "1girl, solo, yatsu murasaki, taimanin (series), mature female, track jacket, dojo, dawn, fighting stance, focused, sweat, sunlight" },
  { id: "cg_shiranui", kind: "cg", seed: 40261006, negative: NEGATIVE,
    subject: "1girl, solo, mizuki shiranui, taimanin (series), mature female, sweater, apron, kitchen, cooking, holding ladle, warm smile, looking at viewer, evening" },
  { id: "cg_yukikaze", kind: "cg", seed: 40261007, negative: STUDENT_NEGATIVE,
    subject: "1girl, solo, mizuki yukikaze, taimanin (series), school uniform, twintails, school rooftop, sunset, wind, looking back, grin, chain-link fence" },
  { id: "cg_rinko", kind: "cg", seed: 40261008, negative: STUDENT_NEGATIVE,
    subject: "1girl, solo, akiyama rinko, taimanin (series), school uniform, ponytail, cherry blossoms, petals, drawing katana, iaido, serene, courtyard" },
  { id: "cg_asuka", kind: "cg", seed: 40261009, negative: STUDENT_NEGATIVE,
    subject: "1girl, solo, koukawa asuka, taimanin (series), school uniform, mechanical arms, workshop, tools, screwdriver, maintenance, grin, sparks" },
  { id: "cg_kurenai", kind: "cg", seed: 40261010, negative: STUDENT_NEGATIVE,
    subject: "1girl, solo, shinganji kurenai, taimanin (series), school uniform, red eyes, courtyard, night, full moon, sitting on veranda, japanese house, contemplative" },
];
