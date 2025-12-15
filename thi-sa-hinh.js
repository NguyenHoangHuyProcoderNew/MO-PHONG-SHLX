// ===== DOM Elements =====
const scoreElement = document.getElementById('score');
const totalTimeElement = document.getElementById('totalTime');
const currentTimeElement = document.getElementById('currentTime');

// ===== Variables =====
let score = 100;
let totalSeconds = 0;
let currentSeconds = 0;
let totalTimerInterval = null;
let currentTimerInterval = null;
let hasTriggeredTimeout = false; // Flag to prevent multiple triggers
let currentAudio = null; // Track currently playing audio

// ===== Check if user came from homepage =====
// If not (direct access or refresh), redirect to homepage
if (!sessionStorage.getItem('examStarted')) {
    console.log('🔄 Redirecting to homepage (no flag)...');
    window.location.href = 'index.html';
} else {
    // Clear the flag immediately so refresh will redirect
    sessionStorage.removeItem('examStarted');
    console.log('✅ Exam started from homepage - flag cleared');
}

// ===== Audio on Page Load =====
window.addEventListener('DOMContentLoaded', () => {
    // Initialize display
    updateDisplay();

    // Play welcome audio when page loads and track it
    currentAudio = new Audio('XUAT PHAT SA HINH.mp3');
    currentAudio.play().catch(error => {
        console.log('Error playing audio:', error);
    });

    // Start timers automatically
    startTotalTimer();
    startCurrentTimer();

    // Setup error button listeners
    setupErrorButtons();

    // Setup next question button
    setupNextButton();

    // Setup previous question button
    setupPrevButton();

    console.log('🎵 Trang Thi Sa Hình đã được tải');
    console.log('⏱️ Đã bắt đầu đếm thời gian...');
    console.log('⚠️ Lưu ý: Sau 20 giây sẽ bị trừ 5 điểm!');
});

// ===== Setup Error Buttons =====
function setupErrorButtons() {
    // Setup common error buttons
    const errorButtons = document.querySelectorAll('.error-btn');
    errorButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const penalty = parseInt(btn.dataset.penalty);
            const errorName = btn.querySelector('.error-name').textContent;
            handleErrorPenalty(penalty, errorName, btn);
        });
    });

    // Setup exam-specific error buttons
    const examErrorButtons = document.querySelectorAll('.exam-error-btn');
    examErrorButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const penalty = parseInt(btn.dataset.penalty);
            const errorName = btn.querySelector('.error-name').textContent;
            handleExamErrorPenalty(penalty, errorName, btn);
        });
    });

    // Setup audio buttons (no penalty, just play sound)
    const audioButtons = document.querySelectorAll('.audio-btn');
    audioButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const audioFile = btn.dataset.audio;
            const audioName = btn.querySelector('.audio-name').textContent;
            handleAudioPlay(audioFile, audioName, btn);
        });
    });
}

function handleErrorPenalty(penalty, errorName, button) {
    // Deduct points
    score = Math.max(0, score + penalty); // penalty is negative, so we add it
    updateDisplay();

    console.log(`⚠️ Lỗi: ${errorName} | Trừ ${Math.abs(penalty)} điểm | Điểm hiện tại: ${score}`);

    // Visual feedback - briefly highlight the button
    button.style.background = 'rgba(251, 191, 36, 0.3)';
    button.style.borderColor = 'rgba(251, 191, 36, 0.7)';

    setTimeout(() => {
        button.style.background = 'rgba(251, 191, 36, 0.1)';
        button.style.borderColor = 'rgba(251, 191, 36, 0.3)';
    }, 300);

    // Play corresponding audio based on error type
    playErrorAudio(errorName);
}

function handleExamErrorPenalty(penalty, errorName, button) {
    // Deduct points
    score = Math.max(0, score + penalty); // penalty is negative, so we add it
    updateDisplay();

    console.log(`⚠️ Lỗi trong bài thi: ${errorName} | Trừ ${Math.abs(penalty)} điểm | Điểm hiện tại: ${score}`);

    // Visual feedback - briefly highlight the button (blue theme)
    button.style.background = 'rgba(96, 165, 250, 0.3)';
    button.style.borderColor = 'rgba(96, 165, 250, 0.7)';

    setTimeout(() => {
        button.style.background = 'rgba(96, 165, 250, 0.1)';
        button.style.borderColor = 'rgba(96, 165, 250, 0.3)';
    }, 300);

    // Play corresponding audio
    playExamErrorAudio(errorName);
}

function handleAudioPlay(audioFile, audioName, button) {
    console.log(`🔊 Phát âm thanh: ${audioName}`);

    // Visual feedback - briefly highlight the button (purple theme)
    button.style.background = 'rgba(168, 85, 247, 0.3)';
    button.style.borderColor = 'rgba(168, 85, 247, 0.7)';

    setTimeout(() => {
        button.style.background = 'rgba(168, 85, 247, 0.1)';
        button.style.borderColor = 'rgba(168, 85, 247, 0.3)';
    }, 300);

    // Stop and clear previous audio if it's playing
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }

    // Play the audio
    if (audioFile) {
        currentAudio = new Audio(audioFile);
        currentAudio.play().catch(error => {
            console.log('Error playing audio:', error);
        });
    }
}

