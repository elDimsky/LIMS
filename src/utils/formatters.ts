export function formatCurrencyIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number, decimals: number = 0): string {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateTimeString: string): string {
  if (!dateTimeString) return '-';
  try {
    const d = new Date(dateTimeString);
    if (isNaN(d.getTime())) return dateTimeString;
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateTimeString;
  }
}

export function getStatusColor(status: string): { bg: string; text: string; border: string; dot: string } {
  switch (status.toUpperCase()) {
    case 'APPROVED':
    case 'COMPLETED':
    case 'PASS':
    case 'AVAILABLE':
    case 'ACTIVE':
    case 'RECEIVED':
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/30',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800',
        dot: 'bg-emerald-500',
      };
    case 'PENDING':
    case 'PENDING_QC':
    case 'PENDING_APPROVAL':
    case 'REVIEW':
    case 'LOW_STOCK':
    case 'PARTIALLY_RECEIVED':
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/30',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800',
        dot: 'bg-amber-500',
      };
    case 'REJECTED':
    case 'FAILED':
    case 'FAIL':
    case 'OUT_OF_STOCK':
    case 'EXPIRED':
      return {
        bg: 'bg-rose-50 dark:bg-rose-950/30',
        text: 'text-rose-700 dark:text-rose-400',
        border: 'border-rose-200 dark:border-rose-800',
        dot: 'bg-rose-500',
      };
    case 'IN_PROGRESS':
    case 'EXPERIMENT':
    case 'TESTING':
    case 'ORDERED':
    case 'PLANNING':
      return {
        bg: 'bg-cyan-50 dark:bg-cyan-950/30',
        text: 'text-cyan-700 dark:text-cyan-400',
        border: 'border-cyan-200 dark:border-cyan-800',
        dot: 'bg-cyan-500',
      };
    case 'DRAFT':
    case 'ARCHIVED':
    case 'CLOSED':
    case 'DISPOSED':
    default:
      return {
        bg: 'bg-slate-50 dark:bg-slate-800/50',
        text: 'text-slate-600 dark:text-slate-400',
        border: 'border-slate-200 dark:border-slate-700',
        dot: 'bg-slate-400',
      };
  }
}
