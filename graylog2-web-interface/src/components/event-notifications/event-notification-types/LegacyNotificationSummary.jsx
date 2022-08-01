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

import { Alert } from 'components/bootstrap';

import CommonNotificationSummary from './CommonNotificationSummary';
import commonStyles from './LegacyNotificationCommonStyles.css';

class LegacyNotificationSummary extends React.Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    notification: PropTypes.object.isRequired,
    definitionNotification: PropTypes.object.isRequired,
    legacyTypes: PropTypes.object.isRequired,
  };

  render() {
    const { notification, legacyTypes } = this.props;
    const configurationValues = notification.config.configuration;
    const callbackType = notification.config.callback_type;
    const typeData = legacyTypes[callbackType];

    let content;

    if (typeData) {
      const typeConfiguration = typeData.configuration;

      content = Object.entries(typeConfiguration)
        .map(([key, value]) => {
          return (
            <tr key={key}>
              <td>{value.human_name}</td>
              <td>{configurationValues[key]}</td>
            </tr>
          );
        });
    } else {
      content = (
        <tr className="danger">
          <td>类型</td>
          <td>
            未知的告警回调类型: <code>{callbackType}</code>.
            请确定已安装了对应的插件.
          </td>
        </tr>
      );
    }

    return (
      <>
        {!typeData && (
          <Alert bsStyle="danger" className={commonStyles.legacyNotificationAlert}>
            {notification.title || '旧版告警回调异常'}: 未知类型 <code>{callbackType}</code>,
            请确定插件已经安装.
          </Alert>
        )}
        <CommonNotificationSummary {...this.props}>
          <>
            {content}
          </>
        </CommonNotificationSummary>
      </>
    );
  }
}

export default LegacyNotificationSummary;