function playErrorAudio(errorName) {
    // Stop and clear previous audio if it's playing
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }

    let audioFile = '';

    if (errorName.includes('Chết máy')) {
        audioFile = 'CHET MAY SA HINH.mp3';
    } else if (errorName.includes('quá tốc độ')) {
        audioFile = 'DI QUA TOC DO SA HINH.mp3';
    } else if (errorName.includes('Vòng tua')) {
        audioFile = 'VONG TUA QUA 4000 SA HINH.mp3';
    }

    if (audioFile) {
        currentAudio = new Audio(audioFile);
        currentAudio.play().catch(error => {
            console.log('Error playing audio:', error);
        });
    }
}

function playExamErrorAudio(errorName) {
    // Stop and clear previous audio if it's playing
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }

    let audioFile = '';

    if (errorName.includes('Không thắt dây an toàn')) {
        audioFile = 'KO THAT DAY AN TOAN XUAT PHAT SA HINH.mp3';
    } else if (errorName.includes('Không bật xi nhan trái')) {
        audioFile = 'KO BAT SI NHAN TRAI XUAT PHAT SA HINH.mp3';
    } else if (errorName.includes('Không tắt xi nhan trái')) {
        audioFile = 'KO TAT SI NHAN TRAI XUAT PHAT SA HINH.mp3';
    }

    if (audioFile) {
        currentAudio = new Audio(audioFile);
        currentAudio.play().catch(error => {
            console.log('Error playing audio:', error);
        });
    }
}

// ===== Format Time Function =====
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// ===== Update Display =====
function updateDisplay() {
    scoreElement.textContent = score;
    totalTimeElement.textContent = formatTime(totalSeconds);
    currentTimeElement.textContent = formatTime(currentSeconds);
}

// ===== Timer Functions =====
function startTotalTimer() {
    // Clear existing timer if any
    if (totalTimerInterval) {
        clearInterval(totalTimerInterval);
    }

    // Start new timer - count up
    totalTimerInterval = setInterval(() => {
        totalSeconds++;
        updateDisplay();

        // Check if total time exceeds 20 seconds (only trigger once)
        if (totalSeconds === 21 && !hasTriggeredTimeout) {
            handleTimeoutPenalty();
            hasTriggeredTimeout = true;
        }
    }, 1000);
}

function handleTimeoutPenalty() {
    console.log('⏰ Hết thời gian! Quá 20 giây.');

    // Play timeout audio
    const timeoutAudio = new Audio('20 GIAY KHONG XUAT PHAT SA HINH.mp3');
    timeoutAudio.play().catch(error => {
        console.error('Error playing timeout audio:', error);
    });

    // Deduct 5 points
    score = Math.max(0, score - 5); // Don't go below 0
    updateDisplay();

    console.log('💔 Trừ 5 điểm. Điểm hiện tại:', score);
}

function startCurrentTimer() {
    // Clear existing timer if any
    if (currentTimerInterval) {
        clearInterval(currentTimerInterval);
    }

    // Start new timer - count up
    currentTimerInterval = setInterval(() => {
        currentSeconds++;
        updateDisplay();
    }, 1000);
}

function stopTimers() {
    if (totalTimerInterval) {
        clearInterval(totalTimerInterval);
        totalTimerInterval = null;
    }
    if (currentTimerInterval) {
        clearInterval(currentTimerInterval);
        currentTimerInterval = null;
    }
}

// ===== Public Functions for Other Components =====
function updateScore(newScore) {
    score = newScore;
    updateDisplay();
}

function resetCurrentTime() {
    currentSeconds = 0;
    updateDisplay();
    // Restart current timer
    startCurrentTimer();
}

function getTotalTime() {
    return totalSeconds;
}

function getCurrentTime() {
    return currentSeconds;
}

function getScore() {
    return score;
}

// ===== Cleanup on page unload =====
window.addEventListener('beforeunload', () => {
    stopTimers();
    // Stop audio if playing
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
});

// ===== Next Question Button =====
function setupNextButton() {
    const nextBtn = document.getElementById('nextQuestionBtn');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            handleNextQuestion();
        });
    }
}

