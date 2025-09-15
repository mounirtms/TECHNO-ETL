/**
 * SQL Queries used in the application
 * These are stored as constants to avoid file system operations at runtime


-- sync-stock.sql

-- NOTE: Ensure the [MDM_REPORT].[EComm].[StockChanges] table has a 'changed' column of type BIT.
-- You can add it with a command like:
-- ALTER TABLE [MDM_REPORT].[EComm].[StockChanges] ADD changed BIT NOT NULL DEFAULT 0;


-- sync-stock.sql

-- NOTE: Ensure the [MDM_REPORT].[EComm].[StockChanges] table has a 'changed' column of type BIT.
-- You can add it with a command like:
-- ALTER TABLE [MDM_REPORT].[EComm].[StockChanges] ADD changed BIT NOT NULL DEFAULT 0;


WITH DedupedSource AS (
    SELECT
        Code_MDM,
        QteStock,
        DateDernierMaJ,
        Code_Source,
        Source, -- Added the 'Source' column from the source table
        ROW_NUMBER() OVER (PARTITION BY Code_MDM, Code_Source ORDER BY DateDernierMaJ DESC) AS rn
    FROM [MDM_REPORT].[EComm].[ApprovisionnementProduits]

)
MERGE [MDM_REPORT].[EComm].[StockChanges] AS Target
USING (
    SELECT Code_MDM, QteStock, DateDernierMaJ, Code_Source, Source -- Pass the 'Source' column through
    FROM DedupedSource
    WHERE rn = 1
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
    -- FIX: Added the 'Source' column to the INSERT list and VALUES
    INSERT (Code_MDM, QteStock, DateDernierMaJ, Code_Source, Source, changed)
    VALUES (Source.Code_MDM, Source.QteStock, Source.DateDernierMaJ, Source.Code_Source, Source.Source, 1); -- Mark new record as changed
*/

