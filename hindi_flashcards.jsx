import { useState, useEffect, useCallback, useMemo } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────
// Each entry:
//   id, category ("noun"|"verb"|"other"), devanagari, transliteration, meaning
//   gender (nouns: "m"|"f"|"m/f"), transitive (verbs: true|false|null)
//   examples: array of { sentence, transliteration, translation }

const WORDS = [
  // ── NOUNS (100) ────────────────────────────────────────────────────────────
  { id:"n001", category:"noun", devanagari:"घर", transliteration:"ghar", meaning:"house / home", gender:"m",
    examples:[{ sentence:"मेरा घर बड़ा है।", transliteration:"Merā ghar baṛā hai.", translation:"My house is big." }]},
  { id:"n002", category:"noun", devanagari:"आदमी", transliteration:"ādmī", meaning:"man", gender:"m",
    examples:[{ sentence:"वह आदमी अच्छा है।", transliteration:"Vah ādmī acchā hai.", translation:"That man is good." }]},
  { id:"n003", category:"noun", devanagari:"औरत", transliteration:"aurat", meaning:"woman", gender:"f",
    examples:[{ sentence:"वह औरत डॉक्टर है।", transliteration:"Vah aurat ḍākṭar hai.", translation:"That woman is a doctor." }]},
  { id:"n004", category:"noun", devanagari:"बच्चा", transliteration:"baccā", meaning:"child", gender:"m",
    examples:[{ sentence:"बच्चा रो रहा है।", transliteration:"Baccā ro rahā hai.", translation:"The child is crying." }]},
  { id:"n005", category:"noun", devanagari:"पानी", transliteration:"pānī", meaning:"water", gender:"m",
    examples:[{ sentence:"मुझे पानी चाहिए।", transliteration:"Mujhe pānī cāhie.", translation:"I need water." }]},
  { id:"n006", category:"noun", devanagari:"खाना", transliteration:"khānā", meaning:"food", gender:"m",
    examples:[{ sentence:"खाना बहुत स्वादिष्ट है।", transliteration:"Khānā bahut svādiṣṭ hai.", translation:"The food is very tasty." }]},
  { id:"n007", category:"noun", devanagari:"दिन", transliteration:"din", meaning:"day", gender:"m",
    examples:[{ sentence:"आज का दिन अच्छा है।", transliteration:"Āj kā din acchā hai.", translation:"Today is a good day." }]},
  { id:"n008", category:"noun", devanagari:"रात", transliteration:"rāt", meaning:"night", gender:"f",
    examples:[{ sentence:"रात बहुत ठंडी थी।", transliteration:"Rāt bahut ṭhaṇḍī thī.", translation:"The night was very cold." }]},
  { id:"n009", category:"noun", devanagari:"समय", transliteration:"samay", meaning:"time", gender:"m",
    examples:[{ sentence:"समय बहुत कम है।", transliteration:"Samay bahut kam hai.", translation:"There is very little time." }]},
  { id:"n010", category:"noun", devanagari:"साल", transliteration:"sāl", meaning:"year", gender:"m",
    examples:[{ sentence:"इस साल बहुत बारिश हुई।", transliteration:"Is sāl bahut bāriś huī.", translation:"There was a lot of rain this year." }]},
  { id:"n011", category:"noun", devanagari:"लड़का", transliteration:"laṛkā", meaning:"boy", gender:"m",
    examples:[{ sentence:"लड़का खेल रहा है।", transliteration:"Laṛkā khel rahā hai.", translation:"The boy is playing." }]},
  { id:"n012", category:"noun", devanagari:"लड़की", transliteration:"laṛkī", meaning:"girl", gender:"f",
    examples:[{ sentence:"लड़की पढ़ रही है।", transliteration:"Laṛkī paṛh rahī hai.", translation:"The girl is reading." }]},
  { id:"n013", category:"noun", devanagari:"माँ", transliteration:"māṃ", meaning:"mother", gender:"f",
    examples:[{ sentence:"माँ खाना बना रही है।", transliteration:"Māṃ khānā banā rahī hai.", translation:"Mother is cooking food." }]},
  { id:"n014", category:"noun", devanagari:"पिता", transliteration:"pitā", meaning:"father", gender:"m",
    examples:[{ sentence:"पिता काम पर गए हैं।", transliteration:"Pitā kām par gae haiṃ.", translation:"Father has gone to work." }]},
  { id:"n015", category:"noun", devanagari:"भाई", transliteration:"bhāī", meaning:"brother", gender:"m",
    examples:[{ sentence:"मेरा भाई दिल्ली में रहता है।", transliteration:"Merā bhāī Dillī meṃ rahtā hai.", translation:"My brother lives in Delhi." }]},
  { id:"n016", category:"noun", devanagari:"बहन", transliteration:"bahan", meaning:"sister", gender:"f",
    examples:[{ sentence:"मेरी बहन डॉक्टर है।", transliteration:"Merī bahan ḍākṭar hai.", translation:"My sister is a doctor." }]},
  { id:"n017", category:"noun", devanagari:"दोस्त", transliteration:"dost", meaning:"friend", gender:"m/f",
    examples:[{ sentence:"वह मेरा अच्छा दोस्त है।", transliteration:"Vah merā acchā dost hai.", translation:"He/she is my good friend." }]},
  { id:"n018", category:"noun", devanagari:"काम", transliteration:"kām", meaning:"work / job", gender:"m",
    examples:[{ sentence:"आज बहुत काम है।", transliteration:"Āj bahut kām hai.", translation:"There is a lot of work today." }]},
  { id:"n019", category:"noun", devanagari:"पैसा", transliteration:"paisā", meaning:"money", gender:"m",
    examples:[{ sentence:"मेरे पास पैसा नहीं है।", transliteration:"Mere pās paisā nahīṃ hai.", translation:"I don't have money." }]},
  { id:"n020", category:"noun", devanagari:"देश", transliteration:"deś", meaning:"country", gender:"m",
    examples:[{ sentence:"हमारा देश बड़ा है।", transliteration:"Hamārā deś baṛā hai.", translation:"Our country is big." }]},
  { id:"n021", category:"noun", devanagari:"शहर", transliteration:"śahar", meaning:"city", gender:"m",
    examples:[{ sentence:"यह शहर बहुत खूबसूरत है।", transliteration:"Yah śahar bahut khūbsūrat hai.", translation:"This city is very beautiful." }]},
  { id:"n022", category:"noun", devanagari:"गाँव", transliteration:"gāṃv", meaning:"village", gender:"m",
    examples:[{ sentence:"हम गाँव में रहते हैं।", transliteration:"Ham gāṃv meṃ rahte haiṃ.", translation:"We live in the village." }]},
  { id:"n023", category:"noun", devanagari:"सड़क", transliteration:"saṛak", meaning:"road / street", gender:"f",
    examples:[{ sentence:"सड़क पर बहुत ट्रैफिक है।", transliteration:"Saṛak par bahut ṭrāfik hai.", translation:"There is a lot of traffic on the road." }]},
  { id:"n024", category:"noun", devanagari:"दुकान", transliteration:"dukān", meaning:"shop / store", gender:"f",
    examples:[{ sentence:"वह दुकान बंद है।", transliteration:"Vah dukān band hai.", translation:"That shop is closed." }]},
  { id:"n025", category:"noun", devanagari:"स्कूल", transliteration:"skūl", meaning:"school", gender:"m",
    examples:[{ sentence:"बच्चे स्कूल जाते हैं।", transliteration:"Bacce skūl jāte haiṃ.", translation:"The children go to school." }]},
  { id:"n026", category:"noun", devanagari:"किताब", transliteration:"kitāb", meaning:"book", gender:"f",
    examples:[{ sentence:"यह किताब बहुत अच्छी है।", transliteration:"Yah kitāb bahut acchī hai.", translation:"This book is very good." }]},
  { id:"n027", category:"noun", devanagari:"कमरा", transliteration:"kamrā", meaning:"room", gender:"m",
    examples:[{ sentence:"यह कमरा बड़ा है।", transliteration:"Yah kamrā baṛā hai.", translation:"This room is big." }]},
  { id:"n028", category:"noun", devanagari:"दरवाज़ा", transliteration:"darvāzā", meaning:"door", gender:"m",
    examples:[{ sentence:"दरवाज़ा खुला है।", transliteration:"Darvāzā khulā hai.", translation:"The door is open." }]},
  { id:"n029", category:"noun", devanagari:"खिड़की", transliteration:"khiṛkī", meaning:"window", gender:"f",
    examples:[{ sentence:"खिड़की बंद करो।", transliteration:"Khiṛkī band karo.", translation:"Close the window." }]},
  { id:"n030", category:"noun", devanagari:"मेज़", transliteration:"mez", meaning:"table", gender:"f",
    examples:[{ sentence:"किताब मेज़ पर है।", transliteration:"Kitāb mez par hai.", translation:"The book is on the table." }]},
  { id:"n031", category:"noun", devanagari:"कुर्सी", transliteration:"kursī", meaning:"chair", gender:"f",
    examples:[{ sentence:"कुर्सी पर बैठो।", transliteration:"Kursī par baiṭho.", translation:"Sit on the chair." }]},
  { id:"n032", category:"noun", devanagari:"हाथ", transliteration:"hāth", meaning:"hand", gender:"m",
    examples:[{ sentence:"हाथ धोओ।", transliteration:"Hāth dhoō.", translation:"Wash your hands." }]},
  { id:"n033", category:"noun", devanagari:"आँख", transliteration:"āṃkh", meaning:"eye", gender:"f",
    examples:[{ sentence:"उसकी आँखें काली हैं।", transliteration:"Uskī āṃkheṃ kālī haiṃ.", translation:"Her eyes are black." }]},
  { id:"n034", category:"noun", devanagari:"मुँह", transliteration:"muṃh", meaning:"mouth / face", gender:"m",
    examples:[{ sentence:"मुँह खोलो।", transliteration:"Muṃh kholo.", translation:"Open your mouth." }]},
  { id:"n035", category:"noun", devanagari:"सिर", transliteration:"sir", meaning:"head", gender:"m",
    examples:[{ sentence:"मेरे सिर में दर्द है।", transliteration:"Mere sir meṃ dard hai.", translation:"I have a headache." }]},
  { id:"n036", category:"noun", devanagari:"दिल", transliteration:"dil", meaning:"heart", gender:"m",
    examples:[{ sentence:"उसका दिल अच्छा है।", transliteration:"Uskā dil acchā hai.", translation:"She/he has a good heart." }]},
  { id:"n037", category:"noun", devanagari:"आवाज़", transliteration:"āvāz", meaning:"voice / sound", gender:"f",
    examples:[{ sentence:"उसकी आवाज़ मीठी है।", transliteration:"Uskī āvāz mīṭhī hai.", translation:"Her voice is sweet." }]},
  { id:"n038", category:"noun", devanagari:"बात", transliteration:"bāt", meaning:"matter / talk / thing", gender:"f",
    examples:[{ sentence:"कोई बात नहीं।", transliteration:"Koī bāt nahīṃ.", translation:"It's nothing / No problem." }]},
  { id:"n039", category:"noun", devanagari:"नाम", transliteration:"nām", meaning:"name", gender:"m",
    examples:[{ sentence:"आपका नाम क्या है?", transliteration:"Āpkā nām kyā hai?", translation:"What is your name?" }]},
  { id:"n040", category:"noun", devanagari:"जगह", transliteration:"jagah", meaning:"place", gender:"f",
    examples:[{ sentence:"यह जगह बहुत सुंदर है।", transliteration:"Yah jagah bahut sundar hai.", translation:"This place is very beautiful." }]},
  { id:"n041", category:"noun", devanagari:"रास्ता", transliteration:"rāstā", meaning:"way / path / route", gender:"m",
    examples:[{ sentence:"रास्ता कहाँ है?", transliteration:"Rāstā kahāṃ hai?", translation:"Where is the way?" }]},
  { id:"n042", category:"noun", devanagari:"बाज़ार", transliteration:"bāzār", meaning:"market / bazaar", gender:"m",
    examples:[{ sentence:"हम बाज़ार गए।", transliteration:"Ham bāzār gae.", translation:"We went to the market." }]},
  { id:"n043", category:"noun", devanagari:"गाड़ी", transliteration:"gāṛī", meaning:"car / vehicle", gender:"f",
    examples:[{ sentence:"उसकी गाड़ी नई है।", transliteration:"Uskī gāṛī naī hai.", translation:"Her/his car is new." }]},
  { id:"n044", category:"noun", devanagari:"ट्रेन", transliteration:"ṭren", meaning:"train", gender:"f",
    examples:[{ sentence:"ट्रेन देर से आई।", transliteration:"Ṭren der se āī.", translation:"The train came late." }]},
  { id:"n045", category:"noun", devanagari:"बस", transliteration:"bas", meaning:"bus", gender:"f",
    examples:[{ sentence:"बस कब आएगी?", transliteration:"Bas kab āegī?", translation:"When will the bus come?" }]},
  { id:"n046", category:"noun", devanagari:"अस्पताल", transliteration:"aspatāl", meaning:"hospital", gender:"m",
    examples:[{ sentence:"हम अस्पताल गए।", transliteration:"Ham aspatāl gae.", translation:"We went to the hospital." }]},
  { id:"n047", category:"noun", devanagari:"डॉक्टर", transliteration:"ḍākṭar", meaning:"doctor", gender:"m/f",
    examples:[{ sentence:"डॉक्टर आ गए।", transliteration:"Ḍākṭar ā gae.", translation:"The doctor has arrived." }]},
  { id:"n048", category:"noun", devanagari:"दवाई", transliteration:"davāī", meaning:"medicine", gender:"f",
    examples:[{ sentence:"दवाई खाओ।", transliteration:"Davāī khāo.", translation:"Take the medicine." }]},
  { id:"n049", category:"noun", devanagari:"बीमारी", transliteration:"bīmārī", meaning:"illness / disease", gender:"f",
    examples:[{ sentence:"उसे बुखार की बीमारी है।", transliteration:"Use bukhār kī bīmārī hai.", translation:"He/she has a fever illness." }]},
  { id:"n050", category:"noun", devanagari:"खेल", transliteration:"khel", meaning:"game / sport / play", gender:"m",
    examples:[{ sentence:"बच्चे खेल खेल रहे हैं।", transliteration:"Bacce khel khel rahe haiṃ.", translation:"The children are playing games." }]},
  { id:"n051", category:"noun", devanagari:"भाषा", transliteration:"bhāṣā", meaning:"language", gender:"f",
    examples:[{ sentence:"हिंदी एक सुंदर भाषा है।", transliteration:"Hindī ek sundar bhāṣā hai.", translation:"Hindi is a beautiful language." }]},
  { id:"n052", category:"noun", devanagari:"शब्द", transliteration:"śabd", meaning:"word", gender:"m",
    examples:[{ sentence:"यह शब्द मुश्किल है।", transliteration:"Yah śabd muśkil hai.", translation:"This word is difficult." }]},
  { id:"n053", category:"noun", devanagari:"सवाल", transliteration:"savāl", meaning:"question", gender:"m",
    examples:[{ sentence:"आपका सवाल अच्छा है।", transliteration:"Āpkā savāl acchā hai.", translation:"Your question is good." }]},
  { id:"n054", category:"noun", devanagari:"जवाब", transliteration:"javāb", meaning:"answer / reply", gender:"m",
    examples:[{ sentence:"मुझे जवाब नहीं पता।", transliteration:"Mujhe javāb nahīṃ patā.", translation:"I don't know the answer." }]},
  { id:"n055", category:"noun", devanagari:"सोच", transliteration:"soc", meaning:"thought / thinking", gender:"f",
    examples:[{ sentence:"यह अच्छी सोच है।", transliteration:"Yah acchī soc hai.", translation:"This is good thinking." }]},
  { id:"n056", category:"noun", devanagari:"ज़िंदगी", transliteration:"zindagī", meaning:"life", gender:"f",
    examples:[{ sentence:"ज़िंदगी छोटी है।", transliteration:"Zindagī choṭī hai.", translation:"Life is short." }]},
  { id:"n057", category:"noun", devanagari:"दुनिया", transliteration:"duniyā", meaning:"world", gender:"f",
    examples:[{ sentence:"यह एक छोटी दुनिया है।", transliteration:"Yah ek choṭī duniyā hai.", translation:"It's a small world." }]},
  { id:"n058", category:"noun", devanagari:"आसमान", transliteration:"āsmān", meaning:"sky", gender:"m",
    examples:[{ sentence:"आसमान नीला है।", transliteration:"Āsmān nīlā hai.", translation:"The sky is blue." }]},
  { id:"n059", category:"noun", devanagari:"ज़मीन", transliteration:"zamīn", meaning:"ground / earth / land", gender:"f",
    examples:[{ sentence:"ज़मीन गीली है।", transliteration:"Zamīn gīlī hai.", translation:"The ground is wet." }]},
  { id:"n060", category:"noun", devanagari:"पेड़", transliteration:"peṛ", meaning:"tree", gender:"m",
    examples:[{ sentence:"पेड़ के नीचे बैठो।", transliteration:"Peṛ ke nīce baiṭho.", translation:"Sit under the tree." }]},
  { id:"n061", category:"noun", devanagari:"फूल", transliteration:"phūl", meaning:"flower", gender:"m",
    examples:[{ sentence:"फूल बहुत सुंदर है।", transliteration:"Phūl bahut sundar hai.", translation:"The flower is very beautiful." }]},
  { id:"n062", category:"noun", devanagari:"फल", transliteration:"phal", meaning:"fruit", gender:"m",
    examples:[{ sentence:"फल खाना अच्छा है।", transliteration:"Phal khānā acchā hai.", translation:"Eating fruit is good." }]},
  { id:"n063", category:"noun", devanagari:"सब्ज़ी", transliteration:"sabzī", meaning:"vegetable", gender:"f",
    examples:[{ sentence:"सब्ज़ी ताज़ी है।", transliteration:"Sabzī tāzī hai.", translation:"The vegetable is fresh." }]},
  { id:"n064", category:"noun", devanagari:"दूध", transliteration:"dūdh", meaning:"milk", gender:"m",
    examples:[{ sentence:"दूध पियो।", transliteration:"Dūdh piyo.", translation:"Drink the milk." }]},
  { id:"n065", category:"noun", devanagari:"चाय", transliteration:"cāy", meaning:"tea", gender:"f",
    examples:[{ sentence:"चाय बना दो।", transliteration:"Cāy banā do.", translation:"Make some tea." }]},
  { id:"n066", category:"noun", devanagari:"रोटी", transliteration:"roṭī", meaning:"bread / flatbread", gender:"f",
    examples:[{ sentence:"रोटी गर्म है।", transliteration:"Roṭī garm hai.", translation:"The bread is hot." }]},
  { id:"n067", category:"noun", devanagari:"चावल", transliteration:"cāval", meaning:"rice", gender:"m",
    examples:[{ sentence:"चावल तैयार है।", transliteration:"Cāval taiyār hai.", translation:"The rice is ready." }]},
  { id:"n068", category:"noun", devanagari:"नमक", transliteration:"namak", meaning:"salt", gender:"m",
    examples:[{ sentence:"खाने में नमक डालो।", transliteration:"Khāne meṃ namak ḍālo.", translation:"Add salt to the food." }]},
  { id:"n069", category:"noun", devanagari:"कपड़ा", transliteration:"kaṛā", meaning:"cloth / clothes", gender:"m",
    examples:[{ sentence:"कपड़े धो दो।", transliteration:"Kaṛe dho do.", translation:"Wash the clothes." }]},
  { id:"n070", category:"noun", devanagari:"थैला", transliteration:"thailā", meaning:"bag", gender:"m",
    examples:[{ sentence:"थैला ले लो।", transliteration:"Thailā le lo.", translation:"Take the bag." }]},
  { id:"n071", category:"noun", devanagari:"कलम", transliteration:"kalam", meaning:"pen", gender:"f",
    examples:[{ sentence:"कलम दे दो।", transliteration:"Kalam de do.", translation:"Give me a pen." }]},
  { id:"n072", category:"noun", devanagari:"पत्र", transliteration:"patra", meaning:"letter (written)", gender:"m",
    examples:[{ sentence:"उसने एक पत्र लिखा।", transliteration:"Usne ek patra likhā.", translation:"He/she wrote a letter." }]},
  { id:"n073", category:"noun", devanagari:"फ़ोन", transliteration:"fon", meaning:"phone", gender:"m",
    examples:[{ sentence:"फ़ोन कहाँ है?", transliteration:"Fon kahāṃ hai?", translation:"Where is the phone?" }]},
  { id:"n074", category:"noun", devanagari:"नंबर", transliteration:"nambar", meaning:"number", gender:"m",
    examples:[{ sentence:"आपका नंबर क्या है?", transliteration:"Āpkā nambar kyā hai?", translation:"What is your number?" }]},
  { id:"n075", category:"noun", devanagari:"पैसे", transliteration:"paise", meaning:"money (coins/change)", gender:"m",
    examples:[{ sentence:"मेरे पास पैसे नहीं हैं।", transliteration:"Mere pās paise nahīṃ haiṃ.", translation:"I don't have (any) money." }]},
  { id:"n076", category:"noun", devanagari:"कीमत", transliteration:"kīmat", meaning:"price / value", gender:"f",
    examples:[{ sentence:"इसकी कीमत क्या है?", transliteration:"Iskī kīmat kyā hai?", translation:"What is the price of this?" }]},
  { id:"n077", category:"noun", devanagari:"मौसम", transliteration:"mausam", meaning:"weather / season", gender:"m",
    examples:[{ sentence:"आज मौसम अच्छा है।", transliteration:"Āj mausam acchā hai.", translation:"The weather is nice today." }]},
  { id:"n078", category:"noun", devanagari:"बारिश", transliteration:"bāriś", meaning:"rain", gender:"f",
    examples:[{ sentence:"बारिश हो रही है।", transliteration:"Bāriś ho rahī hai.", translation:"It is raining." }]},
  { id:"n079", category:"noun", devanagari:"धूप", transliteration:"dhūp", meaning:"sunshine / sunlight", gender:"f",
    examples:[{ sentence:"बाहर धूप है।", transliteration:"Bāhar dhūp hai.", translation:"It is sunny outside." }]},
  { id:"n080", category:"noun", devanagari:"ठंड", transliteration:"ṭhaṇḍ", meaning:"cold (noun)", gender:"f",
    examples:[{ sentence:"बहुत ठंड है।", transliteration:"Bahut ṭhaṇḍ hai.", translation:"It is very cold." }]},
  { id:"n081", category:"noun", devanagari:"गर्मी", transliteration:"garmī", meaning:"heat / summer", gender:"f",
    examples:[{ sentence:"गर्मी में बाहर मत जाओ।", transliteration:"Garmī meṃ bāhar mat jāo.", translation:"Don't go outside in the heat." }]},
  { id:"n082", category:"noun", devanagari:"हवा", transliteration:"havā", meaning:"wind / air / breeze", gender:"f",
    examples:[{ sentence:"ठंडी हवा चल रही है।", transliteration:"Ṭhaṇḍī havā cal rahī hai.", translation:"A cool breeze is blowing." }]},
  { id:"n083", category:"noun", devanagari:"आग", transliteration:"āg", meaning:"fire", gender:"f",
    examples:[{ sentence:"आग मत छुओ।", transliteration:"Āg mat chuo.", translation:"Don't touch the fire." }]},
  { id:"n084", category:"noun", devanagari:"रंग", transliteration:"raṃg", meaning:"color", gender:"m",
    examples:[{ sentence:"आपका पसंदीदा रंग क्या है?", transliteration:"Āpkā pasandīdā raṃg kyā hai?", translation:"What is your favorite color?" }]},
  { id:"n085", category:"noun", devanagari:"खुशी", transliteration:"khuśī", meaning:"happiness / joy", gender:"f",
    examples:[{ sentence:"मुझे बहुत खुशी है।", transliteration:"Mujhe bahut khuśī hai.", translation:"I am very happy." }]},
  { id:"n086", category:"noun", devanagari:"दुख", transliteration:"dukh", meaning:"sadness / grief / pain", gender:"m",
    examples:[{ sentence:"उसे बहुत दुख है।", transliteration:"Use bahut dukh hai.", translation:"He/she is very sad." }]},
  { id:"n087", category:"noun", devanagari:"प्यार", transliteration:"pyār", meaning:"love", gender:"m",
    examples:[{ sentence:"प्यार बड़ी चीज़ है।", transliteration:"Pyār baṛī cīz hai.", translation:"Love is a great thing." }]},
  { id:"n088", category:"noun", devanagari:"ग़लती", transliteration:"ġalatī", meaning:"mistake / error", gender:"f",
    examples:[{ sentence:"मुझसे ग़लती हो गई।", transliteration:"Mujhse ġalatī ho gaī.", translation:"I made a mistake." }]},
  { id:"n089", category:"noun", devanagari:"मदद", transliteration:"madad", meaning:"help", gender:"f",
    examples:[{ sentence:"मुझे मदद चाहिए।", transliteration:"Mujhe madad cāhie.", translation:"I need help." }]},
  { id:"n090", category:"noun", devanagari:"ख़बर", transliteration:"ḵabar", meaning:"news", gender:"f",
    examples:[{ sentence:"क्या ख़बर है?", transliteration:"Kyā ḵabar hai?", translation:"What's the news? / What's up?" }]},
  { id:"n091", category:"noun", devanagari:"कहानी", transliteration:"kahānī", meaning:"story", gender:"f",
    examples:[{ sentence:"वह एक अच्छी कहानी है।", transliteration:"Vah ek acchī kahānī hai.", translation:"That is a good story." }]},
  { id:"n092", category:"noun", devanagari:"इतिहास", transliteration:"itihās", meaning:"history", gender:"m",
    examples:[{ sentence:"भारत का इतिहास लंबा है।", transliteration:"Bhārat kā itihās lambā hai.", translation:"India's history is long." }]},
  { id:"n093", category:"noun", devanagari:"भविष्य", transliteration:"bhaviṣya", meaning:"future", gender:"m",
    examples:[{ sentence:"भविष्य उज्जवल है।", transliteration:"Bhaviṣya ujjval hai.", translation:"The future is bright." }]},
  { id:"n094", category:"noun", devanagari:"अतीत", transliteration:"atīt", meaning:"past", gender:"m",
    examples:[{ sentence:"अतीत को मत भूलो।", transliteration:"Atīt ko mat bhūlo.", translation:"Don't forget the past." }]},
  { id:"n095", category:"noun", devanagari:"सच", transliteration:"sac", meaning:"truth", gender:"m",
    examples:[{ sentence:"सच बोलो।", transliteration:"Sac bolo.", translation:"Tell the truth." }]},
  { id:"n096", category:"noun", devanagari:"झूठ", transliteration:"jhūṭh", meaning:"lie / falsehood", gender:"m",
    examples:[{ sentence:"झूठ मत बोलो।", transliteration:"Jhūṭh mat bolo.", translation:"Don't tell lies." }]},
  { id:"n097", category:"noun", devanagari:"तरीक़ा", transliteration:"tarīqā", meaning:"method / way / manner", gender:"m",
    examples:[{ sentence:"यह सही तरीक़ा है।", transliteration:"Yah sahī tarīqā hai.", translation:"This is the correct way." }]},
  { id:"n098", category:"noun", devanagari:"इज़ाज़त", transliteration:"izāzat", meaning:"permission", gender:"f",
    examples:[{ sentence:"क्या मुझे इज़ाज़त है?", transliteration:"Kyā mujhe izāzat hai?", translation:"Do I have permission?" }]},
  { id:"n099", category:"noun", devanagari:"पल", transliteration:"pal", meaning:"moment / instant", gender:"m",
    examples:[{ sentence:"एक पल रुको।", transliteration:"Ek pal ruko.", translation:"Wait a moment." }]},
  { id:"n100", category:"noun", devanagari:"ख़्वाब", transliteration:"ḵvāb", meaning:"dream", gender:"m",
    examples:[{ sentence:"मैंने एक अजीब ख़्वाब देखा।", transliteration:"Maiṃne ek ajīb ḵvāb dekhā.", translation:"I had a strange dream." }]},

  // ── VERBS (100) ────────────────────────────────────────────────────────────
  { id:"v001", category:"verb", devanagari:"होना", transliteration:"honā", meaning:"to be / to happen", transitive:false,
    examples:[
      { sentence:"कल बारिश हुई।", transliteration:"Kal bāriś huī.", translation:"Yesterday it rained. (past)" },
      { sentence:"कल बारिश होगी।", transliteration:"Kal bāriś hogī.", translation:"Tomorrow it will rain. (future)" }
    ]},
  { id:"v002", category:"verb", devanagari:"करना", transliteration:"karnā", meaning:"to do / to make", transitive:true,
    examples:[
      { sentence:"उसने काम किया।", transliteration:"Usne kām kiyā.", translation:"He/she did the work. (past)" },
      { sentence:"मैं यह काम करूँगा।", transliteration:"Maiṃ yah kām karūṃgā.", translation:"I will do this work. (future)" }
    ]},
  { id:"v003", category:"verb", devanagari:"जाना", transliteration:"jānā", meaning:"to go", transitive:false,
    examples:[
      { sentence:"वह बाज़ार गया।", transliteration:"Vah bāzār gayā.", translation:"He went to the market. (past)" },
      { sentence:"मैं कल दिल्ली जाऊँगा।", transliteration:"Maiṃ kal Dillī jāūṃgā.", translation:"I will go to Delhi tomorrow. (future)" }
    ]},
  { id:"v004", category:"verb", devanagari:"आना", transliteration:"ānā", meaning:"to come", transitive:false,
    examples:[
      { sentence:"वह घर आई।", transliteration:"Vah ghar āī.", translation:"She came home. (past)" },
      { sentence:"वह शाम को आएगी।", transliteration:"Vah śām ko āegī.", translation:"She will come in the evening. (future)" }
    ]},
  { id:"v005", category:"verb", devanagari:"खाना", transliteration:"khānā", meaning:"to eat", transitive:true,
    examples:[
      { sentence:"मैंने चावल खाया।", transliteration:"Maiṃne cāval khāyā.", translation:"I ate rice. (past)" },
      { sentence:"मैं कल पिज़्ज़ा खाऊँगा।", transliteration:"Maiṃ kal pizzā khāūṃgā.", translation:"I will eat pizza tomorrow. (future)" }
    ]},
  { id:"v006", category:"verb", devanagari:"पीना", transliteration:"pīnā", meaning:"to drink", transitive:true,
    examples:[
      { sentence:"उसने चाय पी।", transliteration:"Usne cāy pī.", translation:"He/she drank tea. (past)" },
      { sentence:"मैं पानी पिऊँगा।", transliteration:"Maiṃ pānī piūṃgā.", translation:"I will drink water. (future)" }
    ]},
  { id:"v007", category:"verb", devanagari:"देखना", transliteration:"dekhnā", meaning:"to see / to look / to watch", transitive:true,
    examples:[
      { sentence:"मैंने फ़िल्म देखी।", transliteration:"Maiṃne film dekhī.", translation:"I watched a film. (past)" },
      { sentence:"मैं कल मैच देखूँगा।", transliteration:"Maiṃ kal maich dekhūṃgā.", translation:"I will watch the match tomorrow. (future)" }
    ]},
  { id:"v008", category:"verb", devanagari:"सुनना", transliteration:"sunnā", meaning:"to hear / to listen", transitive:true,
    examples:[
      { sentence:"उसने गाना सुना।", transliteration:"Usne gānā sunā.", translation:"He/she listened to a song. (past)" },
      { sentence:"मैं रेडियो सुनूँगा।", transliteration:"Maiṃ reḍiyo sunūṃgā.", translation:"I will listen to the radio. (future)" }
    ]},
  { id:"v009", category:"verb", devanagari:"बोलना", transliteration:"bolnā", meaning:"to speak / to say / to tell", transitive:true,
    examples:[
      { sentence:"उसने सच बोला।", transliteration:"Usne sac bolā.", translation:"He/she spoke the truth. (past)" },
      { sentence:"मैं हिंदी बोलूँगा।", transliteration:"Maiṃ Hindī bolūṃgā.", translation:"I will speak Hindi. (future)" }
    ]},
  { id:"v010", category:"verb", devanagari:"पढ़ना", transliteration:"paṛhnā", meaning:"to read / to study", transitive:true,
    examples:[
      { sentence:"उसने किताब पढ़ी।", transliteration:"Usne kitāb paṛhī.", translation:"He/she read the book. (past)" },
      { sentence:"मैं कल परीक्षा के लिए पढ़ूँगा।", transliteration:"Maiṃ kal parīkṣā ke lie paṛhūṃgā.", translation:"I will study for the exam tomorrow. (future)" }
    ]},
  { id:"v011", category:"verb", devanagari:"लिखना", transliteration:"likhnā", meaning:"to write", transitive:true,
    examples:[
      { sentence:"उसने पत्र लिखा।", transliteration:"Usne patra likhā.", translation:"He/she wrote a letter. (past)" },
      { sentence:"मैं कहानी लिखूँगा।", transliteration:"Maiṃ kahānī likhūṃgā.", translation:"I will write a story. (future)" }
    ]},
  { id:"v012", category:"verb", devanagari:"सोना", transliteration:"sonā", meaning:"to sleep", transitive:false,
    examples:[
      { sentence:"बच्चा सो गया।", transliteration:"Baccā so gayā.", translation:"The child went to sleep. (past)" },
      { sentence:"मैं जल्दी सोऊँगा।", transliteration:"Maiṃ jaldī soūṃgā.", translation:"I will sleep early. (future)" }
    ]},
  { id:"v013", category:"verb", devanagari:"उठना", transliteration:"uṭhnā", meaning:"to get up / to rise", transitive:false,
    examples:[
      { sentence:"वह सुबह जल्दी उठा।", transliteration:"Vah subah jaldī uṭhā.", translation:"He got up early in the morning. (past)" },
      { sentence:"मैं कल 6 बजे उठूँगा।", transliteration:"Maiṃ kal 6 baje uṭhūṃgā.", translation:"I will get up at 6 tomorrow. (future)" }
    ]},
  { id:"v014", category:"verb", devanagari:"बैठना", transliteration:"baiṭhnā", meaning:"to sit", transitive:false,
    examples:[
      { sentence:"वह कुर्सी पर बैठा।", transliteration:"Vah kursī par baiṭhā.", translation:"He sat on the chair. (past)" },
      { sentence:"मैं यहाँ बैठूँगा।", transliteration:"Maiṃ yahāṃ baiṭhūṃgā.", translation:"I will sit here. (future)" }
    ]},
  { id:"v015", category:"verb", devanagari:"चलना", transliteration:"calnā", meaning:"to walk / to move / to run (of machines)", transitive:false,
    examples:[
      { sentence:"हम पार्क में चले।", transliteration:"Ham pārk meṃ cale.", translation:"We walked in the park. (past)" },
      { sentence:"मैं कल पैदल चलूँगा।", transliteration:"Maiṃ kal paidāl calūṃgā.", translation:"I will walk on foot tomorrow. (future)" }
    ]},
  { id:"v016", category:"verb", devanagari:"दौड़ना", transliteration:"dauṛnā", meaning:"to run", transitive:false,
    examples:[
      { sentence:"वह तेज़ दौड़ा।", transliteration:"Vah tez dauṛā.", translation:"He ran fast. (past)" },
      { sentence:"मैं सुबह दौड़ूँगा।", transliteration:"Maiṃ subah dauṛūṃgā.", translation:"I will run in the morning. (future)" }
    ]},
  { id:"v017", category:"verb", devanagari:"रुकना", transliteration:"ruknā", meaning:"to stop / to stay / to wait", transitive:false,
    examples:[
      { sentence:"गाड़ी यहाँ रुकी।", transliteration:"Gāṛī yahāṃ rukī.", translation:"The car stopped here. (past)" },
      { sentence:"मैं एक मिनट रुकूँगा।", transliteration:"Maiṃ ek minaṭ rukūṃgā.", translation:"I will wait a minute. (future)" }
    ]},
  { id:"v018", category:"verb", devanagari:"लेना", transliteration:"lenā", meaning:"to take", transitive:true,
    examples:[
      { sentence:"उसने किताब ली।", transliteration:"Usne kitāb lī.", translation:"He/she took the book. (past)" },
      { sentence:"मैं कल छुट्टी लूँगा।", transliteration:"Maiṃ kal chuṭṭī lūṃgā.", translation:"I will take leave tomorrow. (future)" }
    ]},
  { id:"v019", category:"verb", devanagari:"देना", transliteration:"denā", meaning:"to give", transitive:true,
    examples:[
      { sentence:"उसने मुझे पैसे दिए।", transliteration:"Usne mujhe paise die.", translation:"He/she gave me money. (past)" },
      { sentence:"मैं तुम्हें किताब दूँगा।", transliteration:"Maiṃ tumheṃ kitāb dūṃgā.", translation:"I will give you the book. (future)" }
    ]},
  { id:"v020", category:"verb", devanagari:"रखना", transliteration:"rakhnā", meaning:"to put / to keep / to place", transitive:true,
    examples:[
      { sentence:"उसने किताब मेज़ पर रखी।", transliteration:"Usne kitāb mez par rakhī.", translation:"He/she put the book on the table. (past)" },
      { sentence:"मैं इसे यहाँ रखूँगा।", transliteration:"Maiṃ ise yahāṃ rakhūṃgā.", translation:"I will keep it here. (future)" }
    ]},
  { id:"v021", category:"verb", devanagari:"मिलना", transliteration:"milnā", meaning:"to meet / to get / to be found", transitive:false,
    examples:[
      { sentence:"हम कल मिले।", transliteration:"Ham kal mile.", translation:"We met yesterday. (past)" },
      { sentence:"कल हम फिर मिलेंगे।", transliteration:"Kal ham phir mileṃge.", translation:"We will meet again tomorrow. (future)" }
    ]},
  { id:"v022", category:"verb", devanagari:"समझना", transliteration:"samajhnā", meaning:"to understand", transitive:true,
    examples:[
      { sentence:"मैंने बात समझी।", transliteration:"Maiṃne bāt samajhī.", translation:"I understood the matter. (past)" },
      { sentence:"मैं यह समझूँगा।", transliteration:"Maiṃ yah samajhūṃgā.", translation:"I will understand this. (future)" }
    ]},
  { id:"v023", category:"verb", devanagari:"जानना", transliteration:"jānnā", meaning:"to know", transitive:true,
    examples:[
      { sentence:"मैं उसे पहले से जानता था।", transliteration:"Maiṃ use pahle se jāntā thā.", translation:"I knew him/her before. (past)" },
      { sentence:"मैं सब जानूँगा।", transliteration:"Maiṃ sab jānūṃgā.", translation:"I will know everything. (future)" }
    ]},
  { id:"v024", category:"verb", devanagari:"सोचना", transliteration:"socnā", meaning:"to think", transitive:true,
    examples:[
      { sentence:"मैंने बहुत सोचा।", transliteration:"Maiṃne bahut socā.", translation:"I thought a lot. (past)" },
      { sentence:"मैं इसके बारे में सोचूँगा।", transliteration:"Maiṃ iske bāre meṃ socūṃgā.", translation:"I will think about this. (future)" }
    ]},
  { id:"v025", category:"verb", devanagari:"कहना", transliteration:"kahnā", meaning:"to say / to tell", transitive:true,
    examples:[
      { sentence:"उसने क्या कहा?", transliteration:"Usne kyā kahā?", translation:"What did he/she say? (past)" },
      { sentence:"मैं उसे सच कहूँगा।", transliteration:"Maiṃ use sac kahūṃgā.", translation:"I will tell him/her the truth. (future)" }
    ]},
  { id:"v026", category:"verb", devanagari:"पूछना", transliteration:"pūchnā", meaning:"to ask", transitive:true,
    examples:[
      { sentence:"उसने रास्ता पूछा।", transliteration:"Usne rāstā pūchā.", translation:"He/she asked the way. (past)" },
      { sentence:"मैं उनसे पूछूँगा।", transliteration:"Maiṃ unse pūchūṃgā.", translation:"I will ask them. (future)" }
    ]},
  { id:"v027", category:"verb", devanagari:"बताना", transliteration:"batānā", meaning:"to tell / to inform / to explain", transitive:true,
    examples:[
      { sentence:"उसने मुझे रास्ता बताया।", transliteration:"Usne mujhe rāstā batāyā.", translation:"He/she told me the way. (past)" },
      { sentence:"मैं तुम्हें सब बताऊँगा।", transliteration:"Maiṃ tumheṃ sab batāūṃgā.", translation:"I will tell you everything. (future)" }
    ]},
  { id:"v028", category:"verb", devanagari:"बनाना", transliteration:"banānā", meaning:"to make / to build / to cook", transitive:true,
    examples:[
      { sentence:"माँ ने खाना बनाया।", transliteration:"Māṃ ne khānā banāyā.", translation:"Mother cooked food. (past)" },
      { sentence:"मैं घर बनाऊँगा।", transliteration:"Maiṃ ghar banāūṃgā.", translation:"I will build a house. (future)" }
    ]},
  { id:"v029", category:"verb", devanagari:"खोलना", transliteration:"kholnā", meaning:"to open", transitive:true,
    examples:[
      { sentence:"उसने दरवाज़ा खोला।", transliteration:"Usne darvāzā kholā.", translation:"He/she opened the door. (past)" },
      { sentence:"मैं खिड़की खोलूँगा।", transliteration:"Maiṃ khiṛkī kholūṃgā.", translation:"I will open the window. (future)" }
    ]},
  { id:"v030", category:"verb", devanagari:"बंद करना", transliteration:"band karnā", meaning:"to close / to shut", transitive:true,
    examples:[
      { sentence:"उसने दुकान बंद की।", transliteration:"Usne dukān band kī.", translation:"He/she closed the shop. (past)" },
      { sentence:"मैं दरवाज़ा बंद करूँगा।", transliteration:"Maiṃ darvāzā band karūṃgā.", translation:"I will close the door. (future)" }
    ]},
  { id:"v031", category:"verb", devanagari:"धोना", transliteration:"dhonā", meaning:"to wash", transitive:true,
    examples:[
      { sentence:"उसने कपड़े धोए।", transliteration:"Usne kaṛe dhoe.", translation:"He/she washed the clothes. (past)" },
      { sentence:"मैं बर्तन धोऊँगा।", transliteration:"Maiṃ bartan dhoūṃgā.", translation:"I will wash the dishes. (future)" }
    ]},
  { id:"v032", category:"verb", devanagari:"खरीदना", transliteration:"kharīdnā", meaning:"to buy / to purchase", transitive:true,
    examples:[
      { sentence:"मैंने नई गाड़ी ख़रीदी।", transliteration:"Maiṃne naī gāṛī kharīdī.", translation:"I bought a new car. (past)" },
      { sentence:"मैं कल फल ख़रीदूँगा।", transliteration:"Maiṃ kal phal kharīdūṃgā.", translation:"I will buy fruit tomorrow. (future)" }
    ]},
  { id:"v033", category:"verb", devanagari:"बेचना", transliteration:"becnā", meaning:"to sell", transitive:true,
    examples:[
      { sentence:"उसने घर बेचा।", transliteration:"Usne ghar becā.", translation:"He/she sold the house. (past)" },
      { sentence:"वह कल दुकान बेचेगा।", transliteration:"Vah kal dukān becegā.", translation:"He will sell the shop tomorrow. (future)" }
    ]},
  { id:"v034", category:"verb", devanagari:"भेजना", transliteration:"bhejanā", meaning:"to send", transitive:true,
    examples:[
      { sentence:"उसने पत्र भेजा।", transliteration:"Usne patra bhejā.", translation:"He/she sent a letter. (past)" },
      { sentence:"मैं ईमेल भेजूँगा।", transliteration:"Maiṃ īmel bhejūṃgā.", translation:"I will send an email. (future)" }
    ]},
  { id:"v035", category:"verb", devanagari:"लाना", transliteration:"lānā", meaning:"to bring", transitive:true,
    examples:[
      { sentence:"वह पानी लाया।", transliteration:"Vah pānī lāyā.", translation:"He brought water. (past)" },
      { sentence:"मैं खाना लाऊँगा।", transliteration:"Maiṃ khānā lāūṃgā.", translation:"I will bring food. (future)" }
    ]},
  { id:"v036", category:"verb", devanagari:"सीखना", transliteration:"sīkhnā", meaning:"to learn", transitive:true,
    examples:[
      { sentence:"मैंने हिंदी सीखी।", transliteration:"Maiṃne Hindī sīkhī.", translation:"I learned Hindi. (past)" },
      { sentence:"मैं गिटार सीखूँगा।", transliteration:"Maiṃ giṭār sīkhūṃgā.", translation:"I will learn guitar. (future)" }
    ]},
  { id:"v037", category:"verb", devanagari:"सिखाना", transliteration:"sikhānā", meaning:"to teach", transitive:true,
    examples:[
      { sentence:"उसने मुझे हिंदी सिखाई।", transliteration:"Usne mujhe Hindī sikhāī.", translation:"He/she taught me Hindi. (past)" },
      { sentence:"मैं तुम्हें खाना बनाना सिखाऊँगा।", transliteration:"Maiṃ tumheṃ khānā banānā sikhāūṃgā.", translation:"I will teach you to cook. (future)" }
    ]},
  { id:"v038", category:"verb", devanagari:"खेलना", transliteration:"khelnā", meaning:"to play", transitive:true,
    examples:[
      { sentence:"बच्चों ने क्रिकेट खेला।", transliteration:"Baccoṃ ne krikeṭ khelā.", translation:"The children played cricket. (past)" },
      { sentence:"हम कल फुटबॉल खेलेंगे।", transliteration:"Ham kal phuṭbāl kheleṃge.", translation:"We will play football tomorrow. (future)" }
    ]},
  { id:"v039", category:"verb", devanagari:"गाना", transliteration:"gānā", meaning:"to sing", transitive:true,
    examples:[
      { sentence:"उसने एक गाना गाया।", transliteration:"Usne ek gānā gāyā.", translation:"He/she sang a song. (past)" },
      { sentence:"वह मंच पर गाएगी।", transliteration:"Vah maṃc par gāegī.", translation:"She will sing on stage. (future)" }
    ]},
  { id:"v040", category:"verb", devanagari:"नाचना", transliteration:"nācnā", meaning:"to dance", transitive:false,
    examples:[
      { sentence:"वह खूब नाचा।", transliteration:"Vah khūb nācā.", translation:"He/she danced a lot. (past)" },
      { sentence:"वह शादी में नाचेगी।", transliteration:"Vah śādī meṃ nācegī.", translation:"She will dance at the wedding. (future)" }
    ]},
  { id:"v041", category:"verb", devanagari:"हँसना", transliteration:"haṃsnā", meaning:"to laugh / to smile", transitive:false,
    examples:[
      { sentence:"वह बहुत हँसी।", transliteration:"Vah bahut haṃsī.", translation:"She laughed a lot. (past)" },
      { sentence:"वह ज़रूर हँसेगी।", transliteration:"Vah zarūr haṃsegī.", translation:"She will surely laugh. (future)" }
    ]},
  { id:"v042", category:"verb", devanagari:"रोना", transliteration:"ronā", meaning:"to cry / to weep", transitive:false,
    examples:[
      { sentence:"बच्चा रोया।", transliteration:"Baccā royā.", translation:"The child cried. (past)" },
      { sentence:"वह फ़िल्म देखकर रोएगी।", transliteration:"Vah film dekhkar roegī.", translation:"She will cry after watching the film. (future)" }
    ]},
  { id:"v043", category:"verb", devanagari:"चाहना", transliteration:"cāhnā", meaning:"to want / to love / to desire", transitive:true,
    examples:[
      { sentence:"मैं उसे बहुत चाहता था।", transliteration:"Maiṃ use bahut cāhtā thā.", translation:"I liked/loved him/her a lot. (past)" },
      { sentence:"मैं यही चाहूँगा।", transliteration:"Maiṃ yahī cāhūṃgā.", translation:"I will want this very thing. (future)" }
    ]},
  { id:"v044", category:"verb", devanagari:"पसंद करना", transliteration:"pasand karnā", meaning:"to like", transitive:true,
    examples:[
      { sentence:"मैंने यह फ़िल्म पसंद की।", transliteration:"Maiṃne yah film pasand kī.", translation:"I liked this film. (past)" },
      { sentence:"मुझे यह रंग पसंद आएगा।", transliteration:"Mujhe yah raṃg pasand āegā.", translation:"I will like this color. (future)" }
    ]},
  { id:"v045", category:"verb", devanagari:"याद करना", transliteration:"yād karnā", meaning:"to remember / to miss", transitive:true,
    examples:[
      { sentence:"मैंने उसे याद किया।", transliteration:"Maiṃne use yād kiyā.", translation:"I remembered / missed him/her. (past)" },
      { sentence:"मैं हमेशा तुम्हें याद करूँगा।", transliteration:"Maiṃ hameśā tumheṃ yād karūṃgā.", translation:"I will always remember you. (future)" }
    ]},
  { id:"v046", category:"verb", devanagari:"भूलना", transliteration:"bhūlnā", meaning:"to forget", transitive:true,
    examples:[
      { sentence:"मैं चाबी भूल गया।", transliteration:"Maiṃ cābī bhūl gayā.", translation:"I forgot the key. (past)" },
      { sentence:"मैं यह कभी नहीं भूलूँगा।", transliteration:"Maiṃ yah kabhī nahīṃ bhūlūṃgā.", translation:"I will never forget this. (future)" }
    ]},
  { id:"v047", category:"verb", devanagari:"मिलाना", transliteration:"milānā", meaning:"to mix / to connect / to combine", transitive:true,
    examples:[
      { sentence:"उसने दोनों रंग मिलाए।", transliteration:"Usne donoṃ raṃg milāe.", translation:"He/she mixed both colors. (past)" },
      { sentence:"मैं दोनों टीमें मिलाऊँगा।", transliteration:"Maiṃ donoṃ ṭīmeṃ milāūṃgā.", translation:"I will combine both teams. (future)" }
    ]},
  { id:"v048", category:"verb", devanagari:"छोड़ना", transliteration:"choṛnā", meaning:"to leave / to quit / to let go", transitive:true,
    examples:[
      { sentence:"उसने नौकरी छोड़ी।", transliteration:"Usne naukrī choṛī.", translation:"He/she quit the job. (past)" },
      { sentence:"मैं यह शहर नहीं छोड़ूँगा।", transliteration:"Maiṃ yah śahar nahīṃ choṛūṃgā.", translation:"I will not leave this city. (future)" }
    ]},
  { id:"v049", category:"verb", devanagari:"ढूँढना", transliteration:"ḍhūṃḍhnā", meaning:"to search / to look for", transitive:true,
    examples:[
      { sentence:"मैंने चाबी ढूँढी।", transliteration:"Maiṃne cābī ḍhūṃḍhī.", translation:"I searched for the key. (past)" },
      { sentence:"मैं काम ढूँढूँगा।", transliteration:"Maiṃ kām ḍhūṃḍhūṃgā.", translation:"I will look for work. (future)" }
    ]},
  { id:"v050", category:"verb", devanagari:"मिलना", transliteration:"milnā", meaning:"to be found / to be available", transitive:false,
    examples:[
      { sentence:"वहाँ अच्छा खाना मिला।", transliteration:"Vahāṃ acchā khānā milā.", translation:"Good food was found there. (past)" },
      { sentence:"वहाँ होटल मिलेगा।", transliteration:"Vahāṃ hoṭal milegā.", translation:"A hotel will be available there. (future)" }
    ]},
  { id:"v051", category:"verb", devanagari:"खींचना", transliteration:"khīṃcnā", meaning:"to pull / to draw / to attract", transitive:true,
    examples:[
      { sentence:"उसने दरवाज़ा खींचा।", transliteration:"Usne darvāzā khīṃcā.", translation:"He/she pulled the door. (past)" },
      { sentence:"मैं तस्वीर खींचूँगा।", transliteration:"Maiṃ tasvīr khīṃcūṃgā.", translation:"I will take/draw a picture. (future)" }
    ]},
  { id:"v052", category:"verb", devanagari:"धकेलना", transliteration:"dhakelnā", meaning:"to push", transitive:true,
    examples:[
      { sentence:"उसने गाड़ी धकेली।", transliteration:"Usne gāṛī dhakelī.", translation:"He/she pushed the car. (past)" },
      { sentence:"मैं दरवाज़ा धकेलूँगा।", transliteration:"Maiṃ darvāzā dhakelūṃgā.", translation:"I will push the door. (future)" }
    ]},
  { id:"v053", category:"verb", devanagari:"उठाना", transliteration:"uṭhānā", meaning:"to lift / to pick up", transitive:true,
    examples:[
      { sentence:"उसने बच्चे को उठाया।", transliteration:"Usne bacce ko uṭhāyā.", translation:"He/she picked up the child. (past)" },
      { sentence:"मैं भारी बक्सा उठाऊँगा।", transliteration:"Maiṃ bhārī baksā uṭhāūṃgā.", translation:"I will lift the heavy box. (future)" }
    ]},
  { id:"v054", category:"verb", devanagari:"गिरना", transliteration:"girnā", meaning:"to fall", transitive:false,
    examples:[
      { sentence:"वह सीढ़ियों से गिरा।", transliteration:"Vah sīṛhiyoṃ se girā.", translation:"He fell from the stairs. (past)" },
      { sentence:"यह पेड़ गिरेगा।", transliteration:"Yah peṛ giregā.", translation:"This tree will fall. (future)" }
    ]},
  { id:"v055", category:"verb", devanagari:"चढ़ना", transliteration:"caṛhnā", meaning:"to climb / to go up / to board", transitive:false,
    examples:[
      { sentence:"वह पहाड़ पर चढ़ा।", transliteration:"Vah pahāṛ par caṛhā.", translation:"He climbed the mountain. (past)" },
      { sentence:"मैं बस में चढ़ूँगा।", transliteration:"Maiṃ bas meṃ caṛhūṃgā.", translation:"I will board the bus. (future)" }
    ]},
  { id:"v056", category:"verb", devanagari:"उतरना", transliteration:"utarnā", meaning:"to descend / to get off", transitive:false,
    examples:[
      { sentence:"वह बस से उतरा।", transliteration:"Vah bas se utarā.", translation:"He got off the bus. (past)" },
      { sentence:"मैं अगले स्टॉप पर उतरूँगा।", transliteration:"Maiṃ agle sṭāp par utarūṃgā.", translation:"I will get off at the next stop. (future)" }
    ]},
  { id:"v057", category:"verb", devanagari:"तैरना", transliteration:"tairnā", meaning:"to swim", transitive:false,
    examples:[
      { sentence:"वह नदी में तैरा।", transliteration:"Vah nadī meṃ tairā.", translation:"He swam in the river. (past)" },
      { sentence:"मैं कल पूल में तैरूँगा।", transliteration:"Maiṃ kal pūl meṃ tairūṃgā.", translation:"I will swim in the pool tomorrow. (future)" }
    ]},
  { id:"v058", category:"verb", devanagari:"उड़ना", transliteration:"uṛnā", meaning:"to fly", transitive:false,
    examples:[
      { sentence:"पक्षी उड़ा।", transliteration:"Pakṣī uṛā.", translation:"The bird flew. (past)" },
      { sentence:"यह हवाई जहाज़ मुंबई जाएगा।", transliteration:"Yah havāī jahāz Mumbaī jāegā.", translation:"This airplane will fly to Mumbai. (future)" }
    ]},
  { id:"v059", category:"verb", devanagari:"काटना", transliteration:"kāṭnā", meaning:"to cut", transitive:true,
    examples:[
      { sentence:"उसने रोटी काटी।", transliteration:"Usne roṭī kāṭī.", translation:"He/she cut the bread. (past)" },
      { sentence:"मैं सब्ज़ी काटूँगा।", transliteration:"Maiṃ sabzī kāṭūṃgā.", translation:"I will cut the vegetable. (future)" }
    ]},
  { id:"v060", category:"verb", devanagari:"तोड़ना", transliteration:"toṛnā", meaning:"to break", transitive:true,
    examples:[
      { sentence:"उसने शीशा तोड़ा।", transliteration:"Usne śīśā toṛā.", translation:"He/she broke the glass. (past)" },
      { sentence:"वह नियम तोड़ेगा।", transliteration:"Vah niyam toṛegā.", translation:"He will break the rule. (future)" }
    ]},
  { id:"v061", category:"verb", devanagari:"जीतना", transliteration:"jītnā", meaning:"to win", transitive:true,
    examples:[
      { sentence:"हमारी टीम जीती।", transliteration:"Hamārī ṭīm jītī.", translation:"Our team won. (past)" },
      { sentence:"हम ज़रूर जीतेंगे।", transliteration:"Ham zarūr jīteṃge.", translation:"We will surely win. (future)" }
    ]},
  { id:"v062", category:"verb", devanagari:"हारना", transliteration:"hārnā", meaning:"to lose / to be defeated", transitive:true,
    examples:[
      { sentence:"वे मैच हारे।", transliteration:"Ve maich hāre.", translation:"They lost the match. (past)" },
      { sentence:"हम नहीं हारेंगे।", transliteration:"Ham nahīṃ hāreṃge.", translation:"We will not lose. (future)" }
    ]},
  { id:"v063", category:"verb", devanagari:"पहनना", transliteration:"pahannā", meaning:"to wear / to put on", transitive:true,
    examples:[
      { sentence:"उसने नई साड़ी पहनी।", transliteration:"Usne naī sāṛī pahanī.", translation:"She wore a new sari. (past)" },
      { sentence:"मैं कल सूट पहनूँगा।", transliteration:"Maiṃ kal sūṭ pahānūṃgā.", translation:"I will wear a suit tomorrow. (future)" }
    ]},
  { id:"v064", category:"verb", devanagari:"उतारना", transliteration:"utārnā", meaning:"to take off (clothes) / to remove", transitive:true,
    examples:[
      { sentence:"उसने जूते उतारे।", transliteration:"Usne jūte utāre.", translation:"He/she took off the shoes. (past)" },
      { sentence:"अंदर जाकर जूते उतारूँगा।", transliteration:"Andar jākar jūte utārūṃgā.", translation:"I will take off my shoes after going inside. (future)" }
    ]},
  { id:"v065", category:"verb", devanagari:"पकाना", transliteration:"pakānā", meaning:"to cook", transitive:true,
    examples:[
      { sentence:"उसने दाल पकाई।", transliteration:"Usne dāl pakāī.", translation:"He/she cooked lentils. (past)" },
      { sentence:"मैं आज रात खाना पकाऊँगा।", transliteration:"Maiṃ āj rāt khānā pakāūṃgā.", translation:"I will cook food tonight. (future)" }
    ]},
  { id:"v066", category:"verb", devanagari:"बढ़ना", transliteration:"baṛhnā", meaning:"to grow / to increase / to advance", transitive:false,
    examples:[
      { sentence:"महँगाई बढ़ी।", transliteration:"Mahaṃgāī baṛhī.", translation:"Prices increased. (past)" },
      { sentence:"हमारा व्यापार बढ़ेगा।", transliteration:"Hamārā vyāpār baṛhegā.", translation:"Our business will grow. (future)" }
    ]},
  { id:"v067", category:"verb", devanagari:"घटना", transliteration:"ghaṭnā", meaning:"to decrease / to reduce", transitive:false,
    examples:[
      { sentence:"बुखार घटा।", transliteration:"Bukhār ghaṭā.", translation:"The fever decreased. (past)" },
      { sentence:"दाम घटेंगे।", transliteration:"Dām ghaṭeṃge.", translation:"Prices will decrease. (future)" }
    ]},
  { id:"v068", category:"verb", devanagari:"बदलना", transliteration:"badalnā", meaning:"to change", transitive:true,
    examples:[
      { sentence:"उसने नंबर बदला।", transliteration:"Usne nambar badlā.", translation:"He/she changed the number. (past)" },
      { sentence:"मैं अपना घर बदलूँगा।", transliteration:"Maiṃ apnā ghar badlūṃgā.", translation:"I will change my house. (future)" }
    ]},
  { id:"v069", category:"verb", devanagari:"पहुँचना", transliteration:"pahuṃcnā", meaning:"to arrive / to reach", transitive:false,
    examples:[
      { sentence:"वह समय पर पहुँचा।", transliteration:"Vah samay par pahuṃcā.", translation:"He arrived on time. (past)" },
      { sentence:"मैं शाम को पहुँचूँगा।", transliteration:"Maiṃ śām ko pahuṃcūṃgā.", translation:"I will arrive in the evening. (future)" }
    ]},
  { id:"v070", category:"verb", devanagari:"निकलना", transliteration:"nikalnā", meaning:"to leave / to come out / to depart", transitive:false,
    examples:[
      { sentence:"वह घर से निकला।", transliteration:"Vah ghar se nikalā.", translation:"He left the house. (past)" },
      { sentence:"मैं सुबह जल्दी निकलूँगा।", transliteration:"Maiṃ subah jaldī nikalūṃgā.", translation:"I will leave early in the morning. (future)" }
    ]},
  { id:"v071", category:"verb", devanagari:"लौटना", transliteration:"lauṭnā", meaning:"to return / to come back", transitive:false,
    examples:[
      { sentence:"वह रात को लौटा।", transliteration:"Vah rāt ko lauṭā.", translation:"He returned at night. (past)" },
      { sentence:"मैं दो दिन बाद लौटूँगा।", transliteration:"Maiṃ do din bād lauṭūṃgā.", translation:"I will return after two days. (future)" }
    ]},
  { id:"v072", category:"verb", devanagari:"मानना", transliteration:"mānnā", meaning:"to accept / to agree / to believe", transitive:true,
    examples:[
      { sentence:"उसने मेरी बात मानी।", transliteration:"Usne merī bāt mānī.", translation:"He/she accepted what I said. (past)" },
      { sentence:"मैं यह बात नहीं मानूँगा।", transliteration:"Maiṃ yah bāt nahīṃ mānūṃgā.", translation:"I will not accept this. (future)" }
    ]},
  { id:"v073", category:"verb", devanagari:"सहना", transliteration:"sahnā", meaning:"to endure / to bear / to tolerate", transitive:true,
    examples:[
      { sentence:"उसने बहुत दुख सहा।", transliteration:"Usne bahut dukh sahā.", translation:"He/she endured a lot of pain. (past)" },
      { sentence:"मैं और नहीं सहूँगा।", transliteration:"Maiṃ aur nahīṃ sahūṃgā.", translation:"I will not tolerate any more. (future)" }
    ]},
  { id:"v074", category:"verb", devanagari:"चुनना", transliteration:"cunnā", meaning:"to choose / to select / to pick", transitive:true,
    examples:[
      { sentence:"उसने नीला रंग चुना।", transliteration:"Usne nīlā raṃg cunā.", translation:"He/she chose blue color. (past)" },
      { sentence:"मैं अच्छा दोस्त चुनूँगा।", transliteration:"Maiṃ acchā dost cunūṃgā.", translation:"I will choose a good friend. (future)" }
    ]},
  { id:"v075", category:"verb", devanagari:"छूना", transliteration:"chūnā", meaning:"to touch", transitive:true,
    examples:[
      { sentence:"बच्चे ने फूल छुआ।", transliteration:"Bacce ne phūl chuā.", translation:"The child touched the flower. (past)" },
      { sentence:"मैं उसे नहीं छूऊँगा।", transliteration:"Maiṃ use nahīṃ chūūṃgā.", translation:"I will not touch it. (future)" }
    ]},
  { id:"v076", category:"verb", devanagari:"डरना", transliteration:"ḍarnā", meaning:"to be afraid / to fear", transitive:false,
    examples:[
      { sentence:"वह अँधेरे से डरा।", transliteration:"Vah aṃdhere se ḍarā.", translation:"He was afraid of the dark. (past)" },
      { sentence:"मैं नहीं डरूँगा।", transliteration:"Maiṃ nahīṃ ḍarūṃgā.", translation:"I will not be afraid. (future)" }
    ]},
  { id:"v077", category:"verb", devanagari:"बचाना", transliteration:"bacānā", meaning:"to save / to rescue / to protect", transitive:true,
    examples:[
      { sentence:"उसने मेरी जान बचाई।", transliteration:"Usne merī jān bacāī.", translation:"He/she saved my life. (past)" },
      { sentence:"हम पर्यावरण बचाएँगे।", transliteration:"Ham paryāvaraṇ bacāeṃge.", translation:"We will save the environment. (future)" }
    ]},
  { id:"v078", category:"verb", devanagari:"हारना", transliteration:"hārnā", meaning:"to lose", transitive:true,
    examples:[
      { sentence:"उसने सब कुछ हारा।", transliteration:"Usne sab kuch hārā.", translation:"He/she lost everything. (past)" },
      { sentence:"हम नहीं हारेंगे।", transliteration:"Ham nahīṃ hāreṃge.", translation:"We will not lose. (future)" }
    ]},
  { id:"v079", category:"verb", devanagari:"शुरू करना", transliteration:"śurū karnā", meaning:"to start / to begin", transitive:true,
    examples:[
      { sentence:"उसने काम शुरू किया।", transliteration:"Usne kām śurū kiyā.", translation:"He/she started the work. (past)" },
      { sentence:"मैं कल पढ़ाई शुरू करूँगा।", transliteration:"Maiṃ kal paṛhāī śurū karūṃgā.", translation:"I will start studying tomorrow. (future)" }
    ]},
  { id:"v080", category:"verb", devanagari:"ख़त्म करना", transliteration:"ḵatm karnā", meaning:"to finish / to end / to complete", transitive:true,
    examples:[
      { sentence:"उसने काम ख़त्म किया।", transliteration:"Usne kām ḵatm kiyā.", translation:"He/she finished the work. (past)" },
      { sentence:"मैं किताब ख़त्म करूँगा।", transliteration:"Maiṃ kitāb ḵatm karūṃgā.", translation:"I will finish the book. (future)" }
    ]},
  { id:"v081", category:"verb", devanagari:"चाहिए", transliteration:"cāhie", meaning:"(is) needed / want (auxiliary)", transitive:null,
    examples:[
      { sentence:"मुझे पानी चाहिए था।", transliteration:"Mujhe pānī cāhie thā.", translation:"I needed water. (past)" },
      { sentence:"मुझे कल मदद चाहिए होगी।", transliteration:"Mujhe kal madad cāhie hogī.", translation:"I will need help tomorrow. (future)" }
    ]},
  { id:"v082", category:"verb", devanagari:"पड़ना", transliteration:"paṛnā", meaning:"to fall / to lie / to have to (aux)", transitive:false,
    examples:[
      { sentence:"मुझे जाना पड़ा।", transliteration:"Mujhe jānā paṛā.", translation:"I had to go. (past)" },
      { sentence:"तुम्हें मेहनत करनी पड़ेगी।", transliteration:"Tumheṃ mehnat karnī paṛegī.", translation:"You will have to work hard. (future)" }
    ]},
  { id:"v083", category:"verb", devanagari:"सकना", transliteration:"saknā", meaning:"to be able to (auxiliary)", transitive:null,
    examples:[
      { sentence:"मैं वहाँ नहीं जा सका।", transliteration:"Maiṃ vahāṃ nahīṃ jā sakā.", translation:"I was not able to go there. (past)" },
      { sentence:"मैं कल आ सकूँगा।", transliteration:"Maiṃ kal ā sakūṃgā.", translation:"I will be able to come tomorrow. (future)" }
    ]},
  { id:"v084", category:"verb", devanagari:"मिलाना", transliteration:"milānā", meaning:"to introduce / to connect", transitive:true,
    examples:[
      { sentence:"उसने मुझे अपने दोस्त से मिलाया।", transliteration:"Usne mujhe apne dost se milāyā.", translation:"He/she introduced me to his/her friend. (past)" },
      { sentence:"मैं तुम्हें उससे मिलाऊँगा।", transliteration:"Maiṃ tumheṃ usse milāūṃgā.", translation:"I will introduce you to him/her. (future)" }
    ]},
  { id:"v085", category:"verb", devanagari:"छापना", transliteration:"chāpnā", meaning:"to print / to publish", transitive:true,
    examples:[
      { sentence:"उन्होंने किताब छापी।", transliteration:"Unhoṃne kitāb chāpī.", translation:"They printed the book. (past)" },
      { sentence:"वे कल अख़बार छापेंगे।", transliteration:"Ve kal aḵbār chāpeṃge.", translation:"They will print the newspaper tomorrow. (future)" }
    ]},
  { id:"v086", category:"verb", devanagari:"खोजना", transliteration:"khojnā", meaning:"to search / to discover / to find", transitive:true,
    examples:[
      { sentence:"उसने नई जगह खोजी।", transliteration:"Usne naī jagah khojī.", translation:"He/she discovered a new place. (past)" },
      { sentence:"मैं एक नया रास्ता खोजूँगा।", transliteration:"Maiṃ ek nayā rāstā khojūṃgā.", translation:"I will find a new way. (future)" }
    ]},
  { id:"v087", category:"verb", devanagari:"ठहरना", transliteration:"ṭhaharnā", meaning:"to stay / to stop / to halt", transitive:false,
    examples:[
      { sentence:"हम होटल में ठहरे।", transliteration:"Ham hoṭal meṃ ṭhahare.", translation:"We stayed in a hotel. (past)" },
      { sentence:"मैं यहाँ एक हफ़्ते ठहरूँगा।", transliteration:"Maiṃ yahāṃ ek haphte ṭhahārūṃgā.", translation:"I will stay here for a week. (future)" }
    ]},
  { id:"v088", category:"verb", devanagari:"ले जाना", transliteration:"le jānā", meaning:"to take (somewhere) / to carry", transitive:true,
    examples:[
      { sentence:"वह बच्चे को स्कूल ले गया।", transliteration:"Vah bacce ko skūl le gayā.", translation:"He took the child to school. (past)" },
      { sentence:"मैं किताब घर ले जाऊँगा।", transliteration:"Maiṃ kitāb ghar le jāūṃgā.", translation:"I will take the book home. (future)" }
    ]},
  { id:"v089", category:"verb", devanagari:"बुलाना", transliteration:"bulānā", meaning:"to call (a person) / to invite", transitive:true,
    examples:[
      { sentence:"उसने दोस्तों को बुलाया।", transliteration:"Usne dostoṃ ko bulāyā.", translation:"He/she called/invited friends. (past)" },
      { sentence:"मैं सबको पार्टी में बुलाऊँगा।", transliteration:"Maiṃ sabko pārṭī meṃ bulāūṃgā.", translation:"I will invite everyone to the party. (future)" }
    ]},
  { id:"v090", category:"verb", devanagari:"मारना", transliteration:"mārnā", meaning:"to hit / to beat / to kill", transitive:true,
    examples:[
      { sentence:"उसने गेंद मारी।", transliteration:"Usne geṃd mārī.", translation:"He/she hit the ball. (past)" },
      { sentence:"वह मुझे नहीं मारेगा।", transliteration:"Vah mujhe nahīṃ māregā.", translation:"He will not hit me. (future)" }
    ]},
  { id:"v091", category:"verb", devanagari:"लगाना", transliteration:"lagānā", meaning:"to apply / to fix / to attach / to plant", transitive:true,
    examples:[
      { sentence:"उसने दरवाज़े पर ताला लगाया।", transliteration:"Usne darvāze par tālā lagāyā.", translation:"He/she put a lock on the door. (past)" },
      { sentence:"मैं बग़ीचे में पेड़ लगाऊँगा।", transliteration:"Maiṃ bagīce meṃ peṛ lagāūṃgā.", translation:"I will plant a tree in the garden. (future)" }
    ]},
  { id:"v092", category:"verb", devanagari:"निकालना", transliteration:"nikālnā", meaning:"to take out / to remove / to extract", transitive:true,
    examples:[
      { sentence:"उसने जेब से पैसे निकाले।", transliteration:"Usne jeb se paise nikāle.", translation:"He/she took money out of the pocket. (past)" },
      { sentence:"मैं बैंक से पैसे निकालूँगा।", transliteration:"Maiṃ baiṃk se paise nikālūṃgā.", translation:"I will withdraw money from the bank. (future)" }
    ]},
  { id:"v093", category:"verb", devanagari:"डालना", transliteration:"ḍālnā", meaning:"to put in / to pour / to add", transitive:true,
    examples:[
      { sentence:"उसने चाय में चीनी डाली।", transliteration:"Usne cāy meṃ cīnī ḍālī.", translation:"He/she added sugar to the tea. (past)" },
      { sentence:"मैं खाने में नमक डालूँगा।", transliteration:"Maiṃ khāne meṃ namak ḍālūṃgā.", translation:"I will add salt to the food. (future)" }
    ]},
  { id:"v094", category:"verb", devanagari:"भरना", transliteration:"bharnā", meaning:"to fill", transitive:true,
    examples:[
      { sentence:"उसने बोतल पानी से भरी।", transliteration:"Usne botal pānī se bharī.", translation:"He/she filled the bottle with water. (past)" },
      { sentence:"मैं फ़ॉर्म भरूँगा।", transliteration:"Maiṃ form bharūṃgā.", translation:"I will fill the form. (future)" }
    ]},
  { id:"v095", category:"verb", devanagari:"ख़र्च करना", transliteration:"ḵarc karnā", meaning:"to spend (money/time)", transitive:true,
    examples:[
      { sentence:"उसने बहुत पैसे ख़र्च किए।", transliteration:"Usne bahut paise ḵarc kie.", translation:"He/she spent a lot of money. (past)" },
      { sentence:"मैं कम पैसे ख़र्च करूँगा।", transliteration:"Maiṃ kam paise ḵarc karūṃgā.", translation:"I will spend less money. (future)" }
    ]},
  { id:"v096", category:"verb", devanagari:"कमाना", transliteration:"kamānā", meaning:"to earn", transitive:true,
    examples:[
      { sentence:"उसने इस साल अच्छा कमाया।", transliteration:"Usne is sāl acchā kamāyā.", translation:"He/she earned well this year. (past)" },
      { sentence:"मैं और ज़्यादा कमाऊँगा।", transliteration:"Maiṃ aur zyādā kamāūṃgā.", translation:"I will earn more. (future)" }
    ]},
  { id:"v097", category:"verb", devanagari:"माफ़ करना", transliteration:"māf karnā", meaning:"to forgive / to excuse", transitive:true,
    examples:[
      { sentence:"उसने मुझे माफ़ कर दिया।", transliteration:"Usne mujhe māf kar diyā.", translation:"He/she forgave me. (past)" },
      { sentence:"क्या आप मुझे माफ़ करेंगे?", transliteration:"Kyā āp mujhe māf kareṃge?", translation:"Will you forgive me? (future)" }
    ]},
  { id:"v098", category:"verb", devanagari:"ध्यान देना", transliteration:"dhyān denā", meaning:"to pay attention / to take care", transitive:true,
    examples:[
      { sentence:"उसने ध्यान नहीं दिया।", transliteration:"Usne dhyān nahīṃ diyā.", translation:"He/she did not pay attention. (past)" },
      { sentence:"मैं अपनी सेहत का ध्यान दूँगा।", transliteration:"Maiṃ apnī sehat kā dhyān dūṃgā.", translation:"I will take care of my health. (future)" }
    ]},
  { id:"v099", category:"verb", devanagari:"इंतज़ार करना", transliteration:"intazār karnā", meaning:"to wait", transitive:true,
    examples:[
      { sentence:"मैंने एक घंटे इंतज़ार किया।", transliteration:"Maiṃne ek ghaṃṭe intazār kiyā.", translation:"I waited for an hour. (past)" },
      { sentence:"मैं तुम्हारा इंतज़ार करूँगा।", transliteration:"Maiṃ tumhārā intazār karūṃgā.", translation:"I will wait for you. (future)" }
    ]},
  { id:"v100", category:"verb", devanagari:"कोशिश करना", transliteration:"kosiś karnā", meaning:"to try / to attempt", transitive:true,
    examples:[
      { sentence:"मैंने बहुत कोशिश की।", transliteration:"Maiṃne bahut kosiś kī.", translation:"I tried a lot. (past)" },
      { sentence:"मैं फिर कोशिश करूँगा।", transliteration:"Maiṃ phir kosiś karūṃgā.", translation:"I will try again. (future)" }
    ]},

  // ── OTHER WORDS / EXPRESSIONS (100) ─────────────────────────────────────
  { id:"o001", category:"other", devanagari:"हाँ", transliteration:"hāṃ", meaning:"yes",
    examples:[{ sentence:"हाँ, मैं आऊँगा।", transliteration:"Hāṃ, maiṃ āūṃgā.", translation:"Yes, I will come." }]},
  { id:"o002", category:"other", devanagari:"नहीं", transliteration:"nahīṃ", meaning:"no / not",
    examples:[{ sentence:"नहीं, मुझे नहीं चाहिए।", transliteration:"Nahīṃ, mujhe nahīṃ cāhie.", translation:"No, I don't want it." }]},
  { id:"o003", category:"other", devanagari:"क्या", transliteration:"kyā", meaning:"what / question marker",
    examples:[{ sentence:"क्या आप हिंदी बोलते हैं?", transliteration:"Kyā āp Hindī bolte haiṃ?", translation:"Do you speak Hindi?" }]},
  { id:"o004", category:"other", devanagari:"कौन", transliteration:"kaun", meaning:"who",
    examples:[{ sentence:"वह कौन है?", transliteration:"Vah kaun hai?", translation:"Who is that?" }]},
  { id:"o005", category:"other", devanagari:"कहाँ", transliteration:"kahāṃ", meaning:"where",
    examples:[{ sentence:"बाथरूम कहाँ है?", transliteration:"Bāthrūm kahāṃ hai?", translation:"Where is the bathroom?" }]},
  { id:"o006", category:"other", devanagari:"कब", transliteration:"kab", meaning:"when",
    examples:[{ sentence:"वह कब आएगा?", transliteration:"Vah kab āegā?", translation:"When will he come?" }]},
  { id:"o007", category:"other", devanagari:"कैसे", transliteration:"kaise", meaning:"how",
    examples:[{ sentence:"आप कैसे हैं?", transliteration:"Āp kaise haiṃ?", translation:"How are you?" }]},
  { id:"o008", category:"other", devanagari:"क्यों", transliteration:"kyoṃ", meaning:"why",
    examples:[{ sentence:"आप क्यों रो रहे हैं?", transliteration:"Āp kyoṃ ro rahe haiṃ?", translation:"Why are you crying?" }]},
  { id:"o009", category:"other", devanagari:"कितना", transliteration:"kitnā", meaning:"how much / how many",
    examples:[{ sentence:"यह कितने का है?", transliteration:"Yah kitne kā hai?", translation:"How much does this cost?" }]},
  { id:"o010", category:"other", devanagari:"कौन सा", transliteration:"kaun sā", meaning:"which",
    examples:[{ sentence:"कौन सी किताब चाहिए?", transliteration:"Kaun sī kitāb cāhie?", translation:"Which book is needed?" }]},
  { id:"o011", category:"other", devanagari:"और", transliteration:"aur", meaning:"and / more",
    examples:[{ sentence:"चाय और नाश्ता लाओ।", transliteration:"Cāy aur nāśtā lāo.", translation:"Bring tea and breakfast." }]},
  { id:"o012", category:"other", devanagari:"या", transliteration:"yā", meaning:"or",
    examples:[{ sentence:"चाय या कॉफ़ी?", transliteration:"Cāy yā kāfī?", translation:"Tea or coffee?" }]},
  { id:"o013", category:"other", devanagari:"लेकिन", transliteration:"lekin", meaning:"but",
    examples:[{ sentence:"मैं आना चाहता हूँ, लेकिन समय नहीं है।", transliteration:"Maiṃ ānā cāhtā hūṃ, lekin samay nahīṃ hai.", translation:"I want to come, but there's no time." }]},
  { id:"o014", category:"other", devanagari:"क्योंकि", transliteration:"kyoṃki", meaning:"because",
    examples:[{ sentence:"मैं थका हूँ क्योंकि मैंने काम किया।", transliteration:"Maiṃ thakā hūṃ kyoṃki maiṃne kām kiyā.", translation:"I am tired because I worked." }]},
  { id:"o015", category:"other", devanagari:"अगर", transliteration:"agar", meaning:"if",
    examples:[{ sentence:"अगर बारिश होगी, तो मैं नहीं आऊँगा।", transliteration:"Agar bāriś hogī, to maiṃ nahīṃ āūṃgā.", translation:"If it rains, I won't come." }]},
  { id:"o016", category:"other", devanagari:"तो", transliteration:"to", meaning:"then / so",
    examples:[{ sentence:"अगर आप चाहें, तो बोलें।", transliteration:"Agar āp cāheṃ, to boleṃ.", translation:"If you want, then speak." }]},
  { id:"o017", category:"other", devanagari:"भी", transliteration:"bhī", meaning:"also / too / even",
    examples:[{ sentence:"मैं भी जाऊँगा।", transliteration:"Maiṃ bhī jāūṃgā.", translation:"I will go too." }]},
  { id:"o018", category:"other", devanagari:"ही", transliteration:"hī", meaning:"only / just / (emphatic)",
    examples:[{ sentence:"यही सच है।", transliteration:"Yahī sac hai.", translation:"This alone is the truth." }]},
  { id:"o019", category:"other", devanagari:"तो", transliteration:"to", meaning:"(topic marker / emphatic)",
    examples:[{ sentence:"वह तो बहुत अच्छा है।", transliteration:"Vah to bahut acchā hai.", translation:"He is really very good." }]},
  { id:"o020", category:"other", devanagari:"बहुत", transliteration:"bahut", meaning:"very / a lot / much",
    examples:[{ sentence:"यह बहुत अच्छा है।", transliteration:"Yah bahut acchā hai.", translation:"This is very good." }]},
  { id:"o021", category:"other", devanagari:"थोड़ा", transliteration:"thoṛā", meaning:"a little / a bit",
    examples:[{ sentence:"थोड़ा पानी दो।", transliteration:"Thoṛā pānī do.", translation:"Give a little water." }]},
  { id:"o022", category:"other", devanagari:"ज़्यादा", transliteration:"zyādā", meaning:"more / too much / a lot",
    examples:[{ sentence:"ज़्यादा मत खाओ।", transliteration:"Zyādā mat khāo.", translation:"Don't eat too much." }]},
  { id:"o023", category:"other", devanagari:"कम", transliteration:"kam", meaning:"less / few",
    examples:[{ sentence:"कम बोलो, ज़्यादा करो।", transliteration:"Kam bolo, zyādā karo.", translation:"Speak less, do more." }]},
  { id:"o024", category:"other", devanagari:"सब", transliteration:"sab", meaning:"all / everyone / everything",
    examples:[{ sentence:"सब ठीक है।", transliteration:"Sab ṭhīk hai.", translation:"Everything is fine." }]},
  { id:"o025", category:"other", devanagari:"कुछ", transliteration:"kuch", meaning:"something / some / a little",
    examples:[{ sentence:"कुछ खाओ।", transliteration:"Kuch khāo.", translation:"Eat something." }]},
  { id:"o026", category:"other", devanagari:"कोई", transliteration:"koī", meaning:"someone / some / any",
    examples:[{ sentence:"क्या कोई आया?", transliteration:"Kyā koī āyā?", translation:"Did anyone come?" }]},
  { id:"o027", category:"other", devanagari:"हर", transliteration:"har", meaning:"every / each",
    examples:[{ sentence:"हर दिन पढ़ो।", transliteration:"Har din paṛho.", translation:"Study every day." }]},
  { id:"o028", category:"other", devanagari:"बड़ा", transliteration:"baṛā", meaning:"big / large / great / elder",
    examples:[{ sentence:"यह घर बड़ा है।", transliteration:"Yah ghar baṛā hai.", translation:"This house is big." }]},
  { id:"o029", category:"other", devanagari:"छोटा", transliteration:"choṭā", meaning:"small / little / younger",
    examples:[{ sentence:"यह कमरा छोटा है।", transliteration:"Yah kamrā choṭā hai.", translation:"This room is small." }]},
  { id:"o030", category:"other", devanagari:"अच्छा", transliteration:"acchā", meaning:"good / nice / okay",
    examples:[{ sentence:"यह अच्छा विचार है।", transliteration:"Yah acchā vicār hai.", translation:"This is a good idea." }]},
  { id:"o031", category:"other", devanagari:"बुरा", transliteration:"burā", meaning:"bad / evil",
    examples:[{ sentence:"यह बुरी बात है।", transliteration:"Yah burī bāt hai.", translation:"This is a bad thing." }]},
  { id:"o032", category:"other", devanagari:"नया", transliteration:"nayā", meaning:"new",
    examples:[{ sentence:"उसने नया घर ख़रीदा।", transliteration:"Usne nayā ghar kharīdā.", translation:"He/she bought a new house." }]},
  { id:"o033", category:"other", devanagari:"पुराना", transliteration:"purānā", meaning:"old (things) / ancient",
    examples:[{ sentence:"यह पुरानी किताब है।", transliteration:"Yah purānī kitāb hai.", translation:"This is an old book." }]},
  { id:"o034", category:"other", devanagari:"लंबा", transliteration:"lambā", meaning:"long / tall",
    examples:[{ sentence:"वह बहुत लंबा है।", transliteration:"Vah bahut lambā hai.", translation:"He is very tall." }]},
  { id:"o035", category:"other", devanagari:"ऊँचा", transliteration:"ūṃcā", meaning:"high / tall / loud",
    examples:[{ sentence:"पहाड़ बहुत ऊँचा है।", transliteration:"Pahāṛ bahut ūṃcā hai.", translation:"The mountain is very high." }]},
  { id:"o036", category:"other", devanagari:"गर्म", transliteration:"garm", meaning:"hot / warm",
    examples:[{ sentence:"चाय अभी गर्म है।", transliteration:"Cāy abhī garm hai.", translation:"The tea is still hot." }]},
  { id:"o037", category:"other", devanagari:"ठंडा", transliteration:"ṭhaṇḍā", meaning:"cold / cool",
    examples:[{ sentence:"पानी ठंडा है।", transliteration:"Pānī ṭhaṇḍā hai.", translation:"The water is cold." }]},
  { id:"o038", category:"other", devanagari:"तेज़", transliteration:"tez", meaning:"fast / sharp / loud / spicy",
    examples:[{ sentence:"वह बहुत तेज़ दौड़ता है।", transliteration:"Vah bahut tez dauṛtā hai.", translation:"He runs very fast." }]},
  { id:"o039", category:"other", devanagari:"धीरे", transliteration:"dhīre", meaning:"slowly / quietly / gently",
    examples:[{ sentence:"धीरे बोलो।", transliteration:"Dhīre bolo.", translation:"Speak slowly." }]},
  { id:"o040", category:"other", devanagari:"अभी", transliteration:"abhī", meaning:"now / right now / just now",
    examples:[{ sentence:"अभी आओ।", transliteration:"Abhī āo.", translation:"Come now." }]},
  { id:"o041", category:"other", devanagari:"बाद में", transliteration:"bād meṃ", meaning:"later / afterwards",
    examples:[{ sentence:"बाद में बात करेंगे।", transliteration:"Bād meṃ bāt kareṃge.", translation:"We'll talk later." }]},
  { id:"o042", category:"other", devanagari:"पहले", transliteration:"pahle", meaning:"before / first / earlier",
    examples:[{ sentence:"पहले खाना खाओ।", transliteration:"Pahle khānā khāo.", translation:"Eat food first." }]},
  { id:"o043", category:"other", devanagari:"कल", transliteration:"kal", meaning:"yesterday / tomorrow (context-dependent)",
    examples:[{ sentence:"कल मैं दिल्ली गया था।", transliteration:"Kal maiṃ Dillī gayā thā.", translation:"Yesterday I went to Delhi." }]},
  { id:"o044", category:"other", devanagari:"आज", transliteration:"āj", meaning:"today",
    examples:[{ sentence:"आज मौसम अच्छा है।", transliteration:"Āj mausam acchā hai.", translation:"The weather is good today." }]},
  { id:"o045", category:"other", devanagari:"परसों", transliteration:"parsōṃ", meaning:"day after tomorrow / day before yesterday",
    examples:[{ sentence:"परसों छुट्टी है।", transliteration:"Parsōṃ chuṭṭī hai.", translation:"There is a holiday the day after tomorrow." }]},
  { id:"o046", category:"other", devanagari:"हमेशा", transliteration:"hameśā", meaning:"always",
    examples:[{ sentence:"मैं हमेशा सच बोलता हूँ।", transliteration:"Maiṃ hameśā sac boltā hūṃ.", translation:"I always tell the truth." }]},
  { id:"o047", category:"other", devanagari:"कभी", transliteration:"kabhī", meaning:"ever / sometimes / (with negation: never)",
    examples:[{ sentence:"मैं कभी नहीं भूलूँगा।", transliteration:"Maiṃ kabhī nahīṃ bhūlūṃgā.", translation:"I will never forget." }]},
  { id:"o048", category:"other", devanagari:"कभी कभी", transliteration:"kabhī kabhī", meaning:"sometimes",
    examples:[{ sentence:"कभी कभी मैं देर से उठता हूँ।", transliteration:"Kabhī kabhī maiṃ der se uṭhtā hūṃ.", translation:"Sometimes I get up late." }]},
  { id:"o049", category:"other", devanagari:"ज़रूर", transliteration:"zarūr", meaning:"definitely / certainly / of course",
    examples:[{ sentence:"मैं ज़रूर आऊँगा।", transliteration:"Maiṃ zarūr āūṃgā.", translation:"I will definitely come." }]},
  { id:"o050", category:"other", devanagari:"शायद", transliteration:"śāyad", meaning:"maybe / perhaps",
    examples:[{ sentence:"शायद वह आए।", transliteration:"Śāyad vah āe.", translation:"Maybe he will come." }]},
  { id:"o051", category:"other", devanagari:"सच में", transliteration:"sac meṃ", meaning:"really / truly / in truth",
    examples:[{ sentence:"सच में? मुझे नहीं पता था।", transliteration:"Sac meṃ? Mujhe nahīṃ patā thā.", translation:"Really? I didn't know." }]},
  { id:"o052", category:"other", devanagari:"ठीक है", transliteration:"ṭhīk hai", meaning:"okay / it's fine / alright",
    examples:[{ sentence:"ठीक है, मैं कल आऊँगा।", transliteration:"Ṭhīk hai, maiṃ kal āūṃgā.", translation:"Okay, I'll come tomorrow." }]},
  { id:"o053", category:"other", devanagari:"नमस्ते", transliteration:"namaste", meaning:"hello / goodbye (respectful greeting)",
    examples:[{ sentence:"नमस्ते, आप कैसे हैं?", transliteration:"Namaste, āp kaise haiṃ?", translation:"Hello, how are you?" }]},
  { id:"o054", category:"other", devanagari:"शुक्रिया", transliteration:"śukriyā", meaning:"thank you",
    examples:[{ sentence:"आपकी मदद के लिए शुक्रिया।", transliteration:"Āpkī madad ke lie śukriyā.", translation:"Thank you for your help." }]},
  { id:"o055", category:"other", devanagari:"धन्यवाद", transliteration:"dhanyavād", meaning:"thank you (formal)",
    examples:[{ sentence:"बहुत धन्यवाद।", transliteration:"Bahut dhanyavād.", translation:"Many thanks." }]},
  { id:"o056", category:"other", devanagari:"माफ़ कीजिए", transliteration:"māf kījie", meaning:"excuse me / I'm sorry (formal)",
    examples:[{ sentence:"माफ़ कीजिए, मुझे रास्ता बताइए।", transliteration:"Māf kījie, mujhe rāstā batāie.", translation:"Excuse me, please show me the way." }]},
  { id:"o057", category:"other", devanagari:"क्षमा करें", transliteration:"kṣamā kareṃ", meaning:"please forgive me / I apologize",
    examples:[{ sentence:"मेरी ग़लती के लिए क्षमा करें।", transliteration:"Merī ġalatī ke lie kṣamā kareṃ.", translation:"Please forgive me for my mistake." }]},
  { id:"o058", category:"other", devanagari:"कोई बात नहीं", transliteration:"koī bāt nahīṃ", meaning:"no problem / it's okay / never mind",
    examples:[{ sentence:"कोई बात नहीं, मैं समझता हूँ।", transliteration:"Koī bāt nahīṃ, maiṃ samajhtā hūṃ.", translation:"No problem, I understand." }]},
  { id:"o059", category:"other", devanagari:"अलविदा", transliteration:"alavdā", meaning:"goodbye (farewell)",
    examples:[{ sentence:"अलविदा, जल्दी आना।", transliteration:"Alavdā, jaldī ānā.", translation:"Goodbye, come back soon." }]},
  { id:"o060", category:"other", devanagari:"फिर मिलेंगे", transliteration:"phir mileṃge", meaning:"see you again / until we meet again",
    examples:[{ sentence:"फिर मिलेंगे!", transliteration:"Phir mileṃge!", translation:"See you again!" }]},
  { id:"o061", category:"other", devanagari:"में", transliteration:"meṃ", meaning:"in / inside",
    examples:[{ sentence:"मैं घर में हूँ।", transliteration:"Maiṃ ghar meṃ hūṃ.", translation:"I am in the house." }]},
  { id:"o062", category:"other", devanagari:"पर", transliteration:"par", meaning:"on / at / upon",
    examples:[{ sentence:"किताब मेज़ पर है।", transliteration:"Kitāb mez par hai.", translation:"The book is on the table." }]},
  { id:"o063", category:"other", devanagari:"से", transliteration:"se", meaning:"from / by / with / since",
    examples:[{ sentence:"मैं दिल्ली से हूँ।", transliteration:"Maiṃ Dillī se hūṃ.", translation:"I am from Delhi." }]},
  { id:"o064", category:"other", devanagari:"को", transliteration:"ko", meaning:"to / at (dative/accusative marker)",
    examples:[{ sentence:"उसे पानी दो।", transliteration:"Use pānī do.", translation:"Give him/her water." }]},
  { id:"o065", category:"other", devanagari:"का / के / की", transliteration:"kā / ke / kī", meaning:"of / 's (possessive marker — gender agrees with possessed noun)",
    examples:[{ sentence:"राम की किताब कहाँ है?", transliteration:"Rām kī kitāb kahāṃ hai?", translation:"Where is Ram's book?" }]},
  { id:"o066", category:"other", devanagari:"ने", transliteration:"ne", meaning:"(ergative case marker — used with transitive verbs in past tense)",
    examples:[{ sentence:"उसने खाना खाया।", transliteration:"Usne khānā khāyā.", translation:"He/she ate food." }]},
  { id:"o067", category:"other", devanagari:"के साथ", transliteration:"ke sāth", meaning:"with (together with)",
    examples:[{ sentence:"मैं दोस्त के साथ गया।", transliteration:"Maiṃ dost ke sāth gayā.", translation:"I went with a friend." }]},
  { id:"o068", category:"other", devanagari:"के लिए", transliteration:"ke lie", meaning:"for",
    examples:[{ sentence:"यह तुम्हारे लिए है।", transliteration:"Yah tumhāre lie hai.", translation:"This is for you." }]},
  { id:"o069", category:"other", devanagari:"के बारे में", transliteration:"ke bāre meṃ", meaning:"about / regarding",
    examples:[{ sentence:"इसके बारे में बताओ।", transliteration:"Iske bāre meṃ batāo.", translation:"Tell me about this." }]},
  { id:"o070", category:"other", devanagari:"के पास", transliteration:"ke pās", meaning:"near / with (possession)",
    examples:[{ sentence:"मेरे पास किताब है।", transliteration:"Mere pās kitāb hai.", translation:"I have the book (it's with me)." }]},
  { id:"o071", category:"other", devanagari:"के ऊपर", transliteration:"ke ūpar", meaning:"above / on top of / over",
    examples:[{ sentence:"छत के ऊपर पक्षी बैठे हैं।", transliteration:"Chat ke ūpar pakṣī baiṭhe haiṃ.", translation:"Birds are sitting on top of the roof." }]},
  { id:"o072", category:"other", devanagari:"के नीचे", transliteration:"ke nīce", meaning:"below / under / beneath",
    examples:[{ sentence:"बिल्ली मेज़ के नीचे है।", transliteration:"Billī mez ke nīce hai.", translation:"The cat is under the table." }]},
  { id:"o073", category:"other", devanagari:"के आगे", transliteration:"ke āge", meaning:"in front of / ahead of",
    examples:[{ sentence:"स्कूल के आगे एक पार्क है।", transliteration:"Skūl ke āge ek pārk hai.", translation:"There is a park in front of the school." }]},
  { id:"o074", category:"other", devanagari:"के पीछे", transliteration:"ke pīche", meaning:"behind / after",
    examples:[{ sentence:"घर के पीछे बग़ीचा है।", transliteration:"Ghar ke pīche bagīcā hai.", translation:"There is a garden behind the house." }]},
  { id:"o075", category:"other", devanagari:"मेरा / मेरी", transliteration:"merā / merī", meaning:"my / mine",
    examples:[{ sentence:"यह मेरा घर है।", transliteration:"Yah merā ghar hai.", translation:"This is my house." }]},
  { id:"o076", category:"other", devanagari:"तुम्हारा / आपका", transliteration:"tumhārā / āpkā", meaning:"your (informal / formal)",
    examples:[{ sentence:"आपका नाम क्या है?", transliteration:"Āpkā nām kyā hai?", translation:"What is your name?" }]},
  { id:"o077", category:"other", devanagari:"उसका / उसकी", transliteration:"uskā / uskī", meaning:"his / her / its",
    examples:[{ sentence:"उसकी गाड़ी लाल है।", transliteration:"Uskī gāṛī lāl hai.", translation:"Her/his car is red." }]},
  { id:"o078", category:"other", devanagari:"हमारा", transliteration:"hamārā", meaning:"our / ours",
    examples:[{ sentence:"हमारा स्कूल पास में है।", transliteration:"Hamārā skūl pās meṃ hai.", translation:"Our school is nearby." }]},
  { id:"o079", category:"other", devanagari:"मैं", transliteration:"maiṃ", meaning:"I",
    examples:[{ sentence:"मैं हिंदी सीख रहा हूँ।", transliteration:"Maiṃ Hindī sīkh rahā hūṃ.", translation:"I am learning Hindi." }]},
  { id:"o080", category:"other", devanagari:"तुम / आप", transliteration:"tum / āp", meaning:"you (informal / formal)",
    examples:[{ sentence:"आप कहाँ से हैं?", transliteration:"Āp kahāṃ se haiṃ?", translation:"Where are you from?" }]},
  { id:"o081", category:"other", devanagari:"वह", transliteration:"vah", meaning:"he / she / it / that",
    examples:[{ sentence:"वह मेरी दोस्त है।", transliteration:"Vah merī dost hai.", translation:"She is my friend." }]},
  { id:"o082", category:"other", devanagari:"यह", transliteration:"yah", meaning:"this / it (near)",
    examples:[{ sentence:"यह क्या है?", transliteration:"Yah kyā hai?", translation:"What is this?" }]},
  { id:"o083", category:"other", devanagari:"वे / वो", transliteration:"ve / vo", meaning:"they / those",
    examples:[{ sentence:"वे सब मेरे दोस्त हैं।", transliteration:"Ve sab mere dost haiṃ.", translation:"They are all my friends." }]},
  { id:"o084", category:"other", devanagari:"हम", transliteration:"ham", meaning:"we",
    examples:[{ sentence:"हम साथ जाएँगे।", transliteration:"Ham sāth jāeṃge.", translation:"We will go together." }]},
  { id:"o085", category:"other", devanagari:"एक", transliteration:"ek", meaning:"one / a / an",
    examples:[{ sentence:"एक कप चाय दो।", transliteration:"Ek kap cāy do.", translation:"Give one cup of tea." }]},
  { id:"o086", category:"other", devanagari:"दो", transliteration:"do", meaning:"two",
    examples:[{ sentence:"मुझे दो किताबें चाहिए।", transliteration:"Mujhe do kitābeṃ cāhie.", translation:"I need two books." }]},
  { id:"o087", category:"other", devanagari:"पहला", transliteration:"pahlā", meaning:"first",
    examples:[{ sentence:"यह मेरा पहला दिन है।", transliteration:"Yah merā pahlā din hai.", translation:"This is my first day." }]},
  { id:"o088", category:"other", devanagari:"आख़िर", transliteration:"āḵir", meaning:"last / final / in the end",
    examples:[{ sentence:"आख़िर में वह आया।", transliteration:"Āḵir meṃ vah āyā.", translation:"In the end, he came." }]},
  { id:"o089", category:"other", devanagari:"साथ", transliteration:"sāth", meaning:"together / with",
    examples:[{ sentence:"हम साथ खाएँगे।", transliteration:"Ham sāth khāeṃge.", translation:"We will eat together." }]},
  { id:"o090", category:"other", devanagari:"अलग", transliteration:"alag", meaning:"different / separate / alone",
    examples:[{ sentence:"यह अलग बात है।", transliteration:"Yah alag bāt hai.", translation:"This is a different matter." }]},
  { id:"o091", category:"other", devanagari:"सही", transliteration:"sahī", meaning:"correct / right / true",
    examples:[{ sentence:"यह जवाब सही है।", transliteration:"Yah javāb sahī hai.", translation:"This answer is correct." }]},
  { id:"o092", category:"other", devanagari:"ग़लत", transliteration:"ġalat", meaning:"wrong / incorrect",
    examples:[{ sentence:"यह ग़लत है।", transliteration:"Yah ġalat hai.", translation:"This is wrong." }]},
  { id:"o093", category:"other", devanagari:"आसान", transliteration:"āsān", meaning:"easy / simple",
    examples:[{ sentence:"यह काम आसान है।", transliteration:"Yah kām āsān hai.", translation:"This work is easy." }]},
  { id:"o094", category:"other", devanagari:"मुश्किल", transliteration:"muśkil", meaning:"difficult / hard / problem",
    examples:[{ sentence:"यह सवाल बहुत मुश्किल है।", transliteration:"Yah savāl bahut muśkil hai.", translation:"This question is very difficult." }]},
  { id:"o095", category:"other", devanagari:"ज़रूरी", transliteration:"zarūrī", meaning:"necessary / important",
    examples:[{ sentence:"यह बहुत ज़रूरी है।", transliteration:"Yah bahut zarūrī hai.", translation:"This is very necessary." }]},
  { id:"o096", category:"other", devanagari:"जल्दी", transliteration:"jaldī", meaning:"quickly / hurry / early",
    examples:[{ sentence:"जल्दी आओ।", transliteration:"Jaldī āo.", translation:"Come quickly." }]},
  { id:"o097", category:"other", devanagari:"देर", transliteration:"der", meaning:"late / delay / a while",
    examples:[{ sentence:"देर मत करो।", transliteration:"Der mat karo.", translation:"Don't be late / Don't delay." }]},
  { id:"o098", category:"other", devanagari:"बिना", transliteration:"binā", meaning:"without",
    examples:[{ sentence:"पानी के बिना जीना मुश्किल है।", transliteration:"Pānī ke binā jīnā muśkil hai.", translation:"Living without water is difficult." }]},
  { id:"o099", category:"other", devanagari:"सिर्फ़", transliteration:"sirf", meaning:"only / just",
    examples:[{ sentence:"सिर्फ़ एक मिनट रुको।", transliteration:"Sirf ek minaṭ ruko.", translation:"Wait just one minute." }]},
  { id:"o100", category:"other", devanagari:"बिल्कुल", transliteration:"bilkul", meaning:"absolutely / exactly / at all",
    examples:[{ sentence:"बिल्कुल सही।", transliteration:"Bilkul sahī.", translation:"Absolutely correct." }]},
];

