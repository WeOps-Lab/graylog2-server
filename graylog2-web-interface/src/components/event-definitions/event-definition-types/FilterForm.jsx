/*
 * Copyright (C) 2020 Graylog, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Server Side Public License, version 1,
 * as published by MongoDB, Inc.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Server Side Public License for more details.
 *
 * You should have received a copy of the Server Side Public License
 * along with this program. If not, see
 * <http://www.mongodb.com/licensing/server-side-public-license>.
 */
import React from 'react';
import PropTypes from 'prop-types';
import lodash from 'lodash';
import uuid from 'uuid/v4';
import moment from 'moment';
moment.locale('zh-cn');
import { MultiSelect, TimeUnitInput } from 'components/common';
import connect from 'stores/connect';
import Query from 'views/logic/queries/Query';
import Search from 'views/logic/search/Search';
import { extractDurationAndUnit } from 'components/common/TimeUnitInput';
import { Alert, ButtonToolbar, ControlLabel, FormGroup, HelpBlock, Input } from 'components/bootstrap';
import { naturalSortIgnoreCase } from 'util/SortUtils';
import * as FormsUtils from 'util/FormsUtils';
import { SearchMetadataActions } from 'views/stores/SearchMetadataStore';
import { isPermitted } from 'util/PermissionsMixin';
import LookupTableParameter from 'views/logic/parameters/LookupTableParameter';
import { LookupTablesActions, LookupTablesStore } from 'stores/lookup-tables/LookupTablesStore';

import EditQueryParameterModal from '../event-definition-form/EditQueryParameterModal';
import commonStyles from '../common/commonStyles.css';

export const TIME_UNITS = ['HOURS', 'MINUTES', 'SECONDS'];

const LOOKUP_PERMISSIONS = [
  'lookuptables:read',
];

class FilterForm extends React.Component {
  formatStreamIds = lodash.memoize(
    (streamIds) => {
      const { streams } = this.props;

      return streamIds
        .map((streamId) => streams.find((s) => s.id === streamId) || streamId)
        .map((streamOrId) => {
          const stream = (typeof streamOrId === 'object' ? streamOrId : { title: streamOrId, id: streamOrId });

          return {
            label: stream.title,
            value: stream.id,
          };
        })
        .sort((s1, s2) => naturalSortIgnoreCase(s1.label, s2.label));
    },
    (streamIds) => streamIds.join('-'),
  );

  _parseQuery = lodash.debounce((queryString) => {
    if (!this._userCanViewLookupTables()) {
      return;
    }

    const { queryId, searchTypeId } = this.state;

    const queryBuilder = Query.builder()
      .id(queryId)
      .query({ type: 'elasticsearch', query_string: queryString })
      .timerange({ type: 'relative', range: 1000 })
      .searchTypes([{
        id: searchTypeId,
        type: 'messages',
        limit: 10,
        offset: 0,
      }]);

    const query = queryBuilder.build();

    const search = Search.create().toBuilder()
      .queries([query])
      .build();

    SearchMetadataActions.parseSearch(search).then((res) => {
      this._syncParamsWithQuery(res.undeclared);
    });
  }, 250);

  static propTypes = {
    eventDefinition: PropTypes.object.isRequired,
    lookupTables: PropTypes.object.isRequired,
    validation: PropTypes.object.isRequired,
    streams: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    currentUser: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    const { execute_every_ms: executeEveryMs, search_within_ms: searchWithinMs } = props.eventDefinition.config;
    const searchWithin = extractDurationAndUnit(searchWithinMs, TIME_UNITS);
    const executeEvery = extractDurationAndUnit(executeEveryMs, TIME_UNITS);

    this.state = {
      searchWithinMsDuration: searchWithin.duration,
      searchWithinMsUnit: searchWithin.unit,
      executeEveryMsDuration: executeEvery.duration,
      executeEveryMsUnit: executeEvery.unit,
      queryId: uuid(),
      searchTypeId: uuid(),
      queryParameterStash: {}, // keep already defined parameters around to ease editing
    };
  }

