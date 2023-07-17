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
package org.graylog.plugins.sidecar.migrations;

import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.result.UpdateResult;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.graylog.plugins.sidecar.rest.models.Collector;
import org.graylog.plugins.sidecar.services.CollectorService;
import org.graylog2.database.MongoConnection;
import org.graylog2.migrations.Migration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.Nullable;
import javax.inject.Inject;
import java.time.ZonedDateTime;

import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Filters.exists;

public class V20180212165000_AddDefaultCollectors extends Migration {
    private static final Logger LOG = LoggerFactory.getLogger(V20180212165000_AddDefaultCollectors.class);

    private final CollectorService collectorService;
    private final MongoCollection<Document> collection;

    @Inject
    public V20180212165000_AddDefaultCollectors(CollectorService collectorService, MongoConnection mongoConnection) {
        this.collectorService = collectorService;
        this.collection = mongoConnection.getMongoDatabase().getCollection(CollectorService.COLLECTION_NAME);
    }

    @Override
    public ZonedDateTime createdAt() {
        return ZonedDateTime.parse("2018-02-12T16:50:00Z");
    }

    @Override
    public void upgrade() {

        removeConfigPath();

        final String beatsPreambel =
                "# 必填字段\n" +
                        "fields_under_root: true\n" +
                        "fields.collector_node_id: ${sidecar.nodeName}\n" +
                        "fields.gl2_source_collector: ${sidecar.nodeId}\n\n";

        ensureCollector(
                "filebeat",
                "exec",
                "linux",
                "/usr/local/gse/sidecar/bin/filebeat",
                "-c  %s",
                "test config -c %s",
                ""
        );
        ensureCollector(
                "filebeat",
                "svc",
                "windows",
                "C:\\gse\\sidecar\\bin\\filebeat.exe",
                "-c \"%s\"",
                "test config -c \"%s\"",
                ""
        );

        ensureCollector(
                "winlogbeat",
                "svc",
                "windows",
                "C:\\gse\\sidecar\\bin\\winlogbeat.exe",
                "-c \"%s\"",
                "test config -c \"%s\"",
                ""
        );

        ensureCollector(
                "packetbeat",
                "exec",
                "linux",
                "/usr/local/gse/sidecar/bin/packetbeat",
                "-c  %s",
                "test config -c %s",
                ""
        );

        ensureCollector(
                "packetbeat",
                "svc",
                "windows",
                "C:\\gse\\sidecar\\bin\\packetbeat.exe",
                "-c \"%s\"",
                "test config -c \"%s\"",
                ""
        );

        ensureCollector(
                "auditbeat",
                "exec",
                "linux",
                "/usr/local/gse/sidecar/bin/auditbeat",
                "-c  %s",
                "test config -c %s",
                ""
        );

    }

    private void removeConfigPath() {
        final FindIterable<Document> documentsWithConfigPath = collection.find(exists("configuration_path"));
        for (Document document : documentsWithConfigPath) {
            final ObjectId objectId = document.getObjectId("_id");
            document.remove("configuration_path");
            final UpdateResult updateResult = collection.replaceOne(eq("_id", objectId), document);
            if (updateResult.wasAcknowledged()) {
                LOG.debug("Successfully updated document with ID <{}>", objectId);
            } else {
                LOG.error("Failed to update document with ID <{}>", objectId);
            }
        }
    }

    @Nullable
    private String ensureCollector(String collectorName,
                                   String serviceType,
                                   String nodeOperatingSystem,
                                   String executablePath,
                                   String executeParameters,
                                   String validationCommand,
                                   String defaultTemplate) {
        Collector collector = null;
        try {
            collector = collectorService.findByNameAndOs(collectorName, nodeOperatingSystem);
            if (collector == null) {
                final String msg = "Couldn't find collector '{} on {}' fixing it.";
                LOG.error(msg, collectorName, nodeOperatingSystem);
                throw new IllegalArgumentException();
            }
        } catch (IllegalArgumentException ignored) {
            LOG.info("{} collector on {} is missing, adding it.", collectorName, nodeOperatingSystem);
            final Collector newCollector;
            newCollector = Collector.create(
                    null,
                    collectorName,
                    serviceType,
                    nodeOperatingSystem,
                    executablePath,
                    executeParameters,
                    validationCommand,
                    defaultTemplate
            );
            try {
                return collectorService.save(newCollector).id();
            } catch (Exception e) {
                LOG.error("Can't save collector " + collectorName + ", please restart Graylog to fix this.", e);
            }
        }

        if (collector == null) {
            LOG.error("Unable to access fixed " + collectorName + " collector, please restart Graylog to fix this.");
            return null;
        }

        return collector.id();
    }

}
