'use strict';

// ============================================================
// DOM ELEMENTS
// ============================================================
const form = document.getElementById('contactForm');
const playerName = document.getElementById('playerName');
const playerEmail = document.getElementById('playerEmail');
const feedbackCategory = document.getElementById('feedbackCategory');
const comments = document.getElementById('comments');
const consent = document.getElementById('consent');

const namePreview = document.getElementById('namePreview');
const nameCounter = document.getElementById('nameCounter');
const formStatus = document.getElementById('formStatus');
const summaryCard = document.getElementById('summaryCard');

const openFormBtn = document.getElementById('openFormBtn');
const openFormBtnNav = document.getElementById('openFormBtnNav');
const closeFormBtn = document.getElementById('closeFormBtn');
const exportFeedbackBtn = document.getElementById('exportFeedbackBtn');

// Form Fields Array
const fields = [playerName, playerEmail, feedbackCategory, comments, consent];

// Error Elements Map
const errorElements = {
    playerName: document.getElementById('nameError'),
    playerEmail: document.getElementById('emailError'),
    feedbackCategory: document.getElementById('categoryError'),
    comments: document.getElementById('commentsError'),
    consent: document.getElementById('consentError')
};

// ============================================================
// VALIDATION HELPERS
// ============================================================
function setError(control, message) {
    if (!control) return;
    const key = control.name;
    const errorEl = errorElements[key];
    control.setCustomValidity(message);
    control.setAttribute('aria-invalid', 'true');
    if (errorEl) errorEl.textContent = message;
}

function clearError(control) {
    if (!control) return;
    const key = control.name;
    const errorEl = errorElements[key];
    control.setCustomValidity('');
    control.removeAttribute('aria-invalid');
    if (errorEl) errorEl.textContent = '';
}

function validateField(control) {
    if (!control) return true;
    clearError(control);

    if (control === playerName) {
        const value = control.value.trim();
        if (!value) {
            setError(control, 'Player name is required.');
            return false;
        }
        if (value.length < 2) {
            setError(control, 'Player name must be at least 2 characters.');
            return false;
        }
    }

    if (control === playerEmail) {
        const value = control.value.trim();
        if (!value) {
            setError(control, 'Email address is required.');
            return false;
        }
        const strictEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (control.validity.typeMismatch || !strictEmailRegex.test(value)) {
            setError(control, 'Enter a valid email address (e.g., name@example.com).');
            return false;
        }
    }

    if (control === feedbackCategory && !control.value) {
        setError(control, 'Please select an evaluation category.');
        return false;
    }

    if (control === comments) {
        const value = control.value.trim();
        if (!value) {
            setError(control, 'Comments are required.');
            return false;
        }
        if (value.length < 5) {
            setError(control, 'Comments must be at least 5 characters long.');
            return false;
        }
    }

    if (control === consent && !control.checked) {
        setError(control, 'You must check the playtest confirmation box.');
        return false;
    }

    return control.checkValidity();
}

// ============================================================
// UI HELPERS
// ============================================================
function updateNameExtension() {
    if (!playerName || !namePreview || !nameCounter) return;
    const rawValue = playerName.value;
    namePreview.textContent = `Name preview: ${rawValue || '-'}`;
    const maxLen = playerName.maxLength > 0 ? playerName.maxLength : 30;
    const remaining = maxLen - rawValue.length;
    nameCounter.textContent = `${remaining} character${remaining === 1 ? '' : 's'} remaining`;
}

