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

import { Alert } from 'components/bootstrap';
import MessageShow from 'components/search/MessageShow';

const SimulationPreview = ({ simulationResults, streams }) => {
  const { messages } = simulationResults;

  if (messages.length === 0) {
    return (
      <Alert bsStyle="info">
        <p><strong>消息将被删除</strong></p>
        <p>
          流水线处理器将会删除这样的消息.这样意味着这消息<strong>将不会被存储</strong>,将无法用于搜索、告警、输出、或者仪表盘.
        </p>
      </Alert>
    );
  }

  const formattedMessages = messages.map((message) => {
    return (
      <MessageShow key={message.id}
                   message={message}
                   streams={streams} />
    );
  });

  return <div className="message-preview-wrapper">{formattedMessages}</div>;
};

SimulationPreview.propTypes = {
  simulationResults: PropTypes.object.isRequired,
  streams: PropTypes.object.isRequired,
};

export default SimulationPreview;
