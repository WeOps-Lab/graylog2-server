package org.etherfurnace.strategy;

import com.google.inject.assistedinject.Assisted;
import com.google.inject.assistedinject.AssistedInject;
import org.graylog2.indexer.indices.Indices;
import org.graylog2.shared.system.activities.Activity;
import org.graylog2.shared.system.activities.ActivityWriter;
import org.graylog2.system.jobs.SystemJob;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.concurrent.atomic.AtomicInteger;

public class RestoreIndexJob extends SystemJob {
    public interface Factory {
        RestoreIndexJob create(String index);
    }

    private static final Logger LOG = LoggerFactory.getLogger(RestoreIndexJob.class);
    private static final int MAX_CONCURRENCY = 1;

    private volatile boolean cancelRequested = false;
    private volatile int indicesToCalculate = 0;
    private final AtomicInteger indicesCalculated = new AtomicInteger(0);

    protected final String index;
    private final ActivityWriter activityWriter;
    protected final Indices indices;

    @AssistedInject
    public RestoreIndexJob(@Assisted String index,
                           ActivityWriter activityWriter,
                           Indices indices) {
        this.index = index;
        this.activityWriter = activityWriter;
        this.indices = indices;
    }

    @Override
    public void requestCancel() {
        this.cancelRequested = true;
    }

    @Override
    public int getProgress() {
        if (indicesToCalculate <= 0) {
            return 0;
        }
        return (int) Math.floor((indicesCalculated.floatValue() / (float) indicesToCalculate) * 100);
    }

    @Override
    public String getDescription() {
        return "恢复索引.";
    }

    @Override
    public void execute() {
        info("恢复索引.");

        indices.restore(index);
    }

    protected void info(String what) {
        LOG.info(what);
        activityWriter.write(new Activity(what, RestoreIndexJob.class));
    }

    @Override
    public boolean providesProgress() {
        return true;
    }

    @Override
    public boolean isCancelable() {
        return true;
    }

    @Override
    public int maxConcurrency() {
        return MAX_CONCURRENCY;
    }

    @Override
    public String getClassName() {
        return this.getClass().getCanonicalName();
    }
}
