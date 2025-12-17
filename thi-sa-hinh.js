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
let currentQuestion = 1; // 1=XUẤT PHÁT, 2=NHƯỜNG ĐƯỜNG, 3=DỐC CẦU, 4=VỆT BÁNH XE, 5=NGÃ TƯ 1, 6=ĐƯỜNG VÒNG, 7=NGÃ TƯ 2, 8=GHÉP DỌC, 9=NGÃ TƯ 3, 10=ĐƯỜNG SẮT, 11=THAY ĐỔI SỐ, 12=GHÉP NGANG, 13=NGÃ TƯ 4
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

    // ===== Helper Function: Hide All Next Buttons =====
    function hideAllNextButtons() {
        const nextQuestion2Btn = document.getElementById('nextQuestion2Btn');
        const nextQuestion3Btn = document.getElementById('nextQuestion3Btn');
        const nextQuestion4Btn = document.getElementById('nextQuestion4Btn');
        const nextQuestion5Btn = document.getElementById('nextQuestion5Btn');
        const nextQuestion6Btn = document.getElementById('nextQuestion6Btn');
        const nextQuestion7Btn = document.getElementById('nextQuestion7Btn');
        const nextQuestion8Btn = document.getElementById('nextQuestion8Btn');
        const nextQuestion9Btn = document.getElementById('nextQuestion9Btn');
        const nextQuestion10Btn = document.getElementById('nextQuestion10Btn');
        const nextQuestion11Btn = document.getElementById('nextQuestion11Btn');
        const nextQuestion12Btn = document.getElementById('nextQuestion12Btn');

        if (nextQuestion2Btn) nextQuestion2Btn.style.display = 'none';
        if (nextQuestion3Btn) nextQuestion3Btn.style.display = 'none';
        if (nextQuestion4Btn) nextQuestion4Btn.style.display = 'none';
        if (nextQuestion5Btn) nextQuestion5Btn.style.display = 'none';
        if (nextQuestion6Btn) nextQuestion6Btn.style.display = 'none';
        if (nextQuestion7Btn) nextQuestion7Btn.style.display = 'none';
        if (nextQuestion8Btn) nextQuestion8Btn.style.display = 'none';
        if (nextQuestion9Btn) nextQuestion9Btn.style.display = 'none';
        if (nextQuestion10Btn) nextQuestion10Btn.style.display = 'none';
        if (nextQuestion11Btn) nextQuestion11Btn.style.display = 'none';
        if (nextQuestion12Btn) nextQuestion12Btn.style.display = 'none';
    }


    // Start timers automatically
    startTotalTimer();
    startCurrentTimer();

    // Setup error button listeners
    setupErrorButtons();

    // Setup next question button
    setupNextButton();

    // Setup next question 2 button  
    setupNextQuestion2Button();
    // Setup next question 3 button
    setupNextQuestion3Button();
    // Setup next question 4 button
    setupNextQuestion4Button();
    // Setup next question 5 button
    setupNextQuestion5Button();
    // Setup next question 6 button
    setupNextQuestion6Button();
    // Setup next question 7 button
    setupNextQuestion7Button();
    // Setup next question 8 button
    setupNextQuestion8Button();
    // Setup next question 9 button
    setupNextQuestion9Button();
    // Setup next question 10 button
    setupNextQuestion10Button();
    // Setup next question 11 button
    setupNextQuestion11Button();

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

    // Bài 4: VẾT BÁNH XE
    else if (currentQuestion === 4) {
        if (errorName.includes("Bánh xe đè vạch")) {
            audioFile = "BANH XE DE VACH VET BANH XE.mp3";
        } else if (errorName.includes("Đi sai quy trình")) {
            audioFile = "DI SAI QUY TRINH VET BANH XE.mp3";
        }
    }
    // Bài 5: NGÃ TƯ 1
    else if (currentQuestion === 5) {
        if (errorName.includes("Vượt đèn đỏ")) {
            audioFile = "VUOT DEN DO NGA TU 1.mp3";
        } else if (errorName.includes("Dừng xe quá vạch dừng")) {
            audioFile = "DUNG XE QUA VI TRI NGA TU 1.mp3";
        } else if (errorName.includes("Không tuân thủ tín hiệu khẩn cấp")) {
            audioFile = "KO TUAN THU TIN HIEU KHAN CAP NGA TU 1.mp3";
        }
    }
    // Bài 6: ĐƯỜNG VÒNG
    else if (currentQuestion === 6) {
        if (errorName.includes("Bánh xe đè vạch")) {
            audioFile = "BANH XE DE VACH DUONG VONG.mp3";
        }
    }
    // Bài 7: NGÃ TƯ 2
    else if (currentQuestion === 7) {
        if (errorName.includes("Vượt đèn đỏ")) {
            audioFile = "VUOT DEN DO NGA TU 2.mp3";
        } else if (errorName.includes("Dừng xe quá vạch dừng")) {
            audioFile = "DUNG XE QUA VI TRI NGA TU 2.mp3";
        }
    }
    // Bài 8: GHÉP DỌC
    else if (currentQuestion === 8) {
        if (errorName.includes("Bánh xe đè vạch")) {
            audioFile = "BANH XE DE VACH GHEP DOC.mp3";
        } else if (errorName.includes("Đi sai quy trình")) {
            audioFile = "DI SAI QUY TRINH GHEP DOC.mp3";
        }
    }
    // Bài 9: NGÃ TƯ 3
    else if (currentQuestion === 9) {
        if (errorName.includes("Vượt đèn đỏ")) {
            audioFile = "VUOT DEN DO NGA TU 3.mp3";
        } else if (errorName.includes("Dừng xe quá vạch dừng")) {
            audioFile = "DUNG XE QUA VI TRI NGA TU 3.mp3";
        } else if (errorName.includes("Không mở xi nhan rẽ trái")) {
            audioFile = "KO BAT SI NHAN TRAI NGA TU THU 3.mp3";
        }
    }
    // Bài 10: ĐƯỜNG SẮT
    else if (currentQuestion === 10) {
        if (errorName.includes("Không dừng xe ở vạch dừng")) {
            audioFile = "KO DUNG XE DUONG SAT.mp3";
        } else if (errorName.includes("Dừng xe chưa đến vị trí")) {
            audioFile = "DUNG XE CHUA DEN VI TRI DUONG SAT.mp3";
        } else if (errorName.includes("Dừng xe quá vị trí")) {
            audioFile = "DUNG XE QUA VI TRI DUONG SAT.mp3";
        } else if (errorName.includes("Không tuân thủ tín hiệu khẩn cấp")) {
            audioFile = "KO TUAN THU KHAN CAP DUONG SAT.mp3";
        }
    }
    // Bài 12: GHÉP NGANG
    else if (currentQuestion === 12) {
        if (errorName.includes("Bánh xe đè vạch")) {
            audioFile = "BANH XE DE VACH GHEP NGANG.mp3";
        } else if (errorName.includes("Ghép xe sai vị trí")) {
            audioFile = "BO GHEP NGANG.mp3";
        } else if (errorName.includes("Đi sai quy trình")) {
            audioFile = "DI SAI QUY TRINH GHEP NGANG.mp3";
        }
    }

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
    // Bài 4: QUA VỆT BÁNH XE
    else if (currentQuestion === 4) {
        if (errorName.includes('Không đi qua vệt bánh xe')) {
            audioFile = 'KO DI QUA VET BANH XE.mp3';
        } else if (errorName.includes('Bánh xe đè vạch')) {
            audioFile = 'BANH XE DE VACH VET BANH XE.mp3';
        }
    }
    // Bài 5: NGÃ TƯ 1
    else if (currentQuestion === 5) {
        if (errorName.includes('Vượt đèn đỏ')) {
            audioFile = 'VUOT DEN DO NGA TU 1.mp3';
        } else if (errorName.includes('Dừng xe quá vạch dừng')) {
            audioFile = 'DUNG XE QUA VI TRI NGA TU 1.mp3';
        } else if (errorName.includes('Không tuân thủ tín hiệu khẩn cấp')) {
            audioFile = 'KO TUAN THU TIN HIEU KHAN CAP NGA TU 1.mp3';
        }
    }
    // Bài 6: ĐƯỜNG VÒNG QUANH CO
    else if (currentQuestion === 6) {
        if (errorName.includes('Bánh xe đè vạch')) {
            audioFile = 'BANH XE DE VACH DUONG QUANH CO.mp3';
        }
    }
    // Bài 7: NGÃ TƯ 2
    else if (currentQuestion === 7) {
        if (errorName.includes('Vượt đèn đỏ')) {
            audioFile = 'VUOT DEN DO NGA TU 2.mp3';
        } else if (errorName.includes('Dừng xe quá vạch dừng')) {
            audioFile = 'DUNG XE QUA VI TRI NGA TU 2.mp3';
        }
    }
    // Bài 8: GHÉP DỌC
    else if (currentQuestion === 8) {
        if (errorName.includes('Bánh xe đè vạch')) {
            audioFile = 'BANH XE DE VACH GHEP DOC.mp3';
        } else if (errorName.includes('Đi sai quy trình')) {
            audioFile = 'DI SAI QUY TRINH GHEP DOC.mp3';
        }
    }
    // Bài 9: NGÃ TƯ 3
    else if (currentQuestion === 9) {
        if (errorName.includes('Vượt đèn đỏ')) {
            audioFile = 'VUOT DEN DO NGA TU 3.mp3';
        } else if (errorName.includes('Dừng xe quá vạch dừng')) {
            audioFile = 'DUNG XE QUA VI TRI NGA TU 3.mp3';
        } else if (errorName.includes('Không mở xi nhan rẽ trái')) {
            audioFile = 'KO BAT SI NHAN TRAI NGA TU THU 3.mp3';
        }
    }
    // Bài 10: ĐƯỜNG SẮT
    else if (currentQuestion === 10) {
        if (errorName.includes('Không dừng xe ở vạch dừng')) {
            audioFile = 'KO DUNG XE DUONG SAT.mp3';
        } else if (errorName.includes('Dừng xe chưa đến vị trí')) {
            audioFile = 'DUNG XE CHUA DEN VI TRI DUONG SAT.mp3';
        } else if (errorName.includes('Dừng xe quá vị trí')) {
            audioFile = 'DUNG XE QUA VI TRI DUONG SAT.mp3';
        } else if (errorName.includes('Không tuân thủ tín hiệu khẩn cấp')) {
            audioFile = 'KO TUAN THU KHAN CAP DUONG SAT.mp3';
        }
    }
    // Bài 11: THAY ĐỔI SỐ
    else if (currentQuestion === 11) {
        if (errorName.includes('Không thay đổi số')) {
            audioFile = 'KO THAY DOI SO.mp3';
        } else if (errorName.includes('Không đạt tốc độ')) {
            audioFile = 'KO DAT TOC DO QUY DINH.mp3';
        }
    }
    // Bài 12: GHÉP NGANG
    else if (currentQuestion === 12) {
        if (errorName.includes('Bánh xe đè vạch')) {
            audioFile = 'BANH XE DE VACH GHEP NGANG.mp3';
        } else if (errorName.includes('Ghép xe sai vị trí')) {
            audioFile = 'BO GHEP NGANG.mp3';
        } else if (errorName.includes('Đi sai quy trình')) {
            audioFile = 'DI SAI QUY TRINH GHEP NGANG.mp3';
        } else if (errorName.includes('Không tuân thủ tín hiệu khẩn cấp')) {
            audioFile = 'KO TUAN THU KHAN CAP GHEP NGANG.mp3';
        }
    }
    // Bài 13: NGÃ TƯ 4
    else if (currentQuestion === 13) {
        if (errorName.includes('Vượt đèn đỏ')) {
            audioFile = 'VUOT DEN DO NGA TU 4.mp3';
        } else if (errorName.includes('Dừng xe quá vạch dừng')) {
            audioFile = 'DUNG XE QUA VI TRI NGA TU 4.mp3';
        } else if (errorName.includes('Không bật xi nhan phải')) {
            audioFile = 'KO BAT SI NHAN PHAI NGA TU 4.mp3';
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

// Function to hide all next buttons
function hideAllNextButtons() {
    const ids = [
        'nextQuestionBtn',
        'nextQuestion2Btn',
        'nextQuestion3Btn',
        'nextQuestion4Btn',
        'nextQuestion5Btn',
        'nextQuestion6Btn',
        'nextQuestion7Btn',
        'nextQuestion8Btn',
        'nextQuestion9Btn',
        'nextQuestion10Btn',
        'nextQuestion11Btn',
        'nextQuestion12Btn',
        'nextQuestion13Btn'
    ];

    ids.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.style.display = 'none';
    });
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

    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }

    resetCurrentTime();

    const examNameTitle = document.querySelector('.exam-name-title');
    const examErrorButtons = document.querySelectorAll('.exam-error-btn');
    const nextBtn = document.getElementById('nextQuestionBtn');
    const prevBtn = document.getElementById('prevQuestionBtn');
    const prevBtnText = prevBtn ? prevBtn.querySelector('.prev-btn-text') : null;
    const tuneBtn = document.getElementById('tuneBtn');
    const emergencyBtn = document.getElementById('emergencyBtn');

    const nextQuestion2Btn = document.getElementById('nextQuestion2Btn');
    const nextQuestion3Btn = document.getElementById('nextQuestion3Btn');
    const nextQuestion4Btn = document.getElementById('nextQuestion4Btn');
    const nextQuestion5Btn = document.getElementById('nextQuestion5Btn');
    const nextQuestion6Btn = document.getElementById('nextQuestion6Btn');
    const nextQuestion7Btn = document.getElementById('nextQuestion7Btn');
    const nextQuestion8Btn = document.getElementById('nextQuestion8Btn');
    const nextQuestion9Btn = document.getElementById('nextQuestion9Btn');
    const nextQuestion10Btn = document.getElementById('nextQuestion10Btn');
    const nextQuestion11Btn = document.getElementById('nextQuestion11Btn');
    const nextQuestion12Btn = document.getElementById('nextQuestion12Btn');
    const nextQuestion13Btn = document.getElementById('nextQuestion13Btn');

    const allNextBtns = [nextBtn, nextQuestion2Btn, nextQuestion3Btn, nextQuestion4Btn, nextQuestion5Btn, nextQuestion6Btn, nextQuestion7Btn, nextQuestion8Btn, nextQuestion9Btn, nextQuestion10Btn, nextQuestion11Btn, nextQuestion12Btn, nextQuestion13Btn];
    allNextBtns.forEach(btn => { if (btn) btn.style.display = 'none'; });

    const updateBtn = (index, name, penalty, hide = false) => {
        if (index < examErrorButtons.length) {
            const btn = examErrorButtons[index];
            if (hide) {
                btn.style.display = 'none';
            } else {
                btn.style.display = 'flex';
                btn.querySelector('.error-name').textContent = name;
                btn.querySelector('.error-penalty').textContent = penalty.startsWith('(-') ? penalty : `(${penalty}đ)`;
                btn.dataset.penalty = penalty.replace(/[()đ]/g, '');
            }
        }
    };

    if (currentQuestion === 2) {
        currentAudio = new Audio('XUAT PHAT SA HINH.mp3');
        if (examNameTitle) examNameTitle.textContent = 'XUẤT PHÁT';
        updateBtn(0, 'Không thắt dây an toàn', '-5');
        updateBtn(1, 'Không bật xi nhan trái', '-5');
        updateBtn(2, 'Không tắt xi nhan trái', '-5');
        updateBtn(3, '', '', true);
        if (nextBtn) nextBtn.style.display = 'flex';
        if (prevBtn) prevBtn.style.display = 'none';
        if (tuneBtn) tuneBtn.style.display = 'none';
        if (emergencyBtn) emergencyBtn.style.display = 'none';
        currentQuestion = 1;
    } else if (currentQuestion === 3) {
        currentAudio = new Audio('NHUONG DUONG CHO NGUOI DI BO SA HINH.mp3');
        if (examNameTitle) examNameTitle.textContent = 'NHƯỜNG ĐƯỜNG CHO NGƯỜI ĐI BỘ';
        updateBtn(0, 'Không dừng xe', '-5');
        updateBtn(1, 'Dừng xe chưa đến vị trí', '-5');
        updateBtn(2, 'Dừng xe quá vị trí', '-5');
        updateBtn(3, '', '', true);
        if (nextQuestion2Btn) nextQuestion2Btn.style.display = 'flex';
        if (prevBtnText) prevBtnText.textContent = 'Quay lại bài XUẤT PHÁT';
        if (tuneBtn) tuneBtn.style.display = 'flex';
        if (emergencyBtn) emergencyBtn.style.display = 'none';
        currentQuestion = 2;
    } else if (currentQuestion === 4) {
        currentAudio = new Audio('DUNG VA KHOI HANH XE NGANG DOC.mp3');
        if (examNameTitle) examNameTitle.textContent = 'DỪNG VÀ KHỞI HÀNH XE NGANG DỐC';
        updateBtn(0, 'Không dừng xe ở vạch dừng quy định', '-25');
        updateBtn(1, 'Dừng xe chưa đến vị trí', '-5');
        updateBtn(2, 'Dừng xe quá vị trí', '-25');
        updateBtn(3, 'Xe tụt dốc quá 50 cm', '-25');
        if (nextQuestion3Btn) nextQuestion3Btn.style.display = 'flex';
        if (prevBtnText) prevBtnText.textContent = 'Quay lại bài NHƯỜNG ĐƯỜNG';
        if (tuneBtn) tuneBtn.style.display = 'flex';
        currentQuestion = 3;
    } else if (currentQuestion === 5) {
        currentAudio = new Audio('QUA VET BANH XE SA HINH.mp3');
        if (examNameTitle) examNameTitle.textContent = 'QUA VỆT BÁNH XE VÀ ĐƯỜNG VÒNG VUÔNG GÓC';
        updateBtn(0, 'Không đi qua vệt bánh xe', '-25');
        updateBtn(1, 'Bánh xe đè vạch', '-5');
        updateBtn(2, '', '', true);
        updateBtn(3, '', '', true);
        if (nextQuestion4Btn) nextQuestion4Btn.style.display = 'flex';
        if (prevBtnText) prevBtnText.textContent = 'Quay lại bài DỐC CẦU';
        if (tuneBtn) tuneBtn.style.display = 'none';
        currentQuestion = 4;
    } else if (currentQuestion === 6) {
        currentAudio = new Audio('NGA TU 1.mp3');
        if (examNameTitle) examNameTitle.textContent = 'QUA NGÃ TƯ CÓ TÍN HIỆU ĐIỀU KHIỂN GIAO THÔNG';
        updateBtn(0, 'Vượt đèn đỏ', '-5');
        updateBtn(1, 'Dừng xe quá vạch dừng quy định', '-5');
        updateBtn(2, 'Không tuân thủ tín hiệu khẩn cấp', '-5');
        updateBtn(3, '', '', true);
        if (nextQuestion5Btn) nextQuestion5Btn.style.display = 'flex';
        if (prevBtnText) prevBtnText.textContent = 'Quay lại bài VỆT BÁNH XE';
        if (tuneBtn) tuneBtn.style.display = 'flex';
        if (emergencyBtn) emergencyBtn.style.display = 'flex';
        currentQuestion = 5;
    } else if (currentQuestion === 7) {
        currentAudio = new Audio('DUONG VONG QUANH CO.mp3');
        if (examNameTitle) examNameTitle.textContent = 'ĐƯỜNG VÒNG QUANH CO';
        updateBtn(0, 'Bánh xe đè vạch', '-5');
        updateBtn(1, '', '', true);
        updateBtn(2, '', '', true);
        updateBtn(3, '', '', true);
        if (nextQuestion6Btn) nextQuestion6Btn.style.display = 'flex';
        if (prevBtnText) prevBtnText.textContent = 'Quay lại bài NGÃ TƯ 1';
        if (tuneBtn) tuneBtn.style.display = 'none';
        if (emergencyBtn) emergencyBtn.style.display = 'none';
        currentQuestion = 6;
    } else if (currentQuestion === 8) {
        currentAudio = new Audio('NGA TU THU 2.mp3');
        if (examNameTitle) examNameTitle.textContent = 'QUA NGÃ TƯ CÓ TÍN HIỆU ĐIỀU KHIỂN GIAO THÔNG';
        updateBtn(0, 'Vượt đèn đỏ', '-5');
        updateBtn(1, 'Dừng xe quá vạch dừng quy định', '-5');
        updateBtn(2, '', '', true);
        updateBtn(3, '', '', true);
        if (nextQuestion7Btn) nextQuestion7Btn.style.display = 'flex';
        if (prevBtnText) prevBtnText.textContent = 'Quay lại bài ĐƯỜNG VÒNG';
        if (tuneBtn) tuneBtn.style.display = 'none';
        currentQuestion = 7;
    } else if (currentQuestion === 9) {
        currentAudio = new Audio('GHEP DOC.mp3');
        if (examNameTitle) examNameTitle.textContent = 'GHÉP XE DỌC VÀO NƠI ĐỖ';
        updateBtn(0, 'Bánh xe đè vạch', '-5');
        updateBtn(1, 'Đi sai quy trình', '-25');
        updateBtn(2, '', '', true);
        updateBtn(3, '', '', true);
        if (nextQuestion8Btn) nextQuestion8Btn.style.display = 'flex';
        if (prevBtnText) prevBtnText.textContent = 'Quay lại bài NGÃ TƯ 2';
        if (tuneBtn) tuneBtn.style.display = 'flex';
        currentQuestion = 8;
    } else if (currentQuestion === 10) {
        currentAudio = new Audio('NGA TU 3.mp3');
        if (examNameTitle) examNameTitle.textContent = 'QUA NGÃ TƯ CÓ TÍN HIỆU ĐIỀU KHIỂN GIAO THÔNG';
        updateBtn(0, 'Vượt đèn đỏ', '-5');
        updateBtn(1, 'Dừng xe quá vạch dừng quy định', '-5');
        updateBtn(2, 'Không mở xi nhan rẽ trái', '-5');
        updateBtn(3, '', '', true);
        if (nextQuestion9Btn) nextQuestion9Btn.style.display = 'flex';
        if (prevBtnText) prevBtnText.textContent = 'Quay lại bài GHÉP DỌC';
        if (tuneBtn) tuneBtn.style.display = 'none';
        currentQuestion = 9;
    } else if (currentQuestion === 11) {
        currentAudio = new Audio('NHUONG DUONG SAT.mp3');
        if (examNameTitle) examNameTitle.textContent = 'TẠM DỪNG Ở CHỖ CÓ ĐƯỜNG SẮT CHẠY QUA';
        updateBtn(0, 'Không dừng xe ở vạch dừng quy định', '-5');
        updateBtn(1, 'Dừng xe chưa đến vị trí', '-5');
        updateBtn(2, 'Dừng xe quá vị trí', '-5');
        updateBtn(3, 'Không tuân thủ tín hiệu khẩn cấp', '-10');
        if (nextQuestion10Btn) nextQuestion10Btn.style.display = 'flex';
        if (prevBtnText) prevBtnText.textContent = 'Quay lại bài NGÃ TƯ 3';
        if (tuneBtn) tuneBtn.style.display = 'flex';
        if (emergencyBtn) emergencyBtn.style.display = 'flex';
        currentQuestion = 10;
    } else if (currentQuestion === 12) {
        currentAudio = new Audio('BAI THI THAY DOI SO.mp3');
        if (examNameTitle) examNameTitle.textContent = 'THAY ĐỔI SỐ TRÊN ĐƯỜNG BẰNG';
        updateBtn(0, 'Không thay đổi số đúng quy định', '-5');
        updateBtn(1, 'Không đạt tốc độ đúng quy định', '-5');
        updateBtn(2, '', '', true);
        updateBtn(3, '', '', true);
        if (nextQuestion11Btn) nextQuestion11Btn.style.display = 'flex';
        if (prevBtnText) prevBtnText.textContent = 'Quay lại bài ĐƯỜNG SẮT';
        if (tuneBtn) tuneBtn.style.display = 'flex';
        if (emergencyBtn) emergencyBtn.style.display = 'none';
        currentQuestion = 11;
    } else if (currentQuestion === 13) {
        currentAudio = new Audio('GHEP NGANG.mp3');
        if (examNameTitle) examNameTitle.textContent = 'GHÉP XE NGANG VÀO NƠI ĐỖ';
        updateBtn(0, 'Bánh xe đè vạch', '-5');
        updateBtn(1, 'Ghép xe sai vị trí', '-5');
        updateBtn(2, 'Đi sai quy trình', '-25');
        updateBtn(3, 'Không tuân thủ tín hiệu khẩn cấp', '-10');

        if (nextQuestion12Btn) nextQuestion12Btn.style.display = 'flex';
        if (prevBtnText) prevBtnText.textContent = 'Quay lại bài THAY ĐỔI SỐ';
        if (tuneBtn) tuneBtn.style.display = 'flex';

        if (emergencyBtn) {
            emergencyBtn.dataset.audio = 'KHAN CAP GHEP NGANG.mp3';
            emergencyBtn.style.display = 'flex';
        }
        currentQuestion = 12;
    } else if (currentQuestion > 13) { // 14 or finish state
        currentAudio = new Audio('NGA TU 4.mp3');
        if (examNameTitle) examNameTitle.textContent = 'QUA NGÃ TƯ CÓ TÍN HIỆU ĐIỀU KHIỂN GIAO THÔNG (KẾT THÚC)';
        updateBtn(0, 'Vượt đèn đỏ', '-5');
        updateBtn(1, 'Dừng xe quá vạch dừng quy định', '-5');
        updateBtn(2, 'Không bật xi nhan phải', '-5');
        updateBtn(3, '', '', true);
        if (nextQuestion13Btn) nextQuestion13Btn.style.display = 'flex';
        if (prevBtnText) prevBtnText.textContent = 'Quay lại bài GHÉP NGANG';
        if (tuneBtn) tuneBtn.style.display = 'none';

        const commonErrors = document.querySelector('.common-errors-section');
        if (commonErrors) commonErrors.style.display = 'block';
        const examErrors = document.querySelector('.exam-errors-section');
        if (examErrors) examErrors.style.display = 'block';
        const contentArea = document.querySelector('.content-area');
        if (contentArea) contentArea.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 4rem 0; font-size: 1.125rem;">Nội dung sẽ được thêm vào đây...</p>`;

        currentQuestion = 13;
    }

    if (currentAudio) {
        currentAudio.play().catch(error => console.log('Error playing audio:', error));
    }

    console.log('✅ Back to Question:', currentQuestion);
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

    // Show next3 button for navigating to Qua Vet Banh Xe
    const nextQuestion3Btn = document.getElementById('nextQuestion3Btn');
    if (nextQuestion3Btn) nextQuestion3Btn.style.display = 'flex';

    currentQuestion = 3;

    console.log('✅ Đã chuyển sang bài 3: DỪNG VÀ KHỞI HÀNH XE NGANG DỐC');
    console.log('📊 Điểm hiện tại:', score);
    console.log('⏰ Tổng thời gian:', formatTime(totalSeconds));
}


