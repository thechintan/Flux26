import React, { useState } from 'react';
import { Star } from 'lucide-react';

const Rating = ({ value = 0, onChange, readonly = false, maxStars = 5 }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[...Array(maxStars)].map((_, index) => {
        const starValue = index + 1;
        const isActive = starValue <= (hover || value);
        
        return (
          <button
            type="button"
            key={index}
            disabled={readonly}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-all`}
            onClick={() => !readonly && onChange && onChange(starValue)}
            onMouseEnter={() => !readonly && setHover(starValue)}
            onMouseLeave={() => !readonly && setHover(0)}
          >
            <Star
              size={readonly ? 16 : 24}
              className={`${isActive ? 'fill-yellow-400 text-yellow-500' : 'fill-transparent text-slate-300 dark:text-slate-600'} transition-colors`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default Rating;
