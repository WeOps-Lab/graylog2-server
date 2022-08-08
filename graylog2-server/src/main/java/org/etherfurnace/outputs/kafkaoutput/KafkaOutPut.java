package org.etherfurnace.outputs.kafkaoutput;

import com.google.inject.assistedinject.Assisted;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.Producer;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.graylog2.plugin.Message;
import org.graylog2.plugin.configuration.Configuration;
import org.graylog2.plugin.configuration.ConfigurationRequest;
import org.graylog2.plugin.configuration.fields.ConfigurationField;
import org.graylog2.plugin.configuration.fields.TextField;
import org.graylog2.plugin.outputs.MessageOutput;
import org.graylog2.plugin.outputs.MessageOutputConfigurationException;
import org.graylog2.plugin.streams.Stream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import java.util.List;
import java.util.Properties;
import java.util.concurrent.atomic.AtomicBoolean;

public class KafkaOutPut implements MessageOutput {
    private static final Logger LOG = LoggerFactory.getLogger(KafkaOutPut.class);
    private final AtomicBoolean isRunning = new AtomicBoolean(false);
    protected final Configuration configuration;
    private static Producer<String, String> producer;

    @Inject
    public KafkaOutPut(@Assisted Configuration config) throws MessageOutputConfigurationException {
        LOG.info("Initializing");
        configuration = config;
        isRunning.set(true);
    }

    @Override
    public void stop() {
        LOG.debug("Stopping {}", KafkaOutPut.class.getName());
        try {
            isRunning.set(false);
        } catch (Exception e) {
            LOG.error("Error stopping " + KafkaOutPut.class.getName(), e);
        }
        isRunning.set(false);
        if (producer != null) {
            producer.close();
        }
    }

    @Override
    public boolean isRunning() {
        return isRunning.get();
    }

    protected void writeKafka(Message message, Producer<String, String> producer) {
        producer.send(new ProducerRecord<>(String.valueOf(configuration.getString("topic")),
            "message", message.getMessage()));
    }

    static Producer<String, String> getProducer(Configuration configuration) {
        if (producer == null ) {
            synchronized (KafkaOutPut.class){
                if(producer != null){
                    return producer;
                }
                Properties props = new Properties();
                props.put("bootstrap.servers", configuration.getString("kafka"));
                props.put("acks", "all");
                props.put("retries", 0);
                props.put("request.required.acks", "0");
                props.put("batch.size", 16384);
                props.put("linger.ms", 1);
                props.put("buffer.memory", 33554432);
                props.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
                props.put("value.serializer", "org.apache.kafka.common.serialization.StringSerializer");
                producer = new KafkaProducer<>(props);
            }
            return producer;
        } else {
            return producer;
        }

    }

    @Override
    public void write(Message message) throws Exception {
        Producer<String, String> producer = getProducer(configuration);
        producer.send(new ProducerRecord<>(String.valueOf(configuration.getString("topic")),
            "message", message.getMessage()));
    }

    @Override
    public void write(List<Message> messages) {
        Producer<String, String> producer = getProducer(configuration);
        for (Message message : messages) {
            writeKafka(message, producer);
        }
        producer.close();
    }

    public interface Factory extends MessageOutput.Factory<KafkaOutPut> {
        @Override
        KafkaOutPut create(Stream stream, Configuration configuration);

        @Override
        Config getConfig();

        @Override
        Descriptor getDescriptor();
    }

    public static class Descriptor extends MessageOutput.Descriptor {
        public Descriptor() {
            super("Kafka输出器", false, "", "Kafka输出器");
        }
    }

    public static class Config extends MessageOutput.Config {
        @Override
        public ConfigurationRequest getRequestedConfiguration() {
            final ConfigurationRequest configurationRequest = new ConfigurationRequest();
            configurationRequest.addField(new TextField("kafka", "Kafka主机及端口", "", "Kafka主机及端口(如:127.0.0.1:9092)", ConfigurationField.Optional.NOT_OPTIONAL));
            configurationRequest.addField(new TextField("topic", "Topic", "", "Kafka已有的Topic", ConfigurationField.Optional.NOT_OPTIONAL));
            return configurationRequest;
        }
    }
}
