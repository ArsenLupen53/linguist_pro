/* ========================================
   Linguist Pro — Web Word Fetcher
   CEFR seviyelerine göre kelimeleri
   Free Dictionary API + MyMemory API'den çeker
   ======================================== */

const fs = require('fs');
const https = require('https');
const http = require('http');

// ─── CEFR Kelime Listeleri ──────────────────────────────────────
const WORD_LISTS = {
    A1: [
        'apple', 'book', 'cat', 'dog', 'eat', 'family', 'good', 'house', 'water', 'happy',
        'school', 'friend', 'big', 'small', 'run', 'work', 'car', 'time', 'new', 'old',
        'mother', 'father', 'beautiful', 'help', 'open', 'close', 'music', 'food', 'child', 'cold',
        'hot', 'sleep', 'morning', 'night', 'color', 'head', 'hand', 'eye', 'ear', 'nose',
        'mouth', 'leg', 'arm', 'red', 'blue', 'green', 'yellow', 'black', 'white', 'brother',
        'sister', 'baby', 'man', 'woman', 'boy', 'girl', 'teacher', 'doctor', 'bus', 'train',
        'phone', 'bed', 'garden', 'tree', 'flower', 'rain', 'sun', 'name', 'city', 'street',
        'table', 'chair', 'door', 'window', 'room', 'milk', 'bread', 'egg', 'rice', 'chicken',
        'fish', 'meat', 'sugar', 'salt', 'cup', 'plate', 'bag', 'shoe', 'shirt', 'hat',
        'money', 'shop', 'market', 'park', 'beach', 'mountain', 'river', 'lake', 'sky', 'star'
    ],
    A2: [
        'address', 'airport', 'alive', 'angry', 'answer', 'apartment', 'arrive', 'bath', 'birthday', 'blanket',
        'boring', 'brave', 'bridge', 'brush', 'build', 'burn', 'butter', 'calendar', 'camera', 'candle',
        'careful', 'century', 'cheap', 'cheese', 'choose', 'church', 'circle', 'clean', 'climb', 'cloud',
        'coat', 'coin', 'collect', 'comfortable', 'communicate', 'compare', 'complain', 'computer', 'control', 'cook',
        'copy', 'corner', 'count', 'couple', 'course', 'cross', 'crowd', 'curtain', 'customer', 'dance',
        'dangerous', 'daughter', 'decide', 'deep', 'deliver', 'describe', 'desert', 'diary', 'difficult', 'dinner',
        'direction', 'dirty', 'discover', 'dish', 'dream', 'dress', 'drive', 'drop', 'dry', 'earn',
        'education', 'electricity', 'email', 'empty', 'enemy', 'energy', 'engine', 'enjoy', 'enough', 'enter',
        'environment', 'exact', 'exam', 'example', 'excellent', 'excited', 'exercise', 'expect', 'expensive', 'experience'
    ],
    B1: [
        'abandon', 'ability', 'abroad', 'absent', 'absorb', 'abstract', 'abuse', 'academic', 'accept', 'access',
        'accident', 'accompany', 'accomplish', 'account', 'accurate', 'accuse', 'achieve', 'acknowledge', 'acquire', 'action',
        'active', 'actual', 'adapt', 'addition', 'adequate', 'adjust', 'admire', 'admit', 'adopt', 'adult',
        'advance', 'advantage', 'adventure', 'advertise', 'advice', 'afford', 'afraid', 'agency', 'agent', 'agree',
        'agriculture', 'aim', 'aircraft', 'alarm', 'alcohol', 'alive', 'allow', 'alternative', 'amaze', 'ambition',
        'amount', 'analyze', 'ancient', 'announce', 'annual', 'anxiety', 'apologize', 'apparent', 'appeal', 'appear',
        'appreciate', 'approach', 'appropriate', 'approve', 'argue', 'arrange', 'arrest', 'article', 'artificial', 'assume',
        'atmosphere', 'attach', 'attempt', 'attend', 'attitude', 'attract', 'audience', 'authority', 'automatic', 'available',
        'average', 'avoid', 'award', 'aware', 'background', 'balance', 'band', 'bank', 'barrier', 'base',
        'basic', 'battle', 'bear', 'behavior', 'belief', 'belong', 'benefit', 'beyond', 'billion', 'blame'
    ],
    B2: [
        'abandon', 'absence', 'absolute', 'absorb', 'abstract', 'abundant', 'accelerate', 'accommodate', 'accumulate', 'accuracy',
        'acquisition', 'adapt', 'adequate', 'adjustment', 'administration', 'adolescent', 'advocate', 'aesthetic', 'affection', 'affordable',
        'aggressive', 'allocate', 'ambiguous', 'amendment', 'anxiety', 'appliance', 'arbitrary', 'articulate', 'aspiration', 'assault',
        'assessment', 'assignment', 'associate', 'assumption', 'attachment', 'attribute', 'authentic', 'authorize', 'awareness', 'bankruptcy',
        'bargain', 'benchmark', 'biography', 'boundary', 'broadcast', 'bureaucracy', 'campaign', 'candidate', 'capability', 'catalogue',
        'catastrophe', 'category', 'cease', 'characteristic', 'chronic', 'circumstance', 'civilization', 'classify', 'coincidence', 'collapse',
        'colleague', 'colonial', 'commence', 'commission', 'commitment', 'commodity', 'companion', 'compatible', 'compensate', 'competent',
        'complement', 'complexity', 'compliance', 'compromise', 'compulsory', 'conceive', 'concentrate', 'concept', 'concrete', 'conduct',
        'confront', 'congress', 'conscience', 'consecutive', 'consequence', 'conservation', 'considerable', 'consistent', 'conspiracy', 'constitute',
        'constraint', 'consultant', 'contaminate', 'contemplate', 'contemporary', 'contention', 'context', 'contradiction', 'controversy', 'convention'
    ],
    C1: [
        'abolish', 'abrupt', 'abstain', 'acceleration', 'accessible', 'accountable', 'accumulation', 'acknowledgement', 'acquaintance', 'acquisition',
        'adhere', 'adjacent', 'adolescence', 'adverse', 'advocacy', 'affiliate', 'aggregate', 'agitate', 'allegation', 'alleviate',
        'alliance', 'allocation', 'alteration', 'ambassador', 'ambiguity', 'amendment', 'analogy', 'ancestor', 'anecdote', 'anthropology',
        'anticipate', 'apparatus', 'appetite', 'appraisal', 'apprentice', 'arbitrary', 'array', 'ascertain', 'aspire', 'assassination',
        'assertion', 'assimilate', 'asylum', 'attain', 'authenticate', 'autonomy', 'backdrop', 'backlog', 'ballot', 'benchmark',
        'beneficiary', 'bewilder', 'bilateral', 'blueprint', 'bombard', 'botanical', 'breach', 'brink', 'broker', 'bulky',
        'bureaucratic', 'calibrate', 'capability', 'caption', 'casualty', 'catalyst', 'cater', 'cedar', 'censorship', 'certify',
        'chancellor', 'chronicle', 'civic', 'clandestine', 'clarify', 'classification', 'clause', 'clergy', 'coalition', 'coherent',
        'collaboration', 'collision', 'commemorate', 'compelling', 'compensatory', 'complement', 'comprehension', 'comprise', 'compulsory', 'concede',
        'conceivable', 'conception', 'concession', 'concurrent', 'condemn', 'confer', 'configuration', 'confine', 'conform', 'confrontation'
    ],
    C2: [
        'abjure', 'abnegation', 'abrogate', 'abstemious', 'accolade', 'acrimony', 'adjudicate', 'admonish', 'adulterate', 'aesthetic',
        'affable', 'aggrandize', 'amalgamate', 'ameliorate', 'anachronism', 'anathema', 'antediluvian', 'antipathy', 'apocryphal', 'approbation',
        'arcane', 'arduous', 'ascetic', 'assiduous', 'attrition', 'audacious', 'auspicious', 'avarice', 'axiom', 'bellicose',
        'benevolent', 'bequeath', 'bereft', 'besmirch', 'betoken', 'bilingual', 'blandishment', 'blasphemy', 'blithe', 'bombastic',
        'bourgeois', 'bucolic', 'burnish', 'cabal', 'cacophony', 'cajole', 'callous', 'calumny', 'candor', 'capitulate',
        'capricious', 'castigate', 'catalyst', 'caustic', 'cede', 'cerebral', 'charlatan', 'circumspect', 'clandestine', 'clemency',
        'coalesce', 'coerce', 'cogent', 'cognizant', 'colloquial', 'commensurate', 'compendium', 'complacent', 'conciliatory', 'confluence',
        'connoisseur', 'contrite', 'conundrum', 'convivial', 'copious', 'corroborate', 'cosmopolitan', 'credulous', 'culminate', 'culpable',
        'cursory', 'dearth', 'debacle', 'decadence', 'deference', 'deleterious', 'delineate', 'denounce', 'deprecate', 'deride',
        'despot', 'diatribe', 'dichotomy', 'didactic', 'diffident', 'digress', 'dilapidated', 'dilettante', 'diminish', 'discerning'
    ]
};

