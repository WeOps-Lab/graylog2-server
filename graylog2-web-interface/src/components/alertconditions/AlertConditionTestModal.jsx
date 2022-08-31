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
import PropTypes from 'prop-types';

import { BootstrapModalWrapper, Alert, Modal, Button } from 'components/bootstrap';
import { Spinner, Icon } from 'components/common';
import { AlertConditionsActions } from 'stores/alertconditions/AlertConditionsStore';

import style from './AlertConditionTestModal.css';

class AlertConditionTestModal extends React.Component {
  static propTypes = {
    stream: PropTypes.object.isRequired,
    condition: PropTypes.object.isRequired,
  };

  state = {
    testResults: undefined,
    isTesting: false,
  };

  open = () => {
    this.modal.open();
    this.testCondition();
  };

  close = () => {
    this.modal.close();
  };

  testCondition = () => {
    const { stream, condition } = this.props;

    this.setState({ isTesting: true, testResults: undefined });

    AlertConditionsActions.test(stream.id, condition.id)
      .then(
        (testResults) => this.setState({ testResults: testResults }),
        (error) => {
          if (error.status === 400) {
            // Condition testing failed but we should still get results in the body
            this.setState({ testResults: error.additional.body });

            return;
          }

          // Create a default error message to display in frontend
          this.setState({
            testResults: {
              error: true,
              error_messages: [{
                type: '未知异常',
                message: '无法测试告警条件,请重新尝试或者查看服务器上的日志以获得更多的信息.',
              }],
            },
          });
        },
      )
      .finally(() => this.setState({ isTesting: false }));
  };

  renderErroneousCondition = (testResults) => {
    return (
      <span>
        <p><b>测试告警条件异常.</b></p>
        <p>
          <ul className={style.errorMessages}>
            {testResults.error_messages.map(({ message, type }) => (
              <li key={`${type}-${message}`}>{message} ({type})</li>
            ))}
          </ul>
        </p>
      </span>
    );
  };

  renderSatisfiedCondition = (testResults) => {
    return (
      <span>
        <Icon name="bell" className={style.testResultIcon} />
        <p className={style.testResultText}>告警条件满足,告警将会触发.<br />
          <b>详细信息</b>: {testResults.description}
        </p>
      </span>
    );
  };

  renderUnsatisfiedCondition = () => {
    return (
      <div>
        <Icon name="bell-slash" className={style.testResultIcon} />
        <p className={style.testResultText}>
          告警条件 <b>不</b> 满足,告警 <b>不</b> 会被触发.
        </p>
      </div>
    );
  };

  renderTestResults = (testResults) => {
    if (testResults.error) {
      return this.renderErroneousCondition(testResults);
    }

    return testResults.triggered ? this.renderSatisfiedCondition(testResults) : this.renderUnsatisfiedCondition(testResults);
  };

  render() {
    const { condition } = this.props;
    const { isTesting, testResults } = this.state;

    return (
      <BootstrapModalWrapper ref={(c) => { this.modal = c; }} bsSize="large">
        <Modal.Header closeButton>
          <Modal.Title>告警条件 <em>{condition.title}</em> 测试结果</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {testResults ? (
            <Alert bsStyle={testResults.error ? 'danger' : 'info'}>
              {this.renderTestResults(testResults)}
            </Alert>
          ) : (
            <Spinner text="正在测试告警条件，请等待......" />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.close}>关闭</Button>
          <Button bsStyle="primary" onClick={this.testCondition} disabled={isTesting}>
            {isTesting ? '测试中...' : '测试'}
          </Button>
        </Modal.Footer>
      </BootstrapModalWrapper>
    );
  }
}

export default AlertConditionTestModal;
