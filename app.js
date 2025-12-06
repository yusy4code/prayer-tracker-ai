// Prayer Tracker App with IndexedDB

const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
let db;
let currentEditDate = null;
let currentCalendarDate = new Date();

// Initialize IndexedDB
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('PrayerTrackerDB', 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Create object store for prayer records
            if (!db.objectStoreNames.contains('prayers')) {
                const objectStore = db.createObjectStore('prayers', { keyPath: 'date' });
                objectStore.createIndex('date', 'date', { unique: true });
            }
        };
    });
}

// Database helper functions
async function savePrayerRecord(date, prayers) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['prayers'], 'readwrite');
        const objectStore = transaction.objectStore('prayers');
        const request = objectStore.put({ date, prayers });

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function getPrayerRecord(date) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['prayers'], 'readonly');
        const objectStore = transaction.objectStore('prayers');
        const request = objectStore.get(date);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getAllPrayerRecords() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['prayers'], 'readonly');
        const objectStore = transaction.objectStore('prayers');
        const request = objectStore.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Date helper functions
function getDateString(date = new Date()) {
    // Use local timezone instead of GMT
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function getDaysDifference(date1, date2) {
    const d1 = new Date(date1 + 'T00:00:00');
    const d2 = new Date(date2 + 'T00:00:00');
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function isFutureDate(dateString) {
    const today = getDateString();
    return dateString > today;
}

// Tab navigation
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');

            // Refresh content when switching tabs
            if (targetTab === 'history') {
                loadHistory();
            } else if (targetTab === 'stats') {
                loadStatistics();
            }
        });
    });
}

// Today's prayers functionality
async function initTodayView() {
    const today = getDateString();
    document.getElementById('currentDate').textContent = formatDate(today);

    // Load today's prayer status
    const record = await getPrayerRecord(today);
    const completedPrayers = record ? record.prayers : [];

    // Update UI for each prayer
    PRAYERS.forEach(prayer => {
        const card = document.querySelector(`.prayer-card[data-prayer="${prayer}"]`);
        const btn = document.querySelector(`.prayer-btn[data-prayer="${prayer}"]`);

        if (completedPrayers.includes(prayer)) {
            card.classList.add('completed');
            btn.querySelector('.text').textContent = 'Completed';
        } else {
            card.classList.remove('completed');
            btn.querySelector('.text').textContent = 'Mark Complete';
        }

        // Add click handler
        btn.onclick = () => togglePrayer(prayer);
    });

    updateTodayProgress(completedPrayers.length);
}

async function togglePrayer(prayer) {
    const today = getDateString();
    const record = await getPrayerRecord(today);
    let completedPrayers = record ? record.prayers : [];

    if (completedPrayers.includes(prayer)) {
        completedPrayers = completedPrayers.filter(p => p !== prayer);
    } else {
        completedPrayers.push(prayer);
    }

    await savePrayerRecord(today, completedPrayers);
    await initTodayView();
}

function updateTodayProgress(count) {
    const percentage = (count / 5) * 100;
    document.getElementById('todayProgress').style.width = `${percentage}%`;
    document.getElementById('progressText').textContent = `${count} of 5 prayers completed`;
}

