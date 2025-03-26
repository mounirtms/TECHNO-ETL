const sql = require('mssql');

class SQLQueryBuilder {
    getSQLType(value) {
        if (typeof value === 'number' && Number.isInteger(value)) return sql.Int;
        if (typeof value === 'number' && !Number.isInteger(value)) return sql.Float;
        if (typeof value === 'boolean') return sql.Bit;
        if (!isNaN(Date.parse(value))) return sql.DateTime;
        return sql.NVarChar;
    }

    buildConditions(params) {
       // console.log("🔍 Received Params:", params); // Check what params are received

        const conditions = ['1=1']; // Ensures WHERE clause is always valid
        const inputs = {};

        const addCondition = (key, sqlType, sqlCondition, transform = (v) => v) => {
            //console.log(`🔎 Checking param: ${key} ->`, params[key]); // Debug each key

            if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
                conditions.push(sqlCondition);
                inputs[key] = { type: sqlType, value: transform(params[key]) };
                //console.log(`✅ Added condition: ${sqlCondition} with value:`, transform(params[key]));
            } else {
               // console.log(`⚠️ Skipped condition: ${key}, value was:`, params[key]);
            }
        };

        // ✅ Explicit conditions
        addCondition('sourceCode', sql.Int, 'Code_Source = @sourceCode', Number);
        addCondition('succursale', sql.Int, 'Succursale = @succursale', Number);
        addCondition('Code_MDM', sql.Int, 'Code_MDM = @Code_MDM', Number); // 🔥  
        addCondition('TypeProd', sql.NVarChar, 'TypeProd = @TypeProd'); // 🔥 
        addCondition('refArticle', sql.NVarChar, 'Ref_Article = @refArticle');
        addCondition('description', sql.NVarChar, 'Description LIKE @description', (v) => `%${v}%`);
        addCondition('categorie', sql.NVarChar, 'Categorie = @categorie');
        addCondition('dateMin', sql.DateTime, 'DateDernierMaJ >= @dateMin', (v) => new Date(v));
        addCondition('dateMax', sql.DateTime, 'DateDernierMaJ <= @dateMax', (v) => new Date(v));

       // console.log("🛠 Final Conditions:", conditions.join(' AND '));
       // console.log("📥 Input Parameters:", inputs);

        return { conditions: conditions.join(' AND '), inputs };
    }

    buildPagination(page, pageSize) {
        const pageNumber = Math.max(0, Number(page) || 0);
        const pageSizeNumber = Math.max(1, Number(pageSize) || 25);
        return { startRow: pageNumber * pageSizeNumber + 1, endRow: (pageNumber + 1) * pageSizeNumber };
    }

    buildQuery(params) {
        const { conditions, inputs } = this.buildConditions(params);
        const page = params.page ? parseInt(params.page) : 0;
        const pageSize = params.pageSize ? parseInt(params.pageSize) : 25;
        const { startRow, endRow } = this.buildPagination(page, pageSize);

        inputs.startRow = { type: sql.Int, value: startRow };
        inputs.endRow = { type: sql.Int, value: endRow };

        let orderBy = 'DateDernierMaJ DESC';
        if (params.sortField) {
            orderBy = `${params.sortField} ${params.sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
        }
  
        
        const sqlQuery = `
            WITH OrderedResults AS (
                SELECT *, COUNT(*) OVER() AS TotalCount,
                       ROW_NUMBER() OVER (ORDER BY ${orderBy}) AS RowNum
                FROM [MDM_REPORT].[EComm].[ApprovisionnementProduits]
                WHERE ${conditions}
            )
            SELECT * FROM OrderedResults
            WHERE RowNum BETWEEN @startRow AND @endRow;
        `;

        return { query: sqlQuery.trim(), inputs };
    }
}

const sqlQueryBuilder = new SQLQueryBuilder();
module.exports = sqlQueryBuilder;
