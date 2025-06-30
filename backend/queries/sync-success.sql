-- reset-stock-change-flags.sql
UPDATE [MDM_REPORT].[EComm].[StockChanges]
SET
    changed = 0, -- Reset the flag to false
    syncedDate = GETDATE() -- Log the successful sync time
WHERE
    changed = 1; -- Only update the records we just processed
