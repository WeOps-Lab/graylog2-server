//package org.graylog2.rest.models.tools.requests;
//
//import com.fasterxml.jackson.annotation.JsonAutoDetect;
//import com.fasterxml.jackson.annotation.JsonCreator;
//import com.fasterxml.jackson.annotation.JsonProperty;
//import com.google.auto.value.AutoValue;
//import org.graylog.autovalue.WithBeanGetter;
//
//import static org.graylog2.utilities.ConvertString.convertToString;
//
//@JsonAutoDetect
//@AutoValue
//@WithBeanGetter
//public abstract class XmlTestRequest {
//    @JsonProperty
//    public abstract String xml();
//
//    @JsonProperty
//    public abstract String xpath();
//
//    // 添加 Java Bean 风格的获取器方法
//    public String getXml() {
//        return xml();
//    }
//
//    public String getXpath() {
//        return xpath();
//    }
//
//    @JsonCreator
//    public static XmlTestRequest create(@JsonProperty("xml") Object xml,
//                                        @JsonProperty("xpath") String xpath) {
//        // 使用 convertToString 以防输入不是直接的字符串
//        String xmlData = convertToString(xml);
//        return new AutoValue_XmlTestRequest(xmlData, xpath);
//    }
//}


package org.graylog2.rest.models.tools.requests;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import javax.validation.constraints.NotEmpty;

public class XmlTestRequest {
    @JsonProperty
    @NotEmpty
    private final String xml;

    @JsonProperty
    @NotEmpty
    private final String xpath;

    @JsonCreator
    public XmlTestRequest(@JsonProperty("xml") String xml,
                          @JsonProperty("xpath") String xpath) {
        this.xml = xml;
        this.xpath = xpath;
    }

    public String getXml() {
        return xml;
    }

    public String getXpath() {
        return xpath;
    }
}
