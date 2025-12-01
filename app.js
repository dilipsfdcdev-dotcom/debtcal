// Debt Management Dashboard - JavaScript

// Sample data based on user's updated debt list
const sampleDebtData = [
    { id: 1, type: 'HAND LOAN', name: 'Rakshith linga', amount: 5000000, interestPM: 150000, clearBy: '', status: 'Pending' },
    { id: 2, type: 'HAND LOAN', name: 'Ramesh pittala', amount: 3000000, interestPM: 300000, clearBy: '', status: 'Pending' },
    { id: 3, type: 'HAND LOAN', name: 'Ravi (Seema)', amount: 1000000, interestPM: 60000, clearBy: '', status: 'Pending' },
    { id: 4, type: 'HAND LOAN', name: 'Bhaskar reddy', amount: 2000000, interestPM: 1000000, clearBy: '', status: 'Pending' },
    { id: 5, type: 'HAND LOAN', name: 'Shyam USDT', amount: 2000000, interestPM: 80000, clearBy: '', status: 'Pending' },
    { id: 6, type: 'HAND LOAN', name: 'Ranjana', amount: 1500000, interestPM: 0, clearBy: '', status: 'Pending' },
    { id: 7, type: 'PL', name: 'Bajaj OD', amount: 1000000, interestPM: 12500, clearBy: '', status: 'Pending' },
    { id: 8, type: 'PL', name: 'IDFC', amount: 138243, interestPM: 9500, clearBy: '', status: 'Pending' },
    { id: 9, type: 'CC', name: 'BOB', amount: 200000, interestPM: 0, clearBy: '', status: 'Pending' },
    { id: 10, type: 'CC', name: 'IDFC', amount: 150000, interestPM: 0, clearBy: '', status: 'Pending' },
    { id: 11, type: 'CC', name: 'ONE Card', amount: 300000, interestPM: 0, clearBy: '', status: 'Pending' },
    { id: 12, type: 'GOLD LOAN', name: 'Wife', amount: 4500000, interestPM: 82000, clearBy: '', status: 'Pending' },
    { id: 13, type: 'GOLD LOAN', name: 'Mom', amount: 550000, interestPM: 7000, clearBy: '', status: 'Pending' },
    { id: 14, type: 'GOLD LOAN', name: 'Dad', amount: 1000000, interestPM: 15000, clearBy: '', status: 'Pending' }
];

// Sample income data
const sampleIncomeData = [
    { id: 1, source: 'Solm', amount: 380000 },
    { id: 2, source: 'A360', amount: 415000 }
];

// Global state
let debts = [];
let incomes = [];
let editingId = null;
let editingIncomeId = null;
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

// Income DOM Elements
const addIncomeBtn = document.getElementById('addIncomeBtn');
const incomeFormEl = document.getElementById('incomeForm');
const incomeSource = document.getElementById('incomeSource');
const incomeAmount = document.getElementById('incomeAmount');
const saveIncomeBtn = document.getElementById('saveIncomeBtn');
const cancelIncomeBtn = document.getElementById('cancelIncomeBtn');
const incomeTableBody = document.getElementById('incomeTableBody');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderTable();
    renderIncomeTable();
    updateSummary();
    renderCharts();
    renderBreakdown();
    updatePnL();
});

// Load data from localStorage or use sample data
function loadData() {
    const storedDebts = localStorage.getItem('debtData');
    const storedIncomes = localStorage.getItem('incomeData');

    if (storedDebts) {
        debts = JSON.parse(storedDebts);
    } else {
        debts = [...sampleDebtData];
        saveDebtData();
    }

    if (storedIncomes) {
        incomes = JSON.parse(storedIncomes);
    } else {
        incomes = [...sampleIncomeData];
        saveIncomeData();
    }
}

// Save debt data to localStorage
function saveDebtData() {
    localStorage.setItem('debtData', JSON.stringify(debts));
}

