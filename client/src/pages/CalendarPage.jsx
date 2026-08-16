import React, { useEffect, useState } from 'react';
import { Calendar as CalIcon, CreditCard, Wallet } from 'lucide-react';
import { fetchICICIPaymentsApi, fetchSlicePaymentsApi } from '../services/api';
import { formatCurrency, formatMonthName } from '../utils/formatters';
import { RedlineCard, RedlineBadge, PageHeader } from '../components/RedlineComponents';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function CalendarMonth({ year, month, events }) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const getEvents = (day) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  return (
    <div>
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[11px] font-semibold text-[#999] py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          const evs = getEvents(day);
          const isToday = day && today.getDate() === day &&
            today.getMonth() === month && today.getFullYear() === year;
          return (
            <div
              key={i}
              className={`min-h-[44px] rounded-lg p-1 relative ${
                day ? 'hover:bg-[#F5F5F5] cursor-default' : ''
              }`}
            >
              {day && (
                <>
                  <span className={`text-xs font-medium block text-center w-6 h-6 rounded-full flex items-center justify-center mx-auto ${
                    isToday ? 'bg-[#C62828] text-white' : 'text-[#666]'
                  }`}>
                    {day}
                  </span>
                  <div className="flex flex-wrap gap-0.5 justify-center mt-0.5">
                    {evs.map((ev, j) => (
                      <span
                        key={j}
                        className={`w-1.5 h-1.5 rounded-full ${
                          ev.type === 'icici' ? 'bg-orange-500' : 'bg-purple-500'
                        }`}
                        title={ev.label}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const [icici, setIcici]   = useState([]);
  const [slice, setSlice]   = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date();
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchICICIPaymentsApi(), fetchSlicePaymentsApi()])
      .then(([i, s]) => { setIcici(i.data || []); setSlice(s.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* Build event list */
  const events = [
    ...icici.flatMap(r => [
      r.due_date && { date: r.due_date, type: 'icici', label: `ICICI due — ${formatCurrency(r.outstanding)}`, record: r },
      r.payment_date && { date: r.payment_date, type: 'icici', label: `ICICI paid — ${formatCurrency(r.amount_paid)}`, record: r },
    ].filter(Boolean)),
    ...slice.flatMap(r => [
      r.due_date && { date: r.due_date, type: 'slice', label: `Slice due`, record: r },
      r.payment_date && { date: r.payment_date, type: 'slice', label: `Slice paid — ${formatCurrency(r.repayment_paid)}`, record: r },
    ].filter(Boolean)),
  ];

  /* Upcoming events */
  const todayStr = today.toISOString().split('T')[0];
  const upcoming = events
    .filter(e => e.date >= todayStr)
    .sort((a, b) => a.date > b.date ? 1 : -1)
    .slice(0, 6);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-3xl mx-auto pb-24 md:pb-8 animate-fade-in">
      <PageHeader title="Calendar" subtitle="Payment due dates and activity" />

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Calendar */}
        <RedlineCard className="md:col-span-3 p-5">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="rl-btn-ghost p-2 rounded-lg">‹</button>
            <span className="text-sm font-semibold text-[#171717]">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button onClick={nextMonth} className="rl-btn-ghost p-2 rounded-lg">›</button>
          </div>

          {loading ? (
            <div className="h-48 flex items-center justify-center text-sm text-[#999]">Loading...</div>
          ) : (
            <CalendarMonth year={viewYear} month={viewMonth} events={events} />
          )}

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#EAEAEA]">
            <div className="flex items-center gap-1.5 text-xs text-[#666]">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> ICICI
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#666]">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Slice
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#666]">
              <span className="w-5 h-5 rounded-full bg-[#C62828] flex items-center justify-center text-white text-[9px]">1</span> Today
            </div>
          </div>
        </RedlineCard>

        {/* Upcoming */}
        <RedlineCard className="md:col-span-2 p-5">
          <h3 className="text-sm font-semibold text-[#171717] mb-4">Coming up</h3>
          {upcoming.length === 0 ? (
            <p className="text-sm text-[#999]">No upcoming events.</p>
          ) : (
            <div className="space-y-0">
              {upcoming.map((ev, i) => (
                <div key={i} className="flex items-start gap-3 py-3 border-b border-[#EAEAEA] last:border-0">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    ev.type === 'icici' ? 'bg-orange-500' : 'bg-purple-500'
                  }`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#171717] leading-snug">{ev.label}</p>
                    <p className="text-xs text-[#999] mt-0.5">{ev.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </RedlineCard>
      </div>
    </div>
  );
}
