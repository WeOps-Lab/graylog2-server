/*
 * Copyright (C) 2020 Graylog, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Server Side Public License, version 1,
 * as published by MongoDB, Inc.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Server Side Public License for more details.
 *
 * You should have received a copy of the Server Side Public License
 * along with this program. If not, see
 * <http://www.mongodb.com/licensing/server-side-public-license>.
 */
package org.graylog2.inputs.transports;

import com.github.joschi.jadconfig.util.Size;
import com.google.inject.assistedinject.Assisted;
import com.google.inject.assistedinject.AssistedInject;
import io.netty.channel.ChannelHandler;
import io.netty.channel.EventLoopGroup;
import io.netty.handler.codec.Delimiters;
import io.netty.handler.codec.http.HttpContentDecompressor;
import io.netty.handler.codec.http.HttpObjectAggregator;
import io.netty.handler.codec.http.HttpRequestDecoder;
import io.netty.handler.codec.http.HttpResponseEncoder;
import io.netty.handler.timeout.ReadTimeoutHandler;
import org.graylog2.configuration.TLSProtocolsConfiguration;
import org.graylog2.inputs.transports.netty.EventLoopGroupFactory;
import org.graylog2.inputs.transports.netty.HttpHandler;
import org.graylog2.inputs.transports.netty.LenientDelimiterBasedFrameDecoder;
import org.graylog2.plugin.LocalMetricRegistry;
import org.graylog2.plugin.configuration.Configuration;
import org.graylog2.plugin.configuration.ConfigurationRequest;
import org.graylog2.plugin.configuration.fields.BooleanField;
import org.graylog2.plugin.configuration.fields.ConfigurationField;
import org.graylog2.plugin.configuration.fields.NumberField;
import org.graylog2.plugin.inputs.MessageInput;
import org.graylog2.plugin.inputs.annotations.ConfigClass;
import org.graylog2.plugin.inputs.annotations.FactoryClass;
import org.graylog2.plugin.inputs.transports.AbstractTcpTransport;
import org.graylog2.plugin.inputs.transports.Transport;
import org.graylog2.plugin.inputs.util.ThroughputCounter;

import java.util.LinkedHashMap;
import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;

public class HttpTransport extends AbstractTcpTransport {
    private static final int DEFAULT_MAX_INITIAL_LINE_LENGTH = 4096;
    private static final int DEFAULT_MAX_HEADER_SIZE = 8192;
    protected static final int DEFAULT_MAX_CHUNK_SIZE = (int) Size.kilobytes(64L).toBytes();
    private static final int DEFAULT_IDLE_WRITER_TIMEOUT = 60;

    static final String CK_ENABLE_BULK_RECEIVING = "enable_bulk_receiving";
    static final String CK_ENABLE_CORS = "enable_cors";
    static final String CK_MAX_CHUNK_SIZE = "max_chunk_size";
    static final String CK_IDLE_WRITER_TIMEOUT = "idle_writer_timeout";

    protected final boolean enableBulkReceiving;
    protected final boolean enableCors;
    protected final int maxChunkSize;
    private final int idleWriterTimeout;

    @AssistedInject
    public HttpTransport(@Assisted Configuration configuration,
                         EventLoopGroup eventLoopGroup,
                         EventLoopGroupFactory eventLoopGroupFactory,
                         NettyTransportConfiguration nettyTransportConfiguration,
                         ThroughputCounter throughputCounter,
                         LocalMetricRegistry localRegistry,
                         TLSProtocolsConfiguration tlsConfiguration) {
        super(configuration,
                throughputCounter,
                localRegistry,
                eventLoopGroup,
                eventLoopGroupFactory,
                nettyTransportConfiguration,
                tlsConfiguration);

        this.enableBulkReceiving = configuration.getBoolean(CK_ENABLE_BULK_RECEIVING);
        this.enableCors = configuration.getBoolean(CK_ENABLE_CORS);
        this.maxChunkSize = parseMaxChunkSize(configuration);
        this.idleWriterTimeout = configuration.intIsSet(CK_IDLE_WRITER_TIMEOUT) ? configuration.getInt(CK_IDLE_WRITER_TIMEOUT, DEFAULT_IDLE_WRITER_TIMEOUT) : DEFAULT_IDLE_WRITER_TIMEOUT;
    }