// ─── API Fonksiyonları ──────────────────────────────────────────

function httpGet(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error(`JSON parse error: ${e.message}`));
                }
            });
            res.on('error', reject);
        }).on('error', reject);
    });
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Free Dictionary API'den kelime bilgisi çek
async function fetchFromDictionary(word) {
    try {
        const data = await httpGet(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);

        if (!Array.isArray(data) || data.length === 0) return null;

        const entry = data[0];

        // Pronunciation
        const pronunciation = entry.phonetic ||
            (entry.phonetics && entry.phonetics.find(p => p.text)?.text) || '';

        // Audio URL
        const audioObj = entry.phonetics && entry.phonetics.find(p => p.audio && p.audio.length > 0);
        const audio = audioObj ? audioObj.audio : '';

        // İlk meaning'den bilgileri al
        let partOfSpeech = '';
        let definition = '';
        let examples = [];

        if (entry.meanings && entry.meanings.length > 0) {
            const meaning = entry.meanings[0];
            partOfSpeech = meaning.partOfSpeech || '';

            if (meaning.definitions && meaning.definitions.length > 0) {
                definition = meaning.definitions[0].definition || '';

                // Örnek cümleleri topla (max 3)
                for (const def of meaning.definitions) {
                    if (def.example && examples.length < 3) {
                        examples.push(def.example);
                    }
                }

                // Diğer meanings'lerden de örnek al
                if (examples.length < 3) {
                    for (let i = 1; i < entry.meanings.length && examples.length < 3; i++) {
                        for (const def of entry.meanings[i].definitions) {
                            if (def.example && examples.length < 3) {
                                examples.push(def.example);
                            }
                        }
                    }
                }
            }
        }

        return { pronunciation, audio, partOfSpeech, definition, examples };
    } catch (err) {
        return null;
    }
}

