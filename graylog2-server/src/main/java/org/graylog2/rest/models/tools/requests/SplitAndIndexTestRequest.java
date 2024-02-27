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
package org.graylog2.rest.models.tools.requests;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import org.graylog.autovalue.WithBeanGetter;

import static org.graylog2.utilities.ConvertString.convertToString;

@JsonAutoDetect
@AutoValue
@WithBeanGetter
public abstract class SplitAndIndexTestRequest {
    @JsonProperty
    public abstract String string();

    @JsonProperty("split_by")
    public abstract String splitBy();

    @JsonProperty
    public abstract int index();

    @JsonCreator
    public static SplitAndIndexTestRequest create(@JsonProperty("string") String string,
                                                  @JsonProperty("split_by") String splitBy,
                                                  @JsonProperty("index") int index) {
        String stringData = convertToString(string);
        return new AutoValue_SplitAndIndexTestRequest(stringData, splitBy, index);
    }
}
