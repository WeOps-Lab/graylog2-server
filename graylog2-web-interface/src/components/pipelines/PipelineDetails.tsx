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
import styled from 'styled-components';

import { Row, Col } from 'components/bootstrap';
import { RelativeTime } from 'components/common';
import { MetricContainer, CounterRate } from 'components/metrics';
import type { PipelineType } from 'stores/pipelines/PipelinesStore';

import PipelineForm from './PipelineForm';

const PipelineDl = styled.dl`
  & {
    margin-bottom: 0;
    margin-top: 10px;
  }

  & > dt {
    text-align: left;
    width: 160px;
  }

  & > dt::after {
    content: ':';
  }

  & > dd {
    margin-left: 120px;
  }
`;

type Props = {
  pipeline?: PipelineType,
  create?: boolean,
  onChange: (event) => void,
  onCancel?: () => void,
};

const PipelineDetails = ({ pipeline, create, onChange, onCancel }: Props) => {
  if (create) {
    return <PipelineForm create save={onChange} onCancel={onCancel} modal={false} />;
  }

  return (
    <div>
      <Row>
        <Col md={12}>
          <div className="pull-right">
            <PipelineForm pipeline={pipeline} save={onChange} />
          </div>
          <h2>详情</h2>
          <PipelineDl className="dl-horizontal">
            <dt>标题</dt>
            <dd>{pipeline.title}</dd>
            <dt>描述</dt>
            <dd>{pipeline.description}</dd>
            <dt>创建于</dt>
            <dd><RelativeTime dateTime={pipeline.created_at} /></dd>
            <dt>最后修改于</dt>
            <dd><RelativeTime dateTime={pipeline.modified_at} /></dd>
            <dt>当前吞吐量</dt>
            <dd>
              <MetricContainer name={`org.graylog.plugins.pipelineprocessor.ast.Pipeline.${pipeline.id}.executed`}>
                <CounterRate suffix="消息/秒" />
              </MetricContainer>
            </dd>
          </PipelineDl>
        </Col>
      </Row>
      <hr />
    </div>
  );
};

PipelineDetails.propTypes = {
  pipeline: PropTypes.object,
  create: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
};

PipelineDetails.defaultProps = {
  pipeline: undefined,
  create: false,
  onCancel: () => {},
};

export default PipelineDetails;
