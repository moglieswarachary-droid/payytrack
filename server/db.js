const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, 'data.json');

// Helper to load DB
function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initialDB = getInitialSchema();
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2), 'utf8');
    return initialDB;
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading database file, creating fresh DB schema', err);
    const fresh = getInitialSchema();
    fs.writeFileSync(DB_FILE, JSON.stringify(fresh, null, 2), 'utf8');
    return fresh;
  }
}

// Helper to save DB atomically
function saveDB(db) {
  const tempFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tempFile, DB_FILE);
}

// Initial Database Schema with Seed Data
function getInitialSchema() {
  const salt = bcrypt.genSaltSync(10);
  const password_hash = bcrypt.hashSync('demo1234', salt);

  const userId = 'usr_demo_001';
  const cardId = 'crd_icici_001';
  const sliceAccId = 'slc_acc_001';

  const defaultUser = {
    id: userId,
    name: 'Rohan Sharma',
    email: 'demo@fintech.local',
    password_hash: password_hash,
    created_at: new Date().toISOString()
  };

  const defaultCard = {
    id: cardId,
    user_id: userId,
    provider: 'ICICI Bank',
    card_name: 'ICICI Bank Sapphiro Credit Card',
    last_4: '1234',
    credit_limit: 150000,
    created_at: new Date().toISOString()
  };

  const defaultSliceAcc = {
    id: sliceAccId,
    user_id: userId,
    account_name: 'Slice Borrow Account',
    created_at: new Date().toISOString()
  };

  const defaultSettings = {
    user_id: userId,
    theme: 'dark',
    currency: 'INR',
    currency_symbol: '₹',
    alert_util_healthy: 30,
    alert_util_moderate: 50,
    alert_util_high: 75,
    payment_reminders: true,
    due_date_alerts: true,
    demo_mode: true,
    updated_at: new Date().toISOString()
  };

  // Seed sample 4 months of financial history for ICICI & Slice
  const iciciPayments = [
    {
      id: 'icici_pay_101',
      user_id: userId,
      card_id: cardId,
      billing_month: '2026-05',
      outstanding: 38000,
      amount_paid: 38000,
      credit_limit_at_payment: 120000,
      available_limit_after_payment: 120000,
      credit_limit_next_bill: 120000,
      payment_date: '2026-05-18',
      due_date: '2026-05-20',
      status: 'Paid',
      notes: 'Full payment made via UPI.',
      created_at: '2026-05-18T10:00:00.000Z',
      updated_at: '2026-05-18T10:00:00.000Z'
    },
    {
      id: 'icici_pay_102',
      user_id: userId,
      card_id: cardId,
      billing_month: '2026-06',
      outstanding: 42500,
      amount_paid: 42500,
      credit_limit_at_payment: 120000,
      available_limit_after_payment: 120000,
      credit_limit_next_bill: 150000,
      payment_date: '2026-06-16',
      due_date: '2026-06-20',
      status: 'Paid',
      notes: 'Requested limit enhancement from ICICI app.',
      created_at: '2026-06-16T11:00:00.000Z',
      updated_at: '2026-06-16T11:00:00.000Z'
    },
    {
      id: 'icici_pay_103',
      user_id: userId,
      card_id: cardId,
      billing_month: '2026-07',
      outstanding: 65000,
      amount_paid: 45000,
      credit_limit_at_payment: 150000,
      available_limit_after_payment: 130000,
      credit_limit_next_bill: 150000,
      payment_date: '2026-07-17',
      due_date: '2026-07-20',
      status: 'Partially Paid',
      notes: 'Partial payment made due to gadget purchase.',
      created_at: '2026-07-17T14:30:00.000Z',
      updated_at: '2026-07-17T14:30:00.000Z'
    },
    {
      id: 'icici_pay_104',
      user_id: userId,
      card_id: cardId,
      billing_month: '2026-08',
      outstanding: 54500,
      amount_paid: 30000,
      credit_limit_at_payment: 150000,
      available_limit_after_payment: 125500,
      credit_limit_next_bill: 150000,
      payment_date: '2026-08-15',
      due_date: '2026-08-25',
      status: 'Partially Paid',
      notes: 'Current active billing cycle.',
      created_at: '2026-08-15T09:15:00.000Z',
      updated_at: '2026-08-15T09:15:00.000Z'
    }
  ];

  const slicePayments = [
    {
      id: 'slice_pay_101',
      user_id: userId,
      account_id: sliceAccId,
      billing_month: '2026-05',
      opening_outstanding: 25000,
      repayment_paid: 10000,
      payment_date: '2026-05-12',
      due_date: '2026-05-15',
      status: 'Paid',
      notes: 'Monthly Slice 3-part installment 1.',
      created_at: '2026-05-12T08:00:00.000Z',
      updated_at: '2026-05-12T08:00:00.000Z'
    },
    {
      id: 'slice_pay_102',
      user_id: userId,
      account_id: sliceAccId,
      billing_month: '2026-06',
      opening_outstanding: 15000,
      repayment_paid: 10000,
      payment_date: '2026-06-14',
      due_date: '2026-06-15',
      status: 'Paid',
      notes: 'Monthly Slice installment 2.',
      created_at: '2026-06-14T10:00:00.000Z',
      updated_at: '2026-06-14T10:00:00.000Z'
    },
    {
      id: 'slice_pay_103',
      user_id: userId,
      account_id: sliceAccId,
      billing_month: '2026-07',
      opening_outstanding: 18000,
      repayment_paid: 6000,
      payment_date: '2026-07-14',
      due_date: '2026-07-15',
      status: 'Paid',
      notes: 'Refreshed borrow power.',
      created_at: '2026-07-14T11:20:00.000Z',
      updated_at: '2026-07-14T11:20:00.000Z'
    },
    {
      id: 'slice_pay_104',
      user_id: userId,
      account_id: sliceAccId,
      billing_month: '2026-08',
      opening_outstanding: 12000,
      repayment_paid: 4000,
      payment_date: '2026-08-10',
      due_date: '2026-08-18',
      status: 'Partially Paid',
      notes: 'Remaining installment due soon.',
      created_at: '2026-08-10T16:45:00.000Z',
      updated_at: '2026-08-10T16:45:00.000Z'
    }
  ];

  const auditLogs = [
    {
      id: 'log_001',
      user_id: userId,
      action: 'SYSTEM_INIT',
      record_id: 'SYSTEM',
      details: 'Initialized FinTech Payment Tracker with seed records.',
      timestamp: new Date().toISOString()
    }
  ];

  return {
    users: [defaultUser],
    credit_cards: [defaultCard],
    slice_accounts: [defaultSliceAcc],
    user_settings: [defaultSettings],
    icici_payments: iciciPayments,
    slice_payments: slicePayments,
    audit_logs: auditLogs,
    monthly_snapshots: []
  };
}

