#!/usr/bin/env python3
"""
Linguist Pro — Web Word Fetcher
CEFR seviyelerine göre kelimeleri
Free Dictionary API + MyMemory API'den çeker
"""

import json
import urllib.request
import urllib.parse
import time
import os
import sys

# ─── CEFR Kelime Listeleri ──────────────────────────────────────

WORD_LISTS = {
    "A1": [
        "apple","book","cat","dog","eat","family","good","house","water","happy",
        "school","friend","big","small","run","work","car","time","new","old",
        "mother","father","beautiful","help","open","close","music","food","child","cold",
        "hot","sleep","morning","night","color","head","hand","eye","ear","nose",
        "mouth","leg","arm","red","blue","green","yellow","black","white","brother",
        "sister","baby","man","woman","boy","girl","teacher","doctor","bus","train",
        "phone","bed","garden","tree","flower","rain","sun","name","city","street",
        "table","chair","door","window","room","milk","bread","egg","rice","chicken",
        "fish","meat","sugar","salt","cup","plate","bag","shoe","shirt","hat",
        "money","shop","market","park","beach","mountain","river","lake","sky","star"
    ],
    "A2": [
        "address","airport","alive","angry","answer","apartment","arrive","bath","birthday","blanket",
        "boring","brave","bridge","brush","build","burn","butter","calendar","camera","candle",
        "careful","century","cheap","cheese","choose","church","circle","clean","climb","cloud",
        "coat","coin","collect","comfortable","communicate","compare","complain","computer","control","cook",
        "copy","corner","count","couple","course","cross","crowd","curtain","customer","dance",
        "dangerous","daughter","decide","deep","deliver","describe","desert","diary","difficult","dinner",
        "direction","dirty","discover","dish","dream","dress","drive","drop","dry","earn",
        "education","electricity","email","empty","enemy","energy","engine","enjoy","enough","enter",
        "environment","exact","exam","example","excellent","excited","exercise","expect","expensive","experience"
    ],
    "B1": [
        "abandon","ability","abroad","absent","absorb","abstract","abuse","academic","accept","access",
        "accident","accompany","accomplish","account","accurate","accuse","achieve","acknowledge","acquire","action",
        "active","actual","adapt","addition","adequate","adjust","admire","admit","adopt","adult",
        "advance","advantage","adventure","advertise","advice","afford","afraid","agency","agent","agree",
        "agriculture","aim","aircraft","alarm","alcohol","alive","allow","alternative","amaze","ambition",
        "amount","analyze","ancient","announce","annual","anxiety","apologize","apparent","appeal","appear",
        "appreciate","approach","appropriate","approve","argue","arrange","arrest","article","artificial","assume",
        "atmosphere","attach","attempt","attend","attitude","attract","audience","authority","automatic","available",
        "average","avoid","award","aware","background","balance","band","bank","barrier","base",
        "basic","battle","bear","behavior","belief","belong","benefit","beyond","billion","blame"
    ],
    "B2": [
        "abandon","absence","absolute","absorb","abstract","abundant","accelerate","accommodate","accumulate","accuracy",
        "acquisition","adapt","adequate","adjustment","administration","adolescent","advocate","aesthetic","affection","affordable",
        "aggressive","allocate","ambiguous","amendment","anxiety","appliance","arbitrary","articulate","aspiration","assault",
        "assessment","assignment","associate","assumption","attachment","attribute","authentic","authorize","awareness","bankruptcy",
        "bargain","benchmark","biography","boundary","broadcast","bureaucracy","campaign","candidate","capability","catalogue",
        "catastrophe","category","cease","characteristic","chronic","circumstance","civilization","classify","coincidence","collapse",
        "colleague","colonial","commence","commission","commitment","commodity","companion","compatible","compensate","competent",
        "complement","complexity","compliance","compromise","compulsory","conceive","concentrate","concept","concrete","conduct",
        "confront","congress","conscience","consecutive","consequence","conservation","considerable","consistent","conspiracy","constitute",
        "constraint","consultant","contaminate","contemplate","contemporary","contention","context","contradiction","controversy","convention"
    ],
    "C1": [
        "abolish","abrupt","abstain","acceleration","accessible","accountable","accumulation","acknowledgement","acquaintance","acquisition",
        "adhere","adjacent","adolescence","adverse","advocacy","affiliate","aggregate","agitate","allegation","alleviate",
        "alliance","allocation","alteration","ambassador","ambiguity","amendment","analogy","ancestor","anecdote","anthropology",
        "anticipate","apparatus","appetite","appraisal","apprentice","arbitrary","array","ascertain","aspire","assassination",
        "assertion","assimilate","asylum","attain","authenticate","autonomy","backdrop","backlog","ballot","benchmark",
        "beneficiary","bewilder","bilateral","blueprint","bombard","botanical","breach","brink","broker","bulky",
        "bureaucratic","calibrate","capability","caption","casualty","catalyst","cater","cedar","censorship","certify",
        "chancellor","chronicle","civic","clandestine","clarify","classification","clause","clergy","coalition","coherent",
        "collaboration","collision","commemorate","compelling","compensatory","complement","comprehension","comprise","compulsory","concede",
        "conceivable","conception","concession","concurrent","condemn","confer","configuration","confine","conform","confrontation"
    ],
    "C2": [
        "abjure","abnegation","abrogate","abstemious","accolade","acrimony","adjudicate","admonish","adulterate","aesthetic",
        "affable","aggrandize","amalgamate","ameliorate","anachronism","anathema","antediluvian","antipathy","apocryphal","approbation",
        "arcane","arduous","ascetic","assiduous","attrition","audacious","auspicious","avarice","axiom","bellicose",
        "benevolent","bequeath","bereft","besmirch","betoken","bilingual","blandishment","blasphemy","blithe","bombastic",
        "bourgeois","bucolic","burnish","cabal","cacophony","cajole","callous","calumny","candor","capitulate",
        "capricious","castigate","catalyst","caustic","cede","cerebral","charlatan","circumspect","clandestine","clemency",
        "coalesce","coerce","cogent","cognizant","colloquial","commensurate","compendium","complacent","conciliatory","confluence",
        "connoisseur","contrite","conundrum","convivial","copious","corroborate","cosmopolitan","credulous","culminate","culpable",
        "cursory","dearth","debacle","decadence","deference","deleterious","delineate","denounce","deprecate","deride",
        "despot","diatribe","dichotomy","didactic","diffident","digress","dilapidated","dilettante","diminish","discerning"
    ]
}


