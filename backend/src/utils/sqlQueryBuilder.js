import sql from 'mssql';

/**
 * A robust builder class for creating and executing dynamic SQL SELECT queries.
 * It supports filtering, sorting, and pagination.
 */
class SQLQueryBuilder {
  getSQLType(value) {
    if (typeof value === 'number' && Number.isInteger(value)) return sql.Int;
    if (typeof value === 'number' && !Number.isInteger(value)) return sql.Float;
    if (typeof value === 'boolean') return sql.Bit;
    if (!isNaN(Date.parse(value))) return sql.DateTime;

    return sql.NVarChar;
  }

  buildWhereClauseFromMagentoFilters(filterGroups, inputs) {
    const conditions = [];

    if (!filterGroups || !Array.isArray(filterGroups)) {
      return '1=1';
    }

    filterGroups.forEach((group, groupIndex) => {
      if (group.filters && Array.isArray(group.filters)) {
        group.filters.forEach((filter, filterIndex) => {
          const key = `${filter.field}_${groupIndex}_${filterIndex}`;
          const value = filter.value;
          let condition = '';

          switch (filter.condition_type || 'eq') {
          case 'eq':
            condition = `${filter.field} = @${key}`;
            break;
          case 'neq':
            condition = `${filter.field} != @${key}`;
            break;
          case 'like':
            condition = `${filter.field} LIKE @${key}`;
            inputs[key] = { type: this.getSQLType(value), value: `%${value}%` };
            break;
          case 'in':
            const inValues = value.split(',');
            const inParams = inValues.map((v, i) => `@${key}_${i}`).join(',');

            condition = `${filter.field} IN (${inParams})`;
            inValues.forEach((v, i) => {
              inputs[`${key}_${i}`] = { type: this.getSQLType(v), value: v };
            });
            break;
          case 'gt':
            condition = `${filter.field} > @${key}`;
            break;
          case 'lt':
            condition = `${filter.field} < @${key}`;
            break;
          case 'gteq':
            condition = `${filter.field} >= @${key}`;
            break;
          case 'lteq':
            condition = `${filter.field} <= @${key}`;
            break;
          default:
            condition = `${filter.field} = @${key}`;
          }

          if (condition && !inputs[key] && filter.condition_type !== 'in') {
            inputs[key] = { type: this.getSQLType(value), value };
          }
          conditions.push(condition);
        });
      }
    });

    return conditions.length > 0 ? conditions.join(' AND ') : '1=1';
  }

  buildConditions(params) {
    const inputs = {};

    // Handle Magento searchCriteria if present
    if (params.searchCriteria) {
      const magentoConditions = this.buildWhereClauseFromMagentoFilters(params.searchCriteria.filter_groups, inputs);

      return { conditions: magentoConditions, inputs };
    }

    // Fallback to original flat-parameter logic
    const conditions = ['1=1'];
    const addCondition = (key, sqlType, sqlCondition, transform = (v) => v) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        conditions.push(sqlCondition);
        inputs[key] = { type: sqlType, value: transform(params[key]) };
      }
    };

    addCondition('sourceCode', sql.Int, 'Code_Source = @sourceCode', Number);
    addCondition('succursale', sql.Int, 'Succursale = @succursale', Number);
    addCondition('Code_MDM', sql.Int, 'Code_MDM = @Code_MDM', Number); // 🔥
    addCondition('TypeProd', sql.NVarChar, 'TypeProd = @TypeProd'); // 🔥
    addCondition('refArticle', sql.NVarChar, 'Ref_Article = @refArticle');
    addCondition('description', sql.NVarChar, 'Description LIKE @description', (v) => `%${v}%`);
    addCondition('categorie', sql.NVarChar, 'Categorie = @categorie');
    addCondition('dateMin', sql.DateTime, 'DateDernierMaJ >= @dateMin', (v) => new Date(v));
    addCondition('dateMax', sql.DateTime, 'DateDernierMaJ <= @dateMax', (v) => new Date(v));

    // Search functionality - search across multiple fields
    if (params.search && params.search.trim()) {
      const searchTerm = `%${params.search.trim()}%`;

      conditions.push(`(
                Code_MDM LIKE @search
                OR Code_JDE LIKE @search
                OR TypeProd LIKE @search
                OR Source LIKE @search
                OR CAST(Code_MDM AS NVARCHAR) LIKE @search
            )`);
      inputs.search = { type: sql.NVarChar, value: searchTerm };
    }

    if (params.changed ) {
      conditions.push('changed = 1');
    }

    return { conditions: conditions.join(' AND '), inputs };
  }

  buildPagination(page, pageSize) {
    const pageNumber = Math.max(0, Number(page) || 0);
    const pageSizeNumber = Math.max(1, Number(pageSize) || 25);

    return { startRow: pageNumber * pageSizeNumber + 1, endRow: (pageNumber + 1) * pageSizeNumber };
  }

  buildQuery(params) {
    const { conditions, inputs } = this.buildConditions(params);
    let page, pageSize, orderBy;

    // Handle Magento searchCriteria for pagination and sorting
    if (params.searchCriteria) {
      page = params.searchCriteria.currentPage ? parseInt(params.searchCriteria.currentPage, 10) - 1 : 0;
      pageSize = params.searchCriteria.pageSize ? parseInt(params.searchCriteria.pageSize, 10) : 25;

      if (params.searchCriteria.sortOrders && params.searchCriteria.sortOrders.length > 0) {
        const sortOrder = params.searchCriteria.sortOrders[0];

        orderBy = `${sortOrder.field} ${sortOrder.direction.toUpperCase()}`;
      } else {
        orderBy = 'DateDernierMaJ DESC';
      }
    } else {
      // Fallback to original logic
      page = params.page ? parseInt(params.page) : 0;
      pageSize = params.pageSize ? parseInt(params.pageSize) : 25;
      orderBy = params.sortField ? `${params.sortField} ${params.sortOrder === 'desc' ? 'DESC' : 'ASC'}` : 'DateDernierMaJ DESC';
    }

    const { startRow, endRow } = this.buildPagination(page, pageSize);

    inputs.startRow = { type: sql.Int, value: startRow };
    inputs.endRow = { type: sql.Int, value: endRow };

    const sqlQuery = `
            WITH OrderedResults AS (
                SELECT *, COUNT(*) OVER() AS TotalCount,
                       ROW_NUMBER() OVER (ORDER BY ${orderBy}) AS RowNum
                FROM [MDM_REPORT].[EComm].[StockChanges]
                WHERE ${conditions}
            )
            SELECT * FROM OrderedResults
            WHERE RowNum BETWEEN @startRow AND @endRow;
        `;

    return { query: sqlQuery.trim(), inputs };
  }
}

const sqlQueryBuilder = new SQLQueryBuilder();

export default sqlQueryBuilder;
