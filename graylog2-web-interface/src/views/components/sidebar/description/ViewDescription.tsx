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
import { useContext } from 'react';
import PropTypes from 'prop-types';

import type QueryResult from 'views/logic/QueryResult';
import type { ViewMetaData } from 'views/stores/ViewMetadataStore';
import ViewTypeContext from 'views/components/contexts/ViewTypeContext';
import { Icon } from 'components/common';
import ViewTypeLabel from 'views/components/ViewTypeLabel';

import SearchResultOverview from './SearchResultOverview';

import SectionInfo from '../SectionInfo';
import SectionSubheadline from '../SectionSubheadline';

type Props = {
  results: QueryResult,
  viewMetadata: ViewMetaData,
};

const ViewDescription = ({ results, viewMetadata }: Props) => {
  const isAdHocSearch = !viewMetadata.id;
  const viewType = useContext(ViewTypeContext);
  const viewTypeLabel = viewType ? ViewTypeLabel({ type: viewType }) : '';
  const resultsSection = (
    <>
      <SectionSubheadline>
        执行
      </SectionSubheadline>
      <p>

        <SearchResultOverview results={results} />
      </p>
    </>
  );

  if (isAdHocSearch) {
    return (
      <>
        <SectionInfo>保存搜索或将其导出到仪表板以添加自定义摘要和描述。</SectionInfo>
        {resultsSection}
      </>
    );
  }

  return (
    <>
      {(!viewMetadata.summary || !viewMetadata.description) && (
        <SectionInfo>
          要为此 {viewTypeLabel} 添加描述和摘要，请单击搜索栏中的 <Icon name="ellipsis-h" /> 图标以打开其操作菜单。动作菜单包括选项“编辑元数据”。
        </SectionInfo>
      )}
      {resultsSection}
      <SectionSubheadline>
        Search
      </SectionSubheadline>
      <p>
        {viewMetadata.summary || <i>此 {viewTypeLabel} 没有摘要。</i>}
      </p>
      <p>
        {viewMetadata.description || <i>此 {viewTypeLabel} 没有描述。</i>}
      </p>
    </>
  );
};

ViewDescription.propTypes = {
  results: PropTypes.object.isRequired,
  viewMetadata: PropTypes.shape({
    activeQuery: PropTypes.string,
    description: PropTypes.string,
    id: PropTypes.string,
    summary: PropTypes.string,
    title: PropTypes.string,
  }).isRequired,
};

export default ViewDescription;
