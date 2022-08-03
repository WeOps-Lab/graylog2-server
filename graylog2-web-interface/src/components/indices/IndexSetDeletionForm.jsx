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
import naturalSort from 'javascript-natural-sort';

import { Spinner } from 'components/common';
import { Alert, Row, Col, Input } from 'components/bootstrap';
import BootstrapModalForm from 'components/bootstrap/BootstrapModalForm';
import { StreamsStore } from 'stores/streams/StreamsStore';

class IndexSetDeletionForm extends React.Component {
  static propTypes = {
    indexSet: PropTypes.object.isRequired,
    onDelete: PropTypes.func.isRequired,
  };

  state = {
    assignedStreams: undefined,
    deleteIndices: true,
  };

  forms = {};

  _onModalOpen = () => {
    StreamsStore.load((streams) => {
      const assignedStreams = [];

      streams.forEach((stream) => {
        if (stream.index_set_id === this.props.indexSet.id) {
          assignedStreams.push({ id: stream.id, title: stream.title });
        }
      });

      this.setState({ assignedStreams: assignedStreams });
    });
  };

  _onRemoveClick = (e) => {
    this.setState({ deleteIndices: e.target.checked });
  };

  open = () => {
    this.forms[`index-set-deletion-modal-${this.props.indexSet.id}`].open();
  };

  close = () => {
    this.forms[`index-set-deletion-modal-${this.props.indexSet.id}`].close();
  };

  _isLoading = () => {
    return !this.state.assignedStreams;
  };

  _isDeletable = () => {
    return !this._isLoading() && this.state.assignedStreams.length < 1 && !this.props.indexSet.default;
  };

  _modalContent = () => {
    if (this._isLoading()) {
      return <Spinner text="加载指定消息流中..." />;
    }

    if (this.props.indexSet.default) {
      return (
        <Row>
          <Col md={12}>
            <Alert bsStyle="danger">
              不能删除索引集,因为这是默认的索引集.
            </Alert>
          </Col>
        </Row>
      );
    }

    if (!this._isDeletable()) {
      const assignedStreams = this.state.assignedStreams
        .sort((s1, s2) => naturalSort(s1.title, s2.title))
        .map((stream) => <li key={`stream-id-${stream.id}`}>{stream.title}</li>);

      return (
        <div>
          <Row>
            <Col md={12}>
              <Alert bsStyle="danger">
                无法删除关联了消息流的索引集.必须先删除关联的消息流才可删除该索引集.
              </Alert>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <h4>关联的消息流:</h4>
              <ul>
                {assignedStreams}
              </ul>
            </Col>
          </Row>
        </div>
      );
    }

    return (
      <Row>
        <Col md={12}>
          <Input id="remove-data-checkbox"
                 type="checkbox"
                 label="确定删除索引集?"
                 help={<span>与该索引集相关的所有索引都将从 Elasticsearch 中删除.</span>}
                 checked={this.state.deleteIndices}
                 onChange={this._onRemoveClick} />
        </Col>
      </Row>
    );
  };

  _onDelete = (e) => {
    e.preventDefault();

    if (this._isDeletable()) {
      this.props.onDelete(this.props.indexSet, this.state.deleteIndices);
    }
  };

  render() {
    return (
      <BootstrapModalForm ref={(elem) => { this.forms[`index-set-deletion-modal-${this.props.indexSet.id}`] = elem; }}
                          title={`删除索引集 "${this.props.indexSet.title}"?`}
                          onModalOpen={this._onModalOpen}
                          onSubmitForm={this._onDelete}
                          submitButtonText="删除"
                          submitButtonDisabled={!this._isDeletable()}>
        {this._modalContent()}
      </BootstrapModalForm>
    );
  }
}

export default IndexSetDeletionForm;
