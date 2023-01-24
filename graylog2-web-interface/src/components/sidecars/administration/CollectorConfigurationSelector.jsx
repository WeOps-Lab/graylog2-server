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

import { Button, BootstrapModalConfirm } from 'components/bootstrap';
import { SelectPopover } from 'components/common';
import { naturalSortIgnoreCase } from 'util/SortUtils';
import CollectorIndicator from 'components/sidecars/common/CollectorIndicator';
import ColorLabel from 'components/sidecars/common/ColorLabel';

class CollectorConfigurationSelector extends React.Component {
  static propTypes = {
    collectors: PropTypes.array.isRequired,
    configurations: PropTypes.array.isRequired,
    selectedSidecarCollectorPairs: PropTypes.array.isRequired,
    onConfigurationSelectionChange: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      nextAssignedConfigurations: [],
    };
  }

  getAssignedConfigurations = (selectedSidecarCollectorPairs, configurations) => {
    const assignments = selectedSidecarCollectorPairs.map(({ sidecar }) => sidecar).reduce((accumulator, sidecar) => accumulator.concat(sidecar.assignments), []);

    return assignments.map((assignment) => configurations.find((configuration) => configuration.id === assignment.configuration_id));
  };

  handleConfigurationSelect = (configurationIds, hideCallback) => {
    const { configurations } = this.props;

    hideCallback();
    const nextAssignedConfigurations = configurations.filter((c) => configurationIds.includes(c.id));

    this.setState({ nextAssignedConfigurations }, this.modal.open);
  };

  confirmConfigurationChange = (doneCallback) => {
    const { onConfigurationSelectionChange } = this.props;
    const { nextAssignedConfigurations } = this.state;

    onConfigurationSelectionChange(nextAssignedConfigurations, doneCallback);
  };

  cancelConfigurationChange = () => {
    this.setState({ nextAssignedConfigurations: [] });
  };

  configurationFormatter = (configurationId) => {
    const { configurations, collectors } = this.props;
    const configuration = configurations.find((c) => c.id === configurationId);
    const collector = collectors.find((b) => b.id === configuration.collector_id);

    return (
      <span>
        <ColorLabel color={configuration.color} size="xsmall" /> {configuration.name}&emsp;
        <small>
          {collector
            ? (
              <CollectorIndicator collector={collector.name}
                                  operatingSystem={collector.node_operating_system} />
            )
            : <em>未知采集器</em>}
        </small>
      </span>
    );
  };

  renderConfigurationSummary = (nextAssignedConfigurations, selectedSidecarCollectorPairs) => {
    const exampleSidecarCollectorPair = selectedSidecarCollectorPairs[0];
    const collectorIndicator = (
      <em>
        <CollectorIndicator collector={exampleSidecarCollectorPair.collector.name}
                            operatingSystem={exampleSidecarCollectorPair.collector.node_operating_system} />
      </em>
    );

    let actionSummary;

    if (nextAssignedConfigurations.length === 0) {
      actionSummary = <span>您将要从{collectorIndicator}的配置<b>移除</b>采集器:</span>;
    } else {
      actionSummary = <span>您将要为采集器{collectorIndicator}<b>应用</b>配置<em>{nextAssignedConfigurations[0].name}</em>:</span>;
    }

    const formattedSummary = selectedSidecarCollectorPairs.map(({ sidecar }) => sidecar.node_name).join(', ');

    return (
      <BootstrapModalConfirm ref={(c) => { this.modal = c; }}
                             title="配置概览"
                             onConfirm={this.confirmConfigurationChange}
                             onCancel={this.cancelConfigurationChange}>
        <div>
          <p>{actionSummary}</p>
          <p>{formattedSummary}</p>
          <p>确定要继续此操作?</p>
        </div>
      </BootstrapModalConfirm>
    );
  };

  render() {
    const { nextAssignedConfigurations } = this.state;
    const { configurations, selectedSidecarCollectorPairs } = this.props;

    // Do not allow configuration changes when more than one log collector type is selected
    const selectedLogCollectors = lodash.uniq(selectedSidecarCollectorPairs.map(({ collector }) => collector));

    if (selectedLogCollectors.length > 1) {
      return (
        <SelectPopover id="status-filter"
                       title="应用配置"
                       triggerNode={<Button bsSize="small" bsStyle="link">配置 <span className="caret" /></Button>}
                       items={[`不能同时更改 ${selectedLogCollectors.map(collector => collector.name).join(', ')} 采集器的配置`]}
                       displayDataFilter={false}
                       disabled />
      );
    }

    const configurationIds = configurations
      .filter((configuration) => selectedLogCollectors[0].id === configuration.collector_id)
      .sort((c1, c2) => naturalSortIgnoreCase(c1.name, c2.name))
      .map((c) => c.id);

    if (configurationIds.length === 0) {
      return (
        <SelectPopover id="status-filter"
                       title="应用配置"
                       triggerNode={<Button bsSize="small" bsStyle="link">配置 <span className="caret" /></Button>}
                       items={['所选日志收集器没有可用的配置']}
                       displayDataFilter={false}
                       disabled />
      );
    }

    const assignedConfigurations = this.getAssignedConfigurations(selectedSidecarCollectorPairs, configurations)
      .filter((configuration) => selectedLogCollectors[0].id === configuration.collector_id);

    return (
      <span>
        <SelectPopover id="apply-configuration-action"
                       title="应用配置"
                       triggerNode={<Button bsSize="small" bsStyle="link">配置 <span className="caret" /></Button>}
                       items={configurationIds}
                       itemFormatter={this.configurationFormatter}
                       onItemSelect={this.handleConfigurationSelect}
                       selectedItems={assignedConfigurations.map((config) => config.id)}
                       filterPlaceholder="过滤配置" />
        {this.renderConfigurationSummary(nextAssignedConfigurations, selectedSidecarCollectorPairs)}
      </span>
    );
  }
}

export default CollectorConfigurationSelector;