// ===== Fourth Question Button (Qua Vet Banh Xe) =====
function setupNextQuestion3Button() {
    const nextQuestion3Btn = document.getElementById('nextQuestion3Btn');
    if (nextQuestion3Btn) {
        nextQuestion3Btn.addEventListener('click', () => {
            handleFourthQuestion();
        });
    }
}

function handleFourthQuestion() {
    console.log('➡️ Chuyển sang bài 4: QUA VỆT BÁNH XE');

    // Stop and clear previous audio if it's playing
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }

    // Play Qua Vet Banh Xe audio
    currentAudio = new Audio('QUA VET BANH XE SA HINH.mp3');
    currentAudio.play().catch(error => {
        console.log('Error playing audio:', error);
    });

    // Reset current time for new question
    resetCurrentTime();

    // Update exam name title
    const examNameTitle = document.querySelector('.exam-name-title');
    if (examNameTitle) {
        examNameTitle.textContent = 'QUA VỆT BÁNH XE VÀ ĐƯỜNG VÒNG VUÔNG GÓC';
    }

    // Update exam-specific error buttons (2 buttons for this exam)
    const examErrorButtons = document.querySelectorAll('.exam-error-btn');
    if (examErrorButtons.length >= 2) {
        // Button 1: Không đi qua vệt bánh xe (-25đ)
        const btn1Name = examErrorButtons[0].querySelector('.error-name');
        const btn1Penalty = examErrorButtons[0].querySelector('.error-penalty');
        if (btn1Name) btn1Name.textContent = 'Không đi qua vệt bánh xe';
        if (btn1Penalty) btn1Penalty.textContent = '(-25đ)';
        examErrorButtons[0].dataset.penalty = '-25';

        // Button 2: Bánh xe đè vạch (-5đ)
        const btn2Name = examErrorButtons[1].querySelector('.error-name');
        const btn2Penalty = examErrorButtons[1].querySelector('.error-penalty');
        if (btn2Name) btn2Name.textContent = 'Bánh xe đè vạch';
        if (btn2Penalty) btn2Penalty.textContent = '(-5đ)';
        examErrorButtons[1].dataset.penalty = '-5';

        // Hide buttons 3 and 4 for this exam
        if (examErrorButtons.length >= 3) examErrorButtons[2].style.display = 'none';
        if (examErrorButtons.length >= 4) examErrorButtons[3].style.display = 'none';
    }

    // Hide next3 button, keep prev button showing
    const nextQuestion3Btn = document.getElementById('nextQuestion3Btn');
    if (nextQuestion3Btn) nextQuestion3Btn.style.display = 'none';

    // Update prev button text
    const prevBtn = document.getElementById('prevQuestionBtn');
    if (prevBtn) {
        const prevBtnText = prevBtn.querySelector('.prev-btn-text');
        if (prevBtnText) prevBtnText.textContent = 'Quay lại bài DỐC CẦU';
    }

    // Hide Tune button (only Ting Ton for this exam)
    const tuneBtn = document.getElementById('tuneBtn');
    if (tuneBtn) tuneBtn.style.display = 'none';

    // Show next4 button for navigating to Nga Tu 1
    const nextQuestion4Btn = document.getElementById('nextQuestion4Btn');
    if (nextQuestion4Btn) nextQuestion4Btn.style.display = 'flex';

    currentQuestion = 4;

    console.log('✅ Đã chuyển sang bài 4: QUA VỆT BÁNH XE');
    console.log('📊 Điểm hiện tại:', score);
    console.log('⏰ Tổng thời gian:', formatTime(totalSeconds));
}



