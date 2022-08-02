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

import type Widget from 'views/logic/widgets/Widget';
import type View from 'views/logic/views/View';
import { defaultCompare } from 'views/logic/DefaultCompare';
import { Row, Alert } from 'components/bootstrap';
import IfDashboard from 'views/components/dashboard/IfDashboard';
import IfSearch from 'views/components/search/IfSearch';
import Select from 'views/components/Select';

const sortOptions = (options) => options.sort(
  (option1, option2) => defaultCompare(option1.label, option2.label),
);

type Props = {
  selectWidget: (widget: { label: string, value: Widget }) => void,
  widgets: List<Widget>,
  view: View,
};

const WidgetSelection = ({ selectWidget, widgets, view }: Props) => {
  const widgetOption = (widget) => ({ label: view.getWidgetTitleByWidget(widget), value: widget });
  const widgetOptions = sortOptions(widgets.map((widget) => (widgetOption(widget))).toArray());

  return (
    <>
      <Row>
        <IfSearch>
          导出将包含您当前搜索的所有消息。<br />
          请选择一个消息表格以采用其字段。您可以在下一步中调整所有设置。
        </IfSearch>
        <IfDashboard>
          请选择您要为其导出搜索结果的消息表格。您可以在下一步调整其字段。<br />
          选择消息表等于使用选项“导出为 CSV”。在消息表操作菜单中。
        </IfDashboard>
      </Row>
      {widgets.size !== 0 ? (
        <Row>
          <label htmlFor="widget-selection">选择消息表格</label>
          <Select placeholder="选择消息表格"
                  onChange={selectWidget}
                  options={widgetOptions}
                  inputId="widget-selection" />
        </Row>
      ) : (
        <Row>
          <Alert bsStyle="warning">您需要创建一个消息表小部件来导出其结果.</Alert>
        </Row>
      )}
    </>
  );
};

export default WidgetSelection;
