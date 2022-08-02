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

import { LinkContainer } from 'components/common/router';
import { ButtonToolbar, Button } from 'components/bootstrap';
import { DocumentTitle, PageHeader, Spinner } from 'components/common';
import Routes from 'routing/Routes';
import { StreamAlertsOverviewContainer } from 'components/alerts';
import DocumentationLink from 'components/support/DocumentationLink';
import DocsHelper from 'util/DocsHelper';
import withParams from 'routing/withParams';
import { StreamsStore } from 'stores/streams/StreamsStore';

class StreamAlertsOverviewPage extends React.Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
  };

  state = {
    stream: undefined,
  };

  componentDidMount() {
    StreamsStore.get(this.props.params.streamId, (stream) => {
      this.setState({ stream: stream });
    });
  }

  render() {
    const { stream } = this.state;
    const isLoading = !stream;

    if (isLoading) {
      return <DocumentTitle title="消息流告警概览"><Spinner /></DocumentTitle>;
    }

    return (
      <DocumentTitle title={`${stream.title}告警概览`}>
        <div>
          <PageHeader title={<span> &raquo;{stream.title}&laquo;告警概览</span>}>
            <span>
              这是<em>{stream.title}</em>的告警、告警条件和告警通知的概览。
            </span>

            <span>
              在<DocumentationLink page={DocsHelper.PAGES.ALERTS} text="文档" />中查看更多关于告警的信息。
            </span>

            <ButtonToolbar>
              <LinkContainer to={Routes.STREAMS}>
                <Button bsStyle="info">消息流</Button>
              </LinkContainer>
              <LinkContainer to={Routes.LEGACY_ALERTS.LIST}>
                <Button bsStyle="info">告警概览</Button>
              </LinkContainer>
              <LinkContainer to={Routes.LEGACY_ALERTS.CONDITIONS}>
                <Button bsStyle="info">告警条件</Button>
              </LinkContainer>
              <LinkContainer to={Routes.LEGACY_ALERTS.NOTIFICATIONS}>
                <Button bsStyle="info">告警通知</Button>
              </LinkContainer>
            </ButtonToolbar>
          </PageHeader>

          <StreamAlertsOverviewContainer stream={stream} />
        </div>
      </DocumentTitle>
    );
  }
}

export default withParams(StreamAlertsOverviewPage);
