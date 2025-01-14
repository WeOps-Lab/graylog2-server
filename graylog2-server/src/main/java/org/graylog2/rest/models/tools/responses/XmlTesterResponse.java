package org.graylog2.rest.models.tools.responses;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Map;

public class XmlTesterResponse {
    @JsonProperty
    private boolean result;

    @JsonProperty
    private Map<String, String> matches;

    @JsonProperty
    private String xpath;

    @JsonProperty
    private String xml;

    @JsonProperty
    private String error_message;

    public static XmlTesterResponse create(boolean result, Map<String, String> matches, String xpath, String xml, String error) {
        XmlTesterResponse response = new XmlTesterResponse();
        response.result = result;
        response.matches = matches;
        response.xpath = xpath;
        response.xml = xml;
        response.error_message = error;
        return response;
    }

    // Getters and setters if required
}
