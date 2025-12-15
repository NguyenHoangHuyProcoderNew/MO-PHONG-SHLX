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
let hasTriggeredTimeout = false; // Flag to prevent multiple triggers for 20s
let hasTriggered30sTimeout = false; // Flag to prevent multiple triggers for 30s
let currentAudio = null; // Track currently playing audio
let currentQuestion = 1; // Track current question: 1=XUẤT PHÁT, 2=NHƯỜNG ĐƯỜNG, 3=DỐC CẦU
let hasTriggeredCurrentTimeout = false; // Flag for current question timeout (reset per question)

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

    // Setup next question 2 button  
    setupNextQuestion2Button();

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

    // Bài 1: XUẤT PHÁT
    if (currentQuestion === 1) {
        if (errorName.includes('Không thắt dây an toàn')) {
            audioFile = 'KO THAT DAY AN TOAN XUAT PHAT SA HINH.mp3';
        } else if (errorName.includes('Không bật xi nhan trái')) {
            audioFile = 'KO BAT SI NHAN TRAI XUAT PHAT SA HINH.mp3';
        } else if (errorName.includes('Không tắt xi nhan trái')) {
            audioFile = 'KO TAT SI NHAN TRAI XUAT PHAT SA HINH.mp3';
        }
    }
    // Bài 2: NHƯỜNG ĐƯỜNG CHO NGƯỜI ĐI BỘ
    else if (currentQuestion === 2) {
        if (errorName.includes('Không dừng xe')) {
            audioFile = 'KO DUNG XE SA HINH NGUOI DI BO.mp3';
        } else if (errorName.includes('Dừng xe chưa đến vị trí')) {
            audioFile = 'DUNG XE CHUA DEN VI TRI NGUOI DI BO SA HINH.mp3';
        } else if (errorName.includes('Dừng xe quá vị trí')) {
            audioFile = 'DUNG XE QUA VI TRI NGUOI DI BO SA HINH.mp3';
        }
    }
    // Bài 3: DỪNG VÀ KHỞI HÀNH XE NGANG DỐC
    else if (currentQuestion === 3) {
        if (errorName.includes('Không dừng xe ở vạch dừng')) {
            audioFile = 'KO DUNG XE DOC CAU.mp3';
        } else if (errorName.includes('Dừng xe chưa đến vị trí')) {
            audioFile = 'DUNG XE CHUA DEN VI TRI DOC CAU.mp3';
        } else if (errorName.includes('Dừng xe quá vị trí')) {
            audioFile = 'DUNG XE QUA VI TRI DOC CAU.mp3';
        } else if (errorName.includes('Xe tụt dốc quá 50')) {
            audioFile = 'XE TUT DOC QUA 50CM DOC CAU.mp3';
        }
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

        // Check if total time exceeds 30 seconds without switching question (only trigger once)
        if (totalSeconds === 31 && !hasTriggered30sTimeout) {
            handle30sTimeoutPenalty();
            hasTriggered30sTimeout = true;
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

function handle30sTimeoutPenalty() {
    console.log('⏰ Quá 30 giây chưa chuyển bài!');

    // Stop and clear previous audio if it's playing
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }

    // Play 30s timeout audio
    currentAudio = new Audio('30 GIAY KHONG XUAT PHAT SA HINH.mp3');
    currentAudio.play().catch(error => {
        console.error('Error playing 30s timeout audio:', error);
    });

    // Deduct 25 points
    score = Math.max(0, score - 25); // Don't go below 0
    updateDisplay();

    console.log('💔💔💔 Trừ 25 điểm. Điểm hiện tại:', score);
}

// Timeout penalty for Question 3 (Doc Cau) - 30 seconds
function handleDocCauTimeoutPenalty() {
    console.log('⏰ Quá 30 giây tại dốc cầu!');

    // Stop and clear previous audio if it's playing
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }

    // Play Doc Cau 30s timeout audio
    currentAudio = new Audio('30 GIAY KHONG QUA DOC CAU.mp3');
    currentAudio.play().catch(error => {
        console.error('Error playing Doc Cau timeout audio:', error);
    });

    // Deduct 25 points
    score = Math.max(0, score - 25); // Don't go below 0
    updateDisplay();

    console.log('💔💔💔 Trừ 25 điểm (Dốc cầu). Điểm hiện tại:', score);
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

        // Check timeout for question 3 (Doc Cau): 30 seconds
        if (currentQuestion === 3 && currentSeconds === 31 && !hasTriggeredCurrentTimeout) {
            handleDocCauTimeoutPenalty();
            hasTriggeredCurrentTimeout = true;
        }
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
    hasTriggeredCurrentTimeout = false; // Reset timeout flag for new question
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

    // Disable 20-second timeout penalty permanently after switching question
    hasTriggeredTimeout = true;
    // Disable 30-second timeout penalty permanently after switching question
    hasTriggered30sTimeout = true;

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


    // Show Tune button for Nhuong Duong question
    const tuneBtn = document.getElementById('tuneBtn');
    if (tuneBtn) tuneBtn.style.display = 'flex';

    // Show next2 button for navigating to Doc Cau
    const nextQuestion2Btn = document.getElementById('nextQuestion2Btn');
    if (nextQuestion2Btn) nextQuestion2Btn.style.display = 'flex';

    console.log('🔊 Đang phát: NHUONG DUONG CHO NGUOI DI BO SA HINH.mp3');
    console.log('✅ Đã chuyển sang bài: NHƯỜNG ĐƯỜNG CHO NGƯỜI ĐI BỘ');
    console.log('📊 Điểm hiện tại:', score);
    console.log('⏰ Tổng thời gian:', formatTime(totalSeconds));

    currentQuestion = 2;
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

    // Reset current time for question
    resetCurrentTime();

    const examNameTitle = document.querySelector('.exam-name-title');
    const examErrorButtons = document.querySelectorAll('.exam-error-btn');
    const nextBtn = document.getElementById('nextQuestionBtn');
    const prevBtn = document.getElementById('prevQuestionBtn');
    const tuneBtn = document.getElementById('tuneBtn');
    const nextQuestion2Btn = document.getElementById('nextQuestion2Btn');

    // Handle based on current question
    if (currentQuestion === 2) {
        // Go back to Question 1: XUẤT PHÁT
        currentAudio = new Audio('XUAT PHAT SA HINH.mp3');
        currentAudio.play().catch(error => console.log('Error playing audio:', error));

        if (examNameTitle) examNameTitle.textContent = 'XUẤT PHÁT';

        // Update buttons for Question 1
        if (examErrorButtons.length >= 3) {
            const btn1Name = examErrorButtons[0].querySelector('.error-name');
            const btn1Penalty = examErrorButtons[0].querySelector('.error-penalty');
            if (btn1Name) btn1Name.textContent = 'Không thắt dây an toàn';
            if (btn1Penalty) btn1Penalty.textContent = '(-5đ)';
            examErrorButtons[0].dataset.penalty = '-5';

            const btn2Name = examErrorButtons[1].querySelector('.error-name');
            const btn2Penalty = examErrorButtons[1].querySelector('.error-penalty');
            if (btn2Name) btn2Name.textContent = 'Không bật xi nhan trái';
            if (btn2Penalty) btn2Penalty.textContent = '(-5đ)';
            examErrorButtons[1].dataset.penalty = '-5';

            const btn3Name = examErrorButtons[2].querySelector('.error-name');
            const btn3Penalty = examErrorButtons[2].querySelector('.error-penalty');
            if (btn3Name) btn3Name.textContent = 'Không tắt xi nhan trái';
            if (btn3Penalty) btn3Penalty.textContent = '(-5đ)';
            examErrorButtons[2].dataset.penalty = '-5';
        }

        if (nextBtn) nextBtn.style.display = 'flex';
        if (prevBtn) prevBtn.style.display = 'none';
        if (tuneBtn) tuneBtn.style.display = 'none';
        if (nextQuestion2Btn) nextQuestion2Btn.style.display = 'none';

        currentQuestion = 1;
        console.log('✅ Đã quay lại bài: XUẤT PHÁT');

    } else if (currentQuestion === 3) {
        // Go back to Question 2: NHƯỜNG ĐƯỜNG
        currentAudio = new Audio('NHUONG DUONG CHO NGUOI DI BO SA HINH.mp3');
        currentAudio.play().catch(error => console.log('Error playing audio:', error));

        if (examNameTitle) examNameTitle.textContent = 'NHƯỜNG ĐƯỜNG CHO NGƯỜI ĐI BỘ';

        // Update buttons for Question 2
        if (examErrorButtons.length >= 4) {
            const btn1Name = examErrorButtons[0].querySelector('.error-name');
            const btn1Penalty = examErrorButtons[0].querySelector('.error-penalty');
            if (btn1Name) btn1Name.textContent = 'Không dừng xe';
            if (btn1Penalty) btn1Penalty.textContent = '(-5đ)';
            examErrorButtons[0].dataset.penalty = '-5';

            const btn2Name = examErrorButtons[1].querySelector('.error-name');
            const btn2Penalty = examErrorButtons[1].querySelector('.error-penalty');
            if (btn2Name) btn2Name.textContent = 'Dừng xe chưa đến vị trí';
            if (btn2Penalty) btn2Penalty.textContent = '(-5đ)';
            examErrorButtons[1].dataset.penalty = '-5';

            const btn3Name = examErrorButtons[2].querySelector('.error-name');
            const btn3Penalty = examErrorButtons[2].querySelector('.error-penalty');
            if (btn3Name) btn3Name.textContent = 'Dừng xe quá vị trí';
            if (btn3Penalty) btn3Penalty.textContent = '(-25đ)';
            examErrorButtons[2].dataset.penalty = '-25';

            // Hide button 4
            examErrorButtons[3].style.display = 'none';
        }

        if (nextBtn) nextBtn.style.display = 'none';
        if (prevBtn) {
            prevBtn.style.display = 'flex';
            const prevBtnText = prevBtn.querySelector('.prev-btn-text');
            if (prevBtnText) prevBtnText.textContent = 'Quay lại bài XUẤT PHÁT';
        }
        if (tuneBtn) tuneBtn.style.display = 'flex';
        if (nextQuestion2Btn) nextQuestion2Btn.style.display = 'flex';

        currentQuestion = 2;
        console.log('✅ Đã quay lại bài: NHƯỜNG ĐƯỜNG CHO NGƯỜI ĐI BỘ');
    }

    console.log('📊 Điểm hiện tại:', score);
    console.log('⏰ Tổng thời gian:', formatTime(totalSeconds));
}