// ===== Fifth Question Button (Nga Tu 1) =====
function setupNextQuestion4Button() {
    const nextQuestion4Btn = document.getElementById('nextQuestion4Btn');
    if (nextQuestion4Btn) {
        nextQuestion4Btn.addEventListener('click', () => {
            handleFifthQuestion();
        });
    }
}

function handleFifthQuestion() {
    console.log('➡️ Chuyển sang bài 5: QUA NGÃ TƯ CÓ TÍN HIỆU ĐIỀU KHIỂN GIAO THÔNG');

    // Stop and clear previous audio if it's playing
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }

    // Play Nga Tu 1 audio
    currentAudio = new Audio('NGA TU 1.mp3');
    currentAudio.play().catch(error => {
        console.log('Error playing audio:', error);
    });

    // Reset current time for new question
    resetCurrentTime();

    // Update exam name title
    const examNameTitle = document.querySelector('.exam-name-title');
    if (examNameTitle) {
        examNameTitle.textContent = 'QUA NGÃ TƯ CÓ TÍN HIỆU ĐIỀU KHIỂN GIAO THÔNG';
    }

    // Update exam-specific error buttons (3 buttons for this exam)
    const examErrorButtons = document.querySelectorAll('.exam-error-btn');
    if (examErrorButtons.length >= 3) {
        // Button 1: Vượt đèn đỏ (-5đ)
        const btn1Name = examErrorButtons[0].querySelector('.error-name');
        const btn1Penalty = examErrorButtons[0].querySelector('.error-penalty');
        if (btn1Name) btn1Name.textContent = 'Vượt đèn đỏ';
        if (btn1Penalty) btn1Penalty.textContent = '(-5đ)';
        examErrorButtons[0].dataset.penalty = '-5';
        examErrorButtons[0].style.display = 'flex';

        // Button 2: Dừng xe quá vạch dừng quy định (-5đ)
        const btn2Name = examErrorButtons[1].querySelector('.error-name');
        const btn2Penalty = examErrorButtons[1].querySelector('.error-penalty');
        if (btn2Name) btn2Name.textContent = 'Dừng xe quá vạch dừng quy định';
        if (btn2Penalty) btn2Penalty.textContent = '(-5đ)';
        examErrorButtons[1].dataset.penalty = '-5';
        examErrorButtons[1].style.display = 'flex';

        // Button 3: Không tuân thủ tín hiệu khẩn cấp (-5đ)
        const btn3Name = examErrorButtons[2].querySelector('.error-name');
        const btn3Penalty = examErrorButtons[2].querySelector('.error-penalty');
        if (btn3Name) btn3Name.textContent = 'Không tuân thủ tín hiệu khẩn cấp';
        if (btn3Penalty) btn3Penalty.textContent = '(-5đ)';
        examErrorButtons[2].dataset.penalty = '-5';
        examErrorButtons[2].style.display = 'flex';

        // Hide button 4
        if (examErrorButtons.length >= 4) examErrorButtons[3].style.display = 'none';
    }

    // Hide next4 button, keep prev button showing
    const nextQuestion4Btn = document.getElementById('nextQuestion4Btn');
    if (nextQuestion4Btn) nextQuestion4Btn.style.display = 'none';

    // Update prev button text
    const prevBtn = document.getElementById('prevQuestionBtn');
    if (prevBtn) {
        const prevBtnText = prevBtn.querySelector('.prev-btn-text');
        if (prevBtnText) prevBtnText.textContent = 'Quay lại bài VỆT BÁNH XE';
    }

    // Show Tune button for Nga Tu question
    const tuneBtn = document.getElementById('tuneBtn');
    if (tuneBtn) tuneBtn.style.display = 'flex';

    // Show Emergency button for Nga Tu question
    const emergencyBtn = document.getElementById('emergencyBtn');
    if (emergencyBtn) emergencyBtn.style.display = 'flex';

    // Show next5 button for navigating to Duong Vong Quanh Co
    const nextQuestion5Btn = document.getElementById('nextQuestion5Btn');
    if (nextQuestion5Btn) nextQuestion5Btn.style.display = 'flex';

    currentQuestion = 5;

    console.log('✅ Đã chuyển sang bài 5: NGÃ TƯ 1');
    console.log('📊 Điểm hiện tại:', score);
    console.log('⏰ Tổng thời gian:', formatTime(totalSeconds));
}



