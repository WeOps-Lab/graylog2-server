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

import { LinkContainer } from 'components/common/router';
import { Button, Col, Row } from 'components/bootstrap';
import { DocumentTitle, PageHeader, Spinner } from 'components/common';
import DocumentationLink from 'components/support/DocumentationLink';
import ProcessorSimulator from 'components/simulator/ProcessorSimulator';
import DocsHelper from 'util/DocsHelper';
import Routes from 'routing/Routes';
import StreamsStore from 'stores/streams/StreamsStore';

class SimulatorPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      streams: undefined,
    };
  }

  componentDidMount() {
    StreamsStore.listStreams().then((streams) => {
      const filteredStreams = streams.filter((s) => s.is_editable);

      this.setState({ streams: filteredStreams });
    });
  }

  _isLoading = () => {
    const { streams } = this.state;

    return !streams;
  };

  render() {
    const { streams } = this.state;

    const content = this._isLoading() ? <Spinner /> : <ProcessorSimulator streams={streams} />;

    return (
      <DocumentTitle title="模拟处理">
        <div>
          <PageHeader title="模拟处理">
            <span>
              流水线处理日志的规则可能会很复杂，可以在这个页面进行消息的模拟处理
            </span>

            <span>
              在<DocumentationLink page={DocsHelper.PAGES.PIPELINES} text="文档"/>中查看更多关于流水线的信息。
            </span>

            <span>
              <LinkContainer to={Routes.SYSTEM.PIPELINES.OVERVIEW}>
                <Button bsStyle="info">管理流水线</Button>
              </LinkContainer>
              &nbsp;
              <LinkContainer to={Routes.SYSTEM.PIPELINES.RULES}>
                <Button bsStyle="info">管理规则</Button>
              </LinkContainer>
              &nbsp;
              <LinkContainer to={Routes.SYSTEM.PIPELINES.SIMULATOR}>
                <Button bsStyle="info">模拟</Button>
              </LinkContainer>
            </span>
          </PageHeader>

          <Row className="content">
            <Col md={12}>
              {content}
            </Col>
          </Row>
        </div>
      </DocumentTitle>
    );
  }
}

export default SimulatorPage;
