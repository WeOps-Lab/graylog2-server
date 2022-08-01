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
import {PluginStore} from 'graylog-web-plugin/plugin';
import moment from 'moment';
import {} from 'moment-duration-format';
import naturalSort from 'javascript-natural-sort';

import {Alert, Col, Row} from 'components/bootstrap';
import {isPermitted} from 'util/PermissionsMixin';
import EventDefinitionPriorityEnum from 'logic/alerts/EventDefinitionPriorityEnum';

// Import built-in plugins
import {} from 'components/event-definitions/event-definition-types';
import {} from 'components/event-notifications/event-notification-types';

import EventDefinitionValidationSummary from './EventDefinitionValidationSummary';
import styles from './EventDefinitionSummary.css';

import commonStyles from '../common/commonStyles.css';

class EventDefinitionSummary extends React.Component {
  static propTypes = {
    eventDefinition: PropTypes.object.isRequired,
    notifications: PropTypes.array.isRequired,
    validation: PropTypes.object,
    currentUser: PropTypes.object.isRequired,
  };

  static defaultProps = {
    validation: undefined,
  };

  constructor(props) {
    super(props);

    this.state = {
      showValidation: false,
    };
  }

  componentDidUpdate() {
    this.showValidation();
  }

  showValidation = () => {
    const {showValidation} = this.state;

    if (!showValidation) {
      this.setState({showValidation: true});
    }
  };

  renderDetails = (eventDefinition) => {
    return (
      <>
        <h3 className={commonStyles.title}>详情</h3>
        <dl>
          <dt>标题</dt>
          <dd>{eventDefinition.title || '无标题'}</dd>
          <dt>描述</dt>
          <dd>{eventDefinition.description || '无描述'}</dd>
          <dt>优先级</dt>
          <dd>{lodash.upperFirst(EventDefinitionPriorityEnum.properties[eventDefinition.priority].name)}</dd>
        </dl>
      </>
    );
  };

  getPlugin = (name, type) => {
    if (type === undefined) {
      return {};
    }

    return PluginStore.exports(name).find((edt) => edt.type === type) || {};
  };

  renderCondition = (config) => {
    const {currentUser} = this.props;
    const conditionPlugin = this.getPlugin('eventDefinitionTypes', config.type);
    const component = (conditionPlugin.summaryComponent
        ? React.createElement(conditionPlugin.summaryComponent, {
          config: config,
          currentUser: currentUser,
        })
        : <p>条件插件 <em>{config.type}</em> 没有提供摘要.</p>
    );

    return (
      <>
        <h3 className={commonStyles.title}>{conditionPlugin.displayName || config.type}</h3>
        {component}
      </>
    );
  };

  renderField = (fieldName, config, keys) => {
    const {currentUser} = this.props;

    if (!config.providers || config.providers.length === 0) {
      return <span key={fieldName}>未配置字段值提供程序.</span>;
    }

    const provider = config.providers[0] || {};
    const fieldProviderPlugin = this.getPlugin('fieldValueProviders', provider.type);

    return (fieldProviderPlugin.summaryComponent
        ? React.createElement(fieldProviderPlugin.summaryComponent, {
          fieldName: fieldName,
          config: config,
          keys: keys,
          key: fieldName,
          currentUser: currentUser,
        })
        : <p key={fieldName}>Provider 插件 <em>{provider.type}</em> 不提供摘要。</p>
    );
  };

  renderFieldList = (fieldNames, fields, keys) => {
    return (
      <>
        <dl>
          <dt>键值</dt>
          <dd>{keys.length > 0 ? keys.join(', ') : '没有为基于此定义的事件配置密钥.'}</dd>
        </dl>
        {fieldNames.sort(naturalSort).map((fieldName) => this.renderField(fieldName, fields[fieldName], keys))}
      </>
    );
  };

