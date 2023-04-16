package org.etherfurnace.strategy.strategies;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import org.graylog.autovalue.WithBeanGetter;
import org.graylog2.indexer.retention.strategies.DeletionRetentionStrategyConfig;
import org.graylog2.plugin.indexer.retention.RetentionStrategyConfig;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

@JsonAutoDetect
@AutoValue
@WithBeanGetter
public abstract class DeleteAndBackupRetentionStrategyConfig implements RetentionStrategyConfig {
    private static final int DEFAULT_MAX_NUMBER_OF_INDICES = 20;
    private static final String BACKUP_PATH = "";

    @JsonProperty("max_number_of_indices")
    public abstract int maxNumberOfIndices();

    @JsonProperty("backup_path")
    public abstract String backupPath();

    @JsonCreator
    public static DeleteAndBackupRetentionStrategyConfig create(@JsonProperty(TYPE_FIELD) String type,
                                                                @JsonProperty("max_number_of_indices")
                                                                @Min(1) int maxNumberOfIndices,
                                                                @JsonProperty("backup_path") @NotNull String backupPath) {
        return new AutoValue_DeleteAndBackupRetentionStrategyConfig(type, maxNumberOfIndices, backupPath);
    }

    @JsonCreator
    public static DeleteAndBackupRetentionStrategyConfig create(@JsonProperty("max_number_of_indices")
                                                                @Min(1) int maxNumberOfIndices,
                                                                @JsonProperty("backup_path") @NotNull String backupPath) {
        return new AutoValue_DeleteAndBackupRetentionStrategyConfig(DeleteAndBackupRetentionStrategyConfig.class.getCanonicalName(),
                maxNumberOfIndices, backupPath);
    }

    public static DeleteAndBackupRetentionStrategyConfig createDefault() {
        return create(DEFAULT_MAX_NUMBER_OF_INDICES, BACKUP_PATH);
    }
}
