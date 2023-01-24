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
import lodash from 'lodash';

import { MultiSelect, SourceCodeEditor, TimezoneSelect } from 'components/common';
import { ControlLabel, FormGroup, HelpBlock, Input } from 'components/bootstrap';
import { getValueFromInput } from 'util/FormsUtils';
import HideOnCloud from 'util/conditional/HideOnCloud';

// TODO: Default body template should come from the server
const DEFAULT_BODY_TEMPLATE = `--- [事件定义] ---------------------------
标题:       \${event_definition_title}
描述: \${event_definition_description}
类型:        \${event_definition_type}
--- [事件] --------------------------------------
时间戳:            \${event.timestamp}
消息:              \${event.message}
来源:               \${event.source}
键:                  \${event.key}
优先级:             \${event.priority}
告警:                \${event.alert}
处理时间: \${event.timestamp}
开始时间:      \${event.timerange_start}
结束时间:        \${event.timerange_end}
字段:
\${foreach event.fields field}  \${field.key}: \${field.value}
\${end}
\${if backlog}
--- [其他] ------------------------------------
导致此警报的最后消息:
\${foreach backlog message}
\${message}
\${end}
\${end}
`;

const DEFAULT_HTML_BODY_TEMPLATE = `<table width="100%" border="0" cellpadding="10" cellspacing="0" style="background-color:#f9f9f9;border:none;line-height:1.2"><tbody>
<tr style="line-height:1.5"><th colspan="2" style="background-color:#e6e6e6">事件定义</th></tr>
<tr><td width="200px">标题</td><td>\${event_definition_title}</td></tr>
<tr><td>描述</td><td>\${event_definition_description}</td></tr>
<tr><td>类型</td><td>\${event_definition_type}</td></tr>
</tbody></table>
<br /><table width="100%" border="0" cellpadding="10" cellspacing="0" style="background-color:#f9f9f9;border:none;line-height:1.2"><tbody>
<tr><th colspan="2" style="background-color:#e6e6e6;line-height:1.5">事件</th></tr>
<tr><td width="200px">时间戳</td><td>\${event.timestamp}</td></tr>
<tr><td>消息</td><td>\${event.message}</td></tr>
<tr><td>来源</td><td>\${event.source}</td></tr>
<tr><td>键值</td><td>\${event.key}</td></tr>
<tr><td>优先级</td><td>\${event.priority}</td></tr>
<tr><td>告警</td><td>\${event.alert}</td></tr>
<tr><td>处理时间</td><td>\${event.timestamp}</td></tr>
<tr><td>开始时间</td><td>\${event.timerange_start}</td></tr>
<tr><td>结束时间</td><td>\${event.timerange_end}</td></tr>
<tr><td>消息流</td><td>\${event.source_streams}</td></tr>
<tr><td>字段</td><td><ul style="list-style-type:square;">\${foreach event.fields field}<li>\${field.key}:\${field.value}</li>\${end}<ul></td></tr>
</tbody></table>
\${if backlog}
<br /><table width="100%" border="0" cellpadding="10" cellspacing="0" style="background-color:#f9f9f9;border:none;line-height:1.2"><tbody>
<tr><th style="background-color:#e6e6e6;line-height:1.5">[其他]导致此警报的最后消息</th></tr>
\${foreach backlog message}
<tr><td>\${message}</td></tr>
\${end}
</tbody></table>
\${end}
`;

class EmailNotificationForm extends React.Component {
  static propTypes = {
    config: PropTypes.object.isRequired,
    validation: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    users: PropTypes.array.isRequired,
  };

  static defaultConfig = {
    sender: '', // TODO: Default sender should come from the server. The default should be empty or the address configured in the email server settings
    // eslint-disable-next-line no-template-curly-in-string
    subject: 'DataInsight 事件通知: ${event_definition_title}', // TODO: Default subject should come from the server
    body_template: DEFAULT_BODY_TEMPLATE, // TODO: Default body template should come from the server
    html_body_template: DEFAULT_HTML_BODY_TEMPLATE,
    user_recipients: [],
    email_recipients: [],
    time_zone: 'UTC',
  };

  propagateChange = (key, value) => {
    const { config, onChange } = this.props;
    const nextConfig = lodash.cloneDeep(config);

    nextConfig[key] = value;
    onChange(nextConfig);
  };

  handleChange = (event) => {
    const { name } = event.target;

    this.propagateChange(name, getValueFromInput(event.target));
  };