function handleNextQuestion() {
    console.log('➡️ Chuyển sang câu tiếp theo...');

    // Stop and clear previous audio if it's playing
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }

    // Play next question audio
    currentAudio = new Audio('NHUONG DUONG CHO NGUOI DI BO SA HINH.mp3');
    currentAudio.play().catch(error => {
        console.log('Error playing audio:', error);
    });

    // Reset current time for new question
    resetCurrentTime();

    // Update exam name title
    const examNameTitle = document.querySelector('.exam-name-title');
    if (examNameTitle) {
        examNameTitle.textContent = 'NHƯỜNG ĐƯỜNG CHO NGƯỜI ĐI BỘ';
    }

    // Update exam-specific error buttons
    const examErrorButtons = document.querySelectorAll('.exam-error-btn');
    if (examErrorButtons.length >= 3) {
        // Button 1: Không dừng xe
        const btn1Name = examErrorButtons[0].querySelector('.error-name');
        const btn1Penalty = examErrorButtons[0].querySelector('.error-penalty');
        if (btn1Name) btn1Name.textContent = 'Không dừng xe';
        if (btn1Penalty) btn1Penalty.textContent = '(-5đ)';
        examErrorButtons[0].dataset.penalty = '-5';

        // Button 2: Dừng xe chưa đến vị trí
        const btn2Name = examErrorButtons[1].querySelector('.error-name');
        const btn2Penalty = examErrorButtons[1].querySelector('.error-penalty');
        if (btn2Name) btn2Name.textContent = 'Dừng xe chưa đến vị trí';
        if (btn2Penalty) btn2Penalty.textContent = '(-5đ)';
        examErrorButtons[1].dataset.penalty = '-5';

        // Button 3: Dừng xe quá vị trí
        const btn3Name = examErrorButtons[2].querySelector('.error-name');
        const btn3Penalty = examErrorButtons[2].querySelector('.error-penalty');
        if (btn3Name) btn3Name.textContent = 'Dừng xe quá vị trí';
        if (btn3Penalty) btn3Penalty.textContent = '(-5đ)';
        examErrorButtons[2].dataset.penalty = '-5';
    }

    // Hide next button and show previous button
    const nextBtn = document.getElementById('nextQuestionBtn');
    const prevBtn = document.getElementById('prevQuestionBtn');
    if (nextBtn) nextBtn.style.display = 'none';
    if (prevBtn) prevBtn.style.display = 'flex';

    console.log('🔊 Đang phát: NHUONG DUONG CHO NGUOI DI BO SA HINH.mp3');
    console.log('✅ Đã chuyển sang bài: NHƯỜNG ĐƯỜNG CHO NGƯỜI ĐI BỘ');
    console.log('📊 Điểm hiện tại:', score);
    console.log('⏰ Tổng thời gian:', formatTime(totalSeconds));
}

// ===== Previous Question Button =====
function setupPrevButton() {
    const prevBtn = document.getElementById('prevQuestionBtn');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            handlePrevQuestion();
        });
    }
}

function handlePrevQuestion() {
    console.log('⬅️ Quay lại câu trước...');

    // Stop and clear previous audio if it's playing
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }

    // Play first question audio
    currentAudio = new Audio('XUAT PHAT SA HINH.mp3');
    currentAudio.play().catch(error => {
        console.log('Error playing audio:', error);
    });

    // Reset current time for question
    resetCurrentTime();

    // Update exam name title back to XUẤT PHÁT
    const examNameTitle = document.querySelector('.exam-name-title');
    if (examNameTitle) {
        examNameTitle.textContent = 'XUẤT PHÁT';
    }

    // Update exam-specific error buttons back to original
    const examErrorButtons = document.querySelectorAll('.exam-error-btn');
    if (examErrorButtons.length >= 3) {
        // Button 1: Không thắt dây an toàn
        const btn1Name = examErrorButtons[0].querySelector('.error-name');
        const btn1Penalty = examErrorButtons[0].querySelector('.error-penalty');
        if (btn1Name) btn1Name.textContent = 'Không thắt dây an toàn';
        if (btn1Penalty) btn1Penalty.textContent = '(-5đ)';
        examErrorButtons[0].dataset.penalty = '-5';

        // Button 2: Không bật xi nhan trái
        const btn2Name = examErrorButtons[1].querySelector('.error-name');
        const btn2Penalty = examErrorButtons[1].querySelector('.error-penalty');
        if (btn2Name) btn2Name.textContent = 'Không bật xi nhan trái';
        if (btn2Penalty) btn2Penalty.textContent = '(-5đ)';
        examErrorButtons[1].dataset.penalty = '-5';

        // Button 3: Không tắt xi nhan trái
        const btn3Name = examErrorButtons[2].querySelector('.error-name');
        const btn3Penalty = examErrorButtons[2].querySelector('.error-penalty');
        if (btn3Name) btn3Name.textContent = 'Không tắt xi nhan trái';
        if (btn3Penalty) btn3Penalty.textContent = '(-5đ)';
        examErrorButtons[2].dataset.penalty = '-5';
    }

    // Show next button and hide previous button
    const nextBtn = document.getElementById('nextQuestionBtn');
    const prevBtn = document.getElementById('prevQuestionBtn');
    if (nextBtn) nextBtn.style.display = 'flex';
    if (prevBtn) prevBtn.style.display = 'none';

    console.log('🔊 Đang phát: XUAT PHAT SA HINH.mp3');
    console.log('✅ Đã quay lại bài: XUẤT PHÁT');
    console.log('📊 Điểm hiện tại:', score);
    console.log('⏰ Tổng thời gian:', formatTime(totalSeconds));
}
