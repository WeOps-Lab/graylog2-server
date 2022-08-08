package org.graylog2.inputs.raw.kafka;


import com.codahale.metrics.MetricRegistry;
import com.google.inject.Inject;
import com.google.inject.assistedinject.Assisted;
import com.google.inject.assistedinject.AssistedInject;
import org.etherfurnace.inputs.jsoninput.JSONCodec;
import org.graylog2.inputs.transports.KafkaTransport;
import org.graylog2.plugin.LocalMetricRegistry;
import org.graylog2.plugin.ServerStatus;
import org.graylog2.plugin.configuration.Configuration;
import org.graylog2.plugin.inputs.MessageInput;
import org.graylog2.plugin.inputs.annotations.ConfigClass;
import org.graylog2.plugin.inputs.annotations.FactoryClass;

public class KafkaJsonInput extends MessageInput {
    private static final String NAME = "Kafka JSON Input";

    @AssistedInject
    public KafkaJsonInput(@Assisted Configuration configuration,
                          MetricRegistry metricRegistry,
                          KafkaTransport.Factory transport,
                          JSONCodec.Factory codec,
                          LocalMetricRegistry localRegistry,
                          Config config,
                          Descriptor descriptor, ServerStatus serverStatus) {
        this(metricRegistry,
                configuration,
                transport.create(configuration),
                codec.create(configuration),
                localRegistry,
                config,
                descriptor, serverStatus);
    }

    protected KafkaJsonInput(MetricRegistry metricRegistry,
                             Configuration configuration,
                             KafkaTransport kafkaTransport,
                             JSONCodec codec,
                             LocalMetricRegistry localRegistry,
                             MessageInput.Config config,
                             MessageInput.Descriptor descriptor, ServerStatus serverStatus) {
        super(metricRegistry, configuration, kafkaTransport, localRegistry, codec, config, descriptor, serverStatus);
    }

    @FactoryClass
    public interface Factory extends MessageInput.Factory<KafkaJsonInput> {
        @Override
        KafkaJsonInput create(Configuration configuration);

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

    @ConfigClass
    public static class Config extends MessageInput.Config {
        @Inject
        public Config(KafkaTransport.Factory transport, JSONCodec.Factory codec) {
            super(transport.getConfig(), codec.getConfig());
        }
    }
}