// ─── UNIT METADATA ────────────────────────────────────────────────────────────
const UNITS = [
  { id:"u01", label:"Unit 1 — Greetings & Basics" },
  { id:"u02", label:"Unit 2 — Family & People" },
  { id:"u03", label:"Unit 3 — Numbers & Time" },
];

// ─── UNIT WORDS (chapter-tagged vocabulary) ───────────────────────────────────
const UNIT_WORDS = [
  // ── UNIT 1 — GREETINGS & BASICS ────────────────────────────────────────────
  { id:"u1_01", category:"other", unit:"u01", devanagari:"नमस्ते", transliteration:"namaste", meaning:"Hello / Goodbye (universal greeting)",
    examples:[{ sentence:"नमस्ते, आप कैसे हैं?", transliteration:"Namaste, āp kaise haiṃ?", translation:"Hello, how are you?" }]},
  { id:"u1_02", category:"other", unit:"u01", devanagari:"नमस्कार", transliteration:"namaskār", meaning:"Respectful greeting (slightly more formal than नमस्ते)",
    examples:[{ sentence:"सबको नमस्कार!", transliteration:"Sabko namaskār!", translation:"Greetings to everyone!" }]},
  { id:"u1_03", category:"other", unit:"u01", devanagari:"जी हाँ", transliteration:"jī hāṃ", meaning:"Yes (polite / respectful)",
    examples:[{ sentence:"जी हाँ, मैं हिंदी बोलता हूँ।", transliteration:"Jī hāṃ, maiṃ Hindī boltā hūṃ.", translation:"Yes, I speak Hindi." }]},
  { id:"u1_04", category:"other", unit:"u01", devanagari:"जी नहीं", transliteration:"jī nahīṃ", meaning:"No (polite / respectful)",
    examples:[{ sentence:"जी नहीं, मैं दिल्ली से नहीं हूँ।", transliteration:"Jī nahīṃ, maiṃ Dillī se nahīṃ hūṃ.", translation:"No, I'm not from Delhi." }]},
  { id:"u1_05", category:"noun", unit:"u01", devanagari:"नाम", transliteration:"nām", meaning:"name", gender:"m",
    examples:[{ sentence:"आपका नाम क्या है?", transliteration:"Āpkā nām kyā hai?", translation:"What is your name?" }]},
  { id:"u1_06", category:"verb", unit:"u01", devanagari:"होना", transliteration:"honā", meaning:"to be / to exist / to happen", transitive:false,
    examples:[
      { sentence:"वह डॉक्टर थी।", transliteration:"Vah ḍākṭar thī.", translation:"She was a doctor. (past)" },
      { sentence:"कल बारिश होगी।", transliteration:"Kal bāriś hogī.", translation:"It will rain tomorrow. (future)" }
    ]},
  { id:"u1_07", category:"other", unit:"u01", devanagari:"मैं", transliteration:"maiṃ", meaning:"I (first person singular)",
    examples:[{ sentence:"मैं भारत से हूँ।", transliteration:"Maiṃ Bhārat se hūṃ.", translation:"I am from India." }]},
  { id:"u1_08", category:"other", unit:"u01", devanagari:"आप", transliteration:"āp", meaning:"you (formal / polite)",
    examples:[{ sentence:"आप कहाँ से हैं?", transliteration:"Āp kahāṃ se haiṃ?", translation:"Where are you from?" }]},
  { id:"u1_09", category:"other", unit:"u01", devanagari:"तुम", transliteration:"tum", meaning:"you (familiar / informal)",
    examples:[{ sentence:"तुम क्या करते हो?", transliteration:"Tum kyā karte ho?", translation:"What do you do?" }]},
  { id:"u1_10", category:"other", unit:"u01", devanagari:"वह / वो", transliteration:"vah / vo", meaning:"he / she / it / that",
    examples:[{ sentence:"वह मेरी दोस्त है।", transliteration:"Vah merī dost hai.", translation:"She is my friend." }]},
  { id:"u1_11", category:"other", unit:"u01", devanagari:"यह / ये", transliteration:"yah / ye", meaning:"this / he / she (near, respectful)",
    examples:[{ sentence:"यह क्या है?", transliteration:"Yah kyā hai?", translation:"What is this?" }]},
  { id:"u1_12", category:"other", unit:"u01", devanagari:"हम", transliteration:"ham", meaning:"we",
    examples:[{ sentence:"हम दोस्त हैं।", transliteration:"Ham dost haiṃ.", translation:"We are friends." }]},
  { id:"u1_13", category:"other", unit:"u01", devanagari:"ठीक है", transliteration:"ṭhīk hai", meaning:"OK / fine / alright",
    examples:[{ sentence:"ठीक है, कल मिलते हैं।", transliteration:"Ṭhīk hai, kal milte haiṃ.", translation:"OK, let's meet tomorrow." }]},
  { id:"u1_14", category:"other", unit:"u01", devanagari:"शुक्रिया / धन्यवाद", transliteration:"śukriyā / dhanyavād", meaning:"Thank you",
    examples:[{ sentence:"मदद के लिए शुक्रिया।", transliteration:"Madad ke lie śukriyā.", translation:"Thank you for the help." }]},
  { id:"u1_15", category:"other", unit:"u01", devanagari:"माफ़ करें / माफ़ कीजिए", transliteration:"māf kareṃ / māf kījie", meaning:"Excuse me / I'm sorry (polite)",
    examples:[{ sentence:"माफ़ कीजिए, रास्ता बताइए।", transliteration:"Māf kījie, rāstā batāie.", translation:"Excuse me, please show me the way." }]},
  { id:"u1_16", category:"other", unit:"u01", devanagari:"कोई बात नहीं", transliteration:"koī bāt nahīṃ", meaning:"No problem / Never mind / Don't worry",
    examples:[{ sentence:"कोई बात नहीं, मैं समझता हूँ।", transliteration:"Koī bāt nahīṃ, maiṃ samajhtā hūṃ.", translation:"No problem, I understand." }]},
  { id:"u1_17", category:"other", unit:"u01", devanagari:"कैसे हैं आप?", transliteration:"kaise haiṃ āp?", meaning:"How are you? (formal)",
    examples:[{ sentence:"कैसे हैं आप? — मैं ठीक हूँ, शुक्रिया।", transliteration:"Kaise haiṃ āp? — Maiṃ ṭhīk hūṃ, śukriyā.", translation:"How are you? — I'm fine, thank you." }]},
  { id:"u1_18", category:"other", unit:"u01", devanagari:"मिलकर खुशी हुई", transliteration:"milkar khuśī huī", meaning:"Pleased to meet you",
    examples:[{ sentence:"आपसे मिलकर खुशी हुई।", transliteration:"Āpse milkar khuśī huī.", translation:"I'm pleased to meet you." }]},

  // ── UNIT 2 — FAMILY & PEOPLE ───────────────────────────────────────────────
  { id:"u2_01", category:"noun", unit:"u02", devanagari:"परिवार", transliteration:"parivār", meaning:"family", gender:"m",
    examples:[{ sentence:"मेरा परिवार बड़ा है।", transliteration:"Merā parivār baṛā hai.", translation:"My family is big." }]},
  { id:"u2_02", category:"noun", unit:"u02", devanagari:"बेटा", transliteration:"beṭā", meaning:"son", gender:"m",
    examples:[{ sentence:"उनका बेटा इंजीनियर है।", transliteration:"Unkā beṭā iṃjīniyar hai.", translation:"Their son is an engineer." }]},
  { id:"u2_03", category:"noun", unit:"u02", devanagari:"बेटी", transliteration:"beṭī", meaning:"daughter", gender:"f",
    examples:[{ sentence:"उनकी बेटी स्कूल जाती है।", transliteration:"Unkī beṭī skūl jātī hai.", translation:"Their daughter goes to school." }]},
  { id:"u2_04", category:"noun", unit:"u02", devanagari:"पति", transliteration:"pati", meaning:"husband", gender:"m",
    examples:[{ sentence:"उसके पति दिल्ली में काम करते हैं।", transliteration:"Uske pati Dillī meṃ kām karte haiṃ.", translation:"Her husband works in Delhi." }]},
  { id:"u2_05", category:"noun", unit:"u02", devanagari:"पत्नी", transliteration:"patnī", meaning:"wife", gender:"f",
    examples:[{ sentence:"उसकी पत्नी शिक्षक है।", transliteration:"Uskī patnī śikṣak hai.", translation:"His wife is a teacher." }]},
  { id:"u2_06", category:"noun", unit:"u02", devanagari:"दादा", transliteration:"dādā", meaning:"paternal grandfather", gender:"m",
    examples:[{ sentence:"दादा बहुत बुद्धिमान हैं।", transliteration:"Dādā bahut buddhimān haiṃ.", translation:"Grandfather is very wise." }]},
  { id:"u2_07", category:"noun", unit:"u02", devanagari:"दादी", transliteration:"dādī", meaning:"paternal grandmother", gender:"f",
    examples:[{ sentence:"दादी कहानी सुनाती हैं।", transliteration:"Dādī kahānī sunātī haiṃ.", translation:"Grandmother tells stories." }]},
  { id:"u2_08", category:"noun", unit:"u02", devanagari:"नाना / नानी", transliteration:"nānā / nānī", meaning:"maternal grandfather / grandmother", gender:"m",
    examples:[{ sentence:"नाना-नानी गाँव में रहते हैं।", transliteration:"Nānā-nānī gāṃv meṃ rahte haiṃ.", translation:"Maternal grandparents live in the village." }]},
  { id:"u2_09", category:"noun", unit:"u02", devanagari:"चाचा / चाची", transliteration:"cācā / cācī", meaning:"paternal uncle / aunt", gender:"m",
    examples:[{ sentence:"चाचाजी आज आएंगे।", transliteration:"Cācājī āj āeṃge.", translation:"Uncle will come today." }]},
  { id:"u2_10", category:"noun", unit:"u02", devanagari:"मामा / मामी", transliteration:"māmā / māmī", meaning:"maternal uncle / aunt", gender:"m",
    examples:[{ sentence:"मामी ने मिठाई भेजी।", transliteration:"Māmī ne miṭhāī bhejī.", translation:"Aunty sent sweets." }]},
  { id:"u2_11", category:"other", unit:"u02", devanagari:"लंबा / लंबी", transliteration:"lambā / lambī", meaning:"tall / long (adj., agrees with noun gender)",
    examples:[{ sentence:"वह बहुत लंबा है।", transliteration:"Vah bahut lambā hai.", translation:"He is very tall." }]},
  { id:"u2_12", category:"other", unit:"u02", devanagari:"छोटा / छोटी", transliteration:"choṭā / choṭī", meaning:"small / young / little",
    examples:[{ sentence:"यह बच्चा बहुत छोटा है।", transliteration:"Yah baccā bahut choṭā hai.", translation:"This child is very small." }]},
  { id:"u2_13", category:"other", unit:"u02", devanagari:"बूढ़ा / बूढ़ी", transliteration:"būṛhā / būṛhī", meaning:"old (of a person)",
    examples:[{ sentence:"वह बूढ़ा आदमी बहुत जानकार है।", transliteration:"Vah būṛhā ādmī bahut jānkār hai.", translation:"That old man is very knowledgeable." }]},
  { id:"u2_14", category:"other", unit:"u02", devanagari:"जवान", transliteration:"javān", meaning:"young",
    examples:[{ sentence:"वह अभी जवान है।", transliteration:"Vah abhī javān hai.", translation:"He is still young." }]},
  { id:"u2_15", category:"noun", unit:"u02", devanagari:"उम्र / आयु", transliteration:"umr / āyu", meaning:"age", gender:"f",
    examples:[{ sentence:"आपकी उम्र क्या है?", transliteration:"Āpkī umr kyā hai?", translation:"What is your age?" }]},

  // ── UNIT 3 — NUMBERS & TIME ────────────────────────────────────────────────
  { id:"u3_01", category:"other", unit:"u03", devanagari:"एक", transliteration:"ek", meaning:"one (1)",
    examples:[{ sentence:"मुझे एक कप चाय चाहिए।", transliteration:"Mujhe ek kap cāy cāhie.", translation:"I want one cup of tea." }]},
  { id:"u3_02", category:"other", unit:"u03", devanagari:"दो", transliteration:"do", meaning:"two (2)",
    examples:[{ sentence:"दो किलो चावल दे दो।", transliteration:"Do kilo cāval de do.", translation:"Give two kilos of rice." }]},
  { id:"u3_03", category:"other", unit:"u03", devanagari:"तीन", transliteration:"tīn", meaning:"three (3)",
    examples:[{ sentence:"तीन बजे मिलेंगे।", transliteration:"Tīn baje mileṃge.", translation:"We'll meet at three o'clock." }]},
  { id:"u3_04", category:"other", unit:"u03", devanagari:"चार", transliteration:"cār", meaning:"four (4)",
    examples:[{ sentence:"चार लोग आएंगे।", transliteration:"Cār log āeṃge.", translation:"Four people will come." }]},
  { id:"u3_05", category:"other", unit:"u03", devanagari:"पाँच", transliteration:"pāṃc", meaning:"five (5)",
    examples:[{ sentence:"पाँच मिनट रुको।", transliteration:"Pāṃc minaṭ ruko.", translation:"Wait five minutes." }]},
  { id:"u3_06", category:"other", unit:"u03", devanagari:"दस", transliteration:"das", meaning:"ten (10)",
    examples:[{ sentence:"दस रुपये दो।", transliteration:"Das rupaye do.", translation:"Give ten rupees." }]},
  { id:"u3_07", category:"other", unit:"u03", devanagari:"बीस", transliteration:"bīs", meaning:"twenty (20)",
    examples:[{ sentence:"बीस मिनट में पहुँचूँगा।", transliteration:"Bīs minaṭ meṃ pahuṃcūṃgā.", translation:"I'll arrive in twenty minutes." }]},
  { id:"u3_08", category:"other", unit:"u03", devanagari:"पचास", transliteration:"pacās", meaning:"fifty (50)",
    examples:[{ sentence:"पचास रुपये काफ़ी हैं।", transliteration:"Pacās rupaye kāfī haiṃ.", translation:"Fifty rupees is enough." }]},
  { id:"u3_09", category:"other", unit:"u03", devanagari:"सौ", transliteration:"sau", meaning:"one hundred (100)",
    examples:[{ sentence:"सौ रुपये का नोट।", transliteration:"Sau rupaye kā noṭ.", translation:"A hundred-rupee note." }]},
  { id:"u3_10", category:"other", unit:"u03", devanagari:"हज़ार", transliteration:"hazār", meaning:"one thousand (1000)",
    examples:[{ sentence:"एक हज़ार रुपये का नोट।", transliteration:"Ek hazār rupaye kā noṭ.", translation:"A one-thousand-rupee note." }]},
  { id:"u3_11", category:"noun", unit:"u03", devanagari:"बजे", transliteration:"baje", meaning:"o'clock (time expression)", gender:"m",
    examples:[{ sentence:"अभी कितने बजे हैं?", transliteration:"Abhī kitne baje haiṃ?", translation:"What time is it now?" }]},
  { id:"u3_12", category:"noun", unit:"u03", devanagari:"घंटा", transliteration:"ghaṃṭā", meaning:"hour", gender:"m",
    examples:[{ sentence:"एक घंटे में आऊँगा।", transliteration:"Ek ghaṃṭe meṃ āūṃgā.", translation:"I'll come in one hour." }]},
  { id:"u3_13", category:"noun", unit:"u03", devanagari:"मिनट", transliteration:"minaṭ", meaning:"minute", gender:"m",
    examples:[{ sentence:"दस मिनट और रुको।", transliteration:"Das minaṭ aur ruko.", translation:"Wait ten more minutes." }]},
  { id:"u3_14", category:"noun", unit:"u03", devanagari:"सुबह", transliteration:"subah", meaning:"morning", gender:"f",
    examples:[{ sentence:"सुबह जल्दी उठो।", transliteration:"Subah jaldī uṭho.", translation:"Get up early in the morning." }]},
  { id:"u3_15", category:"noun", unit:"u03", devanagari:"दोपहर", transliteration:"dopahar", meaning:"afternoon / noon", gender:"f",
    examples:[{ sentence:"दोपहर को खाना खाएंगे।", transliteration:"Dopahar ko khānā khāeṃge.", translation:"We'll eat lunch in the afternoon." }]},
  { id:"u3_16", category:"noun", unit:"u03", devanagari:"शाम", transliteration:"śām", meaning:"evening", gender:"f",
    examples:[{ sentence:"शाम को मिलते हैं।", transliteration:"Śām ko milte haiṃ.", translation:"Let's meet in the evening." }]},
  { id:"u3_17", category:"noun", unit:"u03", devanagari:"हफ़्ता / सप्ताह", transliteration:"haftā / saptāh", meaning:"week", gender:"m",
    examples:[{ sentence:"एक हफ़्ते में सात दिन होते हैं।", transliteration:"Ek haftā meṃ sāt din hote haiṃ.", translation:"There are seven days in a week." }]},
  { id:"u3_18", category:"noun", unit:"u03", devanagari:"महीना", transliteration:"mahīnā", meaning:"month", gender:"m",
    examples:[{ sentence:"तीन महीने बाद आऊँगा।", transliteration:"Tīn mahīne bād āūṃgā.", translation:"I'll come after three months." }]},
  { id:"u3_19", category:"other", unit:"u03", devanagari:"आज", transliteration:"āj", meaning:"today",
    examples:[{ sentence:"आज का काम आज करो।", transliteration:"Āj kā kām āj karo.", translation:"Do today's work today." }]},
  { id:"u3_20", category:"other", unit:"u03", devanagari:"कल", transliteration:"kal", meaning:"yesterday / tomorrow (context determines which)",
    examples:[{ sentence:"कल क्या करोगे?", transliteration:"Kal kyā karoge?", translation:"What will you do tomorrow?" }]},
  { id:"u3_21", category:"other", unit:"u03", devanagari:"परसों", transliteration:"parsoṃ", meaning:"the day after tomorrow / the day before yesterday",
    examples:[{ sentence:"परसों मेरा जन्मदिन है।", transliteration:"Parsoṃ merā janmadin hai.", translation:"My birthday is the day after tomorrow." }]},
];

