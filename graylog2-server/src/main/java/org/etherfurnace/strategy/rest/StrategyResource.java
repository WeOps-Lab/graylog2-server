package org.etherfurnace.strategy.rest;

import com.google.common.base.Joiner;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.apache.shiro.authz.annotation.RequiresAuthentication;
import org.etherfurnace.strategy.RestoreIndexJob;
import org.graylog2.plugin.rest.PluginRestResource;
import org.graylog2.shared.rest.resources.RestResource;
import org.graylog2.system.jobs.SystemJob;
import org.graylog2.system.jobs.SystemJobConcurrencyException;
import org.graylog2.system.jobs.SystemJobManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Api(value = "StrategyResource", description = "StrategyResource")
@Path("/strategy")
@Produces(MediaType.APPLICATION_JSON)
@RequiresAuthentication
public class StrategyResource extends RestResource implements PluginRestResource {
    private static final Logger LOG = LoggerFactory.getLogger(StrategyResource.class);

    RestoreIndexJob.Factory restoreIndexJob;
    private SystemJobManager systemJobManager;

    @Inject
    public StrategyResource(SystemJobManager systemJobManager,
                            RestoreIndexJob.Factory restoreIndexJob) {
        this.restoreIndexJob = restoreIndexJob;
        this.systemJobManager = systemJobManager;
    }

    @GET
    @Path("/restore")
    @ApiOperation(value = "Restore Indices.")
    public Response exportAbsoluteTermsStats(
            @ApiParam(name = "indexName", value = "indexName", required = true) @QueryParam("indexName") String indexName) {
        List<String> nameList = Arrays.asList(indexName.split("_"));
        List<String> finalName = new ArrayList<>();
        for (int i = 0; i < nameList.size() - 1; i++) {
            finalName.add(nameList.get(i));
        }
        submitIndexJob(Joiner.on("_").join(finalName));
        return Response.accepted().build();

    }

    private void submitIndexJob(String indexName) {
        final SystemJob rebuildJob = restoreIndexJob.create(indexName);
        try {
            this.systemJobManager.submit(rebuildJob);
        } catch (SystemJobConcurrencyException e) {
            final String errorMsg = "Concurrency level of this job reached: " + e.getMessage();
            LOG.error(errorMsg, e);
            throw new ForbiddenException(errorMsg);
        }
    }
}
