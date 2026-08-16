import React, { useState } from 'react';
import { LayoutDashboard, Wallet, Clock, BarChart3, MoreHorizontal, CreditCard, Plus, Target, Zap, Heart, FileText, Settings } from 'lucide-react';

const PRIMARY_NAV = [
  { id: 'dashboard', label: 'Home',     icon: LayoutDashboard },
  { id: 'history',   label: 'History',  icon: Clock },
  { id: 'analytics', label: 'Analytics',icon: BarChart3 },
  { id: 'more',      label: 'More',     icon: MoreHorizontal },
];

const MORE_ITEMS = [
  { id: 'icici',     label: 'ICICI Card', icon: CreditCard },
  { id: 'slice',     label: 'Slice',      icon: Wallet },
  { id: 'calendar',  label: 'Calendar',   icon: Zap },
  { id: 'goals',     label: 'Goals',      icon: Target },
  { id: 'health',    label: 'Health',     icon: Heart },
  { id: 'simulator', label: 'Simulator',  icon: Zap },
  { id: 'reports',   label: 'Reports',    icon: FileText },
  { id: 'settings',  label: 'Settings',   icon: Settings },
];

export default function MobileBottomNav({ activeTab, setActiveTab, onOpenAddModal }) {
  const [showMore, setShowMore] = useState(false);

  const handleNav = (id) => {
    if (id === 'more') {
      setShowMore(!showMore);
      return;
    }
    setShowMore(false);
    setActiveTab(id);
  };

  const isMoreActive = MORE_ITEMS.some(i => i.id === activeTab);

  return (
    <>
      {/* More drawer overlay */}
      {showMore && (
        <div
          className="fixed inset-0 z-30 bg-black/20"
          onClick={() => setShowMore(false)}
        >
          <div
            className="absolute bottom-16 left-0 right-0 bg-white border-t border-[#EAEAEA] rounded-t-2xl p-4 grid grid-cols-4 gap-1 animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            {MORE_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { handleNav(id); setShowMore(false); }}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-colors ${
                  activeTab === id
                    ? 'bg-[#FFF6F6] text-[#C62828]'
                    : 'text-[#666] hover:bg-[#F5F5F5]'
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom nav bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-[#EAEAEA] safe-area-bottom">
        <div className="flex items-center h-16 px-1 relative">
          {/* First 2 items */}
          {PRIMARY_NAV.slice(0, 2).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 transition-colors ${
                activeTab === id ? 'text-[#C62828]' : 'text-[#999]'
              }`}
            >
              <Icon size={21} />
              <span className="text-[10px] font-medium leading-none">{label}</span>
              {activeTab === id && (
                <span className="absolute top-0 left-0 w-full h-[2px] bg-transparent" />
              )}
            </button>
          ))}

          {/* FAB */}
          <div className="flex-shrink-0 px-2">
            <button
              onClick={onOpenAddModal}
              className="w-12 h-12 rounded-full bg-[#C62828] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(198,40,40,0.4)] hover:bg-[#D32F2F] active:scale-95 transition-all"
              title="Add Payment"
            >
              <Plus size={22} />
            </button>
          </div>

          {/* Last 2 items */}
          {PRIMARY_NAV.slice(2).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 transition-colors ${
                (id === 'more' && (showMore || isMoreActive)) || activeTab === id
                  ? 'text-[#C62828]'
                  : 'text-[#999]'
              }`}
            >
              <Icon size={21} />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