    /**
     * @return If the configured Max Chunk Size is less than zero, return {@link HttpTransport#DEFAULT_MAX_CHUNK_SIZE}.
     */
    protected static int parseMaxChunkSize(Configuration configuration) {
        int maxChunkSize = configuration.getInt(CK_MAX_CHUNK_SIZE, DEFAULT_MAX_CHUNK_SIZE);
        return maxChunkSize <= 0 ? DEFAULT_MAX_CHUNK_SIZE : maxChunkSize;
    }

    @Override
    protected LinkedHashMap<String, Callable<? extends ChannelHandler>> getCustomChildChannelHandlers(MessageInput input) {
        final LinkedHashMap<String, Callable<? extends ChannelHandler>> handlers = new LinkedHashMap<>();
        if (idleWriterTimeout > 0) {
            // Install read timeout handler to close idle connections after a timeout.
            // This avoids dangling HTTP connections when the HTTP client does not close the connection properly.
            // For details see: https://github.com/Graylog2/graylog2-server/issues/3223#issuecomment-270350500
            handlers.put("read-timeout-handler", () -> new ReadTimeoutHandler(idleWriterTimeout, TimeUnit.SECONDS));
        }

        handlers.put("decoder", () -> new HttpRequestDecoder(DEFAULT_MAX_INITIAL_LINE_LENGTH, DEFAULT_MAX_HEADER_SIZE, maxChunkSize));
        handlers.put("decompressor", HttpContentDecompressor::new);
        handlers.put("encoder", HttpResponseEncoder::new);
        handlers.put("aggregator", () -> new HttpObjectAggregator(maxChunkSize));

        if (!enableBulkReceiving) {
            handlers.put("http-handler", () -> new HttpHandler(enableCors));
        } else {
            handlers.put("http-bulk-handler", () -> new HttpHandler(enableCors));
            handlers.put("http-bulk-newline-decoder",
                    () -> new LenientDelimiterBasedFrameDecoder(maxChunkSize, Delimiters.lineDelimiter()));
        }
        handlers.putAll(super.getCustomChildChannelHandlers(input));
        return handlers;
    }

    @FactoryClass
    public interface Factory extends Transport.Factory<HttpTransport> {
        @Override
        HttpTransport create(Configuration configuration);

        @Override
        Config getConfig();
    }

    @ConfigClass
    public static class Config extends AbstractTcpTransport.Config {
        @Override
        public ConfigurationRequest getRequestedConfiguration() {
            final ConfigurationRequest r = super.getRequestedConfiguration();
            r.addField(new BooleanField(CK_ENABLE_BULK_RECEIVING,
                    "启用批量处理",
                    false,
                    "启用批量处理,分隔符为 (\\n or \\r\\n)"));
            r.addField(new BooleanField(CK_ENABLE_CORS,
                    "启用 CORS",
                    true,
                    "添加CORS header"));
            r.addField(new NumberField(CK_MAX_CHUNK_SIZE,
                    "HTTP返回的最大长度",
                    DEFAULT_MAX_CHUNK_SIZE,
                    "HTTP返回的最大长度",
                    ConfigurationField.Optional.OPTIONAL));
            r.addField(new NumberField(CK_IDLE_WRITER_TIMEOUT,
                    "超时等待时间",
                    DEFAULT_IDLE_WRITER_TIMEOUT,
                    "超时等待时间",
                    ConfigurationField.Optional.OPTIONAL,
                    NumberField.Attribute.ONLY_POSITIVE));
            return r;
        }
    }
}