  renderFields = (fields, keys) => {
    const fieldNames = Object.keys(fields);

    return (
      <>
        <h3 className={commonStyles.title}>字段</h3>
        {fieldNames.length === 0
          ? <p>没有配置任何字段定义.</p>
          : this.renderFieldList(fieldNames, fields, keys)}
      </>
    );
  };

  renderNotification = (definitionNotification) => {
    const {notifications} = this.props;
    const notification = notifications.find((n) => n.id === definitionNotification.notification_id);

    let content;

    if (notification) {
      const notificationPlugin = this.getPlugin('eventNotificationTypes', notification.config.type);

      content = (notificationPlugin.summaryComponent
          ? React.createElement(notificationPlugin.summaryComponent, {
            type: notificationPlugin.displayName,
            notification: notification,
            definitionNotification: definitionNotification,
          })
          : <p>通知插件<em>{notification.config.type}</em> 没有提供摘要.</p>
      );
    } else {
      content = (
        <p>
          找不到通知 <em>{definitionNotification.notification_id}</em>的信息.
        </p>
      );
    }

    return (
      <React.Fragment key={definitionNotification.notification_id}>
        {content}
      </React.Fragment>
    );
  };

  renderNotificationSettings = (notificationSettings) => {
    const formattedDuration = moment.duration(notificationSettings.grace_period_ms)
      .format('d [days] h [hours] m [minutes] s [seconds]', {trim: 'all'});

    const formattedGracePeriod = (notificationSettings.grace_period_ms
      ? `宽限期设置为 ${formattedDuration}`
      : '宽限期已禁用');

    const formattedBacklogSize = (notificationSettings.backlog_size
      ? `通知将包括 ${notificationSettings.backlog_size} 消息`
      : '通知将不包括任何消息.');

    return (
      <>
        <h4>配置</h4>
        <dl>
          <dd>{formattedGracePeriod}</dd>
          <dd>{formattedBacklogSize}</dd>
        </dl>
      </>
    );
  };

  renderNotifications = (definitionNotifications, notificationSettings) => {
    const {currentUser} = this.props;

    const effectiveDefinitionNotifications = definitionNotifications
      .filter((n) => isPermitted(currentUser.permissions, `eventnotifications:read:${n.notification_id}`));
    const notificationsWithMissingPermissions = definitionNotifications
      .filter((n) => !effectiveDefinitionNotifications.map((nObj) => nObj.notification_id).includes(n.notification_id));
    const warning = notificationsWithMissingPermissions.length > 0
      ? (
        <Alert bsStyle="warning">
          此事件未配置任何通知:<br/>
          {notificationsWithMissingPermissions.map((n) => n.notification_id).join(', ')}
        </Alert>
      )
      : null;

    return (
      <>
        <h3 className={commonStyles.title}>事件总览</h3>
        <p>
          {warning}
        </p>
        {effectiveDefinitionNotifications.length === 0 && notificationsWithMissingPermissions.length <= 0
          ? <p>此事件未配置为触发任何通知.</p>
          : (
            <>
              {this.renderNotificationSettings(notificationSettings)}
              {definitionNotifications.map(this.renderNotification)}
            </>
          )}
      </>
    );
  };

  render() {
    const {eventDefinition, validation} = this.props;
    const {showValidation} = this.state;

    return (
      <Row className={styles.eventSummary}>
        <Col md={12}>
          <h2 className={commonStyles.title}>活动摘要</h2>
          {showValidation && <EventDefinitionValidationSummary validation={validation}/>}
          <Row>
            <Col md={5}>
              {this.renderDetails(eventDefinition)}
            </Col>
            <Col md={5} mdOffset={1}>
              {this.renderCondition(eventDefinition.config)}
            </Col>
          </Row>
          <Row>
            <Col md={5}>
              {this.renderFields(eventDefinition.field_spec, eventDefinition.key_spec)}
            </Col>
            <Col md={5} mdOffset={1}>
              {this.renderNotifications(eventDefinition.notifications, eventDefinition.notification_settings)}
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

export default EventDefinitionSummary;
