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

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

import static org.graylog2.utilities.ConvertString.convertToString;

@JsonAutoDetect
@AutoValue
@WithBeanGetter
public abstract class RegexReplaceTestRequest {
    @JsonProperty
    @NotNull
    public abstract String string();

    @JsonProperty
    @NotEmpty
    public abstract String regex();

    @JsonProperty
    @NotNull
    public abstract String replacement();

    @JsonProperty("replace_all")
    public abstract boolean replaceAll();

    @JsonCreator
    public static RegexReplaceTestRequest create(@JsonProperty("string") @NotNull String string,
                                                 @JsonProperty("regex") @NotEmpty String regex,
                                                 @JsonProperty("replacement") @NotNull String replacement,
                                                 @JsonProperty("replace_all") boolean replaceAll) {
        String stringData = convertToString(string);
        return new AutoValue_RegexReplaceTestRequest(stringData, regex, replacement, replaceAll);
    }
}