// ===== Third Question Button (Doc Cau) =====
function setupNextQuestion2Button() {
    const nextQuestion2Btn = document.getElementById('nextQuestion2Btn');
    if (nextQuestion2Btn) {
        nextQuestion2Btn.addEventListener('click', () => {
            handleThirdQuestion();
        });
    }
}

function handleThirdQuestion() {
    console.log('➡️ Chuyển sang bài 3: DỪNG VÀ KHỞI HÀNH XE NGANG DỐC');

    // Stop and clear previous audio if it's playing
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }

    // Play Doc Cau audio
    currentAudio = new Audio('DUNG VA KHOI HANH XE NGANG DOC.mp3');
    currentAudio.play().catch(error => {
        console.log('Error playing audio:', error);
    });

    // Reset current time for new question
    resetCurrentTime();

    // Update exam name title
    const examNameTitle = document.querySelector('.exam-name-title');
    if (examNameTitle) {
        examNameTitle.textContent = 'DỪNG VÀ KHỞI HÀNH XE NGANG DỐC';
    }

    // Update exam-specific error buttons (4 buttons)
    const examErrorButtons = document.querySelectorAll('.exam-error-btn');
    if (examErrorButtons.length >= 4) {
        // Button 1: Không dừng xe ở vạch dừng (-25đ)
        const btn1Name = examErrorButtons[0].querySelector('.error-name');
        const btn1Penalty = examErrorButtons[0].querySelector('.error-penalty');
        if (btn1Name) btn1Name.textContent = 'Không dừng xe ở vạch dừng quy định';
        if (btn1Penalty) btn1Penalty.textContent = '(-25đ)';
        examErrorButtons[0].dataset.penalty = '-25';

        // Button 2: Dừng xe chưa đến vị trí (-5đ)
        const btn2Name = examErrorButtons[1].querySelector('.error-name');
        const btn2Penalty = examErrorButtons[1].querySelector('.error-penalty');
        if (btn2Name) btn2Name.textContent = 'Dừng xe chưa đến vị trí';
        if (btn2Penalty) btn2Penalty.textContent = '(-5đ)';
        examErrorButtons[1].dataset.penalty = '-5';

        // Button 3: Dừng xe quá vị trí (-25đ)
        const btn3Name = examErrorButtons[2].querySelector('.error-name');
        const btn3Penalty = examErrorButtons[2].querySelector('.error-penalty');
        if (btn3Name) btn3Name.textContent = 'Dừng xe quá vị trí';
        if (btn3Penalty) btn3Penalty.textContent = '(-25đ)';
        examErrorButtons[2].dataset.penalty = '-25';

        // Button 4: Xe tụt dốc quá 50 cm (-25đ) - Show this button
        examErrorButtons[3].style.display = 'flex';
        const btn4Name = examErrorButtons[3].querySelector('.error-name');
        const btn4Penalty = examErrorButtons[3].querySelector('.error-penalty');
        if (btn4Name) btn4Name.textContent = 'Xe tụt dốc quá 50 cm';
        if (btn4Penalty) btn4Penalty.textContent = '(-25đ)';
        examErrorButtons[3].dataset.penalty = '-25';
    }

    // Hide next2 button, keep prev button showing
    const nextQuestion2Btn = document.getElementById('nextQuestion2Btn');
    if (nextQuestion2Btn) nextQuestion2Btn.style.display = 'none';

    // Update prev button text
    const prevBtn = document.getElementById('prevQuestionBtn');
    if (prevBtn) {
        const prevBtnText = prevBtn.querySelector('.prev-btn-text');
        if (prevBtnText) prevBtnText.textContent = 'Quay lại bài NHƯỜNG ĐƯỜNG';
    }

    // Keep Tune button showing
    const tuneBtn = document.getElementById('tuneBtn');
    if (tuneBtn) tuneBtn.style.display = 'flex';

    currentQuestion = 3;

    console.log('✅ Đã chuyển sang bài 3: DỪNG VÀ KHỞI HÀNH XE NGANG DỐC');
    console.log('📊 Điểm hiện tại:', score);
    console.log('⏰ Tổng thời gian:', formatTime(totalSeconds));
}
