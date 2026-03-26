/**
 * Main Application Script
 * Handles all application logic and event listeners
 */

// Application State
let AppState = {
    currentEMI: null,
    currentSchedule: [],
    currency: 'INR',
    isDarkMode: false
};

// DOM Elements (initialized in init)
let elements = {};

/**
 * Initialize the application
 */
function init() {
    try {
        // DOM Elements - moved inside init() to ensure DOM is loaded
        elements = {
            // Form inputs
            loanAmount: document.getElementById('loanAmount'),
            interestRate: document.getElementById('interestRate'),
            interestSlider: document.getElementById('interest-slider'),
            interestValue: document.getElementById('interest-value'),
            loanTenure: document.getElementById('loanTenure'),
            tenureSlider: document.getElementById('tenure-slider'),
            tenureValue: document.getElementById('tenure-value'),
            
            // Summary display
            monthlyEMI: document.getElementById('emiResult'),
            totalInterest: document.getElementById('total-interest'),
            totalPayment: document.getElementById('total-payment'),
            loanPeriod: document.getElementById('loan-period'),
            
            // Schedule table
            scheduleBody: document.getElementById('schedule-body'),
            
            // Controls
            currencySelect: document.getElementById('currency'),
            themeToggle: document.getElementById('themeToggle'),
            resetBtn: document.getElementById('reset-btn'),
            saveLoanBtn: document.getElementById('saveLoanBtn'),
            downloadPdfBtn: document.getElementById('download-pdf-btn'),
            
            // Prepayment
            prepaymentAmount: document.getElementById('prepayment-amount'),
            calculatePrepaymentBtn: document.getElementById('calculate-prepayment-btn'),
            prepaymentResults: document.getElementById('prepayment-results'),
            newTenure: document.getElementById('new-tenure'),
            interestSaved: document.getElementById('interest-saved'),
            newTotalPayment: document.getElementById('new-total-payment'),
            
            // Comparison
            compareBtn: document.getElementById('compareBtn'),
            comparisonResults: document.getElementById('comparisonResult'),
            comparisonBody: document.getElementById('comparison-body'),
            
            // Saved loans
            savedLoansList: document.getElementById('saved-loans-list'),
            
            // Modal
            saveModal: document.getElementById('save-modal'),
            loanName: document.getElementById('loan-name'),
            cancelSave: document.getElementById('cancel-save'),
            confirmSave: document.getElementById('confirm-save')
        };
        
        loadPreferences();
        setupEventListeners();
        renderSavedLoans();
        calculateEMI();
    } catch (err) {
        console.error('Error initializing application:', err);
    }
}

// Wrap all code inside DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    init();
});

/**
 * Load user preferences from localStorage
 */
