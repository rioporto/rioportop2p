import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign } from 'lucide-react';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: { min: number; max: number };
  onChange: (value: { min: number; max: number }) => void;
  step?: number;
  currency?: string;
}

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  min,
  max,
  value,
  onChange,
  step = 100,
  currency = 'R$'
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [activeThumb, setActiveThumb] = useState<'min' | 'max' | null>(null);
  const [showTooltip, setShowTooltip] = useState({ min: false, max: false });
  const sliderRef = useRef<HTMLDivElement>(null);
  const [priceDistribution] = useState([
    { range: [0, 1000], count: 45 },
    { range: [1000, 5000], count: 120 },
    { range: [5000, 10000], count: 80 },
    { range: [10000, 20000], count: 60 },
    { range: [20000, 50000], count: 30 },
    { range: [50000, 100000], count: 15 }
  ]);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  const getPercentage = (val: number) => {
    return ((val - min) / (max - min)) * 100;
  };

  const snapToStep = (val: number) => {
    const steps = Math.round((val - min) / step);
    return Math.min(max, Math.max(min, min + steps * step));
  };

  const handleMouseDown = (thumb: 'min' | 'max') => (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveThumb(thumb);
    setShowTooltip({ ...showTooltip, [thumb]: true });

    const handleMouseMove = (e: MouseEvent) => {
      if (!sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const newValue = min + (percentage / 100) * (max - min);
      const snappedValue = snapToStep(newValue);

      if (thumb === 'min') {
        const newMin = Math.min(snappedValue, localValue.max - step);
        setLocalValue({ ...localValue, min: newMin });
      } else {
        const newMax = Math.max(snappedValue, localValue.min + step);
        setLocalValue({ ...localValue, max: newMax });
      }
    };

    const handleMouseUp = () => {
      setActiveThumb(null);
      setShowTooltip({ ...showTooltip, [thumb]: false });
      onChange(localValue);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleInputChange = (type: 'min' | 'max', inputValue: string) => {
    const numValue = parseInt(inputValue.replace(/\D/g, ''));
    if (isNaN(numValue)) return;

    const snappedValue = snapToStep(numValue);
    
    if (type === 'min') {
      const newMin = Math.min(Math.max(min, snappedValue), localValue.max - step);
      setLocalValue({ ...localValue, min: newMin });
    } else {
      const newMax = Math.max(Math.min(max, snappedValue), localValue.min + step);
      setLocalValue({ ...localValue, max: newMax });
    }
  };

  const handleInputBlur = () => {
    onChange(localValue);
  };

  const maxBarHeight = Math.max(...priceDistribution.map(d => d.count));

  return (
    <div className="space-y-6">
      {/* Price Inputs */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-xs text-gray-400 mb-1 block">Mínimo</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={formatPrice(localValue.min).replace('R$', '').trim()}
              onChange={(e) => handleInputChange('min', e.target.value)}
              onBlur={handleInputBlur}
              className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 
                       rounded-lg text-white focus:border-blue-500 focus:ring-1 
                       focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-400 mb-1 block">Máximo</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={formatPrice(localValue.max).replace('R$', '').trim()}
              onChange={(e) => handleInputChange('max', e.target.value)}
              onBlur={handleInputBlur}
              className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 
                       rounded-lg text-white focus:border-blue-500 focus:ring-1 
                       focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Price Distribution Histogram */}
      <div className="relative h-16 flex items-end gap-0.5">
        {priceDistribution.map((bar, idx) => {
          const barStart = getPercentage(bar.range[0]);
          const barEnd = getPercentage(bar.range[1]);
          const isActive = 
            localValue.min <= bar.range[1] && localValue.max >= bar.range[0];
          
          return (
            <motion.div
              key={idx}
              className="relative flex-1"
              initial={{ height: 0 }}
              animate={{ height: `${(bar.count / maxBarHeight) * 100}%` }}
              transition={{ delay: idx * 0.05, duration: 0.5, ease: 'easeOut' }}
            >
              <div
                className={`w-full h-full rounded-t transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-t from-blue-500/30 to-purple-500/30'
                    : 'bg-gray-700/30'
                }`}
              />
              <div className="absolute -bottom-5 left-0 right-0 text-center">
                <span className="text-[10px] text-gray-500">
                  {idx === 0 && '0'}
                  {idx === priceDistribution.length - 1 && '100k'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Slider */}
      <div className="relative pt-8">
        <div 
          ref={sliderRef}
          className="relative h-2 bg-gray-700 rounded-full overflow-visible"
        >
          {/* Active Range */}
          <motion.div
            className="absolute h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            animate={{
              left: `${getPercentage(localValue.min)}%`,
              right: `${100 - getPercentage(localValue.max)}%`
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />

          {/* Min Thumb */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
            animate={{ left: `${getPercentage(localValue.min)}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onMouseDown={handleMouseDown('min')}
            onMouseEnter={() => setShowTooltip({ ...showTooltip, min: true })}
            onMouseLeave={() => !activeThumb && setShowTooltip({ ...showTooltip, min: false })}
          >
            <motion.div
              className={`w-6 h-6 -ml-3 rounded-full border-2 transition-all ${
                activeThumb === 'min'
                  ? 'bg-blue-500 border-blue-400 scale-125'
                  : 'bg-gray-800 border-blue-500 hover:scale-110'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 1.1 }}
            >
              <div className="absolute inset-1 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full" />
            </motion.div>
            
            {/* Min Tooltip */}
            <AnimatePresence>
              {showTooltip.min && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap"
                >
                  <div className="bg-gray-800 text-white text-sm px-3 py-1.5 rounded-lg 
                                shadow-xl border border-gray-700">
                    {formatPrice(localValue.min)}
                    <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 
                                  w-2 h-2 bg-gray-800 border-r border-b 
                                  border-gray-700 rotate-45" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Max Thumb */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
            animate={{ left: `${getPercentage(localValue.max)}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onMouseDown={handleMouseDown('max')}
            onMouseEnter={() => setShowTooltip({ ...showTooltip, max: true })}
            onMouseLeave={() => !activeThumb && setShowTooltip({ ...showTooltip, max: false })}
          >
            <motion.div
              className={`w-6 h-6 -ml-3 rounded-full border-2 transition-all ${
                activeThumb === 'max'
                  ? 'bg-purple-500 border-purple-400 scale-125'
                  : 'bg-gray-800 border-purple-500 hover:scale-110'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 1.1 }}
            >
              <div className="absolute inset-1 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full" />
            </motion.div>
            
            {/* Max Tooltip */}
            <AnimatePresence>
              {showTooltip.max && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap"
                >
                  <div className="bg-gray-800 text-white text-sm px-3 py-1.5 rounded-lg 
                                shadow-xl border border-gray-700">
                    {formatPrice(localValue.max)}
                    <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 
                                  w-2 h-2 bg-gray-800 border-r border-b 
                                  border-gray-700 rotate-45" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Quick Select Buttons */}
        <div className="flex justify-between mt-6">
          {[
            { label: 'Até 1k', value: { min: 0, max: 1000 } },
            { label: '1k-5k', value: { min: 1000, max: 5000 } },
            { label: '5k-20k', value: { min: 5000, max: 20000 } },
            { label: '20k+', value: { min: 20000, max: 100000 } }
          ].map((preset, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setLocalValue(preset.value);
                onChange(preset.value);
              }}
              className="px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 
                       text-gray-400 hover:text-white rounded-md 
                       transition-all duration-200"
            >
              {preset.label}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PriceRangeSlider;