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
/* eslint-disable react/no-unescaped-entities, no-template-curly-in-string */
import React from 'react';

import { Alert, Col, Row } from 'components/bootstrap';

const HTTPJSONPathAdapterDocumentation = () => {
  const exampleJSON = `{
  "user": {
    "login": "jane",
    "full_name": "Jane Doe",
    "roles": ["admin", "developer"],
    "contact": {
      "email": "jane@example.com",
      "cellphone": "+49123456789"
    }
  }
}`;
  const noMultiResult = '{"value": "Jane Doe"}';
  const mapResult = `{
  "login": "jane",
  "full_name": "Jane Doe",
  "roles": ["admin", "developer"],
  "contact": {
    "email": "jane@example.com",
    "cellphone": "+49123456789"
  }
}`;
  const smallMapResult = `{
  "email": "jane@example.com",
  "cellphone": "+49123456789"
}`;
  const listResult = `{
  "value": ["admin", "developer"]
}`;
  const pipelineRule = `rule "lookup user"
when has_field("user_login")
then
  // Get the user login from the message
  let userLogin = to_string($message.user_login);
  // Lookup the single value, in our case the full name, in the user-api lookup table
  let userName = lookup_value("user-api", userLogin);
  // Set the field "user_name" in the message
  set_field("user_name", userName)

  // Lookup the multi value in the user-api lookup table
  let userData = lookup("user-api", userLogin);
  // Set the email and cellphone as fields in the message
  set_field("user_email", userData["email"]);
  set_field("user_cellphone", userData["cellphone"]);
end`;

  return (
    <div>
      <p>
        HTTPJSONPath数据适配器执行<em>HTTP GET</em>请求以获取数据字典
      </p>

      <Alert style={{ marginBottom: 10 }} bsStyle="info">
        每个数据字典都又两列,<em>单值变量</em>和<em>多值变量</em>
        当查找单值的时候,会使用单值变量,查找多值的时候使用多值变量
      </Alert>

      <h3 style={{ marginBottom: 10 }}>配置</h3>

      <h5 style={{ marginBottom: 10 }}>数据字典URL</h5>
      <p style={{ marginBottom: 10, padding: 0 }}>
        这个URL地址会被服务端请求,需要在URL使用<em>数据字典</em>,可以使用<code>{'${key}'}</code>字段
        (例如:<code>{'https://example.com/api/lookup?key=${key}'}</code>)
      </p>

      <h5 style={{ marginBottom: 10 }}>单值变量 JSONPath</h5>
      <p style={{ marginBottom: 10, padding: 0 }}>
        用于解析单值变量的JSONPath (例如: <code>$.user.full_name</code>)
      </p>

      <h5 style={{ marginBottom: 10 }}>多值变量 JSONPath</h5>
      <p style={{ marginBottom: 10, padding: 0 }}>
        用于解析多值变量的JSONPath (例如: <code>$.users[*]</code>)
        多值变量是<em>可选的</em>.
      </p>

      <h5 style={{ marginBottom: 10 }}>HTTP User-Agent</h5>
      <p style={{ marginBottom: 10, padding: 0 }}>
        <em>User-Agent</em> 会在发送HTTP请求的时候被一起发送r)
      </p>

      <hr />

      <h3 style={{ marginBottom: 10 }}>示例</h3>
      <p>
        以下是一些示例配置与返回的结果.<br />
        URL为 <strong>{'https://example.com/api/users/${key}'}</strong> 动态变量 <code>{'${key}'}</code>
        的值为 <strong>jane</strong>.
      </p>
      <p>
        返回结果:
      </p>
      <pre>{exampleJSON}</pre>

      <Row>
        <Col md={4}>
          <h5 style={{ marginBottom: 10 }}>配置</h5>
          <p style={{ marginBottom: 10, padding: 0 }}>
            单值变量JSONPath: <code>$.user.full_name</code><br />
            多值变量JSONPath: <em>empty</em><br />
          </p>
        </Col>
        <Col md={8}>
          <h5 style={{ marginBottom: 10 }}>结果</h5>
          <p style={{ marginBottom: 10, padding: 0 }}>
            单值变量: <code>Jane Doe</code><br />
            多值变量:
            <pre>{noMultiResult}</pre>
          </p>
        </Col>
      </Row>
      <Row>
        <Col md={4}>
          <h5 style={{ marginBottom: 10 }}>配置</h5>
          <p style={{ marginBottom: 10, padding: 0 }}>
            单值变量JSONPath: <code>$.user.full_name</code><br />
            多值变量JSONPath: <code>$.user</code><br />
          </p>
        </Col>
        <Col md={8}>
          <h5 style={{ marginBottom: 10 }}>结果</h5>
          <p style={{ marginBottom: 10, padding: 0 }}>
            单值变量: <code>Jane Doe</code><br />
            多值变量:
            <pre>{mapResult}</pre>
          </p>
        </Col>
      </Row>
      <Row>
        <Col md={4}>
          <h5 style={{ marginBottom: 10 }}>配置</h5>
          <p style={{ marginBottom: 10, padding: 0 }}>
            单值变量JSONPath: <code>$.user.contact.email</code><br />
            多值变量JSONPath: <code>$.user.roles[*]</code><br />
          </p>
        </Col>
        <Col md={8}>
          <h5 style={{ marginBottom: 10 }}>结果</h5>
          <p style={{ marginBottom: 10, padding: 0 }}>
            单值变量: <code>jane@example.com</code><br />
            多值变量:
            <pre>{listResult}</pre>
          </p>
        </Col>
      </Row>
      <Row>
        <Col md={4}>
          <h5 style={{ marginBottom: 10 }}>配置</h5>
          <p style={{ marginBottom: 10, padding: 0 }}>
            单值变量JSONPath: <code>$.user.full_name</code><br />
            多值变量JSONPath: <code>$.user.contact</code><br />
          </p>
        </Col>
        <Col md={8}>
          <h5 style={{ marginBottom: 10 }}>结果</h5>
          <p style={{ marginBottom: 10, padding: 0 }}>
            单值变量: <code>Jane Doe</code><br />
            多值变量:
            <pre>{smallMapResult}</pre>
          </p>
        </Col>
      </Row>

      <h5 style={{ marginBottom: 10 }}>流水线规则</h5>
      <p>
        这是一个使用上一个配置示例中的示例数据的示例流水线规则.
      </p>
      <pre>{pipelineRule}</pre>
    </div>
  );
};

export default HTTPJSONPathAdapterDocumentation;
