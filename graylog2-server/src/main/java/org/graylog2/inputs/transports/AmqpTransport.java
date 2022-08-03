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
package org.graylog2.inputs.transports;

import com.codahale.metrics.Gauge;
import com.codahale.metrics.MetricRegistry;
import com.google.common.eventbus.EventBus;
import com.google.common.eventbus.Subscribe;
import com.google.inject.assistedinject.Assisted;
import com.google.inject.assistedinject.AssistedInject;
import com.rabbitmq.client.ConnectionFactory;
import org.graylog2.plugin.LocalMetricRegistry;
import org.graylog2.plugin.configuration.Configuration;
import org.graylog2.plugin.configuration.ConfigurationRequest;
import org.graylog2.plugin.configuration.fields.BooleanField;
import org.graylog2.plugin.configuration.fields.ConfigurationField;
import org.graylog2.plugin.configuration.fields.NumberField;
import org.graylog2.plugin.configuration.fields.TextField;
import org.graylog2.plugin.inputs.MessageInput;
import org.graylog2.plugin.inputs.MisfireException;
import org.graylog2.plugin.inputs.annotations.ConfigClass;
import org.graylog2.plugin.inputs.annotations.FactoryClass;
import org.graylog2.plugin.inputs.codecs.CodecAggregator;
import org.graylog2.plugin.inputs.transports.ThrottleableTransport;
import org.graylog2.plugin.inputs.transports.Transport;
import org.graylog2.plugin.lifecycles.Lifecycle;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Named;
import java.io.IOException;
import java.util.concurrent.ScheduledExecutorService;

public class AmqpTransport extends ThrottleableTransport {
    public static final String CK_HOSTNAME = "broker_hostname";
    public static final String CK_PORT = "broker_port";
    public static final String CK_VHOST = "broker_vhost";
    public static final String CK_USERNAME = "broker_username";
    public static final String CK_PASSWORD = "broker_password";
    public static final String CK_PREFETCH = "prefetch";
    public static final String CK_EXCHANGE = "exchange";
    public static final String CK_EXCHANGE_BIND = "exchange_bind";
    public static final String CK_QUEUE = "queue";
    public static final String CK_ROUTING_KEY = "routing_key";
    public static final String CK_PARALLEL_QUEUES = "parallel_queues";
    public static final String CK_TLS = "tls";
    public static final String CK_REQUEUE_INVALID_MESSAGES = "requeue_invalid_messages";
    public static final String CK_HEARTBEAT_TIMEOUT = "heartbeat";

    private static final Logger LOG = LoggerFactory.getLogger(AmqpTransport.class);

    private final Configuration configuration;
    private final EventBus eventBus;
    private final MetricRegistry localRegistry;
    private final ScheduledExecutorService scheduler;

    private AmqpConsumer consumer;

    @AssistedInject
    public AmqpTransport(@Assisted Configuration configuration,
                         EventBus eventBus,
                         LocalMetricRegistry localRegistry,
                         @Named("daemonScheduler") ScheduledExecutorService scheduler) {
        super(eventBus, configuration);
        this.configuration = configuration;
        this.eventBus = eventBus;
        this.localRegistry = localRegistry;
        this.scheduler = scheduler;

        localRegistry.register("read_bytes_1sec", new Gauge<Long>() {
            @Override
            public Long getValue() { return consumer.getLastSecBytesRead().get();
            }
        });
        localRegistry.register("written_bytes_1sec", new Gauge<Long>() {
                                    @Override
                                    public Long getValue() { return 0L;
                                    }
                                });
        localRegistry.register("read_bytes_total", new Gauge<Long>() {
                                    @Override
                                    public Long getValue() { return consumer.getTotalBytesRead().get();
                                    }
                                });
        localRegistry.register("written_bytes_total", new Gauge<Long>() {
                                    @Override
                                    public Long getValue() { return 0L;
                                    }
                                });
    }

    @Subscribe
    public void lifecycleChanged(Lifecycle lifecycle) {
        try {
            LOG.debug("Lifecycle changed to {}", lifecycle);
            switch (lifecycle) {
                case PAUSED:
                case FAILED:
                case HALTING:
                    try {
                        if (consumer != null) {
                            consumer.stop();
                        }
                    } catch (IOException e) {
                        LOG.warn("Unable to stop consumer", e);
                    }
                    break;
                default:
                    if (consumer.isConnected()) {
                        LOG.debug("Consumer is already connected, not running it a second time.");
                        break;
                    }
                    try {
                        consumer.run();
                    } catch (IOException e) {
                        LOG.warn("Unable to resume consumer", e);
                    }
                    break;
            }
        } catch (Exception e) {
            LOG.warn("This should not throw any exceptions", e);
        }
    }

    @Override
    public void setMessageAggregator(CodecAggregator aggregator) {

    }

