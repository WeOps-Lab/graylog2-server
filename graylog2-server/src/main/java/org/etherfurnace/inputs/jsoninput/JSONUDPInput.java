package org.etherfurnace.inputs.jsoninput;


import com.codahale.metrics.MetricRegistry;
import com.google.inject.assistedinject.Assisted;
import com.google.inject.assistedinject.AssistedInject;
import org.graylog2.inputs.transports.UdpTransport;
import org.graylog2.plugin.LocalMetricRegistry;
import org.graylog2.plugin.ServerStatus;
import org.graylog2.plugin.configuration.Configuration;
import org.graylog2.plugin.inputs.MessageInput;

import javax.inject.Inject;

public class JSONUDPInput extends MessageInput {

    private static final String NAME = "JSON UDP 接收器";

    @AssistedInject
    public JSONUDPInput(MetricRegistry metricRegistry,
                        @Assisted final Configuration configuration,
                        final UdpTransport.Factory udpTransportFactory,
                        final JSONCodec.Factory syslogCodecFactory,
                        LocalMetricRegistry localRegistry, Config config, Descriptor descriptor, ServerStatus serverStatus) {
        super(metricRegistry,
            configuration,
            udpTransportFactory.create(configuration),
            localRegistry, syslogCodecFactory.create(configuration),
            config, descriptor, serverStatus);
    }

    public interface Factory extends MessageInput.Factory<JSONUDPInput> {
        @Override
        JSONUDPInput create(Configuration configuration);

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
        public Config(UdpTransport.Factory transport, JSONCodec.Factory codec) {
            super(transport.getConfig(), codec.getConfig());
        }
    }
}
