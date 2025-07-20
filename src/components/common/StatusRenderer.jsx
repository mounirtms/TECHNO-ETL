import React, { memo } from 'react';
import './StatusRenderer.css';

// Memoized status mapping for better performance
const statusMap = {
    'processing': 'inProgress',
    'Commande_a_livrer': 'inProgress',
    'pending': 'pending',
    'Commande_a_recuperer': 'pending',
    'completed': 'delivered',
    'canceled': 'canceled',
    'closed': 'closed',
    'fraud': 'fraud',
    'Conf_CMD_1': 'confirmationPending',
    'Commande_en_livraison_prestataire': 'deliveryInProgress',
    'Livraison_Confirmee': 'deliveryConfirmed',
    'CMD_Done': 'orderCompleted'
};

// Optimized StatusRenderer with React.memo
const StatusRenderer = memo(({ value }) => {
    const statusClass = statusMap[value] || 'unknown';

    return (
        <div className={`status ${statusClass}`}>
            {value?.replace(/_/g, ' ')}
        </div>
    );
}, (prevProps, nextProps) => {
    // Only re-render if value actually changed
    return prevProps.value === nextProps.value;
});

StatusRenderer.displayName = 'StatusRenderer';

export default StatusRenderer;
