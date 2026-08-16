import React from 'react';
import {
  LayoutDashboard, Users, CreditCard, Receipt,
  IndianRupee, MoreHorizontal
} from 'lucide-react';

const MOBILE_NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'customers', label: 'Clients', icon: Users },
  { id: 'credits',   label: 'Credits', icon: CreditCard },
  { id: 'payments',  label: 'Ledger', icon: Receipt },
  { id: 'reports',   label: 'Reports', icon: MoreHorizontal },
];

export default function MobileBottomNav({ activeTab, setActiveTab, onRecordPayment }) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EAEAEA] px-2 py-1.5 flex items-center justify-around shadow-lg">
      {MOBILE_NAV.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              isActive ? 'text-[#C62828] font-bold scale-105' : 'text-[#666] font-medium'
            }`}
          >
            <Icon size={18} className={isActive ? 'stroke-[2.5]' : 'stroke-2'} />
            <span className="text-[10px] mt-0.5">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
