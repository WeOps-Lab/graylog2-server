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
package org.graylog.plugins.map.geoip;

import com.codahale.metrics.MetricRegistry;
import com.codahale.metrics.Timer;
import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.ImmutableMap;
import com.google.common.net.InetAddresses;
import com.maxmind.geoip2.DatabaseReader;
import com.maxmind.geoip2.model.CityResponse;
import com.maxmind.geoip2.record.Location;
import org.apache.commons.lang3.StringUtils;
import org.graylog.plugins.map.config.GeoIpResolverConfig;
import org.graylog2.plugin.Message;
import org.graylog2.utilities.ReservedIpChecker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.Nullable;
import java.io.File;
import java.io.IOException;
import java.net.InetAddress;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import static com.codahale.metrics.MetricRegistry.name;

public class GeoIpResolverEngine {
    private static final Logger LOG = LoggerFactory.getLogger(GeoIpResolverEngine.class);

    /**
     * A mapping of fields (per the Graylog Schema) that to search that contain IP addresses.  When the user opts to
     * enforce the Graylog Schema ONLY these fields will be checked; otherwise, all message fields will be checked.
     * to see if they have valid Geo IP information.
     *
     * <p>
     * The mapping is <b>field name</b> -> <b>new message field prefix</b>, where field_name is the field name expected in the message
     * which will be searched in the GeoIP database, and the new message field prefix is the prefix for the new field with the GeoIP data
     * that will be inserted into the message.
     * </p>
     */
    private final Map<String, String> ipAddressFields = new ImmutableMap.Builder<String, String>()
            .put("source_ip", "source")
            .put("host_ip", "host")
            .put("destination_ip", "destination")
            .build();

    private final GeoIpResolver<GeoLocationInformation> ipLocationResolver;
    private final GeoIpResolver<GeoAsnInformation> ipAsnResolver;
    private final boolean enabled;
    private final boolean enforceGraylogSchema;
    private DatabaseReader databaseReader;
    private final Timer resolveTime;



    public GeoIpResolverEngine(GeoIpVendorResolverService resolverService, GeoIpResolverConfig config, MetricRegistry metricRegistry) {
        this.resolveTime = metricRegistry.timer(name(GeoIpResolverEngine.class, "resolveTime"));

        enforceGraylogSchema = config.enforceGraylogSchema();
        ipLocationResolver = resolverService.createCityResolver(config, resolveTime);
        ipAsnResolver = resolverService.createAsnResolver(config, resolveTime);

        LOG.debug("Created Geo IP Resolvers for '{}'", config.databaseVendorType());
        LOG.debug("'{}' Status Enabled: {}", ipLocationResolver.getClass().getSimpleName(), ipLocationResolver.isEnabled());
        LOG.debug("'{}' Status Enabled: {}", ipAsnResolver.getClass().getSimpleName(), ipAsnResolver.isEnabled());

        this.enabled = ipLocationResolver.isEnabled() || ipAsnResolver.isEnabled();

        // 解析citydb
        final File database = new File(config.cityDbPath());
        try {
            this.databaseReader = new DatabaseReader.Builder(database).build();
        } catch (IOException e) {
            LOG.error("GeoIpResolverEngine construction error = ", e.getMessage());
        }
    }

    public boolean filter(Message message) {
        if (!enabled) {
            return false;
        }

        List<String> ipFields = getIpAddressFields(message);

        for (String key : ipFields) {
            Object fieldValue = message.getField(key);
            final InetAddress address = getValidRoutableInetAddress(fieldValue);
            if (address == null) {
                continue;
            }

            // For reserved IPs just mark as reserved. Otherwise, enforce Graylog schema on only relevant IP fields
            // or add legacy fields on all IP fields in the message if enforcement is disabled.
            final String prefix = enforceGraylogSchema ? ipAddressFields.getOrDefault(key, key) : key;
            if (ReservedIpChecker.getInstance().isReservedIpAddress(address.getHostAddress())) {
                message.addField(prefix + "_reserved_ip", true);
            } else if (enforceGraylogSchema) {
                addGIMGeoIpDataIfPresent(message, address, prefix);
            } else {
                addLegacyGeoIpDataIfPresentCN(message, address, prefix);
            }
        }

        return true;
    }

    // Pre-4.3 logic for adding geo fields to message.
    private void addLegacyGeoIpDataIfPresent(Message message, InetAddress address, String key) {
        ipLocationResolver.getGeoIpData(address).ifPresent(locationInformation -> {
            // We will store the coordinates as a "lat,long" string
            message.addField(key + "_geolocation", locationInformation.latitude() + "," + locationInformation.longitude());
            message.addField(key + "_country_code", locationInformation.countryIsoCode());
            message.addField(key + "_city_name", locationInformation.cityName());
            // 添加省份、国家全称
            message.addField(key + "_region", locationInformation.region());
            message.addField(key + "_country", locationInformation.countryName());

        });
    }

    private void addLegacyGeoIpDataIfPresentCN(Message message, InetAddress address, String key) {
        final Optional<GeoLocationInformation> geoLocationInformation = extractGeoLocationInformation(address, databaseReader);
        geoLocationInformation.ifPresent(locationInformation -> {
            // We will store the coordinates as a "lat,long" string
            message.addField(key + "_geolocation", locationInformation.latitude() + "," + locationInformation.longitude());
            message.addField(key + "_country_code", locationInformation.countryIsoCode());
            message.addField(key + "_city_name", locationInformation.cityName());
            // 添加省份、国家、时区
            message.addField(key + "_region", locationInformation.region());
            message.addField(key + "_country", locationInformation.countryName());
            message.addField(key + "_timezone", locationInformation.timeZone());
        });
    }

