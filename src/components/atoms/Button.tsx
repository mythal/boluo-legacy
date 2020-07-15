import * as React from 'react';
import { css } from '@emotion/core';
import { controlRounded, dangerColor, normalColor, primaryColor, spacingN, textSm } from '../../styles/theme';
import { disabled, focused, onDisabled, onHover } from '../../styles/atoms';
import { lighten } from 'polished';

const btnTextShadow = '0 1px 0 rgba(0, 0, 0, 0.125)';

const btnColor = (color: string) => css`
  background-color: ${color};
  border-color: ${lighten(0.2, color)};
`;

const btn = css`
  display: inline-flex;
  justify-content: space-around;
  min-width: 5em;
  user-select: none;
  cursor: pointer;
  border: 1px solid;
  color: white;
  text-shadow: ${btnTextShadow};
  transition-property: all;
  transition-duration: 0.1s;
  transition-timing-function: ease-in;

  ${controlRounded};

  & svg {
    filter: drop-shadow(${btnTextShadow});
  }

  &:hover {
    filter: brightness(110%);
  }

  &:active,
  &:focus:active {
    filter: brightness(95%);
  }

  &:focus {
    ${focused};
  }

  padding: ${spacingN(2.5)} ${spacingN(3)};

  ${btnColor(normalColor)};

  &[data-variant='primary'] {
    ${btnColor(primaryColor)};
  }

  &[data-variant='danger'] {
    ${btnColor(dangerColor)};
  }

  &[data-icon='true'] {
    min-width: unset;
  }

  &[data-small='true'] {
    font-size: ${textSm};
  }

  ${onDisabled(disabled, onHover(disabled), { cursor: 'default' })};
`;

interface Props {
  variant?: 'normal' | 'danger' | 'primary';
  iconOnly?: boolean;
  small?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

function Button(
  { children, iconOnly, small, variant, onClick, disabled, ...props }: Props,
  ref?: React.Ref<HTMLButtonElement>
) {
  const handleClick: React.MouseEventHandler = () => {
    if (onClick) {
      onClick();
    }
  };
  return (
    <button
      css={btn}
      ref={ref}
      data-icon={iconOnly}
      data-variant={variant}
      data-small={small}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export default React.forwardRef<HTMLButtonElement, Props>(Button);
