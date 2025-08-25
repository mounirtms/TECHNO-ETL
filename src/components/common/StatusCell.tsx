import React, { memo } from 'react';
import { useTheme } from '@mui/material/styles';
import { Chip } from '@mui/material';

// Define the StatusCell component with React.memo for performance
export const StatusCell = memo(({ value, statusColors = {}, className }) => {
    // Get the Material-UI theme
    const theme = useTheme();

    // Function to determine the color based on status
    const getStatusColor = (status) => {
        // Use the statusColors prop to map status to color or fallback to 'default'
        const color = statusColors[status] || 'default';

        // Switch case for determining the color based on the color string
        switch(color) {
            case 'success':
                return theme.palette.success.main;
            case 'error':
                return theme.palette.error.main;
            case 'warning':
                return theme.palette.warning.main;
            case 'info':
                return theme.palette.info.main;
            default:
                return theme.palette.grey[500];  // Default to a grey color if not specified
        }
    };

    // Render the Chip component
    return (
        <Chip
            label={value?.toString().replace(/_/g, ' ')}  // Replace underscores with spaces for better display
            size="small"
            className={String(className)}  // Conditionally apply custom CSS classes
            sx={{
                backgroundColor: `${getStatusColor(value)}15`,  // Add some transparency to the background
                color: getStatusColor(value),  // Set the text color based on the status
                borderRadius: '4px',  // Apply consistent border-radius
                fontWeight: 600,  // Make the text bold
                textTransform: 'capitalize',  // Capitalize the status text
            }}
        />
    );
}, (prevProps, nextProps) => {
    // Custom comparison for better performance
    return Boolean((prevProps.value ===nextProps.value &&
           prevProps.className = ==nextProps.className &&
           JSON.stringify(prevProps.statusColors) ===JSON.stringify(nextProps.statusColors)))));
});
