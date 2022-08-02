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

import type { EditWidgetComponentProps, WidgetComponentProps } from 'views/types';
import { Icon } from 'components/common';
import ClipboardButton from 'components/common/ClipboardButton';

const Container = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const IconContainer = styled.div`
  margin: 3px 15px 0 0;
`;

const Description = styled.div`
  max-width: 700px;
`;

const Row = styled.div`
  margin-bottom: 5px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const OrderedList = styled.ol`
  padding: 0;
  list-style: decimal inside none;
`;

const UnknownWidget: React.ComponentType<WidgetComponentProps & EditWidgetComponentProps> = ({ config, type }: WidgetComponentProps & EditWidgetComponentProps) => (
  <Container>
    <IconContainer>
      <Icon name="question" size="3x" />
    </IconContainer>
    <Description>
      <Row>
        <strong>未知组件: {type}</strong>
      </Row>
      <Row>
        未知的小组件<strong>{type}</strong>.可能由于以下原因导致:
      </Row>

      <Row>
        <OrderedList>
          <li>创建了一个缺失的小组件.</li>
          <li>这个小部件是遗留仪表板的一部分，由不再可用的插件创建.</li>
        </OrderedList>
      </Row>

      <Row>
        你能怎么办？您可以再次加载插件，请与原始插件作者联系以获取
        使用DataInsight3.2+，如果不再需要，则删除该小部件。
      </Row>
      <Row>
        获取你可以复制此小组件配置到粘贴板:
        <ClipboardButton title={<Icon name="copy" size="sm" />} text={JSON.stringify(config, null, 2)} bsSize="xsmall" />
      </Row>
    </Description>
  </Container>
);

export default UnknownWidget;
