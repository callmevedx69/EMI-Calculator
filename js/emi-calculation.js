/**
 * EMI Calculation Module
 * Contains the core EMI calculation logic
 */

const EMICalculation = (function() {
    /**
     * Calculate EMI using the standard formula
     * EMI = (P × r × (1+r)^n) / ((1+r)^n − 1)
     * @param {number} principal - Loan amount
     * @param {number} annualRate - Annual interest rate in percentage
     * @param {number} years - Loan tenure in years
     * @returns {object} - EMI details
     */
    function calculateEMI(principal, annualRate, years) {
        // Validate inputs
        if (principal <= 0 || annualRate <= 0 || years <= 0) {
            return null;
        }

        const monthlyRate = annualRate / 12 / 100;
        const totalMonths = years * 12;

        // Handle zero interest rate case
        if (monthlyRate === 0) {
            const emi = principal / totalMonths;
            return {
                emi: emi,
                totalPayment: principal,
                totalInterest: 0,
                principal: principal,
                monthlyRate: monthlyRate,
                totalMonths: totalMonths
            };
        }

        // Calculate EMI using formula
        const powerFactor = Math.pow(1 + monthlyRate, totalMonths);
        const emi = (principal * monthlyRate * powerFactor) / (powerFactor - 1);

        const totalPayment = emi * totalMonths;
        const totalInterest = totalPayment - principal;

        return {
            emi: emi,
            totalPayment: totalPayment,
            totalInterest: totalInterest,
            principal: principal,
            monthlyRate: monthlyRate,
            totalMonths: totalMonths
        };
    }

    /**
     * Calculate EMI with prepayment
     * @param {number} principal - Loan amount
     * @param {number} annualRate - Annual interest rate in percentage
     * @param {number} years - Original loan tenure in years
     * @param {number} prepaymentAmount - Additional monthly payment
     * @returns {object} - Prepayment details
     */
    function calculateWithPrepayment(principal, annualRate, years, prepaymentAmount) {
        const originalCalculation = calculateEMI(principal, annualRate, years);
        
        if (!originalCalculation || prepaymentAmount <= 0) {
            return null;
        }

        const monthlyRate = annualRate / 12 / 100;
        let balance = principal;
        let totalInterestPaid = 0;
        let months = 0;
        const originalEMI = originalCalculation.emi;
        const newEMI = originalEMI + prepaymentAmount;

        // Calculate new tenure with prepayment
        while (balance > 0 && months < years * 12 * 2) { // Safety limit
            months++;
            const interestForMonth = balance * monthlyRate;
            let principalForMonth = newEMI - interestForMonth;

            if (principalForMonth > balance) {
                principalForMonth = balance;
            }

            totalInterestPaid += interestForMonth;
            balance -= principalForMonth;
        }

        const newTotalPayment = newEMI * months;
        const interestSaved = originalCalculation.totalInterest - totalInterestPaid;

        return {
            originalEMI: originalEMI,
            newEMI: newEMI,
            newTotalMonths: months,
            newTotalPayment: newTotalPayment,
            totalInterestPaid: totalInterestPaid,
            interestSaved: interestSaved,
            originalTotalInterest: originalCalculation.totalInterest,
            originalTotalPayment: originalCalculation.totalPayment
        };
    }

    /**
     * Calculate breakdown for a specific month
     * @param {number} principal - Loan amount
     * @param {number} annualRate - Annual interest rate in percentage
     * @param {number} years - Loan tenure in years
     * @param {number} month - Month number (1-indexed)
     * @returns {object} - Monthly breakdown
     */
    function calculateMonthlyBreakdown(principal, annualRate, years, month) {
        const emiData = calculateEMI(principal, annualRate, years);
        
        if (!emiData) {
            return null;
        }

        const monthlyRate = emiData.monthlyRate;
        let balance = principal;

        for (let i = 1; i < month; i++) {
            const interestForMonth = balance * monthlyRate;
            const principalForMonth = emiData.emi - interestForMonth;
            balance -= principalForMonth;
        }

        const interestForCurrentMonth = balance * monthlyRate;
        const principalForCurrentMonth = emiData.emi - interestForCurrentMonth;
        const remainingBalance = balance - principalForCurrentMonth;

        return {
            month: month,
            emi: emiData.emi,
            principal: principalForCurrentMonth,
            interest: interestForCurrentMonth,
            balance: Math.max(0, remainingBalance)
        };
    }

    /**
     * Format currency value
     * @param {number} value - Numeric value
     * @param {string} currency - Currency code (INR, USD, EUR)
     * @returns {string} - Formatted currency string
     */
    function formatCurrency(value, currency) {
        const symbols = {
            'INR': '₹',
            'USD': '$',
            'EUR': '€'
        };

        const symbol = symbols[currency] || symbols['INR'];
        
        if (currency === 'INR') {
            return symbol + ' ' + Math.round(value).toLocaleString('en-IN');
        } else {
            return symbol + ' ' + value.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }
    }

    // Public API
    return {
        calculateEMI: calculateEMI,
        calculateWithPrepayment: calculateWithPrepayment,
        calculateMonthlyBreakdown: calculateMonthlyBreakdown,
        formatCurrency: formatCurrency
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EMICalculation;
}
