import { cn } from '../../lib/utils';

const Card = ({ children, className, hover = false, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-200',
        hover && 'hover:shadow-lg hover:border-gray-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className, ...props }) => {
  return (
    <div className={cn('p-6 pb-4', className)} {...props}>
      {children}
    </div>
  );
};

const CardTitle = ({ children, className, ...props }) => {
  return (
    <h3 className={cn('text-xl font-bold text-gray-900', className)} {...props}>
      {children}
    </h3>
  );
};

const CardDescription = ({ children, className, ...props }) => {
  return (
    <p className={cn('text-sm text-gray-600 mt-1', className)} {...props}>
      {children}
    </p>
  );
};

const CardContent = ({ children, className, ...props }) => {
  return (
    <div className={cn('p-6 pt-0', className)} {...props}>
      {children}
    </div>
  );
};

const CardFooter = ({ children, className, ...props }) => {
  return (
    <div className={cn('p-6 pt-4 border-t border-gray-100', className)} {...props}>
      {children}
    </div>
  );
};

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
