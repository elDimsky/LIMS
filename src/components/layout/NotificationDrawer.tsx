import React, { useState } from 'react';
import {
  X,
  Bell,
  CheckCheck,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Package,
  Beaker,
  CheckCircle2,
} from 'lucide-react';
import { useLims } from '../../context/LimsContext';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead, setActiveTab } = useLims();
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  if (!isOpen) return null;

  const filteredNotifs =
    filter === 'UNREAD' ? notifications.filter((n) => !n.read) : notifications;

  const handleItemClick = (notif: typeof notifications[0]) => {
    markNotificationRead(notif.id);
    if (notif.actionLink) {
      setActiveTab(notif.actionLink);
      onClose();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'LOW_STOCK':
      case 'EXPIRED_MATERIAL':
        return <Package className="w-4 h-4 text-amber-500" />;
      case 'APPROVAL_NEEDED':
        return <ShieldCheck className="w-4 h-4 text-blue-500" />;
      case 'EXPERIMENT_COMPLETED':
        return <Beaker className="w-4 h-4 text-teal-500" />;
      case 'TEST_FAILED':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-teal-600" />
              <h2 className="text-sm font-bold text-slate-900">Pusat Notifikasi R&D</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={markAllNotificationsRead}
                className="text-[11px] font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1 hover:underline p-1"
                title="Tandai semua telah dibaca"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Baca Semua</span>
              </button>
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter segment */}
          <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-2 bg-white">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                filter === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Semua ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('UNREAD')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                filter === 'UNREAD'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Belum Dibaca ({notifications.filter((n) => !n.read).length})
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
            {filteredNotifs.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p>Tidak ada notifikasi saat ini</p>
              </div>
            ) : (
              filteredNotifs.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    notif.read ? 'bg-white hover:bg-slate-50' : 'bg-teal-50/50 hover:bg-teal-50 border border-teal-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-md bg-white border border-slate-200 shrink-0 shadow-2xs mt-0.5">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs font-semibold truncate ${notif.read ? 'text-slate-800' : 'text-slate-900 font-bold'}`}>
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-2 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>{notif.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-200 bg-slate-50 text-center">
            <p className="text-[11px] text-slate-500">
              Notifikasi otomatis diperbarui berdasarkan status stok dan approval.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
