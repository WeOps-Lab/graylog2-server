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
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import {Button, Panel} from 'components/bootstrap';
import {Icon} from 'components/common';

import AggregationConditionSummary from './AggregationConditionSummary';

const StyledPanel = styled(Panel)`
  margin-top: 10px;
`;

const StyledButton = styled(Button)`
  margin-left: 15px;
  vertical-align: baseline;
`;

const AggregationConditionsFormSummary = (props) => {
  const {conditions, series, expressionValidation, showInlineValidation, toggleShowValidation} = props;

  return (
    <div>
      <StyledPanel header="条件描述">
        {expressionValidation.isValid
          ? <p className="text-success"><Icon name="check-square"/>&nbsp;条件合法</p>
          : (
            <p className="text-danger">
              <Icon name="exclamation-triangle"/>&nbsp;条件不合法
              <StyledButton bsSize="xsmall" onClick={toggleShowValidation}>
                {showInlineValidation ? '隐藏异常' : '显示异常'}
              </StyledButton>
            </p>
          )}
        <b>预览:</b> <AggregationConditionSummary series={series} conditions={conditions}/>
      </StyledPanel>
    </div>
  );
};

AggregationConditionsFormSummary.propTypes = {
  conditions: PropTypes.object.isRequired,
  series: PropTypes.array.isRequired,
  expressionValidation: PropTypes.object,
  showInlineValidation: PropTypes.bool,
  toggleShowValidation: PropTypes.func.isRequired,
};

AggregationConditionsFormSummary.defaultProps = {
  expressionValidation: {isValid: true},
  showInlineValidation: false,
};

export default AggregationConditionsFormSummary;
