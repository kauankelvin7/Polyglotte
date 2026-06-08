import { Bird } from 'lucide-react';

const Logo = ({ size = 'md' }) => {
  const sizes = {
    sm: { icon: 'w-4 h-4', text: 'text-base' },
    md: { icon: 'w-6 h-6', text: 'text-xl'  },
    lg: { icon: 'w-8 h-8', text: 'text-3xl' },
  };
  const s = sizes[size];
  return (
    <div className="flex items-center gap-2.5 select-none">
      <Bird className={`${s.icon} text-orange-500 flex-shrink-0`} />
      <span className={`${s.text} font-extrabold logo-gradient font-display`}>
        Polyglotte
      </span>
    </div>
  );
};

export default Logo;
