// Medical Records & Treatment Tracking System
// Comprehensive health records, medication schedules, and veterinary care management

let medicalRecords = [];
let prescriptions = [];
let vetVisits = [];
let currentView = 'records';
let currentMedDate = new Date();

// Initialize system
document.addEventListener('DOMContentLoaded', function() {
    initializeSystem();
    loadMedicalRecords();
    updateStatistics();
    checkMedicationAlerts();
    populateAnimalSelects();
    
    setInterval(checkMedicationAlerts, 300000); // Check every 5 minutes
});

function initializeSystem() {
    const savedRecords = localStorage.getItem('medicalRecords');
    const savedPrescriptions = localStorage.getItem('prescriptions');
    const savedVetVisits = localStorage.getItem('vetVisits');
    
    if (savedRecords) {
        medicalRecords = JSON.parse(savedRecords);
    } else {
        medicalRecords = [
            {
                id: 'MR-001',
                animalId: 'Luna',
                species: 'dog',
                age: '2 years',
                temperature: 102.5,
                weight: 45.2,
                heartRate: 90,
                primaryDiagnosis: 'Parvovirus',
                symptoms: 'Vomiting, diarrhea, lethargy',
                conditions: ['infection', 'malnutrition'],
                treatmentPlan: 'IV fluids, antibiotics, anti-nausea medication. Monitor hydration and appetite.',
                treatmentDuration: 7,
                followUpDate: '2026-02-04',
                vetName: 'Dr. Sarah Mitchell',
                vetClinic: 'Emergency Animal Hospital',
                status: 'active',
                createdDate: '2026-01-26',
                files: []
            },
            {
                id: 'MR-002',
                animalId: 'Max',
                species: 'cat',
                age: '1 year',
                temperature: 101.8,
                weight: 9.5,
                heartRate: 180,
                primaryDiagnosis: 'Upper Respiratory Infection',
                symptoms: 'Sneezing, nasal discharge, decreased appetite',
                conditions: ['respiratory'],
                treatmentPlan: 'Antibiotics, supportive care, isolation',
                treatmentDuration: 10,
                followUpDate: '2026-02-05',
                vetName: 'Dr. John Davis',
                vetClinic: 'Main Facility',
                status: 'stable',
                createdDate: '2026-01-25',
                files: []
            }
        ];
        saveMedicalRecords();
    }
    
    if (savedPrescriptions) {
        prescriptions = JSON.parse(savedPrescriptions);
    } else {
        prescriptions = [
            {
                id: 'RX-001',
                recordId: 'MR-001',
                animalId: 'Luna',
                medicationName: 'Metronidazole',
                dosage: '250mg',
                frequency: 'twice-daily',
                startDate: '2026-01-26',
                endDate: '2026-02-02',
                administrationRoute: 'oral',
                prescribedBy: 'Dr. Sarah Mitchell',
                specialInstructions: 'Give with food',
                administrationLog: [
                    { date: '2026-01-26', time: '08:00', administered: true, by: 'Staff A' },
                    { date: '2026-01-26', time: '20:00', administered: true, by: 'Staff B' }
                ],
                status: 'active'
            }
        ];
        savePrescriptions();
    }
    
    if (savedVetVisits) {
        vetVisits = JSON.parse(savedVetVisits);
    } else {
        vetVisits = [
            {
                id: 'VV-001',
                recordId: 'MR-001',
                animalId: 'Luna',
                visitType: 'follow-up',
                visitDate: '2026-02-04',
                visitTime: '10:00',
                vetName: 'Dr. Sarah Mitchell',
                clinic: 'Emergency Animal Hospital',
                reason: 'Parvovirus follow-up examination',
                status: 'scheduled',
                notes: ''
            }
        ];
        saveVetVisits();
    }
}

