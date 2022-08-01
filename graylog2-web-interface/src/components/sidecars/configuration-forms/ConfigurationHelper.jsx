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

import { Col, Panel, Row, Tab, Tabs } from 'components/bootstrap';

import TemplatesHelper from './TemplatesHelper';
import ConfigurationVariablesHelper from './ConfigurationVariablesHelper';
import ConfigurationHelperStyle from './ConfigurationHelper.css';

class ConfigurationHelper extends React.Component {
  static propTypes = {
    onVariableRename: PropTypes.func.isRequired,
  };

  _getId = (idName, index) => {
    const idIndex = index !== undefined ? `. ${index}` : '';

    return idName + idIndex;
  };

  render() {
    const { onVariableRename } = this.props;

    return (
      /* eslint-disable no-template-curly-in-string */
      <Panel header="采集器配置说明">

        <Row className="row-sm">
          <Col md={12}>
            <Tabs id="configurationsHelper" defaultActiveKey={1} animation={false}>
              <Tab eventKey={1} title="运行时参数">
                <p className={ConfigurationHelperStyle.marginQuickReferenceText}>
                  这些变量将填入每个客户端的运行信息
                </p>
                <TemplatesHelper />
              </Tab>
              <Tab eventKey={2} title="变量">
                <p className={ConfigurationHelperStyle.marginQuickReferenceText}>
                  使用变量可以跨多个配置共享文本片段.
                  <br />
                  如果您的配置格式需要使用不能作为变量的文本,像<code>$&#123;foo&#125;</code>，
                  您可以这么写:<code>$&#123;&apos;$&apos;&#125;&#123;foo&#125;</code>.
                </p>
                <ConfigurationVariablesHelper onVariableRename={onVariableRename} />
              </Tab>
              <Tab eventKey={3} title="帮助">
                <Row className="row-sm">
                  <Col md={12}>
                    <p className={ConfigurationHelperStyle.marginQuickReferenceText}>
                      我们提供采集器配置模板以帮助您开始使用.<br />
                      有关详细信息，请参考采集器的官方文档.
                    </p>
                    <ul className={ConfigurationHelperStyle.ulStyle}>
                      <li><a href="https://www.elastic.co/guide/en/beats/filebeat/current/index.html" target="_blank" rel="noopener noreferrer">Filebeat文档</a> </li>
                      <li><a href="https://www.elastic.co/guide/en/beats/winlogbeat/current/index.html" target="_blank" rel="noopener noreferrer">Winlogbeat文档</a> </li>
                      <li><a href="https://nxlog.co/docs/nxlog-ce/nxlog-reference-manual.html" target="_blank" rel="noopener noreferrer">NXLog文档</a> </li>
                    </ul>
                  </Col>
                </Row>
              </Tab>
            </Tabs>
          </Col>
        </Row>
      </Panel>
    );
    /* eslint-enable no-template-curly-in-string */
  }
}

export default ConfigurationHelper;
