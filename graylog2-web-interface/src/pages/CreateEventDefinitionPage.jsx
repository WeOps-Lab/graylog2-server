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

import {LinkContainer} from 'components/common/router';
import {ButtonToolbar, Col, Row, Button} from 'components/bootstrap';
import {DocumentTitle, IfPermitted, PageHeader} from 'components/common';
import EventDefinitionFormContainer
  from 'components/event-definitions/event-definition-form/EventDefinitionFormContainer';
import DocumentationLink from 'components/support/DocumentationLink';
import Routes from 'routing/Routes';
import DocsHelper from 'util/DocsHelper';
import connect from 'stores/connect';
import PermissionsMixin from 'util/PermissionsMixin';
import history from 'util/History';
import {CurrentUserStore} from 'stores/users/CurrentUserStore';

class CreateEventDefinitionPage extends React.Component {
  static propTypes = {
    currentUser: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      eventDefinitionTitle: undefined,
    };
  }

  handleEventDefinitionChange = (eventDefinition) => {
    const {eventDefinitionTitle} = this.state;

    if (eventDefinition.title !== eventDefinitionTitle) {
      this.setState({eventDefinitionTitle: eventDefinition.title});
    }
  };

  render() {
    const {eventDefinitionTitle} = this.state;
    const pageTitle = eventDefinitionTitle ? `新建事件定义 "${eventDefinitionTitle}"` : '新建事件定义';

    const {currentUser} = this.props;

    if (!PermissionsMixin.isPermitted(currentUser.permissions, 'eventdefinitions:create')) {
      history.push(Routes.NOTFOUND);
    }

    return (
      <DocumentTitle title={pageTitle}>
        <span>
          <PageHeader title={pageTitle}>
            <span>
              事件定义允许您使用不同的条件创建告警并在触发时发出告警.
            </span>

            <span>
              在<DocumentationLink page={DocsHelper.PAGES.ALERTS} text="文档"/>中查看更多关于告警的信息
            </span>

            <ButtonToolbar>
              <LinkContainer to={Routes.ALERTS.LIST}>
                 <Button bsStyle="info">告警 & 事件</Button>
              </LinkContainer>
              <IfPermitted permissions="eventdefinitions:read">
                <LinkContainer to={Routes.ALERTS.DEFINITIONS.LIST}>
                  <Button bsStyle="info">事件规则</Button>
                </LinkContainer>
              </IfPermitted>
              <IfPermitted permissions="eventnotifications:read">
                <LinkContainer to={Routes.ALERTS.NOTIFICATIONS.LIST}>
                 <Button bsStyle="info">通知</Button>
                </LinkContainer>
              </IfPermitted>
            </ButtonToolbar>
          </PageHeader>

          <Row className="content">
            <Col md={12}>
              <EventDefinitionFormContainer action="create"
                                            onEventDefinitionChange={this.handleEventDefinitionChange}/>
            </Col>
          </Row>
        </span>
      </DocumentTitle>
    );
  }
}

export default connect(CreateEventDefinitionPage, {
  currentUser: CurrentUserStore,
}, ({currentUser}) => ({currentUser: currentUser.currentUser}));
