'use strict';

const SCORES_API_URL = '/api/scores';

const highScoreScreen = document.getElementById('highScoreScreen');
const leaderboardBody = document.getElementById('leaderboardBody');
const openHighScoreBtn = document.getElementById('openHighScoreBtn');
const closeHighScoreBtn = document.getElementById('closeHighScoreBtn');
const exportScoresBtn = document.getElementById('exportScoresBtn');

const highScoreInputContainer = document.getElementById('highScoreInputContainer');
const highScoreNameInput = document.getElementById('highScoreName');
const saveHighScoreBtn = document.getElementById('saveHighScoreBtn');
const highScoreSavedMsg = document.getElementById('highScoreSavedMsg');


let currentEndGameData = null;

// ============================================================
// FETCH & RENDER LEADERBOARD
// ============================================================
async function loadLeaderboard() {
    if (!leaderboardBody) return;
    leaderboardBody.innerHTML = '<tr><td colspan="5">Loading scores...</td></tr>';

    try {
        const response = await fetch(SCORES_API_URL);
        if (!response.ok) throw new Error('Failed to fetch scores');
        const scores = await response.json();

        leaderboardBody.innerHTML = '';

        if (scores.length === 0) {
            leaderboardBody.innerHTML = '<tr><td colspan="5">No high scores yet! Be the first!</td></tr>';
            return;
        }

        scores.forEach((entry, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${index + 1}</td>
                <td class="player-name">${escapeHTML(entry.name)}</td>
                <td class="score-highlight">${entry.score}</td>
                <td>Level ${entry.level}</td>
                <td class="score-date">${entry.date}</td>
            `;
            leaderboardBody.appendChild(tr);
        });
    } catch (err) {
        leaderboardBody.innerHTML = '<tr><td colspan="5">Offline / Local Mode Active</td></tr>';
    }
}

function escapeHTML(str) {
    return String(str).replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// ============================================================
// SAVE HIGH SCORE
// ============================================================
saveHighScoreBtn?.addEventListener('click', async () => {
    const name = highScoreNameInput?.value.trim() || 'Anonymous';
    if (!currentEndGameData) return;

    const data = {
        name: name,
        score: currentEndGameData.score,
        level: currentEndGameData.level,
        date: new Date().toLocaleDateString()
    };

    try {
        const response = await fetch(SCORES_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            highScoreSavedMsg?.classList.remove('hidden');
            if (saveHighScoreBtn) saveHighScoreBtn.disabled = true;
            loadLeaderboard();
        }
    } catch (err) {
        console.warn('Could not connect to database server.');
    }
});

// ============================================================
// EXPORT SCORES
// ============================================================
exportScoresBtn?.addEventListener('click', async () => {
    try {
        const response = await fetch(SCORES_API_URL);
        if (!response.ok) throw new Error('Fetch failed');
        const scores = await response.json();

        if (!scores || scores.length === 0) {
            alert('No high scores to export!');
            return;
        }

        let content = `=====================================\n` +
                      `        HIGH SCORE LEADERBOARD       \n` +
                      `=====================================\n\n`;

        scores.forEach((entry, idx) => {
            content += `#${idx + 1} Name  : ${entry.name}\n` +
                       `   Score : ${entry.score}\n` +
                       `   Level : ${entry.level}\n` +
                       `   Date  : ${entry.date}\n` +
                       `-------------------------------------\n`;
        });

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'high_scores.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    } catch (err) {
        alert('Could not retrieve scores to export.');
    }
});

// ============================================================
// EVENT LISTENERS & NAVIGATION
// ============================================================
document.addEventListener('gameFinished', (e) => {
    currentEndGameData = e.detail;
    if (highScoreInputContainer) {
        highScoreInputContainer.classList.remove('hidden');
        if (highScoreSavedMsg) highScoreSavedMsg.classList.add('hidden');
        if (saveHighScoreBtn) saveHighScoreBtn.disabled = false;
    }
});

openHighScoreBtn?.addEventListener('click', () => {
    document.getElementById('mainMenu')?.classList.add('hidden');
    document.getElementById('gameOverScreen')?.classList.add('hidden');
    document.getElementById('feedbackScreen')?.classList.add('hidden');
    highScoreScreen?.classList.remove('hidden');
    loadLeaderboard();
});

closeHighScoreBtn?.addEventListener('click', () => {
    highScoreScreen?.classList.add('hidden');
    
    const isPlaying = typeof gameActive !== 'undefined' && gameActive;
    if (!isPlaying) {
        document.getElementById('mainMenu')?.classList.remove('hidden');
    }
});