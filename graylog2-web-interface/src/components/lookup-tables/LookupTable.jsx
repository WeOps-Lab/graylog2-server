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
import PropTypes from 'prop-types';
import React from 'react';

import { LinkContainer, Link } from 'components/common/router';
import { ButtonToolbar, Row, Col, Button, Input } from 'components/bootstrap';
import Routes from 'routing/Routes';
import * as FormsUtils from 'util/FormsUtils';
import { LookupTablesActions } from 'stores/lookup-tables/LookupTablesStore';

class LookupTable extends React.Component {
  static propTypes = {
    table: PropTypes.object.isRequired,
    cache: PropTypes.object.isRequired,
    dataAdapter: PropTypes.object.isRequired,
  };

  state = {
    lookupKey: null,
    lookupResult: null,
    purgeKey: null,
  };

  _onChange = (event) => {
    this.setState({ lookupKey: FormsUtils.getValueFromInput(event.target) });
  };

  _onChangePurgeKey = (event) => {
    this.setState({ purgeKey: FormsUtils.getValueFromInput(event.target) });
  };

  _onPurgeKey = (e) => {
    e.preventDefault();

    if (this.state.purgeKey && this.state.purgeKey.length > 0) {
      LookupTablesActions.purgeKey(this.props.table, this.state.purgeKey);
    }
  };

  _onPurgeAll = (e) => {
    e.preventDefault();
    LookupTablesActions.purgeAll(this.props.table);
  };

  _lookupKey = (e) => {
    e.preventDefault();

    LookupTablesActions.lookup(this.props.table.name, this.state.lookupKey).then((result) => {
      this.setState({ lookupResult: result });
    });
  };

  render() {
    return (
      <Row className="content">
        <Col md={6}>
          <h2>
            {this.props.table.title}
          </h2>
          <p>{this.props.table.description}</p>
          <dl>
            <dt>数据源</dt>
            <dd>
              <Link to={Routes.SYSTEM.LOOKUPTABLES.DATA_ADAPTERS.show(this.props.dataAdapter.name)}>{this.props.dataAdapter.title}</Link>
            </dd>
            <dt>缓存</dt>
            <dd><Link to={Routes.SYSTEM.LOOKUPTABLES.CACHES.show(this.props.cache.name)}>{this.props.cache.title}</Link></dd>
          </dl>
          <LinkContainer to={Routes.SYSTEM.LOOKUPTABLES.edit(this.props.table.name)}>
            <Button bsStyle="success">编辑</Button>
          </LinkContainer>
          {
            (this.props.table.default_single_value || this.props.table.default_multi_value)
            && (
            <dl>
              <dt>默认单值</dt>
              <dd><code>{this.props.table.default_single_value}</code>{' '}({this.props.table.default_single_value_type.toLowerCase()})</dd>
              <dt>默认多值</dt>
              <dd><code>{this.props.table.default_multi_value}</code>{' '}({this.props.table.default_multi_value_type.toLowerCase()})</dd>
            </dl>
            )
          }
          <hr />
          <h2>清空缓存</h2>
          <p>可以清空整个缓存,或者只清空某个字段.</p>
          <form onSubmit={this._onPurgeKey}>
            <fieldset>
              <Input type="text"
                     id="purge-key"
                     name="purge-key"
                     label="映射字段"
                     onChange={this._onChangePurgeKey}
                     help="清除缓存中的某个映射"
                     required
                     value={this.state.purgeKey} />
              <ButtonToolbar>
                <Button type="submit" bsStyle="success">清空字段</Button>
                <Button type="button" bsStyle="info" onClick={this._onPurgeAll}>清空所有</Button>
              </ButtonToolbar>
            </fieldset>
          </form>
        </Col>
        <Col md={6}>
          <h2>测试映射</h2>
          <p>您可以在这里测试映射.数据会被DataInsight所缓存.</p>
          <form onSubmit={this._lookupKey}>
            <fieldset>
              <Input type="text"
                     id="key"
                     name="key"
                     label="映射字段"
                     required
                     onChange={this._onChange}
                     help="填写用于测试的映射字段."
                     value={this.state.lookupKey} />
              <Button type="submit" bsStyle="success">测试</Button>
            </fieldset>
          </form>
          {this.state.lookupResult && (
            <div>
              <h4>映射结果</h4>
              <pre>{JSON.stringify(this.state.lookupResult, null, 2)}</pre>
            </div>
          )}
        </Col>
      </Row>
    );
  }
}

export default LookupTable;
