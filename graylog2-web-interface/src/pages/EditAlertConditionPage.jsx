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

import { Col, Row } from 'components/bootstrap';
import DocumentationLink from 'components/support/DocumentationLink';
import { DocumentTitle, PageHeader, Spinner } from 'components/common';
import { AlertsHeaderToolbar } from 'components/alerts';
import { EditAlertConditionForm } from 'components/alertconditions';
import { StreamAlertNotifications } from 'components/alertnotifications';
import Routes from 'routing/Routes';
import DocsHelper from 'util/DocsHelper';
import history from 'util/History';
import withParams from 'routing/withParams';
import { AlertConditionsStore, AlertConditionsActions } from 'stores/alertconditions/AlertConditionsStore';
import { StreamsStore } from 'stores/streams/StreamsStore';
import { CurrentUserStore } from 'stores/users/CurrentUserStore';

const EditAlertConditionPage = createReactClass({
  displayName: 'EditAlertConditionPage',

  propTypes: {
    params: PropTypes.object.isRequired,
  },

  mixins: [Reflux.connect(CurrentUserStore), Reflux.connect(AlertConditionsStore)],

  getInitialState() {
    return {
      stream: undefined,
    };
  },

  componentDidMount() {
    StreamsStore.get(this.props.params.streamId, (stream) => {
      this.setState({ stream: stream });
    });

    AlertConditionsActions.get(this.props.params.streamId, this.props.params.conditionId);
    AlertConditionsActions.available();
  },

  _handleUpdate(streamId, conditionId) {
    AlertConditionsActions.get(streamId, conditionId);
  },

  _handleDelete() {
    history.push(Routes.LEGACY_ALERTS.CONDITIONS);
  },

  _isLoading() {
    return !this.state.stream || !this.state.alertCondition || !this.state.availableConditions;
  },

  render() {
    if (this._isLoading()) {
      return <Spinner />;
    }

    const condition = this.state.alertCondition;
    const conditionType = this.state.availableConditions[condition.type];
    const { stream } = this.state;

    return (
      <DocumentTitle title={`告警条件 ${condition.title || '未命名'}`}>
        <div>
          <PageHeader title={<span>告警条件 <em>{condition.title || '未命名'}</em></span>}>
            <span>
                定义告警条件并配置满足该条件时DataInsight通知您的方式
            </span>

            <span>
              在<DocumentationLink page={DocsHelper.PAGES.ALERTS} text="文档" />中查看更多关于告警的信息.
            </span>


            <span>
              <AlertsHeaderToolbar active={Routes.LEGACY_ALERTS.CONDITIONS} />
            </span>
          </PageHeader>

          <Row className="content">
            <Col md={12}>
              <EditAlertConditionForm alertCondition={condition}
                                      conditionType={conditionType}
                                      stream={stream}
                                      onUpdate={this._handleUpdate}
                                      onDelete={this._handleDelete} />
            </Col>
          </Row>

          <Row className="content">
            <Col md={12}>
              <StreamAlertNotifications stream={stream} />
            </Col>
          </Row>
        </div>
      </DocumentTitle>
    );
  },
});

export default withParams(EditAlertConditionPage);