// ===== Sixth Question Button (Duong Vong Quanh Co) =====
function setupNextQuestion5Button() {
    const nextQuestion5Btn = document.getElementById('nextQuestion5Btn');
    if (nextQuestion5Btn) {
        nextQuestion5Btn.addEventListener('click', () => {
            handleSixthQuestion();
        });
    }
}

function handleSixthQuestion() {
    console.log('➡️ Chuyển sang bài 6: ĐƯỜNG VÒNG QUANH CO');

    // Stop and clear previous audio if it's playing
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }

    // Play Duong Vong Quanh Co audio
    currentAudio = new Audio('DUONG VONG QUANH CO.mp3');
    currentAudio.play().catch(error => {
        console.log('Error playing audio:', error);
    });

    // Reset current time for new question
    resetCurrentTime();

    // Update exam name title
    const examNameTitle = document.querySelector('.exam-name-title');
    if (examNameTitle) {
        examNameTitle.textContent = 'ĐƯỜNG VÒNG QUANH CO';
    }

    // Update exam-specific error buttons (only 1 button for this exam)
    const examErrorButtons = document.querySelectorAll('.exam-error-btn');
    if (examErrorButtons.length >= 1) {
        // Button 1: Bánh xe đè vạch (-5đ)
        const btn1Name = examErrorButtons[0].querySelector('.error-name');
        const btn1Penalty = examErrorButtons[0].querySelector('.error-penalty');
        if (btn1Name) btn1Name.textContent = 'Bánh xe đè vạch';
        if (btn1Penalty) btn1Penalty.textContent = '(-5đ)';
        examErrorButtons[0].dataset.penalty = '-5';
        examErrorButtons[0].style.display = 'flex';

        // Hide buttons 2, 3, 4 for this exam (only 1 error)
        if (examErrorButtons.length >= 2) examErrorButtons[1].style.display = 'none';
        if (examErrorButtons.length >= 3) examErrorButtons[2].style.display = 'none';
        if (examErrorButtons.length >= 4) examErrorButtons[3].style.display = 'none';
    }

    // Hide next5 button, keep prev button showing
    const nextQuestion5Btn = document.getElementById('nextQuestion5Btn');
    if (nextQuestion5Btn) nextQuestion5Btn.style.display = 'none';

    // Update prev button text
    const prevBtn = document.getElementById('prevQuestionBtn');
    if (prevBtn) {
        const prevBtnText = prevBtn.querySelector('.prev-btn-text');
        if (prevBtnText) prevBtnText.textContent = 'Quay lại bài NGÃ TƯ 1';
    }

    // Hide Tune and Emergency buttons (only Ting Ton for this exam)
    const tuneBtn = document.getElementById('tuneBtn');
    if (tuneBtn) tuneBtn.style.display = 'none';

    const emergencyBtn = document.getElementById('emergencyBtn');
    if (emergencyBtn) emergencyBtn.style.display = 'none';

    // Show next6 button for navigating to Nga Tu 2
    const nextQuestion6Btn = document.getElementById('nextQuestion6Btn');
    if (nextQuestion6Btn) nextQuestion6Btn.style.display = 'flex';

    currentQuestion = 6;

    console.log('✅ Đã chuyển sang bài 6: ĐƯỜNG VÒNG QUANH CO');
    console.log('📊 Điểm hiện tại:', score);
    console.log('⏰ Tổng thời gian:', formatTime(totalSeconds));
}



// ===== Seventh Question Button (Nga Tu 2) =====
function setupNextQuestion6Button() {
    const nextQuestion6Btn = document.getElementById('nextQuestion6Btn');
    if (nextQuestion6Btn) {
        nextQuestion6Btn.addEventListener('click', () => {
            handleSeventhQuestion();
        });
    }
}