function loadPreferences() {
    try {
        // Load currency preference
        const savedCurrency = StorageManager.getCurrency();
        if (elements.currencySelect) {
            elements.currencySelect.value = savedCurrency;
        }
        AppState.currency = savedCurrency;
        
        // Load theme preference
        const savedTheme = StorageManager.getTheme();
        if (savedTheme === 'dark') {
            AppState.isDarkMode = true;
            document.body.classList.add('dark-mode');
            document.documentElement.setAttribute('data-theme', 'dark');
            if (elements.themeToggle) {
                elements.themeToggle.textContent = '☀️';
            }
        }
    } catch (err) {
        console.error('Error loading preferences:', err);
    }
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    try {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                await window.supabaseClient.auth.signOut();
                window.location.href = 'login.html';
            });
        }

        // Input change events
        if (elements.loanAmount) {
            elements.loanAmount.addEventListener('input', debounce(calculateEMI, 300));
        }
        if (elements.interestRate) {
            elements.interestRate.addEventListener('input', debounce(calculateEMI, 300));
        }
        if (elements.loanTenure) {
            elements.loanTenure.addEventListener('input', debounce(calculateEMI, 300));
        }
        
        // Slider events
        if (elements.interestSlider) {
            elements.interestSlider.addEventListener('input', handleInterestSlider);
        }
        if (elements.tenureSlider) {
            elements.tenureSlider.addEventListener('input', handleTenureSlider);
        }
        
        // Currency change
        if (elements.currencySelect) {
            elements.currencySelect.addEventListener('change', handleCurrencyChange);
        }
        
        // Theme toggle
        if (elements.themeToggle) {
            elements.themeToggle.addEventListener('click', toggleTheme);
        }
        
        // Reset button
        if (elements.resetBtn) {
            elements.resetBtn.addEventListener('click', resetCalculator);
        }
        
        // Save loan
        if (elements.saveLoanBtn) {
            elements.saveLoanBtn.addEventListener('click', saveLoan);
        }
        
        // Download PDF
        if (elements.downloadPdfBtn) {
            elements.downloadPdfBtn.addEventListener('click', generatePDF);
        }
        
        // Prepayment calculation
        if (elements.calculatePrepaymentBtn) {
            elements.calculatePrepaymentBtn.addEventListener('click', calculatePrepayment);
        }
        
        // Loan comparison
        if (elements.compareBtn) {
            elements.compareBtn.addEventListener('click', compareLoans);
        }
        
        // Close modal on outside click
        if (elements.saveModal) {
            elements.saveModal.addEventListener('click', function(e) {
                if (e.target === elements.saveModal) {
                    hideSaveModal();
                }
            });
        }
    } catch (err) {
        console.error('Error setting up event listeners:', err);
    }
}

/**
 * Handle interest slider change
 */
function handleInterestSlider(e) {
    const value = e.target.value;
    elements.interestRate.value = value;
    elements.interestValue.textContent = value + '%';
    calculateEMI();
}

/**
 * Handle tenure slider change
 */
function handleTenureSlider(e) {
    const value = e.target.value;
    elements.loanTenure.value = value;
    elements.tenureValue.textContent = value + ' years';
    calculateEMI();
}

/**
 * Handle currency change
 */
function handleCurrencyChange(e) {
    AppState.currency = e.target.value;
    StorageManager.saveCurrency(AppState.currency);
    calculateEMI();
    renderSavedLoans();
}

/**
 * Toggle dark/light theme
 */
function toggleTheme() {
    AppState.isDarkMode = !AppState.isDarkMode;
    
    if (AppState.isDarkMode) {
        document.body.classList.add('dark-mode');
        document.documentElement.setAttribute('data-theme', 'dark');
        elements.themeToggle.textContent = '☀️';
    } else {
        document.body.classList.remove('dark-mode');
        document.documentElement.removeAttribute('data-theme');
        elements.themeToggle.textContent = '🌙';
    }
    
    StorageManager.saveTheme(AppState.isDarkMode ? 'dark' : 'light');
    ChartsManager.updateTheme(AppState.isDarkMode);
}

/**
 * Main EMI calculation function
 */
function calculateEMI() {
    const principal = parseFloat(elements.loanAmount.value);
    const annualRate = parseFloat(elements.interestRate.value);
    const years = parseFloat(elements.loanTenure.value);
    
    // Validate inputs
    if (!principal || !annualRate || !years || principal <= 0 || annualRate <= 0 || years <= 0) {
        resetDisplay();
        return;
    }
    
    // Update sliders to match inputs
    if (elements.interestSlider.value != annualRate) {
        elements.interestSlider.value = annualRate;
        elements.interestValue.textContent = annualRate + '%';
    }
    if (elements.tenureSlider.value != years) {
        elements.tenureSlider.value = years;
        elements.tenureValue.textContent = years + ' years';
    }
    
    // Calculate EMI
    AppState.currentEMI = EMICalculation.calculateEMI(principal, annualRate, years);
    
    if (AppState.currentEMI) {
        // Update summary display
        updateSummaryDisplay();
        
        // Generate and display schedule
        AppState.currentSchedule = ScheduleGenerator.generateSchedule(principal, annualRate, years);
        updateScheduleDisplay();
        
        // Update charts
        ChartsManager.updateCharts(
            AppState.currentEMI.principal,
            AppState.currentEMI.totalInterest,
            AppState.currentSchedule,
            AppState.currency
        );
    }
}

