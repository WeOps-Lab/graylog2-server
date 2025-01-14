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
//import org.xml.sax.InputSource;
//
//import javax.validation.Valid;
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
//import java.io.StringReader;
//import java.util.HashMap;
//import java.util.Map;
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
//        // 处理转义字符
//        xml = unescapeXml(xml);
//
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
//
//            Map<String, String> matchedMap = new HashMap<>();
//            if (matched) {
//                // 假设你只需要将结果放在 "name" 键下
//                matchedMap.put("name", result);
//            }
//            return XmlTesterResponse.create(true, matchedMap, xpath, xml, null);
//        } catch (Exception e) {
//            LOG.error("Error evaluating XPath expression: {}", xpath, e);
//            return XmlTesterResponse.create(false, null, xpath, xml, "Error evaluating XPath expression: " + e.getMessage());
//        }
//    }
//
//    // 添加一个方法来处理转义字符
//    private String unescapeXml(String xml) {
//        return xml.replace("\\n", "\n")
//                .replace("\\\"", "\"");
//    }
//}
//

package org.graylog2.rest.resources.tools;

import com.codahale.metrics.annotation.Timed;
import org.apache.shiro.authz.annotation.RequiresAuthentication;
import org.graylog2.audit.jersey.NoAuditEvent;
import org.graylog2.rest.models.tools.requests.XmlTestRequest;
import org.graylog2.rest.models.tools.responses.XmlTesterResponse;
import org.graylog2.shared.rest.resources.RestResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.*;
import org.xml.sax.InputSource;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
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
            // 解析 XML
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document document = builder.parse(new InputSource(new StringReader(xml)));

            // 使用 XPath 表达式找到目标节点列表
            NodeList targetNodes = (NodeList) xPathExpression.evaluate(document, javax.xml.xpath.XPathConstants.NODESET);

            // 如果没有匹配的节点，返回空 matches 和成功的响应
            if (targetNodes == null || targetNodes.getLength() == 0) {
                Map<String, String> emptyMatches = new HashMap<>();
                return XmlTesterResponse.create(true, emptyMatches, xpath, xml, null);
            }

            // 获取基准路径的深度
            int baseDepth = getXPathBaseDepth(xpath);

            // 处理每个目标节点
            Map<String, String> matches = new HashMap<>();
            if (targetNodes.getLength() == 1) {
                // 只有一个目标节点时，不需要编号
                extractAllNodes(targetNodes.item(0), buildKeyPath(targetNodes.item(0), baseDepth), matches);
            } else {
                // 多个目标节点时添加编号
                for (int i = 0; i < targetNodes.getLength(); i++) {
                    Node targetNode = targetNodes.item(i);
                    extractAllNodes(targetNode, buildKeyPath(targetNode, baseDepth) + "_" + (i + 1), matches);
                }
            }

            return XmlTesterResponse.create(true, matches, xpath, xml, null);
        } catch (Exception e) {
            LOG.error("Error evaluating XPath expression: {}", xpath, e);
            return XmlTesterResponse.create(false, null, xpath, xml, "Error evaluating XPath expression: " + e.getMessage());
        }
    }

    // 递归提取所有子节点的值，并将结果存入 matches
    private void extractAllNodes(Node node, String parentPath, Map<String, String> matches) {
        if (node.getNodeType() == Node.ELEMENT_NODE) {
            NodeList childNodes = node.getChildNodes();
            boolean hasChildElement = false;

            for (int i = 0; i < childNodes.getLength(); i++) {
                Node child = childNodes.item(i);
                if (child.getNodeType() == Node.ELEMENT_NODE) {
                    hasChildElement = true;
                    String childPath = parentPath + "_" + child.getNodeName();
                    extractAllNodes(child, childPath, matches); // 递归提取子节点内容
                }
            }

            // 如果没有子元素（是叶子节点），直接获取值
            if (!hasChildElement) {
                String value = node.getTextContent().trim();
                if (!value.isEmpty()) {
                    matches.put(parentPath, value);
                }
            }
        }
    }

    // 构建节点路径作为键名（从 XPath 第一级节点开始）
    private String buildKeyPath(Node node, int baseDepth) {
        StringBuilder path = new StringBuilder();
        int currentDepth = getNodeDepth(node);

        while (node != null && node.getNodeType() == Node.ELEMENT_NODE) {
            if (currentDepth < baseDepth) {
                break; // 忽略不在 XPath 范围内的节点
            }
            if (path.length() > 0) {
                path.insert(0, "_");
            }
            path.insert(0, node.getNodeName());
            node = node.getParentNode();
            currentDepth--;
        }
        return path.toString();
    }

    // 获取节点的深度
    private int getNodeDepth(Node node) {
        int depth = 0;
        while (node != null && node.getNodeType() == Node.ELEMENT_NODE) {
            depth++;
            node = node.getParentNode();
        }
        return depth;
    }

    // 获取 XPath 的基准深度
    private int getXPathBaseDepth(String xpath) {
        if (xpath == null || xpath.isEmpty()) {
            return 0;
        }
        int depth = 0;
        for (char c : xpath.toCharArray()) {
            if (c == '/') {
                depth++;
            }
        }
        if (xpath.startsWith("/") && !xpath.startsWith("//")) {
            depth--; // 根节点 "/" 不算作深度
        }
        return depth;
    }

    // 处理转义字符
    private String unescapeXml(String xml) {
        return xml.replace("\\n", "\n")
                .replace("\\\"", "\"");
    }
}
