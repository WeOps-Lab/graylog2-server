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

import { DocumentationLink } from 'components/support';
import { Icon, Center } from 'components/common';
import DocsHelper from 'util/DocsHelper';
import PortaledPopover from 'views/components/common/PortaledPopover';

import styles from './MessageWidgets.css';

const popover = (
  <span>
    <p>
      如果您的问题在{' '} 中没有得到解答，请随时咨询社区
      <DocumentationLink page={DocsHelper.PAGES.WELCOME} text="文档" />.
    </p>

    <ul>
      <li>
        <Icon name="users" />&nbsp;
        <a href="https://www.graylog.org/community-support/" target="_blank" rel="noopener noreferrer">社区支持</a>
      </li>
      <li>
        <Icon name="github-alt" type="brand" />&nbsp;
        <a href="https://github.com/Graylog2/graylog2-server/issues" target="_blank" rel="noopener noreferrer">问题反馈</a>
      </li>
      <li>
        <Icon name="heart" />&nbsp;
        <a href="https://www.graylog.org/professional-support" target="_blank" rel="noopener noreferrer">专业支持</a>
      </li>
    </ul>
  </span>
);

const EmptyResultWidget = () => (
  <Center>
    <Icon name="times" size="3x" className={styles.iconMargin} />
    <div>
      <strong>
        Your search returned no results, try changing the used time range or the search query.{' '}
      </strong>

      <br />
      Take a look at the{' '}
      <DocumentationLink page={DocsHelper.PAGES.SEARCH_QUERY_LANGUAGE} text="documentation" />{' '}
      if you need help with the search syntax or the time range selector.
      Or <PortaledPopover popover={popover} title="Need help?">click here</PortaledPopover> if you are stuck!
    </div>
  </Center>
);

EmptyResultWidget.propTypes = {};

export default EmptyResultWidget;
