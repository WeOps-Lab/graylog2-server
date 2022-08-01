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

import { Modal, Button } from 'components/bootstrap';
import BootstrapModalWrapper from 'components/bootstrap/BootstrapModalWrapper';

class VerboseMessageModal extends React.Component {
  static propTypes = {
    collectorName: PropTypes.string.isRequired,
    collectorVerbose: PropTypes.string.isRequired,
  };

  open = () => {
    this.sourceModal.open();
  };

  hide = () => {
    this.sourceModal.close();
  };

  render() {
    return (
      <BootstrapModalWrapper ref={(c) => { this.sourceModal = c; }} bsSize="large">
        <Modal.Header closeButton>
          <Modal.Title><span><em>{this.props.collectorName}</em>的错误信息</span></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="configuration">
            <pre>
              {this.props.collectorVerbose || '暂无信息'}
            </pre>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" onClick={this.hide}>关闭</Button>
        </Modal.Footer>
      </BootstrapModalWrapper>
    );
  }
}

export default VerboseMessageModal;
