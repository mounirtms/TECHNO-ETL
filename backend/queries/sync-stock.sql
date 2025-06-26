-- This query synchronizes stock from the source table to the target table.
-- It handles both new products (INSERT) and existing products (UPDATE).

-- IMPORTANT: Ensure 'CodeArticle' is the correct name of your product identifier
-- column (e.g., SKU, Code_MDM, etc.) in both tables.

MERGE [MDM_REPORT].[EComm].[StockSourcesProduits] AS Target
USING (
    SELECT
        CodeArticle,
        QteStock,
        DateDernierMaJ
    FROM
        [MDM_REPORT].[EComm].[ApprovisionnementProduits]
    WHERE
        -- This condition selects records updated since the beginning of the current day.
        -- Adjust this if your update schedule is different.
        DateDernierMaJ >= CAST(GETDATE() AS DATE)
) AS Source
ON (Target.CodeArticle = Source.CodeArticle)
WHEN MATCHED THEN
    -- If the product SKU exists, update its stock quantity and last update date.
    UPDATE SET Target.QteStock = Source.QteStock, Target.DateDernierMaJ = Source.DateDernierMaJ
WHEN NOT MATCHED BY TARGET THEN
    -- If the product SKU is new, insert it into the target table.
    INSERT (CodeArticle, QteStock, DateDernierMaJ) VALUES (Source.CodeArticle, Source.QteStock, Source.DateDernierMaJ);
