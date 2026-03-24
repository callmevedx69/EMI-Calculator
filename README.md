# Smart EMI Loan Calculator - Multi-Page System

A comprehensive loan management system with user authentication, cloud storage, and advanced financial insights.

## Features

- 🔐 **User Authentication** - Secure login/signup with Supabase
- 📊 **Dashboard** - Overview of all your loans with statistics
- 🧮 **EMI Calculator** - Full-featured calculator with charts and amortization
- ⚖️ **Loan Comparison** - Compare up to 3 loans side-by-side
- 💾 **Cloud Storage** - Save loans to Supabase database
- 💡 **Loan Affordability Engine** - Check if you can afford a new loan
- 🧠 **Smart Insights** - AI-free smart suggestions based on your loan
- 📄 **Enhanced PDF Reports** - Detailed PDF generation with insights
- 👤 **Profile Management** - View and manage saved loans
- 🔧 **Admin Panel** - Admin access to view all loans

## Pages

1. **index.html** - Landing page with option to login or use standalone
2. **login.html** - User authentication (signup/login)
3. **dashboard.html** - User dashboard with stats and affordability checker
4. **calculator.html** - Full EMI calculator with all features
5. **comparison.html** - Compare multiple loans
6. **profile.html** - User profile and saved loans management
7. **admin.html** - Admin panel (requires admin email)

## Setup Instructions

### 1. Configure Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to Settings > API
3. Copy your project URL and anon key
4. Edit `js/supabase-config.js` and replace the placeholder values:

```javascript
const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL',        // e.g., 'https://xyzabc.supabase.co'
    anonKey: 'YOUR_SUPABASE_ANON_KEY', // Your anon key
    adminEmail: 'admin@example.com'    // Admin email for panel access
};
```

### 2. Create Database Table

In Supabase SQL Editor, run:

```sql
-- Create loans table
CREATE TABLE loans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    loan_name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    interest_rate NUMERIC NOT NULL,
    tenure NUMERIC NOT NULL,
    emi NUMERIC NOT NULL,
    total_interest NUMERIC DEFAULT 0,
    total_payment NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'INR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see their own loans
CREATE POLICY "Users can manage their own loans" 
ON loans FOR ALL 
USING (auth.uid() = user_id);

-- Optional: Create policy for admin access
CREATE POLICY "Admin can view all loans" 
ON loans FOR SELECT 
USING (
    auth.jwt()->>'email' = 'admin@example.com'
);
```

### 3. Running the App

- **With Supabase (Full Features):**
  1. Configure Supabase as above
  2. Open `login.html` in browser
  3. Sign up/login to access cloud features

- **Without Supabase (Standalone):**
  1. Click "Use Without Login" on landing page
  2. Or use the original calculator at `calculator.html`
  3. Data will be stored in localStorage only

## Usage

### Dashboard
- View total loans, total amount, and monthly EMI burden
- Use Loan Affordability Engine to check loan eligibility
- See Smart Insights based on your loans
- Quick calculate and save loans

### Calculator
- Enter loan amount, interest rate, and tenure
- View EMI breakdown, charts, and amortization schedule
- Calculate prepayment impact
- Compare with other loans
- Save loans to cloud (when logged in)
- Download enhanced PDF reports

### Comparison
- Compare up to 3 loans side-by-side
- View visual bar charts
- Get recommendations for the best option

### Profile
- View user information and statistics
- Manage saved loans
- Change default currency and theme

### Admin Panel
- Access at `admin.html` (requires admin email configured)
- View all loans in the system
- Delete loan records
- Search and filter loans

## Tech Stack

- HTML5, CSS3, JavaScript (Vanilla)
- Supabase (Auth + Database)
- Chart.js (Visualizations)
- jsPDF (PDF Generation)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License
