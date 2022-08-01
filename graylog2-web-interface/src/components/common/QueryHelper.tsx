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
import styled from 'styled-components';

import { OverlayTrigger, Icon } from 'components/common';
import { Popover, Table, Button } from 'components/bootstrap';

const COMMON_FIELD_MAP = {
  id: (entityName) => `${entityName} 的 ID，它是唯一的引用`,
  title: (entityName) => `${entityName} 的标题`,
  name: (entityName) => `${entityName} 的名称`,
  description: (entityName) => `${entityName} 的简短描述`,
  summary: (entityName) => `${entityName} 的详细摘要`,
};

type CommonFields = keyof typeof COMMON_FIELD_MAP;

type Props = {
  commonFields?: Array<CommonFields>,
  fieldMap?: { [field: string]: string },
  example?: string,
  entityName?: string,
};

const WidePopover = styled(Popover)`
  max-width: 500px;
`;

const QueryHelpButton = styled(Button)`
  padding: 6px 8px;
`;

const row = (field, description) => (
  <tr key={`row-field-${field}`}>
    <td>{field}</td>
    <td>{description}</td>
  </tr>
);

const defaultExample = (
  <>
    <p>
      查找描述中包含安全性的实体：<br />
      <code>description:security</code><br />
    </p>
    <p>
      查找 id 为 5f4dfb9c69be46153b9a9a7b 的实体：<br />
      <code>id:5f4dfb9c69be46153b9a9a7b</code><br />
    </p>
  </>
);

const queryHelpPopover = (commonFields, fieldMap, example, entityName) => (
  <WidePopover id="team-search-query-help" title="Search Syntax Help">
    <p><strong>可用的搜索字段</strong></p>
    <Table condensed>
      <thead>
        <tr>
          <th>字段</th>
          <th>描述</th>
        </tr>
      </thead>
      <tbody>
        {commonFields.map((field) => row(field, COMMON_FIELD_MAP[field](entityName)))}
        {Object.keys(fieldMap).map((field) => row(field, fieldMap[field]))}
      </tbody>
    </Table>
    <p><strong>示例</strong></p>
    {example || defaultExample}
  </WidePopover>
);

const QueryHelper = ({ commonFields, fieldMap, example, entityName }: Props) => (
  <OverlayTrigger trigger="click" rootClose placement="right" overlay={queryHelpPopover(commonFields, fieldMap, example, entityName)}>
    <QueryHelpButton bsStyle="link"><Icon name="question-circle" /></QueryHelpButton>
  </OverlayTrigger>
);

QueryHelper.defaultProps = {
  commonFields: ['id', 'title', 'description'],
  fieldMap: {},
  example: undefined,
  entityName: 'entity',
};

export default QueryHelper;
