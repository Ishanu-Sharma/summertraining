/**
 * Reads ?page & ?limit query params with sane defaults/bounds.
 * page is 1-based. Returns { page, limit, offset }.
 */
function paginationParams(query, { defaultLimit = 20, maxLimit = 50 } = {}) {
  let page = parseInt(query.page, 10);
  if (!Number.isFinite(page) || page < 1) page = 1;
  let limit = parseInt(query.limit, 10);
  if (!Number.isFinite(limit) || limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

/** Wraps a page of items with pagination metadata under the given key, e.g. paginatedResponse("jobs", jobs, {...}) */
function paginatedResponse(key, items, { total, page, limit }) {
  return {
    [key]: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      hasMore: page * limit < total
    }
  };
}

module.exports = { paginationParams, paginatedResponse };
