// Save project to JSON file
function saveProject() {
    if (schedule.length === 0) {
        alert('No schedule to save');
        return;
    }

    const projectData = {
        eventName: document.getElementById('eventName').value,
        eventDate: document.getElementById('eventDate').value,
        startTime: document.getElementById('startTime').value,
        floorsCount: document.getElementById('floorsCount').value,
        schedule: schedule,
        currentTime: currentTime,
        floorNumber: floorNumber
    };

    const dataStr = JSON.stringify(projectData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportName = (document.getElementById('eventName').value || 'dance_schedule') + '.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportName);
    linkElement.click();
}

// Load project from JSON file
function loadProject(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const projectData = JSON.parse(e.target.result);
            
            // Validate the loaded data
            if (!projectData.schedule || !Array.isArray(projectData.schedule)) {
                throw new Error('Invalid project file format');
            }

            // Restore settings
            document.getElementById('eventName').value = projectData.eventName || '';
            document.getElementById('eventDate').value = projectData.eventDate || '';
            document.getElementById('startTime').value = projectData.startTime || '09:00';
            document.getElementById('floorsCount').value = projectData.floorsCount || 1;
            
            // Restore schedule
            schedule = projectData.schedule;
            currentTime = projectData.currentTime || projectData.startTime || '09:00';
            floorNumber = projectData.floorNumber || 1;
            floorsCount = projectData.floorsCount || 1;
            
            updateScheduleTable();
            document.getElementById('generatePdfBtn').disabled = schedule.length === 0;
            
            alert('Project loaded successfully!');
        } catch (error) {
            console.error('Error loading project:', error);
            alert('Error loading project: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// Add to your existing DOMContentLoaded event listener:
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    
    // Add save/load buttons
    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn btn-secondary me-2';
    saveBtn.textContent = 'Save Project';
    saveBtn.addEventListener('click', saveProject);
    
    const loadBtn = document.createElement('button');
    loadBtn.className = 'btn btn-outline-primary me-2';
    loadBtn.textContent = 'Load Project';
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', loadProject);
    
    loadBtn.addEventListener('click', function() {
        fileInput.value = ''; // Reset to allow reloading same file
        fileInput.click();
    });
    
    // Insert buttons next to existing ones
    const btnGroup = document.querySelector('.card-header div');
    btnGroup.insertBefore(saveBtn, btnGroup.firstChild);
    btnGroup.insertBefore(loadBtn, btnGroup.firstChild);
    document.body.appendChild(fileInput);
});