// Medical Record Management
function submitMedicalRecord(event) {
    event.preventDefault();
    
    const conditions = Array.from(document.querySelectorAll('input[name="condition"]:checked'))
        .map(cb => cb.value);
    
    const newRecord = {
        id: `MR-${String(medicalRecords.length + 1).padStart(3, '0')}`,
        animalId: document.getElementById('animalId').value,
        species: document.getElementById('animalSpecies').value,
        age: document.getElementById('animalAge').value,
        temperature: parseFloat(document.getElementById('temperature').value) || null,
        weight: parseFloat(document.getElementById('weight').value) || null,
        heartRate: parseInt(document.getElementById('heartRate').value) || null,
        primaryDiagnosis: document.getElementById('primaryDiagnosis').value,
        symptoms: document.getElementById('symptoms').value,
        conditions: conditions,
        treatmentPlan: document.getElementById('treatmentPlan').value,
        treatmentDuration: parseInt(document.getElementById('treatmentDuration').value) || null,
        followUpDate: document.getElementById('followUpDate').value,
        vetName: document.getElementById('vetName').value,
        vetClinic: document.getElementById('vetClinic').value,
        status: 'active',
        createdDate: new Date().toISOString().split('T')[0],
        files: [],
        createdAt: new Date().toISOString()
    };
    
    medicalRecords.unshift(newRecord);
    saveMedicalRecords();
    closeMedicalRecordModal();
    loadMedicalRecords();
    updateStatistics();
    populateAnimalSelects();
    
    showNotification('Success', `Medical record ${newRecord.id} created for ${newRecord.animalId}`, 'success');
}

function loadMedicalRecords() {
    if (currentView === 'records') {
        renderRecordsGrid();
    }
}

