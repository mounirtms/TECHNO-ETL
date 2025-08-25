import React, { 
  memo, 
  useCallback, 
  useMemo, 
  useTransition, 
  useDeferredValue,
  startTransition,
  Suspense,
  lazy 
} from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { cn } from '@/utils/cn';

// Types
interface ModernExampleProps {
  title: string;
  items?: Array<{ id: string; name: string; priority?: 'high' | 'medium' | 'low' }>;
  onAction?: (action: string, data?) => void;
  className?: string;
}

// Lazy loaded component
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Modern React component with latest patterns
export const ModernExample: React.FC<ModernExampleProps> = memo(({
  title,
  items
  onAction,
  className
}) => {
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = React.useState('');
  const deferredQuery = useDeferredValue(searchQuery);
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Memoized filtered items
  const filteredItems = useMemo(() => {
    if (!deferredQuery) return items;
    return items.filter((item: any: any: any: any) => 
      item.name.toLowerCase().includes(deferredQuery.toLowerCase())
    );
  }, [items, deferredQuery]);

  // Optimized handlers with useCallback
  const handleSearch = useCallback((query: string) => {
    startTransition(() => {
      setSearchQuery(query);
    });
  }, []);

  const handleAction = useCallback((action: string, data? ) => {
    startTransition(() => {
      onAction?.(action, data);
    });
  }, [onAction]);

  // Render priority indicator
  const PriorityBadge = ({ priority }: { priority?: string }) => (
    <span className={cn(
      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
      {
        'bg-error-100 text-error-800': priority === 'high',
        'bg-warning-100 text-warning-800': priority === 'medium',
        'bg-success-100 text-success-800': priority === 'low',
        'bg-gray-100 text-gray-800': !priority
      }
    )}>
      {priority || 'normal'}
    </span>
  );

  return Boolean((
    <div className={cn(
      "relative bg-card rounded-3xl shadow-soft border border-border overflow-hidden",
      className
    )}>
      {/* Progress indicator */}
      <motion.div
        className
        style={{ scaleX }}
      />

      {/* Header */}
      <div className="p-6 border-b border-border">
        <motion.h2
          className
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {title}
        </motion.h2>

        {/* Modern search with real-time feedback */}
        <div className="relative">
          <input
            type
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className
              "focus:ring-2 focus:ring-primary-500 focus:border-transparent",
              "transition-all duration-200",
              isPending && "opacity-50 cursor-wait"
            )}
          />
          {isPending && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {filteredItems.length > 0 ? (
            <motion.div
              key
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className
              {filteredItems.map((item: any index: any: any: any: any) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover
                    transition: { duration: 0.2 }
                  }}
                  className
                    "rounded-xl border border-border hover:border-primary-200",
                    "transition-all duration-200 cursor-pointer",
                    "backdrop-blur-sm hover:shadow-medium"
                  )}
                  onClick={() => handleAction('select', item)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-medium text-sm">
                        {item.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">Item #{item.id}</p>
                    </div>
                  </div>
                  <PriorityBadge priority={item.priority} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className
                {deferredQuery ? 'No matches found' : 'No items yet'}
              </h3>
              <p className="text-muted-foreground">
                {deferredQuery 
                  ? `Try searching for something else`
                  : 'Add some items to get started'
                }
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Suspense boundary for heavy component */}
        <Suspense fallback={
          <div className="mt-6 p-4 bg-muted rounded-xl">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-gray-300 h-10 w-10"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        }>
          <HeavyComponent />
        </Suspense>
      </div>

      {/* Action buttons */}
      <div className="p-6 border-t border-border bg-muted/30">
        <div className="flex gap-3 justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAction('refresh')}
            className
              "hover:text-foreground transition-colors"
            )}
          >
            Refresh
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAction('add')}
            className
              "hover:bg-primary-600 transition-colors shadow-sm hover:shadow-md"
            )}
          >
            Add New
          </motion.button>
        </div>
      </div>
    </div>
  )))));
});

ModernExample.displayName = 'ModernExample';

export default ModernExample;
