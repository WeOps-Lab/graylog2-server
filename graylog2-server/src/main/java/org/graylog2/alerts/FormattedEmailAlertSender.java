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
package org.graylog2.alerts;

import com.floreysoft.jmte.Engine;
import com.google.common.annotations.VisibleForTesting;
import org.apache.commons.mail.Email;
import org.apache.commons.mail.EmailException;
import org.graylog2.configuration.EmailConfiguration;
import org.graylog2.notifications.Notification;
import org.graylog2.notifications.NotificationService;
import org.graylog2.plugin.Message;
import org.graylog2.plugin.Tools;
import org.graylog2.plugin.alarms.AlertCondition;
import org.graylog2.plugin.alarms.transports.TransportConfigurationException;
import org.graylog2.plugin.configuration.Configuration;
import org.graylog2.plugin.streams.Stream;
import org.graylog2.plugin.system.NodeId;
import org.graylog2.shared.email.EmailFactory;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import java.net.URI;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static com.google.common.base.MoreObjects.firstNonNull;
import static com.google.common.base.Strings.isNullOrEmpty;
import static java.util.Objects.requireNonNull;

public class FormattedEmailAlertSender implements AlertSender {
    private static final Logger LOG = LoggerFactory.getLogger(FormattedEmailAlertSender.class);

    public static final String bodyTemplate = "##########\n" +
            "告警描述: ${check_result.resultDescription}\n" +
            "日期: ${check_result.triggeredAt}\n" +
            "消息流ID: ${stream.id}\n" +
            "消息流标题: ${stream.title}\n" +
            "消息流描述: ${stream.description}\n" +
            "告警标题: ${alertCondition.title}\n" +
            "${if stream_url}消息流URL: ${stream_url}${end}\n" +
            "\n" +
            "告警条件: ${check_result.triggeredCondition}\n" +
            "##########\n\n" +
            "${if backlog}" +
            "此告警的最近的消息:\n" +
            "${foreach backlog message}" +
            "${message}\n\n" +
            "${end}" +
            "${else}" +
            "<无消息>\n" +
            "${end}" +
            "\n";

    private final Engine templateEngine;
    private final NotificationService notificationService;
    private final NodeId nodeId;
    private Configuration pluginConfig;

    private final EmailConfiguration configuration;
    private final EmailFactory emailFactory;

    @Inject
    public FormattedEmailAlertSender(EmailConfiguration configuration,
                                     NotificationService notificationService,
                                     NodeId nodeId,
                                     Engine templateEngine, EmailFactory emailFactory) {
        this.configuration = requireNonNull(configuration, "configuration");
        this.notificationService = requireNonNull(notificationService, "notificationService");
        this.nodeId = requireNonNull(nodeId, "nodeId");
        this.templateEngine = requireNonNull(templateEngine, "templateEngine");
        this.emailFactory = emailFactory;
    }

    @Override
    public void initialize(Configuration configuration) {
        this.pluginConfig = configuration;
    }

    @VisibleForTesting
    String buildSubject(Stream stream, AlertCondition.CheckResult checkResult, List<Message> backlog) {
        final String template;
        if (pluginConfig == null || pluginConfig.getString("subject") == null) {
            template = "消息流告警: ${stream.title}: ${check_result.resultDescription}";
        } else {
            template = pluginConfig.getString("subject");
        }

        Map<String, Object> model = getModel(stream, checkResult, backlog);

        return templateEngine.transform(template, model);
    }

    @VisibleForTesting
    String buildBody(Stream stream, AlertCondition.CheckResult checkResult, List<Message> backlog) {
        final String template;
        if (pluginConfig == null || pluginConfig.getString("body") == null) {
            template = bodyTemplate;
        } else {
            template = pluginConfig.getString("body");
        }
        Map<String, Object> model = getModel(stream, checkResult, backlog);

        return this.templateEngine.transform(template, model);
    }

    private Map<String, Object> getModel(Stream stream, AlertCondition.CheckResult checkResult, List<Message> backlog) {
        Map<String, Object> model = new HashMap<>();
        model.put("stream", stream);
        model.put("check_result", checkResult);
        model.put("stream_url", buildStreamDetailsURL(configuration.getWebInterfaceUri(), checkResult, stream));
        model.put("alertCondition", checkResult.getTriggeredCondition());

        final List<Message> messages = firstNonNull(backlog, Collections.<Message>emptyList());
        model.put("backlog", messages);
        model.put("backlog_size", messages.size());

        return model;
    }

    private String buildStreamDetailsURL(URI baseUri, AlertCondition.CheckResult checkResult, Stream stream) {
        // Return an informational message if the web interface URL hasn't been set
        if (baseUri == null || isNullOrEmpty(baseUri.getHost())) {
            return "请在配置文件中配置 'transport_email_web_interface_url' .";
        }

        int time = 5;
        if (checkResult.getTriggeredCondition().getParameters().get("time") != null) {
            time = (int) checkResult.getTriggeredCondition().getParameters().get("time");
        }

        DateTime dateAlertEnd = checkResult.getTriggeredAt();
        DateTime dateAlertStart = dateAlertEnd.minusMinutes(time);
        String alertStart = Tools.getISO8601String(dateAlertStart);
        String alertEnd = Tools.getISO8601String(dateAlertEnd);

        return baseUri + "/streams/" + stream.getId() + "/messages?rangetype=absolute&from=" + alertStart + "&to=" + alertEnd + "&q=*";
    }

    @Override
    public void sendEmails(Stream stream, EmailRecipients recipients, AlertCondition.CheckResult checkResult) throws TransportConfigurationException, EmailException {
        sendEmails(stream, recipients, checkResult, null);
    }

    private void sendEmail(String emailAddress, Stream stream, AlertCondition.CheckResult checkResult, List<Message> backlog) throws TransportConfigurationException, EmailException {
        LOG.debug("Sending mail to " + emailAddress);
        if(!configuration.isEnabled()) {
            throw new TransportConfigurationException("Email transport is not enabled in server configuration file!");
        }

        final Email email = emailFactory.simpleEmail();

        if (pluginConfig != null && !isNullOrEmpty(pluginConfig.getString("sender"))) {
            email.setFrom(pluginConfig.getString("sender"));
        }

        email.setSubject(buildSubject(stream, checkResult, backlog));
        email.setMsg(buildBody(stream, checkResult, backlog));
        email.addTo(emailAddress);

        email.send();
    }

    @Override
    public void sendEmails(Stream stream, EmailRecipients recipients, AlertCondition.CheckResult checkResult, List<Message> backlog) throws TransportConfigurationException, EmailException {
        if(!configuration.isEnabled()) {
            throw new TransportConfigurationException("Email transport is not enabled in server configuration file!");
        }

        if (recipients == null || recipients.isEmpty()) {
            throw new RuntimeException("Cannot send emails: empty recipient list.");
        }

        final Set<String> recipientsSet = recipients.getEmailRecipients();
        if (recipientsSet.size() == 0) {
            final Notification notification = notificationService.buildNow()
                .addNode(nodeId.toString())
                .addType(Notification.Type.GENERIC)
                .addSeverity(Notification.Severity.NORMAL)
                    .addDetail("title", "消息流 \"" + stream.getTitle() + "\" 触发了告警, 但是没有配置任何接收者!")
                    .addDetail("description", "请为告警配置至少一个接收者.");
            notificationService.publishIfFirst(notification);
        }

        for (String email : recipientsSet) {
            sendEmail(email, stream, checkResult, backlog);
        }
    }
}


