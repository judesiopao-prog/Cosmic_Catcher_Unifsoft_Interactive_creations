const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serves index.html, JS, CSS, and images

// ============================================================
// FILE-BASED DATABASE HELPERS
// ============================================================
const SCORES_FILE = path.join(__dirname, 'scores.json');
const FEEDBACK_FILE = path.join(__dirname, 'feedback.json');

// Ensure database files exist on startup
function initDB(filePath) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([]), 'utf8');
    }
}

initDB(SCORES_FILE);
initDB(FEEDBACK_FILE);

function readData(filePath) {
    try {
        const raw = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(raw || '[]');
    } catch (e) {
        return [];
    }
}

function writeData(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// ============================================================
// HIGH SCORES API ENDPOINTS
// ============================================================

// Fetch Top 10 High Scores
app.get('/api/scores', (req, res) => {
    const scores = readData(SCORES_FILE);
    // Sort highest score first and grab top 10
    const topScores = scores.sort((a, b) => b.score - a.score).slice(0, 10);
    res.json(topScores);
});

// Save a New High Score
app.post('/api/scores', (req, res) => {
    const { name, score, level, date } = req.body;
    if (!name || score === undefined) {
        return res.status(400).json({ error: 'Name and score are required.' });
    }

    const scores = readData(SCORES_FILE);
    const newEntry = {
        id: Date.now(),
        name: name.trim(),
        score: Number(score),
        level: Number(level || 1),
        date: date || new Date().toLocaleString()
    };

    scores.push(newEntry);
    writeData(SCORES_FILE, scores);

    res.json({ success: true, id: newEntry.id });
});

// ============================================================
// FEEDBACK API ENDPOINTS
// ============================================================

// Save Feedback Entry
app.post('/api/feedback', (req, res) => {
    const { playerName, playerEmail, feedbackCategory, comments, consent, date } = req.body;

    const feedbacks = readData(FEEDBACK_FILE);
    const newFeedback = {
        id: Date.now(),
        playerName: playerName || 'Anonymous',
        playerEmail: playerEmail || '',
        feedbackCategory: feedbackCategory || 'General',
        comments: comments || '',
        consent: Boolean(consent),
        date: date || new Date().toLocaleString()
    };

    feedbacks.push(newFeedback);
    writeData(FEEDBACK_FILE, feedbacks);

    res.json({ success: true, id: newFeedback.id });
});

// Fetch All Feedback Entries
app.get('/api/feedback', (req, res) => {
    const feedbacks = readData(FEEDBACK_FILE);
    res.json(feedbacks.reverse()); // Newest first
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});