// History functionality
async function loadHistory(filterMonth = null, filterYear = null) {
    const historyList = document.getElementById('historyList');
    const records = await getAllPrayerRecords();

    // Sort by date descending
    records.sort((a, b) => b.date.localeCompare(a.date));

    // Filter by month and/or year
    let filteredRecords = records;
    if (filterMonth || filterYear) {
        filteredRecords = records.filter(r => {
            const [year, month] = r.date.split('-');
            const matchesMonth = !filterMonth || month === filterMonth;
            const matchesYear = !filterYear || year === filterYear;
            return matchesMonth && matchesYear;
        });
    }

    // Populate year filter with available years
    populateYearFilter(records);

    if (filteredRecords.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state">
                <h3>No records found</h3>
                <p>Start tracking your prayers to see history here</p>
            </div>
        `;
        return;
    }

    historyList.innerHTML = filteredRecords.map(record => {
        const completed = record.prayers;

        return `
            <div class="history-item">
                <div class="history-date">${formatDate(record.date)}</div>
                <div class="history-prayers-checkboxes">
                    ${PRAYERS.map(prayer => `
                        <div class="prayer-checkbox-item">
                            <input
                                type="checkbox"
                                ${completed.includes(prayer) ? 'checked' : ''}
                                class="prayer-checkbox"
                                id="history-${record.date}-${prayer}"
                                onchange="toggleHistoryPrayer('${record.date}', '${prayer}', this.checked)"
                            >
                            <label for="history-${record.date}-${prayer}">${capitalize(prayer)}</label>
                        </div>
                    `).join('')}
                </div>
                <div class="history-actions">
                    <button class="btn-icon" onclick="openEditModal('${record.date}')">Edit</button>
                </div>
            </div>
        `;
    }).join('');
}

async function toggleHistoryPrayer(date, prayer, isChecked) {
    // Prevent editing future dates
    if (isFutureDate(date)) {
        alert('Cannot edit prayers for future dates');
        // Revert the checkbox
        const checkbox = document.getElementById(`history-${date}-${prayer}`);
        if (checkbox) {
            checkbox.checked = !isChecked;
        }
        return;
    }

    const record = await getPrayerRecord(date);
    let completedPrayers = record ? record.prayers : [];

    if (isChecked) {
        // Add prayer if not already in the list
        if (!completedPrayers.includes(prayer)) {
            completedPrayers.push(prayer);
        }
    } else {
        // Remove prayer from the list
        completedPrayers = completedPrayers.filter(p => p !== prayer);
    }

    await savePrayerRecord(date, completedPrayers);

    // If updating today's prayers, refresh the today view
    if (date === getDateString()) {
        await initTodayView();
    }

    // Refresh statistics if on stats tab
    const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab;
    if (activeTab === 'stats') {
        await loadStatistics();
    }
}

function populateYearFilter(records) {
    const yearFilter = document.getElementById('yearFilter');
    const currentOptions = Array.from(yearFilter.options).map(opt => opt.value);

    // Get unique years from records
    const years = [...new Set(records.map(r => r.date.split('-')[0]))].sort((a, b) => b.localeCompare(a));

    // Add current year if not in records
    const currentYear = new Date().getFullYear().toString();
    if (!years.includes(currentYear)) {
        years.unshift(currentYear);
    }

    // Only update if years have changed
    const newYears = years.filter(y => !currentOptions.includes(y));
    if (newYears.length > 0) {
        // Keep the "All Years" option and add years
        const existingHTML = '<option value="">All Years</option>';
        yearFilter.innerHTML = existingHTML + years.map(year =>
            `<option value="${year}">${year}</option>`
        ).join('');
    }
}

function initHistoryControls() {
    const addRecordBtn = document.getElementById('addRecord');
    const monthFilter = document.getElementById('monthFilter');
    const yearFilter = document.getElementById('yearFilter');
    const clearFilter = document.getElementById('clearFilter');

    addRecordBtn.addEventListener('click', () => {
        openAddModal();
    });

    monthFilter.addEventListener('change', () => {
        const month = monthFilter.value;
        const year = yearFilter.value;
        loadHistory(month, year);
    });

    yearFilter.addEventListener('change', () => {
        const month = monthFilter.value;
        const year = yearFilter.value;
        loadHistory(month, year);
    });

    clearFilter.addEventListener('click', () => {
        monthFilter.value = '';
        yearFilter.value = '';
        loadHistory();
    });
}

// Edit modal functionality
async function openEditModal(date) {
    // Prevent editing future dates
    if (isFutureDate(date)) {
        alert('Cannot edit prayers for future dates');
        return;
    }

    currentEditDate = date;
    const modal = document.getElementById('editModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalDate = document.getElementById('modalDate');
    const modalPrayers = document.getElementById('modalPrayers');
    const datePickerContainer = document.getElementById('datePickerContainer');

    // Configure modal for editing
    modalTitle.textContent = 'Edit Prayer Record';
    datePickerContainer.style.display = 'none';
    modalDate.style.display = 'block';
    modalDate.textContent = formatDate(date);

    const record = await getPrayerRecord(date);
    const completedPrayers = record ? record.prayers : [];

    modalPrayers.innerHTML = PRAYERS.map(prayer => `
        <div class="modal-prayer-item">
            <input
                type="checkbox"
                id="modal-${prayer}"
                ${completedPrayers.includes(prayer) ? 'checked' : ''}
            >
            <label for="modal-${prayer}">${capitalize(prayer)}</label>
        </div>
    `).join('');

    modal.classList.add('active');
}

function openAddModal() {
    currentEditDate = null;
    const modal = document.getElementById('editModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalDate = document.getElementById('modalDate');
    const modalPrayers = document.getElementById('modalPrayers');
    const datePickerContainer = document.getElementById('datePickerContainer');
    const datePicker = document.getElementById('modalDatePicker');

    // Configure modal for adding
    modalTitle.textContent = 'Add Prayer Record';
    datePickerContainer.style.display = 'block';
    modalDate.style.display = 'none';
    datePicker.value = getDateString();
    datePicker.max = getDateString(); // Can't add future dates

    modalPrayers.innerHTML = PRAYERS.map(prayer => `
        <div class="modal-prayer-item">
            <input
                type="checkbox"
                id="modal-${prayer}"
            >
            <label for="modal-${prayer}">${capitalize(prayer)}</label>
        </div>
    `).join('');

    modal.classList.add('active');
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
    currentEditDate = null;
}

async function saveEdit() {
    // Get date from either currentEditDate or date picker
    let dateToSave = currentEditDate;
    if (!dateToSave) {
        // Adding new record
        const datePicker = document.getElementById('modalDatePicker');
        dateToSave = datePicker.value;
        if (!dateToSave) {
            alert('Please select a date');
            return;
        }
    }

    const completedPrayers = PRAYERS.filter(prayer => {
        return document.getElementById(`modal-${prayer}`).checked;
    });

    await savePrayerRecord(dateToSave, completedPrayers);
    closeEditModal();

    // Refresh current view
    const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
    if (activeTab === 'history') {
        loadHistory();
    } else if (activeTab === 'today' && dateToSave === getDateString()) {
        await initTodayView();
    } else if (activeTab === 'stats') {
        loadStatistics();
    }
}

function initModal() {
    document.getElementById('closeModal').addEventListener('click', closeEditModal);
    document.getElementById('cancelEdit').addEventListener('click', closeEditModal);
    document.getElementById('saveEdit').addEventListener('click', saveEdit);

    // Close modal when clicking outside
    document.getElementById('editModal').addEventListener('click', (e) => {
        if (e.target.id === 'editModal') {
            closeEditModal();
        }
    });
}

// Statistics functionality
async function loadStatistics() {
    const records = await getAllPrayerRecords();

    if (records.length === 0) {
        return;
    }

    // Calculate overall completion rate
    const totalPrayers = records.reduce((sum, r) => sum + r.prayers.length, 0);
    const totalPossible = records.length * 5;
    const overallRate = Math.round((totalPrayers / totalPossible) * 100);
    document.getElementById('overallRate').textContent = `${overallRate}%`;

    // Calculate this week's rate
    const weekRate = calculatePeriodRate(records, 7);
    document.getElementById('weekRate').textContent = `${weekRate}%`;

    // Calculate this month's rate
    const monthRate = calculatePeriodRate(records, 30);
    document.getElementById('monthRate').textContent = `${monthRate}%`;

    // Calculate streaks
    const { current, longest } = calculateStreaks(records);
    document.getElementById('currentStreak').textContent = current;
    document.getElementById('longestStreak').textContent = longest;

    // Prayer timing analysis
    renderPrayerAnalysis(records);

    // Calendar view
    renderCalendar(records);
}

function calculatePeriodRate(records, days) {
    const today = new Date();
    const periodStart = new Date(today);
    periodStart.setDate(today.getDate() - days);

    const periodRecords = records.filter(r => {
        const recordDate = new Date(r.date + 'T00:00:00');
        return recordDate >= periodStart && recordDate <= today;
    });

    if (periodRecords.length === 0) return 0;

    const totalPrayers = periodRecords.reduce((sum, r) => sum + r.prayers.length, 0);
    const totalPossible = periodRecords.length * 5;
    return Math.round((totalPrayers / totalPossible) * 100);
}

function calculateStreaks(records) {
    if (records.length === 0) return { current: 0, longest: 0 };

    // Sort by date ascending
    const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const today = getDateString();

    // Check if we have a current streak
    const latestDate = sorted[sorted.length - 1].date;
    const daysSinceLatest = getDaysDifference(latestDate, today);

    for (let i = sorted.length - 1; i >= 0; i--) {
        const record = sorted[i];
        const nextRecord = sorted[i + 1];

        // A day counts towards streak if at least 3 prayers were completed
        if (record.prayers.length >= 3) {
            tempStreak++;

            if (i === sorted.length - 1 && daysSinceLatest <= 1) {
                currentStreak = tempStreak;
            }

            longestStreak = Math.max(longestStreak, tempStreak);
        } else {
            tempStreak = 0;
            if (i === sorted.length - 1) {
                currentStreak = 0;
            }
        }

        // Check for gaps
        if (nextRecord) {
            const dayDiff = getDaysDifference(record.date, nextRecord.date);
            if (dayDiff > 1) {
                tempStreak = 0;
            }
        }
    }

    // Reset current streak if latest record is too old
    if (daysSinceLatest > 1) {
        currentStreak = 0;
    }

    return { current: currentStreak, longest: longestStreak };
}

function renderPrayerAnalysis(records) {
    const prayerCounts = {};
    PRAYERS.forEach(p => prayerCounts[p] = 0);

    records.forEach(record => {
        record.prayers.forEach(prayer => {
            prayerCounts[prayer]++;
        });
    });

    const total = records.length;
    const prayerBars = document.getElementById('prayerBars');

    prayerBars.innerHTML = PRAYERS.map(prayer => {
        const count = prayerCounts[prayer];
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

        return `
            <div class="prayer-bar-item">
                <div class="prayer-bar-label">${capitalize(prayer)}</div>
                <div class="prayer-bar-container">
                    <div class="prayer-bar-fill" style="width: ${percentage}%">
                        ${percentage > 15 ? percentage + '%' : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderCalendar(records) {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    // Update month display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('calendarMonth').textContent = `${monthNames[month]} ${year}`;

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Create records map for quick lookup
    const recordsMap = {};
    records.forEach(r => {
        recordsMap[r.date] = r.prayers.length;
    });

    const calendar = document.getElementById('calendar');
    const today = getDateString();

    // Day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let calendarHTML = dayHeaders.map(day =>
        `<div class="calendar-day header">${day}</div>`
    ).join('');

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
        calendarHTML += '<div class="calendar-day empty"></div>';
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const prayerCount = recordsMap[dateStr] || 0;
        const isFuture = isFutureDate(dateStr);

        let className = 'calendar-day';
        if (prayerCount === 5) className += ' perfect';
        else if (prayerCount > 0) className += ' partial';
        else if (recordsMap[dateStr] !== undefined) className += ' none';
        else className += ' no-data';

        if (dateStr === today) className += ' today';
        if (isFuture) className += ' future';

        // Only allow clicking on past and present dates
        const onclickAttr = isFuture ? '' : `onclick="openEditModal('${dateStr}')"`;
        calendarHTML += `<div class="${className}" ${onclickAttr}>${day}</div>`;
    }

    calendar.innerHTML = calendarHTML;
}

function initCalendarControls() {
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        loadStatistics();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        loadStatistics();
    });
}

// Utility functions
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Make functions available globally for onclick handlers
window.openEditModal = openEditModal;
window.toggleHistoryPrayer = toggleHistoryPrayer;

// Initialize app
async function init() {
    try {
        await initDB();
        initTabs();
        initHistoryControls();
        initModal();
        initCalendarControls();
        await initTodayView();
    } catch (error) {
        console.error('Failed to initialize app:', error);
        alert('Failed to initialize the app. Please check browser compatibility.');
    }
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
