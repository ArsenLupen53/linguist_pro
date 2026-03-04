/* ========================================
   Linguist Pro — App Logic
   ======================================== */

(function () {
    'use strict';

    // --- State ---
    let wordsDB = null;
    let currentLevel = 'B1';
    let currentWords = [];   // Array of { data, cardEl, index }
    let usedIndices = new Set();

    // --- DOM References ---
    const levelBtns = document.querySelectorAll('.level-btn');
    const wordCountInput = document.getElementById('wordCount');
    const decreaseBtn = document.getElementById('decreaseBtn');
    const increaseBtn = document.getElementById('increaseBtn');
    const fetchBtn = document.getElementById('fetchBtn');
    const wordsContainer = document.getElementById('wordsContainer');
    const emptyState = document.getElementById('emptyState');
    const loadingState = document.getElementById('loadingState');

    // --- Init ---
    async function init() {
        await loadDatabase();
        bindEvents();
    }

    // --- Load Database ---
    async function loadDatabase() {
        try {
            const resp = await fetch('data/words_db.json');
            if (!resp.ok) throw new Error('DB yüklenemedi');
            wordsDB = await resp.json();
            console.log('📚 Veritabanı yüklendi:', Object.keys(wordsDB).map(k => `${k}: ${wordsDB[k].length}`).join(', '));
        } catch (err) {
            console.error('Veritabanı hatası:', err);
            emptyState.innerHTML = `
                <div class="empty-icon">⚠️</div>
                <p style="color: var(--danger);">Veritabanı yüklenirken hata oluştu.<br>Lütfen sayfayı yenileyin.</p>
            `;
        }
    }

    // --- Bind Events ---
    function bindEvents() {
        // Level buttons
        levelBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                levelBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentLevel = btn.dataset.level;
            });
        });

        // Count controls
        decreaseBtn.addEventListener('click', () => {
            const val = parseInt(wordCountInput.value) || 5;
            wordCountInput.value = Math.max(1, val - 1);
        });

        increaseBtn.addEventListener('click', () => {
            const val = parseInt(wordCountInput.value) || 5;
            wordCountInput.value = Math.min(20, val + 1);
        });

        wordCountInput.addEventListener('change', () => {
            let val = parseInt(wordCountInput.value) || 5;
            val = Math.max(1, Math.min(20, val));
            wordCountInput.value = val;
        });

        // Fetch button
        fetchBtn.addEventListener('click', fetchWords);
    }

    // --- Fisher-Yates Shuffle (returns indices) ---
    function getRandomIndices(arrayLength, count) {
        const indices = Array.from({ length: arrayLength }, (_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        return indices.slice(0, count);
    }

    // --- Fetch Words ---
    function fetchWords() {
        if (!wordsDB) return;

        const levelWords = wordsDB[currentLevel];
        if (!levelWords || levelWords.length === 0) return;

        const count = Math.min(parseInt(wordCountInput.value) || 5, levelWords.length);

        // Reset
        usedIndices.clear();
        currentWords = [];
        wordsContainer.innerHTML = '';

        // Hide empty, show loading
        emptyState.classList.add('hidden');
        loadingState.classList.remove('hidden');

        // Simulate tiny delay for UX feel
        setTimeout(() => {
            loadingState.classList.add('hidden');

            const indices = getRandomIndices(levelWords.length, count);
            indices.forEach(idx => usedIndices.add(idx));

            indices.forEach((idx, i) => {
                const wordData = levelWords[idx];
                const card = createWordCard(wordData, idx, i);
                wordsContainer.appendChild(card);
                currentWords.push({ data: wordData, cardEl: card, index: idx });
            });
        }, 400);
    }

    // --- Highlight word in sentence ---
    function highlightWord(sentence, word) {
        const regex = new RegExp(`(${escapeRegex(word)}\\w*)`, 'gi');
        return sentence.replace(regex, '<span class="highlight">$1</span>');
    }

    function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // --- Create Word Card ---
    function createWordCard(wordData, dbIndex, animIndex) {
        const card = document.createElement('div');
        card.className = 'word-card';
        card.style.animationDelay = `${animIndex * 0.08}s`;

        const hasExtraExamples = wordData.examples && wordData.examples.length > 1;
        const firstExample = wordData.examples && wordData.examples.length > 0 ? wordData.examples[0] : '';
        const extraExamples = hasExtraExamples ? wordData.examples.slice(1) : [];

        card.innerHTML = `
            <div class="card-header">
                <div class="word-main">
                    <div class="word-title">
                        ${wordData.word}
                        <span class="level-badge ${currentLevel}">${currentLevel}</span>
                    </div>
                    <div class="word-pronunciation">${wordData.pronunciation || ''}</div>
                    <span class="word-pos">${wordData.partOfSpeech || ''}</span>
                </div>
                <button class="refresh-btn" title="Bu kelimeyi değiştir" data-index="${dbIndex}">🔄</button>
            </div>

            <div class="word-meaning">
                <span class="meaning-label">Türkçe</span>
                <span class="meaning-text">${wordData.meaning}</span>
            </div>

            <div class="word-definition">${wordData.definition}</div>

            ${firstExample ? `
                <div class="word-example">
                    <div class="example-label">Örnek Cümle</div>
                    <div class="example-text">${highlightWord(firstExample, wordData.word)}</div>
                </div>
            ` : ''}

            <div class="extra-examples" id="extra-${dbIndex}">
                ${extraExamples.map(ex => `
                    <div class="extra-example-item">
                        <div class="example-text">${highlightWord(ex, wordData.word)}</div>
                    </div>
                `).join('')}
            </div>

            <div class="card-actions">
                ${hasExtraExamples ? `
                    <button class="action-btn toggle-examples-btn" data-target="extra-${dbIndex}">
                        <span class="icon">+</span>
                        Daha Fazla Örnek (${extraExamples.length})
                    </button>
                ` : ''}
            </div>
        `;

        // Bind refresh button
        const refreshBtn = card.querySelector('.refresh-btn');
        refreshBtn.addEventListener('click', () => refreshWord(card, dbIndex));

        // Bind toggle examples button
        const toggleBtn = card.querySelector('.toggle-examples-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const target = document.getElementById(toggleBtn.dataset.target);
                const isOpen = target.classList.toggle('open');
                toggleBtn.classList.toggle('active', isOpen);

                const icon = toggleBtn.querySelector('.icon');
                icon.textContent = isOpen ? '×' : '+';

                const label = isOpen ? 'Örnekleri Gizle' : `Daha Fazla Örnek (${extraExamples.length})`;
                toggleBtn.innerHTML = `<span class="icon">${isOpen ? '×' : '+'}</span> ${label}`;
                if (isOpen) toggleBtn.classList.add('active');
            });
        }

        return card;
    }

    // --- Refresh Single Word ---
    function refreshWord(cardEl, oldIndex) {
        if (!wordsDB) return;

        const levelWords = wordsDB[currentLevel];
        if (!levelWords) return;

        // Find an unused index
        let newIndex = -1;
        const available = [];
        for (let i = 0; i < levelWords.length; i++) {
            if (!usedIndices.has(i)) available.push(i);
        }

        if (available.length === 0) {
            // All words used — reset and pick random
            usedIndices.clear();
            currentWords.forEach(w => usedIndices.add(w.index));
            for (let i = 0; i < levelWords.length; i++) {
                if (!usedIndices.has(i)) available.push(i);
            }
            if (available.length === 0) return; // Truly no more words
        }

        newIndex = available[Math.floor(Math.random() * available.length)];

        // Update state
        usedIndices.delete(oldIndex);
        usedIndices.add(newIndex);

        const newWordData = levelWords[newIndex];

        // Animate
        cardEl.classList.add('refreshing');

        setTimeout(() => {
            // Replace card content
            const newCard = createWordCard(newWordData, newIndex, 0);
            newCard.style.animationDelay = '0s';
            newCard.style.opacity = '1';
            newCard.style.transform = 'translateY(0)';
            cardEl.replaceWith(newCard);

            // Update currentWords array
            const entry = currentWords.find(w => w.index === oldIndex);
            if (entry) {
                entry.data = newWordData;
                entry.cardEl = newCard;
                entry.index = newIndex;
            }
        }, 200);
    }

    // --- Start ---
    document.addEventListener('DOMContentLoaded', init);
})();
