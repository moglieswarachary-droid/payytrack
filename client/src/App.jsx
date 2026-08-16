import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';
import AddPaymentModal from './components/AddPaymentModal';
import ConfirmModal from './components/ConfirmModal';
import GlobalSearch from './components/GlobalSearch';

import Dashboard     from './pages/Dashboard';
import ICICIPage     from './pages/ICICIPage';
import SlicePage     from './pages/SlicePage';
import HistoryPage   from './pages/HistoryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CalendarPage  from './pages/CalendarPage';
import ReportsPage   from './pages/ReportsPage';
import SettingsPage  from './pages/SettingsPage';
import GoalsPage     from './pages/GoalsPage';
import SimulatorPage from './pages/SimulatorPage';
import HealthPage    from './pages/HealthPage';
import LoginPage     from './pages/LoginPage';

import { deleteICICIPaymentApi, deleteSlicePaymentApi } from './services/api';
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

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const handler = (e) => {
      // Ctrl+K = search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(p => !p);
      }
      // Ctrl+N = add payment
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleOpenAddModal('icici');
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalAccount, setAddModalAccount] = useState('icici');
  const [editRecordData, setEditRecordData]   = useState(null);
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false, item: null, accountType: 'icici', loading: false
  });
  const [isSearchOpen, setIsSearchOpen]     = useState(false);
  const [refreshKey, setRefreshKey]         = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size={32} />
          <p className="text-sm text-[#999] font-medium">Loading PayTrack…</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  const handleOpenAddModal = (account = 'icici') => {
    setEditRecordData(null);
    setAddModalAccount(account);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (record, accountType) => {
    setEditRecordData(record);
    setAddModalAccount(accountType);
    setIsAddModalOpen(true);
  };

  const handleOpenDeleteModal = (record, accountType) => {
    setDeleteModalState({ isOpen: true, item: record, accountType, loading: false });
  };

  const handleConfirmDelete = async () => {
    const { item, accountType } = deleteModalState;
    if (!item) return;
    setDeleteModalState(p => ({ ...p, loading: true }));
    try {
      if (accountType === 'icici') await deleteICICIPaymentApi(item.id);
      else await deleteSlicePaymentApi(item.id);
      setRefreshKey(p => p + 1);
      setDeleteModalState({ isOpen: false, item: null, accountType: 'icici', loading: false });
    } catch {
      alert('Unable to delete this record.');
      setDeleteModalState(p => ({ ...p, loading: false }));
    }
  };

  const sharedPageProps = { privacyMode };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col md:flex-row antialiased font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onOpenAddModal={() => handleOpenAddModal('icici')} />

      <div className="flex-1 flex flex-col min-w-0 md:ml-[240px]">
        <Navbar
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenAddModal={() => handleOpenAddModal('icici')}
          privacyMode={privacyMode}
          onPrivacyToggle={() => setPrivacyMode(p => !p)}
          activeTab={activeTab}
        />

        <main className="flex-1">
          {activeTab === 'dashboard' && (
            <Dashboard
              key={`dash_${refreshKey}`}
              onOpenAddModal={handleOpenAddModal}
              setActiveTab={setActiveTab}
              {...sharedPageProps}
            />
          )}

          {activeTab === 'icici' && (
            <ICICIPage
              key={`icici_${refreshKey}`}
              onOpenAddModal={handleOpenAddModal}
              onEditRecord={handleOpenEditModal}
              onDeleteRecord={handleOpenDeleteModal}
              {...sharedPageProps}
            />
          )}

          {activeTab === 'slice' && (
            <SlicePage
              key={`slice_${refreshKey}`}
              onOpenAddModal={handleOpenAddModal}
              onEditRecord={handleOpenEditModal}
              onDeleteRecord={handleOpenDeleteModal}
              {...sharedPageProps}
            />
          )}

          {activeTab === 'history' && (
            <HistoryPage
              key={`hist_${refreshKey}`}
              onEditRecord={handleOpenEditModal}
              onDeleteRecord={handleOpenDeleteModal}
              {...sharedPageProps}
            />
          )}

          {activeTab === 'analytics'  && <AnalyticsPage  key={`ana_${refreshKey}`}  {...sharedPageProps} />}
          {activeTab === 'goals'      && <GoalsPage       key={`goal_${refreshKey}`} {...sharedPageProps} />}
          {activeTab === 'simulator'  && <SimulatorPage   key={`sim_${refreshKey}`}  {...sharedPageProps} />}
          {activeTab === 'health'     && <HealthPage      key={`hlt_${refreshKey}`}  {...sharedPageProps} />}
          {activeTab === 'calendar'   && <CalendarPage    key={`cal_${refreshKey}`}  {...sharedPageProps} />}
          {activeTab === 'reports'    && <ReportsPage     key={`rep_${refreshKey}`}  {...sharedPageProps} />}
          {activeTab === 'settings'   && (
            <SettingsPage
              key={`set_${refreshKey}`}
              privacyMode={privacyMode}
              onPrivacyToggle={() => setPrivacyMode(p => !p)}
            />
          )}
        </main>
      </div>

      <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <AddPaymentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => setRefreshKey(p => p + 1)}
        initialData={editRecordData}
        initialAccount={addModalAccount}
      />

      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState(p => ({ ...p, isOpen: false }))}
        onConfirm={handleConfirmDelete}
        loading={deleteModalState.loading}
        title="Delete record"
        message={`Delete the ${deleteModalState.accountType === 'icici' ? 'ICICI' : 'Slice'} record for ${deleteModalState.item?.billing_month || deleteModalState.item?.month || ''}? This cannot be undone.`}
      />

      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectRecord={(record, type) => { handleOpenEditModal(record, type); setIsSearchOpen(false); }}
        onOpenAddModal={handleOpenAddModal}
        onNavigate={(tab) => { setActiveTab(tab); setIsSearchOpen(false); }}
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
