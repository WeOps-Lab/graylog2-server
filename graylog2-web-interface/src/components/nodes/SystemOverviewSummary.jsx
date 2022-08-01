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
import styled from 'styled-components';

import StringUtils from 'util/StringUtils';

const NodeState = styled.dl`
  margin-top: 0;
  margin-bottom: 0;

  dt {
    float: left;
  }

  dd {
    margin-left: 180px;
  }
`;

export const SystemOverviewSummary = ({information}) => {
  const lbStatus = information.lb_status.toUpperCase();

  return (
    <NodeState>
      <dt>当前生命周期状态:</dt>
      <dd>{StringUtils.capitalizeFirstLetter(information.lifecycle)}</dd>
      <dt>消息处理:</dt>
      <dd>{information.is_processing ? '启用' : '禁用'}</dd>
      <dt>负载均衡器:</dt>
      <dd className={lbStatus === 'DEAD' ? 'text-danger' : ''}>{lbStatus}</dd>
    </NodeState>
  );
};

SystemOverviewSummary.propTypes = {
  information: PropTypes.object.isRequired,
};

export default SystemOverviewSummary;
