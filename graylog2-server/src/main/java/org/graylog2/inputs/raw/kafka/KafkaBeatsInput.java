package org.graylog2.inputs.raw.kafka;


import com.codahale.metrics.MetricRegistry;
import com.google.inject.Inject;
import com.google.inject.assistedinject.Assisted;
import com.google.inject.assistedinject.AssistedInject;
import org.graylog.plugins.beats.Beats2Codec;
import org.graylog2.inputs.transports.KafkaTransport;
import org.graylog2.plugin.LocalMetricRegistry;
import org.graylog2.plugin.ServerStatus;
import org.graylog2.plugin.configuration.Configuration;
import org.graylog2.plugin.inputs.MessageInput;
import org.graylog2.plugin.inputs.annotations.ConfigClass;
import org.graylog2.plugin.inputs.annotations.FactoryClass;

public class KafkaBeatsInput extends MessageInput {
    private static final String NAME = "Kafka Beats Input";

    @AssistedInject
    public KafkaBeatsInput(@Assisted Configuration configuration,
                           MetricRegistry metricRegistry,
                           KafkaTransport.Factory transport,
                           Beats2Codec.Factory codec,
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

    protected KafkaBeatsInput(MetricRegistry metricRegistry,
                              Configuration configuration,
                              KafkaTransport kafkaTransport,
                              Beats2Codec codec,
                              LocalMetricRegistry localRegistry,
                              MessageInput.Config config,
                              MessageInput.Descriptor descriptor, ServerStatus serverStatus) {
        super(metricRegistry, configuration, kafkaTransport, localRegistry, codec, config, descriptor, serverStatus);
    }

    @FactoryClass
    public interface Factory extends MessageInput.Factory<KafkaBeatsInput> {
        @Override
        KafkaBeatsInput create(Configuration configuration);

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
        public Config(KafkaTransport.Factory transport, Beats2Codec.Factory codec) {
            super(transport.getConfig(), codec.getConfig());
        }
    }
}
