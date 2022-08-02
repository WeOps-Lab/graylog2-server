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
import styled from 'styled-components';

import {Icon} from 'components/common';

import DocumentationLink from './DocumentationLink';

import DocsHelper from '../../util/DocsHelper';

const SourcesList = styled.ul`
  margin: 0;
  padding: 0;
  margin-top: 5px;
`;

const SupportSources = () => (
  <div className="support-sources">
    <h2>需要帮助?</h2>
    <p>
      如果您的问题在<DocumentationLink page={DocsHelper.PAGES.WELCOME} text="文档"/>没有答案,请咨询DataInsight社区.
    </p>

    <SourcesList>
      <li>
        <Icon name="group"/>&nbsp;
        <a href="https://www.graylog.org/community-support/" target="_blank" rel="noopener noreferrer">社区支持</a>
      </li>
      <li>
        <Icon name={{prefix: 'fab', iconName: 'github-alt'}}/>&nbsp;
        <a href="https://github.com/Graylog2/graylog2-server/issues" target="_blank" rel="noopener noreferrer">问题跟踪</a>
      </li>
      <li>
        <Icon name="heart"/>&nbsp;
        <a href="https://www.graylog.org/professional-support" target="_blank" rel="noopener noreferrer">专业支持</a>
      </li>
    </SourcesList>
  </div>
);

SupportSources.propTypes = {};

export default SupportSources;
