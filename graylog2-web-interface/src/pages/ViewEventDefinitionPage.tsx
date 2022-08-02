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
import * as React from 'react';
import { useState, useEffect, useContext } from 'react';

import { useStore } from 'stores/connect';
import withParams from 'routing/withParams';
import { LinkContainer } from 'components/common/router';
import { ButtonToolbar, Col, Row, Button } from 'components/bootstrap';
import Routes from 'routing/Routes';
import DocsHelper from 'util/DocsHelper';
import { DocumentTitle, PageHeader, Spinner } from 'components/common';
import CurrentUserContext from 'contexts/CurrentUserContext';
import DocumentationLink from 'components/support/DocumentationLink';
import { isPermitted } from 'util/PermissionsMixin';
import history from 'util/History';
import EventDefinitionSummary from 'components/event-definitions/event-definition-form/EventDefinitionSummary';
import { EventDefinitionsActions } from 'stores/event-definitions/EventDefinitionsStore';
import { EventNotificationsActions, EventNotificationsStore } from 'stores/event-notifications/EventNotificationsStore';

type Props = {
  params: {
    definitionId: string,
  },
};

const ViewEventDefinitionPage = ({ params }: Props) => {
  const currentUser = useContext(CurrentUserContext);
  const [eventDefinition, setEventDefinition] = useState<{ title: string } | undefined>();
  const { all: notifications } = useStore(EventNotificationsStore);

  useEffect(() => {
    if (currentUser && isPermitted(currentUser.permissions, `eventdefinitions:read:${params.definitionId}`)) {
      EventDefinitionsActions.get(params.definitionId)
        .then(
          (response) => {
            const eventDefinitionResp = response.event_definition;

            // Inject an internal "_is_scheduled" field to indicate if the event definition should be scheduled in the
            // backend. This field will be removed in the event definitions store before sending an event definition
            // back to the server.
            eventDefinitionResp.config._is_scheduled = response.context.scheduler.is_scheduled;
            setEventDefinition(eventDefinitionResp);
          },
          (error) => {
            if (error.status === 404) {
              history.push(Routes.ALERTS.DEFINITIONS.LIST);
            }
          },
        );

      EventNotificationsActions.listAll();
    }
  }, [currentUser, params]);

  if (!eventDefinition || !notifications) {
    return (
      <DocumentTitle title="查看事件规则">
        <span>
          <PageHeader title="查看事件规则">
            <Spinner text="加载中..." />
            <></>
          </PageHeader>
        </span>
      </DocumentTitle>
    );
  }

  return (
    <DocumentTitle title={`查看 "${eventDefinition.title}" 事件规则`}>
      <span>
        <PageHeader title={`查看 "${eventDefinition.title}" 事件规则`}>
          <span>
            事件规则允许您从不同的条件创建事件并对其发出警报。
          </span>

          <span>
            查看
            <DocumentationLink page={DocsHelper.PAGES.ALERTS}
                               text="文档" />
          </span>

          <ButtonToolbar>
            <LinkContainer to={Routes.ALERTS.LIST}>
              <Button bsStyle="info">告警 & 事件</Button>
            </LinkContainer>
            <LinkContainer to={Routes.ALERTS.DEFINITIONS.LIST}>
              <Button bsStyle="info">事件规则</Button>
            </LinkContainer>
            <LinkContainer to={Routes.ALERTS.NOTIFICATIONS.LIST}>
              <Button bsStyle="info">通知</Button>
            </LinkContainer>
          </ButtonToolbar>
        </PageHeader>

        <Row className="content">
          <Col md={12}>
            <EventDefinitionSummary eventDefinition={eventDefinition}
                                    currentUser={currentUser}
                                    notifications={notifications} />
          </Col>
        </Row>
      </span>
    </DocumentTitle>
  );
};

export default withParams(ViewEventDefinitionPage);
