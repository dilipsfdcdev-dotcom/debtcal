// Debt Management Dashboard - JavaScript

// Sample data based on user's debt list
const sampleData = [
    { id: 1, type: 'HAND LOAN', name: 'Rakshith linga', amount: 5000000, interestPM: 150000, clearBy: '2025-09-15', status: 'Pending' },
    { id: 2, type: 'HAND LOAN', name: 'Ramesh pittala', amount: 3000000, interestPM: 300000, clearBy: '2025-09-30', status: 'Pending' },
    { id: 3, type: 'HAND LOAN', name: 'Anirudh', amount: 1500000, interestPM: 0, clearBy: '2025-08-31', status: 'Pending' },
    { id: 4, type: 'HAND LOAN', name: 'Ravi (Seema)', amount: 1000000, interestPM: 60000, clearBy: '2025-09-30', status: 'Pending' },
    { id: 5, type: 'HAND LOAN', name: 'Bhaskar reddy', amount: 2000000, interestPM: 1000000, clearBy: '2025-08-31', status: 'Pending' },
    { id: 6, type: 'HAND LOAN', name: 'Shyam USDT', amount: 2000000, interestPM: 0, clearBy: '2025-09-30', status: 'Pending' },
    { id: 7, type: 'PL', name: 'Kreditbee', amount: 251035, interestPM: 0, clearBy: '', status: 'Pending' },
    { id: 8, type: 'PL', name: 'Bajaj OD', amount: 1000000, interestPM: 0, clearBy: '', status: 'Pending' },
    { id: 9, type: 'PL', name: 'IDFC', amount: 165000, interestPM: 0, clearBy: '', status: 'Pending' },
    { id: 10, type: 'CC', name: 'BOB', amount: 200000, interestPM: 0, clearBy: '', status: 'Pending' },
    { id: 11, type: 'CC', name: 'IDFC', amount: 150000, interestPM: 0, clearBy: '', status: 'Pending' },
    { id: 12, type: 'CC', name: 'ONE Card', amount: 300000, interestPM: 0, clearBy: '', status: 'Pending' }
];

// Global state
let debts = [];
let editingId = null;
let deleteId = null;
let debtTypeChart = null;
let interestChart = null;

// DOM Elements
const debtForm = document.getElementById('debtForm');
const debtTableBody = document.getElementById('debtTableBody');
const filterType = document.getElementById('filterType');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const confirmModal = document.getElementById('confirmModal');
const confirmDelete = document.getElementById('confirmDelete');
const cancelDelete = document.getElementById('cancelDelete');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderTable();
    updateSummary();
    renderCharts();
    renderBreakdown();
});

