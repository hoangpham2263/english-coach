// Sample data (marked sample: true) so every tab shows something on the first start. Delete it from the app
// ("Xóa dữ liệu mẫu") or see README. Dates are relative to the day of the first start.
const pad = (n) => String(n).padStart(2, "0");
export const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const addDays = (date, n) => { const [y, m, d] = date.split("-").map(Number); return ymd(new Date(y, m - 1, d + n)); };

const W = (id, word, ipa, pos, vi, def, e1, e2, topic, extra = {}) => ({
  id, word, ipa, pos, vi, def, examples: [{ en: e1[0], vi: e1[1] }, { en: e2[0], vi: e2[1] }], topic,
  box: 1, due: null, status: "new", added: null, last_reviewed: null, sample: true, ...extra,
});

export function seedFiles(today) {
  const T = today, Y = addDays(T, -1), Y2 = addDays(T, -2), N = addDays(T, 1);
  const words = [
    // greetings (learned in the sample lessons, some due today for the review queue)
    W("w-hello", "hello", "/həˈloʊ/", "interjection", "xin chào", "a word you say when you meet someone", ["Hello, my name is Lan.", "Xin chào, tên tôi là Lan."], ["Hello! How are you?", "Xin chào! Bạn khỏe không?"], "greetings", { box: 3, status: "learning", due: addDays(T, 3), added: Y2, last_reviewed: Y }),
    W("w-goodbye", "goodbye", "/ˌɡʊdˈbaɪ/", "interjection", "tạm biệt", "a word you say when you leave", ["Goodbye, see you tomorrow.", "Tạm biệt, hẹn mai gặp."], ["She says goodbye to her mother.", "Cô ấy chào tạm biệt mẹ."], "greetings", { box: 3, status: "learning", due: addDays(T, 3), added: Y2, last_reviewed: Y }),
    W("w-please", "please", "/pliːz/", "adverb", "làm ơn / xin vui lòng", "a polite word when you ask for something", ["Water, please.", "Cho tôi nước, làm ơn."], ["Sit down, please.", "Xin mời ngồi."], "greetings", { box: 2, status: "learning", due: T, added: Y2, last_reviewed: Y }),
    W("w-thank-you", "thank you", "/ˈθæŋk juː/", "phrase", "cảm ơn", "words you say when someone helps you", ["Thank you very much.", "Cảm ơn bạn rất nhiều."], ["Thank you for your help.", "Cảm ơn bạn đã giúp."], "greetings", { box: 2, status: "learning", due: T, added: Y2, last_reviewed: Y }),
    W("w-sorry", "sorry", "/ˈsɑːri/", "adjective", "xin lỗi", "a word you say when you make a mistake", ["I am sorry.", "Tôi xin lỗi."], ["Sorry, I am late.", "Xin lỗi, tôi đến trễ."], "greetings", { box: 1, status: "learning", due: T, added: Y, last_reviewed: Y }),
    W("w-nice-to-meet-you", "nice to meet you", "/naɪs tə miːt juː/", "phrase", "rất vui được gặp bạn", "words you say when you meet a person for the first time", ["Hi, I am Tom. Nice to meet you.", "Chào, tôi là Tom. Rất vui được gặp bạn."], ["Nice to meet you, too.", "Tôi cũng rất vui được gặp bạn."], "greetings", { box: 1, status: "learning", due: T, added: Y, last_reviewed: Y }),
    W("w-how-are-you", "how are you", "/haʊ ɑːr juː/", "phrase", "bạn khỏe không", "a question about how a person feels", ["Hello! How are you?", "Xin chào! Bạn khỏe không?"], ["I am fine. How are you?", "Tôi khỏe. Còn bạn?"], "greetings", { box: 2, status: "learning", due: addDays(T, 1), added: Y2, last_reviewed: Y }),
    W("w-excuse-me", "excuse me", "/ɪkˈskjuːz miː/", "phrase", "xin lỗi (để hỏi / đi qua)", "words you say to get someone's attention", ["Excuse me, where is the bus?", "Xin lỗi, xe buýt ở đâu?"], ["Excuse me, can I sit here?", "Xin lỗi, tôi ngồi đây được không?"], "greetings", { box: 1, status: "learning", due: T, added: Y, last_reviewed: Y }),
    // daily routine (today's list)
    W("w-wake-up", "wake up", "/weɪk ʌp/", "phrasal verb", "thức dậy", "to stop sleeping", ["I wake up at six.", "Tôi thức dậy lúc sáu giờ."], ["She wakes up early.", "Cô ấy dậy sớm."], "daily routine", { due: T, added: Y }),
    W("w-brush-teeth", "brush teeth", "/brʌʃ tiːθ/", "phrase", "đánh răng", "to clean your teeth with a brush", ["I brush my teeth every morning.", "Tôi đánh răng mỗi sáng."], ["Brush your teeth, please.", "Làm ơn đánh răng đi."], "daily routine", { due: T, added: Y }),
    W("w-have-breakfast", "have breakfast", "/hæv ˈbrekfəst/", "phrase", "ăn sáng", "to eat the first meal of the day", ["I have breakfast at seven.", "Tôi ăn sáng lúc bảy giờ."], ["Do you have breakfast?", "Bạn có ăn sáng không?"], "daily routine", { due: T, added: Y }),
    W("w-go-to-work", "go to work", "/ɡoʊ tə wɜːrk/", "phrase", "đi làm", "to travel to the place where you work", ["He goes to work by bus.", "Anh ấy đi làm bằng xe buýt."], ["I go to work at eight.", "Tôi đi làm lúc tám giờ."], "daily routine", { due: T, added: Y }),
    W("w-take-a-shower", "take a shower", "/teɪk ə ˈʃaʊər/", "phrase", "tắm (vòi sen)", "to wash your body under water", ["I take a shower at night.", "Tôi tắm vào buổi tối."], ["She takes a shower first.", "Cô ấy tắm trước."], "daily routine", { due: T, added: Y }),
    W("w-go-to-bed", "go to bed", "/ɡoʊ tə bed/", "phrase", "đi ngủ", "to get in your bed to sleep", ["I go to bed at ten.", "Tôi đi ngủ lúc mười giờ."], ["Go to bed early, please.", "Hãy đi ngủ sớm nhé."], "daily routine", { due: T, added: Y }),
    W("w-study", "study", "/ˈstʌdi/", "verb", "học", "to learn about something", ["I study English at night.", "Tôi học tiếng Anh vào buổi tối."], ["He studies every day.", "Anh ấy học mỗi ngày."], "daily routine", { due: T, added: Y }),
    // food (tomorrow's list)
    W("w-rice", "rice", "/raɪs/", "noun", "cơm / gạo", "a small white food that you cook", ["I eat rice every day.", "Tôi ăn cơm mỗi ngày."], ["Rice and chicken, please.", "Cho tôi cơm và gà."], "food", { due: N, added: T }),
    W("w-water", "water", "/ˈwɔːtər/", "noun", "nước", "a clear liquid you drink", ["Can I have some water?", "Cho tôi xin ít nước?"], ["I drink water in the morning.", "Tôi uống nước buổi sáng."], "food", { due: N, added: T }),
    W("w-coffee", "coffee", "/ˈkɔːfi/", "noun", "cà phê", "a hot brown drink", ["I want a coffee.", "Tôi muốn một ly cà phê."], ["He drinks coffee at work.", "Anh ấy uống cà phê ở chỗ làm."], "food", { due: N, added: T }),
    W("w-bread", "bread", "/bred/", "noun", "bánh mì", "a food made from flour", ["I like bread and eggs.", "Tôi thích bánh mì và trứng."], ["Bread is cheap here.", "Bánh mì ở đây rẻ."], "food", { due: N, added: T }),
    W("w-chicken", "chicken", "/ˈtʃɪkɪn/", "noun", "thịt gà", "meat from a bird that people eat", ["I want chicken and rice.", "Tôi muốn gà và cơm."], ["The chicken is good.", "Món gà ngon."], "food", { due: N, added: T }),
    W("w-hungry", "hungry", "/ˈhʌŋɡri/", "adjective", "đói", "wanting to eat", ["I am hungry.", "Tôi đói."], ["Are you hungry?", "Bạn có đói không?"], "food", { due: N, added: T }),
    W("w-delicious", "delicious", "/dɪˈlɪʃəs/", "adjective", "ngon", "very good to eat", ["The soup is delicious.", "Món súp rất ngon."], ["This coffee is delicious.", "Ly cà phê này ngon."], "food", { due: N, added: T }),
  ];
  const step = (s, m, a) => ({ step: s, minutes: m, activity: a });
  const plan = (focus) => [
    step("Warm-up", 3, "Chào hỏi, hỏi 2 câu về buổi sáng của bạn."),
    step("Ôn từ vựng của ngày", 7, `Ôn từng từ: nghĩa, cách đọc, đặt câu ngắn (${focus}).`),
    step("Mẫu câu mới", 6, "Học 1 mẫu câu, 3 ví dụ."),
    step("Luyện nói/viết", 10, "Đóng vai hội thoại ngắn dùng từ mới."),
    step("Sửa lỗi", 4, "Sửa tối đa 3 lỗi quan trọng nhất."),
    step("Recap", 3, "Nhắc lại từ và mẫu câu đã học."),
    step("Bài tập về nhà", 2, "Giao 2-3 việc ngắn."),
  ];
  const daily = (date, topic, topic_vi, goal, pattern, ids, tips, focus) => ({
    date, stage: "A1.1", step: topic === "food" ? 8 : 7, topic, topic_vi, goal, pattern, word_ids: ids, plan: plan(focus), tips, created: Y, sample: true,
  });
  const score = (score, reason, fix, estimated) => ({ score, reason, fix, ...(estimated ? { estimated: true } : {}) });
  const lesson = (id, date, over) => ({ id, date, type: "lesson", level: "A1", stage: "A1.1", duration_min: 30, sample: true, ...over });
  const files = {
    "profile.json": { name: "Học viên (mẫu)", level: "A1", stage: "A1.1", step: 7, cando: { "A1.1-1": true, "A1.1-2": true, "A1.1-3": true }, level_note: "Dữ liệu mẫu: mới bắt đầu, biết chào hỏi cơ bản.", goal: "Giao tiếp hằng ngày", daily_new_words: 6, accent: "en-US", updated: T, sample: true },
    "vocab.json": { words },
    [`daily/${T}.json`]: daily(T, "daily routine", "Thói quen hằng ngày", "Cuối buổi bạn kể được 3 việc bạn làm buổi sáng.", { formula: "I + verb + at + time", example: "I wake up at six." }, words.filter((w) => w.topic === "daily routine").map((w) => w.id), ["Bấm nút loa để nghe từng từ, đọc to 3 lần.", "Thử tự kiểm tra trước khi học."], "7 từ về thói quen"),
    [`daily/${N}.json`]: daily(N, "food", "Đồ ăn và thức uống", "Cuối buổi bạn gọi được một bữa ăn đơn giản.", { formula: "I want + noun", example: "I want rice and chicken." }, words.filter((w) => w.topic === "food").map((w) => w.id), ["Nhìn ảnh món ăn quen thuộc và nói tên bằng tiếng Anh."], "đồ ăn"),
    [`lessons/${Y2}-01.json`]: lesson(`${Y2}-01`, Y2, {
      step: 2, topic: "greetings", summary: "Làm quen: chào hỏi và hỏi thăm sức khỏe.",
      transcript_summary: "Học viên chào hỏi bằng Hello và hỏi How are you. Luyện đọc 4 câu chào. Học viên hay quên âm cuối và nhầm am/is/are.",
      scores: {
        pronunciation: score(4.5, "Ước lượng, chưa nghe trực tiếp: hay bỏ âm cuối /s/ trong please.", "Nói to âm /z/ cuối từ please, luyện 5 lần.", true),
        vocabulary: score(5, "Dùng đúng hello, thank you; chưa nhớ excuse me.", "Ôn thẻ excuse me mỗi sáng."),
        grammar: score(4, "Câu 'I am agree' sai: agree không đi với am.", "Nhớ: I agree."),
        fluency: score(4.5, "Trả lời chậm, cần gợi ý ở câu thứ ba.", "Luyện câu trả lời cố định 'I am fine, thank you.'"),
        comprehension: score(6, "Hiểu các câu hỏi chào hỏi đơn giản không cần dịch.", "Thử nghe câu hỏi mới mỗi ngày."),
      },
      overall: 4.8, level_estimate: "A1",
      errors: [{ wrong: "I am agree", right: "I agree", category: "grammar", explanation_vi: "Với động từ thường, không dùng am/is/are." }],
      new_words: ["w-hello", "w-goodbye", "w-please", "w-thank-you", "w-how-are-you"], reviewed_words: [],
      homework: ["Nói 'Hello, how are you?' với 3 người trong ngày.", "Nghe lại 5 từ chào hỏi."],
      praise: "Bạn mạnh dạn mở miệng nói ngay từ buổi đầu.", teacher_notes: "Buổi sau: giới thiệu bản thân (I am ...).",
    }),
    [`lessons/${Y}-01.json`]: lesson(`${Y}-01`, Y, {
      step: 2, topic: "greetings: introduce yourself", summary: "Giới thiệu tên và nói lời xin lỗi, nhờ vả lịch sự.",
      transcript_summary: "Ôn 5 từ hôm trước. Học mẫu câu 'My name is ...'. Đóng vai gặp người mới: Nice to meet you. Học viên sửa được lỗi am/is/are sau một lần nhắc.",
      scores: {
        pronunciation: score(5, "Ước lượng, chưa nghe trực tiếp: đọc rõ nice to meet you, còn nhầm /θ/ trong thank.", "Đặt lưỡi giữa răng khi nói th, luyện từ thank you.", true),
        vocabulary: score(6, "Dùng đúng 7 trong 8 từ chào hỏi, nhớ excuse me.", "Thêm 1 từ mới vào câu giới thiệu."),
        grammar: score(5, "Câu 'My name is Lan' đúng; còn quên mạo từ trong 'I am student'.", "Nhớ: I am a student."),
        fluency: score(5.5, "Trả lời nhanh hơn, ít cần gợi ý.", "Luyện đối thoại 4 câu nói liền không dừng."),
        comprehension: score(7, "Hiểu hầu hết câu hỏi tiếng Anh đơn giản.", "Thử nghe không xem chữ."),
      },
      overall: 5.7, level_estimate: "A1",
      errors: [
        { wrong: "I am student", right: "I am a student", category: "grammar", explanation_vi: "Nghề nghiệp số ít cần a/an." },
        { wrong: "I am agree", right: "I agree", category: "grammar", explanation_vi: "Với động từ thường, không dùng am/is/are." },
      ],
      new_words: ["w-sorry", "w-nice-to-meet-you", "w-excuse-me"], reviewed_words: ["w-hello", "w-goodbye", "w-please", "w-thank-you", "w-how-are-you"],
      homework: ["Viết 3 câu giới thiệu bản thân.", "Đọc to 5 câu mẫu trong app."],
      praise: "Bạn tự sửa được lỗi am/is/are, rất tốt!", teacher_notes: "Buổi sau: thói quen hằng ngày, mẫu I + verb + at + time.",
    }),
    "errors.json": { errors: [
      { id: "e-am-agree", pattern: "am/is/are + động từ thường", category: "grammar", example_wrong: "I am agree", example_right: "I agree", rule_vi: "Với động từ thường không dùng am/is/are.", count: 2, first_seen: Y2, last_seen: Y, status: "improving", sample: true },
      { id: "e-missing-article", pattern: "thiếu a/an trước nghề nghiệp", category: "grammar", example_wrong: "I am student", example_right: "I am a student", rule_vi: "Danh từ đếm được số ít cần a/an.", count: 1, first_seen: Y, last_seen: Y, status: "open", sample: true },
      { id: "e-final-s", pattern: "bỏ âm cuối /s/ /z/", category: "pronunciation", example_wrong: "pleas", example_right: "please", rule_vi: "Ước lượng: phát âm rõ âm cuối s/z.", count: 2, first_seen: Y2, last_seen: Y, status: "open", sample: true },
    ] },
    "activity.json": { days: {}, sample_days: { [Y2]: { reviews: 5 }, [Y]: { reviews: 8 } } },
  };
  return files;
}