  componentDidMount() {
    if (this._userCanViewLookupTables()) {
      LookupTablesActions.searchPaginated(1, 0, undefined, false);
    }
  }

  propagateChange = (key, value) => {
    const { eventDefinition, onChange } = this.props;
    const config = lodash.cloneDeep(eventDefinition.config);

    config[key] = value;
    onChange('config', config);
  };

  _syncParamsWithQuery = (paramsInQuery) => {
    const { eventDefinition, onChange } = this.props;
    const config = lodash.cloneDeep(eventDefinition.config);
    const queryParameters = config.query_parameters;
    const keptParameters = [];
    const staleParameters = {};

    queryParameters.forEach((p) => {
      if (paramsInQuery.has(p.name)) {
        keptParameters.push(p);
      } else {
        staleParameters[p.name] = p;
      }
    });

    const { queryParameterStash } = this.state;
    const newParameters = [];

    paramsInQuery.forEach((np) => {
      if (!keptParameters.find((p) => p.name === np)) {
        if (queryParameterStash[np]) {
          newParameters.push(queryParameterStash[np]);
        } else {
          newParameters.push(this._buildNewParameter(np));
        }
      }
    });

    this.setState({ queryParameterStash: lodash.merge(queryParameterStash, staleParameters) });

    config.query_parameters = keptParameters.concat(newParameters);
    onChange('config', config);
  };

  _userCanViewLookupTables = () => {
    const { currentUser } = this.props;

    return isPermitted(currentUser.permissions, LOOKUP_PERMISSIONS);
  };

  _buildNewParameter = (name) => {
    return ({
      name: name,
      embryonic: true,
      type: 'lut-parameter-v1',
      data_type: 'any',
      title: 'new title',
      // has no binding, no need to set binding property
    });
  };

  handleQueryChange = (event) => {
    this._parseQuery(event.target.value);
    this.handleConfigChange(event);
  };

  handleConfigChange = (event) => {
    const { name } = event.target;

    this.propagateChange(name, FormsUtils.getValueFromInput(event.target));
  };

  handleStreamsChange = (nextValue) => {
    this.propagateChange('streams', nextValue);
  };

  handleTimeRangeChange = (fieldName) => {
    return (nextValue, nextUnit) => {
      const durationInMs = moment.duration(lodash.max([nextValue, 1]), nextUnit).asMilliseconds();

      this.propagateChange(fieldName, durationInMs);

      const stateFieldName = lodash.camelCase(fieldName);

      this.setState({
        [`${stateFieldName}Duration`]: nextValue,
        [`${stateFieldName}Unit`]: nextUnit,
      });
    };
  };

  renderQueryParameters = () => {
    const { eventDefinition, onChange, lookupTables, validation } = this.props;
    const { query_parameters: queryParameters } = eventDefinition.config;

    const onChangeQueryParameters = (newQueryParameters) => {
      const newConfig = { ...eventDefinition.config, query_parameters: newQueryParameters };

      return onChange('config', newConfig);
    };

    if (!this._userCanViewLookupTables()) {
      return (
        <Alert bsStyle="info">
          此帐户没有从数据字段声明查询参数的权限。
        </Alert>
      );
    }

    const parameterButtons = queryParameters.map((queryParam) => {
      return (
        <EditQueryParameterModal key={queryParam.name}
                                 queryParameter={LookupTableParameter.fromJSON(queryParam)}
                                 embryonic={!!queryParam.embryonic}
                                 queryParameters={queryParameters}
                                 lookupTables={lookupTables.tables}
                                 validation={validation}
                                 onChange={onChangeQueryParameters} />
      );
    });

    if (lodash.isEmpty(parameterButtons)) {
      return null;
    }

    const hasEmbryonicParameters = !lodash.isEmpty(queryParameters.filter((param) => (param.embryonic)));

    return (
      <FormGroup validationState={validation.errors.query_parameters ? 'error' : null}>
        <ControlLabel>查询参数</ControlLabel>
        <Alert bsStyle={hasEmbryonicParameters ? 'danger' : 'info'}>
          <ButtonToolbar>
            {parameterButtons}
          </ButtonToolbar>
        </Alert>
        {hasEmbryonicParameters && (
          <HelpBlock>
            {validation.errors.query_parameters
              ? lodash.get(validation, 'errors.query_parameters[0]')
              : '请通过单击上面的按钮声明缺少的查询参数。'}
          </HelpBlock>
        )}
      </FormGroup>
    );
  };