// Load data from localStorage or use sample data
function loadData() {
    const stored = localStorage.getItem('debtData');
    if (stored) {
        debts = JSON.parse(stored);
    } else {
        debts = [...sampleData];
        saveData();
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('debtData', JSON.stringify(debts));
}

// Generate unique ID
function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

// Format date for display
function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Get type badge class
function getTypeBadgeClass(type) {
    const classes = {
        'HAND LOAN': 'type-hand-loan',
        'PL': 'type-pl',
        'HOME LOAN': 'type-home-loan',
        'CAR LOAN': 'type-car-loan',
        'CC': 'type-cc'
    };
    return classes[type] || '';
}

// Get status badge class
function getStatusBadgeClass(status) {
    const classes = {
        'Pending': 'status-pending',
        'Cleared': 'status-cleared',
        'Overdue': 'status-overdue'
    };
    return classes[status] || '';
}

// Render table
function renderTable(filter = 'ALL') {
    const filteredDebts = filter === 'ALL' ? debts : debts.filter(d => d.type === filter);

    if (filteredDebts.length === 0) {
        debtTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <p>No debts found. Add your first debt above!</p>
                </td>
            </tr>
        `;
        return;
    }

    debtTableBody.innerHTML = filteredDebts.map(debt => `
        <tr data-id="${debt.id}">
            <td><span class="type-badge ${getTypeBadgeClass(debt.type)}">${debt.type}</span></td>
            <td>${debt.name}</td>
            <td>${formatCurrency(debt.amount)}</td>
            <td>${debt.interestPM > 0 ? formatCurrency(debt.interestPM) : '-'}</td>
            <td>${formatDate(debt.clearBy)}</td>
            <td><span class="status-badge ${getStatusBadgeClass(debt.status)}">${debt.status}</span></td>
            <td>
                <button class="action-btn edit-btn" onclick="editDebt('${debt.id}')">Edit</button>
                <button class="action-btn delete-btn" onclick="showDeleteModal('${debt.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Update summary cards
function updateSummary() {
    const totalDebt = debts.reduce((sum, d) => sum + d.amount, 0);
    const monthlyInterest = debts.reduce((sum, d) => sum + d.interestPM, 0);
    const pendingCount = debts.filter(d => d.status === 'Pending').length;
    const clearedCount = debts.filter(d => d.status === 'Cleared').length;

    document.getElementById('totalDebt').textContent = formatCurrency(totalDebt);
    document.getElementById('monthlyInterest').textContent = formatCurrency(monthlyInterest);
    document.getElementById('pendingCount').textContent = pendingCount;
    document.getElementById('clearedCount').textContent = clearedCount;
}

// Render charts
function renderCharts() {
    renderDebtTypeChart();
    renderInterestChart();
}

// Debt distribution by type chart
function renderDebtTypeChart() {
    const ctx = document.getElementById('debtTypeChart').getContext('2d');

    const typeData = {};
    debts.forEach(debt => {
        if (!typeData[debt.type]) {
            typeData[debt.type] = 0;
        }
        typeData[debt.type] += debt.amount;
    });

    const labels = Object.keys(typeData);
    const data = Object.values(typeData);
    const colors = ['#2563eb', '#7c3aed', '#0d9488', '#db2777', '#ea580c'];

    if (debtTypeChart) {
        debtTypeChart.destroy();
    }

    debtTypeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Monthly interest chart
function renderInterestChart() {
    const ctx = document.getElementById('interestChart').getContext('2d');

    const debtsWithInterest = debts.filter(d => d.interestPM > 0);
    const labels = debtsWithInterest.map(d => d.name);
    const data = debtsWithInterest.map(d => d.interestPM);

    if (interestChart) {
        interestChart.destroy();
    }

    if (debtsWithInterest.length === 0) {
        ctx.font = '14px Segoe UI';
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'center';
        ctx.fillText('No interest payments recorded', ctx.canvas.width / 2, 150);
        return;
    }

    interestChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Monthly Interest',
                data: data,
                backgroundColor: '#f59e0b',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatCurrency(context.raw);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

// Render breakdown cards
function renderBreakdown() {
    const breakdownData = {};
    const types = ['HAND LOAN', 'PL', 'HOME LOAN', 'CAR LOAN', 'CC'];
    const typeLabels = {
        'HAND LOAN': 'Hand Loans',
        'PL': 'Personal Loans',
        'HOME LOAN': 'Home Loans',
        'CAR LOAN': 'Car Loans',
        'CC': 'Credit Cards'
    };
    const typeClasses = {
        'HAND LOAN': 'hand-loan',
        'PL': 'pl',
        'HOME LOAN': 'home-loan',
        'CAR LOAN': 'car-loan',
        'CC': 'cc'
    };

    types.forEach(type => {
        const typeDebts = debts.filter(d => d.type === type);
        if (typeDebts.length > 0) {
            breakdownData[type] = {
                total: typeDebts.reduce((sum, d) => sum + d.amount, 0),
                interest: typeDebts.reduce((sum, d) => sum + d.interestPM, 0),
                count: typeDebts.length
            };
        }
    });

    const breakdownCards = document.getElementById('breakdownCards');
    breakdownCards.innerHTML = Object.entries(breakdownData).map(([type, data]) => `
        <div class="breakdown-card ${typeClasses[type]}">
            <h4>${typeLabels[type]}</h4>
            <div class="amount">${formatCurrency(data.total)}</div>
            ${data.interest > 0 ? `<div class="interest">Interest: ${formatCurrency(data.interest)}/month</div>` : ''}
            <div class="count">${data.count} ${data.count === 1 ? 'entry' : 'entries'}</div>
        </div>
    `).join('');
}

// Form submission
debtForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = {
        type: document.getElementById('debtType').value,
        name: document.getElementById('debtName').value,
        amount: parseFloat(document.getElementById('debtAmount').value) || 0,
        interestPM: parseFloat(document.getElementById('interestPM').value) || 0,
        clearBy: document.getElementById('clearBy').value,
        status: document.getElementById('debtStatus').value
    };

    if (editingId) {
        // Update existing debt
        const index = debts.findIndex(d => d.id == editingId);
        if (index !== -1) {
            debts[index] = { ...debts[index], ...formData };
        }
        editingId = null;
        formTitle.textContent = 'Add New Debt';
        submitBtn.textContent = 'Add Debt';
        cancelBtn.style.display = 'none';
    } else {
        // Add new debt
        const newDebt = {
            id: generateId(),
            ...formData
        };
        debts.push(newDebt);
    }

    saveData();
    renderTable(filterType.value);
    updateSummary();
    renderCharts();
    renderBreakdown();
    debtForm.reset();
});

// Edit debt
function editDebt(id) {
    const debt = debts.find(d => d.id == id);
    if (!debt) return;

    editingId = id;
    formTitle.textContent = 'Edit Debt';
    submitBtn.textContent = 'Update Debt';
    cancelBtn.style.display = 'inline-block';

    document.getElementById('debtType').value = debt.type;
    document.getElementById('debtName').value = debt.name;
    document.getElementById('debtAmount').value = debt.amount;
    document.getElementById('interestPM').value = debt.interestPM;
    document.getElementById('clearBy').value = debt.clearBy;
    document.getElementById('debtStatus').value = debt.status;

    // Scroll to form
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

// Cancel edit
cancelBtn.addEventListener('click', () => {
    editingId = null;
    formTitle.textContent = 'Add New Debt';
    submitBtn.textContent = 'Add Debt';
    cancelBtn.style.display = 'none';
    debtForm.reset();
});

// Show delete modal
function showDeleteModal(id) {
    deleteId = id;
    confirmModal.classList.add('active');
}

// Confirm delete
confirmDelete.addEventListener('click', () => {
    if (deleteId) {
        debts = debts.filter(d => d.id != deleteId);
        saveData();
        renderTable(filterType.value);
        updateSummary();
        renderCharts();
        renderBreakdown();
    }
    deleteId = null;
    confirmModal.classList.remove('active');
});

// Cancel delete
cancelDelete.addEventListener('click', () => {
    deleteId = null;
    confirmModal.classList.remove('active');
});

// Close modal on outside click
confirmModal.addEventListener('click', (e) => {
    if (e.target === confirmModal) {
        deleteId = null;
        confirmModal.classList.remove('active');
    }
});

// Filter change
filterType.addEventListener('change', (e) => {
    renderTable(e.target.value);
});

// Export functions for global access
window.editDebt = editDebt;
window.showDeleteModal = showDeleteModal;
