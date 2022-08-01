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
import PropTypes from 'prop-types';
import React, {createRef} from 'react';
import moment from 'moment';

import {Button, Row, Col, BootstrapModalForm, Input} from 'components/bootstrap';
import {IfPermitted, ISODurationInput} from 'components/common';
import ObjectUtils from 'util/ObjectUtils';

import 'moment-duration-format';

import TimeRangeOptionsForm from './TimeRangeOptionsForm';
import TimeRangeOptionsSummary from './TimeRangeOptionsSummary';

function _queryTimeRangeLimitValidator(milliseconds) {
  return milliseconds >= 1;
}

function _relativeTimeRangeValidator(milliseconds, duration) {
  return milliseconds >= 1 || duration === 'PT0S';
}

function _surroundingTimeRangeValidator(milliseconds) {
  return milliseconds >= 1;
}

function _splitStringList(stringList) {
  return stringList.split(',').map((f) => f.trim()).filter((f) => f.length > 0);
}

class SearchesConfig extends React.Component {
  static propTypes = {
    config: PropTypes.shape({
      query_time_range_limit: PropTypes.string,
      relative_timerange_options: PropTypes.objectOf(PropTypes.string),
      surrounding_timerange_options: PropTypes.objectOf(PropTypes.string),
      surrounding_filter_fields: PropTypes.arrayOf(PropTypes.string),
      analysis_disabled_fields: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
    updateConfig: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.searchesConfigModal = createRef();

    const {config} = props;

    const queryTimeRangeLimit = config?.query_time_range_limit;
    const relativeTimerangeOptions = config?.relative_timerange_options;
    const surroundingTimerangeOptions = config?.surrounding_timerange_options;
    const surroundingFilterFields = config?.surrounding_filter_fields;
    const analysisDisabledFields = config?.analysis_disabled_fields;

    this.state = {
      config: {
        query_time_range_limit: queryTimeRangeLimit,
        relative_timerange_options: relativeTimerangeOptions,
        surrounding_timerange_options: surroundingTimerangeOptions,
        surrounding_filter_fields: surroundingFilterFields,
        analysis_disabled_fields: analysisDisabledFields,
      },
      limitEnabled: moment.duration(queryTimeRangeLimit).asMilliseconds() > 0,
      relativeTimeRangeOptionsUpdate: undefined,
      surroundingTimeRangeOptionsUpdate: undefined,
    };

    this.defaultState = {...this.state};
  }

  _onUpdate = (field) => {
    return (newOptions) => {
      const {config} = this.state;
      const update = ObjectUtils.clone(config);

      update[field] = newOptions;

      this.setState({config: update});
    };
  };

  _onRelativeTimeRangeOptionsUpdate = (data) => {
    this.setState({relativeTimeRangeOptionsUpdate: data});
  };

  _onSurroundingTimeRangeOptionsUpdate = (data) => {
    this.setState({surroundingTimeRangeOptionsUpdate: data});
  };

  _onFilterFieldsUpdate = (e) => {
    this.setState({surroundingFilterFields: e.target.value});
  };

  _onAnalysisDisabledFieldsUpdate = (e) => {
    this.setState({analysisDisabledFields: e.target.value});
  };

  _onChecked = () => {
    const {config: origConfig, limitEnabled} = this.state;
    const config = ObjectUtils.clone(origConfig);

    if (limitEnabled) {
      // If currently enabled, disable by setting the limit to 0 seconds.
      config.query_time_range_limit = 'PT0S';
    } else {
      // If currently not enabled, set a default of 30 days.
      config.query_time_range_limit = 'P30D';
    }

    this.setState({config: config, limitEnabled: !limitEnabled});
  };

  _saveConfig = () => {
    const {updateConfig} = this.props;
    const {
      analysisDisabledFields,
      config,
      relativeTimeRangeOptionsUpdate,
      surroundingTimeRangeOptionsUpdate,
      surroundingFilterFields
    } = this.state;
    const update = ObjectUtils.clone(config);

    if (relativeTimeRangeOptionsUpdate) {
      update.relative_timerange_options = {};

      relativeTimeRangeOptionsUpdate.forEach((entry) => {
        update.relative_timerange_options[entry.period] = entry.description;
      });

      this.setState({relativeTimeRangeOptionsUpdate: undefined});
    }

    if (surroundingTimeRangeOptionsUpdate) {
      update.surrounding_timerange_options = {};

      surroundingTimeRangeOptionsUpdate.forEach((entry) => {
        update.surrounding_timerange_options[entry.period] = entry.description;
      });

      this.setState({surroundingTimeRangeOptionsUpdate: undefined});
    }

    // Make sure to update filter fields
    if (surroundingFilterFields) {
      update.surrounding_filter_fields = _splitStringList(surroundingFilterFields);
      this.setState({surroundingFilterFields: undefined});
    }

    if (analysisDisabledFields) {
      update.analysis_disabled_fields = _splitStringList(analysisDisabledFields);
      this.setState({analysisDisabledFields: undefined});
    }

    updateConfig(update).then(() => {
      this._closeModal();
    });
  };

  _resetConfig = () => {
    // Reset to initial state when the modal is closed without saving.
    this.setState(this.defaultState);
  };

  _openModal = () => {
    this.searchesConfigModal.current.open();
  };

  _closeModal = () => {
    this.searchesConfigModal.current.close();
  };

  _isEnabled() {
    return this.state.limitEnabled;
  };

  render() {
    const _buildTimeRangeOptions = (options) => {
      return Object.keys(options).map((key) => {
        return {period: key, description: options[key]};
      });
    };

    const {
      config,
      limitEnabled,
      surroundingTimeRangeOptionsUpdate,
      surroundingFilterFields,
      relativeTimeRangeOptionsUpdate,
      analysisDisabledFields,
    } = this.state;
    const duration = moment.duration(config.query_time_range_limit);
    const limit = this._isEnabled() ? `${config.query_time_range_limit} (${moment.duration(duration.asMilliseconds()).format(function () {
      return this.duration.asSeconds() > 0 ? 'd [天] h [小时] m [分钟] s [秒]' : '0 秒'
    }, {trim: 'all'})})` : '已禁用';

    let filterFields;
    let filterFieldsString;

    if (config.surrounding_filter_fields) {
      filterFields = config.surrounding_filter_fields.map((f) => <li key={f}>{f}</li>);
      filterFieldsString = config.surrounding_filter_fields.join(', ');
    }

    let analysisDisabledFieldsListItems;
    let analysisDisabledFieldsString;

    if (config.analysis_disabled_fields) {
      analysisDisabledFieldsListItems = config.analysis_disabled_fields.map((f) => <li key={f}>{f}</li>);
      analysisDisabledFieldsString = config.analysis_disabled_fields.join(', ');
    }

    return (
      <div>
        <h2>查询配置</h2>

        <dl className="deflist">
          <dt>查询时间范围限制</dt>
          <dd>{limit}</dd>
          <dd>限制用户最多能查询多少天前的数据,这用于避免用户一次查询特别多的数据.
          </dd>
        </dl>

        <Row>
          <Col md={6}>
            <strong>相对时间范围选项</strong>
            <TimeRangeOptionsSummary options={config.relative_timerange_options}/>
          </Col>
          <Col md={6}>
            <strong>环绕时间范围选项</strong>
            <TimeRangeOptionsSummary options={config.surrounding_timerange_options}/>
          </Col>
          <Col md={6}>

            <strong>环绕查询过滤字段</strong>
            <ul>
              {filterFields}
            </ul>

            <strong>禁用的分析的字段</strong>
            <ul>
              {analysisDisabledFieldsListItems}
            </ul>

          </Col>

        </Row>
        <IfPermitted permissions="clusterconfigentry:edit">
          <Button bsStyle="info" bsSize="xs" onClick={this._openModal}>更新</Button>
        </IfPermitted>

        <BootstrapModalForm ref={this.searchesConfigModal}
                            title="更新搜索配置"
                            onSubmitForm={this._saveConfig}
                            onModalClose={this._resetConfig}
                            submitButtonText="保存">
          <fieldset>
            <label htmlFor="query-limit-checkbox">相对时间范围选项</label>
            <Input id="query-limit-checkbox"
                   type="checkbox"
                   label="启用查询限制"
                   name="enabled"
                   checked={limitEnabled}
                   onChange={this._onChecked}/>
            {limitEnabled && (
              <ISODurationInput id="query-timerange-limit-field"
                                duration={config.query_time_range_limit}
                                update={this._onUpdate('query_time_range_limit')}
                                label="查询时间范围限制（ISO8601 格式）"
                                help={'搜索的最大时间范围。 （即“P30D”为 30 天，"PT24H" 为 24 小时）'}
                                validator={_queryTimeRangeLimitValidator}
                                required/>
            )}
            <TimeRangeOptionsForm
              options={relativeTimeRangeOptionsUpdate || _buildTimeRangeOptions(config.relative_timerange_options)}
              update={this._onRelativeTimeRangeOptionsUpdate}
              validator={_relativeTimeRangeValidator}
              title="相对时间范围选项"
              help={
                <span>将<strong>相对</strong>时间范围选择器的可用选项配置为<strong>ISO8601持续时间</strong></span>}/>
            <TimeRangeOptionsForm
              options={surroundingTimeRangeOptionsUpdate || _buildTimeRangeOptions(config.surrounding_timerange_options)}
              update={this._onSurroundingTimeRangeOptionsUpdate}
              validator={_surroundingTimeRangeValidator}
              title="周边时间范围选项"
              help={
                <span>将<strong>周围</strong>时间范围选择器的可用选项配置为<strong>ISO8601持续时间</strong></span>}/>

            <Input id="filter-fields-input"
                   type="text"
                   label="周边搜索过滤字段"
                   onChange={this._onFilterFieldsUpdate}
                   value={surroundingFilterFields || filterFieldsString}
                   help="',' 分隔的消息字段列表，将用作周围消息查询的过滤器。"
                   required/>

            <Input id="disabled-fields-input"
                   type="text"
                   label="禁用分析字段"
                   onChange={this._onAnalysisDisabledFieldsUpdate}
                   value={analysisDisabledFields || analysisDisabledFieldsString}
                   help="',' 分隔的消息字段列表，在 Web UI 中将禁用 快速分析 等分析功能"
                   required/>
          </fieldset>
        </BootstrapModalForm>
      </div>
    );
  }
}

export default SearchesConfig;
