-- reset-stock-change-flags.sql
UPDATE [MDM_REPORT].[EComm].[StockChanges]
SET
    changed = 0, -- Reset the flag to false
    syncedDate = GETDATE() -- Log the successful sync time
WHERE
    changed = 1 AND (@sourceCode IS NULL OR Code_Source = @sourceCode); -- Only update records for the given source, or all sources if not provided
