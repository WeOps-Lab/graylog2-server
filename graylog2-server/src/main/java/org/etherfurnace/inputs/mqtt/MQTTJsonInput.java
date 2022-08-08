package org.etherfurnace.inputs.mqtt;

import com.codahale.metrics.MetricRegistry;
import com.google.inject.assistedinject.Assisted;
import com.google.inject.assistedinject.AssistedInject;
import org.etherfurnace.inputs.jsoninput.JSONCodec;
import org.graylog2.plugin.LocalMetricRegistry;
import org.graylog2.plugin.ServerStatus;
import org.graylog2.plugin.configuration.Configuration;
import org.graylog2.plugin.inputs.MessageInput;

import javax.inject.Inject;

public class MQTTJsonInput extends MessageInput {
    private static final String NAME = "MQTT TCP JSON 接收器";

    @AssistedInject
    public MQTTJsonInput(final MetricRegistry metricRegistry,
                         @Assisted Configuration configuration,
                         MQTTTransport.Factory mqttTransportFactory,
                         JSONCodec.Factory rawCodecFactory,
                         LocalMetricRegistry localRegistry,
                         Config config,
                         Descriptor descriptor, ServerStatus serverStatus) {
        super(metricRegistry, configuration, mqttTransportFactory.create(configuration), localRegistry, rawCodecFactory.create(configuration), config, descriptor, serverStatus);
    }

    public interface Factory extends MessageInput.Factory<MQTTJsonInput> {
        @Override
        MQTTJsonInput create(Configuration configuration);

        @Override
        Config getConfig();

        @Override
        Descriptor getDescriptor();
    }

    public static class Descriptor extends MessageInput.Descriptor {
        @Inject
        public Descriptor() {
            super(NAME, false, "");
        }
    }

    public static class Config extends MessageInput.Config {
        @Inject
        public Config(MQTTTransport.Factory transport, JSONCodec.Factory codec) {
            super(transport.getConfig(), codec.getConfig());
        }
    }
}
