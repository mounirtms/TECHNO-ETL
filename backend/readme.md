 SELECT     PE.Code_MDM , PE.Sku_Conf,
            P.Designation_Francais_Produit,
            T.Tarif,PE.TypeProd,PE.TypeConfHomog,T.DateModif,T.DateDebut
            FROM Produits_ECommerce AS PE
            INNER JOIN Tarif AS T ON        
                 PE.Code_MDM = T.Code_MDM 
            INNER JOIN  [MDM360].[dbo].[Produit] AS P ON        
                 PE.Code_MDM = P.code_produit
            WHERE
                PE.active=1 AND T.Code_TarifType=9 
                --AND PE.Sku_Conf = 111826612
                AND (CASE WHEN PE.TypeProd='C' AND PE.TypeConfHomog=1 THEN PE.Sku_Conf ELSE PE.Code_MDM END) IN (SELECT Code_MDM FROM Produits_ECommerce WHERE PE.Sku_Conf=T.Code_MDM)
                AND T.DateModif >= DATEADD(DAY, -14, GETDATE())
          
                ORDER BY PE.Sku_Conf ,  PE.TypeConfHomog DESC


https://github.com/WebDevSimplified/JWT-Authentication 
https://github.com/debugmodedotnet/sqlservernodejsrestapi
create token 
require('crypto').randomBytes(64).toString('hex') 