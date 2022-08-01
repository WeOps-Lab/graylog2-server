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
import React, { useCallback, useMemo, useRef, useState } from 'react';

import { useStore } from 'stores/connect';
import { Link } from 'components/common/router';
import { SelectableList } from 'components/common';
import { Button, ControlLabel, FormGroup, BootstrapModalForm, Input } from 'components/bootstrap';
import { getValueFromInput } from 'util/FormsUtils';
import NumberUtils from 'util/NumberUtils';
import Routes from 'routing/Routes';
import type { PipelineType, StageType } from 'stores/pipelines/PipelinesStore';
import { RulesStore } from 'stores/rules/RulesStore';

type Props = {
  pipeline: PipelineType,
  stage?: StageType,
  create: boolean,
  save: (nextStage: StageType, callback: () => void) => void,
};

const StageForm = ({ pipeline, stage, create, save }: Props) => {
  const modalRef = useRef<BootstrapModalForm>();

  const _initialStageNumber = useMemo(() => (
    create ? Math.max(...pipeline.stages.map((s) => s.stage)) + 1 : stage.stage
  ), [create, pipeline.stages, stage.stage]);

  const [nextStage, setNextStage] = useState<StageType>({ ...stage, stage: _initialStageNumber });
  const { rules } = useStore(RulesStore);

  const openModal = () => {
    if (modalRef.current) {
      modalRef.current.open();
    }
  };

  const _onChange = ({ target }) => {
    setNextStage((currentStage) => ({ ...currentStage, [target.name]: getValueFromInput(target) }));
  };

  const _onRulesChange = (newRules) => {
    setNextStage((currentStage) => ({ ...currentStage, rules: newRules }));
  };

  const _closeModal = () => {
    if (modalRef.current) {
      modalRef.current.close();
    }
  };

  const _onSaved = () => {
    _closeModal();
  };

  const isOverridingStage = useMemo(() => (
    nextStage.stage !== _initialStageNumber && pipeline.stages.some(({ stage: s }) => s === nextStage.stage)
  ), [nextStage.stage, _initialStageNumber, pipeline.stages]);

  const _handleSave = () => {
    if (!isOverridingStage) {
      save(nextStage, _onSaved);
    }
  };

  const _formatRuleOption = ({ title }) => {
    return { value: title, label: title };
  };

  const _filterChosenRules = (rule, chosenRules) => {
    return !chosenRules.includes(rule.title);
  };

  const _getFormattedOptions = useCallback(() => {
    const chosenRules = nextStage.rules;

    return rules ? rules.filter((rule) => _filterChosenRules(rule, chosenRules)).map(_formatRuleOption) : [];
  }, [nextStage.rules, rules]);

  const rulesHelp = (
    <span>
      选择在此阶段评估的规则，或在{' '}中创建一个
      <Link to={Routes.SYSTEM.PIPELINES.RULES}>规则</Link>.
    </span>
  );

  return (
    <span>
      <Button onClick={openModal}
              bsStyle={create ? 'success' : 'info'}>
        {create ? '新增' : '编辑'}
      </Button>
      <BootstrapModalForm ref={modalRef}
                          title={`${create ? '新增' : '编辑'} 阶段 ${nextStage.stage}`}
                          onSubmitForm={_handleSave}
                          submitButtonText="保存">
        <fieldset>
          <Input type="number"
                 id="stage"
                 name="stage"
                 label="阶段"
                 autoFocus
                 min={NumberUtils.JAVA_INTEGER_MIN_VALUE + 1}
                 max={NumberUtils.JAVA_INTEGER_MAX_VALUE}
                 onChange={_onChange}
                 bsStyle={isOverridingStage ? 'error' : null}
                 help={isOverridingStage
                   ? '阶段已在使用中，请使用其他编号或编辑现有阶段.'
                   : '阶段优先级别,数字越小，越早执行.'}
                 value={nextStage.stage} />

          <FormGroup>
            <ControlLabel>Continue processing on next stage when</ControlLabel>
          </FormGroup>

          <Input type="radio"
                 id="match_all"
                 name="match"
                 value="ALL"
                 label="此阶段的所有规则都与消息匹配"
                 onChange={_onChange}
                 checked={nextStage.match === 'ALL'} />

          <Input type="radio"
                 id="match_any"
                 name="match"
                 value="EITHER"
                 label="此阶段至少有一个规则与消息匹配"
                 onChange={_onChange}
                 checked={nextStage.match === 'EITHER'} />

          <Input type="radio"
                 id="match_pass"
                 name="match"
                 value="PASS"
                 label="此阶段没有或更多规则匹配"
                 onChange={_onChange}
                 checked={nextStage.match === 'PASS'} />

          <Input id="stage-rules-select"
                 label="阶段规则"
                 help={rulesHelp}>
            <SelectableList options={_getFormattedOptions()}
                            isLoading={!rules}
                            onChange={_onRulesChange}
                            selectedOptions={nextStage.rules} />
          </Input>
        </fieldset>
      </BootstrapModalForm>
    </span>
  );
};

StageForm.propTypes = {
  pipeline: PropTypes.object.isRequired,
  stage: PropTypes.object,
  create: PropTypes.bool,
  save: PropTypes.func.isRequired,
};

StageForm.defaultProps = {
  create: false,
  stage: {
    stage: 0,
    match: 'EITHER',
    rules: [],
  },
};

export default StageForm;
