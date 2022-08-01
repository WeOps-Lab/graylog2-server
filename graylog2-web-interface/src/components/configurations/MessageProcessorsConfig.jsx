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
// eslint-disable-next-line no-restricted-imports
import createReactClass from 'create-react-class';
import naturalSort from 'javascript-natural-sort';

import { Button, Alert, Table } from 'components/bootstrap';
import { IfPermitted, SortableList } from 'components/common';
import BootstrapModalForm from 'components/bootstrap/BootstrapModalForm';
import ObjectUtils from 'util/ObjectUtils';

const MessageProcessorsConfig = createReactClass({
  displayName: 'MessageProcessorsConfig',

  propTypes: {
    config: PropTypes.object,
    updateConfig: PropTypes.func.isRequired,
  },

  getDefaultProps() {
    return {
      config: {
        disabled_processors: [],
        processor_order: [],
      },
    };
  },

  getInitialState() {
    const { config } = this.props;

    return {
      config: {
        disabled_processors: config.disabled_processors,
        processor_order: config.processor_order,
      },
    };
  },

  inputs: {},

  _openModal() {
    this.configModal.open();
  },

  _closeModal() {
    this.configModal.close();
  },

  _saveConfig() {
    const { updateConfig } = this.props;
    const { config } = this.state;

    if (!this._hasNoActiveProcessor()) {
      updateConfig(config).then(() => {
        this._closeModal();
      });
    }
  },

  _resetConfig() {
    // Reset to initial state when the modal is closed without saving.
    this.setState(this.getInitialState());
  },

  _updateSorting(newSorting) {
    const { config } = this.state;
    const update = ObjectUtils.clone(config);

    update.processor_order = newSorting.map((item) => {
      return { class_name: item.id, name: item.title };
    });

    this.setState({ config: update });
  },

  _toggleStatus(className) {
    return () => {
      const { config } = this.state;
      const disabledProcessors = config.disabled_processors;
      const update = ObjectUtils.clone(config);
      const { checked } = this.inputs[className];

      if (checked) {
        update.disabled_processors = disabledProcessors.filter((p) => p !== className);
      } else if (disabledProcessors.indexOf(className) === -1) {
        update.disabled_processors.push(className);
      }

      this.setState({ config: update });
    };
  },

  _hasNoActiveProcessor() {
    const { config } = this.state;

    return config.disabled_processors.length >= config.processor_order.length;
  },

  _noActiveProcessorWarning() {
    if (this._hasNoActiveProcessor()) {
      return (
        <Alert bsStyle="danger">
          <strong>异常:</strong> 没有活跃的消息处理器!
        </Alert>
      );
    }

    return null;
  },

  _summary() {
    const { config } = this.state;

    return config.processor_order.map((processor, idx) => {
      const status = config.disabled_processors.filter((p) => p === processor.class_name).length > 0 ? '禁用' : '启用';

      return (
        // eslint-disable-next-line react/no-array-index-key
        <tr key={idx}>
          <td>{idx + 1}</td>
          <td>{processor.name}</td>
          <td>{status}</td>
        </tr>
      );
    });
  },

  _sortableItems() {
    const { config } = this.state;

    return config.processor_order.map((processor) => {
      return { id: processor.class_name, title: processor.name };
    });
  },

  _statusForm() {
    const { config } = this.state;

    return ObjectUtils.clone(config.processor_order).sort((a, b) => naturalSort(a.name, b.name)).map((processor, idx) => {
      const enabled = config.disabled_processors.filter((p) => p === processor.class_name).length < 1;

      return (
        // eslint-disable-next-line react/no-array-index-key
        <tr key={idx}>
          <td>{processor.name}</td>
          <td>
            <input ref={(elem) => { this.inputs[processor.class_name] = elem; }}
                   type="checkbox"
                   checked={enabled}
                   onChange={this._toggleStatus(processor.class_name)} />
          </td>
        </tr>
      );
    });
  },

  render() {
    return (
      <div>
        <h2>消息处理器配置</h2>
        <p>下面的列表展示了日志消息处理器的顺序,被禁用的处理器会被跳过.</p>

        <Table striped bordered condensed className="top-margin">
          <thead>
            <tr>
              <th>#</th>
              <th>处理器</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            {this._summary()}
          </tbody>
        </Table>

        <IfPermitted permissions="clusterconfigentry:edit">
          <Button bsStyle="info" bsSize="xs" onClick={this._openModal}>更新</Button>
        </IfPermitted>

        <BootstrapModalForm ref={(configModal) => { this.configModal = configModal; }}
                            title="更新消息处理器配置"
                            onSubmitForm={this._saveConfig}
                            onModalClose={this._resetConfig}
                            submitButtonText="保存">
          <h3>排序</h3>
          <p>使用拖拽的方式对消息处理器进行排序.</p>
          <SortableList items={this._sortableItems()} onMoveItem={this._updateSorting} displayOverlayInPortal />

          <h3>状态</h3>
          <p>勾选复选框启用或禁用消息处理器.</p>
          <Table striped bordered condensed className="top-margin">
            <thead>
              <tr>
                <th>消息处理器</th>
                <th>启用</th>
              </tr>
            </thead>
            <tbody>
              {this._statusForm()}
            </tbody>
          </Table>
          {this._noActiveProcessorWarning()}
        </BootstrapModalForm>
      </div>
    );
  },
});

export default MessageProcessorsConfig;
