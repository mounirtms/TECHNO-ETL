DECLARE @d1 AS DATE
SET @d1 = DATEADD(DAY, -7, CAST(GETDATE() AS DATE));

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
