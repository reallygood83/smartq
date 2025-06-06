interface CardProps {
  children: React.ReactNode;
  title?: string | React.ReactNode;
  className?: string;
  padding?: boolean;
}

function Card({ 
  children, 
  title, 
  className = '',
  padding = true 
}: CardProps) {
  const paddingClass = padding ? 'p-6' : '';
  
  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-200">
          {typeof title === 'string' ? (
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          ) : (
            title
          )}
        </div>
      )}
      <div className={paddingClass}>
        {children}
      </div>
    </div>
  );
}

export { Card }
export default Card