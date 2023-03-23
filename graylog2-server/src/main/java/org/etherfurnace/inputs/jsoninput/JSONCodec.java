package org.etherfurnace.inputs.jsoninput;


import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Charsets;
import com.google.inject.assistedinject.Assisted;
import com.google.inject.assistedinject.AssistedInject;
import org.graylog2.plugin.Message;
import org.graylog2.plugin.ResolvableInetSocketAddress;
import org.graylog2.plugin.configuration.Configuration;
import org.graylog2.plugin.configuration.ConfigurationRequest;
import org.graylog2.plugin.inputs.annotations.Codec;
import org.graylog2.plugin.inputs.annotations.ConfigClass;
import org.graylog2.plugin.inputs.annotations.FactoryClass;
import org.graylog2.plugin.inputs.codecs.AbstractCodec;
import org.graylog2.plugin.inputs.codecs.CodecAggregator;
import org.graylog2.plugin.inputs.transports.NettyTransport;
import org.graylog2.plugin.journal.RawMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import java.math.BigDecimal;
import java.net.InetAddress;
import java.util.LinkedHashMap;
import java.util.UUID;

@Codec(name = "json", displayName = "JSON 解码器")
public class JSONCodec extends AbstractCodec {
    private static final Logger LOG = LoggerFactory.getLogger(JSONCodec.class);
    private ObjectMapper objectMapper = new ObjectMapper();

    @AssistedInject
    public JSONCodec(@Assisted Configuration configuration) {
        super(configuration);
    }

    @Nullable
    @Override
    public Message decode(@Nonnull RawMessage raw) {
        final ResolvableInetSocketAddress rawRemoteAddress = raw.getRemoteAddress();
        final InetAddress remoteAddress = rawRemoteAddress == null ? null : rawRemoteAddress.getAddress();
        try {
            LinkedHashMap msg = objectMapper.readValue(new String(raw.getPayload(), Charsets.UTF_8),
                    new TypeReference<LinkedHashMap<String, Object>>() {
                    });
            msg.forEach((key, value) -> {
                if (value instanceof BigDecimal) {
                    msg.put(key, ((BigDecimal) value).doubleValue());
                }
            });
            msg.put("_id", UUID.randomUUID().toString());
            msg.put("message", msg.get("message").toString());
            Message message = new Message(msg);
            if (msg.containsKey("message") == false) {
                message.addField("message", new String(raw.getPayload(), Charsets.UTF_8));
            }

            if (msg.containsKey("source") == true) {
                message.addField("source", msg.get("source"));
            } else {
                if (remoteAddress != null) {
                    message.addField("source", remoteAddress.getHostAddress());
                } else {
                    message.addField("source", "");
                }
            }

            if (msg.containsKey("timestamp") == false) {
                message.addField("timestamp", raw.getTimestamp());
            }

            return message;
        } catch (Exception e) {
            LOG.error(e.getMessage(), e);
            e.printStackTrace();
            return new Message(new String(raw.getPayload(), Charsets.UTF_8), null, raw.getTimestamp());
        }

    }

    @Nullable
    @Override
    public CodecAggregator getAggregator() {
        return null;
    }

    @FactoryClass
    public interface Factory extends AbstractCodec.Factory<JSONCodec> {
        @Override
        JSONCodec create(Configuration configuration);

        @Override
        Config getConfig();
    }

    @ConfigClass
    public static class Config extends AbstractCodec.Config {
        @Override
        public void overrideDefaultValues(@Nonnull ConfigurationRequest cr) {
            if (cr.containsField(NettyTransport.CK_PORT)) {
                cr.getField(NettyTransport.CK_PORT).setDefaultValue(5555);
            }
        }
    }

}
