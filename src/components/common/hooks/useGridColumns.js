// src/components/common/hooks/useGridColumns.js
import { useState, useEffect, useMemo } from 'react';
import { loadGridSettings, saveGridSettings } from '../../../utils/gridSettings';

/**
 * Custom hook to manage grid columns, including visibility, width, and order.
 * @param {object} props - The props passed to the hook.
 * @param {string} props.gridName - The unique name for the grid to persist settings.
 * @param {Array} props.initialColumns - The initial column definitions.
 * @returns {object} - The state and handlers for the grid columns.
 */
export const useGridColumns = ({ gridName, initialColumns }) => {
    const [columns, setColumns] = useState(initialColumns);
    const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

    useEffect(() => {
        const savedSettings = loadGridSettings(gridName);
        if (savedSettings) {
            const updatedColumns = initialColumns.map(col => ({
                ...col,
                hide: savedSettings[col.field]?.hide ?? col.hide,
                width: savedSettings[col.field]?.width || col.width,
                index: savedSettings[col.field]?.index
            })).sort((a, b) => (a.index ?? Infinity) - (b.index ?? Infinity));
            setColumns(updatedColumns);
        }
    }, [gridName, initialColumns]);

    const handleSettingsSave = async (newSettings) => {
        try {
            const updatedColumns = columns.map(col => ({
                ...col,
                hide: !newSettings[col.field]?.visible,
                width: newSettings[col.field]?.width || col.width,
                index: newSettings[col.field]?.index
            })).sort((a, b) => (a.index || 0) - (b.index || 0));

            setColumns(updatedColumns);
            saveGridSettings(gridName, newSettings);
            setSettingsDialogOpen(false);
        } catch (error) {
            console.error('Error applying column settings:', error);
        }
    };

    const finalColumns = useMemo(() => columns.filter(c => !c.hide), [columns]);

    return {
        columns,
        finalColumns,
        settingsDialogOpen,
        setSettingsDialogOpen,
        handleSettingsSave
    };
};