function renderRecordsGrid() {
    const grid = document.getElementById('recordsGrid');
    if (!grid) return;
    
    let filteredRecords = filterRecordsBySearch();
    
    if (filteredRecords.length === 0) {
        grid.innerHTML = '<div class="no-data">No medical records found</div>';
        return;
    }
    
    grid.innerHTML = filteredRecords.map(record => {
        const activeMeds = prescriptions.filter(p => 
            p.recordId === record.id && 
            p.status === 'active' &&
            new Date(p.endDate) >= new Date()
        ).length;
        
        const statusClass = {
            'active': 'status-active',
            'stable': 'status-stable',
            'critical': 'status-critical',
            'recovered': 'status-recovered'
        }[record.status] || 'status-active';
        
        return `
            <div class="medical-record-card">
                <div class="record-header">
                    <div>
                        <h3>${record.animalId}</h3>
                        <p class="record-id">${record.id}</p>
                    </div>
                    <span class="status-badge ${statusClass}">${record.status}</span>
                </div>
                <div class="record-body">
                    <div class="diagnosis-section">
                        <strong>Diagnosis:</strong> ${record.primaryDiagnosis}
                    </div>
                    <div class="info-grid">
                        <div class="info-item">
                            <i class="fas fa-thermometer-half"></i>
                            <span>${record.temperature ? record.temperature + '°F' : 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-weight"></i>
                            <span>${record.weight ? record.weight + ' lbs' : 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-heartbeat"></i>
                            <span>${record.heartRate ? record.heartRate + ' bpm' : 'N/A'}</span>
                        </div>
                    </div>
                    <div class="conditions-section">
                        ${record.conditions.map(c => `<span class="condition-badge">${c}</span>`).join(' ')}
                    </div>
                    <div class="record-stats">
                        <div class="stat-item">
                            <i class="fas fa-pills"></i>
                            <span>${activeMeds} active meds</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-user-md"></i>
                            <span>${record.vetName || 'N/A'}</span>
                        </div>
                    </div>
                </div>
                <div class="record-actions">
                    <button class="btn-icon" onclick="viewRecordDetails('${record.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" onclick="addPrescriptionToRecord('${record.id}')" title="Add Medication">
                        <i class="fas fa-prescription"></i>
                    </button>
                    <button class="btn-icon" onclick="updateRecordStatus('${record.id}')" title="Update Status">
                        <i class="fas fa-sync"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="deleteRecord('${record.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function viewRecordDetails(recordId) {
    const record = medicalRecords.find(r => r.id === recordId);
    if (!record) return;
    
    const recordPrescriptions = prescriptions.filter(p => p.recordId === recordId);
    const recordVisits = vetVisits.filter(v => v.recordId === recordId);
    
    const modal = document.getElementById('recordDetailsModal');
    const content = document.getElementById('recordDetailsContent');
    
    const conditionsHtml = record.conditions.map(c => 
        `<span class="condition-badge">${c}</span>`
    ).join(' ');
    
    const prescriptionsHtml = recordPrescriptions.length > 0
        ? recordPrescriptions.map(rx => `
            <div class="prescription-item">
                <div class="rx-header">
                    <strong>${rx.medicationName}</strong>
                    <span class="status-badge status-${rx.status}">${rx.status}</span>
                </div>
                <div class="rx-details">
                    <span>${rx.dosage} - ${formatFrequency(rx.frequency)}</span>
                    <span>Route: ${rx.administrationRoute}</span>
                    <span>Duration: ${formatDate(rx.startDate)} to ${formatDate(rx.endDate)}</span>
                </div>
                ${rx.specialInstructions ? `<p class="rx-instructions">${rx.specialInstructions}</p>` : ''}
            </div>
        `).join('')
        : '<p class="no-data">No prescriptions recorded</p>';
    
    const visitsHtml = recordVisits.length > 0
        ? recordVisits.map(visit => `
            <div class="visit-item">
                <div class="visit-header">
                    <strong>${visit.visitType}</strong>
                    <span class="status-badge status-${visit.status}">${visit.status}</span>
                </div>
                <div class="visit-details">
                    <span>${formatDate(visit.visitDate)} at ${visit.visitTime}</span>
                    <span>${visit.vetName} - ${visit.clinic}</span>
                </div>
                ${visit.reason ? `<p class="visit-reason">${visit.reason}</p>` : ''}
            </div>
        `).join('')
        : '<p class="no-data">No vet visits scheduled</p>';
    
    content.innerHTML = `
        <h2><i class="fas fa-notes-medical"></i> ${record.animalId} - Medical Record</h2>
        
        <div class="details-grid">
            <div class="detail-section">
                <h3>Patient Information</h3>
                <div class="detail-row">
                    <span class="label">Record ID:</span>
                    <span class="value">${record.id}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Species:</span>
                    <span class="value">${record.species}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Age:</span>
                    <span class="value">${record.age}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Status:</span>
                    <span class="value"><span class="status-badge status-${record.status}">${record.status}</span></span>
                </div>
                <div class="detail-row">
                    <span class="label">Created:</span>
                    <span class="value">${formatDate(record.createdDate)}</span>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Vitals</h3>
                <div class="vitals-grid">
                    <div class="vital-item">
                        <i class="fas fa-thermometer-half"></i>
                        <div>
                            <span class="vital-label">Temperature</span>
                            <span class="vital-value">${record.temperature ? record.temperature + '°F' : 'N/A'}</span>
                        </div>
                    </div>
                    <div class="vital-item">
                        <i class="fas fa-weight"></i>
                        <div>
                            <span class="vital-label">Weight</span>
                            <span class="vital-value">${record.weight ? record.weight + ' lbs' : 'N/A'}</span>
                        </div>
                    </div>
                    <div class="vital-item">
                        <i class="fas fa-heartbeat"></i>
                        <div>
                            <span class="vital-label">Heart Rate</span>
                            <span class="vital-value">${record.heartRate ? record.heartRate + ' bpm' : 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="detail-section full-width">
                <h3>Diagnosis & Symptoms</h3>
                <div class="detail-row">
                    <span class="label">Primary Diagnosis:</span>
                    <span class="value"><strong>${record.primaryDiagnosis}</strong></span>
                </div>
                <div class="detail-row">
                    <span class="label">Symptoms:</span>
                    <span class="value">${record.symptoms || 'None reported'}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Conditions:</span>
                    <span class="value">${conditionsHtml || 'None'}</span>
                </div>
            </div>
            
            <div class="detail-section full-width">
                <h3>Treatment Plan</h3>
                <p class="treatment-description">${record.treatmentPlan}</p>
                <div class="detail-row">
                    <span class="label">Duration:</span>
                    <span class="value">${record.treatmentDuration ? record.treatmentDuration + ' days' : 'Ongoing'}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Follow-up Date:</span>
                    <span class="value">${record.followUpDate ? formatDate(record.followUpDate) : 'Not scheduled'}</span>
                </div>
            </div>
            
            <div class="detail-section full-width">
                <h3>Prescriptions</h3>
                <div class="prescriptions-list">
                    ${prescriptionsHtml}
                </div>
            </div>
            
            <div class="detail-section full-width">
                <h3>Veterinary Visits</h3>
                <div class="visits-list">
                    ${visitsHtml}
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Veterinarian</h3>
                <div class="detail-row">
                    <span class="label">Name:</span>
                    <span class="value">${record.vetName || 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Clinic:</span>
                    <span class="value">${record.vetClinic || 'N/A'}</span>
                </div>
            </div>
        </div>
        
        <div class="modal-actions">
            <button class="btn btn-secondary" onclick="closeRecordDetailsModal()">Close</button>
            <button class="btn btn-primary" onclick="addPrescriptionToRecord('${record.id}'); closeRecordDetailsModal();">Add Medication</button>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Prescription Management
function submitPrescription(event) {
    event.preventDefault();
    
    const animalId = document.getElementById('prescriptionAnimal').value;
    const record = medicalRecords.find(r => r.animalId === animalId);
    
    const newPrescription = {
        id: `RX-${String(prescriptions.length + 1).padStart(3, '0')}`,
        recordId: record ? record.id : null,
        animalId: animalId,
        medicationName: document.getElementById('medicationName').value,
        dosage: document.getElementById('dosage').value,
        frequency: document.getElementById('frequency').value,
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value,
        administrationRoute: document.getElementById('administrationRoute').value,
        prescribedBy: document.getElementById('prescribedBy').value,
        specialInstructions: document.getElementById('specialInstructions').value,
        administrationLog: [],
        status: 'active',
        createdAt: new Date().toISOString()
    };
    
    prescriptions.push(newPrescription);
    savePrescriptions();
    closePrescriptionModal();
    
    if (currentView === 'medications') {
        renderMedicationTimeline();
    }
    
    updateStatistics();
    checkMedicationAlerts();
    
    showNotification('Success', `Prescription added for ${animalId}`, 'success');
}

function renderMedicationTimeline() {
    const timeline = document.getElementById('medicationTimeline');
    if (!timeline) return;
    
    const dateStr = formatDateISO(currentMedDate);
    document.getElementById('currentMedDate').textContent = formatDate(dateStr);
    
    // Get all medications due today
    const todayMeds = prescriptions.filter(rx => {
        const start = new Date(rx.startDate);
        const end = new Date(rx.endDate);
        const current = new Date(dateStr);
        return rx.status === 'active' && current >= start && current <= end;
    });
    
    if (todayMeds.length === 0) {
        timeline.innerHTML = '<div class="no-data">No medications scheduled for this day</div>';
        return;
    }
    
    // Group by time
    const medsByTime = {};
    todayMeds.forEach(rx => {
        const times = getAdministrationTimes(rx.frequency);
        times.forEach(time => {
            if (!medsByTime[time]) {
                medsByTime[time] = [];
            }
            medsByTime[time].push(rx);
        });
    });
    
    // Sort times
    const sortedTimes = Object.keys(medsByTime).sort();
    
    timeline.innerHTML = sortedTimes.map(time => `
        <div class="medication-time-block">
            <div class="time-label">${time}</div>
            <div class="medications-at-time">
                ${medsByTime[time].map(rx => {
                    const administered = isAdministered(rx, dateStr, time);
                    return `
                        <div class="medication-card ${administered ? 'administered' : ''}">
                            <div class="med-header">
                                <strong>${rx.medicationName}</strong>
                                <button class="btn-admin" onclick="toggleAdministration('${rx.id}', '${dateStr}', '${time}')"${administered ? ' disabled' : ''}>
                                    <i class="fas ${administered ? 'fa-check-circle' : 'fa-circle'}"></i>
                                    ${administered ? 'Given' : 'Mark Given'}
                                </button>
                            </div>
                            <div class="med-details">
                                <span class="animal-name">${rx.animalId}</span>
                                <span class="dosage">${rx.dosage} - ${rx.administrationRoute}</span>
                            </div>
                            ${rx.specialInstructions ? `<p class="med-instructions">${rx.specialInstructions}</p>` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `).join('');
}

function getAdministrationTimes(frequency) {
    const times = {
        'once-daily': ['09:00'],
        'twice-daily': ['09:00', '21:00'],
        'three-times-daily': ['09:00', '15:00', '21:00'],
        'every-8-hours': ['06:00', '14:00', '22:00'],
        'every-6-hours': ['06:00', '12:00', '18:00', '00:00'],
        'as-needed': ['09:00']
    };
    return times[frequency] || ['09:00'];
}

function toggleAdministration(rxId, date, time) {
    const rx = prescriptions.find(p => p.id === rxId);
    if (!rx) return;
    
    if (!rx.administrationLog) {
        rx.administrationLog = [];
    }
    
    rx.administrationLog.push({
        date: date,
        time: time,
        administered: true,
        by: 'Current User',
        timestamp: new Date().toISOString()
    });
    
    savePrescriptions();
    renderMedicationTimeline();
    showNotification('Success', `${rx.medicationName} marked as administered`, 'success');
}

function isAdministered(rx, date, time) {
    if (!rx.administrationLog) return false;
    return rx.administrationLog.some(log => 
        log.date === date && log.time === time && log.administered
    );
}

// Vet Visit Management
function submitVetVisit(event) {
    event.preventDefault();
    
    const animalId = document.getElementById('visitAnimal').value;
    const record = medicalRecords.find(r => r.animalId === animalId);
    
    const newVisit = {
        id: `VV-${String(vetVisits.length + 1).padStart(3, '0')}`,
        recordId: record ? record.id : null,
        animalId: animalId,
        visitType: document.getElementById('visitType').value,
        visitDate: document.getElementById('visitDate').value,
        visitTime: document.getElementById('visitTime').value,
        vetName: document.getElementById('visitVet').value,
        clinic: document.getElementById('visitClinic').value,
        reason: document.getElementById('visitReason').value,
        status: 'scheduled',
        notes: '',
        createdAt: new Date().toISOString()
    };
    
    vetVisits.push(newVisit);
    saveVetVisits();
    closeVetVisitModal();
    updateStatistics();
    checkMedicationAlerts();
    
    showNotification('Success', `Vet visit scheduled for ${animalId}`, 'success');
}

// Alerts & Statistics
function checkMedicationAlerts() {
    const alerts = [];
    const today = new Date();
    
    // Check for medications due today
    prescriptions.forEach(rx => {
        if (rx.status === 'active') {
            const start = new Date(rx.startDate);
            const end = new Date(rx.endDate);
            
            if (today >= start && today <= end) {
                const times = getAdministrationTimes(rx.frequency);
                const dateStr = formatDateISO(today);
                times.forEach(time => {
                    if (!isAdministered(rx, dateStr, time)) {
                        alerts.push({
                            type: 'info',
                            icon: 'fas fa-pills',
                            title: 'Medication Due',
                            message: `${rx.animalId} - ${rx.medicationName} at ${time}`,
                            rxId: rx.id
                        });
                    }
                });
            }
            
            // Check if ending soon
            const daysLeft = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
            if (daysLeft <= 2 && daysLeft > 0) {
                alerts.push({
                    type: 'warning',
                    icon: 'fas fa-exclamation-triangle',
                    title: 'Prescription Ending Soon',
                    message: `${rx.animalId} - ${rx.medicationName} ends in ${daysLeft} day(s)`,
                    rxId: rx.id
                });
            }
        }
    });
    
    // Check for upcoming vet visits
    vetVisits.forEach(visit => {
        if (visit.status === 'scheduled') {
            const visitDate = new Date(visit.visitDate);
            const daysUntil = Math.ceil((visitDate - today) / (1000 * 60 * 60 * 24));
            
            if (daysUntil === 0) {
                alerts.push({
                    type: 'info',
                    icon: 'fas fa-stethoscope',
                    title: 'Vet Visit Today',
                    message: `${visit.animalId} - ${visit.visitType} at ${visit.visitTime}`,
                    visitId: visit.id
                });
            } else if (daysUntil === 1) {
                alerts.push({
                    type: 'warning',
                    icon: 'fas fa-calendar-check',
                    title: 'Vet Visit Tomorrow',
                    message: `${visit.animalId} - ${visit.visitType} at ${visit.visitTime}`,
                    visitId: visit.id
                });
            }
        }
    });
    
    // Check for overdue follow-ups
    medicalRecords.forEach(record => {
        if (record.followUpDate) {
            const followUp = new Date(record.followUpDate);
            const daysOverdue = Math.ceil((today - followUp) / (1000 * 60 * 60 * 24));
            
            if (daysOverdue > 0 && record.status === 'active') {
                alerts.push({
                    type: 'danger',
                    icon: 'fas fa-exclamation-circle',
                    title: 'Overdue Follow-up',
                    message: `${record.animalId} - Follow-up was ${daysOverdue} day(s) ago`,
                    recordId: record.id
                });
            }
        }
    });
    
    displayMedicationAlerts(alerts);
}

function displayMedicationAlerts(alerts) {
    const grid = document.getElementById('medicationAlertsGrid');
    if (!grid) return;
    
    if (alerts.length === 0) {
        grid.innerHTML = '<div class="no-alerts"><i class="fas fa-check-circle"></i> No pending alerts</div>';
        return;
    }
    
    grid.innerHTML = alerts.map(alert => `
        <div class="alert alert-${alert.type}">
            <i class="${alert.icon}"></i>
            <div class="alert-content">
                <h4>${alert.title}</h4>
                <p>${alert.message}</p>
            </div>
        </div>
    `).join('');
}

function updateStatistics() {
    const activePatients = medicalRecords.filter(r => r.status === 'active' || r.status === 'critical').length;
    
    const today = new Date();
    const pendingMeds = prescriptions.filter(rx => {
        if (rx.status !== 'active') return false;
        const start = new Date(rx.startDate);
        const end = new Date(rx.endDate);
        return today >= start && today <= end;
    }).length;
    
    const upcomingVisits = vetVisits.filter(v => {
        if (v.status !== 'scheduled') return false;
        const visitDate = new Date(v.visitDate);
        return visitDate >= today;
    }).length;
    
    const pendingLabResults = Math.floor(Math.random() * 5); // Placeholder
    
    document.getElementById('statActivePatients').textContent = activePatients;
    document.getElementById('statPendingMeds').textContent = pendingMeds;
    document.getElementById('statUpcomingVetVisits').textContent = upcomingVisits;
    document.getElementById('statPendingLabResults').textContent = pendingLabResults;
}

// View Management
function showView(view) {
    currentView = view;
    
    document.getElementById('recordsView').style.display = 'none';
    document.getElementById('medicationsView').style.display = 'none';
    document.getElementById('treatmentsView').style.display = 'none';
    
    if (view === 'records') {
        document.getElementById('recordsView').style.display = 'block';
        renderRecordsGrid();
    } else if (view === 'medications') {
        document.getElementById('medicationsView').style.display = 'block';
        renderMedicationTimeline();
    } else if (view === 'treatments') {
        document.getElementById('treatmentsView').style.display = 'block';
        renderTreatmentsGrid();
    }
}

function renderTreatmentsGrid() {
    const grid = document.getElementById('treatmentsGrid');
    if (!grid) return;
    
    const activeTreatments = medicalRecords.filter(r => r.status === 'active' || r.status === 'critical');
    
    if (activeTreatments.length === 0) {
        grid.innerHTML = '<div class="no-data">No active treatment plans</div>';
        return;
    }
    
    grid.innerHTML = activeTreatments.map(record => `
        <div class="treatment-card">
            <div class="treatment-header">
                <h3>${record.animalId}</h3>
                <span class="status-badge status-${record.status}">${record.status}</span>
            </div>
            <div class="treatment-body">
                <div class="diagnosis">${record.primaryDiagnosis}</div>
                <div class="treatment-plan">${record.treatmentPlan}</div>
                <div class="treatment-progress">
                    <span>Duration: ${record.treatmentDuration ? record.treatmentDuration + ' days' : 'Ongoing'}</span>
                    ${record.followUpDate ? `<span>Follow-up: ${formatDate(record.followUpDate)}</span>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function changeMedDay(delta) {
    currentMedDate.setDate(currentMedDate.getDate() + delta);
    renderMedicationTimeline();
}

// Filter & Search
function filterRecords() {
    renderRecordsGrid();
}

function filterRecordsBySearch() {
    const searchTerm = document.getElementById('searchAnimals')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';
    
    return medicalRecords.filter(record => {
        const matchesSearch = !searchTerm || 
            record.animalId.toLowerCase().includes(searchTerm) ||
            record.id.toLowerCase().includes(searchTerm) ||
            record.primaryDiagnosis.toLowerCase().includes(searchTerm);
        
        const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
}

// Modal Functions
function openMedicalRecordModal() {
    document.getElementById('medicalRecordModal').style.display = 'block';
    document.getElementById('medicalRecordForm').reset();
}

function closeMedicalRecordModal() {
    document.getElementById('medicalRecordModal').style.display = 'none';
}

function openPrescriptionModal() {
    document.getElementById('prescriptionModal').style.display = 'block';
    document.getElementById('prescriptionForm').reset();
}

function closePrescriptionModal() {
    document.getElementById('prescriptionModal').style.display = 'none';
}

function openVetVisitModal() {
    document.getElementById('vetVisitModal').style.display = 'block';
    document.getElementById('vetVisitForm').reset();
}

function closeVetVisitModal() {
    document.getElementById('vetVisitModal').style.display = 'none';
}

function closeRecordDetailsModal() {
    document.getElementById('recordDetailsModal').style.display = 'none';
}

function addPrescriptionToRecord(recordId) {
    const record = medicalRecords.find(r => r.id === recordId);
    if (!record) return;
    
    openPrescriptionModal();
    document.getElementById('prescriptionAnimal').value = record.animalId;
}

function updateRecordStatus(recordId) {
    const record = medicalRecords.find(r => r.id === recordId);
    if (!record) return;
    
    const newStatus = prompt(`Update status for ${record.animalId}:\n\nOptions: active, stable, critical, recovered\n\nCurrent: ${record.status}`);
    
    if (newStatus && ['active', 'stable', 'critical', 'recovered'].includes(newStatus.toLowerCase())) {
        record.status = newStatus.toLowerCase();
        saveMedicalRecords();
        renderRecordsGrid();
        updateStatistics();
        showNotification('Success', `Status updated to ${newStatus}`, 'success');
    }
}

function deleteRecord(recordId) {
    if (!confirm('Are you sure you want to delete this medical record?')) return;
    
    medicalRecords = medicalRecords.filter(r => r.id !== recordId);
    prescriptions = prescriptions.filter(p => p.recordId !== recordId);
    vetVisits = vetVisits.filter(v => v.recordId !== recordId);
    
    saveMedicalRecords();
    savePrescriptions();
    saveVetVisits();
    renderRecordsGrid();
    updateStatistics();
    showNotification('Success', 'Medical record deleted', 'success');
}

function populateAnimalSelects() {
    const selects = ['prescriptionAnimal', 'visitAnimal'];
    
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        select.innerHTML = '<option value="">Select Animal</option>';
        const uniqueAnimals = [...new Set(medicalRecords.map(r => r.animalId))];
        
        uniqueAnimals.forEach(animal => {
            const option = document.createElement('option');
            option.value = animal;
            option.textContent = animal;
            select.appendChild(option);
        });
    });
}

function exportMedicalReport() {
    const csv = generateMedicalCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `medical-records-${formatDateISO(new Date())}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Success', 'Medical records exported', 'success');
}

function generateMedicalCSV() {
    const headers = ['Record ID', 'Animal', 'Species', 'Diagnosis', 'Status', 'Treatment Duration', 'Vet', 'Created Date'];
    
    const rows = medicalRecords.map(record => [
        record.id,
        record.animalId,
        record.species,
        record.primaryDiagnosis,
        record.status,
        record.treatmentDuration || 'Ongoing',
        record.vetName,
        record.createdDate
    ]);
    
    const csvRows = [headers, ...rows];
    return csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

// Helper Functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateISO(date) {
    return date.toISOString().split('T')[0];
}

function formatFrequency(freq) {
    const map = {
        'once-daily': 'Once Daily',
        'twice-daily': 'Twice Daily',
        'three-times-daily': 'Three Times Daily',
        'every-8-hours': 'Every 8 Hours',
        'every-6-hours': 'Every 6 Hours',
        'as-needed': 'As Needed'
    };
    return map[freq] || freq;
}

function saveMedicalRecords() {
    localStorage.setItem('medicalRecords', JSON.stringify(medicalRecords));
}

function savePrescriptions() {
    localStorage.setItem('prescriptions', JSON.stringify(prescriptions));
}

function saveVetVisits() {
    localStorage.setItem('vetVisits', JSON.stringify(vetVisits));
}

function showNotification(title, message, type = 'info') {
    alert(`${title}: ${message}`);
}

// Close modals on outside click
window.onclick = function(event) {
    const modals = ['medicalRecordModal', 'prescriptionModal', 'vetVisitModal', 'recordDetailsModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
};
