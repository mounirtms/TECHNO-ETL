-- sync-stock.sql

-- NOTE: Ensure the [MDM_REPORT].[EComm].[StockChanges] table has a 'changed' column of type BIT.
-- You can add it with a command like:
-- ALTER TABLE [MDM_REPORT].[EComm].[StockChanges] ADD changed BIT NOT NULL DEFAULT 0;

MERGE [MDM_REPORT].[EComm].[StockChanges] AS Target
USING (
    SELECT
        Code_MDM,
        QteStock,
        DateDernierMaJ,
        Code_Source
    FROM
        [MDM_REPORT].[EComm].[ApprovisionnementProduits]
) AS Source
ON (Target.Code_MDM = Source.Code_MDM AND Target.Code_Source = Source.Code_Source)

-- Update the record if it exists and the stock quantity has changed.
-- The `NOT EXISTS...INTERSECT` clause is a robust way to compare values, as it correctly handles NULLs.
WHEN MATCHED AND NOT EXISTS (SELECT Target.QteStock INTERSECT SELECT Source.QteStock) THEN
    UPDATE SET
        Target.QteStock = Source.QteStock,
        Target.DateDernierMaJ = Source.DateDernierMaJ,
        Target.changed = 1 -- Mark record as changed

-- Insert a new record if it doesn't exist in the target table.
WHEN NOT MATCHED BY TARGET THEN
    INSERT (Code_MDM, QteStock, DateDernierMaJ, Code_Source, changed)
    VALUES (Source.Code_MDM, Source.QteStock, Source.DateDernierMaJ, Source.Code_Source, 1); -- Mark new record as changed