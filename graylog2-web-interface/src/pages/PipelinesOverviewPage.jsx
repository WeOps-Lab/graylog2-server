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
import { Row, Col, Button } from 'components/bootstrap';
import { DocumentTitle, PageHeader } from 'components/common';
import DocumentationLink from 'components/support/DocumentationLink';
import ProcessingTimelineComponent from 'components/pipelines/ProcessingTimelineComponent';
import Routes from 'routing/Routes';
import DocsHelper from 'util/DocsHelper';

import CreatePipelineButton from '../components/pipelines/CreatePipelineButton';

const PipelinesOverviewPage = () => (
  <DocumentTitle title="流水线概览">
    <div>
      <PageHeader title="流水线概览">
            <span>
              流水线允许转换和处理来自消息流的日志。流水线由多个步骤组成，每个步骤中的规则会在消息流入的时候执行。单条消息可以被多个规则处理。
            </span>

        <span>
              在<DocumentationLink page={DocsHelper.PAGES.ALERTS} text="文档" />中查看更多关于流水线的信息。
        </span>

        <span>
          <LinkContainer to={Routes.SYSTEM.PIPELINES.OVERVIEW}>
            <Button bsStyle="info">流水线管理</Button>
          </LinkContainer>
              &nbsp;
          <LinkContainer to={Routes.SYSTEM.PIPELINES.RULES}>
            <Button bsStyle="info">规则管理</Button>
          </LinkContainer>
              &nbsp;
          <LinkContainer to={Routes.SYSTEM.PIPELINES.SIMULATOR}>
            <Button bsStyle="info">模拟</Button>
          </LinkContainer>
        </span>
      </PageHeader>

      <Row className="content">
        <Col md={12}>
          <ProcessingTimelineComponent />
        </Col>
      </Row>
    </div>
  </DocumentTitle>
);

export default PipelinesOverviewPage;
