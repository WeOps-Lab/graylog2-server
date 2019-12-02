import { Map, List } from 'immutable';
import { mapValues, get, compact } from 'lodash';
import QueryResult from './QueryResult';
import SearchError from './SearchError';

class SearchResult {
  constructor(result) {
    this._result = new Map(result);

    this._results = new Map(mapValues(result.results, queryResult => new QueryResult(queryResult)));
    this._errors = new List(get(result, 'errors', []).map(error => new SearchError(error)));
  }

  get result() {
    return this._result.toJS();
  }

  get results() {
    return this._results.toJS();
  }

  get errors() {
    return this._errors.toJS();
  }

  forId(queryId) {
    return this.results[queryId];
  }

  updateSearchTypes(searchTypeResults) {
    const updatedResult = this.result;
    searchTypeResults.forEach((searchTypeResult) => {
      const searchQuery = this._getQueryBySearchTypeId(searchTypeResult.id);
      updatedResult.results[searchQuery.query.id].search_types[searchTypeResult.id] = searchTypeResult;
    });
    return new SearchResult(updatedResult);
  }

  getSearchTypesFromResponse(searchTypeIds) {
    const searchTypes = searchTypeIds.map((searchTypeId) => {
      const relatedQuery = this._getQueryBySearchTypeId(searchTypeId);
      return SearchResult._getSearchTypeFromQuery(relatedQuery, searchTypeId);
    });
    return compact(searchTypes);
  }

  _getQueryBySearchTypeId(searchTypeId) {
    return Object.values(this.result.results).find(query => SearchResult._getSearchTypeFromQuery(query, searchTypeId));
  }

  static _getSearchTypeFromQuery(query, searchTypeId) {
    return (query && query.search_types) ? query.search_types[searchTypeId] : undefined;
  }
}

export default SearchResult;