function showStatus(message, type) {
    if (!formStatus) return;
    formStatus.style.color = type === 'error' ? '#f87171' : '#4ade80';
    formStatus.textContent = message;
    
    if (feedbackScreen) {
        feedbackScreen.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function clearStatus() {
    if (!formStatus) return;
    formStatus.textContent = '';
}

function focusFirstInvalid() {
    const firstInvalid = fields.find(control => control && (!control.checkValidity() || (control === consent && !control.checked)));
    if (firstInvalid) {
        firstInvalid.focus();
    }
}

function renderSummary(data) {
    if (!summaryCard) return;
    document.getElementById('summaryName').textContent = data.playerName;
    document.getElementById('summaryEmail').textContent = data.playerEmail;
    document.getElementById('summaryCategory').textContent = data.feedbackCategory;
    document.getElementById('summaryComments').textContent = data.comments;
    document.getElementById('summaryConsent').textContent = data.consent ? 'Confirmed' : 'Not confirmed';
    summaryCard.hidden = false;

    summaryCard.scrollIntoView({ behavior: 'smooth' });
}

// ============================================================
// SCREEN MODAL NAVIGATION
// ============================================================
function openFeedbackModal() {
    mainMenu?.classList.add('hidden');
    gameOverScreen?.classList.add('hidden');
    highScoreScreen?.classList.add('hidden');

    fields.forEach(clearError);
    clearStatus();
    if (summaryCard) summaryCard.hidden = true;
    form?.classList.remove('hidden');
    feedbackScreen?.classList.remove('hidden');
    updateNameExtension();
}

function closeFeedbackModal() {
    feedbackScreen?.classList.add('hidden');
    
    // Safely check if game is active without crashing if gameActive is undefined
    const isPlaying = typeof gameActive !== 'undefined' && gameActive;
    if (!isPlaying) {
        mainMenu?.classList.remove('hidden');
    }

    setTimeout(() => {
        form?.reset();
        fields.forEach(clearError);
        clearStatus();
        if (summaryCard) summaryCard.hidden = true;
        form?.classList.remove('hidden');
        updateNameExtension();
    }, 300);
}

openFormBtn?.addEventListener('click', openFeedbackModal);
openFormBtnNav?.addEventListener('click', openFeedbackModal);
closeFormBtn?.addEventListener('click', closeFeedbackModal);

// ============================================================
// EXPORT FEEDBACK FUNCTIONALITY
// ============================================================
exportFeedbackBtn?.addEventListener('click', () => {
    const storedFeedback = JSON.parse(localStorage.getItem('game_feedback') || '[]');
    
    if (storedFeedback.length === 0 && (!playerName?.value && !comments?.value)) {
        alert('No feedback entries recorded yet!');
        return;
    }

    let fileContent = `=====================================\n` +
                        `       PLAYER FEEDBACK REPORT        \n` +
                        `=====================================\n\n`;

    if (storedFeedback.length > 0) {
        storedFeedback.forEach((entry, idx) => {
            fileContent += `#${idx + 1} Name       : ${entry.playerName}\n` +
                           `   Email      : ${entry.playerEmail}\n` +
                           `   Category   : ${entry.feedbackCategory}\n` +
                           `   Playtested : ${entry.consent ? 'Yes' : 'No'}\n` +
                           `   Comments   : ${entry.comments}\n` +
                           `   Date       : ${entry.date}\n` +
                           `-------------------------------------\n`;
        });
    } else {
        fileContent += `Name       : ${playerName?.value.trim() || 'Anonymous'}\n` +
                       `Email      : ${playerEmail?.value.trim() || 'N/A'}\n` +
                       `Category   : ${feedbackCategory?.value || 'Uncategorized'}\n` +
                       `Playtested : ${consent?.checked ? 'Yes' : 'No'}\n` +
                       `Comments   : ${comments?.value.trim() || 'No comments'}\n` +
                       `Date       : ${new Date().toLocaleString()}\n`;
    }

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'feedback.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
});

// ============================================================
// EVENT LISTENERS & DATABASE SUBMISSION
// ============================================================
playerName?.addEventListener('input', () => {
    updateNameExtension();
    clearError(playerName);
});

playerEmail?.addEventListener('input', () => clearError(playerEmail));
comments?.addEventListener('input', () => clearError(comments));

fields.forEach(control => {
    if (!control) return;
    control.addEventListener('blur', () => validateField(control));
    control.addEventListener('change', () => validateField(control));
});

form?.addEventListener('input', clearStatus);

form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearStatus();
    if (summaryCard) summaryCard.hidden = true;

    const validationResults = fields.map(validateField);
    const allValid = validationResults.every(Boolean);

    if (!allValid) {
        showStatus('Please fix highlighted fields and check the playtest box.', 'error');
        focusFirstInvalid();
        return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
    }

    const data = {
        playerName: playerName.value.trim(),
        playerEmail: playerEmail.value.trim(),
        feedbackCategory: feedbackCategory.value,
        comments: comments.value.trim(),
        consent: consent.checked,
        date: new Date().toLocaleString()
    };

    try {
        const stored = JSON.parse(localStorage.getItem('game_feedback') || '[]');
        stored.push(data);
        localStorage.setItem('game_feedback', JSON.stringify(stored));
    } catch (e) {
        console.warn('LocalStorage unavailable');
    }

    try {
        const response = await fetch('/api/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error('API error');
        showStatus('Feedback saved successfully to database!', 'success');
    } catch (err) {
        showStatus('Feedback saved locally in LocalStorage!', 'success');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Entry';
        }
    }

    renderSummary(data);
    form.reset();
    updateNameExtension();
});

updateNameExtension();