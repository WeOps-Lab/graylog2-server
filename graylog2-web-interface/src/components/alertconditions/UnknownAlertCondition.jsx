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

import { Alert, Col, DropdownButton, MenuItem } from 'components/bootstrap';
import { EntityListItem } from 'components/common';

class UnknownAlertCondition extends React.Component {
  static propTypes = {
    alertCondition: PropTypes.object.isRequired,
    stream: PropTypes.object,
    onDelete: PropTypes.func.isRequired,
  };

  render() {
    const condition = this.props.alertCondition;
    const { stream } = this.props;

    const actions = [
      <DropdownButton key="actions-button" title="Actions" pullRight id={`more-actions-dropdown-${condition.id}`}>
        <MenuItem onSelect={this.props.onDelete}>删除</MenuItem>
      </DropdownButton>,
    ];

    const content = (
      <Col md={12}>
        <Alert bsStyle="warning">
          无法解析告警条件,这非常有可能是因为缺少了相关的插件.
        </Alert>
      </Col>
    );

    return (
      <EntityListItem key={`entry-list-${condition.id}`}
                      title="Unknown condition"
                      titleSuffix={`(${condition.type})`}
                      description={stream ? <span>监控消息流 <em>{stream.title}</em></span> : '没有对任何消息流进行告警配置'}
                      actions={actions}
                      contentRow={content} />
    );
  }
}

export default UnknownAlertCondition;
