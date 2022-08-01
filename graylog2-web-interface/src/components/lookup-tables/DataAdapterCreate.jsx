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
import React from 'react';
import naturalSort from 'javascript-natural-sort';
import { PluginStore } from 'graylog-web-plugin/plugin';

import { Select } from 'components/common';
import { Row, Col, Input } from 'components/bootstrap';
import { DataAdapterForm } from 'components/lookup-tables';
import ObjectUtils from 'util/ObjectUtils';

class DataAdapterCreate extends React.Component {
  static propTypes = {
    saved: PropTypes.func.isRequired,
    types: PropTypes.object.isRequired,
    validate: PropTypes.func,
    validationErrors: PropTypes.object,
  };

  static defaultProps = {
    validate: null,
    validationErrors: {},
  };

  constructor(props) {
    super(props);

    this.state = {
      dataAdapter: undefined,
      type: undefined,
    };
  }

  _onTypeSelect = (adapterType) => {
    const { types } = this.props;

    this.setState({
      type: adapterType,
      dataAdapter: {
        id: null,
        title: '',
        name: '',
        description: '',
        config: ObjectUtils.clone(types[adapterType].default_config),
      },
    });
  };

  render() {
    const {
      types,
      validate,
      validationErrors,
      saved,
    } = this.props;
    const { type, dataAdapter } = this.state;
    const adapterPlugins = {};

    PluginStore.exports('lookupTableAdapters').forEach((p) => {
      adapterPlugins[p.type] = p;
    });

    const sortedAdapters = Object.keys(types).map((key) => {
      const typeItem = types[key];

      if (adapterPlugins[typeItem.type] === undefined) {
        // eslint-disable-next-line no-console
        console.error(`Plugin component for data adapter type ${typeItem.type} is missing - invalid or missing plugin?`);

        return { value: typeItem.type, disabled: true, label: `${typeItem.type} - 插件缺失或不合法` };
      }

      return { value: typeItem.type, label: adapterPlugins[typeItem.type].displayName };
    }).sort((a, b) => naturalSort(a.label.toLowerCase(), b.label.toLowerCase()));

    return (
      <div>
        <Row className="content">
          <Col lg={8}>
            <form className="form form-horizontal" onSubmit={() => {}}>
              <Input id="data-adapter-type-select"
                     label="数据源类型"
                     required
                     autoFocus
                     help="配置数据源的类型."
                     labelClassName="col-sm-3"
                     wrapperClassName="col-sm-9">
                <Select placeholder="选择数据源类型"
                        clearable={false}
                        options={sortedAdapters}
                        matchProp="label"
                        onChange={this._onTypeSelect}
                        value={null} />
              </Input>
            </form>
          </Col>
        </Row>
        {dataAdapter && (
        <Row className="content">
          <Col lg={12}>
            <DataAdapterForm dataAdapter={dataAdapter}
                             type={type}
                             create
                             title="配置数据源"
                             validate={validate}
                             validationErrors={validationErrors}
                             saved={saved} />
          </Col>
        </Row>
        )}
      </div>
    );
  }
}

export default DataAdapterCreate;