const API_KEY_CONFIGURED = !!import.meta.env.VITE_ANTHROPIC_API_KEY;

// ─── STORAGE ─────────────────────────────────────────────────────────────────
// Use storage if available (Claude Code preview), otherwise localStorage.
const storage = window.storage ?? {
  get: (key) => Promise.resolve({ value: localStorage.getItem(key) }),
  set: (key, value) => { localStorage.setItem(key, value); return Promise.resolve(); },
};

// ─── UTILITY ─────────────────────────────────────────────────────────────────
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const CATEGORY_LABELS = { noun: "Noun", verb: "Verb", other: "Expression" };
const CATEGORY_COLORS = {
  noun:  { bg: "#e8f4fd", accent: "#1a6fa8", badge: "#d0eaf8" },
  verb:  { bg: "#fdf3e8", accent: "#b45309", badge: "#fde8c8" },
  other: { bg: "#f0fdf4", accent: "#15803d", badge: "#dcfce7" },
};

const ALL_WORDS = [...WORDS, ...UNIT_WORDS];

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
function Badge({ children, style }) {
  return (
    <span style={{
      display: "inline-block",
      fontSize: "11px",
      fontWeight: 600,
      letterSpacing: "0.05em",
      textTransform: "uppercase",
      padding: "3px 8px",
      borderRadius: "4px",
      ...style,
    }}>{children}</span>
  );
}

