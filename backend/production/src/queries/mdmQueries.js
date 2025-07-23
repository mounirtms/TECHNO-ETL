/**
 * MDM Database Queries
 * Professional SQL query management for MDM operations
 * 
 * @author Techno-ETL Team
 * @version 1.0.0
 */

/**
 * Get updated prices from MDM system
 * Retrieves product prices that have been modified within the specified number of days
 * 
 * @param {number} days - Number of days to look back for price changes (default: 7)
 * @returns {Array} Array of products with SKU and price
 */
export const GET_UPDATED_PRICES = `
DECLARE @d1 AS DATE
SET @d1 = DATEADD(DAY, -?, CAST(GETDATE() AS DATE));

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
ORDER BY 
    PE.Code_MDM;
`;

/**
 * Get inventory data with stock levels and product information
 * Retrieves comprehensive inventory data including stock quantities, sources, and product details
 * 
 * @param {Object} filters - Filter parameters (source, branch, etc.)
 * @returns {Array} Array of inventory records
 */
export const GET_INVENTORY_DATA = `
SELECT 
    Code_MDM,
    Code_JDE,
    Code_Fil_JDE,
    TypeProd,
    Source,
    Succursale,
    QteStock,
    Tarif,
    QteReceptionner,
    VenteMoyen,
    DateDernierMaJ,
    CASE WHEN DateDernierMaJ > DATEADD(DAY, -7, GETDATE()) THEN 1 ELSE 0 END as changed
FROM MDM_REPORT.dbo.Stock_Filiales_TMS
WHERE 1=1
    AND (@sourceFilter IS NULL OR Source = @sourceFilter)
    AND (@succursaleFilter IS NULL OR Succursale = @succursaleFilter)
    AND (@showChangedOnly = 0 OR DateDernierMaJ > DATEADD(DAY, -7, GETDATE()))
ORDER BY DateDernierMaJ DESC, Code_MDM;
`;

/**
 * Sync stock levels to external systems
 * Updates stock quantities for products in the synchronization process
 */
export const SYNC_STOCK_LEVELS = `
UPDATE Stock_Filiales_TMS 
SET 
    QteStock = ?,
    DateDernierMaJ = GETDATE()
WHERE Code_MDM = ? AND Succursale = ?;
`;

/**
 * Mark synchronization as successful
 * Records successful sync operations for audit and tracking
 */
export const MARK_SYNC_SUCCESS = `
INSERT INTO Sync_Log (
    Code_MDM,
    Succursale,
    SyncType,
    SyncStatus,
    SyncDate,
    Details
) VALUES (?, ?, ?, 'SUCCESS', GETDATE(), ?);
`;

/**
 * Get product details by SKU
 * Retrieves detailed product information for a specific SKU
 * 
 * @param {string} sku - Product SKU to lookup
 * @returns {Object} Product details
 */
export const GET_PRODUCT_BY_SKU = `
SELECT 
    Code_MDM,
    Code_JDE,
    Code_Fil_JDE,
    TypeProd,
    Source,
    Succursale,
    QteStock,
    Tarif,
    QteReceptionner,
    VenteMoyen,
    DateDernierMaJ
FROM MDM_REPORT.dbo.Stock_Filiales_TMS
WHERE Code_MDM = ?;
`;

/**
 * Get low stock products
 * Identifies products with stock levels below the specified threshold
 * 
 * @param {number} threshold - Minimum stock threshold (default: 10)
 * @returns {Array} Array of low stock products
 */
export const GET_LOW_STOCK_PRODUCTS = `
SELECT 
    Code_MDM,
    Source,
    Succursale,
    QteStock,
    VenteMoyen,
    DateDernierMaJ
FROM MDM_REPORT.dbo.Stock_Filiales_TMS
WHERE QteStock < ? AND QteStock > 0
ORDER BY QteStock ASC, VenteMoyen DESC;
`;

/**
 * Get out of stock products
 * Retrieves products that are completely out of stock
 * 
 * @returns {Array} Array of out of stock products
 */
export const GET_OUT_OF_STOCK_PRODUCTS = `
SELECT 
    Code_MDM,
    Source,
    Succursale,
    DateDernierMaJ
FROM MDM_REPORT.dbo.Stock_Filiales_TMS
WHERE QteStock = 0
ORDER BY DateDernierMaJ DESC;
`;

/**
 * Get inventory statistics
 * Provides summary statistics for inventory management
 * 
 * @returns {Object} Inventory statistics
 */
export const GET_INVENTORY_STATS = `
SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN QteStock > 0 THEN 1 ELSE 0 END) as inStock,
    SUM(CASE WHEN QteStock = 0 THEN 1 ELSE 0 END) as outOfStock,
    SUM(CASE WHEN QteStock > 0 AND QteStock < 10 THEN 1 ELSE 0 END) as lowStock,
    SUM(CASE WHEN DateDernierMaJ > DATEADD(DAY, -7, GETDATE()) THEN 1 ELSE 0 END) as newChanges,
    AVG(CAST(Tarif AS FLOAT)) as averagePrice,
    SUM(CAST(QteStock AS BIGINT) * CAST(Tarif AS FLOAT)) as totalValue
FROM MDM_REPORT.dbo.Stock_Filiales_TMS
WHERE Tarif IS NOT NULL AND Tarif > 0;
`;
