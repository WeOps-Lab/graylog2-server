package org.etherfurnace.outputs.kafkaoutput;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.inject.assistedinject.Assisted;
import org.apache.commons.lang.StringUtils;
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
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class KafkaJsonOutput extends KafkaOutPut {
    private ObjectMapper objectMapper = new ObjectMapper();
    private static final Logger LOG = LoggerFactory.getLogger(KafkaJsonOutput.class);
    List<String> fieldList;

    @Inject
    public KafkaJsonOutput(@Assisted Configuration configuration) throws MessageOutputConfigurationException {
        super(configuration);
        fieldList = Arrays.asList(configuration.getString("field").split(","));
    }

    protected void writeKafka(Message message, Producer<String, String> producer) {
        Map<String, Object> fields = message.getFields();
        String tmp = "";
        try {
            tmp = objectMapper.writeValueAsString(fields);
        } catch (Exception e) {
            LOG.error("序列化失败", e);
        }
        producer.send(new ProducerRecord<>(String.valueOf(super.configuration.getString("topic")),
            tmp));
    }

    public void write(Message message) throws Exception {
        Producer<String, String> producer = getProducer(configuration);
        Map<String, Object> fields = message.getFields();
        if (fieldList.isEmpty()) {
            producer.send(new ProducerRecord<>(String.valueOf(configuration.getString("topic")),
                objectMapper.writeValueAsString(fields)));
        } else {
            HashMap<String, Object> result = new HashMap<>();
            for (String name : fieldList) {
                if (fields.containsKey(name) && StringUtils.isNotBlank(fields.getOrDefault(name, "").toString())) {
                    result.put(name, fields.get(name));
                }

            }
            producer.send(new ProducerRecord<>(String.valueOf(configuration.getString("topic")),
                objectMapper.writeValueAsString(result)));
        }
    }

    public interface Factory extends MessageOutput.Factory<KafkaJsonOutput> {
        @Override
        KafkaJsonOutput create(Stream stream, Configuration configuration);

        @Override
        Config getConfig();

        @Override
        Descriptor getDescriptor();
    }

    public static class Descriptor extends MessageOutput.Descriptor {
        public Descriptor() {
            super("Kafka Json 输出器", false, "", "Kafka Json 输出器");
        }
    }

    public static class Config extends MessageOutput.Config {
        @Override
        public ConfigurationRequest getRequestedConfiguration() {
            final ConfigurationRequest configurationRequest = new ConfigurationRequest();
            configurationRequest.addField(new TextField("kafka", "Kafka主机及端口", "", "Kafka主机及端口(如:127.0.0.1:9092)", ConfigurationField.Optional.NOT_OPTIONAL));
            configurationRequest.addField(new TextField("topic", "Topic", "", "Kafka已有的Topic", ConfigurationField.Optional.NOT_OPTIONAL));
            configurationRequest.addField(new TextField("field", "字段名称", "", "输出的字段名称,用逗号分隔.若为空,则输出所有字段信息", ConfigurationField.Optional.OPTIONAL));
            return configurationRequest;
        }
    }
}
