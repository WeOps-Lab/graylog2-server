// @flow strict
import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { createGRN } from 'logic/permissions/GRN';
import { useStore } from 'stores/connect';
import { Spinner } from 'components/common';
import { EntityShareStore, EntityShareActions } from 'stores/permissions/EntityShareStore';
import { type EntitySharePayload } from 'actions/permissions/EntityShareActions';
import SharedEntity from 'logic/permissions/SharedEntity';
import BootstrapModalConfirm from 'components/bootstrap/BootstrapModalConfirm';

import EntityShareSettings from './EntityShareSettings';

type Props = {
  description: string,
  entityId: $PropertyType<SharedEntity, 'id'>,
  entityTitle: $PropertyType<SharedEntity, 'title'>,
  entityType: $PropertyType<SharedEntity, 'type'>,
  onClose: () => void,
};

const EntityShareModal = ({ description, entityId, entityType, entityTitle, onClose }: Props) => {
  const { state: entityShareState } = useStore(EntityShareStore);
  const [disableSubmit, setDisableSubmit] = useState(false);
  const entityGRN = createGRN(entityType, entityId);
  const granteesSelectRef = useRef();

  useEffect(() => {
    EntityShareActions.prepare(entityGRN);
  }, [entityGRN]);

  const _handleSave = () => {
    setDisableSubmit(true);
    const granteesSelect = granteesSelectRef?.current;
    const garnteesSelectValue = granteesSelect?.state?.value;
    const granteesSelectOptions = granteesSelect?.props?.options;
    const payload: EntitySharePayload = {
      selected_grantee_capabilities: entityShareState.selectedGranteeCapabilities,
    };

    if (garnteesSelectValue) {
      const selectedOption = granteesSelectOptions?.find((option) => option.value === garnteesSelectValue);

      if (!selectedOption) {
        throw Error(`Can't find ${garnteesSelectValue} in grantees select options on save`);
      }

      // eslint-disable-next-line no-alert
      if (!window.confirm(`"${selectedOption.label}" got selected but was never added as a collaborator. Do you want to continue anyway?`)) {
        return;
      }
    }

    EntityShareActions.update(entityGRN, payload).then(onClose);
  };

  return (
    <BootstrapModalConfirm confirmButtonDisabled={disableSubmit}
                           confirmButtonText="Save"
                           cancelButtonText="Discard changes"
                           onConfirm={_handleSave}
                           onModalClose={onClose}
                           showModal
                           title={<>Sharing: {entityType}: <i>{entityTitle}</i></>}>
      <>
        {(entityShareState && entityShareState.entity === entityGRN) ? (
          <EntityShareSettings description={description}
                               entityGRN={entityGRN}
                               entityType={entityType}
                               entityShareState={entityShareState}
                               granteesSelectRef={granteesSelectRef}
                               setDisableSubmit={setDisableSubmit} />
        ) : (
          <Spinner />
        )}
      </>
    </BootstrapModalConfirm>
  );
};

EntityShareModal.propTypes = {
  description: PropTypes.string.isRequired,
  entityId: PropTypes.string.isRequired,
  entityTitle: PropTypes.string.isRequired,
  entityType: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EntityShareModal;
