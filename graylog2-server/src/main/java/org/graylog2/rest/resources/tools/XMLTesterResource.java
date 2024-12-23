//package org.graylog2.rest.resources.tools;
//
//import com.codahale.metrics.annotation.Timed;
//import org.apache.shiro.authz.annotation.RequiresAuthentication;
//import org.graylog2.audit.jersey.NoAuditEvent;
//import org.graylog2.rest.models.tools.requests.XmlTestRequest;
//import org.graylog2.rest.models.tools.responses.XmlTesterResponse;
//import org.graylog2.shared.rest.resources.RestResource;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//
//import javax.validation.Valid;
//import javax.validation.constraints.NotEmpty;
//import javax.validation.constraints.NotNull;
//import javax.ws.rs.Consumes;
//import javax.ws.rs.POST;
//import javax.ws.rs.Path;
//import javax.ws.rs.Produces;
//import javax.ws.rs.core.MediaType;
//import javax.xml.xpath.XPath;
//import javax.xml.xpath.XPathExpression;
//import javax.xml.xpath.XPathExpressionException;
//import javax.xml.xpath.XPathFactory;
//import org.xml.sax.InputSource;
//
//import java.io.StringReader;
//
//@RequiresAuthentication
//@Path("/tools/xml_tester")
//public class XMLTesterResource extends RestResource {
//    private static final Logger LOG = LoggerFactory.getLogger(XMLTesterResource.class);
//
//    @POST
//    @Timed
//    @Consumes(MediaType.APPLICATION_JSON)
//    @Produces(MediaType.APPLICATION_JSON)
//    @NoAuditEvent("only used to test xml values")
//    public XmlTesterResponse testXml(@Valid @NotNull XmlTestRequest xmlTestRequest) {
//        return doTestXml(xmlTestRequest.getXml(), xmlTestRequest.getXpath());
//    }
//
//    private XmlTesterResponse doTestXml(String xml, String xpath) {
//        final XPathExpression xPathExpression;
//        try {
//            XPathFactory xPathFactory = XPathFactory.newInstance();
//            XPath xpathObj = xPathFactory.newXPath();
//            xPathExpression = xpathObj.compile(xpath);
//        } catch (XPathExpressionException e) {
//            LOG.error("Invalid XPath expression: {}", xpath, e);
//            return XmlTesterResponse.create(false, null, xpath, xml, "Invalid XPath expression: " + e.getMessage());
//        }
//
//        try {
//            String result = xPathExpression.evaluate(new InputSource(new StringReader(xml)));
//            boolean matched = !(result == null || result.isEmpty());
//            return XmlTesterResponse.create(matched, result, xpath, xml, null);
//        } catch (Exception e) {
//            LOG.error("Error evaluating XPath expression: {}", xpath, e);
//            return XmlTesterResponse.create(false, null, xpath, xml, "Error evaluating XPath expression: " + e.getMessage());
//        }
//    }
//}

package org.graylog2.rest.resources.tools;

import com.codahale.metrics.annotation.Timed;
import org.apache.shiro.authz.annotation.RequiresAuthentication;
import org.graylog2.audit.jersey.NoAuditEvent;
import org.graylog2.rest.models.tools.requests.XmlTestRequest;
import org.graylog2.rest.models.tools.responses.XmlTesterResponse;
import org.graylog2.shared.rest.resources.RestResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.xml.sax.InputSource;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;
import java.io.StringReader;
import java.util.HashMap;
import java.util.Map;

@RequiresAuthentication
@Path("/tools/xml_tester")
public class XMLTesterResource extends RestResource {
    private static final Logger LOG = LoggerFactory.getLogger(XMLTesterResource.class);

    @POST
    @Timed
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @NoAuditEvent("only used to test xml values")
    public XmlTesterResponse testXml(@Valid @NotNull XmlTestRequest xmlTestRequest) {
        return doTestXml(xmlTestRequest.getXml(), xmlTestRequest.getXpath());
    }

    private XmlTesterResponse doTestXml(String xml, String xpath) {
        // 处理转义字符
        xml = unescapeXml(xml);

        final XPathExpression xPathExpression;
        try {
            XPathFactory xPathFactory = XPathFactory.newInstance();
            XPath xpathObj = xPathFactory.newXPath();
            xPathExpression = xpathObj.compile(xpath);
        } catch (XPathExpressionException e) {
            LOG.error("Invalid XPath expression: {}", xpath, e);
            return XmlTesterResponse.create(false, null, xpath, xml, "Invalid XPath expression: " + e.getMessage());
        }

        try {
            String result = xPathExpression.evaluate(new InputSource(new StringReader(xml)));
            boolean matched = !(result == null || result.isEmpty());

            Map<String, String> matchedMap = new HashMap<>();
            if (matched) {
                // 假设你只需要将结果放在 "name" 键下
                matchedMap.put("name", result);
            }
            return XmlTesterResponse.create(true, matchedMap, xpath, xml, null);
        } catch (Exception e) {
            LOG.error("Error evaluating XPath expression: {}", xpath, e);
            return XmlTesterResponse.create(false, null, xpath, xml, "Error evaluating XPath expression: " + e.getMessage());
        }
    }

    // 添加一个方法来处理转义字符
    private String unescapeXml(String xml) {
        return xml.replace("\\n", "\n")
                .replace("\\\"", "\"");
    }
}

