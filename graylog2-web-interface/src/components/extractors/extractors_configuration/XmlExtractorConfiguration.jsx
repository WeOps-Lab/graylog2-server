import PropTypes from 'prop-types';
import React from 'react';

import { Row, Col, Button, Input } from 'components/bootstrap';
import { Icon } from 'components/common';
import DocumentationLink from 'components/support/DocumentationLink';
import DocsHelper from 'util/DocsHelper';
import UserNotification from 'util/UserNotification';
import FormUtils from 'util/FormsUtils';
import ToolsStore from 'stores/tools/ToolsStore';

class XmlExtractorConfiguration extends React.Component {
  static propTypes = {
    configuration: PropTypes.object.isRequired, // 配置对象
    exampleMessage: PropTypes.string,          // 示例消息
    onChange: PropTypes.func.isRequired,       // 配置变更触发
    onExtractorPreviewLoad: PropTypes.func.isRequired, // 提取器预览触发
  };

  state = {
    trying: false,
  };

  _onChange = (key) => {
    return (event) => {
      const { configuration, onChange, onExtractorPreviewLoad } = this.props;
      onExtractorPreviewLoad(undefined); // 清空预览内容

      const newConfig = configuration;
      newConfig[key] = FormUtils.getValueFromInput(event.target);
      onChange(newConfig); // 触发配置更新
    };
  };

  _onTryClick = () => {
    const { configuration, exampleMessage, onExtractorPreviewLoad } = this.props;

    this.setState({ trying: true });

    // 调用后台工具 API 测试 XPath 表达式
    const promise = ToolsStore.testXml(configuration.expression, exampleMessage);

    promise.then((result) => {
      // 返回结果处理
      if (result.error_message) {
        UserNotification.error(`XPath 测试失败: ${result.error_message}`);
        return;
      }

      if (!result.matched) {
        UserNotification.warning('XPath 表达式没有匹配任何内容，请检查您的输入');
        return;
      }

      const preview = (result.result ? <samp>{result.result}</samp> : '');
      onExtractorPreviewLoad(preview);
    }).finally(() => {
      // 标记操作完成
      this.setState({ trying: false });
    });
  };

  _isTryButtonDisabled = () => {
    const { trying } = this.state;
    const { configuration, exampleMessage } = this.props;

    return trying || !configuration.expression || !exampleMessage;
  };

  render() {
    const { configuration } = this.props;

    const helpMessage = (
      <span>
        使用 XPath 表达式提取 XML 数据。
        查看相关 <DocumentationLink page={DocsHelper.PAGES.EXTRACTORS} text="文档" />。
      </span>
    );

    return (
      <div>
        <Input id="xpath-input"
               label="XPath 表达式"
               labelClassName="col-md-2"
               wrapperClassName="col-md-10"
               help={helpMessage}>
          <Row className="row-sm">
            <Col md={11}>
              <input type="text"
                     id="expression"
                     className="form-control"
                     placeholder="/root/node"
                     onChange={this._onChange('expression')}
                     required
                     value={configuration.expression || ''} />
            </Col>
            <Col md={1} className="text-right">
              <Button bsStyle="info" onClick={this._onTryClick} disabled={this._isTryButtonDisabled()}>
                {this.state.trying ? <Icon name="spinner" spin /> : '测试'}
              </Button>
            </Col>
          </Row>
        </Input>
      </div>
    );
  }
}

export default XmlExtractorConfiguration;
