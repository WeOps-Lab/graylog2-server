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
/* eslint-disable react/no-unescaped-entities */
import React from 'react';

import { Alert } from 'components/bootstrap';

class MaxmindAdapterDocumentation extends React.Component {
  render() {
    const cityFields = `{
    "city": { "geoname_id": 5375480, "names": { "en": "Mountain View" } },
    "location": {
      "accuracy_radius": 1000,
      "average_income": null,
      "latitude": 37.386,
      "longitude": -122.0838,
      "metro_code": 807,
      "population_density": null,
      "time_zone": "America/Los_Angeles"
    },
    "postal": { "code": "94035" },
    "subdivisions": [ { "geoname_id": 5332921, "iso_code": "CA", "names": { "en": "California" } } ],
}`;

    const countryFields = `{
    "continent": { "code": "NA", "geoname_id": 6255149, "names": { "en": "North America" } },
    "country": { "geoname_id": 6252001, "iso_code": "US", "names": { "en": "United States" } },
    "registered_country": { "geoname_id": 6252001, "iso_code": "US", "names": { } },
    "represented_country": { "geoname_id": null, "iso_code": "US", "names": { } },
    "traits": {
      "ip_address": "8.8.8.8",
      "is_anonymous_proxy": false,
      "is_legitimate_proxy": false,
      "is_satellite_provider": false,
      "isp": null,
      "organization": null,
    }
}`;

    const asnFields = `{
    "as_number": 15169,
    "as_organization": "Google LLC"
}`;

    return (
      <div>
        <p>GeoIP数据源支持读取MaxMind的GeoIP2数据库。</p>

        <Alert style={{ marginBottom: 10 }} bsStyle="info">
          <h4 style={{ marginBottom: 10 }}>限制</h4>
          <p>目前只支持城市和国家数据库.</p>
        </Alert>

        <hr />

        <h3 style={{ marginBottom: 10 }}>ASN数据库字段</h3>

        <pre>{asnFields}</pre>

        <h3 style={{ marginBottom: 10 }}>国家数据库字段</h3>

        <pre>{countryFields}</pre>

        <h3 style={{ marginBottom: 10 }}>城市数据库字段</h3>

        <p>除了国家数据库提供的字段外,城市数据库还包括以下字段:</p>

        <pre>{cityFields}</pre>

        <p>有关字段的完整文档, 请看MaxMind的<a href="http://maxmind.github.io/GeoIP2-java/" target="_blank" rel="noopener noreferrer">开发文档</a></p>
      </div>
    );
  }
}

export default MaxmindAdapterDocumentation;
