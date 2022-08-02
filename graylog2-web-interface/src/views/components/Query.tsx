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
import styled, { css } from 'styled-components';

import DocsHelper from 'util/DocsHelper';
import { Jumbotron } from 'components/bootstrap';
import DocumentationLink from 'components/support/DocumentationLink';
import IfDashboard from 'views/components/dashboard/IfDashboard';
import IfSearch from 'views/components/search/IfSearch';
import WidgetGrid from 'views/components/WidgetGrid';
import { useStore } from 'stores/connect';
import { WidgetStore } from 'views/stores/WidgetStore';

const StyledJumbotron = styled(Jumbotron)(({ theme }) => css`
  .container-fluid & {
    border: 1px solid ${theme.colors.gray[80]};
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    margin-bottom: 0;
  }
`);

const NoWidgetsInfo = () => (
  <StyledJumbotron>
    <h2>
      <IfDashboard>
        此仪表板还没有小部件
      </IfDashboard>
      <IfSearch>
        没有定义任何小部件来可视化搜索结果
      </IfSearch>
    </h2>
    <br />
    <p>
      通过在左侧边栏部分“创建”中选择小部件类型来创建新小部件。<br />
    </p>
    <p>
      创建搜索和仪表板的一些技巧
    </p>
    <ul>
      <li><p>1.从您想回答的<b>问题</b>开始。定义您要解决的问题。</p></li>
      <li><p>2. <b>将数据限制为</b>只显示您想查看的数据点。</p></li>
      <li><p>3. <b>可视化</b>数据。它能回答你的问题吗？</p></li>
      <IfDashboard>
        <li><p>4.与您的同事<b>共享</b>仪表板。通过使用参数（包含在 <a href="https://www.graylog.org/graylog-enterprise-edition" target="_blank" rel="noopener noreferrer">企业版</a>）。</p></li>
      </IfDashboard>
    </ul>
    <p>
      您还可以查看 <DocumentationLink page={DocsHelper.PAGES.DASHBOARDS} text="文档" />，了解有关小部件创建的更多信息。
    </p>
  </StyledJumbotron>
);

const useHasWidgets = () => useStore(WidgetStore, (widgets) => widgets?.size > 0);

const Query = () => {
  const hasWidgets = useHasWidgets();

  return hasWidgets
    ? <WidgetGrid />
    : <NoWidgetsInfo />;
};

const memoizedQuery = React.memo(Query);
memoizedQuery.displayName = 'Query';

export default memoizedQuery;
