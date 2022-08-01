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
import * as React from 'react';
import PropTypes from 'prop-types';

import { ReadOnlyFormGroup } from 'components/common';
import { Well } from 'components/bootstrap';

import styles from '../event-notification-types/EmailNotificationSummary.css';

const EmailNotificationDetails = ({ notification }) => (
  <>
    <ReadOnlyFormGroup label="发件人" value={notification.config.sender} />
    <ReadOnlyFormGroup label="主题" value={notification.config.subject} />
    <ReadOnlyFormGroup label="用户收件人" value={notification.config.user_recipients.join(', ') || '未找到用户收件人.'} />
    <ReadOnlyFormGroup label="邮件收件人" value={notification.config.email_recipients.join(', ') || '未找到邮件收件人.'} />
    <ReadOnlyFormGroup label="时区" value={notification.config.time_zone} />
    <ReadOnlyFormGroup label="邮件内容"
                       value={(
                         <Well bsSize="small" className={styles.bodyPreview}>
                           {notification.config.body_template || <em>邮件内容</em>}
                         </Well>
                       )} />
    <ReadOnlyFormGroup label="HTML邮件内容"
                       value={(
                         <Well bsSize="small" className={styles.bodyPreview}>
                           {notification.config.html_body_template || <em>邮件内容</em>}
                         </Well>
                       )} />
  </>
);

EmailNotificationDetails.propTypes = {
  notification: PropTypes.object.isRequired,
};

export default EmailNotificationDetails;
