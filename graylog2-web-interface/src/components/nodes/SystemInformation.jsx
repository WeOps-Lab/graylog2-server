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
import moment from 'moment';
import styled from 'styled-components';

import { Timestamp } from 'components/common';
import DateTime from 'logic/datetimes/DateTime';

const _getInitialState = () => {
  return { time: moment() };
};

const StyledDl = styled.dl`
  margin-top: 5px;
  margin-bottom: 0;

  dt {
    float: left;
  }

  dd {
    margin-left: 95px;
  }
`;

class SystemInformation extends React.Component {
  static propTypes = {
    node: PropTypes.object.isRequired,
    systemInformation: PropTypes.object.isRequired,
    jvmInformation: PropTypes.object,
  };

  static defaultProps = {
    jvmInformation: undefined,
  };

  constructor(props) {
    super(props);
    this.state = _getInitialState();
  }

  componentDidMount() {
    this.interval = setInterval(() => this.setState(_getInitialState()), 1000);
  }

  componentWillUnmount() {
    clearTimeout(this.interval);
  }

  render() {
    const { systemInformation: { hostname, version, codename, timezone }, jvmInformation, node } = this.props;
    const { time } = this.state;
    let jvmInformationText;

    if (jvmInformation) {
      jvmInformationText = <span>PID {jvmInformation.pid}, {jvmInformation.info}</span>;
    } else {
      jvmInformationText = <span>此节点JMV信息不可用.</span>;
    }

    return (
      <StyledDl>
        <dt>主机名:</dt>
        <dd>{hostname}</dd>
        <dt>节点 ID:</dt>
        <dd>{node.node_id}</dd>
        <dt>版本:</dt>
        <dd>{version}, 代码版本 <em>{codename}</em></dd>
        <dt>JVM:</dt>
        <dd>{jvmInformationText}</dd>
        <dt>时间:</dt>
        <dd><Timestamp dateTime={time} format="withTz" tz={timezone} /></dd>
      </StyledDl>
    );
  }
}

export default SystemInformation;
