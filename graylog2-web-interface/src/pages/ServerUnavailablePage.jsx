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
import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';

import { Button, Modal, Well } from 'components/bootstrap';
import { Icon } from 'components/common';
import DocumentTitle from 'components/common/DocumentTitle';
import authStyles from 'theme/styles/authStyles';
import { qualifyUrl } from 'util/URLUtils';

const StyledIcon = styled(Icon)`
  margin-left: 6px;
`;

const ServerUnavailableStyles = createGlobalStyle`
  ${authStyles}
`;

const ServerUnavailablePage = ({ server }) => {
  const [showDetails, setShowDetails] = useState(false);

  const _toggleDetails = () => setShowDetails(!showDetails);

  const _formatErrorMessage = () => {
    if (!showDetails) {
      return null;
    }

    const noInformationMessage = (
      <div>
        <hr />
        <p>没有可用的信息.</p>
      </div>
    );

    if (!server?.error) {
      return noInformationMessage;
    }

    const { error } = server;

    const errorDetails = [];

    if (error.message) {
      errorDetails.push(<dt key="error-title">错误日志</dt>, <dd key="error-desc">{error.message}</dd>);
    }

    if (error.originalError) {
      const { originalError } = error;

      errorDetails.push(
        <dt key="status-original-request-title">原始请求</dt>,
        <dd key="status-original-request-content">{String(originalError.method)} {String(originalError.url)}</dd>,
      );

      errorDetails.push(
        <dt key="status-code-title">状态码</dt>,
        <dd key="status-code-desc">{String(originalError.status)}</dd>,
      );

      if (typeof originalError.toString === 'function') {
        errorDetails.push(
          <dt key="full-error-title">完整错误日志</dt>,
          <dd key="full-error-desc">{originalError.toString()}</dd>,
        );
      }
    }

    if (errorDetails.length === 0) {
      return noInformationMessage;
    }

    return (
      <div>
        <hr style={{ marginTop: 10, marginBottom: 10 }} />
        <p>这是从服务器接收到的上一次响应:</p>
        <Well bsSize="small" style={{ whiteSpace: 'pre-line' }}>
          <dl style={{ marginBottom: 0 }}>
            {errorDetails}
          </dl>
        </Well>
      </div>
    );
  };

  return (
    <DocumentTitle title="服务器不可用">
      <ServerUnavailableStyles />
      <Modal show>
        <Modal.Header>
          <Modal.Title><Icon name="exclamation-triangle"/> 服务器当前不可用</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <p>
              在<i>{qualifyUrl('')}</i>上连接到DataInsight服务器时出现问题。请检查服务器是否健康且正常工作。
            </p>
            <p>一旦能够连接到服务器，您将被自动重定向到上一页。</p>
            <p>
              是否需要帮助？{' '}
              <a href="" rel="noopener noreferrer" target="_blank">我们可以帮助您</a>。
            </p>
            <div>
              <Button bsStyle="primary"
                      tabIndex={0}
                      onClick={_toggleDetails}
                      bsSize="sm">
                {showDetails ? '收起' : '更多'}
                <StyledIcon name={showDetails ? 'chevron-up' : 'chevron-down'} />
              </Button>
              {_formatErrorMessage()}
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </DocumentTitle>
  );
};

ServerUnavailablePage.propTypes = {
  server: PropTypes.object,
};

ServerUnavailablePage.defaultProps = {
  server: undefined,
};

export default ServerUnavailablePage;
