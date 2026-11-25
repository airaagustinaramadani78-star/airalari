// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const timeSpentEl = document.getElementById('time-spent');
const quotaLimitEl = document.getElementById('quota-limit');
const progressBar = document.getElementById('progress-bar');
const statusMessage = document.getElementById('status-message');
const inputQuota = document.getElementById('input-quota');
const btnSaveQuota = document.getElementById('btn-save-quota');

const timerDisplay = document.getElementById('timer-display');
const btnStart = document.getElementById('btn-start');
const btnPause = document.getElementById('btn-pause');
const btnReset = document.getElementById('btn-reset');

const appForm = document.getElementById('app-form');
const appNameInput = document.getElementById('app-name');
const appDurationInput = document.getElementById('app-duration');
const appList = document.getElementById('app-list');

// State Aplikasi & LocalStorage
let quotaHours = localStorage.getItem('focusguard_quota') || 4;
let appLogs = JSON.parse(localStorage.getItem('focusguard_logs')) || [];

inputQuota.value = quotaHours;
quotaLimitEl.textContent = `${quotaHours} jam`;

// Dark Mode Handler
const currentTheme = localStorage.getItem('focusguard_theme') || 'light';
if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('focusguard_theme', 'light');
        themeToggle.textContent = '🌙';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('focusguard_theme', 'dark');
        themeToggle.textContent = '☀️';
    }
});

// Update Kuota & Progress
btnSaveQuota.addEventListener('click', () => {
    quotaHours = parseFloat(inputQuota.value) || 4;
    localStorage.setItem('focusguard_quota', quotaHours);
    quotaLimitEl.textContent = `${quotaHours} jam`;
    updateDashboard();
});

function updateDashboard() {
    // Hitung total menit dari log aplikasi
    const totalMinutes = appLogs.reduce((acc, curr) => acc + curr.duration, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    timeSpentEl.textContent = `${hours} jam ${minutes} menit`;

    const maxMinutes = quotaHours * 60;
    let percentage = (totalMinutes / maxMinutes) * 100;
    if (percentage > 100) percentage = 100;

    progressBar.style.width = `${percentage}%`;

    if (totalMinutes >= maxMinutes) {
        progressBar.style.backgroundColor = 'var(--danger-color)';
        statusMessage.textContent = '⚠️ Peringatan: Batas waktu layar harian Anda sudah tercapai!';
        statusMessage.className = 'warning';
    } else {
        progressBar.style.backgroundColor = 'var(--safe-color)';
        statusMessage.textContent = 'Waktu layar Anda masih aman hari ini!';
        statusMessage.className = 'safe';
    }
}

// Tambah Log Aplikasi
appForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = appNameInput.value.trim();
    const duration = parseInt(appDurationInput.value);

    if (name && duration) {
        appLogs.push({ id: Date.now(), name, duration });
        localStorage.setItem('focusguard_logs', JSON.stringify(appLogs));
        
        appNameInput.value = '';
        appDurationInput.value = '';
        renderAppList();
        updateDashboard();
    }
});

function renderAppList() {
    appList.innerHTML = '';
    appLogs.forEach((item) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span><strong>${item.name}</strong> (${item.duration} menit)</span>
            <button onclick="deleteLog(${item.id})">Hapus</button>
        `;
        appList.appendChild(li);
    });
}

window.deleteLog = function(id) {
    appLogs = appLogs.filter(item => item.id !== id);
    localStorage.setItem('focusguard_logs', JSON.stringify(appLogs));
    renderAppList();
    updateDashboard();
};

// Timer Pomodoro
let countdown;
let timeLeft = 25 * 60; // 25 menit dalam detik
let isRunning = false;

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function updateTimerDisplay() {
    timerDisplay.textContent = formatTime(timeLeft);
}

btnStart.addEventListener('click', () => {
    if (!isRunning) {
        isRunning = true;
        btnStart.disabled = true;
        btnPause.disabled = false;

        countdown = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimerDisplay();
            } else {
                clearInterval(countdown);
                alert('Waktu fokus selesai! Istirahat sejenak ya.');
                isRunning = false;
                btnStart.disabled = false;
                btnPause.disabled = true;
                timeLeft = 25 * 60;
                updateTimerDisplay();
            }
        }, 1000);
    }
});

btnPause.addEventListener('click', () => {
    clearInterval(countdown);
    isRunning = false;
    btnStart.disabled = false;
    btnPause.disabled = true;
});

btnReset.addEventListener('click', () => {
    clearInterval(countdown);
    isRunning = false;
    btnStart.disabled = false;
    btnPause.disabled = true;
    timeLeft = 25 * 60;
    updateTimerDisplay();
});

// Inisialisasi awal saat halaman dimuat
renderAppList();
updateDashboard();
updateTimerDisplay();
