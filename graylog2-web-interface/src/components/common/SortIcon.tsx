import styled, { css } from 'styled-components';
import React, { useCallback, useMemo } from 'react';

import Icon from 'components/common/Icon';

const StyledSortIcon = styled.button(({ theme }) => {
  return css`
    border: 0;
    background: transparent;
    padding: 5px;
    cursor: pointer;
    position: relative;
    color: ${theme.colors.gray[70]};
    &.active {
      color: ${theme.colors.gray[20]};
    }
  `;
});

const Bulb = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  font-size: 0.75rem;
  font-weight: 600;
`;

type Props<AscDirection extends string, DescDirection extends string> = {
  activeDirection: AscDirection | DescDirection | null,
  ascId?: string,
  descId?: string
  onChange: (activeDirection: AscDirection | DescDirection | null) => void,
  ariaLabel?: string,
  title?: string,
  order?: number,
  dataTestId?: string | undefined
  className?: string
}

const SortIcon = <AscDirection extends string, DescDirection extends string>({
  activeDirection,
  onChange,
  ariaLabel,
  title,
  order,
  dataTestId,
  ascId,
  descId,
  className,
}: Props<AscDirection, DescDirection>) => {
  const handleSortChange = useCallback(() => onChange(activeDirection), [activeDirection, onChange]);
  const iconName = useMemo(() => {
    if (activeDirection === ascId) return 'arrow-up-short-wide';
    if (activeDirection === descId) return 'arrow-down-wide-short';

    return 'arrow-down-wide-short';
  }, [activeDirection, ascId, descId]);
  const sortActive = !!activeDirection;

  return (
    <StyledSortIcon className={sortActive ? 'active' : ''}
                    title={title}
                    type="button"
                    aria-label={ariaLabel}
                    onClick={handleSortChange}
                    data-testid={dataTestId}>
      <Icon name={iconName} className={className} />
      {order && <Bulb>{order}</Bulb>}
    </StyledSortIcon>
  );
};

SortIcon.defaultProps = {
  ariaLabel: 'Sort',
  title: 'Sort',
  order: undefined,
  dataTestId: undefined,
  ascId: 'Ascending',
  descId: 'Descending',
  className: '',
};

export default SortIcon;
