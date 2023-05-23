
package org.etherfurnace.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.google.auto.value.AutoValue;
import org.graylog.events.contentpack.entities.EventNotificationConfigEntity;
import org.graylog.events.event.EventDto;
import org.graylog.events.notifications.EventNotificationConfig;
import org.graylog.events.notifications.EventNotificationExecutionJob;
import org.graylog.scheduler.JobTriggerData;
import org.graylog2.contentpacks.EntityDescriptorIds;
import org.graylog2.contentpacks.model.entities.references.ValueReference;
import org.graylog2.plugin.rest.ValidationResult;

@AutoValue
@JsonTypeName(MyEventNotificationConfig.TYPE_NAME)
@JsonDeserialize(builder = MyEventNotificationConfig.Builder.class)
public abstract class MyEventNotificationConfig implements EventNotificationConfig {
    public static final String TYPE_NAME = "my-notification-v1";

    private static final String FIELD_URL = "url";
    private static final String FIELD_SECRET = "secret";

    @JsonProperty(FIELD_URL)
    public abstract String url();

    @JsonProperty(FIELD_SECRET)
    public abstract String secret();

    @JsonIgnore
    public JobTriggerData toJobTriggerData(EventDto dto) {
        return EventNotificationExecutionJob.Data.builder().eventDto(dto).build();
    }

    public static Builder builder() {
        return Builder.create();
    }

    @JsonIgnore
    public ValidationResult validate() {
        final ValidationResult validation = new ValidationResult();

        if (url().isEmpty()) {
            validation.addError(FIELD_URL, "HTTP Notification url cannot be empty.");
        }

        return validation;
    }

    @AutoValue.Builder
    public static abstract class Builder implements EventNotificationConfig.Builder<Builder> {
        @JsonCreator
        public static Builder create() {
            return new AutoValue_MyEventNotificationConfig.Builder()
                    .type(TYPE_NAME);
        }

        @JsonProperty(FIELD_URL)
        public abstract Builder url(String url);

        @JsonProperty(FIELD_SECRET)
        public abstract Builder secret(String secret);

        public abstract MyEventNotificationConfig build();
    }

    @Override
    public EventNotificationConfigEntity toContentPackEntity(EntityDescriptorIds entityDescriptorIds) {
        return MyEventNotificationConfigEntity.builder()
                .url(ValueReference.of(url()))
                .build();
    }
}

