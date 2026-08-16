import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';
import GlobalSearch from './components/GlobalSearch';
import NotificationsDrawer from './components/NotificationsDrawer';

// Modals
import RecordPaymentModal from './components/RecordPaymentModal';
import AddCustomerModal from './components/AddCustomerModal';
import AddCreditModal from './components/AddCreditModal';
import CustomerStatementModal from './components/CustomerStatementModal';
import AddPaymentModal from './components/AddPaymentModal';
import ConfirmModal from './components/ConfirmModal';

// Pages
import Dashboard from './pages/Dashboard';
import CustomersPage from './pages/CustomersPage';
import CreditAccountsPage from './pages/CreditAccountsPage';
import PaymentsPage from './pages/PaymentsPage';
import ICICIPage from './pages/ICICIPage';
import SlicePage from './pages/SlicePage';
import AnalyticsPage from './pages/AnalyticsPage';
import CalendarPage from './pages/CalendarPage';
import SimulatorPage from './pages/SimulatorPage';
import GoalsPage from './pages/GoalsPage';
import HealthPage from './pages/HealthPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

import { fetchDashboardApi } from './services/api';
import { LoadingSpinner } from './components/RedlineComponents';

function MainApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [privacyMode, setPrivacyMode] = useState(() => {
    return localStorage.getItem('rl_privacy') === 'true';
  });

  // Persist privacy preference
  useEffect(() => {
    localStorage.setItem('rl_privacy', privacyMode);
  }, [privacyMode]);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Modals state
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState({ customerId: null, creditId: null });

  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [isAddCreditOpen, setIsAddCreditOpen] = useState(false);
  const [creditTargetCustomer, setCreditTargetCustomer] = useState(null);

  const [statementCustomer, setStatementCustomer] = useState(null);
  const [isStatementOpen, setIsStatementOpen] = useState(false);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load live notifications count
  useEffect(() => {
    fetchDashboardApi()
      .then(res => {
        if (res?.data?.notifications) {
          setNotifications(res.data.notifications);
        }
      })
      .catch(() => {});
  }, [refreshKey]);

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const handler = (e) => {
      // Ctrl+K = search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(p => !p);
      }
      // Ctrl+P = Record payment
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        handleOpenRecordPayment();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size={32} />
          <p className="text-sm text-[#999] font-medium">Loading PayTrack Platform…</p>
        </div>
      </div>
    );
  }

  const triggerRefresh = () => {
    setRefreshKey(k => k + 1);
  };

  const handleOpenRecordPayment = (customerId = null, creditId = null) => {
    setPaymentTarget({ customerId, creditId });
    setIsRecordPaymentOpen(true);
  };

  const handleOpenAddCustomer = () => {
    setEditingCustomer(null);
    setIsAddCustomerOpen(true);
  };

  const handleOpenEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setIsAddCustomerOpen(true);
  };

  const handleOpenAddCredit = (customerId = null) => {
    setCreditTargetCustomer(customerId);
    setIsAddCreditOpen(true);
  };

  const handleOpenStatement = (customerId) => {
    setStatementCustomer(customerId);
    setIsStatementOpen(true);
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen flex bg-[#FAFAFA] text-[#171717]">
      {/* Sidebar (Desktop) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRecordPayment={() => handleOpenRecordPayment()}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-6">
        {/* Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenSearch={() => setIsSearchOpen(true)}
          onRecordPayment={() => handleOpenRecordPayment()}
          privacyMode={privacyMode}
          togglePrivacy={() => setPrivacyMode(p => !p)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          unreadCount={unreadNotificationsCount}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              key={refreshKey}
              onNavigate={setActiveTab}
              onRecordPayment={handleOpenRecordPayment}
              onAddCustomer={handleOpenAddCustomer}
              onAddCredit={handleOpenAddCredit}
              onViewStatement={handleOpenStatement}
              privacyMode={privacyMode}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersPage
              key={refreshKey}
              onRecordPayment={handleOpenRecordPayment}
              onAddCredit={handleOpenAddCredit}
              onViewStatement={handleOpenStatement}
              onAddCustomer={handleOpenAddCustomer}
              onEditCustomer={handleOpenEditCustomer}
              privacyMode={privacyMode}
            />
          )}

          {activeTab === 'credits' && (
            <CreditAccountsPage
              key={refreshKey}
              onRecordPayment={handleOpenRecordPayment}
              onAddCredit={handleOpenAddCredit}
              privacyMode={privacyMode}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsPage
              key={refreshKey}
              onRecordPayment={() => handleOpenRecordPayment()}
              privacyMode={privacyMode}
            />
          )}

          {activeTab === 'icici' && (
            <ICICIPage
              key={refreshKey}
              onOpenAddModal={() => handleOpenRecordPayment()}
              onOpenEditModal={(r) => handleOpenRecordPayment()}
              onOpenDeleteModal={() => {}}
              privacyMode={privacyMode}
            />
          )}

          {activeTab === 'slice' && (
            <SlicePage
              key={refreshKey}
              onOpenAddModal={() => handleOpenRecordPayment()}
              onOpenEditModal={(r) => handleOpenRecordPayment()}
              onOpenDeleteModal={() => {}}
              privacyMode={privacyMode}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsPage key={refreshKey} privacyMode={privacyMode} />
          )}

          {activeTab === 'calendar' && (
            <CalendarPage key={refreshKey} onOpenPaymentModal={handleOpenRecordPayment} />
          )}

          {activeTab === 'simulator' && (
            <SimulatorPage key={refreshKey} />
          )}

          {activeTab === 'goals' && (
            <GoalsPage key={refreshKey} />
          )}

          {activeTab === 'health' && (
            <HealthPage key={refreshKey} />
          )}

          {activeTab === 'reports' && (
            <ReportsPage key={refreshKey} privacyMode={privacyMode} />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              privacyMode={privacyMode}
              onPrivacyToggle={() => setPrivacyMode(p => !p)}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRecordPayment={() => handleOpenRecordPayment()}
      />

      {/* ── GLOBAL MODALS ── */}
      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
        onSuccess={triggerRefresh}
        initialCustomerId={paymentTarget.customerId}
        initialCreditId={paymentTarget.creditId}
      />

      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        onSuccess={triggerRefresh}
        initialData={editingCustomer}
      />

      <AddCreditModal
        isOpen={isAddCreditOpen}
        onClose={() => setIsAddCreditOpen(false)}
        onSuccess={triggerRefresh}
        initialCustomerId={creditTargetCustomer}
      />

      <CustomerStatementModal
        isOpen={isStatementOpen}
        onClose={() => setIsStatementOpen(false)}
        customerId={statementCustomer}
      />

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onActionClick={handleOpenRecordPayment}
        onMarkAllRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
      />

      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={setActiveTab}
        onRecordPayment={handleOpenRecordPayment}
        onViewStatement={handleOpenStatement}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