    private void addGIMGeoIpDataIfPresent(Message message, InetAddress address, String newFieldPrefix) {
        ipLocationResolver.getGeoIpData(address).ifPresent(locationInformation -> {
            message.addField(newFieldPrefix + "_geo_coordinates", locationInformation.latitude() + "," + locationInformation.longitude());
            message.addField(newFieldPrefix + "_geo_country_iso", locationInformation.countryIsoCode());
            message.addField(newFieldPrefix + "_geo_city", locationInformation.cityName());
            message.addField(newFieldPrefix + "_geo_region", locationInformation.region());
            message.addField(newFieldPrefix + "_geo_timezone", locationInformation.timeZone());

            if (areValidGeoNames(locationInformation.countryName())) {
                message.addField(newFieldPrefix + "_geo_country", locationInformation.countryName());
            }

            if (areValidGeoNames(locationInformation.cityName(), locationInformation.countryIsoCode())) {
                String name = String.format(Locale.ENGLISH, "%s, %s", locationInformation.cityName(), locationInformation.countryIsoCode());
                message.addField(newFieldPrefix + "_geo_name", name);
            }
        });

        ipAsnResolver.getGeoIpData(address).ifPresent(info -> {

            message.addField(newFieldPrefix + "_as_organization", info.organization());
            message.addField(newFieldPrefix + "_as_number", info.asn());
        });
    }

    @VisibleForTesting
    Optional<GeoLocationInformation> extractGeoLocationInformation(Object fieldValue, DatabaseReader databaseReader) {
        final InetAddress ipAddress;
        if (fieldValue instanceof InetAddress) {
            ipAddress = (InetAddress) fieldValue;
        } else if (fieldValue instanceof String) {
            ipAddress = getIpFromFieldValue((String) fieldValue);
        } else {
            ipAddress = null;
        }

        GeoLocationInformation geoLocationInformation = null;
        if (ipAddress != null) {
            try (Timer.Context ignored = resolveTime.time()) {
                if (databaseReader != null) {
                    final CityResponse response = databaseReader.city(ipAddress);
                    final Location location = response.getLocation();
                    final String countryIso = response.getCountry().getIsoCode() == null ? "N/A" : response.getCountry().getIsoCode();
                    final String countryName = response.getCountry().getNames().get("zh-CN") == null ? "N/A" : response.getCountry().getNames().get("zh-CN");
                    String subdivisions;
                    try {
                        subdivisions = response.getSubdivisions().get(0).getNames().get("zh-CN") == null ? "N/A" : response.getSubdivisions().get(0).getNames().get("zh-CN");
                    } catch (Exception e) {
                        subdivisions = "N/A";
                    }
                    final String cityName = response.getCity().getNames().get("zh-CN") == null ? "N/A" : response.getCity().getNames().get("zh-CN");

                    geoLocationInformation = GeoLocationInformation.create(
                            location.getLatitude(),
                            location.getLongitude(),
                            countryIso,
                            countryName,
                            cityName,
                            subdivisions,
                            response.getLocation().getTimeZone()
                            // 获取大陆
//                            response.getContinent().getNames().get("zh-CN")

                    );
                } else {
                    String[] datas = IP.find(String.valueOf(fieldValue));
                    geoLocationInformation = GeoLocationInformation.create(
                            0d, 0d,
                            "N/A",
                            datas[2],
                            datas[1],
                            "",
                            datas[0].equals("美国") ? "United States" : datas[0]);
                }
            } catch (Exception e) {
                LOG.debug("Could not get location from IP {}", ipAddress.getHostAddress(), e);
            }
        }

        return Optional.ofNullable(geoLocationInformation);
    }


    /**
     * Get the message fields that will be checked for IP addresses.
     *
     * <p>
     * If the user has chosen NOT to enforce the Graylog Schema, then all fields will be checked as any field could
     * have an IP address.
     * </p>
     *
     * @param message message
     * @return a list of field that may have an IP address
     */
    @VisibleForTesting
    List<String> getIpAddressFields(Message message) {
        return message.getFieldNames()
                .stream()
                .filter(e -> (!enforceGraylogSchema || ipAddressFields.containsKey(e))
                        && !e.startsWith(Message.INTERNAL_FIELD_PREFIX))
                .collect(Collectors.toList());
    }

    private InetAddress getValidRoutableInetAddress(Object fieldValue) {
        final InetAddress ipAddress;
        if (fieldValue instanceof InetAddress) {
            ipAddress = (InetAddress) fieldValue;
        } else if (fieldValue instanceof String) {
            ipAddress = getIpFromFieldValue((String) fieldValue);
        } else {
            ipAddress = null;
        }
        return ipAddress;
    }

    private boolean areValidGeoNames(String... names) {

        for (String name : names) {
            if (StringUtils.isBlank(name) || "N/A".equalsIgnoreCase(name)) {
                return false;
            }
        }

        return true;
    }

    @Nullable
    @VisibleForTesting
    InetAddress getIpFromFieldValue(String fieldValue) {
        try {
            return InetAddresses.forString(fieldValue.trim());
        } catch (IllegalArgumentException e) {
            // Do nothing, field is not an IP
        }

        return null;
    }
}