// Save income data to localStorage
function saveIncomeData() {
    localStorage.setItem('incomeData', JSON.stringify(incomes));
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
        'GOLD LOAN': 'type-gold-loan',
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

// Render debt table
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

// Render income table
function renderIncomeTable() {
    if (incomes.length === 0) {
        incomeTableBody.innerHTML = `
            <tr>
                <td colspan="3" class="empty-state">
                    <p>No income sources added yet.</p>
                </td>
            </tr>
        `;
        return;
    }

    incomeTableBody.innerHTML = incomes.map(income => `
        <tr data-id="${income.id}">
            <td>${income.source}</td>
            <td>${formatCurrency(income.amount)}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editIncome('${income.id}')">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteIncome('${income.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Update summary cards
function updateSummary() {
    const totalDebt = debts.reduce((sum, d) => sum + d.amount, 0);
    const monthlyInterest = debts.reduce((sum, d) => sum + d.interestPM, 0);
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const pnl = totalIncome - monthlyInterest;

    document.getElementById('totalDebt').textContent = formatCurrency(totalDebt);
    document.getElementById('monthlyInterest').textContent = formatCurrency(monthlyInterest);
    document.getElementById('totalIncome').textContent = formatCurrency(totalIncome);
    document.getElementById('monthlyPnL').textContent = formatCurrency(pnl);

    // Update P&L card color
    const pnlCard = document.querySelector('.pnl-card');
    pnlCard.classList.remove('positive', 'negative');
    if (pnl >= 0) {
        pnlCard.classList.add('positive');
    } else {
        pnlCard.classList.add('negative');
    }
}

// Update P&L section
function updatePnL() {
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const monthlyInterest = debts.reduce((sum, d) => sum + d.interestPM, 0);
    const netPnL = totalIncome - monthlyInterest;

    document.getElementById('pnlIncome').textContent = formatCurrency(totalIncome);
    document.getElementById('pnlExpense').textContent = formatCurrency(monthlyInterest);
    document.getElementById('pnlNet').textContent = formatCurrency(netPnL);

    // Update net row color
    const netRow = document.getElementById('pnlNetRow');
    netRow.classList.remove('positive', 'negative');
    if (netPnL >= 0) {
        netRow.classList.add('positive');
    } else {
        netRow.classList.add('negative');
    }
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
    const colorMap = {
        'HAND LOAN': '#2563eb',
        'GOLD LOAN': '#eab308',
        'PL': '#7c3aed',
        'HOME LOAN': '#0d9488',
        'CAR LOAN': '#db2777',
        'CC': '#ea580c'
    };
    const colors = labels.map(label => colorMap[label] || '#6b7280');

    if (debtTypeChart) {
        debtTypeChart.destroy();
    }

    debtTypeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
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
    const types = ['HAND LOAN', 'GOLD LOAN', 'PL', 'HOME LOAN', 'CAR LOAN', 'CC'];
    const typeLabels = {
        'HAND LOAN': 'Hand Loans',
        'GOLD LOAN': 'Gold Loans',
        'PL': 'Personal Loans',
        'HOME LOAN': 'Home Loans',
        'CAR LOAN': 'Car Loans',
        'CC': 'Credit Cards'
    };
    const typeClasses = {
        'HAND LOAN': 'hand-loan',
        'GOLD LOAN': 'gold-loan',
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

// Form submission for debt
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

    saveDebtData();
    renderTable(filterType.value);
    updateSummary();
    renderCharts();
    renderBreakdown();
    updatePnL();
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

// Cancel edit debt
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
        saveDebtData();
        renderTable(filterType.value);
        updateSummary();
        renderCharts();
        renderBreakdown();
        updatePnL();
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

// Income management
addIncomeBtn.addEventListener('click', () => {
    incomeFormEl.style.display = 'block';
    incomeSource.focus();
});

cancelIncomeBtn.addEventListener('click', () => {
    incomeFormEl.style.display = 'none';
    incomeSource.value = '';
    incomeAmount.value = '';
    editingIncomeId = null;
});

saveIncomeBtn.addEventListener('click', () => {
    const source = incomeSource.value.trim();
    const amount = parseFloat(incomeAmount.value) || 0;

    if (!source || amount <= 0) {
        alert('Please enter valid source name and amount');
        return;
    }

    if (editingIncomeId) {
        // Update existing income
        const index = incomes.findIndex(i => i.id == editingIncomeId);
        if (index !== -1) {
            incomes[index] = { ...incomes[index], source, amount };
        }
        editingIncomeId = null;
    } else {
        // Add new income
        incomes.push({
            id: generateId(),
            source,
            amount
        });
    }

    saveIncomeData();
    renderIncomeTable();
    updateSummary();
    updatePnL();

    incomeFormEl.style.display = 'none';
    incomeSource.value = '';
    incomeAmount.value = '';
});

// Edit income
function editIncome(id) {
    const income = incomes.find(i => i.id == id);
    if (!income) return;

    editingIncomeId = id;
    incomeFormEl.style.display = 'block';
    incomeSource.value = income.source;
    incomeAmount.value = income.amount;
    incomeSource.focus();
}

// Delete income
function deleteIncome(id) {
    if (confirm('Are you sure you want to delete this income source?')) {
        incomes = incomes.filter(i => i.id != id);
        saveIncomeData();
        renderIncomeTable();
        updateSummary();
        updatePnL();
    }
}

// Export functions for global access
window.editDebt = editDebt;
window.showDeleteModal = showDeleteModal;
window.editIncome = editIncome;
window.deleteIncome = deleteIncome;