function handleSeventhQuestion() {
    console.log('➡️ Chuyển sang bài 7: QUA NGÃ TƯ 2');

    // Stop and clear previous audio if it's playing
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }

    // Play Nga Tu 2 audio
    currentAudio = new Audio('NGA TU THU 2.mp3');
    currentAudio.play().catch(error => {
        console.log('Error playing audio:', error);
    });

    // Reset current time for new question
    resetCurrentTime();

    // Update exam name title
    const examNameTitle = document.querySelector('.exam-name-title');
    if (examNameTitle) {
        examNameTitle.textContent = 'QUA NGÃ TƯ CÓ TÍN HIỆU ĐIỀU KHIỂN GIAO THÔNG';
    }

    // Update exam-specific error buttons (2 buttons for this exam)
    const examErrorButtons = document.querySelectorAll('.exam-error-btn');
    if (examErrorButtons.length >= 2) {
        // Button 1: Vượt đèn đỏ (-5đ)
        const btn1Name = examErrorButtons[0].querySelector('.error-name');
        const btn1Penalty = examErrorButtons[0].querySelector('.error-penalty');
        if (btn1Name) btn1Name.textContent = 'Vượt đèn đỏ';
        if (btn1Penalty) btn1Penalty.textContent = '(-5đ)';
        examErrorButtons[0].dataset.penalty = '-5';
        examErrorButtons[0].style.display = 'flex';

        // Button 2: Dừng xe quá vạch dừng quy định (-5đ)
        const btn2Name = examErrorButtons[1].querySelector('.error-name');
        const btn2Penalty = examErrorButtons[1].querySelector('.error-penalty');
        if (btn2Name) btn2Name.textContent = 'Dừng xe quá vạch dừng quy định';
        if (btn2Penalty) btn2Penalty.textContent = '(-5đ)';
        examErrorButtons[1].dataset.penalty = '-5';
        examErrorButtons[1].style.display = 'flex';

        // Hide buttons 3 and 4
        if (examErrorButtons.length >= 3) examErrorButtons[2].style.display = 'none';
        if (examErrorButtons.length >= 4) examErrorButtons[3].style.display = 'none';
    }

    // Hide next6 button, keep prev button showing
    const nextQuestion6Btn = document.getElementById('nextQuestion6Btn');
    if (nextQuestion6Btn) nextQuestion6Btn.style.display = 'none';

    // Update prev button text
    const prevBtn = document.getElementById('prevQuestionBtn');
    if (prevBtn) {
        const prevBtnText = prevBtn.querySelector('.prev-btn-text');
        if (prevBtnText) prevBtnText.textContent = 'Quay lại bài ĐƯỜNG VÒNG';
    }

    // Hide Tune and Emergency buttons (only Ting Ton for this exam)
    const tuneBtn = document.getElementById('tuneBtn');
    if (tuneBtn) tuneBtn.style.display = 'none';

    const emergencyBtn = document.getElementById('emergencyBtn');
    if (emergencyBtn) emergencyBtn.style.display = 'none';

    // Show next7 button for navigating to Ghep Doc
    const nextQuestion7Btn = document.getElementById('nextQuestion7Btn');
    if (nextQuestion7Btn) nextQuestion7Btn.style.display = 'flex';

    currentQuestion = 7;

    console.log('✅ Đã chuyển sang bài 7: NGÃ TƯ 2');
    console.log('📊 Điểm hiện tại:', score);
    console.log('⏰ Tổng thời gian:', formatTime(totalSeconds));
}



// ===== Eighth Question Button (Ghep Doc) =====
function setupNextQuestion7Button() {
    const nextQuestion7Btn = document.getElementById('nextQuestion7Btn');
    if (nextQuestion7Btn) {
        nextQuestion7Btn.addEventListener('click', () => {
            handleEighthQuestion();
        });
    }
}

function handleEighthQuestion() {
    console.log('➡️ Chuyển sang bài 8: GHÉP XE DỌC VÀO NƠI ĐỖ');

    // Stop and clear previous audio if it's playing
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }

    // Play Ghep Doc audio
    currentAudio = new Audio('GHEP DOC.mp3');
    currentAudio.play().catch(error => {
        console.log('Error playing audio:', error);
    });

    // Reset current time for new question
    resetCurrentTime();

    // Update exam name title
    const examNameTitle = document.querySelector('.exam-name-title');
    if (examNameTitle) {
        examNameTitle.textContent = 'GHÉP XE DỌC VÀO NƠI ĐỖ';
    }

    // Update exam-specific error buttons (2 buttons for this exam)
    const examErrorButtons = document.querySelectorAll('.exam-error-btn');
    if (examErrorButtons.length >= 2) {
        // Button 1: Bánh xe đè vạch (-5đ)
        const btn1Name = examErrorButtons[0].querySelector('.error-name');
        const btn1Penalty = examErrorButtons[0].querySelector('.error-penalty');
        if (btn1Name) btn1Name.textContent = 'Bánh xe đè vạch';
        if (btn1Penalty) btn1Penalty.textContent = '(-5đ)';
        examErrorButtons[0].dataset.penalty = '-5';
        examErrorButtons[0].style.display = 'flex';

        // Button 2: Đi sai quy trình (-25đ)
        const btn2Name = examErrorButtons[1].querySelector('.error-name');
        const btn2Penalty = examErrorButtons[1].querySelector('.error-penalty');
        if (btn2Name) btn2Name.textContent = 'Đi sai quy trình';
        if (btn2Penalty) btn2Penalty.textContent = '(-25đ)';
        examErrorButtons[1].dataset.penalty = '-25';
        examErrorButtons[1].style.display = 'flex';

        // Hide buttons 3 and 4
        if (examErrorButtons.length >= 3) examErrorButtons[2].style.display = 'none';
        if (examErrorButtons.length >= 4) examErrorButtons[3].style.display = 'none';
    }

    // Hide next7 button, keep prev button showing
    const nextQuestion7Btn = document.getElementById('nextQuestion7Btn');
    if (nextQuestion7Btn) nextQuestion7Btn.style.display = 'none';

    // Update prev button text
    const prevBtn = document.getElementById('prevQuestionBtn');
    if (prevBtn) {
        const prevBtnText = prevBtn.querySelector('.prev-btn-text');
        if (prevBtnText) prevBtnText.textContent = 'Quay lại bài NGÃ TƯ 2';
    }

    // Show Tune button, hide Emergency
    const tuneBtn = document.getElementById('tuneBtn');
    if (tuneBtn) tuneBtn.style.display = 'flex';

    const emergencyBtn = document.getElementById('emergencyBtn');
    if (emergencyBtn) emergencyBtn.style.display = 'none';

    // Show next8 button for navigating to Nga Tu 3
    const nextQuestion8Btn = document.getElementById('nextQuestion8Btn');
    if (nextQuestion8Btn) nextQuestion8Btn.style.display = 'flex';

    currentQuestion = 8;

    console.log('✅ Đã chuyển sang bài 8: GHÉP XE DỌC VÀO NƠI ĐỖ');
    console.log('📊 Điểm hiện tại:', score);
    console.log('⏰ Tổng thời gian:', formatTime(totalSeconds));
}



// ===== Ninth Question Button (Nga Tu 3) =====
function setupNextQuestion8Button() {
    const nextQuestion8Btn = document.getElementById('nextQuestion8Btn');
    if (nextQuestion8Btn) {
        nextQuestion8Btn.addEventListener('click', () => {
            handleNinthQuestion();
        });
    }
}

function handleNinthQuestion() {
    console.log('➡️ Chuyển sang bài 9: QUA NGÃ TƯ 3');

    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }

    currentAudio = new Audio('NGA TU 3.mp3');
    currentAudio.play().catch(error => console.log('Error playing audio:', error));

    resetCurrentTime();

    const examNameTitle = document.querySelector('.exam-name-title');
    if (examNameTitle) examNameTitle.textContent = 'QUA NGÃ TƯ CÓ TÍN HIỆU ĐIỀU KHIỂN GIAO THÔNG';

    const examErrorButtons = document.querySelectorAll('.exam-error-btn');
    if (examErrorButtons.length >= 3) {
        const btn1Name = examErrorButtons[0].querySelector('.error-name');
        const btn1Penalty = examErrorButtons[0].querySelector('.error-penalty');
        if (btn1Name) btn1Name.textContent = 'Vượt đèn đỏ';
        if (btn1Penalty) btn1Penalty.textContent = '(-5đ)';
        examErrorButtons[0].dataset.penalty = '-5';
        examErrorButtons[0].style.display = 'flex';

        const btn2Name = examErrorButtons[1].querySelector('.error-name');
        const btn2Penalty = examErrorButtons[1].querySelector('.error-penalty');
        if (btn2Name) btn2Name.textContent = 'Dừng xe quá vạch dừng quy định';
        if (btn2Penalty) btn2Penalty.textContent = '(-5đ)';
        examErrorButtons[1].dataset.penalty = '-5';
        examErrorButtons[1].style.display = 'flex';

        const btn3Name = examErrorButtons[2].querySelector('.error-name');
        const btn3Penalty = examErrorButtons[2].querySelector('.error-penalty');
        if (btn3Name) btn3Name.textContent = 'Không mở xi nhan rẽ trái';
        if (btn3Penalty) btn3Penalty.textContent = '(-5đ)';
        examErrorButtons[2].dataset.penalty = '-5';
        examErrorButtons[2].style.display = 'flex';

        if (examErrorButtons.length >= 4) examErrorButtons[3].style.display = 'none';
    }

    const nextQuestion8Btn = document.getElementById('nextQuestion8Btn');
    if (nextQuestion8Btn) nextQuestion8Btn.style.display = 'none';

    const prevBtn = document.getElementById('prevQuestionBtn');
    if (prevBtn) {
        const prevBtnText = prevBtn.querySelector('.prev-btn-text');
        if (prevBtnText) prevBtnText.textContent = 'Quay lại bài GHÉP DỌC';
    }

    const tuneBtn = document.getElementById('tuneBtn');
    if (tuneBtn) tuneBtn.style.display = 'none';

    const emergencyBtn = document.getElementById('emergencyBtn');
    if (emergencyBtn) emergencyBtn.style.display = 'none';

    const nextQuestion9Btn = document.getElementById('nextQuestion9Btn');
    if (nextQuestion9Btn) nextQuestion9Btn.style.display = 'flex';

    currentQuestion = 9;

    console.log('✅ Đã chuyển sang bài 9: NGÃ TƯ 3');
    console.log('📊 Điểm hiện tại:', score);
    console.log('⏰ Tổng thời gian:', formatTime(totalSeconds));
}



