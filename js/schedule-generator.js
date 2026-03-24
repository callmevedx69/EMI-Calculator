/**
 * Schedule Generator Module
 * Generates amortization schedule table
 */

const ScheduleGenerator = (function() {
    /**
     * Generate full amortization schedule
     * @param {number} principal - Loan amount
     * @param {number} annualRate - Annual interest rate in percentage
     * @param {number} years - Loan tenure in years
     * @returns {Array} - Array of monthly schedule objects
     */
    function generateSchedule(principal, annualRate, years) {
        const emiData = EMICalculation.calculateEMI(principal, annualRate, years);
        
        if (!emiData) {
            return [];
        }

        const schedule = [];
        let balance = principal;
        const monthlyRate = emiData.monthlyRate;

        for (let month = 1; month <= emiData.totalMonths; month++) {
            const interestForMonth = balance * monthlyRate;
            const principalForMonth = emiData.emi - interestForMonth;
            balance -= principalForMonth;

            schedule.push({
                month: month,
                emi: emiData.emi,
                principal: principalForMonth,
                interest: interestForMonth,
                balance: Math.max(0, balance)
            });
        }

        return schedule;
    }

    /**
     * Generate schedule with prepayment
     * @param {number} principal - Loan amount
     * @param {number} annualRate - Annual interest rate in percentage
     * @param {number} years - Loan tenure in years
     * @param {number} prepaymentAmount - Additional monthly payment
     * @returns {Array} - Array of monthly schedule objects with prepayment
     */
    function generateScheduleWithPrepayment(principal, annualRate, years, prepaymentAmount) {
        const emiData = EMICalculation.calculateEMI(principal, annualRate, years);
        
        if (!emiData) {
            return [];
        }

        const schedule = [];
        let balance = principal;
        const monthlyRate = emiData.monthlyRate;
        const newEMI = emiData.emi + prepaymentAmount;

        let month = 1;
        while (balance > 0 && month <= years * 12 * 2) {
            const interestForMonth = balance * monthlyRate;
            let principalForMonth = newEMI - interestForMonth;

            if (principalForMonth > balance) {
                principalForMonth = balance;
            }

            balance -= principalForMonth;

            schedule.push({
                month: month,
                emi: newEMI,
                principal: principalForMonth,
                interest: interestForMonth,
                balance: Math.max(0, balance),
                prepayment: prepaymentAmount
            });

            month++;
        }

        return schedule;
    }

    /**
     * Render schedule to HTML table
     * @param {Array} schedule - Schedule array
     * @param {string} currency - Currency code
     * @returns {string} - HTML string for table body
     */
    function renderScheduleTable(schedule, currency) {
        if (!schedule || schedule.length === 0) {
            return '<tr><td colspan="5" class="no-data">Enter loan details to see payment schedule</td></tr>';
        }

        let html = '';
        
        schedule.forEach(row => {
            html += `
                <tr>
                    <td>${row.month}</td>
                    <td>${EMICalculation.formatCurrency(row.emi, currency)}</td>
                    <td>${EMICalculation.formatCurrency(row.principal, currency)}</td>
                    <td>${EMICalculation.formatCurrency(row.interest, currency)}</td>
                    <td>${EMICalculation.formatCurrency(row.balance, currency)}</td>
                </tr>
            `;
        });

        return html;
    }

    /**
     * Get summary statistics from schedule
     * @param {Array} schedule - Schedule array
     * @returns {object} - Summary statistics
     */
    function getScheduleSummary(schedule) {
        if (!schedule || schedule.length === 0) {
            return null;
        }

        let totalPrincipal = 0;
        let totalInterest = 0;

        schedule.forEach(row => {
            totalPrincipal += row.principal;
            totalInterest += row.interest;
        });

        return {
            totalMonths: schedule.length,
            totalPrincipal: totalPrincipal,
            totalInterest: totalInterest,
            totalPayment: totalPrincipal + totalInterest,
            averagePrincipal: totalPrincipal / schedule.length,
            averageInterest: totalInterest / schedule.length
        };
    }

    /**
     * Get yearly summary from schedule
     * @param {Array} schedule - Schedule array
     * @returns {Array} - Yearly summary array
     */
    function getYearlySummary(schedule) {
        if (!schedule || schedule.length === 0) {
            return [];
        }

        const yearlyData = {};
        
        schedule.forEach(row => {
            const year = Math.ceil(row.month / 12);
            
            if (!yearlyData[year]) {
                yearlyData[year] = {
                    year: year,
                    totalPrincipal: 0,
                    totalInterest: 0,
                    totalPayment: 0,
                    endingBalance: 0
                };
            }

            yearlyData[year].totalPrincipal += row.principal;
            yearlyData[year].totalInterest += row.interest;
            yearlyData[year].totalPayment += row.emi;
            yearlyData[year].endingBalance = row.balance;
        });

        return Object.values(yearlyData);
    }

    // Public API
    return {
        generateSchedule: generateSchedule,
        generateScheduleWithPrepayment: generateScheduleWithPrepayment,
        renderScheduleTable: renderScheduleTable,
        getScheduleSummary: getScheduleSummary,
        getYearlySummary: getYearlySummary
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScheduleGenerator;
}