function ProgressBar({ current, total }) {
  const pct = total ? Math.round((current / total) * 100) : 0;
  return (
    <div style={{ marginBottom: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>
        <span>{current} / {total}</span>
        <span>{pct}%</span>
      </div>
      <div style={{ height: "4px", background: "#e2e8f0", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "#6366f1", borderRadius: "2px", transition: "width 0.3s ease" }} />
      </div>
    </div>
  );
}

function FlashCard({ word, showBack, onFlip, onEdit, onRemove, onGenerateExample, allUnits }) {
  const col = CATEGORY_COLORS[word.category];
  const units = allUnits || UNITS;
  return (
    <div
      onClick={onFlip}
      style={{
        background: "#fff",
        border: `2px solid ${col.accent}22`,
        borderRadius: "20px",
        padding: "36px 32px 28px",
        minHeight: "340px",
        cursor: "pointer",
        userSelect: "none",
        position: "relative",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.12s ease, box-shadow 0.12s ease",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.12)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.08)"; }}
    >
      {/* Action menu — edit / remove */}
      {(onEdit || onRemove || onGenerateExample) && (
        <WordMenu onEdit={onEdit} onRemove={onRemove} onGenerateExample={onGenerateExample} />
      )}

      {/* top badges */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "20px" }}>
        {word.id?.startsWith("custom_") && (
          <Badge style={{ background: "#fdf4ff", color: "#7e22ce" }}>✦ My word</Badge>
        )}
        {word.unit && (
          <Badge style={{ background: "#e0e7ff", color: "#4338ca" }}>
            {units.find(u => u.id === word.unit)?.label.split("—")[0].trim() ?? word.unit}
          </Badge>
        )}
        <Badge style={{ background: col.badge, color: col.accent }}>
          {CATEGORY_LABELS[word.category]}
        </Badge>
        {word.gender && (
          <Badge style={{ background: word.gender === "f" ? "#fce7f3" : word.gender === "m" ? "#eff6ff" : "#f5f3ff", color: word.gender === "f" ? "#9d174d" : word.gender === "m" ? "#1e40af" : "#5b21b6" }}>
            {word.gender === "m" ? "♂ masc." : word.gender === "f" ? "♀ fem." : "⚥ m/f"}
          </Badge>
        )}
        {word.transitive !== null && word.transitive !== undefined && (
          <Badge style={{ background: word.transitive ? "#fef9c3" : "#ecfdf5", color: word.transitive ? "#713f12" : "#064e3b" }}>
            {word.transitive ? "transitive (-ne)" : "intransitive"}
          </Badge>
        )}
      </div>

      {/* FRONT */}
      <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: "52px", fontFamily: "serif", lineHeight: 1.2, marginBottom: "8px", color: "#1e293b" }}>
          {word.devanagari}
        </div>
        <div style={{ fontSize: "20px", color: "#64748b", fontStyle: "italic", marginBottom: "4px" }}>
          {word.transliteration}
        </div>

        {/* BACK */}
        {showBack && (
          <div style={{ marginTop: "20px", width: "100%", borderTop: `1px solid ${col.accent}22`, paddingTop: "20px" }}>
            <div style={{ fontSize: "22px", fontWeight: 700, color: col.accent, marginBottom: "16px" }}>
              {word.meaning}
            </div>
            <div style={{ textAlign: "left" }}>
              {word.examples.map((ex, i) => (
                <div key={i} style={{ background: col.bg, borderRadius: "10px", padding: "10px 14px", marginBottom: "8px" }}>
                  <div style={{ fontSize: "16px", fontFamily: "serif", color: "#1e293b", marginBottom: "2px" }}>{ex.sentence}</div>
                  <div style={{ fontSize: "13px", fontStyle: "italic", color: "#64748b", marginBottom: "2px" }}>{ex.transliteration}</div>
                  <div style={{ fontSize: "13px", color: "#475569" }}>{ex.translation}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* tap hint */}
      {!showBack && (
        <div style={{ textAlign: "center", color: "#94a3b8", fontSize: "12px", marginTop: "16px" }}>
          tap to reveal →
        </div>
      )}
    </div>
  );
}

// ─── WORD MENU (⋮ dots on card) ──────────────────────────────────────────────
function WordMenu({ onEdit, onRemove, onGenerateExample }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "absolute", top: "14px", right: "14px", zIndex: 10 }}
      onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#94a3b8", padding: "4px 8px", borderRadius: "8px", lineHeight: 1 }}
        title="Options"
      >⋮</button>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 9 }} onClick={() => setOpen(false)} />
          <div style={{
            position: "absolute", right: 0, top: "32px", background: "#fff",
            borderRadius: "12px", boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
            minWidth: "140px", overflow: "hidden", zIndex: 10,
            border: "1px solid #e2e8f0",
          }}>
            {onGenerateExample && API_KEY_CONFIGURED && (
              <button onClick={() => { setOpen(false); onGenerateExample(); }} style={{
                display: "block", width: "100%", padding: "10px 16px", border: "none",
                background: "none", cursor: "pointer", textAlign: "left", fontSize: "14px",
                color: "#7c3aed", fontWeight: 500,
              }}>✦ New example</button>
            )}
            {onEdit && (
              <button onClick={() => { setOpen(false); onEdit(); }} style={{
                display: "block", width: "100%", padding: "10px 16px", border: "none",
                background: "none", cursor: "pointer", textAlign: "left", fontSize: "14px",
                color: "#1e293b", fontWeight: 500,
              }}>✏️ Edit entry</button>
            )}
            {onRemove && (
              <button onClick={() => { setOpen(false); onRemove(); }} style={{
                display: "block", width: "100%", padding: "10px 16px", border: "none",
                background: "none", cursor: "pointer", textAlign: "left", fontSize: "14px",
                color: "#dc2626", fontWeight: 500,
              }}>🗑 Remove from deck</button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── EDIT WORD PANEL ──────────────────────────────────────────────────────────
function EditWordPanel({ word, onSave, onClose, allUnits }) {
  const units = allUnits || UNITS;
  const [form, setForm] = useState({
    devanagari: word.devanagari || "",
    transliteration: word.transliteration || "",
    meaning: word.meaning || "",
    category: word.category || "other",
    gender: word.gender || "",
    transitive: word.transitive === true ? "true" : word.transitive === false ? "false" : "",
    unit: word.unit || "",
    examples: word.examples?.length ? word.examples : [
      { sentence: "", transliteration: "", translation: "" },
      { sentence: "", transliteration: "", translation: "" },
    ],
  });

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setExample = (i, k, v) => setForm(f => {
    const exs = f.examples.map((ex, idx) => idx === i ? { ...ex, [k]: v } : ex);
    return { ...f, examples: exs };
  });
  const addExample = () => setForm(f => ({ ...f, examples: [...f.examples, { sentence: "", transliteration: "", translation: "" }] }));
  const removeExample = (i) => setForm(f => ({ ...f, examples: f.examples.filter((_, idx) => idx !== i) }));

  const handleSave = () => {
    const updated = {
      ...word,
      devanagari: form.devanagari.trim(),
      transliteration: form.transliteration.trim(),
      meaning: form.meaning.trim(),
      category: form.category,
      gender: form.category === "noun" ? (form.gender || null) : null,
      transitive: form.category === "verb"
        ? (form.transitive === "true" ? true : form.transitive === "false" ? false : null)
        : null,
      unit: form.unit || null,
      examples: form.examples.filter(ex => ex.sentence.trim()),
    };
    onSave(updated);
  };

  const inputStyle = {
    width: "100%", padding: "8px 12px", borderRadius: "8px",
    border: "1.5px solid #e2e8f0", fontSize: "14px", boxSizing: "border-box",
    outline: "none", color: "#1e293b", background: "#fafafa",
  };
  const labelStyle = { fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "4px", display: "block" };
  const fieldStyle = { marginBottom: "14px" };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: "#fff", borderRadius: "20px", padding: "28px 24px", width: "100%",
        maxWidth: "520px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#1e293b" }}>✏️ Edit Entry</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#94a3b8" }}>×</button>
        </div>

        {/* Core fields */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Devanagari</label>
          <input value={form.devanagari} onChange={e => setField("devanagari", e.target.value)}
            style={{ ...inputStyle, fontSize: "22px", fontFamily: "serif" }} />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Transliteration</label>
          <input value={form.transliteration} onChange={e => setField("transliteration", e.target.value)} style={inputStyle} />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Meaning</label>
          <input value={form.meaning} onChange={e => setField("meaning", e.target.value)} style={inputStyle} />
        </div>

        {/* Category + gender/transitivity */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
          <div>
            <label style={labelStyle}>Category</label>
            <select value={form.category} onChange={e => setField("category", e.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="noun">Noun</option>
              <option value="verb">Verb</option>
              <option value="other">Other / Expression</option>
            </select>
          </div>
          {form.category === "noun" && (
            <div>
              <label style={labelStyle}>Gender</label>
              <select value={form.gender} onChange={e => setField("gender", e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="">— unset —</option>
                <option value="m">♂ Masculine</option>
                <option value="f">♀ Feminine</option>
                <option value="m/f">⚥ Both</option>
              </select>
            </div>
          )}
          {form.category === "verb" && (
            <div>
              <label style={labelStyle}>Transitivity</label>
              <select value={form.transitive} onChange={e => setField("transitive", e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="">— unset —</option>
                <option value="true">Transitive (ने)</option>
                <option value="false">Intransitive</option>
              </select>
            </div>
          )}
        </div>

        {/* Deck assignment */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Deck</label>
          <select value={form.unit} onChange={e => setField("unit", e.target.value)}
            style={{ ...inputStyle, cursor: "pointer" }}>
            <option value="">— No deck —</option>
            {units.map(u => (
              <option key={u.id} value={u.id}>{u.label.split("—")[0].trim()}</option>
            ))}
          </select>
        </div>

        {/* Examples */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <label style={{ ...labelStyle, margin: 0 }}>Example sentences</label>
            <button onClick={addExample} style={{
              background: "#f1f5f9", border: "none", borderRadius: "6px", padding: "3px 10px",
              cursor: "pointer", fontSize: "12px", color: "#475569", fontWeight: 600,
            }}>+ Add</button>
          </div>
          {form.examples.map((ex, i) => (
            <div key={i} style={{ background: "#f8fafc", borderRadius: "10px", padding: "12px", marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8" }}>Example {i + 1}</span>
                {form.examples.length > 1 && (
                  <button onClick={() => removeExample(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#f87171", fontSize: "14px" }}>✕</button>
                )}
              </div>
              <input placeholder="Hindi sentence (Devanagari)…" value={ex.sentence}
                onChange={e => setExample(i, "sentence", e.target.value)}
                style={{ ...inputStyle, fontFamily: "serif", fontSize: "15px", marginBottom: "6px" }} />
              <input placeholder="Transliteration…" value={ex.transliteration}
                onChange={e => setExample(i, "transliteration", e.target.value)}
                style={{ ...inputStyle, fontStyle: "italic", marginBottom: "6px" }} />
              <input placeholder="English translation…" value={ex.translation}
                onChange={e => setExample(i, "translation", e.target.value)}
                style={inputStyle} />
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "11px", borderRadius: "10px", border: "1.5px solid #e2e8f0",
            background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: "14px", color: "#475569",
          }}>Cancel</button>
          <button onClick={handleSave} style={{
            flex: 2, padding: "11px", borderRadius: "10px", border: "none",
            background: "#6366f1", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: "14px",
          }}>Save changes</button>
        </div>
      </div>
    </div>
  );
}

// ─── ADD WORD PANEL ───────────────────────────────────────────────────────────
function AddWordPanel({ onAdd, onClose }) {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [preview, setPreview] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const generate = async () => {
    const word = input.trim();
    if (!word) return;
    setStatus("loading");
    setPreview(null);
    setErrorMsg("");

    const prompt = `You are a Hindi language expert. The user has entered a Hindi word or phrase: "${word}"

Analyse it and return a JSON object with these exact fields:
- "devanagari": the word in Devanagari script (correct it if needed)
- "transliteration": IAST-style romanisation
- "meaning": concise English meaning (include all main senses, separated by " / ")
- "category": one of "noun", "verb", or "other" (use "other" for adjectives, pronouns, particles, expressions)
- "gender": for nouns only — "m", "f", or "m/f". Omit (null) for verbs and other.
- "transitive": for verbs only — true if transitive, false if intransitive, null if mixed/auxiliary. Omit (null) for nouns and other.
- "unit": null (leave null, the user can assign a chapter later)
- "examples": array of exactly 2 objects, each with:
    - "sentence": a natural Hindi example sentence in Devanagari using this word
    - "transliteration": romanised version of that sentence
    - "translation": English translation, noting tense in parentheses e.g. "(past)" or "(present)"

Return ONLY the raw JSON object. No markdown, no backticks, no explanation.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const raw = data.content?.find(b => b.type === "text")?.text || "";
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      // Assign a unique id
      parsed.id = "custom_" + Date.now();
      setPreview(parsed);
      setStatus("done");
    } catch (e) {
      setErrorMsg("Couldn't generate the entry. Please check the word and try again.");
      setStatus("error");
    }
  };

  const col = preview ? CATEGORY_COLORS[preview.category] || CATEGORY_COLORS.other : CATEGORY_COLORS.other;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: "#fff", borderRadius: "20px", padding: "28px 24px", width: "100%", maxWidth: "500px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#1e293b" }}>✨ Add a Word</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#94a3b8" }}>×</button>
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <input
            value={input}
            onChange={e => { setInput(e.target.value); setStatus("idle"); setPreview(null); }}
            onKeyDown={e => e.key === "Enter" && generate()}
            placeholder="Type a Hindi word (e.g. किताब or kitāb)…"
            style={{
              flex: 1, padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #e2e8f0",
              fontSize: "16px", fontFamily: "serif, system-ui", outline: "none", color: "#1e293b",
            }}
            autoFocus
          />
          <button onClick={generate} disabled={status === "loading" || !input.trim()} style={{
            padding: "10px 18px", borderRadius: "10px", border: "none", cursor: "pointer",
            background: "#6366f1", color: "#fff", fontWeight: 700, fontSize: "14px",
            opacity: status === "loading" || !input.trim() ? 0.5 : 1,
          }}>
            {status === "loading" ? "…" : "Generate"}
          </button>
        </div>

        {status === "loading" && (
          <div style={{ textAlign: "center", padding: "24px", color: "#6366f1", fontSize: "14px" }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>⟳</div>
            Analysing word with AI…
          </div>
        )}

        {status === "error" && (
          <div style={{ background: "#fef2f2", borderRadius: "10px", padding: "14px", color: "#b91c1c", fontSize: "14px" }}>
            {errorMsg}
          </div>
        )}

        {preview && status === "done" && (
          <div>
            <div style={{ background: col.bg, borderRadius: "14px", padding: "20px", marginBottom: "16px" }}>
              {/* Badges */}
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" }}>
                <Badge style={{ background: col.badge, color: col.accent }}>{CATEGORY_LABELS[preview.category] || preview.category}</Badge>
                {preview.gender && (
                  <Badge style={{ background: preview.gender === "f" ? "#fce7f3" : "#eff6ff", color: preview.gender === "f" ? "#9d174d" : "#1e40af" }}>
                    {preview.gender === "m" ? "♂ masc." : preview.gender === "f" ? "♀ fem." : "⚥ m/f"}
                  </Badge>
                )}
                {preview.transitive === true && <Badge style={{ background: "#fef9c3", color: "#713f12" }}>transitive (-ne)</Badge>}
                {preview.transitive === false && <Badge style={{ background: "#ecfdf5", color: "#064e3b" }}>intransitive</Badge>}
              </div>
              {/* Word */}
              <div style={{ fontSize: "42px", fontFamily: "serif", color: "#1e293b", lineHeight: 1.2 }}>{preview.devanagari}</div>
              <div style={{ fontSize: "17px", fontStyle: "italic", color: "#64748b", marginBottom: "10px" }}>{preview.transliteration}</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: col.accent, marginBottom: "14px" }}>{preview.meaning}</div>
              {/* Examples */}
              {preview.examples?.map((ex, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: "8px", padding: "10px 12px", marginBottom: "6px" }}>
                  <div style={{ fontSize: "15px", fontFamily: "serif", color: "#1e293b", marginBottom: "2px" }}>{ex.sentence}</div>
                  <div style={{ fontSize: "12px", fontStyle: "italic", color: "#64748b", marginBottom: "2px" }}>{ex.transliteration}</div>
                  <div style={{ fontSize: "12px", color: "#475569" }}>{ex.translation}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => { setPreview(null); setStatus("idle"); }} style={{
                flex: 1, padding: "10px", borderRadius: "10px", border: "1.5px solid #e2e8f0",
                background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: "14px", color: "#475569",
              }}>Regenerate</button>
              <button onClick={() => { onAdd(preview); onClose(); }} style={{
                flex: 2, padding: "10px", borderRadius: "10px", border: "none",
                background: "#6366f1", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: "14px",
              }}>+ Add to deck</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── GENERATE EXAMPLE PANEL ───────────────────────────────────────────────────
const DEFAULT_PROMPTS = {
  noun: (w) =>
    `Show "${w.devanagari}" used in its ${w.gender === "f" ? "feminine" : w.gender === "m" ? "masculine" : "gender"} form. Include either an oblique case, a plural, or a genitive construction (X का/की/के) so the gender inflection is visible.`,
  verb: (w) =>
    w.transitive
      ? `Show "${w.devanagari}" in the perfect tense using the ने construction (transitive past).`
      : `Show "${w.devanagari}" in the simple past tense (intransitive).`,
  other: (w) =>
    `Show "${w.devanagari}" used naturally in a short conversational sentence.`,
};

function GenerateExamplePanel({ word, onAdd, onClose }) {
  const col = CATEGORY_COLORS[word.category] || CATEGORY_COLORS.other;
  const defaultPrompt = (DEFAULT_PROMPTS[word.category] || DEFAULT_PROMPTS.other)(word);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const generate = async () => {
    setStatus("loading");
    setResult(null);
    setErrorMsg("");

    const systemPrompt = `You are a Hindi language expert. Generate exactly one example sentence for this word.

Word: ${word.devanagari} (${word.transliteration}) — ${word.meaning}
Category: ${word.category}${word.gender ? `, gender: ${word.gender}` : ""}${word.transitive != null ? `, ${word.transitive ? "transitive" : "intransitive"}` : ""}

Focus: ${prompt}

Return ONLY a JSON object with exactly these fields:
{
  "sentence": "the Hindi sentence in Devanagari",
  "transliteration": "IAST romanisation of the sentence",
  "translation": "English translation with tense noted in parentheses e.g. (past) or (present)"
}
No markdown, no backticks, no explanation.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 400,
          messages: [{ role: "user", content: systemPrompt }],
        }),
      });
      const data = await res.json();
      const raw = data.content?.find(b => b.type === "text")?.text || "";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setResult(parsed);
      setStatus("done");
    } catch {
      setErrorMsg("Couldn't generate an example. Check the word and try again.");
      setStatus("error");
    }
  };

  const inputStyle = {
    width: "100%", padding: "8px 12px", borderRadius: "8px",
    border: "1.5px solid #e2e8f0", fontSize: "14px", boxSizing: "border-box",
    outline: "none", color: "#1e293b", background: "#fafafa",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: "#fff", borderRadius: "20px", padding: "28px 24px", width: "100%", maxWidth: "500px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#1e293b" }}>✦ New example</h2>
            <div style={{ fontSize: "14px", color: "#64748b", marginTop: "2px" }}>
              <span style={{ fontFamily: "serif", fontSize: "16px", color: col.accent }}>{word.devanagari}</span>
              {" — "}{word.meaning}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#94a3b8" }}>×</button>
        </div>

        {/* Prompt */}
        <div style={{ marginBottom: "14px" }}>
          <label style={{ fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "6px", display: "block" }}>
            Focus (edit to customise)
          </label>
          <textarea
            value={prompt}
            onChange={e => { setPrompt(e.target.value); setStatus("idle"); setResult(null); }}
            rows={3}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
          />
        </div>

        <button
          onClick={generate}
          disabled={status === "loading" || !prompt.trim()}
          style={{
            width: "100%", padding: "10px", borderRadius: "10px", border: "none",
            background: status === "loading" || !prompt.trim() ? "#e2e8f0" : "#7c3aed",
            color: status === "loading" || !prompt.trim() ? "#94a3b8" : "#fff",
            cursor: status === "loading" || !prompt.trim() ? "default" : "pointer",
            fontWeight: 700, fontSize: "14px", marginBottom: "14px",
          }}
        >
          {status === "loading" ? "Generating…" : "Generate"}
        </button>

        {/* Error */}
        {status === "error" && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "10px 14px", marginBottom: "14px", color: "#dc2626", fontSize: "13px" }}>
            {errorMsg}
          </div>
        )}

        {/* Result */}
        {result && (
          <div style={{ background: col.bg, borderRadius: "12px", padding: "14px 16px", marginBottom: "16px", border: `1px solid ${col.accent}22` }}>
            <div style={{ fontSize: "17px", fontFamily: "serif", color: "#1e293b", marginBottom: "4px" }}>{result.sentence}</div>
            <div style={{ fontSize: "13px", fontStyle: "italic", color: "#64748b", marginBottom: "4px" }}>{result.transliteration}</div>
            <div style={{ fontSize: "13px", color: "#475569" }}>{result.translation}</div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "10px", borderRadius: "10px", border: "1.5px solid #e2e8f0",
            background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: "14px", color: "#475569",
          }}>
            {result ? "Discard" : "Cancel"}
          </button>
          {result && (
            <button onClick={() => { onAdd(result); onClose(); }} style={{
              flex: 2, padding: "10px", borderRadius: "10px", border: "none",
              background: "#7c3aed", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: "14px",
            }}>+ Add to card</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MANAGE DECKS PANEL ───────────────────────────────────────────────────────
function ManageDecksPanel({ allUnits, allWords, onRename, onCreate, onDelete, onClose }) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingLabel, setEditingLabel] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const wordCount = (unitId) => allWords.filter(w => w.unit === unitId).length;

  const startEdit = (u) => { setEditingId(u.id); setEditingLabel(u.label.split("—")[0].trim()); };
  const saveEdit = () => {
    if (editingLabel.trim()) onRename(editingId, editingLabel.trim());
    setEditingId(null);
  };
  const handleCreate = () => {
    if (!newName.trim()) return;
    onCreate(newName.trim());
    setNewName("");
  };

  const inputStyle = {
    padding: "7px 10px", borderRadius: "8px", border: "1.5px solid #e2e8f0",
    fontSize: "14px", outline: "none", color: "#1e293b", background: "#fafafa",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: "#fff", borderRadius: "20px", padding: "28px 24px", width: "100%", maxWidth: "480px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#1e293b" }}>Manage Decks</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#94a3b8" }}>×</button>
        </div>

        <div style={{ marginBottom: "20px" }}>
          {allUnits.map(u => {
            const count = wordCount(u.id);
            const isEditing = editingId === u.id;
            const isConfirming = confirmDelete === u.id;
            return (
              <div key={u.id} style={{
                padding: "10px 12px", borderRadius: "10px", marginBottom: "6px",
                background: "#f8fafc", border: "1.5px solid #e2e8f0",
              }}>
                {isConfirming ? (
                  <div>
                    <div style={{ fontSize: "13px", color: "#ef4444", marginBottom: "8px", fontWeight: 600 }}>
                      Delete "{u.label.split("—")[0].trim()}"?
                      {count > 0 ? ` ${count} word${count !== 1 ? "s" : ""} will become unassigned.` : ""}
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button onClick={() => { onDelete(u.id); setConfirmDelete(null); }} style={{
                        padding: "5px 14px", borderRadius: "7px", border: "none",
                        background: "#ef4444", color: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: 600,
                      }}>Delete</button>
                      <button onClick={() => setConfirmDelete(null)} style={{
                        padding: "5px 14px", borderRadius: "7px", border: "1.5px solid #e2e8f0",
                        background: "#fff", cursor: "pointer", fontSize: "13px", color: "#475569",
                      }}>Cancel</button>
                    </div>
                  </div>
                ) : isEditing ? (
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <input
                      value={editingLabel}
                      onChange={e => setEditingLabel(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditingId(null); }}
                      style={{ ...inputStyle, flex: 1 }}
                      autoFocus
                    />
                    <button onClick={saveEdit} style={{
                      padding: "6px 14px", borderRadius: "7px", border: "none",
                      background: "#6366f1", color: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: 600,
                    }}>Save</button>
                    <button onClick={() => setEditingId(null)} style={{
                      padding: "6px 10px", borderRadius: "7px", border: "1.5px solid #e2e8f0",
                      background: "#fff", cursor: "pointer", fontSize: "13px", color: "#475569",
                    }}>✕</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ flex: 1, fontSize: "14px", fontWeight: 600, color: "#1e293b" }}>
                      {u.label.split("—")[0].trim()}
                      {u.label.includes("—") && (
                        <span style={{ fontWeight: 400, color: "#94a3b8" }}> — {u.label.split("—").slice(1).join("—").trim()}</span>
                      )}
                    </span>
                    <span style={{ fontSize: "12px", color: "#94a3b8", whiteSpace: "nowrap" }}>
                      {count} word{count !== 1 ? "s" : ""}
                    </span>
                    {u.isBuiltIn && (
                      <span style={{ fontSize: "10px", color: "#cbd5e1", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>built-in</span>
                    )}
                    <button onClick={() => startEdit(u)} style={{
                      background: "none", border: "none", cursor: "pointer", fontSize: "13px",
                      color: "#94a3b8", padding: "2px 6px", borderRadius: "4px",
                    }} title="Rename">✏️</button>
                    {!u.isBuiltIn && (
                      <button onClick={() => setConfirmDelete(u.id)} style={{
                        background: "none", border: "none", cursor: "pointer", fontSize: "13px",
                        color: "#f87171", padding: "2px 6px", borderRadius: "4px",
                      }} title="Delete deck">🗑</button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "16px", marginBottom: "16px" }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#64748b", marginBottom: "8px" }}>Create a new deck</div>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleCreate()}
              placeholder="Deck name…"
              style={{ ...inputStyle, flex: 1 }}
            />
            <button onClick={handleCreate} disabled={!newName.trim()} style={{
              padding: "7px 18px", borderRadius: "8px", border: "none",
              background: newName.trim() ? "#6366f1" : "#e2e8f0",
              color: newName.trim() ? "#fff" : "#94a3b8",
              cursor: newName.trim() ? "pointer" : "default",
              fontWeight: 700, fontSize: "14px",
            }}>+ Create</button>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <button onClick={onClose} style={{
            padding: "9px 20px", borderRadius: "10px", border: "1.5px solid #e2e8f0",
            background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: "14px", color: "#475569",
          }}>Done</button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function HindiFlashcards() {
  const [filter, setFilter] = useState("all");
  const [unitFilter, setUnitFilter] = useState("all");
  const [customWords, setCustomWords] = useState([]);
  const [removedIds, setRemovedIds] = useState(new Set());
  const [overrides, setOverrides] = useState({});
  const [customUnits, setCustomUnits] = useState([]);
  const [unitLabels, setUnitLabels] = useState({});
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showManageDecks, setShowManageDecks] = useState(false);
  const [generatingExampleFor, setGeneratingExampleFor] = useState(null);
  const [storageReady, setStorageReady] = useState(false);

  // Load all persisted data on mount
  useEffect(() => {
    (async () => {
      try {
        const [cw, ri, ov, cu, ul] = await Promise.allSettled([
          storage.get("custom_words"),
          storage.get("removed_ids"),
          storage.get("word_overrides"),
          storage.get("custom_units"),
          storage.get("unit_labels"),
        ]);
        if (cw.status === "fulfilled" && cw.value?.value)
          setCustomWords(JSON.parse(cw.value.value));
        if (ri.status === "fulfilled" && ri.value?.value)
          setRemovedIds(new Set(JSON.parse(ri.value.value)));
        if (ov.status === "fulfilled" && ov.value?.value)
          setOverrides(JSON.parse(ov.value.value));
        if (cu.status === "fulfilled" && cu.value?.value)
          setCustomUnits(JSON.parse(cu.value.value));
        if (ul.status === "fulfilled" && ul.value?.value)
          setUnitLabels(JSON.parse(ul.value.value));
      } finally {
        setStorageReady(true);
      }
    })();
  }, []);

  const allWords = useMemo(() => {
    const base = [...ALL_WORDS, ...customWords];
    return base
      .filter(w => !removedIds.has(w.id))
      .map(w => overrides[w.id] ? { ...w, ...overrides[w.id] } : w);
  }, [customWords, removedIds, overrides]);

  const allUnits = useMemo(() => [
    ...UNITS.map(u => ({ ...u, label: unitLabels[u.id] ?? u.label, isBuiltIn: true })),
    ...customUnits.map(u => ({ ...u, isBuiltIn: false })),
  ], [customUnits, unitLabels]);

  const renameUnit = async (id, label) => {
    if (UNITS.some(u => u.id === id)) {
      const updated = { ...unitLabels, [id]: label };
      setUnitLabels(updated);
      try { await storage.set("unit_labels", JSON.stringify(updated)); } catch (_) {}
    } else {
      const updated = customUnits.map(u => u.id === id ? { ...u, label } : u);
      setCustomUnits(updated);
      try { await storage.set("custom_units", JSON.stringify(updated)); } catch (_) {}
    }
  };

  const createUnit = async (label) => {
    const id = "cu_" + Date.now();
    const updated = [...customUnits, { id, label }];
    setCustomUnits(updated);
    try { await storage.set("custom_units", JSON.stringify(updated)); } catch (_) {}
  };

  const deleteUnit = async (id) => {
    const updatedUnits = customUnits.filter(u => u.id !== id);
    setCustomUnits(updatedUnits);
    try { await storage.set("custom_units", JSON.stringify(updatedUnits)); } catch (_) {}

    const updatedWords = customWords.map(w => w.unit === id ? { ...w, unit: null } : w);
    setCustomWords(updatedWords);
    try { await storage.set("custom_words", JSON.stringify(updatedWords)); } catch (_) {}

    const updatedOverrides = Object.fromEntries(
      Object.entries(overrides).map(([wid, ov]) => [wid, ov.unit === id ? { ...ov, unit: null } : ov])
    );
    setOverrides(updatedOverrides);
    try { await storage.set("word_overrides", JSON.stringify(updatedOverrides)); } catch (_) {}

    if (unitFilter === id) setUnitFilter("all");
  };

  const [deck, setDeck] = useState(() => shuffle(ALL_WORDS));
  const [index, setIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [known, setKnown] = useState(new Set());
  const [learning, setLearning] = useState(new Set());
  const [view, setView] = useState("cards"); // "cards" | "list"
  const [searchQ, setSearchQ] = useState("");

  const filtered = useMemo(() => {
    let base = allWords;
    if (unitFilter !== "all") {
      base = base.filter(w => w.unit === unitFilter);
    } else if (filter !== "all") {
      base = base.filter(w => w.category === filter);
    }
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      base = base.filter(w =>
        w.devanagari.includes(q) ||
        w.transliteration.toLowerCase().includes(q) ||
        w.meaning.toLowerCase().includes(q)
      );
    }
    return base;
  }, [allWords, filter, unitFilter, searchQ]);

  useEffect(() => {
    setDeck(shuffle(filtered));
    setIndex(0);
    setShowBack(false);
  }, [filtered]);

  const current = deck[index];
  const handleFlip = () => setShowBack(v => !v);

  const nav = useCallback((dir) => {
    setShowBack(false);
    setIndex(i => {
      const n = i + dir;
      if (n < 0) return deck.length - 1;
      if (n >= deck.length) return 0;
      return n;
    });
  }, [deck.length]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight") nav(1);
      if (e.key === "ArrowLeft") nav(-1);
      if (e.key === " ") { e.preventDefault(); handleFlip(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [nav]);

  const [editingWord, setEditingWord] = useState(null);

  const removeWord = async (word) => {
    if (word.id.startsWith("custom_")) {
      // Remove from customWords
      const updated = customWords.filter(w => w.id !== word.id);
      setCustomWords(updated);
      try { await storage.set("custom_words", JSON.stringify(updated)); } catch (_) {}
    } else {
      // Hide a built-in word via a "removed" set persisted in storage
      const updated = [...removedIds, word.id];
      setRemovedIds(new Set(updated));
      try { await storage.set("removed_ids", JSON.stringify(updated)); } catch (_) {}
    }
    // Advance deck if we just removed the current card
    setDeck(prev => {
      const next = prev.filter(w => w.id !== word.id);
      setIndex(i => Math.min(i, Math.max(0, next.length - 1)));
      return next;
    });
  };

  const saveEdit = async (updated) => {
    if (updated.id.startsWith("custom_")) {
      const newList = customWords.map(w => w.id === updated.id ? updated : w);
      setCustomWords(newList);
      try { await storage.set("custom_words", JSON.stringify(newList)); } catch (_) {}
    } else {
      // Store overrides for built-in words
      const newOverrides = { ...overrides, [updated.id]: updated };
      setOverrides(newOverrides);
      try { await storage.set("word_overrides", JSON.stringify(newOverrides)); } catch (_) {}
    }
    setEditingWord(null);
  };

  const addExample = (word, example) => {
    saveEdit({ ...word, examples: [...(word.examples || []), example] });
  };

  const markKnown = () => {
    setKnown(s => { const n = new Set(s); n.add(current.id); return n; });
    setLearning(s => { const n = new Set(s); n.delete(current.id); return n; });
    nav(1);
  };
  const markLearning = () => {
    setLearning(s => { const n = new Set(s); n.add(current.id); return n; });
    setKnown(s => { const n = new Set(s); n.delete(current.id); return n; });
    nav(1);
  };

  const stats = {
    total: filtered.length,
    known: [...known].filter(id => filtered.some(w => w.id === id)).length,
    learning: [...learning].filter(id => filtered.some(w => w.id === id)).length,
    grandTotal: allWords.length,
  };

  if (!storageReady) {
    return (
      <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: "680px", margin: "40px auto", padding: "16px", textAlign: "center", color: "#94a3b8" }}>
        Loading your words…
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", maxWidth: "680px", margin: "0 auto", padding: "16px" }}>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "4px" }}>
          <h1 style={{ fontSize: "26px", fontWeight: 800, margin: 0, color: "#1e293b" }}>हिंदी</h1>
          <span style={{ fontSize: "16px", color: "#64748b" }}>Hindi Flashcards</span>
          <span style={{ fontSize: "13px", color: "#94a3b8" }}>({stats.grandTotal} words)</span>
        </div>
        <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "#94a3b8" }}>
          <span>✓ {stats.known} known</span>
          <span>↺ {stats.learning} learning</span>
          <span>◎ {stats.total - stats.known - stats.learning} unseen</span>
          {unitFilter !== "all" && <span style={{ color: "#6366f1", fontWeight: 600 }}>● {allUnits.find(u => u.id === unitFilter)?.label}</span>}
        </div>
      </div>

      {/* Category filter row */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
        {[
          { key: "all", label: `All (${WORDS.length})` },
          { key: "noun", label: `Nouns` },
          { key: "verb", label: `Verbs` },
          { key: "other", label: `Expressions` },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => { setFilter(key); setUnitFilter("all"); }} style={{
            padding: "6px 14px", borderRadius: "20px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600,
            background: unitFilter === "all" && filter === key ? "#6366f1" : "#f1f5f9",
            color: unitFilter === "all" && filter === key ? "#fff" : "#475569",
            transition: "all 0.15s",
          }}>{label}</button>
        ))}
        <button onClick={() => setView(v => v === "cards" ? "list" : "cards")} style={{
          marginLeft: "auto", padding: "6px 14px", borderRadius: "20px", border: "1.5px solid #e2e8f0",
          background: "#fff", cursor: "pointer", fontSize: "13px", color: "#475569", fontWeight: 600,
        }}>
          {view === "cards" ? "≡ List" : "⊟ Cards"}
        </button>
        {API_KEY_CONFIGURED && (
          <button onClick={() => setShowAddPanel(true)} style={{
            padding: "6px 14px", borderRadius: "20px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600,
            background: "#6366f1", color: "#fff",
          }}>
            + Add word
          </button>
        )}
      </div>

      {/* Unit filter row */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #f1f5f9", alignItems: "center" }}>
        <button onClick={() => setUnitFilter("all")} style={{
          padding: "4px 12px", borderRadius: "20px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 600,
          background: unitFilter === "all" ? "#e0e7ff" : "#f8fafc",
          color: unitFilter === "all" ? "#4338ca" : "#94a3b8",
        }}>All decks</button>
        {allUnits.map(u => {
          const short = u.label.split("—")[0].trim();
          const display = short.length > 14 ? short.slice(0, 12) + "…" : short;
          return (
            <button key={u.id} onClick={() => { setUnitFilter(u.id); setFilter("all"); }} style={{
              padding: "4px 12px", borderRadius: "20px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 600,
              background: unitFilter === u.id ? "#6366f1" : "#f8fafc",
              color: unitFilter === u.id ? "#fff" : "#64748b",
              transition: "all 0.15s",
            }}>{display}</button>
          );
        })}
        <button onClick={() => setShowManageDecks(true)} style={{
          marginLeft: "auto", padding: "4px 10px", borderRadius: "20px", border: "1.5px solid #e2e8f0",
          background: "#fff", cursor: "pointer", fontSize: "12px", color: "#64748b", fontWeight: 600,
        }} title="Manage decks">⚙ Manage</button>
      </div>

      {/* Search */}
      <input
        value={searchQ}
        onChange={e => setSearchQ(e.target.value)}
        placeholder="Search Devanagari, transliteration, or meaning…"
        style={{
          width: "100%", padding: "8px 14px", borderRadius: "10px", border: "1.5px solid #e2e8f0",
          fontSize: "14px", marginBottom: "16px", boxSizing: "border-box", outline: "none",
          background: "#fafafa", color: "#1e293b",
        }}
      />

      {view === "cards" && current ? (
        <>
          <ProgressBar current={index + 1} total={deck.length} />
          <FlashCard
            word={current}
            showBack={showBack}
            onFlip={handleFlip}
            onEdit={() => setEditingWord(current)}
            onRemove={() => removeWord(current)}
            onGenerateExample={() => setGeneratingExampleFor(current)}
            allUnits={allUnits}
          />

          {/* Navigation */}
          <div style={{ display: "flex", gap: "10px", marginTop: "16px", alignItems: "center", justifyContent: "center" }}>
            <button onClick={() => nav(-1)} style={{ ...btnStyle, background: "#f1f5f9", color: "#475569" }}>← Prev</button>
            <button onClick={markLearning} style={{ ...btnStyle, background: "#fef9c3", color: "#713f12" }}>↺ Learning</button>
            <button onClick={markKnown} style={{ ...btnStyle, background: "#dcfce7", color: "#14532d" }}>✓ Know it</button>
            <button onClick={() => nav(1)} style={{ ...btnStyle, background: "#f1f5f9", color: "#475569" }}>Next →</button>
          </div>
          <div style={{ textAlign: "center", fontSize: "11px", color: "#94a3b8", marginTop: "8px" }}>
            Space = flip · ← → = navigate
          </div>
        </>
      ) : view === "list" ? (
        <div>
          {filtered.map(word => {
            const col = CATEGORY_COLORS[word.category];
            const isKnown = known.has(word.id);
            const isLearning = learning.has(word.id);
            return (
              <div key={word.id} style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: "8px 12px",
                padding: "10px 14px", borderRadius: "10px", marginBottom: "6px",
                background: isKnown ? "#f0fdf4" : isLearning ? "#fffbeb" : "#fafafa",
                border: `1px solid ${isKnown ? "#bbf7d0" : isLearning ? "#fde68a" : "#e2e8f0"}`,
                alignItems: "center", fontSize: "14px",
              }}>
                <div>
                  <span style={{ fontSize: "20px", fontFamily: "serif", marginRight: "6px" }}>{word.devanagari}</span>
                  <span style={{ color: "#94a3b8", fontSize: "12px" }}>{word.transliteration}</span>
                </div>
                <div style={{ color: "#475569" }}>{word.meaning}</div>
                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", alignItems: "center" }}>
                  {word.id?.startsWith("custom_") && (
                    <Badge style={{ background: "#fdf4ff", color: "#7e22ce" }}>✦ My word</Badge>
                  )}
                  <Badge style={{ background: col.badge, color: col.accent }}>{CATEGORY_LABELS[word.category]}</Badge>
                  {word.gender && <Badge style={{ background: "#eff6ff", color: "#1e40af" }}>{word.gender}</Badge>}
                  {word.transitive === true && <Badge style={{ background: "#fef9c3", color: "#713f12" }}>trans.</Badge>}
                  {word.transitive === false && <Badge style={{ background: "#ecfdf5", color: "#064e3b" }}>intrans.</Badge>}
                  <div style={{ marginLeft: "auto", display: "flex", gap: "4px" }}>
                    <button onClick={e => { e.stopPropagation(); setEditingWord(word); }} style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "#94a3b8", fontSize: "14px", padding: "2px 6px", borderRadius: "4px",
                    }} title="Edit">✏️</button>
                    <button onClick={e => { e.stopPropagation(); removeWord(word); }} style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "#f87171", fontSize: "14px", padding: "2px 6px", borderRadius: "4px",
                    }} title="Remove from deck">🗑</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>No words found.</div>
      )}

      {/* Reshuffle */}
      {view === "cards" && (
        <div style={{ textAlign: "center", marginTop: "12px" }}>
          <button onClick={() => { setDeck(shuffle(filtered)); setIndex(0); setShowBack(false); }} style={{
            background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: "#94a3b8", textDecoration: "underline",
          }}>
            Reshuffle deck
          </button>
        </div>
      )}

      {/* Add Word Panel */}
      {showAddPanel && (
        <AddWordPanel
          onAdd={async word => {
            const updated = [...customWords, word];
            setCustomWords(updated);
            try {
              await storage.set("custom_words", JSON.stringify(updated));
            } catch (e) {
              console.error("Storage save failed:", e);
            }
          }}
          onClose={() => setShowAddPanel(false)}
        />
      )}

      {/* Edit Word Panel */}
      {editingWord && (
        <EditWordPanel
          word={editingWord}
          onSave={saveEdit}
          onClose={() => setEditingWord(null)}
          allUnits={allUnits}
        />
      )}

      {/* Generate Example Panel */}
      {generatingExampleFor && (
        <GenerateExamplePanel
          word={generatingExampleFor}
          onAdd={example => addExample(generatingExampleFor, example)}
          onClose={() => setGeneratingExampleFor(null)}
        />
      )}

      {/* Manage Decks Panel */}
      {showManageDecks && (
        <ManageDecksPanel
          allUnits={allUnits}
          allWords={allWords}
          onRename={renameUnit}
          onCreate={createUnit}
          onDelete={deleteUnit}
          onClose={() => setShowManageDecks(false)}
        />
      )}
    </div>
  );
}

const btnStyle = {
  padding: "8px 16px", borderRadius: "10px", border: "none", cursor: "pointer",
  fontSize: "13px", fontWeight: 600, transition: "opacity 0.15s",
};
