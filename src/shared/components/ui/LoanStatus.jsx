import {CheckCircle2, Clock3, CircleAlert} from 'lucide-react';

export default function LoanStatus({status}) {
  const late = status === 'Quá hạn', returned = status === 'Đã trả';
  const Icon = late ? CircleAlert : returned ? CheckCircle2 : Clock3;
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${late ? 'bg-red-100 text-red-800' : returned ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-900'}`}>
    <Icon size={14} aria-hidden="true"/>{status || 'Chưa rõ'}
  </span>;
}
