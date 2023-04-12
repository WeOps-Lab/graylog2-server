package org.etherfurnace.strategy;

import com.google.inject.assistedinject.FactoryModuleBuilder;
import org.etherfurnace.strategy.rest.StrategyResource;
import org.etherfurnace.strategy.strategies.DeleteAndBackupRetentionStrategy;
import org.graylog2.plugin.PluginModule;

public class StrategyModule extends PluginModule {
    @Override
    protected void configure() {
        addRetentionStrategy(DeleteAndBackupRetentionStrategy.class);
        addRestResource(StrategyResource.class);
        install(new FactoryModuleBuilder().build(RestoreIndexJob.Factory.class));
    }
}