    @Override
    public void doLaunch(MessageInput input) throws MisfireException {
        int heartbeatTimeout = ConnectionFactory.DEFAULT_HEARTBEAT;
        if (configuration.intIsSet(CK_HEARTBEAT_TIMEOUT)) {
            heartbeatTimeout = configuration.getInt(CK_HEARTBEAT_TIMEOUT);
            if (heartbeatTimeout < 0) {
                LOG.warn("AMQP heartbeat interval must not be negative ({}), using default timeout ({}).",
                         heartbeatTimeout, ConnectionFactory.DEFAULT_HEARTBEAT);
                heartbeatTimeout = ConnectionFactory.DEFAULT_HEARTBEAT;
            }
        }
        consumer = new AmqpConsumer(
                configuration.getString(CK_HOSTNAME),
                configuration.getInt(CK_PORT),
                configuration.getString(CK_VHOST),
                configuration.getString(CK_USERNAME),
                configuration.getString(CK_PASSWORD),
                configuration.getInt(CK_PREFETCH),
                configuration.getString(CK_QUEUE),
                configuration.getString(CK_EXCHANGE),
                configuration.getBoolean(CK_EXCHANGE_BIND),
                configuration.getString(CK_ROUTING_KEY),
                configuration.getInt(CK_PARALLEL_QUEUES),
                configuration.getBoolean(CK_TLS),
                configuration.getBoolean(CK_REQUEUE_INVALID_MESSAGES),
                heartbeatTimeout,
                input,
                scheduler,
                this
        );
        eventBus.register(this);
        try {
            consumer.run();
        } catch (IOException e) {
            eventBus.unregister(this);
            throw new MisfireException("Could not launch AMQP consumer.", e);
        }
    }

    @Override
    public void doStop() {
        if (consumer != null) {
            try {
                consumer.stop();
            } catch (IOException e) {
                LOG.error("Could not stop AMQP consumer.", e);
            }
        }
        eventBus.unregister(this);
    }

    @Override
    public com.codahale.metrics.MetricSet getMetricSet() {
        return localRegistry;
    }

    @FactoryClass
    public interface Factory extends Transport.Factory<AmqpTransport> {
        @Override
        AmqpTransport create(Configuration configuration);

        @Override
        Config getConfig();
    }

    @ConfigClass
    public static class Config extends ThrottleableTransport.Config {
        @Override
        public ConfigurationRequest getRequestedConfiguration() {
            final ConfigurationRequest cr = super.getRequestedConfiguration();
            cr.addField(
                    new TextField(
                            CK_HOSTNAME,
                            "Broker主机名",
                            "",
                            "正在使用的AMQP broker主机名",
                            ConfigurationField.Optional.NOT_OPTIONAL
                    )
            );

            cr.addField(
                    new NumberField(
                            CK_PORT,
                            "Broker端口",
                            5672,
                            "正在使用的AMQP broker端口",
                            ConfigurationField.Optional.OPTIONAL,
                            NumberField.Attribute.IS_PORT_NUMBER
                    )
            );

            cr.addField(
                    new TextField(
                            CK_VHOST,
                            "Broker虚拟主机名称",
                            "/",
                            "正在使用的AMQP broker虚拟主机",
                            ConfigurationField.Optional.NOT_OPTIONAL
                    )
            );

            cr.addField(
                    new TextField(
                            CK_USERNAME,
                            "用户名",
                            "",
                            "连接AMQP broker的用户名",
                            ConfigurationField.Optional.OPTIONAL
                    )
            );

            cr.addField(
                    new TextField(
                            CK_PASSWORD,
                            "密码",
                            "",
                            "连接AMQP broker的密码",
                            ConfigurationField.Optional.OPTIONAL,
                            TextField.Attribute.IS_PASSWORD
                    )
            );

            cr.addField(
                    new NumberField(
                            CK_PREFETCH,
                            "预加载数量",
                            100,
                            "为高级用户提供: AMQP预加载数量. 默认100.",
                            ConfigurationField.Optional.NOT_OPTIONAL
                    )
            );

            cr.addField(
                    new TextField(
                            CK_QUEUE,
                            "队列名称",
                            defaultQueueName(),
                            "已经创建的AMQP队列名称",
                            ConfigurationField.Optional.NOT_OPTIONAL
                    )
            );

            cr.addField(
                    new TextField(
                            CK_EXCHANGE,
                            "Exchange名称",
                            defaultExchangeName(),
                            "侦听的Exchange名称.",
                            ConfigurationField.Optional.NOT_OPTIONAL
                    )
            );

            cr.addField(
                    new BooleanField(
                            CK_EXCHANGE_BIND,
                            "绑定Exchange",
                            false,
                            "将队列与指定的Exchange相绑定，所绑定的Exchange必须是已经存在的."
                    )
            );

            cr.addField(
                    new TextField(
                            CK_ROUTING_KEY,
                            "Routing key名称",
                            defaultRoutingKey(),
                            "侦听的Routing key.",
                            ConfigurationField.Optional.NOT_OPTIONAL
                    )
            );

            cr.addField(
                    new NumberField(
                            CK_PARALLEL_QUEUES,
                            "队列数量",
                            1,
                            "并行队列数量",
                            ConfigurationField.Optional.NOT_OPTIONAL
                    )
            );

            cr.addField(
                    new NumberField(
                            CK_HEARTBEAT_TIMEOUT,
                            "心跳检测超时时间",
                            ConnectionFactory.DEFAULT_HEARTBEAT,
                            "心跳检测的时间间隔（设置为0可禁用心跳检测）",
                            ConfigurationField.Optional.OPTIONAL
                    )
            );

            cr.addField(
                    new BooleanField(
                            CK_TLS,
                            "启用TLS?",
                            false,
                            "是否启用TLS加密转发. (必须配置正确的TLS)"
                    )
            );

            cr.addField(
                    new BooleanField(
                            CK_REQUEUE_INVALID_MESSAGES,
                            "是否把失效信息重新加入队列?",
                            true,
                            "禁用此选项，无效的日志消息将被丢弃."
                    )
            );

            return cr;
        }

        protected String defaultRoutingKey() {
            return "#";
        }

        protected String defaultExchangeName() {
            return "log-messages";
        }

        protected String defaultQueueName() {
            return "log-messages";
        }
    }
}