// ===== Tenth Question Button (Duong Sat) =====
function setupNextQuestion9Button() {
    const nextQuestion9Btn = document.getElementById('nextQuestion9Btn');
    if (nextQuestion9Btn) {
        nextQuestion9Btn.addEventListener('click', () => {
            handleTenthQuestion();
        });
    }
}

function handleTenthQuestion() {
    console.log('➡️ Chuyển sang bài 10: TẠM DỪNG Ở CHỖ CÓ ĐƯỜNG SẮT CHẠY QUA');

    hideAllNextButtons();

    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }

    currentAudio = new Audio('NHUONG DUONG SAT.mp3');
    currentAudio.play().catch(error => console.log('Error playing audio:', error));

    resetCurrentTime();

    const examNameTitle = document.querySelector('.exam-name-title');
    if (examNameTitle) examNameTitle.textContent = 'TẠM DỪNG Ở CHỖ CÓ ĐƯỜNG SẮT CHẠY QUA';

    const examErrorButtons = document.querySelectorAll('.exam-error-btn');
    if (examErrorButtons.length >= 4) {
        const btn1Name = examErrorButtons[0].querySelector('.error-name');
        const btn1Penalty = examErrorButtons[0].querySelector('.error-penalty');
        if (btn1Name) btn1Name.textContent = 'Không dừng xe ở vạch dừng quy định';
        if (btn1Penalty) btn1Penalty.textContent = '(-5đ)';
        examErrorButtons[0].dataset.penalty = '-5';
        examErrorButtons[0].style.display = 'flex';

        const btn2Name = examErrorButtons[1].querySelector('.error-name');
        const btn2Penalty = examErrorButtons[1].querySelector('.error-penalty');
        if (btn2Name) btn2Name.textContent = 'Dừng xe chưa đến vị trí';
        if (btn2Penalty) btn2Penalty.textContent = '(-5đ)';
        examErrorButtons[1].dataset.penalty = '-5';
        examErrorButtons[1].style.display = 'flex';

        const btn3Name = examErrorButtons[2].querySelector('.error-name');
        const btn3Penalty = examErrorButtons[2].querySelector('.error-penalty');
        if (btn3Name) btn3Name.textContent = 'Dừng xe quá vị trí';
        if (btn3Penalty) btn3Penalty.textContent = '(-5đ)';
        examErrorButtons[2].dataset.penalty = '-5';
        examErrorButtons[2].style.display = 'flex';

        const btn4Name = examErrorButtons[3].querySelector('.error-name');
        const btn4Penalty = examErrorButtons[3].querySelector('.error-penalty');
        if (btn4Name) btn4Name.textContent = 'Không tuân thủ tín hiệu khẩn cấp';
        if (btn4Penalty) btn4Penalty.textContent = '(-10đ)';
        examErrorButtons[3].dataset.penalty = '-10';
        examErrorButtons[3].style.display = 'flex';
    }

    const nextQuestion9Btn = document.getElementById('nextQuestion9Btn');
    if (nextQuestion9Btn) nextQuestion9Btn.style.display = 'none';

    const prevBtn = document.getElementById('prevQuestionBtn');
    if (prevBtn) {
        const prevBtnText = prevBtn.querySelector('.prev-btn-text');
        if (prevBtnText) prevBtnText.textContent = 'Quay lại bài NGÃ TƯ 3';
    }

    const tuneBtn = document.getElementById('tuneBtn');
    if (tuneBtn) tuneBtn.style.display = 'flex';

    const emergencyBtn = document.getElementById('emergencyBtn');
    if (emergencyBtn) emergencyBtn.style.display = 'flex';

    const nextQuestion10Btn = document.getElementById('nextQuestion10Btn');
    if (nextQuestion10Btn) nextQuestion10Btn.style.display = 'flex';

    currentQuestion = 10;

    console.log('✅ Đã chuyển sang bài 10: ĐƯỜNG SẮT');
    console.log('📊 Điểm hiện tại:', score);
    console.log('⏰ Tổng thời gian:', formatTime(totalSeconds));
}


// Complete code for Question 11

// 1. HTML Button (add to thi-sa-hinh.html before closing div)
/*
            <!-- Floating Next Button 11 (to Question 12: Ghep Ngang) - Initially hidden -->
            <button class="next-question-btn" id="nextQuestion11Btn" style="display: none;">
                <span class="next-btn-text">Ghép ngang</span>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 7L18 12M18 12L13 17M18 12H6" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </button>
*/

// 2. Update hideAllNextButtons to include nextQuestion11Btn
// Add: const nextQuestion11Btn = document.getElementById('nextQuestion11Btn');
// Add: if (nextQuestion11Btn) nextQuestion11Btn.style.display = 'none';

// 3. Update currentQuestion comment
// let currentQuestion = 1; // ...10=ĐƯỜNG SẮT, 11=THAY ĐỔI SỐ

// 4. Add setup call
// setupNextQuestion10Button();

// 5. Setup and handle functions
function setupNextQuestion10Button() {
    const nextQuestion10Btn = document.getElementById('nextQuestion10Btn');
    if (nextQuestion10Btn) {
        nextQuestion10Btn.addEventListener('click', () => {
            handleEleventhQuestion();
        });
    }
}

function handleEleventhQuestion() {
    console.log('➡️ Chuyển sang bài 11: THAY ĐỔI SỐ TRÊN ĐƯỜNG BẰNG');

    hideAllNextButtons();

    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }

    currentAudio = new Audio('BAI THI THAY DOI SO.mp3');
    currentAudio.play().catch(error => console.log('Error playing audio:', error));

    resetCurrentTime();

    const examNameTitle = document.querySelector('.exam-name-title');
    if (examNameTitle) examNameTitle.textContent = 'THAY ĐỔI SỐ TRÊN ĐƯỜNG BẰNG';

    const examErrorButtons = document.querySelectorAll('.exam-error-btn');
    if (examErrorButtons.length >= 2) {
        const btn1Name = examErrorButtons[0].querySelector('.error-name');
        const btn1Penalty = examErrorButtons[0].querySelector('.error-penalty');
        if (btn1Name) btn1Name.textContent = 'Không thay đổi số đúng quy định';
        if (btn1Penalty) btn1Penalty.textContent = '(-5đ)';
        examErrorButtons[0].dataset.penalty = '-5';
        examErrorButtons[0].style.display = 'flex';

        const btn2Name = examErrorButtons[1].querySelector('.error-name');
        const btn2Penalty = examErrorButtons[1].querySelector('.error-penalty');
        if (btn2Name) btn2Name.textContent = 'Không đạt tốc độ đúng quy định';
        if (btn2Penalty) btn2Penalty.textContent = '(-5đ)';
        examErrorButtons[1].dataset.penalty = '-5';
        examErrorButtons[1].style.display = 'flex';

        if (examErrorButtons.length >= 3) examErrorButtons[2].style.display = 'none';
        if (examErrorButtons.length >= 4) examErrorButtons[3].style.display = 'none';
    }

    const nextQuestion10Btn = document.getElementById('nextQuestion10Btn');
    if (nextQuestion10Btn) nextQuestion10Btn.style.display = 'none';

    const prevBtn = document.getElementById('prevQuestionBtn');
    if (prevBtn) {
        const prevBtnText = prevBtn.querySelector('.prev-btn-text');
        if (prevBtnText) prevBtnText.textContent = 'Quay lại bài ĐƯỜNG SẮT';
    }

    const tuneBtn = document.getElementById('tuneBtn');
    if (tuneBtn) tuneBtn.style.display = 'flex';

    const emergencyBtn = document.getElementById('emergencyBtn');
    if (emergencyBtn) emergencyBtn.style.display = 'none';

    const nextQuestion11Btn = document.getElementById('nextQuestion11Btn');
    if (nextQuestion11Btn) nextQuestion11Btn.style.display = 'flex';

    currentQuestion = 11;

    console.log('✅ Đã chuyển sang bài 11: THAY ĐỔI SỐ');
    console.log('📊 Điểm hiện tại:', score);
    console.log('⏰ Tổng thời gian:', formatTime(totalSeconds));
}

// 6. Audio mapping
/*
    // Bài 11: THAY ĐỔI SỐ
    else if (currentQuestion === 11) {
        if (errorName.includes("Không thay đổi số")) {
            audioFile = "KO THAY DOI SO.mp3";
        } else if (errorName.includes("Không đạt tốc độ")) {
            audioFile = "KO DAT TOC DO QUY DINH.mp3";
        }
    }
*/

