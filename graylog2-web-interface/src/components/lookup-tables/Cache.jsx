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
import { PluginStore } from 'graylog-web-plugin/plugin';

import { LinkContainer } from 'components/common/router';
import Routes from 'routing/Routes';
import { Row, Col, Button } from 'components/bootstrap';

import ConfigSummaryDefinitionListWrapper from './ConfigSummaryDefinitionListWrapper';

const Cache = ({ cache }) => {
  const plugins = {};

  PluginStore.exports('lookupTableCaches').forEach((p) => {
    plugins[p.type] = p;
  });

  const plugin = plugins[cache.config.type];

  if (!plugin) {
    return <p>未知的缓存类型 {cache.config.type}. 是否缺少了插件?</p>;
  }

  const summary = plugin.summaryComponent;

  return (
    <Row className="content">
      <Col md={6}>
        <h2>
          {cache.title}
          {' '}
          <small>({plugin.displayName})</small>
        </h2>
        <ConfigSummaryDefinitionListWrapper>
          <dl>
            <dt>描述</dt>
            <dd>{cache.description || <em>没有描述.</em>}</dd>
          </dl>
        </ConfigSummaryDefinitionListWrapper>
        <h4>配置</h4>
        <ConfigSummaryDefinitionListWrapper>
          {React.createElement(summary, { cache: cache })}
        </ConfigSummaryDefinitionListWrapper>
        <LinkContainer to={Routes.SYSTEM.LOOKUPTABLES.CACHES.edit(cache.name)}>
          <Button bsStyle="success">编辑</Button>
        </LinkContainer>
      </Col>
      <Col md={6} />
    </Row>
  );
};

Cache.propTypes = {
  cache: PropTypes.object.isRequired,
};

export default Cache;
