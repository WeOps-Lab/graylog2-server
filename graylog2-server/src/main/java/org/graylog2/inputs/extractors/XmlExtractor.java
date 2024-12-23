package org.graylog2.inputs.extractors;

import com.codahale.metrics.MetricRegistry;
import org.graylog2.ConfigurationException;
import org.graylog2.plugin.inputs.Converter;
import org.graylog2.plugin.inputs.Extractor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;
import java.io.StringReader;
import java.util.List;
import java.util.Map;

public class XmlExtractor extends Extractor {
    private static final Logger LOG = LoggerFactory.getLogger(XmlExtractor.class);
    private final XPathExpression xPathExpression;

    public XmlExtractor(MetricRegistry metricRegistry,
                        String id,
                        String title,
                        long order,
                        CursorStrategy cursorStrategy,
                        String sourceField,
                        String targetField,
                        Map<String, Object> extractorConfig,
                        String creatorUserId,
                        List<Converter> converters,
                        ConditionType conditionType,
                        String conditionValue) throws ReservedFieldException, ConfigurationException {
        super(metricRegistry, id, title, order, Type.XML, cursorStrategy, sourceField, targetField, extractorConfig, creatorUserId, converters, conditionType, conditionValue);

        String expression = (String) extractorConfig.get("expression");
        if (expression == null || expression.isEmpty()) {
            throw new ConfigurationException("XPath expression must not be null or empty");
        }

        try {
            XPathFactory xPathFactory = XPathFactory.newInstance();
            XPath xpath = xPathFactory.newXPath();
            xPathExpression = xpath.compile(expression);
        } catch (XPathExpressionException e) {
            LOG.error("Invalid XPath expression: {}", expression, e);
            throw new ConfigurationException("Invalid XPath expression" + e);
        }
    }

    @Override
    protected Result[] run(String value) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            InputSource is = new InputSource(new StringReader(value));
            Document document = builder.parse(is);

            // Use the XPath expression to evaluate against the Document object.
            String result = xPathExpression.evaluate(document);
            if (result != null && !result.isEmpty()) {
                return new Result[]{new Result(result, -1, -1)};
            }
        } catch (Exception e) {
            throw new ExtractorException(e);
        }
        return new Result[0];
    }
}

//package org.graylog2.inputs.extractors;
//
//import com.codahale.metrics.MetricRegistry;
//import org.graylog2.ConfigurationException;
//import org.graylog2.plugin.inputs.Converter;
//import org.graylog2.plugin.inputs.Extractor;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//
//import javax.xml.xpath.XPath;
//import javax.xml.xpath.XPathExpression;
//import javax.xml.xpath.XPathExpressionException;
//import javax.xml.xpath.XPathFactory;
//import java.util.List;
//import java.util.Map;
//
//import javax.xml.parsers.DocumentBuilder;
//import javax.xml.parsers.DocumentBuilderFactory;
//import org.w3c.dom.Document;
//import org.xml.sax.InputSource;
//
//import java.io.StringReader;
//
//public class XmlExtractor extends Extractor {
//    private static final Logger LOG = LoggerFactory.getLogger(XmlExtractor.class);
//    private final XPathExpression xPathExpression;
//
//    public XmlExtractor(MetricRegistry metricRegistry,
//                        String id,
//                        String title,
//                        long order,
//                        CursorStrategy cursorStrategy,
//                        String sourceField,
//                        String targetField,
//                        Map<String, Object> extractorConfig,
//                        String creatorUserId,
//                        List<Converter> converters,
//                        ConditionType conditionType,
//                        String conditionValue) throws ReservedFieldException, ConfigurationException {
//        super(metricRegistry, id, title, order, Type.XML, cursorStrategy, sourceField, targetField, extractorConfig, creatorUserId, converters, conditionType, conditionValue);
//
//        String expression = (String) extractorConfig.get("expression");
//        if (expression == null || expression.isEmpty()) {
//            throw new ConfigurationException("XPath expression must not be null or empty");
//        }
//
//        try {
//            XPathFactory xPathFactory = XPathFactory.newInstance();
//            XPath xpath = xPathFactory.newXPath();
//            xPathExpression = xpath.compile(expression);
//        } catch (XPathExpressionException e) {
//            LOG.error("Invalid XPath expression: {}", expression, e);
//            throw new ConfigurationException("Invalid XPath expression" + e);
//        }
//    }
//
//    @Override
//    protected Result[] run(String value) {
//        try {
//            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
//            DocumentBuilder builder = factory.newDocumentBuilder();
//            InputSource is = new InputSource(new StringReader(value));
//            Document document = builder.parse(is);
//
//            // Use the XPath expression to evaluate against the Document object.
//            String result = xPathExpression.evaluate(document);
//            this.targetField = (String) this.extractorConfig.get("expression");
//            if (result != null && !result.isEmpty()) {
//                // Use the target field specified in the extractor configuration
//                return new Result[]{new Result(result, (String) this.extractorConfig.get("expression"), -1, -1)};
//            }
//        } catch (Exception e) {
//            throw new ExtractorException(e);
//        }
//        return new Result[0];
//    }
//}
