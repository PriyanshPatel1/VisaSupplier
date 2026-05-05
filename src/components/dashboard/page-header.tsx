"use client";

interface HeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
}

export default function PageHeader({
  title,
  description,
  action,
}: HeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
      <div className="flex-1">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
          {title}
        </h1>
        {description && (
          <p className="text-sm sm:text-base text-slate-400">{description}</p>
        )}
      </div>
      {action && (
        <a
          href={action.href}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium text-sm sm:text-base flex-shrink-0"
          aria-label={action.label}
        >
          {action.label}
        </a>
      )}
    </div>
  );
}