// 7. handlePrevQuestion case 11
/*
    else if (currentQuestion === 11) {
        // Go back to Question 10: ĐƯỜNG SẮT
        currentAudio = new Audio('NHUONG DUONG SAT.mp3');
        currentAudio.play().catch(error => console.log('Error playing audio:', error));
        
        if (examNameTitle) examNameTitle.textContent = 'TẠM DỪNG Ở CHỖ CÓ ĐƯỜNG SẮT CHẠY QUA';
        
        if (examErrorButtons.length >= 4) {
            const btn1Name = examErrorButtons[0].querySelector('.error-name');
            const btn1Penalty = examErrorButtons[0].querySelector('.error-penalty');
            if (btn1Name) btn1Name.textContent = 'Không dừng xe ở vạch dừng quy định';
            if (btn1Penalty) btn1Penalty.textContent = '(-5đ)';
            examErrorButtons[0].dataset.penalty = '-5';
            examErrorButtons[0].style.display = 'flex';
            
            const btn2Name = examErrorButtons[1].querySelector('.error-name');
            const btn2Penalty = examErrorButtons[1].querySelector('.error-penalty');
            if (btn2Name) btn2Name.textContent = 'Dừng xe chưa đến vị trí';
            if (btn2Penalty) btn2Penalty.textContent = '(-5đ)';
            examErrorButtons[1].dataset.penalty = '-5';
            examErrorButtons[1].style.display = 'flex';
            
            const btn3Name = examErrorButtons[2].querySelector('.error-name');
            const btn3Penalty = examErrorButtons[2].querySelector('.error-penalty');
            if (btn3Name) btn3Name.textContent = 'Dừng xe quá vị trí';
            if (btn3Penalty) btn3Penalty.textContent = '(-5đ)';
            examErrorButtons[2].dataset.penalty = '-5';
            examErrorButtons[2].style.display = 'flex';
            
            const btn4Name = examErrorButtons[3].querySelector('.error-name');
            const btn4Penalty = examErrorButtons[3].querySelector('.error-penalty');
            if (btn4Name) btn4Name.textContent = 'Không tuân thủ tín hiệu khẩn cấp';
            if (btn4Penalty) btn4Penalty.textContent = '(-10đ)';
            examErrorButtons[3].dataset.penalty = '-10';
            examErrorButtons[3].style.display = 'flex';
        }
        
        if (nextBtn) nextBtn.style.display = 'none';
        if (prevBtn) {
            prevBtn.style.display = 'flex';
            const prevBtnText = prevBtn.querySelector('.prev-btn-text');
            if (prevBtnText) prevBtnText.textContent = 'Quay lại bài NGÃ TƯ 3';
        }
        if (tuneBtn) tuneBtn.style.display = 'flex';
        if (nextQuestion2Btn) nextQuestion2Btn.style.display = 'none';
        
        const emergencyBtn = document.getElementById('emergencyBtn');
        if (emergencyBtn) emergencyBtn.style.display = 'flex';
        
        const nextQuestion10Btn = document.getElementById('nextQuestion10Btn');
        if (nextQuestion10Btn) nextQuestion10Btn.style.display = 'flex';
        
        const nextQuestion11Btn = document.getElementById('nextQuestion11Btn');
        if (nextQuestion11Btn) nextQuestion11Btn.style.display = 'none';
        
        currentQuestion = 10;
        console.log('✅ Đã quay lại bài: ĐƯỜNG SẮT');
    }
*/



// ===== Eleventh Question Button (Thay Doi So) =====
function setupNextQuestion10Button() {
    const nextQuestion10Btn = document.getElementById('nextQuestion10Btn');
    if (nextQuestion10Btn) {
        nextQuestion10Btn.addEventListener('click', () => {
            handleEleventhQuestion();
        });
    }
}

function handleEleventhQuestion() {
    console.log('➡️ Chuyển sang bài 11: THAY ĐỔI SỐ');

    hideAllNextButtons();

    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }

    currentAudio = new Audio('BAI THI THAY DOI SO.mp3');
    currentAudio.play().catch(error => console.log('Error playing audio:', error));

    resetCurrentTime();

    const examNameTitle = document.querySelector('.exam-name-title');
    if (examNameTitle) examNameTitle.textContent = 'THAY ĐỔI SỐ TRÊN ĐƯỜNG BẰNG';

    const examErrorButtons = document.querySelectorAll('.exam-error-btn');
    if (examErrorButtons.length >= 2) {
        const btn1Name = examErrorButtons[0].querySelector('.error-name');
        const btn1Penalty = examErrorButtons[0].querySelector('.error-penalty');
        if (btn1Name) btn1Name.textContent = 'Không thay đổi số đúng quy định';
        if (btn1Penalty) btn1Penalty.textContent = '(-5đ)';
        examErrorButtons[0].dataset.penalty = '-5';
        examErrorButtons[0].style.display = 'flex';

        const btn2Name = examErrorButtons[1].querySelector('.error-name');
        const btn2Penalty = examErrorButtons[1].querySelector('.error-penalty');
        if (btn2Name) btn2Name.textContent = 'Không đạt tốc độ đúng quy định';
        if (btn2Penalty) btn2Penalty.textContent = '(-5đ)';
        examErrorButtons[1].dataset.penalty = '-5';
        examErrorButtons[1].style.display = 'flex';

        if (examErrorButtons.length >= 3) examErrorButtons[2].style.display = 'none';
        if (examErrorButtons.length >= 4) examErrorButtons[3].style.display = 'none';
    }

    const nextQuestion10Btn = document.getElementById('nextQuestion10Btn');
    if (nextQuestion10Btn) nextQuestion10Btn.style.display = 'none';

    const prevBtn = document.getElementById('prevQuestionBtn');
    if (prevBtn) {
        const prevBtnText = prevBtn.querySelector('.prev-btn-text');
        if (prevBtnText) prevBtnText.textContent = 'Quay lại bài ĐƯỜNG SẮT';
    }

    const tuneBtn = document.getElementById('tuneBtn');
    if (tuneBtn) tuneBtn.style.display = 'flex';

    const emergencyBtn = document.getElementById('emergencyBtn');
    if (emergencyBtn) emergencyBtn.style.display = 'none';

    const nextQuestion11Btn = document.getElementById('nextQuestion11Btn');
    if (nextQuestion11Btn) nextQuestion11Btn.style.display = 'flex';

    currentQuestion = 11;

    console.log('✅ Đã chuyển sang bài 11: THAY ĐỔI SỐ');
    console.log('📊 Điểm hiện tại:', score);
    console.log('⏰ Tổng thời gian:', formatTime(totalSeconds));
}


// ===== Twelfth Question Button (Ghep Ngang) =====
function setupNextQuestion11Button() {
    const nextQuestion11Btn = document.getElementById('nextQuestion11Btn');
    if (nextQuestion11Btn) {
        nextQuestion11Btn.addEventListener('click', () => {
            handleTwelfthQuestion();
        });
    }
}

function handleTwelfthQuestion() {
    console.log('➡️ Chuyển sang bài 12: GHÉP XE NGANG VÀO NƠI ĐỖ');

    hideAllNextButtons();

    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }

    currentAudio = new Audio('GHEP NGANG.mp3');
    currentAudio.play().catch(error => console.log('Error playing audio:', error));

    resetCurrentTime();

    const examNameTitle = document.querySelector('.exam-name-title');
    if (examNameTitle) examNameTitle.textContent = 'GHÉP XE NGANG VÀO NƠI ĐỖ';

    const examErrorButtons = document.querySelectorAll('.exam-error-btn');
    if (examErrorButtons.length >= 3) {
        const btn1Name = examErrorButtons[0].querySelector('.error-name');
        const btn1Penalty = examErrorButtons[0].querySelector('.error-penalty');
        if (btn1Name) btn1Name.textContent = 'Bánh xe đè vạch';
        if (btn1Penalty) btn1Penalty.textContent = '(-5đ)';
        examErrorButtons[0].dataset.penalty = '-5';
        examErrorButtons[0].style.display = 'flex';

        const btn2Name = examErrorButtons[1].querySelector('.error-name');
        const btn2Penalty = examErrorButtons[1].querySelector('.error-penalty');
        if (btn2Name) btn2Name.textContent = 'Ghép xe sai vị trí';
        if (btn2Penalty) btn2Penalty.textContent = '(-5đ)';
        examErrorButtons[1].dataset.penalty = '-5';
        examErrorButtons[1].style.display = 'flex';

        const btn3Name = examErrorButtons[2].querySelector('.error-name');
        const btn3Penalty = examErrorButtons[2].querySelector('.error-penalty');
        if (btn3Name) btn3Name.textContent = 'Đi sai quy trình';
        if (btn3Penalty) btn3Penalty.textContent = '(-25đ)';
        examErrorButtons[2].dataset.penalty = '-25';
        examErrorButtons[2].style.display = 'flex';

        if (examErrorButtons.length >= 4) {
            const btn4Name = examErrorButtons[3].querySelector('.error-name');
            const btn4Penalty = examErrorButtons[3].querySelector('.error-penalty');
            if (btn4Name) btn4Name.textContent = 'Không tuân thủ tín hiệu khẩn cấp';
            if (btn4Penalty) btn4Penalty.textContent = '(-10đ)';
            examErrorButtons[3].dataset.penalty = '-10';
            examErrorButtons[3].style.display = 'flex';
        }
    }

    const nextQuestion11Btn = document.getElementById('nextQuestion11Btn');
    if (nextQuestion11Btn) nextQuestion11Btn.style.display = 'none';

    const prevBtn = document.getElementById('prevQuestionBtn');
    if (prevBtn) {
        const prevBtnText = prevBtn.querySelector('.prev-btn-text');
        if (prevBtnText) prevBtnText.textContent = 'Quay lại bài THAY ĐỔI SỐ';
    }

    const tuneBtn = document.getElementById('tuneBtn');
    if (tuneBtn) tuneBtn.style.display = 'flex';

    const emergencyBtn = document.getElementById('emergencyBtn');
    if (emergencyBtn) {
        emergencyBtn.dataset.audio = 'KHAN CAP GHEP NGANG.mp3';
        emergencyBtn.style.display = 'flex';
    }

    const nextQuestion12Btn = document.getElementById('nextQuestion12Btn');
    if (nextQuestion12Btn) nextQuestion12Btn.style.display = 'flex';

    currentQuestion = 12;

    console.log('✅ Đã chuyển sang bài 12: GHÉP NGANG');
    console.log('📊 Điểm hiện tại:', score);
    console.log('⏰ Tổng thời gian:', formatTime(totalSeconds));
}


// ===== Thirteenth Question Button (Nga Tu 4) =====
function setupNextQuestion12Button() {
    const nextQuestion12Btn = document.getElementById('nextQuestion12Btn');
    if (nextQuestion12Btn) {
        nextQuestion12Btn.addEventListener('click', () => {
            handleThirteenthQuestion();
        });
    }
}

