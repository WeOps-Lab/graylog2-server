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
package org.graylog2.telemetry.rest;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import org.apache.shiro.authz.annotation.RequiresAuthentication;
import org.graylog2.audit.AuditActor;
import org.graylog2.audit.AuditEventSender;
import org.graylog2.audit.jersey.NoAuditEvent;
import org.graylog2.cluster.NodeService;
import org.graylog2.plugin.database.users.User;
import org.graylog2.rest.RemoteInterfaceProvider;
import org.graylog2.rest.models.system.responses.SystemOverviewResponse;
import org.graylog2.shared.rest.resources.ProxiedResource;
import org.graylog2.shared.rest.resources.system.RemoteSystemResource;

import javax.inject.Named;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ExecutorService;

import static org.graylog2.audit.AuditEventTypes.TELEMETRY_USER_SETTINGS_UPDATE;
import static org.graylog2.shared.rest.documentation.generator.Generator.CLOUD_VISIBLE;

@RequiresAuthentication
@Api(value = "Telemetry", description = "Message inputs", tags = {CLOUD_VISIBLE})
@Path("/telemetry")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TelemetryResource extends ProxiedResource {

    private final TelemetryService telemetryService;
    private final AuditEventSender auditEventSender;

    protected TelemetryResource(NodeService nodeService,
                                RemoteInterfaceProvider remoteInterfaceProvider,
                                @Context HttpHeaders httpHeaders,
                                @Named("proxiedRequestsExecutorService") ExecutorService executorService,
                                TelemetryService telemetryService,
                                AuditEventSender auditEventSender) {
        super(httpHeaders, nodeService, remoteInterfaceProvider, executorService);
        this.telemetryService = telemetryService;
        this.auditEventSender = auditEventSender;
    }

    @GET
    @ApiOperation(value = "Get telemetry information.")
    public Map<String, Object> get() {
        return telemetryService.getTelemetryResponse(getCurrentUserOrThrow(), getSystemOverviewResponses());
    }

    @GET
    @Path("user/settings")
    @ApiOperation("Retrieve a user's telemetry settings.")
    @ApiResponses({
            @ApiResponse(code = 404, message = "Current user not found.")
    })
    public TelemetryUserSettings getTelemetryUserSettings() {
        return telemetryService.getTelemetryUserSettings(getCurrentUserOrThrow());
    }

    @PUT
    @Path("user/settings")
    @ApiOperation("Update a user's telemetry settings.")
    @ApiResponses({@ApiResponse(code = 404, message = "Current user not found.")})
    @NoAuditEvent("Audit event is sent manually.")
    public void saveTelemetryUserSettings(@ApiParam(name = "JSON body", value = "The telemetry settings to assign to the user.", required = true)
                                          @Valid @NotNull TelemetryUserSettings telemetryUserSettings) {

        User currentUser = getCurrentUserOrThrow();
        telemetryService.saveUserSettings(currentUser, telemetryUserSettings);
        auditEventSender.success(
                AuditActor.user(currentUser.getName()),
                TELEMETRY_USER_SETTINGS_UPDATE,
                Map.of(
                        "telemetry_enabled", telemetryUserSettings.telemetryEnabled(),
                        "telemetry_permission_asked", telemetryUserSettings.telemetryPermissionAsked()
                )
        );
    }

    private User getCurrentUserOrThrow() {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            throw new NotFoundException("Couldn't find current user!");
        }
        return currentUser;
    }


    private Map<String, SystemOverviewResponse> getSystemOverviewResponses() {
        Map<String, SystemOverviewResponse> results = new HashMap<>();
        requestOnAllNodes(RemoteSystemResource.class, RemoteSystemResource::system)
                .forEach((s, r) -> results.put(s, toSystemOverviewResponse(r)));
        return results;
    }

    private SystemOverviewResponse toSystemOverviewResponse(CallResult<SystemOverviewResponse> callResult) {
        return Optional.ofNullable(callResult.response()).flatMap(NodeResponse::entity).orElse(null);
    }

}
