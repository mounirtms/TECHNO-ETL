SELECT *
FROM [MDM_REPORT].[EComm].[StockChanges]
WHERE   Code_Source = 20 AND Code_MDM =1140631178

SELECT *
FROM [MDM_REPORT].[EComm].[ApprovisionnementProduits]
WHERE   Code_Source = 20 AND Code_MDM =1140631178

ALTER TABLE [MDM_REPORT].[EComm].[StockChanges]
ADD changed BIT NOT NULL DEFAULT 0;
GO

-- Add the 'syncedDate' column to log when a record was last successfully synced to Magento.
ALTER TABLE [MDM_REPORT].[EComm].[StockChanges]
ADD syncedDate DATETIME NULL;
GO


