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
import naturalSort from 'javascript-natural-sort';
import { PluginStore } from 'graylog-web-plugin/plugin';

import { ButtonToolbar, Button } from 'components/bootstrap';
import { DataTable } from 'components/common';

import styles from './FieldsList.css';

const HEADERS = ['字段名称', '是键?', '值', '数据类型', '配置', '操作'];

class FieldsList extends React.Component {
  static propTypes = {
    fields: PropTypes.object.isRequired,
    keys: PropTypes.array.isRequired,
    onAddFieldClick: PropTypes.func.isRequired,
    onEditFieldClick: PropTypes.func.isRequired,
    onRemoveFieldClick: PropTypes.func.isRequired,
  };

  getFieldValueProviderPlugin = (type) => {
    if (type === undefined) {
      return {};
    }

    return PluginStore.exports('fieldValueProviders').find((p) => p.type === type) || {};
  };

  handleAddFieldClick = () => {
    const { onAddFieldClick } = this.props;

    onAddFieldClick();
  };

  handleEditClick = (fieldName) => {
    return () => {
      const { onEditFieldClick } = this.props;

      onEditFieldClick(fieldName);
    };
  };

  handleRemoveClick = (fieldName) => {
    return () => {
      const { onRemoveFieldClick } = this.props;

      onRemoveFieldClick(fieldName);
    };
  };

  providerFormatter = (config) => {
    const configKeys = Object.keys(config).filter((key) => key !== 'type');

    return (
      <p>
        {configKeys.map((key) => {
          return (
            <span key={key} className={styles.providerOptions}>{key}: <em>{JSON.stringify(config[key])}</em></span>
          );
        })}
      </p>
    );
  };

  fieldFormatter = (fieldName) => {
    const { fields, keys } = this.props;
    const config = fields[fieldName];

    const keyIndex = keys.indexOf(fieldName);
    const fieldProviderPlugin = this.getFieldValueProviderPlugin(config.providers[0].type);

    return (
      <tr key={fieldName}>
        <td>{fieldName}</td>
        <td>{keyIndex < 0 ? '否' : '是'}</td>
        <td>{fieldProviderPlugin.displayName || config.providers[0].type}</td>
        <td>{config.data_type}</td>
        <td>{this.providerFormatter(config.providers[0])}</td>
        <td className={styles.actions}>
          <ButtonToolbar>
            <Button bsStyle="primary" bsSize="xsmall" onClick={this.handleRemoveClick(fieldName)}>
              删除字段
            </Button>
            <Button bsStyle="info" bsSize="xsmall" onClick={this.handleEditClick(fieldName)}>
              编辑
            </Button>
          </ButtonToolbar>
        </td>
      </tr>
    );
  };

  render() {
    const { fields } = this.props;

    const fieldNames = Object.keys(fields).sort(naturalSort);
    const addCustomFieldButton = (
      <Button bsStyle="success" onClick={this.handleAddFieldClick}>
        添加自定义字段
      </Button>
    );

    if (fieldNames.length === 0) {
      return (
        <>
          <p>
            此事件还没有任何自定义字段.
          </p>
          {addCustomFieldButton}
        </>
      );
    }

    return (
      <>
        <DataTable id="event-definition-fields"
                   className="table-striped table-hover"
                   headers={HEADERS}
                   rows={fieldNames}
                   dataRowFormatter={this.fieldFormatter}
                   filterKeys={[]} />
        {addCustomFieldButton}
      </>
    );
  }
}

export default FieldsList;
