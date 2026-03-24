/**
 * Storage Module
 * Handles LocalStorage for saving loan details
 */

const StorageManager = (function() {
    const SAVED_LOANS_KEY = 'emi_saved_loans';
    const THEME_KEY = 'emi_theme';
    const CURRENCY_KEY = 'emi_currency';

    /**
     * Save a loan to localStorage
     * @param {object} loanData - Loan details object
     * @returns {boolean} - Success status
     */
    function saveLoan(loanData) {
        try {
            const loans = getSavedLoans();
            
            // Generate unique ID
            const newLoan = {
                id: Date.now().toString(),
                name: loanData.name || 'Untitled Loan',
                amount: parseFloat(loanData.amount),
                interestRate: parseFloat(loanData.interestRate),
                tenure: parseFloat(loanData.tenure),
                emi: parseFloat(loanData.emi),
                totalInterest: parseFloat(loanData.totalInterest),
                totalPayment: parseFloat(loanData.totalPayment),
                currency: loanData.currency || 'INR',
                createdAt: new Date().toISOString()
            };

            loans.push(newLoan);
            localStorage.setItem(SAVED_LOANS_KEY, JSON.stringify(loans));
            
            return true;
        } catch (error) {
            console.error('Error saving loan:', error);
            return false;
        }
    }

    /**
     * Get all saved loans from localStorage
     * @returns {Array} - Array of saved loan objects
     */
    function getSavedLoans() {
        try {
            const loansJson = localStorage.getItem(SAVED_LOANS_KEY);
            return loansJson ? JSON.parse(loansJson) : [];
        } catch (error) {
            console.error('Error reading saved loans:', error);
            return [];
        }
    }

    /**
     * Delete a saved loan
     * @param {string} loanId - ID of the loan to delete
     * @returns {boolean} - Success status
     */
    function deleteLoan(loanId) {
        try {
            const loans = getSavedLoans();
            const filteredLoans = loans.filter(loan => loan.id !== loanId);
            localStorage.setItem(SAVED_LOANS_KEY, JSON.stringify(filteredLoans));
            return true;
        } catch (error) {
            console.error('Error deleting loan:', error);
            return false;
        }
    }

    /**
     * Get a specific loan by ID
     * @param {string} loanId - ID of the loan
     * @returns {object|null} - Loan object or null
     */
    function getLoanById(loanId) {
        try {
            const loans = getSavedLoans();
            return loans.find(loan => loan.id === loanId) || null;
        } catch (error) {
            console.error('Error getting loan:', error);
            return null;
        }
    }

    /**
     * Update a saved loan
     * @param {string} loanId - ID of the loan to update
     * @param {object} loanData - Updated loan data
     * @returns {boolean} - Success status
     */
    function updateLoan(loanId, loanData) {
        try {
            const loans = getSavedLoans();
            const index = loans.findIndex(loan => loan.id === loanId);
            
            if (index !== -1) {
                loans[index] = {
                    ...loans[index],
                    ...loanData,
                    updatedAt: new Date().toISOString()
                };
                localStorage.setItem(SAVED_LOANS_KEY, JSON.stringify(loans));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating loan:', error);
            return false;
        }
    }

    /**
     * Clear all saved loans
     * @returns {boolean} - Success status
     */
    function clearAllLoans() {
        try {
            localStorage.removeItem(SAVED_LOANS_KEY);
            return true;
        } catch (error) {
            console.error('Error clearing loans:', error);
            return false;
        }
    }

    /**
     * Save theme preference
     * @param {string} theme - Theme name ('light' or 'dark')
     * @returns {boolean} - Success status
     */
    function saveTheme(theme) {
        try {
            localStorage.setItem(THEME_KEY, theme);
            return true;
        } catch (error) {
            console.error('Error saving theme:', error);
            return false;
        }
    }

    /**
     * Get saved theme preference
     * @returns {string} - Theme name
     */
    function getTheme() {
        try {
            return localStorage.getItem(THEME_KEY) || 'light';
        } catch (error) {
            console.error('Error getting theme:', error);
            return 'light';
        }
    }

    /**
     * Save currency preference
     * @param {string} currency - Currency code
     * @returns {boolean} - Success status
     */
    function saveCurrency(currency) {
        try {
            localStorage.setItem(CURRENCY_KEY, currency);
            return true;
        } catch (error) {
            console.error('Error saving currency:', error);
            return false;
        }
    }

    /**
     * Get saved currency preference
     * @returns {string} - Currency code
     */
    function getCurrency() {
        try {
            return localStorage.getItem(CURRENCY_KEY) || 'INR';
        } catch (error) {
            console.error('Error getting currency:', error);
            return 'INR';
        }
    }

    /**
     * Check if localStorage is available
     * @returns {boolean} - Availability status
     */
    function isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }

    // Public API
    return {
        saveLoan: saveLoan,
        getSavedLoans: getSavedLoans,
        deleteLoan: deleteLoan,
        getLoanById: getLoanById,
        updateLoan: updateLoan,
        clearAllLoans: clearAllLoans,
        saveTheme: saveTheme,
        getTheme: getTheme,
        saveCurrency: saveCurrency,
        getCurrency: getCurrency,
        isStorageAvailable: isStorageAvailable
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
}