// MyMemory API'den Türkçe çeviri al
async function fetchTurkishMeaning(word) {
    try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|tr`;
        const data = await httpGet(url);

        if (data && data.responseData && data.responseData.translatedText) {
            let translated = data.responseData.translatedText;
            // Bazen API büyük harfle döndürüyor, küçült
            translated = translated.charAt(0).toLowerCase() + translated.slice(1);
            return translated;
        }
        return null;
    } catch (err) {
        return null;
    }
}

// ─── Ana İşlem ──────────────────────────────────────────────────

async function main() {
    const db = {};
    const levels = Object.keys(WORD_LISTS);
    let totalWords = 0;
    let failedWords = [];

    console.log('🚀 Linguist Pro — Kelime Çekme Başlıyor...\n');

    for (const level of levels) {
        const words = WORD_LISTS[level];
        db[level] = [];

        console.log(`\n📗 ${level} seviyesi — ${words.length} kelime işlenecek`);
        console.log('─'.repeat(50));

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            process.stdout.write(`  [${i + 1}/${words.length}] "${word}" çekiliyor...`);

            // Dictionary API'den çek
            const dictData = await fetchFromDictionary(word);
            await delay(200); // Rate limit koruması

            // Çeviri API'den Türkçe anlamı çek
            const turkishMeaning = await fetchTurkishMeaning(word);
            await delay(200); // Rate limit koruması

            if (!dictData) {
                console.log(' ❌ (API bulamadı, atlanıyor)');
                failedWords.push({ level, word, reason: 'Dictionary API failed' });
                continue;
            }

            const wordEntry = {
                word: word,
                meaning: turkishMeaning || word, // Çeviri yoksa kelimeyi koy
                definition: dictData.definition || 'No definition available',
                partOfSpeech: dictData.partOfSpeech || 'unknown',
                pronunciation: dictData.pronunciation || '',
                examples: dictData.examples.length > 0 ? dictData.examples : [`The word "${word}" is commonly used in English.`],
            };

            // Audio varsa ekle
            if (dictData.audio) {
                wordEntry.audio = dictData.audio;
            }

            db[level].push(wordEntry);
            totalWords++;
            console.log(` ✅ (${dictData.partOfSpeech}, "${turkishMeaning || '?'}")`);
        }

        console.log(`\n  ✓ ${level}: ${db[level].length}/${words.length} kelime başarıyla çekildi`);
    }

    // JSON dosyasına yaz
    const outputPath = __dirname + '/words_db.json';
    fs.writeFileSync(outputPath, JSON.stringify(db, null, 2), 'utf8');

    // Rapor
    console.log('\n' + '═'.repeat(50));
    console.log('📊 SONUÇ RAPORU');
    console.log('═'.repeat(50));
    for (const level of levels) {
        console.log(`  ${level}: ${db[level].length} kelime`);
    }
    console.log(`\n  Toplam: ${totalWords} kelime`);
    console.log(`  Başarısız: ${failedWords.length} kelime`);

    if (failedWords.length > 0) {
        console.log('\n  ❌ Başarısız kelimeler:');
        failedWords.forEach(f => console.log(`    - [${f.level}] ${f.word}: ${f.reason}`));
    }

    console.log(`\n  📁 Çıktı: ${outputPath}`);
    console.log('═'.repeat(50));
    console.log('\n✅ Tamamlandı!\n');
}

main().catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
});
