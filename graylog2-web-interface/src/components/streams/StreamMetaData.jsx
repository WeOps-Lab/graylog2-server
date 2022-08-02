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
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import CollapsibleStreamRuleList from 'components/streamrules/CollapsibleStreamRuleList';
import { Pluralize } from 'components/common';
import { Button } from 'components/bootstrap';

import StreamThroughput from './StreamThroughput';

const StreamMetaDataWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const StreamMetaData = ({ isDefaultStream, stream, streamRuleTypes, permissions }) => {
  let verbalMatchingType;
  const [expanded, setExpanded] = useState(false);
  const toggleText = expanded ? '隐藏' : '显示';

  if (stream.is_default) {
    return '默认消息流包含所有消息.';
  }

  if (stream.rules.length === 0) {
    return '没有包含任何规则.';
  }

  switch (stream.matching_type) {
    case 'OR': verbalMatchingType = '至少一个'; break;
    default:
    case 'AND': verbalMatchingType = '所有'; break;
  }

  const _onHandleToggle = () => {
    setExpanded(!expanded);
  };

  return (
    <>
      <StreamMetaDataWrapper>
        <StreamThroughput streamId={stream.id} />.

        <span>
        &nbsp;必须匹配 {verbalMatchingType} 消息流规则 {stream.rules.length}&nbsp;
          <Pluralize value={stream.rules.length} plural="rules" singular="rule" />.
        </span>

        {!isDefaultStream && (
          <Button bsStyle="link"
                  bsSize="xsmall"
                  onClick={_onHandleToggle}>
            {toggleText} 消息流规则
          </Button>
        )}
      </StreamMetaDataWrapper>

      {!isDefaultStream && (
        <CollapsibleStreamRuleList key={`streamRules-${stream.id}`}
                                   stream={stream}
                                   streamRuleTypes={streamRuleTypes}
                                   permissions={permissions}
                                   expanded={expanded} />
      )}
    </>
  );
};

StreamMetaData.propTypes = {
  isDefaultStream: PropTypes.bool,
  stream: PropTypes.shape({
    id: PropTypes.string,
    is_default: PropTypes.bool,
    rules: PropTypes.array,
    matching_type: PropTypes.string,
  }).isRequired,
  streamRuleTypes: PropTypes.arrayOf(PropTypes.object).isRequired,
  permissions: PropTypes.array.isRequired,
};

StreamMetaData.defaultProps = {
  isDefaultStream: false,
};

export default StreamMetaData;
