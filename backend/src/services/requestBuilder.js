// Utility class for building Magento API requests
class RequestBuilder {
  static buildSearchParams(params) {
    const { fieldName, searchCriteria, ...otherParams } = params;

    // Ensure fieldName is properly set
    if (!fieldName || fieldName === '%fieldName%') {
      otherParams.fieldName = 'name';
    }

    // Build search criteria if not provided
    const criteria = searchCriteria || {
      filterGroups: [],
      pageSize: 20,
      currentPage: 1,
    };

    // Sanitize filter groups
    if (criteria.filterGroups) {
      criteria.filterGroups = criteria.filterGroups.map(group => ({
        ...group,
        filters: (group.filters || []).map(filter => ({
          ...filter,
          field: filter.field?.replace(/%.*%/g, 'name') || 'name',
        })),
      }));
    }

    return {
      ...otherParams,
      fieldName: fieldName || 'name',
      searchCriteria: criteria,
    };
  }

  static buildDistributionParams(params) {
    const { distribution, ...otherParams } = params;

    // Convert distribution value to integer if needed
    const distributionValue = parseInt(distribution) || 10;

    return {
      ...otherParams,
      distribution: distributionValue,
    };
  }
}

export default RequestBuilder;