def http_get_json(url):
    """URL'den JSON veri çek"""
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'LinguistPro/1.0',
            'Accept': 'application/json'
        })
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        return None


def fetch_from_dictionary(word):
    """Free Dictionary API'den kelime bilgisi çek"""
    url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{urllib.parse.quote(word)}"
    data = http_get_json(url)

    if not data or not isinstance(data, list) or len(data) == 0:
        return None

    entry = data[0]

    # Pronunciation
    pronunciation = entry.get('phonetic', '')
    if not pronunciation:
        phonetics = entry.get('phonetics', [])
        for p in phonetics:
            if p.get('text'):
                pronunciation = p['text']
                break

    # Audio URL
    audio = ''
    phonetics = entry.get('phonetics', [])
    for p in phonetics:
        if p.get('audio') and len(p['audio']) > 0:
            audio = p['audio']
            break

    # Meanings
    part_of_speech = ''
    definition = ''
    examples = []

    meanings = entry.get('meanings', [])
    if meanings:
        first_meaning = meanings[0]
        part_of_speech = first_meaning.get('partOfSpeech', '')

        defs = first_meaning.get('definitions', [])
        if defs:
            definition = defs[0].get('definition', '')

            # Örnek cümleleri topla (max 3)
            for d in defs:
                if d.get('example') and len(examples) < 3:
                    examples.append(d['example'])

            # Diğer meanings'lerden de örnek al
            if len(examples) < 3:
                for m in meanings[1:]:
                    for d in m.get('definitions', []):
                        if d.get('example') and len(examples) < 3:
                            examples.append(d['example'])

    return {
        'pronunciation': pronunciation,
        'audio': audio,
        'partOfSpeech': part_of_speech,
        'definition': definition,
        'examples': examples
    }


def fetch_turkish_meaning(word):
    """MyMemory API'den Türkçe çeviri al"""
    url = f"https://api.mymemory.translated.net/get?q={urllib.parse.quote(word)}&langpair=en|tr"
    data = http_get_json(url)

    if data and data.get('responseData') and data['responseData'].get('translatedText'):
        translated = data['responseData']['translatedText']
        # Küçük harfe çevir
        if translated:
            translated = translated[0].lower() + translated[1:]
        return translated
    return None


def main():
    db = {}
    levels = list(WORD_LISTS.keys())
    total_words = 0
    failed_words = []

    print('🚀 Linguist Pro — Kelime Çekme Başlıyor...\n')

    for level in levels:
        words = WORD_LISTS[level]
        db[level] = []

        print(f'\n📗 {level} seviyesi — {len(words)} kelime işlenecek')
        print('─' * 50)

        for i, word in enumerate(words):
            sys.stdout.write(f'  [{i+1}/{len(words)}] "{word}" çekiliyor...')
            sys.stdout.flush()

            # Dictionary API'den çek
            dict_data = fetch_from_dictionary(word)
            time.sleep(0.25)  # Rate limit koruması

            # Çeviri API'den Türkçe anlamı çek
            turkish_meaning = fetch_turkish_meaning(word)
            time.sleep(0.25)  # Rate limit koruması

            if not dict_data:
                print(' ❌ (API bulamadı, atlanıyor)')
                failed_words.append({'level': level, 'word': word, 'reason': 'Dictionary API failed'})
                continue

            word_entry = {
                'word': word,
                'meaning': turkish_meaning or word,
                'definition': dict_data['definition'] or 'No definition available',
                'partOfSpeech': dict_data['partOfSpeech'] or 'unknown',
                'pronunciation': dict_data['pronunciation'] or '',
                'examples': dict_data['examples'] if dict_data['examples'] else [f'The word "{word}" is commonly used in English.'],
            }

            # Audio varsa ekle
            if dict_data.get('audio'):
                word_entry['audio'] = dict_data['audio']

            db[level].append(word_entry)
            total_words += 1
            print(f' ✅ ({dict_data["partOfSpeech"]}, "{turkish_meaning or "?"}")')

        print(f'\n  ✓ {level}: {len(db[level])}/{len(words)} kelime başarıyla çekildi')

    # JSON dosyasına yaz
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, 'words_db.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(db, f, indent=2, ensure_ascii=False)

    # Rapor
    print('\n' + '═' * 50)
    print('📊 SONUÇ RAPORU')
    print('═' * 50)
    for level in levels:
        print(f'  {level}: {len(db[level])} kelime')
    print(f'\n  Toplam: {total_words} kelime')
    print(f'  Başarısız: {len(failed_words)} kelime')

    if failed_words:
        print('\n  ❌ Başarısız kelimeler:')
        for f_item in failed_words:
            print(f'    - [{f_item["level"]}] {f_item["word"]}: {f_item["reason"]}')

    print(f'\n  📁 Çıktı: {output_path}')
    print('═' * 50)
    print('\n✅ Tamamlandı!\n')


if __name__ == '__main__':
    main()
