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
import type * as Immutable from 'immutable';

import { LinkContainer } from 'components/common/router';
import Routes from 'routing/Routes';
import { ClipboardButton } from 'components/common';
import { Button, ButtonGroup, DropdownButton, MenuItem } from 'components/bootstrap';
import SurroundingSearchButton from 'components/search/SurroundingSearchButton';
import type { SearchesConfig } from 'components/search/SearchConfig';

type Props = {
  index: string,
  id: string,
  fields: {
    [key: string]: unknown,
  },
  decorationStats: any,
  disabled: boolean,
  disableSurroundingSearch: boolean,
  disableTestAgainstStream: boolean,
  showOriginal: boolean,
  toggleShowOriginal: () => void,
  streams: Immutable.List<any>,
  searchConfig: SearchesConfig,
};

const _getTestAgainstStreamButton = (streams: Immutable.List<any>, index: string, id: string) => {
  const streamList = streams.map((stream) => {
    if (stream.is_default) {
      return <MenuItem key={stream.id} disabled title="无法针对默认流进行测试">{stream.title}</MenuItem>;
    }

    return (
      <LinkContainer key={stream.id}
                     to={Routes.stream_edit_example(stream.id, index, id)}>
        <MenuItem>{stream.title}</MenuItem>
      </LinkContainer>
    );
  });

  return (
    <DropdownButton pullRight
                    bsSize="small"
                    title="针对消息流进行测试"
                    id="select-stream-dropdown">
      {streamList || <MenuItem header>没有可用的消息流</MenuItem>}
    </DropdownButton>
  );
};

const MessageActions = ({ index, id, fields, decorationStats, disabled, disableSurroundingSearch, disableTestAgainstStream, showOriginal, toggleShowOriginal, streams, searchConfig }: Props) => {
  if (disabled) {
    return <ButtonGroup className="pull-right" bsSize="small" />;
  }

  const messageUrl = index ? Routes.message_show(index, id) : '#';

  const { timestamp, ...remainingFields } = fields;

  const surroundingSearchButton = disableSurroundingSearch || (
    <SurroundingSearchButton id={id}
                             timestamp={timestamp as string}
                             searchConfig={searchConfig}
                             messageFields={remainingFields} />
  );

  const showChanges = decorationStats && <Button onClick={toggleShowOriginal} active={showOriginal}>Show changes</Button>;

  return (
    <ButtonGroup className="pull-right" bsSize="small">
      {showChanges}
      <Button href={messageUrl}>固定链接</Button>

      <ClipboardButton title="复制" text={id} bsSize="small" />
      {surroundingSearchButton}
      {disableTestAgainstStream ? null : _getTestAgainstStreamButton(streams, index, id)}
    </ButtonGroup>
  );
};

export default MessageActions;
