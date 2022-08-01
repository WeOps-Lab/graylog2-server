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
import styled, { css } from 'styled-components';
// eslint-disable-next-line no-restricted-imports
import createReactClass from 'create-react-class';

import { Col, Row } from 'components/bootstrap';
import { Pluralize } from 'components/common';

const SimulationChangesWrap = styled.div`
  padding-top: 15px;

  dl {
    margin-bottom: 10px;
    margin-top: 5px;
  }

  dd {
    padding: 1px 9px 3px;
  }

  dt {
    margin-top: 1px;
    padding: 3px 9px 1px;

    &::after {
      content: ": ";
    }

    &:first-child {
      border-radius: 4px 4px 0 0;
    }

    ~ dd:last-child {
      border-radius: 0 0 4px 4px;
    }
  }
`;

const OriginalChanges = styled.div`
  margin-top: 10px;
`;

const FieldResultWrap = styled.div(({ resultType, theme }) => {
  const { success, danger, info } = theme.colors.variant.light;
  const types = {
    added: success,
    removed: danger,
    mutated: info,
  };

  return `
    dt,
    dd {
      background-color: ${types[resultType]};
      color: ${theme.utils.contrastingColor(types[resultType])};
    }
  `;
});

const FieldValue = styled.dd(({ removed, theme }) => css`
  font-family: ${theme.fonts.family.monospace};

  ${removed && css`
    text-decoration: line-through;
    font-style: italic;
  `}
`);

const SimulationChanges = createReactClass({
  displayName: 'SimulationChanges',

  propTypes: {
    originalMessage: PropTypes.object.isRequired,
    simulationResults: PropTypes.object.isRequired,
  },

  _isOriginalMessageRemoved(originalMessage, processedMessages) {
    return !processedMessages.find((message) => message.id === originalMessage.id);
  },

  _formatFieldTitle(field) {
    return <dt key={`${field}-key`}>{field}</dt>;
  },

  _formatFieldValue(field, value, isRemoved = false) {
    return <FieldValue key={`${field}-value`} removed={isRemoved}>{String(value)}</FieldValue>;
  },

  _formatAddedFields(addedFields) {
    const keys = Object.keys(addedFields);

    if (keys.length === 0) {
      return null;
    }

    const formattedFields = [];

    keys.sort().forEach((field) => {
      formattedFields.push(this._formatFieldTitle(field));
      formattedFields.push(this._formatFieldValue(field, addedFields[field]));
    });

    return (
      <FieldResultWrap resultType="added">
        <h4>增加的字段</h4>
        <dl>
          {formattedFields}
        </dl>
      </FieldResultWrap>
    );
  },

  _formatRemovedFields(removedFields) {
    const keys = Object.keys(removedFields);

    if (keys.length === 0) {
      return null;
    }

    const formattedFields = [];

    keys.sort().forEach((field) => {
      formattedFields.push(this._formatFieldTitle(field));
      formattedFields.push(this._formatFieldValue(field, removedFields[field]));
    });

    return (
      <FieldResultWrap resultType="removed">
        <h4>移除的字段</h4>
        <dl>
          {formattedFields}
        </dl>
      </FieldResultWrap>
    );
  },

  _formatMutatedFields(mutatedFields) {
    const keys = Object.keys(mutatedFields);

    if (keys.length === 0) {
      return null;
    }

    const formattedFields = [];

    keys.sort().forEach((field) => {
      formattedFields.push(this._formatFieldTitle(field));
      formattedFields.push(this._formatFieldValue(`${field}-original`, mutatedFields[field].before, true));
      formattedFields.push(this._formatFieldValue(field, mutatedFields[field].after));
    });

    return (
      <FieldResultWrap resultType="mutated">
        <h4>更改的字段</h4>
        <dl>
          {formattedFields}
        </dl>
      </FieldResultWrap>
    );
  },

  _getOriginalMessageChanges() {
    const { originalMessage, simulationResults } = this.props;
    const processedMessages = simulationResults.messages;

    if (this._isOriginalMessageRemoved(originalMessage, processedMessages)) {
      return <p>Original message would be dropped during processing.</p>;
    }

    const processedMessage = processedMessages.find((message) => message.id === originalMessage.id);

    const formattedAddedFields = this._formatAddedFields(processedMessage.decoration_stats.added_fields);
    const formattedRemovedFields = this._formatRemovedFields(processedMessage.decoration_stats.removed_fields);
    const formattedMutatedFields = this._formatMutatedFields(processedMessage.decoration_stats.changed_fields);

    if (!formattedAddedFields && !formattedRemovedFields && !formattedMutatedFields) {
      return <p>处理过程中将删除原始消息.</p>;
    }

    return (
      <OriginalChanges>
        {formattedAddedFields}
        {formattedRemovedFields}
        {formattedMutatedFields}
      </OriginalChanges>
    );
  },

  _formatOriginalMessageChanges() {
    const { originalMessage } = this.props;

    return (
      <Row className="row-sm">
        <Col md={12}>
          <h3>
            原始消息{' '}
            <small><em>{originalMessage.id}</em></small>
          </h3>
          {this._getOriginalMessageChanges()}
        </Col>
      </Row>
    );
  },

  _formatOtherChanges() {
    const { originalMessage, simulationResults } = this.props;

    const createdMessages = simulationResults.messages.filter((message) => message.id !== originalMessage.id);

    if (createdMessages.length === 0) {
      return null;
    }

    return (
      <Row className="row-sm">
        <Col md={12}>
          <h3>其它更改</h3>
          <p>
            这里将有 {createdMessages.length}{' '}
            <Pluralize singular="消息" plural="消息" value={createdMessages.length} /> 被创建.{' '}
            切换到 <em>结果预览</em> 查看{' '}
            <Pluralize singular="它们" plural="它们" value={createdMessages.length} />.
          </p>
        </Col>
      </Row>
    );
  },

  render() {
    return (
      <SimulationChangesWrap>
        {this._formatOriginalMessageChanges()}
        {this._formatOtherChanges()}
      </SimulationChangesWrap>
    );
  },
});

export default SimulationChanges;