  handleTimeZoneChange = (nextValue) => {
    this.propagateChange('time_zone', nextValue);
  };

  handleBodyTemplateChange = (nextValue) => {
    this.propagateChange('body_template', nextValue);
  };

  handleHtmlBodyTemplateChange = (nextValue) => {
    this.propagateChange('html_body_template', nextValue);
  };

  handleRecipientsChange = (key) => {
    return (nextValue) => this.propagateChange(key, nextValue === '' ? [] : nextValue.split(','));
  };

  formatUsers = (users) => {
    return users.map((user) => ({ label: `${user.username} (${user.fullName})`, value: user.username }));
  };

  render() {
    const { config, users, validation } = this.props;

    return (
      <>
        <Input id="notification-subject"
               name="subject"
               label="发送者"
               type="text"
               bsStyle={validation.errors.subject ? 'error' : null}
               help={lodash.get(validation, 'errors.subject[0]', '应用作通知发件人的电子邮件地址.')}
               value={config.subject || ''}
               onChange={this.handleChange}
               required />
        <HideOnCloud>
          <Input id="notification-sender"
                 name="sender"
                 label={<ControlLabel>主题 <small className="text-muted">(可选)</small></ControlLabel>}
                 type="text"
                 bsStyle={validation.errors.sender ? 'error' : null}
                 help={lodash.get(validation, 'errors.sender[0]', '应用于电子邮件通知的主题.')}
                 value={config.sender || ''}
                 onChange={this.handleChange} />
        </HideOnCloud>
        <FormGroup controlId="notification-user-recipients"
                   validationState={validation.errors.recipients ? 'error' : null}>
          <ControlLabel>收件用户 <small className="text-muted">(可选)</small></ControlLabel>
          <MultiSelect id="notification-user-recipients"
                       value={Array.isArray(config.user_recipients) ? config.user_recipients.join(',') : ''}
                       placeholder="选择用户..."
                       options={this.formatUsers(users)}
                       onChange={this.handleRecipientsChange('user_recipients')} />
          <HelpBlock>
            {lodash.get(validation, 'errors.recipients[0]', '选择将接收此通知的DataInsight用户.')}
          </HelpBlock>
        </FormGroup>

        <FormGroup controlId="notification-email-recipients"
                   validationState={validation.errors.recipients ? 'error' : null}>
          <ControlLabel>收件邮箱 <small className="text-muted">(可选)</small></ControlLabel>
          <MultiSelect id="notification-email-recipients"
                       value={Array.isArray(config.email_recipients) ? config.email_recipients.join(',') : ''}
                       addLabelText={'新增邮箱 "{label}"?'}
                       placeholder="输入邮箱地址"
                       options={[]}
                       onChange={this.handleRecipientsChange('email_recipients')}
                       allowCreate />
          <HelpBlock>
            {lodash.get(validation, 'errors.recipients[0]', '新增接收通知的邮箱地址.')}
          </HelpBlock>
        </FormGroup>
        <Input id="notification-time-zone"
               help="时区."
               label={<>时区 <small className="text-muted">(可选)</small></>}>
          <TimezoneSelect className="timezone-select"
                          name="time_zone"
                          value={config.time_zone}
                          onChange={this.handleTimeZoneChange} />
        </Input>
        <FormGroup controlId="notification-body-template"
                   validationState={validation.errors.body ? 'error' : null}>
          <ControlLabel>内容模板</ControlLabel>
          <SourceCodeEditor id="notification-body-template"
                            mode="text"
                            theme="light"
                            value={config.body_template || ''}
                            onChange={this.handleBodyTemplateChange} />
          <HelpBlock>
            {lodash.get(validation, 'errors.body[0]', '用于生成邮件内容的模板.')}
          </HelpBlock>
        </FormGroup>
        <FormGroup controlId="notification-body-template"
                   validationState={validation.errors.body ? 'error' : null}>
          <ControlLabel>HTML邮件模板</ControlLabel>
          <SourceCodeEditor id="notification-html-body-template"
                            mode="text"
                            theme="light"
                            value={config.html_body_template || ''}
                            onChange={this.handleHtmlBodyTemplateChange} />
          <HelpBlock>
            {lodash.get(validation, 'errors.body[0]', '用于生成邮件内容的HTML模板.')}
          </HelpBlock>
        </FormGroup>
      </>
    );
  }
}

export default EmailNotificationForm;
