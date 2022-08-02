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

const Wrapper = styled.div`
  padding: 12px 6px;
  
  h5 {
    font-weight: bold;
    margin: 0 0 6px;
  }
`;

const TabDisabledTimeRange = () => (
  <Wrapper>
    <h5>未选择日期/时间覆盖。</h5>
    <p>使用上面的选项卡选择要搜索的日期和时间范围。</p>
  </Wrapper>
);

export default TabDisabledTimeRange;
