package org.etherfurnace.inputs.mqtt;

import com.codahale.metrics.Meter;
import com.codahale.metrics.MetricRegistry;
import net.xenqtt.client.MqttClient;
import net.xenqtt.client.MqttClientListener;
import net.xenqtt.client.PublishMessage;
import net.xenqtt.client.Subscription;
import net.xenqtt.message.ConnectReturnCode;
import org.graylog2.plugin.inputs.MessageInput;
import org.graylog2.plugin.journal.RawMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

import static com.codahale.metrics.MetricRegistry.name;

public class ClientListener implements MqttClientListener {
    private static final Logger LOG = LoggerFactory.getLogger(ClientListener.class);

    private final MessageInput messageInput;
    private final List<Subscription> subscriptions;

    private final Meter incomingMessages;
    private final Meter incompleteMessages;
    private final Meter processedMessages;

    public ClientListener(final MessageInput messageInput,
                          final List<Subscription> subscriptions,
                          final MetricRegistry metricRegistry) {
        this.messageInput = messageInput;
        this.subscriptions = subscriptions;

        final String metricName = messageInput.getUniqueReadableId();

        this.incomingMessages = metricRegistry.meter(name(metricName, "incomingMessages"));
        this.incompleteMessages = metricRegistry.meter(name(metricName, "incompleteMessages"));
        this.processedMessages = metricRegistry.meter(name(metricName, "processedMessages"));
    }

    public void connected(MqttClient client, ConnectReturnCode returnCode) {
        if (returnCode == ConnectReturnCode.ACCEPTED) {
            client.subscribe(subscriptions);
        } else {
            LOG.error("MQTT客户端未连接: {}", returnCode);
        }
    }

    @Override
    public void publishReceived(MqttClient mqttClient, PublishMessage message) {
        incomingMessages.mark();

        if (message.isEmpty()) {
            incompleteMessages.mark();
            return;
        }

        if (message.isDuplicate()) {
            incompleteMessages.mark();
            return;
        }

        final RawMessage rawMessage = new RawMessage(message.getPayload());
        messageInput.processRawMessage(rawMessage);
        message.ack();
        processedMessages.mark();
    }

    @Override
    public void disconnected(final MqttClient client, final Throwable cause, final boolean reconnecting) {
        LOG.info("断开MQTT客户端连接", cause);
    }
}
