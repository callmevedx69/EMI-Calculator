/**
 * Charts Module
 * Handles Chart.js visualizations for EMI data
 */

const ChartsManager = (function() {
    let pieChart = null;
    let lineChart = null;

    // Chart colors
    const colors = {
        primary: '#2563eb',
        secondary: '#10b981',
        accent: '#f59e0b',
        danger: '#ef4444',
        light: '#94a3b8',
        dark: '#1e293b'
    };

    /**
     * Update or create pie chart showing principal vs interest
     * @param {number} principal - Loan principal amount
     * @param {number} totalInterest - Total interest amount
     * @param {string} currency - Currency code
     */
    function updatePieChart(principal, totalInterest, currency) {
        const ctx = document.getElementById('pie-chart');
        
        if (!ctx) {
            return;
        }

        const currencySymbol = getCurrencySymbol(currency);
        
        const data = {
            labels: ['Principal', 'Total Interest'],
            datasets: [{
                data: [principal, totalInterest],
                backgroundColor: [colors.primary, colors.secondary],
                borderColor: ['#ffffff', '#ffffff'],
                borderWidth: 2
            }]
        };

        const options = {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            return context.label + ': ' + formatNumber(value, currency);
                        }
                    }
                }
            }
        };

        if (pieChart) {
            pieChart.data = data;
            pieChart.update();
        } else {
            pieChart = new Chart(ctx, {
                type: 'pie',
                data: data,
                options: options
            });
        }
    }

    /**
     * Update or create line chart showing balance over time
     * @param {Array} schedule - Amortization schedule array
     * @param {string} currency - Currency code
     */
    function updateLineChart(schedule, currency) {
        const ctx = document.getElementById('line-chart');
        
        if (!ctx || !schedule || schedule.length === 0) {
            return;
        }

        // Sample data for long schedules (max 60 points)
        const maxPoints = 60;
        let labels = [];
        let balanceData = [];

        if (schedule.length <= maxPoints) {
            labels = schedule.map(row => 'M' + row.month);
            balanceData = schedule.map(row => row.balance);
        } else {
            // Sample every nth point
            const step = Math.ceil(schedule.length / maxPoints);
            for (let i = 0; i < schedule.length; i += step) {
                labels.push('M' + schedule[i].month);
                balanceData.push(schedule[i].balance);
            }
            // Always include last point
            labels.push('M' + schedule[schedule.length - 1].month);
            balanceData.push(schedule[schedule.length - 1].balance);
        }

        const data = {
            labels: labels,
            datasets: [{
                label: 'Remaining Balance',
                data: balanceData,
                borderColor: colors.primary,
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 4
            }]
        };

        const options = {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Balance: ' + formatNumber(context.raw, currency);
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Month'
                    },
                    ticks: {
                        maxTicksLimit: 12
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Balance'
                    },
                    ticks: {
                        callback: function(value) {
                            return formatNumber(value, currency);
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        };

        if (lineChart) {
            lineChart.data = data;
            lineChart.update();
        } else {
            lineChart = new Chart(ctx, {
                type: 'line',
                data: data,
                options: options
            });
        }
    }

    /**
     * Update both charts with new data
     * @param {number} principal - Loan principal
     * @param {number} totalInterest - Total interest
     * @param {Array} schedule - Amortization schedule
     * @param {string} currency - Currency code
     */
    function updateCharts(principal, totalInterest, schedule, currency) {
        updatePieChart(principal, totalInterest, currency);
        updateLineChart(schedule, currency);
    }

    /**
     * Destroy all charts
     */
    function destroyCharts() {
        if (pieChart) {
            pieChart.destroy();
            pieChart = null;
        }
        if (lineChart) {
            lineChart.destroy();
            lineChart = null;
        }
    }

    /**
     * Get currency symbol
     * @param {string} currency - Currency code
     * @returns {string} - Currency symbol
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
     * Format number with currency
     * @param {number} value - Number to format
     * @param {string} currency - Currency code
     * @returns {string} - Formatted string
     */
    function formatNumber(value, currency) {
        const symbol = getCurrencySymbol(currency);
        
        if (currency === 'INR') {
            return symbol + ' ' + Math.round(value).toLocaleString('en-IN');
        } else {
            return symbol + ' ' + value.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
        }
    }

    /**
     * Update chart theme for dark mode
     * @param {boolean} isDark - Whether dark mode is active
     */
    function updateTheme(isDark) {
        if (lineChart) {
            lineChart.options.scales.x.grid.color = isDark ? '#334155' : '#e2e8f0';
            lineChart.options.scales.y.grid.color = isDark ? '#334155' : '#e2e8f0';
            lineChart.options.scales.x.ticks.color = isDark ? '#94a3b8' : '#64748b';
            lineChart.options.scales.y.ticks.color = isDark ? '#94a3b8' : '#64748b';
            lineChart.options.scales.x.title.color = isDark ? '#94a3b8' : '#64748b';
            lineChart.options.scales.y.title.color = isDark ? '#94a3b8' : '#64748b';
            lineChart.update();
        }
    }

    // Public API
    return {
        updateCharts: updateCharts,
        destroyCharts: destroyCharts,
        updatePieChart: updatePieChart,
        updateLineChart: updateLineChart,
        updateTheme: updateTheme
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChartsManager;
}