/**
 * Update summary section display
 */
function updateSummaryDisplay() {
    if (!AppState.currentEMI) return;
    
    const currency = AppState.currency;
    
    elements.monthlyEMI.textContent = EMICalculation.formatCurrency(AppState.currentEMI.emi, currency);
    elements.totalInterest.textContent = EMICalculation.formatCurrency(AppState.currentEMI.totalInterest, currency);
    elements.totalPayment.textContent = EMICalculation.formatCurrency(AppState.currentEMI.totalPayment, currency);
    
    const months = AppState.currentEMI.totalMonths;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    let periodText = months + ' months';
    if (years > 0) {
        periodText = years + ' year' + (years > 1 ? 's' : '');
        if (remainingMonths > 0) {
            periodText += ', ' + remainingMonths + ' month' + (remainingMonths > 1 ? 's' : '');
        }
    }
    elements.loanPeriod.textContent = periodText;
}

/**
 * Update schedule table display
 */
function updateScheduleDisplay() {
    const html = ScheduleGenerator.renderScheduleTable(AppState.currentSchedule, AppState.currency);
    elements.scheduleBody.innerHTML = html;
}

/**
 * Reset all display elements
 */
function resetDisplay() {
    elements.monthlyEMI.textContent = getCurrencySymbol(AppState.currency) + ' 0';
    elements.totalInterest.textContent = getCurrencySymbol(AppState.currency) + ' 0';
    elements.totalPayment.textContent = getCurrencySymbol(AppState.currency) + ' 0';
    elements.loanPeriod.textContent = '0 months';
    elements.scheduleBody.innerHTML = '<tr><td colspan="5" class="no-data">Enter loan details to see payment schedule</td></tr>';
    ChartsManager.destroyCharts();
    elements.prepaymentResults.style.display = 'none';
    elements.comparisonResults.style.display = 'none';
}

/**
 * Reset calculator to initial state
 */
function resetCalculator() {
    elements.loanAmount.value = '';
    elements.interestRate.value = '';
    elements.interestSlider.value = 10;
    elements.interestValue.textContent = '10%';
    elements.loanTenure.value = '';
    elements.tenureSlider.value = 5;
    elements.tenureValue.textContent = '5 years';
    elements.prepaymentAmount.value = '';
    elements.prepaymentResults.style.display = 'none';
    elements.comparisonResults.style.display = 'none';
    
    AppState.currentEMI = null;
    AppState.currentSchedule = [];
    
    resetDisplay();
}

/**
 * Show save loan modal
 */
function showSaveModal() {
    if (!AppState.currentEMI) {
        alert('Please calculate EMI first before saving.');
        return;
    }
    elements.loanName.value = '';
    elements.saveModal.style.display = 'flex';
}

/**
 * Hide save loan modal
 */
function hideSaveModal() {
    elements.saveModal.style.display = 'none';
}

/**
 * Save loan to localStorage
 */
function saveLoan() {
    const amount = document.getElementById("loanAmount")?.value;
    const rate = document.getElementById("interestRate")?.value;
    const tenure = document.getElementById("loanTenure")?.value;
    const currency = document.getElementById("currency")?.value || 'INR';
    
    // Use default name since modal was removed
    const loanName = 'Untitled Loan';
    
    // Calculate total interest and payment for accurate storage
    const principal = parseFloat(amount);
    const annualRate = parseFloat(rate);
    const years = parseFloat(tenure);
    
    let totalInterest = 0;
    let totalPayment = 0;
    let emiValue = 0;
    
    if (principal && annualRate && years) {
        const emiData = EMICalculation.calculateEMI(principal, annualRate, years);
        if (emiData) {
            totalInterest = emiData.totalInterest;
            totalPayment = emiData.totalPayment;
            emiValue = emiData.emi;
        }
    }
    
    const loan = {
        id: Date.now().toString(),
        name: loanName,
        amount: amount,
        interestRate: rate,
        tenure: tenure,
        emi: emiValue,
        totalInterest: totalInterest,
        totalPayment: totalPayment,
        currency: currency,
        createdAt: new Date().toISOString()
    };

    let loans = JSON.parse(localStorage.getItem("loans")) || [];
    loans.push(loan);
    localStorage.setItem("loans", JSON.stringify(loans));
    
    renderSavedLoans();
    alert("Loan saved successfully!");
}

