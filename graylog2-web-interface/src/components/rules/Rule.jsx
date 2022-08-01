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

import { LinkContainer } from 'components/common/router';
import { PageHeader } from 'components/common';
import { Row, Col, Button } from 'components/bootstrap';
import DocumentationLink from 'components/support/DocumentationLink';
import DocsHelper from 'util/DocsHelper';
import Routes from 'routing/Routes';

import RuleForm from './RuleForm';
import RuleHelper from './RuleHelper';

const Rule = ({ create, title }) => {
  let pageTitle;

  if (create) {
    pageTitle = '创建流水线角色';
  } else {
    pageTitle = <span>流水线角色<em>{title}</em></span>;
  }

  return (
    <div>
      <PageHeader title={pageTitle}>
        <span>
          规则是对 DataInsight 中的消息应用更改的一种方式。规则由条件和列表组成{' '}
          动作。{' '}
          DataInsight 根据消息评估条件并在满足条件时执行操作。
        </span>

        <span>
          查看 <DocumentationLink page={DocsHelper.PAGES.PIPELINE_RULES}
                                                                           text="文档" />.
        </span>

        <span>
          <LinkContainer to={Routes.SYSTEM.PIPELINES.OVERVIEW}>
            <Button bsStyle="info">管理流水线</Button>
          </LinkContainer>
            &nbsp;
          <LinkContainer to={Routes.SYSTEM.PIPELINES.RULES}>
            <Button bsStyle="info">管理角色</Button>
          </LinkContainer>
            &nbsp;
          <LinkContainer to={Routes.SYSTEM.PIPELINES.SIMULATOR}>
            <Button bsStyle="info">模拟</Button>
          </LinkContainer>
        </span>
      </PageHeader>

      <Row className="content">
        <Col md={6}>
          <RuleForm create={create} />
        </Col>
        <Col md={6}>
          <RuleHelper />
        </Col>
      </Row>
    </div>
  );
};

Rule.propTypes = {
  title: PropTypes.string,
  create: PropTypes.bool,
};

Rule.defaultProps = {
  title: '',
  create: false,
};

export default Rule;
