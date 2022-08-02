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
import moment from 'moment';
moment.locale('zh-cn');
import { ControlLabel, FormControl, FormGroup, HelpBlock, InputGroup } from 'components/bootstrap';
import { TimeUnitInput } from 'components/common';
import { extractDurationAndUnit } from 'components/common/TimeUnitInput';
import * as FormsUtils from 'util/FormsUtils';

import commonStyles from '../common/commonStyles.css';

const TIME_UNITS = ['HOURS', 'MINUTES', 'SECONDS'];

class NotificationSettingsForm extends React.Component {
  static propTypes = {
    eventDefinition: PropTypes.object.isRequired,
    defaults: PropTypes.object.isRequired,
    onSettingsChange: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    const { backlog_size: backlogSize, grace_period_ms: gracePeriodMs } = props.eventDefinition.notification_settings;

    const gracePeriod = extractDurationAndUnit(gracePeriodMs, TIME_UNITS);
    const defaultBacklogSize = props.defaults.default_backlog_size;
    const effectiveBacklogSize = lodash.defaultTo(backlogSize, defaultBacklogSize);

    this.state = {
      gracePeriodDuration: gracePeriod.duration,
      gracePeriodUnit: gracePeriod.unit,
      isBacklogSizeEnabled: (backlogSize === null ? false : (effectiveBacklogSize > 0)),
      backlogSize: effectiveBacklogSize,
    };
  }

  propagateChanges = (key, value) => {
    const { eventDefinition, onSettingsChange } = this.props;
    const nextNotificationSettings = lodash.cloneDeep(eventDefinition.notification_settings);

    nextNotificationSettings[key] = value;
    onSettingsChange('notification_settings', nextNotificationSettings);
  };

  handleGracePeriodChange = (nextValue, nextUnit, enabled) => {
    const durationInMs = enabled ? moment.duration(lodash.max([nextValue, 0]), nextUnit).asMilliseconds() : 0;

    this.propagateChanges('grace_period_ms', durationInMs);
    this.setState({ gracePeriodDuration: nextValue, gracePeriodUnit: nextUnit });
  };

  handleBacklogSizeChange = (event) => {
    const { name } = event.target;
    const value = event.target.value === '' ? '' : FormsUtils.getValueFromInput(event.target);

    this.setState({ [lodash.camelCase(name)]: value });
    this.propagateChanges(name, lodash.max([Number(value), 0]));
  };

  toggleBacklogSize = () => {
    const { isBacklogSizeEnabled, backlogSize } = this.state;

    this.setState({ isBacklogSizeEnabled: !isBacklogSizeEnabled });
    this.propagateChanges('backlog_size', (isBacklogSizeEnabled ? 0 : backlogSize));
  };

  render() {
    const { eventDefinition } = this.props;
    const { gracePeriodDuration, gracePeriodUnit, isBacklogSizeEnabled, backlogSize } = this.state;

    if (eventDefinition.notifications.length === 0) {
      return null;
    }

    return (
      <>
        <h3 className={commonStyles.title}>Notification Settings</h3>
        <fieldset>
          <FormGroup controlId="grace-period">
            <TimeUnitInput label="宽限期"
                           update={this.handleGracePeriodChange}
                           defaultEnabled={gracePeriodDuration !== 0}
                           value={gracePeriodDuration}
                           unit={gracePeriodUnit}
                           units={TIME_UNITS}
                           clearable />
            <HelpBlock>
              每次警报出现时,DataInsight都会发送通知.设置宽限期以控制在再次发送通知之前,DataInsight应等待多长时间.注意,带有键的事件对于每个不同的键值都有一个宽限期.
            </HelpBlock>
          </FormGroup>

          <FormGroup>
            <ControlLabel>消息量</ControlLabel>
            <InputGroup>
              <InputGroup.Addon>
                <input id="toggle_backlog_size"
                       type="checkbox"
                       checked={isBacklogSizeEnabled}
                       onChange={this.toggleBacklogSize} />
              </InputGroup.Addon>
              <FormControl type="number"
                           id="backlog_size"
                           name="backlog_size"
                           onChange={this.handleBacklogSizeChange}
                           value={backlogSize}
                           disabled={!isBacklogSizeEnabled} />
            </InputGroup>
            <HelpBlock>包含在通知中的消息量.</HelpBlock>
          </FormGroup>
        </fieldset>
      </>
    );
  }
}

export default NotificationSettingsForm;
