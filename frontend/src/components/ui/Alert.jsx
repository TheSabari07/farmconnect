import { cn } from '../../lib/utils';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

const Alert = ({ children, variant = 'info', className, onClose, ...props }) => {
  const variants = {
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: Info,
      iconColor: 'text-blue-600',
    },
    success: {
      container: 'bg-green-50 border-green-200 text-green-900',
      icon: CheckCircle,
      iconColor: 'text-green-600',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-900',
      icon: AlertCircle,
      iconColor: 'text-yellow-600',
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-900',
      icon: XCircle,
      iconColor: 'text-red-600',
    },
  };

  const { container, icon: Icon, iconColor } = variants[variant];

  return (
    <div
      className={cn(
        'relative rounded-lg border p-4 flex items-start gap-3',
        container,
        className
      )}
      {...props}
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', iconColor)} />
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 text-current opacity-50 hover:opacity-100 transition-opacity"
        >
          <XCircle size={18} />
        </button>
      )}
    </div>
  );
};

export default Alert;
