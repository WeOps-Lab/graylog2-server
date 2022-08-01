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

import { Panel, Input } from 'components/bootstrap';
import Select from 'components/common/Select';
import { naturalSortIgnoreCase } from 'util/SortUtils';
import Spinner from 'components/common/Spinner';
import type { LookupTable } from 'logic/lookup-tables/types';

const StyledInlineCode = styled('code')`
  margin: 0 0.25em;
  white-space: nowrap;
`;

type Props = {
  onChange: (fieldName: string, value: string) => void
  lookupTables: Array<LookupTable>
  identifier: string | number,
  defaultExpandHelp?: boolean,
  parameter?: {
    lookupTable?: string,
    key?: string,
    defaultValue?: string
    name?: string,
  },
  validationState?: {
    lookupTable?: [string, string],
    key?: [string, string],
  }
};

const LookupTableParameterEdit = ({
  validationState,
  onChange,
  lookupTables,
  identifier,
  parameter,
  defaultExpandHelp,
}: Props) => {
  const { lookupTable, key: tableKey, defaultValue, name } = parameter;
  const parameterSyntax = `$${name}$`;

  const _handleChange = (fieldName: string) => (value) => {
    onChange(fieldName, value);
  };

  const _handleInputChange = (attributeName: string) => ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => _handleChange(attributeName)(value);

  if (!lookupTables) {
    return <Spinner text="数据字典加载中....." />;
  }

  const lookupTableOptions = lookupTables.sort((lt1, lt2) => naturalSortIgnoreCase(lt1.title, lt2.title))
    .map((table) => ({ label: table.title, value: table.name }));

  return (
    <>
      <Input id={`lookup-table-parameter-table-${identifier}`}
             name="query-param-table-name"
             label="数据字典"
             bsStyle={validationState?.lookupTable?.[0]}
             error={validationState?.lookupTable?.[1]}
             help="选择 DataInsight 应该用来获取值的数据字典.">
        <Select placeholder="Select lookup table"
                inputProps={{ 'aria-label': '选择数据字典' }}
                onChange={_handleChange('lookupTable')}
                options={lookupTableOptions}
                value={lookupTable}
                autoFocus
                clearable={false}
                required />
      </Input>
      <Input type="text"
             id={`lookup-table-parameter-key-${identifier}`}
             label="数据字典的Key"
             name="key"
             defaultValue={tableKey}
             onChange={_handleInputChange('key')}
             bsStyle={validationState?.key?.[0]}
             help="选择数据字典的Key"
             error={validationState?.key?.[0] === 'error' ? validationState?.key?.[1] : undefined}
             spellCheck={false}
             required />
      <Input id={`lookup-table-parameter-default-value-${identifier}`}
             type="text"
             name="defaultValue"
             label="默认值"
             help="选择默认值"
             defaultValue={defaultValue}
             spellCheck={false}
             onChange={_handleInputChange('defaultValue')} />

      <Panel id="lookup-table-parameter-help" defaultExpanded={defaultExpandHelp}>
        <Panel.Heading>
          <Panel.Title toggle>
            如何使用数据字典的参数
          </Panel.Title>
        </Panel.Heading>
        <Panel.Collapse>
          <Panel.Body>
            <h5>一般用法</h5>
            <p>
              声明后，参数
              <StyledInlineCode>{parameterSyntax}</StyledInlineCode>
              在您的查询中，将替换为数据字典中的结果列表。
              结果列表将以 Lucene BooleanQuery 的形式呈现。例如。：
              <StyledInlineCode>(“foo”或“bar”或“baz”)</StyledInlineCode>
            </p>
            <h5>空查找结果列表的行为</h5>
            <p>
              仅当存在参数值时才执行事件定义查询。
              如果查找结果为空，则执行将被跳过并被视为找到 <i>Search Query</i>
              没有消息。如果需要执行产生所需搜索结果的 <i>默认值</i>
              需要提供。例如，（取决于用例）通配符如
              <StyledInlineCode>*</StyledInlineCode>
              可以是有意义的默认值。
            </p>
            <h5>限制</h5>
            <p>
              请注意，支持的最大结果数为 1024。如果数据字典返回
              更多结果，则不执行查询。
            </p>
          </Panel.Body>
        </Panel.Collapse>
      </Panel>
    </>
  );
};

LookupTableParameterEdit.defaultProps = {
  parameter: {},
  validationState: {},
  defaultExpandHelp: true,
};

export default LookupTableParameterEdit;
