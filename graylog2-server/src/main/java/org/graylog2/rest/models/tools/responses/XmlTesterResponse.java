package org.graylog2.rest.models.tools.responses;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import org.graylog.autovalue.WithBeanGetter;

import javax.annotation.Nullable;
import java.util.Map;

@JsonAutoDetect
@AutoValue
@WithBeanGetter
@JsonInclude(JsonInclude.Include.NON_NULL)
public abstract class XmlTesterResponse {
    @JsonProperty
    public abstract boolean result();

    @JsonProperty
    @Nullable
    public abstract Map<String, String> match();

    @JsonProperty
    public abstract String xpath();

    @JsonProperty
    public abstract String xml();

    @JsonProperty
    @Nullable
    public abstract String errorMessage();

    @JsonCreator
    public static XmlTesterResponse create(
            @JsonProperty("result") boolean result,
            @JsonProperty("match") @Nullable Map<String, String> match,
            @JsonProperty("xpath") String xpath,
            @JsonProperty("xml") String xml,
            @JsonProperty("error_message") @Nullable String errorMessage) {
        return new AutoValue_XmlTesterResponse(result, match, xpath, xml, errorMessage);
    }
}
