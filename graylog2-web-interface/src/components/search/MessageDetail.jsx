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
import Immutable from 'immutable';

import { Link } from 'components/common/router';
import { MessageDetailsDefinitionList, ClipboardButton, Icon, Timestamp } from 'components/common';
import { Button, ButtonGroup, Col, Label, Row } from 'components/bootstrap';
import StreamLink from 'components/streams/StreamLink';
import MessageFields from 'components/search/MessageFields';
import MessageDetailsTitle from 'components/search/MessageDetailsTitle';
import Routes from 'routing/Routes';
import AppConfig from 'util/AppConfig';

class MessageDetail extends React.Component {
  static propTypes = {
    renderForDisplay: PropTypes.func.isRequired,
    inputs: PropTypes.object,
    nodes: PropTypes.object,
    message: PropTypes.object.isRequired,
    streams: PropTypes.object.isRequired,
    customFieldActions: PropTypes.node,
  };

  static defaultProps = {
    inputs: undefined,
    nodes: undefined,
    customFieldActions: undefined,
  };

  _inputName = (inputId) => {
    const { inputs } = this.props;
    const input = inputs.get(inputId);

    return input ? <span style={{ wordBreak: 'break-word' }}>{input.title}</span> : '已删除的输入';
  };

  _nodeName = (nodeId) => {
    const { nodes } = this.props;
    const node = nodes.get(nodeId);
    let nodeInformation;

    if (node) {
      const nodeURL = Routes.node(nodeId);

      const nodeContent = (
        <>
          <Icon name="code-branch" />
          &nbsp;
          <span style={{ wordBreak: 'break-word' }}>{node.short_node_id}</span>&nbsp;/&nbsp;
          <span style={{ wordBreak: 'break-word' }}>{node.hostname}</span>
        </>
      );

      nodeInformation = AppConfig.isCloud()
        ? nodeContent
        : <a href={nodeURL}>{nodeContent}</a>;
    } else {
      nodeInformation = <span style={{ wordBreak: 'break-word' }}>已停止的节点</span>;
    }

    return nodeInformation;
  };

  _formatMessageActions = () => {
    const { message, customFieldActions } = this.props;

    if (!customFieldActions) {
      return <ButtonGroup className="pull-right" bsSize="small" />;
    }

    const messageUrl = message.index ? Routes.message_show(message.index, message.id) : '#';

    return (
      <ButtonGroup className="pull-right" bsSize="small">
        <Button href={messageUrl}>链接</Button>

        <ClipboardButton title="复制 ID" bsSize="small" text={message.id} />
      </ButtonGroup>
    );
  };

  render() {
    const { renderForDisplay, nodes, message, customFieldActions } = this.props;
    const streamIds = Immutable.Set(message.stream_ids);
    const streams = streamIds.map((id) => {
      const stream = this.props.streams.get(id);

      if (stream !== undefined) {
        return <li key={stream.id}><StreamLink stream={stream} /></li>;
      }

      return null;
    });

    // Legacy
    const viaRadio = message.source_radio_id
      ? (
        <span>
          通过 <em>{this._inputName(message.source_radio_input_id)}</em> 来源于 {this._nodeName(message.source_radio_id)}
        </span>
      )
      : null;

    const rawTimestamp = message.fields.timestamp;
    const timestamp = [
      <dt key={`dt-${rawTimestamp}`}>时间戳</dt>,
      <dd key={`dd-${rawTimestamp}`}><Timestamp dateTime={rawTimestamp} /></dd>,
    ];

    const receivedBy = message.source_input_id && message.source_node_id && nodes
      ? (
        <div>
          <dt>来源</dt>
          <dd>
            <em>{this._inputName(message.source_input_id)}</em>{' '}
            节点 {this._nodeName(message.source_node_id)}
            {viaRadio && <br />}
            {viaRadio}
          </dd>
        </div>
      )
      : null;

    const messageTitle = message.index
      ? (
        <Link to={Routes.message_show(message.index, message.id)}>
          {message.id}
        </Link>
      )
      : <span>{message.id} <Label bsStyle="warning">未存储</Label></span>;

    return (
      <div>
        <Row className="row-sm">
          <Col md={12}>
            {this._formatMessageActions()}
            <MessageDetailsTitle>
              <Icon name="envelope" />
              &nbsp;
              {messageTitle}
            </MessageDetailsTitle>
          </Col>
        </Row>
        <Row>
          <Col md={3}>
            <MessageDetailsDefinitionList>
              {timestamp}
              {receivedBy}

              <dt>存储索引</dt>
              <dd>{message.index ? message.index : '消息未存储'}</dd>

              { streamIds.size > 0 && <dt>进入消息流</dt> }
              {streamIds.size > 0
            && (
            <dd className="stream-list">
              <ul>
                {streams}
              </ul>
            </dd>
            )}
            </MessageDetailsDefinitionList>
          </Col>
          <Col md={9}>
            <div>
              <MessageFields message={message}
                             renderForDisplay={renderForDisplay}
                             customFieldActions={customFieldActions} />
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

export default MessageDetail;
