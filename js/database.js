/**
 * Database Module
 * Handles all database operations for loans using Supabase
 * Falls back to localStorage if Supabase is not available
 */

const DatabaseManager = (function() {
    const LOANS_TABLE = 'loans';
    const LOCAL_STORAGE_KEY = 'local_loans';

    /**
     * Get current user from Supabase
     * @returns {object|null}
     */
    async function getCurrentUser() {
        try {
            const { data } = await window.supabaseClient.auth.getSession();
            return data.session?.user || null;
        } catch (err) {
            console.log('No active session');
            return null;
        }
    }

    /**
     * Check if user is admin
     * @returns {boolean}
     */
    async function isAdmin() {
        // For now, we'll check if user email contains 'admin'
        // In production, you'd check user metadata or roles
        try {
            const { data } = await window.supabaseClient.auth.getSession();
            if (data.session?.user?.email) {
                return data.session.user.email.toLowerCase().includes('admin');
            }
            return false;
        } catch (err) {
            return false;
        }
    }

    /**
     * Get loans from localStorage
     * @returns {array}
     */
    function getLoansFromLocalStorage() {
        try {
            const data = localStorage.getItem(LOCAL_STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (err) {
            console.error('Error reading from localStorage:', err);
            return [];
        }
    }

    /**
     * Save loans to localStorage
     * @param {array} loans
     */
    function saveLoansToLocalStorage(loans) {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(loans));
        } catch (err) {
            console.error('Error saving to localStorage:', err);
        }
    }

    /**
     * Generate a unique ID
     * @returns {string}
     */
    function generateId() {
        return 'loan_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Save a new loan to the database
     * @param {object} loanData - Loan details
     * @returns {object} - Result with success/error
     */
    async function saveLoan(loanData) {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: 'User not logged in' };
        }

        const newLoan = {
            id: generateId(),
            user_id: user.id,
            loan_name: loanData.name || 'Untitled Loan',
            amount: parseFloat(loanData.amount),
            interest_rate: parseFloat(loanData.interestRate),
            tenure: parseFloat(loanData.tenure),
            emi: parseFloat(loanData.emi),
            total_interest: parseFloat(loanData.totalInterest) || 0,
            total_payment: parseFloat(loanData.totalPayment) || 0,
            currency: loanData.currency || 'INR',
            created_at: new Date().toISOString()
        };

        // Try Supabase first
        try {
            const { data, error } = await window.supabaseClient
                .from(LOANS_TABLE)
                .insert(newLoan)
                .select();

            if (error) {
                throw error;
            }

            return { success: true, data: data[0] };
        } catch (err) {
            console.log('Supabase unavailable, falling back to localStorage');
            // Fallback to localStorage
            const loans = getLoansFromLocalStorage();
            loans.push(newLoan);
            saveLoansToLocalStorage(loans);
            return { success: true, data: newLoan, isLocalStorage: true };
        }
    }

    /**
     * Get all loans for current user
     * @returns {object} - Result with loans array
     */
    async function getUserLoans() {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: 'User not logged in', loans: [] };
        }

        // Try Supabase first
        try {
            const { data, error } = await window.supabaseClient
                .from(LOANS_TABLE)
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            return { success: true, loans: data || [] };
        } catch (err) {
            console.log('Supabase unavailable, falling back to localStorage');
            // Fallback to localStorage
            const loans = getLoansFromLocalStorage();
            const userLoans = loans
                .filter(loan => loan.user_id === user.id)
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            return { success: true, loans: userLoans, isLocalStorage: true };
        }
    }

    /**
     * Get a specific loan by ID
     * @param {string} loanId - Loan ID
     * @returns {object} - Result with loan data
     */
    async function getLoanById(loanId) {
        // Try Supabase first
        try {
            const { data, error } = await window.supabaseClient
                .from(LOANS_TABLE)
                .select('*')
                .eq('id', loanId)
                .single();

            if (error) {
                throw error;
            }

            return { success: true, loan: data };
        } catch (err) {
            console.log('Supabase unavailable, falling back to localStorage');
            // Fallback to localStorage
            const loans = getLoansFromLocalStorage();
            const loan = loans.find(l => l.id === loanId);
            return { success: true, loan: loan || null, isLocalStorage: true };
        }
    }

    /**
     * Update a loan
     * @param {string} loanId - Loan ID
     * @param {object} loanData - Updated loan data
     * @returns {object} - Result with success/error
     */
    async function updateLoan(loanId, loanData) {
        const updateData = {
            loan_name: loanData.name,
            amount: parseFloat(loanData.amount),
            interest_rate: parseFloat(loanData.interestRate),
            tenure: parseFloat(loanData.tenure),
            emi: parseFloat(loanData.emi),
            updated_at: new Date().toISOString()
        };

        // Try Supabase first
        try {
            const { data, error } = await window.supabaseClient
                .from(LOANS_TABLE)
                .update(updateData)
                .eq('id', loanId)
                .select();

            if (error) {
                throw error;
            }

            return { success: true, data: data[0] };
        } catch (err) {
            console.log('Supabase unavailable, falling back to localStorage');
            // Fallback to localStorage
            const loans = getLoansFromLocalStorage();
            const index = loans.findIndex(l => l.id === loanId);
            if (index !== -1) {
                loans[index] = { ...loans[index], ...updateData };
                saveLoansToLocalStorage(loans);
                return { success: true, data: loans[index], isLocalStorage: true };
            }
            return { success: false, error: 'Loan not found' };
        }
    }

    /**
     * Delete a loan
     * @param {string} loanId - Loan ID
     * @returns {object} - Result with success/error
     */
    async function deleteLoan(loanId) {
        // Try Supabase first
        try {
            const { error } = await window.supabaseClient
                .from(LOANS_TABLE)
                .delete()
                .eq('id', loanId);

            if (error) {
                throw error;
            }

            return { success: true };
        } catch (err) {
            console.log('Supabase unavailable, falling back to localStorage');
            // Fallback to localStorage
            const loans = getLoansFromLocalStorage();
            const filteredLoans = loans.filter(l => l.id !== loanId);
            saveLoansToLocalStorage(filteredLoans);
            return { success: true, isLocalStorage: true };
        }
    }

    /**
     * Get dashboard statistics for current user
     * @returns {object} - Statistics object
     */
    async function getDashboardStats() {
        const user = await getCurrentUser();
        if (!user) {
            return { 
                success: false, 
                error: 'User not logged in',
                stats: { totalLoans: 0, totalEMI: 0, totalAmount: 0 }
            };
        }

        // Try Supabase first
        try {
            const { data, error } = await window.supabaseClient
                .from(LOANS_TABLE)
                .select('amount, emi')
                .eq('user_id', user.id);

            if (error) {
                throw error;
            }

            const loans = data || [];
            const totalLoans = loans.length;
            const totalEMI = loans.reduce((sum, loan) => sum + (loan.emi || 0), 0);
            const totalAmount = loans.reduce((sum, loan) => sum + (loan.amount || 0), 0);

            return {
                success: true,
                stats: {
                    totalLoans,
                    totalEMI,
                    totalAmount
                }
            };
        } catch (err) {
            console.log('Supabase unavailable, falling back to localStorage');
            // Fallback to localStorage
            const loans = getLoansFromLocalStorage();
            const userLoans = loans.filter(l => l.user_id === user.id);
            const totalLoans = userLoans.length;
            const totalEMI = userLoans.reduce((sum, loan) => sum + (loan.emi || 0), 0);
            const totalAmount = userLoans.reduce((sum, loan) => sum + (loan.amount || 0), 0);

            return {
                success: true,
                stats: {
                    totalLoans,
                    totalEMI,
                    totalAmount
                },
                isLocalStorage: true
            };
        }
    }

    /**
     * Get all loans (Admin only)
     * @returns {object} - Result with all loans
     */
    async function getAllLoans() {
        try {
            const admin = await isAdmin();
            if (!admin) {
                return { success: false, error: 'Admin access required', loans: [] };
            }

            const { data, error } = await window.supabaseClient
                .from(LOANS_TABLE)
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching all loans:', error);
                return { success: false, error: error.message, loans: [] };
            }

            return { success: true, loans: data || [] };
        } catch (err) {
            console.error('Error fetching all loans:', err);
            return { success: false, error: err.message, loans: [] };
        }
    }

    /**
     * Get all users (Admin only - using auth API)
     * @returns {object} - Result with user list
     */
    async function getAllUsers() {
        try {
            const admin = await isAdmin();
            if (!admin) {
                return { success: false, error: 'Admin access required', users: [] };
            }

            // Note: This requires admin privileges in Supabase
            // For now, we'll return a placeholder
            // In production, you'd need a cloud function or admin API
            return { 
                success: true, 
                users: [],
                message: 'User listing requires admin API access'
            };
        } catch (err) {
            console.error('Error fetching users:', err);
            return { success: false, error: err.message, users: [] };
        }
    }

    /**
     * Delete any loan (Admin only)
     * @param {string} loanId - Loan ID
     * @returns {object} - Result with success/error
     */
    async function adminDeleteLoan(loanId) {
        try {
            const admin = await isAdmin();
            if (!admin) {
                return { success: false, error: 'Admin access required' };
            }

            const { error } = await window.supabaseClient
                .from(LOANS_TABLE)
                .delete()
                .eq('id', loanId);

            if (error) {
                console.error('Error deleting loan:', error);
                return { success: false, error: error.message };
            }

            return { success: true };
        } catch (err) {
            console.error('Error deleting loan:', err);
            return { success: false, error: err.message };
        }
    }

    // Public API
    return {
        saveLoan: saveLoan,
        getUserLoans: getUserLoans,
        getLoanById: getLoanById,
        updateLoan: updateLoan,
        deleteLoan: deleteLoan,
        getDashboardStats: getDashboardStats,
        getAllLoans: getAllLoans,
        getAllUsers: getAllUsers,
        adminDeleteLoan: adminDeleteLoan
    };
})();

// Export for global use
window.DatabaseManager = DatabaseManager;
