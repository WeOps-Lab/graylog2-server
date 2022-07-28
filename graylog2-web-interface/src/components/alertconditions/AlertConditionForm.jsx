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
import createReactClass from 'create-react-class';
import Reflux from 'reflux';

import { ControlLabel, FormControl, FormGroup } from 'components/bootstrap';
import { ConfigurationForm } from 'components/configurationforms';
import { AlertConditionsStore } from 'stores/alertconditions/AlertConditionsStore';

const AlertConditionForm = createReactClass({
  displayName: 'AlertConditionForm',

  propTypes: {
    alertCondition: PropTypes.object,
    conditionType: PropTypes.object.isRequired,
    onCancel: PropTypes.func,
    onSubmit: PropTypes.func.isRequired,
  },

  mixins: [Reflux.connect(AlertConditionsStore)],

  getDefaultProps() {
    return {
      alertCondition: undefined,
      onCancel: () => {},
      onSubmit: () => {},
    };
  },

  getValue() {
    const values = this.configurationForm.getValue();

    return {
      title: values.title,
      type: this.props.conditionType.type,
      parameters: values.configuration,
    };
  },

  open() {
    this.configurationForm.open();
  },

  _onCancel() {
    this.props.onCancel();
  },

  _onSubmit() {
    const request = this.getValue();

    this.props.onSubmit(request);
  },

  _formatTitle(alertCondition, name) {
    const action = alertCondition ?  '更新' : '创建';
    const conditionName = alertCondition ? <em>{alertCondition.title || '无标题'}</em> : name;

    return <span>{action} {conditionName}</span>;
  },

  render() {
    const { alertCondition } = this.props;
    const { conditionType } = this.props;

    return (
      <ConfigurationForm ref={(configurationForm) => { this.configurationForm = configurationForm; }}
                         key="configuration-form-alert-condition"
                         configFields={conditionType.requested_configuration}
                         title={this._formatTitle(alertCondition, conditionType.name)}
                         typeName={conditionType.name}
                         submitAction={this._onSubmit}
                         cancelAction={this._onCancel}
                         titleValue={alertCondition ? alertCondition.title : ''}
                         helpBlock="告警条件标题"
                         values={alertCondition ? alertCondition.parameters : {}}>
        <FormGroup>
          <ControlLabel>{`${conditionType.name} 描述`}</ControlLabel>
          <FormControl.Static>{conditionType.human_name}</FormControl.Static>
        </FormGroup>
      </ConfigurationForm>
    );
  },
});

export default AlertConditionForm;
