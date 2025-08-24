// Modern UI Components - Tailwind CSS replacements for MUI components
export { Box } from './Box';
export { Typography } from './Typography';
export { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogActions, 
  DialogTrigger 
} from './Dialog';
export { 
  Select, 
  SelectTrigger, 
  SelectContent, 
  SelectItem, 
  SelectValue,
  MenuItem // MUI compatibility
} from './Select';
export { 
  TextField, 
  FormControl, 
  InputLabel, 
  FormHelperText 
} from './TextField';
export { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent,
  Tab, // MUI compatibility
  TabPanel // MUI compatibility
} from './Tabs';

// Re-export existing optimized components
export { OptimizedButton as Button } from '../OptimizedButton';
export { Input } from '../Input';
export { Card } from '../Card';
export { Icon, IconButton, StatusIcon } from '../Icon';

// Layout components
export { default as ModernLayout } from '../../Layout/ModernLayout';
export { default as ModernHeader } from '../../Layout/ModernHeader';
export { default as ModernSidebar } from '../../Layout/ModernSidebar';
export { default as ModernUserMenu } from '../../Layout/ModernUserMenu';
