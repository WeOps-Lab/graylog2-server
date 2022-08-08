package org.etherfurnace.inputs.jsoninput;


import com.codahale.metrics.MetricRegistry;
import com.google.inject.assistedinject.Assisted;
import com.google.inject.assistedinject.AssistedInject;
import org.graylog2.inputs.transports.TcpTransport;
import org.graylog2.plugin.LocalMetricRegistry;
import org.graylog2.plugin.ServerStatus;
import org.graylog2.plugin.configuration.Configuration;
import org.graylog2.plugin.inputs.MessageInput;

import javax.inject.Inject;

public class JSONTCPInput extends MessageInput {

    private static final String NAME = "JSON TCP 接收器";

    @AssistedInject
    public JSONTCPInput(@Assisted final Configuration configuration,
                        final TcpTransport.Factory tcpTransportFactory,
                        final JSONCodec.Factory rawCodecFactory,
                        final MetricRegistry metricRegistry, LocalMetricRegistry localRegistry, Config config, Descriptor descriptor, ServerStatus serverStatus) {
        super(metricRegistry,
            configuration,
            tcpTransportFactory.create(configuration),
            localRegistry, rawCodecFactory.create(configuration),
            config, descriptor, serverStatus);
    }

    public interface Factory extends MessageInput.Factory<JSONTCPInput> {
        @Override
        JSONTCPInput create(Configuration configuration);

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
        public Config(TcpTransport.Factory transport, JSONCodec.Factory codec) {
            super(transport.getConfig(), codec.getConfig());
        }
    }
}
