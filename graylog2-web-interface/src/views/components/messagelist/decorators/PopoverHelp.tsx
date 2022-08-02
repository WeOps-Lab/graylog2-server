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

import { Button, Popover } from 'components/bootstrap';
import { OverlayTrigger } from 'components/common';
import DocumentationLink from 'components/support/DocumentationLink';
import DocsHelper from 'util/DocsHelper';

import DecoratorStyles from './decoratorStyles.css';

const PopoverHelp = () => {
  const popoverHelp = (
    <Popover id="decorators-help" className={DecoratorStyles.helpPopover}>
      <p className="description">
        装饰者可以即时修改搜索结果中显示的消息。这些更改不会被存储，而只是
        显示在搜索结果中。装饰器配置存储<strong>每个流</strong>。
      </p>
      <p className="description">
        使用拖放来修改装饰器的处理顺序。
      </p>
      <p>
        在 <DocumentationLink page={DocsHelper.PAGES.DECORATORS} text="文档" /> 中阅读有关消息装饰器的更多信息。
      </p>
    </Popover>
  );

  return (
    <OverlayTrigger trigger="click" rootClose placement="right" overlay={popoverHelp}>
      <Button bsStyle="link" className={DecoratorStyles.helpLink}>什么是消息装饰器?</Button>
    </OverlayTrigger>
  );
};

PopoverHelp.propTypes = {};

export default PopoverHelp;