function handleThirteenthQuestion() {
    console.log('➡️ Chuyển sang bài 13: QUA NGÃ TƯ 4 (KẾT THÚC)');

    hideAllNextButtons();

    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }

    currentAudio = new Audio('NGA TU 4.mp3');
    currentAudio.play().catch(error => console.log('Error playing audio:', error));

    resetCurrentTime();

    const examNameTitle = document.querySelector('.exam-name-title');
    if (examNameTitle) examNameTitle.textContent = 'QUA NGÃ TƯ CÓ TÍN HIỆU ĐIỀU KHIỂN GIAO THÔNG (KẾT THÚC)';

    const examErrorButtons = document.querySelectorAll('.exam-error-btn');
    if (examErrorButtons.length >= 3) {
        const btn1Name = examErrorButtons[0].querySelector('.error-name');
        const btn1Penalty = examErrorButtons[0].querySelector('.error-penalty');
        if (btn1Name) btn1Name.textContent = 'Vượt đèn đỏ';
        if (btn1Penalty) btn1Penalty.textContent = '(-5đ)';
        examErrorButtons[0].dataset.penalty = '-5';
        examErrorButtons[0].style.display = 'flex';

        const btn2Name = examErrorButtons[1].querySelector('.error-name');
        const btn2Penalty = examErrorButtons[1].querySelector('.error-penalty');
        if (btn2Name) btn2Name.textContent = 'Dừng xe quá vạch dừng quy định';
        if (btn2Penalty) btn2Penalty.textContent = '(-5đ)';
        examErrorButtons[1].dataset.penalty = '-5';
        examErrorButtons[1].style.display = 'flex';

        const btn3Name = examErrorButtons[2].querySelector('.error-name');
        const btn3Penalty = examErrorButtons[2].querySelector('.error-penalty');
        if (btn3Name) btn3Name.textContent = 'Không bật xi nhan phải';
        if (btn3Penalty) btn3Penalty.textContent = '(-5đ)';
        examErrorButtons[2].dataset.penalty = '-5';
        examErrorButtons[2].style.display = 'flex';

        if (examErrorButtons.length >= 4) examErrorButtons[3].style.display = 'none';
    }

    const nextQuestion12Btn = document.getElementById('nextQuestion12Btn');
    if (nextQuestion12Btn) nextQuestion12Btn.style.display = 'none';

    const prevBtn = document.getElementById('prevQuestionBtn');
    if (prevBtn) {
        const prevBtnText = prevBtn.querySelector('.prev-btn-text');
        if (prevBtnText) prevBtnText.textContent = 'Quay lại bài GHÉP NGANG';
    }

    const tuneBtn = document.getElementById('tuneBtn');
    if (tuneBtn) tuneBtn.style.display = 'none';

    const emergencyBtn = document.getElementById('emergencyBtn');
    if (emergencyBtn) emergencyBtn.style.display = 'none';

    const nextQuestion13Btn = document.getElementById('nextQuestion13Btn');
    if (nextQuestion13Btn) nextQuestion13Btn.style.display = 'flex';

    currentQuestion = 13;

    console.log('✅ Đã chuyển sang bài 13: NGÃ TƯ 4 (KẾT THÚC)');
    console.log('📊 Điểm hiện tại:', score);
    console.log('⏰ Tổng thời gian:', formatTime(totalSeconds));
}
console.log('âž¡ï¸ Chuyá»ƒn sang bÃ i 13: QUA NGÃƒ TÆ¯ 4 (Káº¾T THÃšC)');

/* Dangling Code
hideAllNextButtons();

if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
}

currentAudio = new Audio('NGA TU 4.mp3');
currentAudio.play().catch(error => console.log('Error playing audio:', error));

resetCurrentTime();

const examNameTitle = document.querySelector('.exam-name-title');
if (examNameTitle) examNameTitle.textContent = 'QUA NGÃƒ TÆ¯ CÃ“ TÃN HIá»†U ÄIá»€U KHIá»‚N GIAO THÃ”NG (Káº¾T THÃšC)';

const examErrorButtons = document.querySelectorAll('.exam-error-btn');
if (examErrorButtons.length >= 3) {
    const btn1Name = examErrorButtons[0].querySelector('.error-name');
    const btn1Penalty = examErrorButtons[0].querySelector('.error-penalty');
    if (btn1Name) btn1Name.textContent = 'VÆ°á»£t Ä‘Ã¨n Ä‘á»';
    if (btn1Penalty) btn1Penalty.textContent = '(-5Ä‘)';
    examErrorButtons[0].dataset.penalty = '-5';
    examErrorButtons[0].style.display = 'flex';

    const btn2Name = examErrorButtons[1].querySelector('.error-name');
    const btn2Penalty = examErrorButtons[1].querySelector('.error-penalty');
    if (btn2Name) btn2Name.textContent = 'Dá»«ng xe quÃ¡ váº¡ch dá»«ng quy Ä‘á»‹nh';
    if (btn2Penalty) btn2Penalty.textContent = '(-5Ä‘)';
    examErrorButtons[1].dataset.penalty = '-5';
    examErrorButtons[1].style.display = 'flex';

    const btn3Name = examErrorButtons[2].querySelector('.error-name');
    const btn3Penalty = examErrorButtons[2].querySelector('.error-penalty');
    if (btn3Name) btn3Name.textContent = 'KhÃ´ng báº­t xi nhan pháº£i';
    if (btn3Penalty) btn3Penalty.textContent = '(-5Ä‘)';
    examErrorButtons[2].dataset.penalty = '-5';
    examErrorButtons[2].style.display = 'flex';

    if (examErrorButtons.length >= 4) examErrorButtons[3].style.display = 'none';
}

const nextQuestion12Btn = document.getElementById('nextQuestion12Btn');
if (nextQuestion12Btn) nextQuestion12Btn.style.display = 'none';

const prevBtn = document.getElementById('prevQuestionBtn');
if (prevBtn) {
    const prevBtnText = prevBtn.querySelector('.prev-btn-text');
    if (prevBtnText) prevBtnText.textContent = 'Quay láº¡i bÃ i GHÃ‰P NGANG';
}

const tuneBtn = document.getElementById('tuneBtn');
if (tuneBtn) tuneBtn.style.display = 'none';

const emergencyBtn = document.getElementById('emergencyBtn');
if (emergencyBtn) emergencyBtn.style.display = 'none';

const nextQuestion13Btn = document.getElementById('nextQuestion13Btn');
if (nextQuestion13Btn) nextQuestion13Btn.style.display = 'flex';

currentQuestion = 13;

console.log('âœ… ÄÃ£ chuyá»ƒn sang bÃ i 13: NGÃƒ TÆ¯ 4');
console.log('ðŸ“Š Äiá»ƒm hiá»‡n táº¡i:', score);
console.log('â° Tá»•ng thá»i gian:', formatTime(totalSeconds));
} */

// ===== Fourteenth Question Button (Ket Thuc) =====
function setupNextQuestion13Button() {
    const nextQuestion13Btn = document.getElementById('nextQuestion13Btn');
    if (nextQuestion13Btn) {
        nextQuestion13Btn.addEventListener('click', () => {
            // Disabled as per user request
            console.log('Nút Kết thúc đã bị vô hiệu hóa.');
        });
    }
}

function handleFourteenthQuestion() {
    console.log('âž¡ï¸ Chuyá»ƒn sang bÃ i 14: Káº¾T THÃšC');

    hideAllNextButtons();

    // Stop timers
    stopTimers();

    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }

    // Determine pass/fail
    const passed = score >= 80;
    const finalAudio = passed ? 'CHUC MUNG BAN DA DAT.mp3' : 'BAN DA TRUOT SAT HACH.mp3';

    currentAudio = new Audio(finalAudio);
    currentAudio.play().catch(error => console.log('Error playing audio:', error));

    const examNameTitle = document.querySelector('.exam-name-title');
    if (examNameTitle) examNameTitle.textContent = 'Káº¾T THÃšC BÃ€I THI';

    // Hide error buttons as exam is over
    const commonErrors = document.querySelector('.common-errors-section');
    if (commonErrors) commonErrors.style.display = 'none';

    const examErrors = document.querySelector('.exam-errors-section');
    if (examErrors) examErrors.style.display = 'none';

    // Show result
    const contentArea = document.querySelector('.content-area');
    if (contentArea) {
        contentArea.innerHTML = `
            <div class="result-card ${passed ? 'pass' : 'fail'}" style="text-align: center; padding: 2rem; border-radius: 1rem; background: ${passed ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; border: 2px solid ${passed ? '#22c55e' : '#ef4444'};">
                <h2 style="font-size: 2rem; font-weight: 800; color: ${passed ? '#22c55e' : '#ef4444'}; margin-bottom: 1rem;">${passed ? 'CHÃšC Má»ªNG Báº N ÄÃƒ Äáº T!' : 'Báº N ÄÃƒ KHÃ”NG Äáº T'}</h2>
                <div style="font-size: 4rem; font-weight: 900; margin-bottom: 1rem; color: var(--text-primary);">${score}</div>
                <p style="font-size: 1.25rem; color: var(--text-secondary); margin-bottom: 2rem;">Tá»•ng thá»i gian: ${formatTime(totalSeconds)}</p>
                <button onclick="location.reload()" style="padding: 1rem 2rem; font-size: 1.125rem; font-weight: 600; color: white; background: var(--primary); border: none; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s;">Thi láº¡i</button>
            </div>
        `;
    }

    const prevBtn = document.getElementById('prevQuestionBtn');
    if (prevBtn) prevBtn.style.display = 'none';

    const tuneBtn = document.getElementById('tuneBtn');
    if (tuneBtn) tuneBtn.style.display = 'none';

    console.log('âœ… ÄÃ£ hoÃ n thÃ nh bÃ i thi');
    console.log('ðŸ“Š Äiá»ƒm tá»•ng káº¿t:', score);
}

// Initialize new buttons if DOM is already loaded or add listener
function setupAllNewButtons() {
    console.log('Initializing extra buttons...');
    if (typeof setupNextQuestion9Button === 'function') setupNextQuestion9Button();
    if (typeof setupNextQuestion10Button === 'function') setupNextQuestion10Button();
    if (typeof setupNextQuestion11Button === 'function') setupNextQuestion11Button();
    if (typeof setupNextQuestion12Button === 'function') setupNextQuestion12Button();
    if (typeof setupNextQuestion13Button === 'function') setupNextQuestion13Button();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAllNewButtons);
} else {
    setTimeout(setupAllNewButtons, 500);
}
