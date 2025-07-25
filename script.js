// Main variables
let schedule = [];
let currentTime = '09:00';
let floorNumber = 1;
let floorsCount = 1;

const dancesDuration = {
    "Waltz": 2,
    "Tango": 2,
    "Viennese Waltz": 1.5,
    "Foxtrot": 2,
    "Quickstep": 1.5,
    "Samba": 1.5,
    "Cha Cha": 1.5,
    "Rumba": 2,
    "Paso Doble": 1.5,
    "Jive": 1.5
};

const roundSettings = {
    "Final": { duration: 10, passNext: 6 },
    "Semi-final": { duration: 8, passNext: 12 },
    "Quarter-final": { duration: 7, passNext: 24 },
    "1/8 Final": { duration: 6, passNext: 48 },
    "1/16 Final": { duration: 5, passNext: 96 }
};

document.addEventListener('DOMContentLoaded', function() {
    const addDanceCategoryBtn = document.getElementById('addDanceCategoryBtn');
    const addTechBreakBtn = document.getElementById('addTechBreakBtn');
    const generatePdfBtn = document.getElementById('generatePdfBtn');
    const clearScheduleBtn = document.getElementById('clearScheduleBtn');
    const floorsCountInput = document.getElementById('floorsCount');
    
    addDanceCategoryBtn.addEventListener('click', addDanceCategory);
    addTechBreakBtn.addEventListener('click', addTechnicalBreak);
    generatePdfBtn.addEventListener('click', generatePDF);
    clearScheduleBtn.addEventListener('click', clearSchedule);
    floorsCountInput.addEventListener('change', updateFloorsCount);
    
    // Initialize with current time
    currentTime = document.getElementById('startTime').value || '09:00';
});

function updateFloorsCount() {
    floorsCount = parseInt(document.getElementById('floorsCount').value) || 1;
    floorNumber = floorNumber > floorsCount ? 1 : floorNumber;
    updateScheduleTable();
}

function addDanceCategory() {
    const category = document.getElementById('categorySelect').value;
    const dancesSelect = document.getElementById('dancesSelect');
    const selectedDances = Array.from(dancesSelect.selectedOptions).map(opt => opt.value);
    const participants = parseInt(document.getElementById('participantsCount').value);
    const roundsSelect = document.getElementById('roundsSelect');
    const selectedRounds = Array.from(roundsSelect.selectedOptions).map(opt => opt.value);
    const scoringSystem = document.getElementById('scoringSystem').value;
    
    if (selectedDances.length === 0) {
        alert('Please select at least one dance');
        return;
    }
    
    if (selectedRounds.length === 0) {
        alert('Please select at least one round');
        return;
    }
    
    // Reset time for first item
    if (schedule.length === 0) {
        currentTime = document.getElementById('startTime').value || '09:00';
        floorNumber = 1;
    }
    
    // Add each round as separate schedule entry
    selectedRounds.forEach(round => {
        const roundInfo = roundSettings[round] || { duration: 5, passNext: 6 };
        const heats = calculateHeats(participants, round);
        const duration = round === 'Final' ? 10 : roundInfo.duration;
        const totalDuration = heats * duration;
        const passNext = Math.min(participants, roundInfo.passNext);
        
        const scheduleItem = {
            id: Date.now() + Math.random(),
            startTime: currentTime,
            type: 'dance',
            category: category,
            description: `${category} - ${round}`,
            dances: selectedDances.join(', '),
            floor: floorNumber,
            participants: participants,
            passNext: passNext,
            heats: heats,
            scoring: scoringSystem,
            duration: totalDuration,
            durationDisplay: totalDuration + ' min'
        };
        
        schedule.push(scheduleItem);
        
        // Rotate floors
        floorNumber = floorNumber % floorsCount + 1;
        
        // Update current time with 15 min break
        currentTime = addMinutes(currentTime, totalDuration + 15);
    });
    
    updateScheduleTable();
    document.getElementById('generatePdfBtn').disabled = false;
}

function addTechnicalBreak() {
    const breakName = document.getElementById('techBreakName').value.trim();
    const duration = parseInt(document.getElementById('techBreakDuration').value);
    
    if (!breakName) {
        alert('Please enter break description');
        return;
    }
    
    if (schedule.length === 0) {
        currentTime = document.getElementById('startTime').value || '09:00';
    }
    
    const scheduleItem = {
        id: Date.now() + Math.random(),
        startTime: currentTime,
        type: 'technical',
        category: 'Technical Break',
        description: breakName,
        dances: '',
        floor: '',
        participants: '',
        passNext: '',
        heats: '',
        scoring: '',
        duration: duration,
        durationDisplay: duration + ' min'
    };
    
    schedule.push(scheduleItem);
    currentTime = addMinutes(currentTime, duration);
    
    updateScheduleTable();
    document.getElementById('generatePdfBtn').disabled = false;
    
    // Clear input fields
    document.getElementById('techBreakName').value = '';
    document.getElementById('techBreakDuration').value = '30';
}

