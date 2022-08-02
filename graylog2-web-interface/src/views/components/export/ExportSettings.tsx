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
import type { List } from 'immutable';
import { Field } from 'formik';

import type FieldTypeMapping from 'views/logic/fieldtypes/FieldTypeMapping';
import type Widget from 'views/logic/widgets/Widget';
import type View from 'views/logic/views/View';
import { Input, HelpBlock, Row } from 'components/bootstrap';
import FieldSelect from 'views/components/widgets/FieldSelect';
import IfDashboard from 'views/components/dashboard/IfDashboard';
import IfSearch from 'views/components/search/IfSearch';
import ExportFormatSelection from 'views/components/export/ExportFormatSelection';

import CustomExportSettings from './CustomExportSettings';

type ExportSettingsType = {
  fields: List<FieldTypeMapping>,
  selectedWidget: Widget | undefined | null,
  view: View,
};

const SelectedWidgetInfo = ({ selectedWidget, view }: { selectedWidget: Widget, view: View }) => {
  const selectedWidgetTitle = view.getWidgetTitleByWidget(selectedWidget);

  return (
    <Row>
      <i>
        <IfSearch>
          {selectedWidget && `以下设置基于消息表格: ${selectedWidgetTitle}`}<br />
        </IfSearch>
        <IfDashboard>
          {selectedWidget && `您当前正在导出消息表格的搜索结果: ${selectedWidgetTitle}`}<br />
        </IfDashboard>
      </i>
    </Row>
  );
};

const ExportSettings = ({
  fields,
  selectedWidget,
  view,
}: ExportSettingsType) => {
  return (
    <>
      <Row>
        <ExportFormatSelection />
      </Row>

      {selectedWidget && <SelectedWidgetInfo selectedWidget={selectedWidget} view={view} />}
      <Row>
        <p>
          定义文件的字段。您可以通过拖放更改字段顺序。<br />
        </p>
        {selectedWidget && (
          <p>
            导出支持由装饰器创建的字段，这些字段是消息表的一部分，但它们目前不出现在字段列表中。如果要导出修饰字段，只需输入其名称即可。
          </p>
        )}
        <p>
          完成配置后，单击<q>开始下载</q>。
        </p>
      </Row>
      <Row>
        <Field name="selectedFields">
          {({ field: { name, value, onChange } }) => (
            <>
              <label htmlFor={name}>要导出的字段</label>
              <FieldSelect fields={fields}
                           onChange={(newFields) => {
                             const newFieldsValue = newFields.map(({ value: field }) => ({ field }));

                             return onChange({ target: { name, value: newFieldsValue } });
                           }}
                           value={value}
                           allowOptionCreation={!!selectedWidget}
                           inputId={name} />
            </>
          )}
        </Field>
      </Row>
      <Row>
        <Field name="limit">
          {({ field: { name, value, onChange } }) => (
            <>
              <label htmlFor={name}>消息限制</label>
              <Input type="number"
                     id={name}
                     name={name}
                     onChange={onChange}
                     min={1}
                     step={1}
                     value={value} />
              <HelpBlock>
                消息以块的形式加载。如果定义了限制，则将检索直到达到限制的所有块。这意味着传递的消息总数可能高于定义的限制。
              </HelpBlock>
            </>
          )}
        </Field>
      </Row>

      <CustomExportSettings widget={selectedWidget} />
    </>
  );
};

export default ExportSettings;
