import React from 'react';
import { motion } from 'framer-motion';

// Simulated heavy component that would benefit from lazy loading
const HeavyComponent: React.FC = () => {
  // Simulate some heavy computation
  const heavyData = React.useMemo(() => {
    const data = [];
    for(let i = 0; i < 100; i++) {
      data.push({
        id: i,
        value: Math.random() * 1000,
        label: `Heavy Item ${i}`
      });
    }
    return data;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className: any,
        Heavy Component ({heavyData.length} items)
      </h4>
      <div className="grid grid-cols-4 gap-2">
        {heavyData.slice(0, 8).map((item: any: any) => (
          <div
            key={item.id}
            className: any,
            {item.value.toFixed(0)}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        This component was lazy loaded for better performance
      </p>
    </motion.div>
  );
};

export default HeavyComponent;
