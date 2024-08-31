package org.graylog2.inputs.codecs;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.inject.assistedinject.Assisted;
import com.google.inject.assistedinject.AssistedInject;
import org.graylog2.plugin.Message;
import org.graylog2.plugin.configuration.Configuration;
import org.graylog2.plugin.configuration.ConfigurationRequest;
import org.graylog2.plugin.inputs.annotations.Codec;
import org.graylog2.plugin.inputs.annotations.ConfigClass;
import org.graylog2.plugin.inputs.annotations.FactoryClass;
import org.graylog2.plugin.inputs.codecs.AbstractCodec;
import org.graylog2.plugin.inputs.codecs.CodecAggregator;
import org.graylog2.plugin.journal.RawMessage;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import javax.inject.Inject;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

@Codec(name = "telegraf", displayName = "Telegraf")
public class TelegrafCodec extends AbstractCodec {
    private static final Logger log = LoggerFactory.getLogger(TelegrafCodec.class);
    private final ObjectMapper objectMapper;

    @Inject
    public TelegrafCodec(@Assisted Configuration configuration, ObjectMapper objectMapper) {
        super(configuration);
        this.objectMapper = objectMapper;
    }

    @Nullable
    @Override
    public Message decode(@Nonnull RawMessage raw) {
        String payload = new String(raw.getPayload(), StandardCharsets.UTF_8);

        try {
            Map<String, Object> telegrafData = objectMapper.readValue(payload, Map.class);
            long timestamp = ((Number) telegrafData.get("timestamp")).longValue();
            String name = telegrafData.get("name").toString();
            DateTime dateTime = new DateTime(timestamp * 1000); // Convert seconds to milliseconds
            Message message = new Message("-", null, dateTime);

            // Add telegraf_ prefix to all fields
            Map<String, Object> prefixedTelegrafData = new LinkedHashMap<>();
            addPrefixToFields("telegraf_" + name + "_", telegrafData, prefixedTelegrafData);
            message.addFields(prefixedTelegrafData);

            return message;
        } catch (IOException e) {
            throw new RuntimeException("Failed to parse Telegraf data", e);
        }
    }

    private void addPrefixToFields(String prefix, Map<String, Object> original, Map<String, Object> result) {
        for (Map.Entry<String, Object> entry : original.entrySet()) {
            StringBuilder newKey = new StringBuilder(prefix).append(entry.getKey());
            if (entry.getValue() instanceof Map) {
                @SuppressWarnings("unchecked") Map<String, Object> nestedMap = (Map<String, Object>) entry.getValue();
                addPrefixToFields(newKey.append("_").toString(), nestedMap, result);
            } else {
                if (entry.getValue() instanceof Number) {
                    result.put(newKey.toString(), ((Number) entry.getValue()).doubleValue());
                } else {
                    result.put(newKey.toString(), entry.getValue());
                }
            }
        }
    }

    @Nullable
    @Override
    public CodecAggregator getAggregator() {
        return null;
    }

    @FactoryClass
    public interface Factory extends AbstractCodec.Factory<TelegrafCodec> {
        @Override
        TelegrafCodec create(Configuration configuration);

        @Override
        Config getConfig();

        @Override
        Descriptor getDescriptor();
    }

    @ConfigClass
    public static class Config extends AbstractCodec.Config {
        @Override
        public void overrideDefaultValues(@Nonnull ConfigurationRequest cr) {
        }
    }

    public static class Descriptor extends AbstractCodec.Descriptor {
        @Inject
        public Descriptor() {
            super(TelegrafCodec.class.getAnnotation(Codec.class).displayName());
        }
    }
}