// Database API Interface Functions
const DB = {
  // Users
  getUserByEmail(email) {
    const db = loadDB();
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  getUserById(id) {
    const db = loadDB();
    return db.users.find(u => u.id === id);
  },
  createUser(userData) {
    const db = loadDB();
    const newUser = {
      id: `usr_${Date.now()}_${Math.floor(Math.random()*1000)}`,
      name: userData.name,
      email: userData.email.toLowerCase(),
      password_hash: userData.password_hash,
      created_at: new Date().toISOString()
    };
    db.users.push(newUser);

    // Create default card and slice account for user
    const cardId = `crd_icici_${Date.now()}`;
    db.credit_cards.push({
      id: cardId,
      user_id: newUser.id,
      provider: 'ICICI Bank',
      card_name: 'ICICI Credit Card',
      last_4: '1234',
      credit_limit: 150000,
      created_at: new Date().toISOString()
    });

    const sliceAccId = `slc_acc_${Date.now()}`;
    db.slice_accounts.push({
      id: sliceAccId,
      user_id: newUser.id,
      account_name: 'Slice Account',
      created_at: new Date().toISOString()
    });

    db.user_settings.push({
      user_id: newUser.id,
      theme: 'dark',
      currency: 'INR',
      currency_symbol: '₹',
      alert_util_healthy: 30,
      alert_util_moderate: 50,
      alert_util_high: 75,
      payment_reminders: true,
      due_date_alerts: true,
      demo_mode: false,
      updated_at: new Date().toISOString()
    });

    saveDB(db);
    return newUser;
  },

  // ICICI Payments
  getICICIPayments(userId) {
    const db = loadDB();
    const payments = db.icici_payments.filter(p => p.user_id === userId);
    // Add dynamic calculated fields
    return payments.map(p => {
      const remaining_outstanding = Math.max(0, Number(p.outstanding || 0) - Number(p.amount_paid || 0));
      const credit_limit = Number(p.credit_limit_at_payment || 150000);
      const credit_utilization = credit_limit > 0 ? Number(((p.outstanding / credit_limit) * 100).toFixed(2)) : 0;
      const calculated_available_credit = Math.max(0, credit_limit - Number(p.outstanding || 0));
      const recorded_available_limit = Number(p.available_limit_after_payment || calculated_available_credit);
      const difference_flag = Math.abs(calculated_available_credit - recorded_available_limit) > 1;

      const next_bill_limit = Number(p.credit_limit_next_bill || credit_limit);
      const limit_change = next_bill_limit - credit_limit;
      let limit_status = 'Unchanged';
      if (limit_change > 0) limit_status = 'Increased';
      if (limit_change < 0) limit_status = 'Decreased';

      return {
        ...p,
        remaining_outstanding,
        credit_utilization,
        calculated_available_credit,
        recorded_available_limit,
        difference_flag,
        limit_change,
        limit_status
      };
    }).sort((a, b) => (b.billing_month || '').localeCompare(a.billing_month || ''));
  },

  getICICIPaymentById(userId, id) {
    const payments = DB.getICICIPayments(userId);
    return payments.find(p => p.id === id);
  },

  saveICICIPayment(userId, data) {
    const db = loadDB();
    const now = new Date().toISOString();
    const card = db.credit_cards.find(c => c.user_id === userId) || { id: 'crd_icici_001' };

    let record;
    if (data.id) {
      const index = db.icici_payments.findIndex(p => p.id === data.id && p.user_id === userId);
      if (index !== -1) {
        record = {
          ...db.icici_payments[index],
          billing_month: data.billing_month,
          outstanding: Number(data.outstanding),
          amount_paid: Number(data.amount_paid),
          credit_limit_at_payment: Number(data.credit_limit_at_payment),
          available_limit_after_payment: Number(data.available_limit_after_payment),
          credit_limit_next_bill: Number(data.credit_limit_next_bill),
          payment_date: data.payment_date,
          due_date: data.due_date,
          status: data.status,
          notes: data.notes || '',
          updated_at: now
        };
        db.icici_payments[index] = record;
      }
    }

    if (!record) {
      record = {
        id: `icici_pay_${Date.now()}`,
        user_id: userId,
        card_id: card.id,
        billing_month: data.billing_month,
        outstanding: Number(data.outstanding),
        amount_paid: Number(data.amount_paid),
        credit_limit_at_payment: Number(data.credit_limit_at_payment),
        available_limit_after_payment: Number(data.available_limit_after_payment),
        credit_limit_next_bill: Number(data.credit_limit_next_bill),
        payment_date: data.payment_date,
        due_date: data.due_date,
        status: data.status || 'Pending',
        notes: data.notes || '',
        created_at: now,
        updated_at: now
      };
      db.icici_payments.push(record);
    }

    // Add audit log
    db.audit_logs.push({
      id: `log_${Date.now()}`,
      user_id: userId,
      action: data.id ? 'UPDATE_ICICI_PAYMENT' : 'CREATE_ICICI_PAYMENT',
      record_id: record.id,
      details: `Saved ICICI payment for ${record.billing_month} (Outstanding: ₹${record.outstanding}, Paid: ₹${record.amount_paid})`,
      timestamp: now
    });

    saveDB(db);
    return DB.getICICIPaymentById(userId, record.id);
  },

  deleteICICIPayment(userId, id) {
    const db = loadDB();
    const index = db.icici_payments.findIndex(p => p.id === id && p.user_id === userId);
    if (index !== -1) {
      const deleted = db.icici_payments.splice(index, 1)[0];
      db.audit_logs.push({
        id: `log_${Date.now()}`,
        user_id: userId,
        action: 'DELETE_ICICI_PAYMENT',
        record_id: id,
        details: `Deleted ICICI payment record for ${deleted.billing_month}`,
        timestamp: new Date().toISOString()
      });
      saveDB(db);
      return true;
    }
    return false;
  },

  // Slice Payments
  getSlicePayments(userId) {
    const db = loadDB();
    const payments = db.slice_payments.filter(p => p.user_id === userId);
    return payments.map(p => {
      const opening = Number(p.opening_outstanding || 0);
      const paid = Number(p.repayment_paid || 0);
      const remaining_outstanding = Math.max(0, opening - paid);
      const repayment_percentage = opening > 0 ? Number(((paid / opening) * 100).toFixed(2)) : 0;
      const remaining_percentage = Math.max(0, 100 - repayment_percentage);

      return {
        ...p,
        remaining_outstanding,
        repayment_percentage,
        remaining_percentage
      };
    }).sort((a, b) => (b.billing_month || '').localeCompare(a.billing_month || ''));
  },

  getSlicePaymentById(userId, id) {
    const payments = DB.getSlicePayments(userId);
    return payments.find(p => p.id === id);
  },

  saveSlicePayment(userId, data) {
    const db = loadDB();
    const now = new Date().toISOString();
    const sliceAcc = db.slice_accounts.find(a => a.user_id === userId) || { id: 'slc_acc_001' };

    let record;
    if (data.id) {
      const index = db.slice_payments.findIndex(p => p.id === data.id && p.user_id === userId);
      if (index !== -1) {
        record = {
          ...db.slice_payments[index],
          billing_month: data.billing_month,
          opening_outstanding: Number(data.opening_outstanding),
          repayment_paid: Number(data.repayment_paid),
          payment_date: data.payment_date,
          due_date: data.due_date,
          status: data.status,
          notes: data.notes || '',
          updated_at: now
        };
        db.slice_payments[index] = record;
      }
    }

    if (!record) {
      record = {
        id: `slice_pay_${Date.now()}`,
        user_id: userId,
        account_id: sliceAcc.id,
        billing_month: data.billing_month,
        opening_outstanding: Number(data.opening_outstanding),
        repayment_paid: Number(data.repayment_paid),
        payment_date: data.payment_date,
        due_date: data.due_date,
        status: data.status || 'Pending',
        notes: data.notes || '',
        created_at: now,
        updated_at: now
      };
      db.slice_payments.push(record);
    }

    db.audit_logs.push({
      id: `log_${Date.now()}`,
      user_id: userId,
      action: data.id ? 'UPDATE_SLICE_PAYMENT' : 'CREATE_SLICE_PAYMENT',
      record_id: record.id,
      details: `Saved Slice repayment for ${record.billing_month} (Opening: ₹${record.opening_outstanding}, Paid: ₹${record.repayment_paid})`,
      timestamp: now
    });

    saveDB(db);
    return DB.getSlicePaymentById(userId, record.id);
  },

  deleteSlicePayment(userId, id) {
    const db = loadDB();
    const index = db.slice_payments.findIndex(p => p.id === id && p.user_id === userId);
    if (index !== -1) {
      const deleted = db.slice_payments.splice(index, 1)[0];
      db.audit_logs.push({
        id: `log_${Date.now()}`,
        user_id: userId,
        action: 'DELETE_SLICE_PAYMENT',
        record_id: id,
        details: `Deleted Slice payment record for ${deleted.billing_month}`,
        timestamp: new Date().toISOString()
      });
      saveDB(db);
      return true;
    }
    return false;
  },

  // Settings
  getUserSettings(userId) {
    const db = loadDB();
    const settings = db.user_settings.find(s => s.user_id === userId);
    if (!settings) {
      const defaultSet = {
        user_id: userId,
        theme: 'dark',
        currency: 'INR',
        currency_symbol: '₹',
        alert_util_healthy: 30,
        alert_util_moderate: 50,
        alert_util_high: 75,
        payment_reminders: true,
        due_date_alerts: true,
        demo_mode: true,
        updated_at: new Date().toISOString()
      };
      db.user_settings.push(defaultSet);
      saveDB(db);
      return defaultSet;
    }
    return settings;
  },

  updateUserSettings(userId, data) {
    const db = loadDB();
    let settings = db.user_settings.find(s => s.user_id === userId);
    if (settings) {
      Object.assign(settings, data, { updated_at: new Date().toISOString() });
    } else {
      settings = { user_id: userId, ...data, updated_at: new Date().toISOString() };
      db.user_settings.push(settings);
    }
    saveDB(db);
    return settings;
  },

  // Audit Logs
  getAuditLogs(userId) {
    const db = loadDB();
    return db.audit_logs.filter(l => l.user_id === userId).sort((a,b) => b.timestamp.localeCompare(a.timestamp));
  },

  // Seed Demo Data Toggle
  resetToDemoData(userId) {
    const schema = getInitialSchema();
    const db = loadDB();

    // Replace payments and settings for demo user
    db.icici_payments = db.icici_payments.filter(p => p.user_id !== userId).concat(schema.icici_payments);
    db.slice_payments = db.slice_payments.filter(p => p.user_id !== userId).concat(schema.slice_payments);
    db.audit_logs.push({
      id: `log_${Date.now()}`,
      user_id: userId,
      action: 'RESET_DEMO_DATA',
      record_id: userId,
      details: 'Reset system to initial demo dataset.',
      timestamp: new Date().toISOString()
    });

    saveDB(db);
    return true;
  },

  clearAllUserData(userId) {
    const db = loadDB();
    db.icici_payments = db.icici_payments.filter(p => p.user_id !== userId);
    db.slice_payments = db.slice_payments.filter(p => p.user_id !== userId);
    db.monthly_snapshots = db.monthly_snapshots.filter(s => s.user_id !== userId);
    db.audit_logs.push({
      id: `log_${Date.now()}`,
      user_id: userId,
      action: 'CLEAR_ALL_DATA',
      record_id: userId,
      details: 'Cleared all financial payment history.',
      timestamp: new Date().toISOString()
    });
    saveDB(db);
    return true;
  }
};

module.exports = DB;