function calculateHeats(participants, round) {
    const roundInfo = roundSettings[round] || { passNext: 6 };
    const maxPerHeat = 6; // Maximum couples per heat
    
    if (round === 'Final') {
        return Math.ceil(participants / maxPerHeat);
    }
    
    return Math.ceil(participants / Math.min(maxPerHeat * 2, roundInfo.passNext * 2));
}

function updateScheduleTable() {
    const tbody = document.getElementById('scheduleBody');
    tbody.innerHTML = '';
    
    if (schedule.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="text-center">No schedule items added yet</td></tr>';
        return;
    }
    
    schedule.forEach((item, index) => {
        const row = document.createElement('tr');
        if (item.type === 'technical') {
            row.classList.add('table-info');
        }
        
        row.innerHTML = `
            <td>${item.startTime}</td>
            <td>${item.category}</td>
            <td>${item.dances}</td>
            <td>${item.floor || '-'}</td>
            <td>${item.participants || '-'}</td>
            <td>${item.passNext || '-'}</td>
            <td>${item.heats || '-'}</td>
            <td>${item.scoring || '-'}</td>
            <td>${item.durationDisplay}</td>
            <td>
                <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${item.id}">Delete</button>
                ${index > 0 ? `<button class="btn btn-sm btn-outline-primary ms-1 edit-time-btn" data-id="${item.id}">Edit Time</button>` : ''}
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteScheduleItem(this.getAttribute('data-id'));
        });
    });
    
    // Add event listeners to edit time buttons
    document.querySelectorAll('.edit-time-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            editScheduleItemTime(this.getAttribute('data-id'));
        });
    });
}

function deleteScheduleItem(id) {
    schedule = schedule.filter(item => item.id !== id);
    recalculateTimes();
    updateScheduleTable();
    if (schedule.length === 0) {
        document.getElementById('generatePdfBtn').disabled = true;
    }
}

function editScheduleItemTime(id) {
    const item = schedule.find(item => item.id === id);
    if (!item) return;
    
    const newTime = prompt('Enter new start time (HH:MM):', item.startTime);
    if (!newTime || newTime === item.startTime) return;
    
    if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(newTime)) {
        alert('Please enter time in HH:MM format');
        return;
    }
    
    item.startTime = newTime;
    recalculateTimes();
    updateScheduleTable();
}

function recalculateTimes() {
    if (schedule.length === 0) return;
    
    // First item gets the manually set start time
    let current = schedule[0].startTime;
    schedule[0].startTime = current;
    
    for (let i = 1; i < schedule.length; i++) {
        const prevItem = schedule[i-1];
        current = addMinutes(prevItem.startTime, prevItem.duration);
        
        // Add 15 min break between dance categories
        if (prevItem.type === 'dance' && schedule[i].type === 'dance') {
            current = addMinutes(current, 15);
        }
        
        schedule[i].startTime = current;
    }
}

function addMinutes(time, minutes) {
    const [hours, mins] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, mins + minutes, 0);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function clearSchedule() {
    if (confirm('Are you sure you want to clear the entire schedule?')) {
        schedule = [];
        currentTime = document.getElementById('startTime').value || '09:00';
        floorNumber = 1;
        updateScheduleTable();
        document.getElementById('generatePdfBtn').disabled = true;
    }
}

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'landscape'
    });
    
    const eventName = document.getElementById('eventName').value || 'Dance Competition';
    const eventDate = document.getElementById('eventDate').value || new Date().toISOString().split('T')[0];
    
    // Header
    doc.setFontSize(16);
    doc.text(eventName, 145, 10, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Date: ${formatDate(eventDate)}`, 145, 16, { align: 'center' });
    
    // Prepare data for the table
    const headers = [
        "Start Time",
        "Category",
        "Dances",
        "Floor #",
        "Couples",
        "Advance",
        "Heats",
        "Scoring",
        "Duration"
    ];
    
    const data = schedule.map(item => [
        item.startTime,
        item.category,
        item.dances,
        item.floor || '-',
        item.participants || '-',
        item.passNext || '-',
        item.heats || '-',
        item.scoring || '-',
        item.durationDisplay
    ]);
    
    // Add the table
    doc.autoTable({
        startY: 20,
        head: [headers],
        body: data,
        margin: { left: 10 },
        styles: { 
            fontSize: 8, 
            cellPadding: 3,
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0]
        },
        headerStyles: { 
            fillColor: [220, 220, 220],
            textColor: [0, 0, 0],
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [240, 240, 240]
        },
        didDrawCell: function(data) {
            // Highlight technical breaks
            if (schedule[data.row.index]?.type === 'technical') {
                doc.setFillColor(173, 216, 230); // Light blue
                doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
                doc.setTextColor(0, 0, 0);
            }
        }
    });
    
    doc.save('Dance_Schedule.pdf');
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}
