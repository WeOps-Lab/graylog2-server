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
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import lodash from 'lodash';

import { Button, Panel, BootstrapModalConfirm } from 'components/bootstrap';
import { Pluralize, SelectPopover } from 'components/common';

const MAPPING = { 'start' : '启动' , 'restart':'重启', 'stop':'暂停' };
const PROCESS_ACTIONS = ['start', 'restart', 'stop'];

const CollectorProcessControl = createReactClass({
  propTypes: {
    selectedSidecarCollectorPairs: PropTypes.array.isRequired,
    onProcessAction: PropTypes.func.isRequired,
  },

  getInitialState() {
    return {
      selectedAction: undefined,
      isConfigurationWarningHidden: false,
    };
  },

  resetSelectedAction() {
    this.setState({ selectedAction: undefined });
  },

  handleProcessActionSelect(processAction, hideCallback) {
    hideCallback();
    this.setState({ selectedAction: processAction ? processAction[0] : undefined }, this.modal.open);
  },

  confirmProcessAction(doneCallback) {
    const { onProcessAction, selectedSidecarCollectorPairs } = this.props;
    const { selectedAction } = this.state;

    const callback = () => {
      doneCallback();
      this.resetSelectedAction();
    };

    onProcessAction(selectedAction, selectedSidecarCollectorPairs, callback);
  },

  cancelProcessAction() {
    this.resetSelectedAction();
  },

  hideConfigurationWarning() {
    this.setState({ isConfigurationWarningHidden: true });
  },

  renderSummaryContent(selectedAction, selectedSidecars) {
    let actionName = ''
    if (selectedAction === 'start') {
      actionName = '启动'
    } else if (selectedAction === 'restart') {
      actionName = '重启'
    } else {
      actionName = '暂停'
    }

    return (
      <>
        <p>
          您将要<strong>{actionName}</strong>
          <Pluralize singular="以下服务器" plural="以下服务器" value={selectedSidecars.length} />
          的采集器:
        </p>
        <p>{selectedSidecars.join(', ')}</p>
        <p>您是否确实要继续此操作?</p>
      </>
    );
  },

  renderConfigurationWarning(selectedAction) {
    return (
      <Panel bsStyle="info" header="未配置的采集器">
        <p>
          至少有一个选定的采集器尚未配置.要启动一个新的采集器,请先为其分配一个配置,客户端将为您启动该过程.
        </p>
        <p>
          {lodash.capitalize(selectedAction)}个没有配置的采集器.
        </p>
        <Button bsSize="xsmall" bsStyle="primary" onClick={this.hideConfigurationWarning}>明白,继续
        </Button>
      </Panel>
    );
  },

  renderProcessActionSummary(selectedSidecarCollectorPairs, selectedAction) {
    const { isConfigurationWarningHidden } = this.state;
    const selectedSidecars = lodash.uniq(selectedSidecarCollectorPairs.map(({ sidecar }) => sidecar.node_name));

    // Check if all selected collectors have assigned configurations
    const allHaveConfigurationsAssigned = selectedSidecarCollectorPairs.every(({ collector, sidecar }) => {
      return sidecar.assignments.some(({ collector_id }) => collector_id === collector.id);
    });

    const shouldShowConfigurationWarning = !isConfigurationWarningHidden && !allHaveConfigurationsAssigned;

    return (
      <BootstrapModalConfirm ref={(c) => { this.modal = c; }}
                             title="操作流程摘要"
                             confirmButtonDisabled={shouldShowConfigurationWarning}
                             onConfirm={this.confirmProcessAction}
                             onCancel={this.cancelProcessAction}>
        <div>
          {shouldShowConfigurationWarning
            ? this.renderConfigurationWarning(selectedAction)
            : this.renderSummaryContent(selectedAction, selectedSidecars)}
        </div>
      </BootstrapModalConfirm>
    );
  },

  render() {
    const { selectedSidecarCollectorPairs } = this.props;
    const { selectedAction } = this.state;

    const actionFormatter = (action) => MAPPING[action];

    return (
      <span>
        <SelectPopover id="process-management-action"
                       title="操作"
                       triggerNode={(
                         <Button bsSize="small"
                                 bsStyle="link">操作 <span className="caret" />
                         </Button>
)}
                       items={PROCESS_ACTIONS}
                       itemFormatter={actionFormatter}
                       selectedItems={selectedAction ? [selectedAction] : []}
                       displayDataFilter={false}
                       onItemSelect={this.handleProcessActionSelect} />
        {this.renderProcessActionSummary(selectedSidecarCollectorPairs, selectedAction)}
      </span>
    );
  },
});

export default CollectorProcessControl;
