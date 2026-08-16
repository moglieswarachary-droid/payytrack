# PayTrack — Personal Credit & Payment Management App

A production-grade, human-designed personal credit and payment management platform built for tracking **ICICI Credit Card** bills, **Slice** repayments, and future credit accounts.

---

## 🌟 Key Features

### 1. Account Management & Isolation
- **ICICI Credit Card**: Tracks billing cycle, current outstanding, amount paid, credit limits, available credit, utilization %, due dates, and status.
- **Slice Repayment**: Tracks opening balance, repayments, remaining power, due dates, and progress percentage.
- **Independent Tracking**: Distinct computation logic, limit migration tracking, and clear account separation.

### 2. Comprehensive Financial Dashboard
- **Signature Red Hero Panel**: Instant glance at total outstanding across all accounts.
- **Account Split Cards**: Dedicated ICICI and Slice overview cards with key health indicators.
- **Trend Charts**: Monthly outstanding reduction curves.
- **"What Changed?" Insights**: Contextual explanations of month-over-month shifts.
- **Upcoming Due Dates**: Prioritized due date alert queue.

### 3. Smart Tools
- **Payment History**: Filterable, searchable table and mobile card view with month locking.
- **Analytics**: 5-dimension deep dive (Overview, ICICI, Slice, Payment Velocity, Utilization).
- **Payment Simulator**: Interactive payment slider with instant debt reduction impact and strategy comparisons (Snowball vs Avalanche).
- **Financial Health Score**: 0–100 data health meter evaluating consistency, utilization, velocity, and completeness.
- **Interactive Calendar**: Monthly payment schedule with event status indicators.
- **Reports & Export**: Generate statements with one-click CSV and JSON exports.
- **Global Search (`Ctrl + K`)**: Command palette to quickly search records, months, and navigate pages.
- **Privacy Mode**: One-click toggle to mask all currency values on screen.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts
- **Backend**: Node.js, Express REST API, JWT Authentication, Bcrypt password hashing
- **Database**: Local JSON storage with atomic file transactions

---

## 🚀 Setup & Running Locally

### 1. Install Dependencies

```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### 2. Start Backend and Frontend

In your backend directory:
```bash
cd server
node index.js
# Runs on http://localhost:5000
```

In your frontend directory:
```bash
cd client
npm run dev
# Runs on http://localhost:3000
```

Open your browser at `http://localhost:3000`.

### 3. Demo Login Credentials

- **Email**: `demo@fintech.local`
- **Password**: `demo1234`
- Or use the **Try with demo account** button directly on the login screen.

---

## 🔒 Security & Privacy

- No real bank login credentials required or stored.
- All calculations are processed locally.
- JWT-based authentication for isolated multi-user support.
