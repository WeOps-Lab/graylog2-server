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
import React from 'react';
import PropTypes from 'prop-types';

import { Popover } from 'components/bootstrap';

class EventKeyHelpPopover extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
  };

  render() {
    const { id, ...otherProps } = this.props;

    return (
      <Popover id={id} title="更多关于Event Keys的介绍" {...otherProps}>
        <p>
          Event Keys是用于将事件分组的字段.为每个唯一键创建一个组,所以DataInsight将生成尽可能多的能找到唯一键的事件.例如：
        </p>
        <p>
          <b>没有Event Keys:</b> 每个事件一个 <em>登录失败</em> 的消息.<br />
          <b>有Event Key <code>username</code>:</b> 按用户名分组,每个用户名一个 <em>登录失败</em> 的消息.
        </p>
      </Popover>
    );
  }
}

export default EventKeyHelpPopover;
