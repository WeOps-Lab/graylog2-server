package org.etherfurnace.strategy.strategies;

import com.google.common.base.Stopwatch;
import com.google.common.collect.ImmutableMap;
import org.graylog2.audit.AuditActor;
import org.graylog2.audit.AuditEventSender;
import org.graylog2.database.NotFoundException;
import org.graylog2.indexer.IndexSet;
import org.graylog2.indexer.indexset.IndexSetConfig;
import org.graylog2.indexer.indices.Indices;
import org.graylog2.indexer.ranges.IndexRange;
import org.graylog2.indexer.ranges.IndexRangeService;
import org.graylog2.indexer.retention.strategies.AbstractIndexCountBasedRetentionStrategy;
import org.graylog2.plugin.indexer.retention.RetentionStrategyConfig;
import org.graylog2.plugin.system.NodeId;
import org.graylog2.shared.system.activities.ActivityWriter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

import static org.graylog2.audit.AuditEventTypes.ES_INDEX_RETENTION_DELETE;

public class DeleteAndBackupRetentionStrategy extends AbstractIndexCountBasedRetentionStrategy {

    private static final Logger LOG = LoggerFactory.getLogger(DeleteAndBackupRetentionStrategy.class);

    private final Indices indices;
    private final NodeId nodeId;
    private final AuditEventSender auditEventSender;
    private final IndexRangeService indexRangeService;

    @Inject
    public DeleteAndBackupRetentionStrategy(Indices indices,
                                            ActivityWriter activityWriter,
                                            NodeId nodeId,
                                            AuditEventSender auditEventSender,
                                            IndexRangeService indexRangeService) {
        super(indices, activityWriter);
        this.indices = indices;
        this.nodeId = nodeId;
        this.auditEventSender = auditEventSender;
        this.indexRangeService = indexRangeService;
    }

    @Override
    protected Optional<Integer> getMaxNumberOfIndices(IndexSet indexSet) {
        final IndexSetConfig indexSetConfig = indexSet.getConfig();
        final RetentionStrategyConfig strategyConfig = indexSetConfig.retentionStrategy();
        final DeleteAndBackupRetentionStrategyConfig config = (DeleteAndBackupRetentionStrategyConfig) strategyConfig;
        return Optional.of(config.maxNumberOfIndices());
    }

    @Override
    protected void retain(List<String> indexNames, IndexSet indexSet) {
        for (String indexName : indexNames) {
            // 过滤恢复的索引
            if(indices.isReopened(indexName)){
                continue;
            }
            // 获取索引的统计信息
            String newIndexName = indexName;
            try {
                final IndexRange indexRange = indexRangeService.get(indexName);
                newIndexName = newIndexName + "_" + indexRange.begin().getMillis() + "_" + indexRange.end().getMillis();

            } catch (NotFoundException e) {
                LOG.info("无法生成newIndexName！");
            }

            LOG.info("backup Index:" + indexName);
            final Stopwatch sw = Stopwatch.createStarted();

            IndexSetConfig indexSetConfig = indexSet.getConfig();
            RetentionStrategyConfig strategyConfig = indexSetConfig.retentionStrategy();
            DeleteAndBackupRetentionStrategyConfig config = (DeleteAndBackupRetentionStrategyConfig) strategyConfig;
            indices.backup(indexName, newIndexName);

            auditEventSender.success(AuditActor.system(nodeId), ES_INDEX_RETENTION_DELETE, ImmutableMap.of(
                    "index_name", indexName,
                    "retention_strategy", this.getClass().getCanonicalName()
            ));

            LOG.info("Finished index retention strategy [delete] for index <{}> in {}ms.", indexName,
                    sw.stop().elapsed(TimeUnit.MILLISECONDS));
        }
    }


    @Override
    public Class<? extends RetentionStrategyConfig> configurationClass() {
        return DeleteAndBackupRetentionStrategyConfig.class;
    }

    @Override
    public RetentionStrategyConfig defaultConfiguration() {
        return DeleteAndBackupRetentionStrategyConfig.createDefault();
    }
}
