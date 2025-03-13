const sql = require('mssql');

class SQLQueryBuilder {
    buildConditions(params) {
        const conditions = ['1=1']; // Ensures WHERE clause is always valid
        const inputs = {};

        const addCondition = (key, sqlType, sqlCondition, transform = (v) => v) => {
            if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
                conditions.push(sqlCondition);
                inputs[key] = { type: sqlType, value: transform(params[key]) };
            }
        };

        // ✅ Add explicit conditions only once
        addCondition('sourceCode', sql.Int, 'Code_Source = @sourceCode', Number);
        addCondition('succursale', sql.Int, 'Succursale = @succursale', Number);
        addCondition('refArticle', sql.NVarChar, 'Ref_Article = @refArticle');
        addCondition('description', sql.NVarChar, 'Description LIKE @description', (v) => `%${v}%`);
        addCondition('categorie', sql.NVarChar, 'Categorie = @categorie');
        addCondition('dateMin', sql.DateTime, 'DateDernierMaJ >= @dateMin', (v) => new Date(v));
        addCondition('dateMax', sql.DateTime, 'DateDernierMaJ <= @dateMax', (v) => new Date(v));

        // ✅ Handle dynamic filters (EXCLUDE `succursale`)
        Object.entries(params).forEach(([key, value]) => {
            if (value && !['page', 'pageSize', 'sortField', 'sortOrder', 'succursale', 'sourceCode', 'refArticle', 'description', 'categorie', 'dateMin', 'dateMax'].includes(key)) {
                conditions.push(`${key} = @${key}`);
                inputs[key] = { type: sql.NVarChar, value }; // Adjust type as needed
            }
        });

        return { conditions: conditions.join(' AND '), inputs };
    }


    buildPagination(page, pageSize) {
        const pageNumber = Math.max(0, Number(page) || 0);
        const pageSizeNumber = Math.max(1, Number(pageSize) || 25);

        const startRow = pageNumber * pageSizeNumber + 1;
        const endRow = startRow + pageSizeNumber - 1;

        return { startRow, endRow };
    }

    buildQuery(params) {
        const { conditions, inputs } = this.buildConditions(params);
        const { startRow, endRow } = this.buildPagination(params.page, params.pageSize);

        inputs.startRow = { type: sql.Int, value: startRow };
        inputs.endRow = { type: sql.Int, value: endRow };

        let orderBy = 'DateDernierMaJ DESC'; // Default sorting
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
