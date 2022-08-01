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
import { PluginStore } from 'graylog-web-plugin/plugin';

import { LinkContainer, Link } from 'components/common/router';
import EntityShareModal from 'components/permissions/EntityShareModal';
import {
  EmptyEntity,
  EntityList,
  EntityListItem,
  ShareButton,
  IfPermitted,
  PaginatedList,
  SearchForm,
  Spinner,
  Icon,
  QueryHelper,
} from 'components/common';
import { Col, DropdownButton, MenuItem, Row, Button } from 'components/bootstrap';
import Routes from 'routing/Routes';

import styles from './EventNotifications.css';

class EventNotifications extends React.Component {
  static propTypes = {
    notifications: PropTypes.array.isRequired,
    pagination: PropTypes.object.isRequired,
    query: PropTypes.string.isRequired,
    testResult: PropTypes.shape({
      isLoading: PropTypes.bool,
      id: PropTypes.string,
      error: PropTypes.bool,
      message: PropTypes.string,
    }).isRequired,
    onPageChange: PropTypes.func.isRequired,
    onQueryChange: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onTest: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      notificationToShare: undefined,
    };
  }

  renderEmptyContent = () => {
    return (
      <Row>
        <Col md={4} mdOffset={4}>
          <EmptyEntity>
            <p>
              配置事件通知,以便在事件发生时向您发出告警.您还可以使用通知将DataInsight告警与外部告警系统集成.
            </p>
            <IfPermitted permissions="eventnotifications:create">
              <LinkContainer to={Routes.ALERTS.NOTIFICATIONS.CREATE}>
                <Button bsStyle="success">开始使用!</Button>
              </LinkContainer>
            </IfPermitted>
          </EmptyEntity>
        </Col>
      </Row>
    );
  };

  getNotificationPlugin = (type) => {
    if (type === undefined) {
      return {};
    }

    return PluginStore.exports('eventNotificationTypes').find((n) => n.type === type) || {};
  };

  formatNotification = (notifications, setNotificationToShare) => {
    const { testResult } = this.props;

    return notifications.map((notification) => {
      const isTestLoading = testResult.id === notification.id && testResult.isLoading;
      const actions = this.formatActions(notification, isTestLoading, setNotificationToShare);

      const plugin = this.getNotificationPlugin(notification.config.type);
      const content = testResult.id === notification.id ? (
        <Col md={12}>
          {testResult.isLoading ? (
            <Spinner text="测试通知中..." />
          ) : (
            <p className={testResult.error ? 'text-danger' : 'text-success'}>
              <b>{testResult.error ? '失败' : '成功'}:</b> {testResult.message}
            </p>
          )}
        </Col>
      ) : null;

      const title = <Link to={Routes.ALERTS.NOTIFICATIONS.show(notification.id)}>{notification.title}</Link>;

      return (
        <EntityListItem key={`event-definition-${notification.id}`}
                        title={title}
                        titleSuffix={plugin.displayName || notification.config.type}
                        description={notification.description || <em>没有描述</em>}
                        actions={actions}
                        contentRow={content} />
      );
    });
  };

  formatActions(notification, isTestLoading, setNotificationToShare) {
    const { onDelete, onTest } = this.props;

    return (
      <>
        <LinkContainer to={Routes.ALERTS.NOTIFICATIONS.edit(notification.id)}>
          <IfPermitted permissions={`eventnotifications:edit:${notification.id}`}>
            <Button bsStyle="info">
              <Icon name="edit" /> 编辑
            </Button>
          </IfPermitted>
        </LinkContainer>
        <ShareButton entityType="notification" entityId={notification.id} onClick={() => setNotificationToShare(notification)} />
        <IfPermitted permissions={[`eventnotifications:edit:${notification.id}`, `eventnotifications:delete:${notification.id}`]} anyPermissions>
          <DropdownButton id={`more-dropdown-${notification.id}`} title="更多" pullRight>
            <IfPermitted permissions={`eventnotifications:edit:${notification.id}`}>
              <MenuItem disabled={isTestLoading} onClick={onTest(notification)}>
                {isTestLoading ? '测试中...' : '测试通知'}
              </MenuItem>
            </IfPermitted>
            <MenuItem divider />
            <IfPermitted permissions={`eventnotifications:delete:${notification.id}`}>
              <MenuItem onClick={onDelete(notification)}>删除</MenuItem>
            </IfPermitted>
          </DropdownButton>
        </IfPermitted>
      </>
    );
  }

  render() {
    const { notifications, pagination, query, onPageChange, onQueryChange } = this.props;
    const { notificationToShare } = this.state;

    const setNotificationToShare = (notification) => this.setState({ notificationToShare: notification });

    if (pagination.grandTotal === 0) {
      return this.renderEmptyContent();
    }

    return (
      <>
        <Row>
          <Col md={12}>
            <SearchForm query={query}
                        onSearch={onQueryChange}
                        onReset={onQueryChange}
                        searchButtonLabel="查找"
                        placeholder="查找通知"
                        wrapperClass={styles.inline}
                        queryHelpComponent={<QueryHelper entityName="notification" />}
                        queryWidth={200}
                        topMargin={0}
                        useLoadingState>
              <IfPermitted permissions="eventnotifications:create">
                <LinkContainer to={Routes.ALERTS.NOTIFICATIONS.CREATE}>
                  <Button bsStyle="success" className={styles.createButton}>创建通知</Button>
                </LinkContainer>
              </IfPermitted>
            </SearchForm>

            <PaginatedList activePage={pagination.page}
                           pageSize={pagination.pageSize}
                           pageSizes={[10, 25, 50]}
                           totalItems={pagination.total}
                           onChange={onPageChange}>
              <div className={styles.notificationList}>
                <EntityList items={this.formatNotification(notifications, setNotificationToShare)} />
              </div>
            </PaginatedList>
          </Col>
        </Row>
        {notificationToShare && (
          <EntityShareModal entityId={notificationToShare.id}
                            entityType="notification"
                            description="搜索要添加为此通知的协作者的用户或团队."
                            entityTitle={notificationToShare.title}
                            onClose={() => setNotificationToShare(undefined)} />
        )}
      </>
    );
  }
}

export default EventNotifications;