/**
 * Render saved loans list
 */
function renderSavedLoans() {
    const loans = StorageManager.getSavedLoans();
    
    if (loans.length === 0) {
        elements.savedLoansList.innerHTML = '<p class="no-data">No saved loans yet</p>';
        return;
    }
    
    let html = '';
    loans.forEach(loan => {
        html += `
            <div class="saved-loan-item">
                <div class="saved-loan-info">
                    <h4>${escapeHtml(loan.name)}</h4>
                    <p>${EMICalculation.formatCurrency(loan.amount, loan.currency)} | ${loan.interestRate}% | ${loan.tenure} years</p>
                    <p>EMI: ${EMICalculation.formatCurrency(loan.emi, loan.currency)}</p>
                </div>
                <div class="saved-loan-actions">
                    <button class="load-btn" onclick="loadSavedLoan('${loan.id}')">Load</button>
                    <button class="delete-btn" onclick="deleteSavedLoan('${loan.id}')">Delete</button>
                </div>
            </div>
        `;
    });
    
    elements.savedLoansList.innerHTML = html;
}

/**
 * Load a saved loan
 */
function loadSavedLoan(loanId) {
    const loan = StorageManager.getLoanById(loanId);
    
    if (loan) {
        elements.loanAmount.value = loan.amount;
        elements.interestRate.value = loan.interestRate;
        elements.loanTenure.value = loan.tenure;
        elements.currencySelect.value = loan.currency;
        AppState.currency = loan.currency;
        
        calculateEMI();
        
        // Scroll to calculator
        document.querySelector('.calculator-section').scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Delete a saved loan
 */
function deleteSavedLoan(loanId) {
    if (confirm('Are you sure you want to delete this saved loan?')) {
        StorageManager.deleteLoan(loanId);
        renderSavedLoans();
    }
}

/**
 * Calculate prepayment impact
 */
function calculatePrepayment() {
    const principal = parseFloat(elements.loanAmount.value);
    const annualRate = parseFloat(elements.interestRate.value);
    const years = parseFloat(elements.loanTenure.value);
    const prepaymentAmount = parseFloat(elements.prepaymentAmount.value);
    
    if (!principal || !annualRate || !years) {
        alert('Please enter loan details first.');
        return;
    }
    
    if (!prepaymentAmount || prepaymentAmount <= 0) {
        alert('Please enter a valid prepayment amount.');
        return;
    }
    
    const result = EMICalculation.calculateWithPrepayment(principal, annualRate, years, prepaymentAmount);
    
    if (result) {
        elements.prepaymentResults.style.display = 'grid';
        
        const newYears = Math.floor(result.newTotalMonths / 12);
        const newMonths = result.newTotalMonths % 12;
        let tenureText = newYears + ' year' + (newYears !== 1 ? 's' : '');
        if (newMonths > 0) {
            tenureText += ', ' + newMonths + ' month' + (newMonths !== 1 ? 's' : '');
        }
        
        elements.newTenure.textContent = tenureText;
        elements.interestSaved.textContent = EMICalculation.formatCurrency(result.interestSaved, AppState.currency);
        elements.newTotalPayment.textContent = EMICalculation.formatCurrency(result.newTotalPayment, AppState.currency);
    }
}

/**
 * Compare two loans
 */
function compareLoans() {
    const loanA = {
        amount: parseFloat(document.getElementById('loan-a-amount').value),
        rate: parseFloat(document.getElementById('loan-a-rate').value),
        tenure: parseFloat(document.getElementById('loan-a-tenure').value)
    };
    
    const loanB = {
        amount: parseFloat(document.getElementById('loan-b-amount').value),
        rate: parseFloat(document.getElementById('loan-b-rate').value),
        tenure: parseFloat(document.getElementById('loan-b-tenure').value)
    };
    
    if (!loanA.amount || !loanA.rate || !loanA.tenure || !loanB.amount || !loanB.rate || !loanB.tenure) {
        alert('Please fill in all loan details for comparison.');
        return;
    }
    
    const emiA = EMICalculation.calculateEMI(loanA.amount, loanA.rate, loanA.tenure);
    const emiB = EMICalculation.calculateEMI(loanB.amount, loanB.rate, loanB.tenure);
    
    if (emiA && emiB) {
        elements.comparisonResults.style.display = 'block';
        
        const currency = AppState.currency;
        const format = (val) => EMICalculation.formatCurrency(val, currency);
        
        const diffEMI = emiB.emi - emiA.emi;
        const diffInterest = emiB.totalInterest - emiA.totalInterest;
        const diffPayment = emiB.totalPayment - emiA.totalPayment;
        
        elements.comparisonBody.innerHTML = `
            <tr>
                <td>Monthly EMI</td>
                <td>${format(emiA.emi)}</td>
                <td>${format(emiB.emi)}</td>
                <td class="${diffEMI > 0 ? 'diff-negative' : 'diff-positive'}">${format(Math.abs(diffEMI))} ${diffEMI > 0 ? '(A cheaper)' : '(B cheaper)'}</td>
            </tr>
            <tr>
                <td>Total Interest</td>
                <td>${format(emiA.totalInterest)}</td>
                <td>${format(emiB.totalInterest)}</td>
                <td class="${diffInterest > 0 ? 'diff-negative' : 'diff-positive'}">${format(Math.abs(diffInterest))} ${diffInterest > 0 ? '(A cheaper)' : '(B cheaper)'}</td>
            </tr>
            <tr>
                <td>Total Payment</td>
                <td>${format(emiA.totalPayment)}</td>
                <td>${format(emiB.totalPayment)}</td>
                <td class="${diffPayment > 0 ? 'diff-negative' : 'diff-positive'}">${format(Math.abs(diffPayment))} ${diffPayment > 0 ? '(A cheaper)' : '(B cheaper)'}</td>
            </tr>
        `;
    }
}

/**
 * Generate PDF report
 */
function generatePDF() {
    if (!AppState.currentEMI) {
        alert('Please calculate EMI first before generating PDF.');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const currency = AppState.currency;
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.text('EMI Calculator Report', 105, 20, { align: 'center' });
    
    // Loan Details
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    const principal = elements.loanAmount.value;
    const rate = elements.interestRate.value;
    const years = elements.loanTenure.value;
    
    let y = 40;
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235);
    doc.text('Loan Details', 20, y);
    
    y += 10;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Loan Amount: ${EMICalculation.formatCurrency(principal, currency)}`, 20, y);
    y += 8;
    doc.text(`Interest Rate: ${rate}% per annum`, 20, y);
    y += 8;
    doc.text(`Loan Tenure: ${years} years`, 20, y);
    
    // EMI Summary
    y += 15;
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235);
    doc.text('EMI Summary', 20, y);
    
    y += 10;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Monthly EMI: ${EMICalculation.formatCurrency(AppState.currentEMI.emi, currency)}`, 20, y);
    y += 8;
    doc.text(`Total Interest: ${EMICalculation.formatCurrency(AppState.currentEMI.totalInterest, currency)}`, 20, y);
    y += 8;
    doc.text(`Total Payment: ${EMICalculation.formatCurrency(AppState.currentEMI.totalPayment, currency)}`, 20, y);
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 280, { align: 'center' });
    
    // Save the PDF
    doc.save('emi-report.pdf');
}

/**
 * Get currency symbol
 */
function getCurrencySymbol(currency) {
    const symbols = {
        'INR': '₹',
        'USD': '$',
        'EUR': '€'
    };
    return symbols[currency] || symbols['INR'];
}

/**
 * Debounce function for input events
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions globally available for onclick handlers
window.loadSavedLoan = loadSavedLoan;
window.deleteSavedLoan = deleteSavedLoan;

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', init);
