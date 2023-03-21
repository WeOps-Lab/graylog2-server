package org.etherfurnace.inputs.snmp.input;


import com.codahale.metrics.MetricRegistry;
import com.google.inject.assistedinject.Assisted;
import com.google.inject.assistedinject.AssistedInject;
import org.etherfurnace.inputs.snmp.codec.SnmpCodec;
import org.graylog2.inputs.transports.UdpTransport;
import org.graylog2.plugin.LocalMetricRegistry;
import org.graylog2.plugin.ServerStatus;
import org.graylog2.plugin.configuration.Configuration;
import org.graylog2.plugin.inputs.MessageInput;
import org.graylog2.plugin.inputs.annotations.FactoryClass;

import javax.inject.Inject;

public class SnmpUDPInput extends MessageInput {
    private static final String NAME = "SNMP UDP";

    @AssistedInject
    public SnmpUDPInput(MetricRegistry metricRegistry,
                        @Assisted Configuration configuration,
                        UdpTransport.Factory transportFactory,
                        LocalMetricRegistry localRegistry,
                        SnmpCodec.Factory codecFactory,
                        Config config,
                        Descriptor descriptor,
                        ServerStatus serverStatus) {
        super(metricRegistry,
                configuration,
                transportFactory.create(configuration),
                localRegistry,
                codecFactory.create(configuration),
                config, descriptor, serverStatus);
    }

    @FactoryClass
    public interface Factory extends MessageInput.Factory<SnmpUDPInput> {
        @Override
        SnmpUDPInput create(Configuration configuration);

        @Override
        Config getConfig();

        @Override
        Descriptor getDescriptor();
    }

    public static class Descriptor extends MessageInput.Descriptor {
        @Inject
        protected Descriptor() {
            super(NAME, false, "");
        }
    }

    public static class Config extends MessageInput.Config {
        @Inject
        public Config(UdpTransport.Factory transport, SnmpCodec.Factory codec) {
            super(transport.getConfig(), codec.getConfig());
        }
    }
}