export const SQL_QUERIES = {
  PRICES: `
        DECLARE @d1 AS DATE
        SET @d1 = DATEADD(DAY, -22, CAST(GETDATE() AS DATE));

        SELECT 
            PE.Code_MDM AS sku, 
            CASE 
                WHEN FLOOR(CASE 
                        WHEN PE.TypeProd = 'V' AND PEC.TypeConfHomog = 1 THEN ECC.Tarif 
                        ELSE EC.Tarif 
                    END) = CASE 
                        WHEN PE.TypeProd = 'V' AND PEC.TypeConfHomog = 1 THEN ECC.Tarif 
                        ELSE EC.Tarif 
                    END 
                THEN CAST(FLOOR(CASE 
                        WHEN PE.TypeProd = 'V' AND PEC.TypeConfHomog = 1 THEN ECC.Tarif 
                        ELSE EC.Tarif 
                    END) AS VARCHAR)
                ELSE CAST(CASE 
                        WHEN PE.TypeProd = 'V' AND PEC.TypeConfHomog = 1 THEN ECC.Tarif 
                        ELSE EC.Tarif 
                    END AS VARCHAR)
            END AS price  
        FROM MDM_REPORT.dbo.Produits_ECommerce AS PE
        LEFT OUTER JOIN MDM_REPORT.dbo.Produits_ECommerce AS PEC 
            ON PEC.TypeProd = 'C' AND PEC.Code_MDM = PE.Sku_Conf
        LEFT OUTER JOIN (
            -- Tarif E-Commerce
            SELECT 
                T.Code_MDM, 
                T.Tarif, 
                T.DateModif 
            FROM MDM_REPORT.dbo.Tarif AS T 
            JOIN MDM_REPORT.dbo.Tarif AS T2 
                ON T2.Code_Tarif = T.Code_TarifRef 
                AND T2.Code_JDE = T.Code_JDE 
                AND T2.Code_TarifType = 0 
            WHERE T.Code_TarifType = 9 
                AND GETDATE() BETWEEN T.DateDebut AND T.DateFin

            UNION ALL

            SELECT 
                T.Code_MDM, 
                T.Tarif, 
                T.DateModif 
            FROM MDM_REPORT.dbo.Tarif AS T 
            LEFT OUTER JOIN MDM_REPORT.dbo.Tarif AS T2 
                ON T2.Code_JDE = T.Code_JDE 
                AND T2.Code_TarifType = 0 
                AND GETDATE() BETWEEN T2.DateDebut AND T2.DateFin 
            WHERE T.Code_TarifType = 9 
                AND T.Code_Tarif = T.Code_TarifRef 
                AND GETDATE() BETWEEN T.DateDebut AND T.DateFin
        ) AS EC ON EC.Code_MDM = PE.Code_MDM
        LEFT OUTER JOIN (
            SELECT 
                T.Code_MDM, 
                T.Tarif, 
                T.DateModif 
            FROM MDM_REPORT.dbo.Tarif AS T 
            JOIN MDM_REPORT.dbo.Tarif AS T2 
                ON T2.Code_Tarif = T.Code_TarifRef 
                AND T2.Code_JDE = T.Code_JDE 
                AND T2.Code_TarifType = 0 
            WHERE T.Code_TarifType = 9 
                AND GETDATE() BETWEEN T.DateDebut AND T.DateFin

            UNION ALL

            SELECT 
                T.Code_MDM, 
                T.Tarif, 
                T.DateModif 
            FROM MDM_REPORT.dbo.Tarif AS T 
            LEFT OUTER JOIN MDM_REPORT.dbo.Tarif AS T2 
                ON T2.Code_JDE = T.Code_JDE 
                AND T2.Code_TarifType = 0 
                AND GETDATE() BETWEEN T2.DateDebut AND T2.DateFin 
            WHERE T.Code_TarifType = 9 
                AND T.Code_Tarif = T.Code_TarifRef 
                AND GETDATE() BETWEEN T.DateDebut AND T.DateFin
        ) AS ECC ON ECC.Code_MDM = PE.Sku_Conf
        WHERE 
            PE.TypeProd IN ('S', 'V') 
            AND CASE 
                WHEN PE.TypeProd = 'V' AND PEC.TypeConfHomog = 1 THEN ECC.Tarif 
                ELSE EC.Tarif 
            END IS NOT NULL 
            AND (
                CASE 
                    WHEN PE.TypeProd = 'V' AND PEC.TypeConfHomog = 1 THEN ECC.DateModif 
                    ELSE EC.DateModif 
                END >= @D1 
                OR PE.DateCreation >= @D1
            )
        GROUP BY 
            PE.Code_MDM, 
            CASE 
                WHEN PE.TypeProd = 'V' AND PEC.TypeConfHomog = 1 THEN ECC.Tarif 
                ELSE EC.Tarif 
            END
    `,

  SYNC_STOCK: `
        WITH DedupedSource AS (
            SELECT
                Code_MDM,
                QteStock,
                Source,
                DateDernierMaJ,
                Code_Source,
                ROW_NUMBER() OVER (PARTITION BY Code_MDM, Code_Source ORDER BY DateDernierMaJ DESC) AS rn
            FROM [MDM_REPORT].[EComm].[ApprovisionnementProduits]
            WHERE (@sourceCode IS NULL OR Code_Source = @sourceCode)
        )
        MERGE [MDM_REPORT].[EComm].[StockChanges] AS Target
        USING (
            SELECT Code_MDM, QteStock, DateDernierMaJ, Code_Source,Source
            FROM DedupedSource
            WHERE rn = 1
        ) AS Source
        ON (Target.Code_MDM = Source.Code_MDM AND Target.Code_Source = Source.Code_Source AND Target.Source = Source.Source)

        WHEN MATCHED AND NOT EXISTS (SELECT Target.QteStock INTERSECT SELECT Source.QteStock) THEN
            UPDATE SET
                Target.QteStock = Source.QteStock,
                Target.DateDernierMaJ = Source.DateDernierMaJ,
               
                Target.changed = 1

        WHEN NOT MATCHED BY TARGET THEN
            INSERT (Code_MDM, QteStock, DateDernierMaJ, Code_Source,Source ,changed)
            VALUES (Source.Code_MDM, Source.QteStock, Source.DateDernierMaJ, Source.Code_Source,Source.Source, 1);
    `,

  SYNC_SUCCESS: `
        UPDATE [MDM_REPORT].[EComm].[StockChanges]
        SET
            changed = 0,
            syncedDate = GETDATE()
        WHERE
            changed = 1 AND (@sourceCode IS NULL OR Code_Source = @sourceCode);
    `,

  SELECT_STOCK_CHANGES: `
        SELECT TOP 1000 *
        FROM [MDM_REPORT].[EComm].[StockChanges]
        WHERE 
            changed = 1
            AND (@sourceCode IS NULL OR Code_Source = @sourceCode)
        ORDER BY 
            DateDernierMaJ DESC;
    `,
};

export default SQL_QUERIES;