  render() {
    const { eventDefinition, streams, validation } = this.props;
    const { searchWithinMsDuration, searchWithinMsUnit, executeEveryMsDuration, executeEveryMsUnit } = this.state;

    // Ensure deleted streams are still displayed in select
    const allStreamIds = lodash.union(streams.map((s) => s.id), lodash.defaultTo(eventDefinition.config.streams, []));
    const formattedStreams = this.formatStreamIds(allStreamIds);

    return (
      <fieldset>
        <h2 className={commonStyles.title}>过滤</h2>
        <p>添加信息以过滤与此事件定义相关的日志消息。</p>
        <Input id="filter-query"
               name="query"
               label="查询语句"
               type="text"
               help={(
                 <span>
                   搜索消息应匹配的查询。您可以使用与搜索页面中相同的语法，
                   包括使用 <code>$newParameter$</code> 语法从查找表中声明查询参数。
                 </span>
               )}
               value={lodash.defaultTo(eventDefinition.config.query, '')}
               onChange={this.handleQueryChange} />

        {this.renderQueryParameters()}

        <FormGroup controlId="filter-streams">
          <ControlLabel>消息流 <small className="text-muted">（可选）</small></ControlLabel>
          <MultiSelect id="filter-streams"
                       matchProp="label"
                       onChange={(selected) => this.handleStreamsChange(selected === '' ? [] : selected.split(','))}
                       options={formattedStreams}
                       value={lodash.defaultTo(eventDefinition.config.streams, []).join(',')} />
          <HelpBlock>选择搜索应包括的流。如果为空，则在所有流中搜索。</HelpBlock>
        </FormGroup>

        <FormGroup controlId="search-within" validationState={validation.errors.search_within_ms ? 'error' : null}>
          <TimeUnitInput label="最近的搜索"
                         update={this.handleTimeRangeChange('search_within_ms')}
                         value={searchWithinMsDuration}
                         unit={searchWithinMsUnit}
                         units={TIME_UNITS}
                         clearable
                         required />
          {validation.errors.search_within_ms && (
            <HelpBlock>{lodash.get(validation, 'errors.search_within_ms[0]')}</HelpBlock>
          )}
        </FormGroup>

        <FormGroup controlId="execute-every" validationState={validation.errors.execute_every_ms ? 'error' : null}>
          <TimeUnitInput label="执行搜索周期"
                         update={this.handleTimeRangeChange('execute_every_ms')}
                         value={executeEveryMsDuration}
                         unit={executeEveryMsUnit}
                         units={TIME_UNITS}
                         clearable
                         required />
          {validation.errors.execute_every_ms && (
            <HelpBlock>{lodash.get(validation, 'errors.execute_every_ms[0]')}</HelpBlock>
          )}
        </FormGroup>
        <Input id="schedule-checkbox"
               type="checkbox"
               name="_is_scheduled"
               label="启用"
               help="这个事件定义应该自动执行吗"
               checked={lodash.defaultTo(eventDefinition.config._is_scheduled, true)}
               onChange={this.handleConfigChange} />
      </fieldset>
    );
  }
}

export default connect(FilterForm, {
  lookupTables: LookupTablesStore,
});
