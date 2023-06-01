
package org.etherfurnace.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.google.auto.value.AutoValue;
import org.graylog.events.contentpack.entities.EventNotificationConfigEntity;
import org.graylog.events.notifications.EventNotificationConfig;
import org.graylog2.contentpacks.model.entities.EntityDescriptor;
import org.graylog2.contentpacks.model.entities.references.ValueReference;

import java.util.Map;

@AutoValue
@JsonTypeName(BlueKingUacEventNotificationConfigEntity.TYPE_NAME)
@JsonDeserialize(builder = BlueKingUacEventNotificationConfigEntity.Builder.class)
public abstract class BlueKingUacEventNotificationConfigEntity implements EventNotificationConfigEntity {

    public static final String TYPE_NAME = "bk_uac-notification-v1";

    private static final String FIELD_URL = "url";
    private static final String FIELD_SECRET = "secret";


    @JsonProperty(FIELD_URL)
    public abstract ValueReference url();

    @JsonProperty(FIELD_SECRET)
    public abstract ValueReference secret();

    public static Builder builder() {
        return Builder.create();
    }

    public abstract Builder toBuilder();

    @AutoValue.Builder
    public static abstract class Builder implements EventNotificationConfigEntity.Builder<Builder> {

        @JsonCreator
        public static Builder create() {
            return new AutoValue_BlueKingUacEventNotificationConfigEntity.Builder()
                    .type(TYPE_NAME);
        }

        @JsonProperty(FIELD_URL)
        public abstract Builder url(ValueReference url);

        @JsonProperty(FIELD_SECRET)
        public abstract Builder secret(ValueReference url);

        public abstract BlueKingUacEventNotificationConfigEntity build();
    }

    @Override
    public EventNotificationConfig toNativeEntity(Map<String, ValueReference> parameters, Map<EntityDescriptor, Object> nativeEntities) {
        return BlueKingUacEventNotificationConfig.builder()
                .url(url().asString(parameters))
                .build();
    }
}
