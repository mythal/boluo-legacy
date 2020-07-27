import * as React from 'react';
import { css } from '@emotion/core';
import Button from '../atoms/Button';
import {
  dialogBgColor,
  dialogHeaderBgColor,
  dialogTitleColor,
  roundedPx,
  spacingN,
  textSm,
  uiShadow,
} from '../../styles/atoms';
import CloseButton from './CloseButton';
import Modal from '../atoms/Modal';
import { useCallback, useEffect } from 'react';

interface Props {
  children: React.ReactChild;
  mask?: boolean;
  title?: string;
  dismiss?: () => void;
  confirm?: () => void;
  confirmText?: string;
}

const style = css`
  background-color: ${dialogBgColor};
  ${roundedPx};
  ${uiShadow};
  transform: translate(-50%, -50%);
  min-width: 20em;
`;

const buttonAreaStyle = css`
  text-align: right;
  padding-top: ${spacingN(4)};
  padding: ${spacingN(2)};
`;

const headerStyle = css`
  ${textSm};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${dialogHeaderBgColor};
`;

const titleStyle = css`
  color: ${dialogTitleColor};
  padding: ${spacingN(2)};
`;

const contentStyle = css`
  padding: ${spacingN(2)};
`;

function Dialog({ children, mask, dismiss, confirm, confirmText, title }: Props) {
  confirmText = confirmText || '确定';
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismiss) {
        dismiss();
      }
    },
    [dismiss]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  return (
    <Modal css={style} mask={mask} onClickMask={dismiss}>
      {title && (
        <div css={headerStyle}>
          <span css={titleStyle}>{title}</span>
          {dismiss && <CloseButton onClick={dismiss} />}
        </div>
      )}
      <div css={contentStyle}>{children}</div>
      {confirm && (
        <div css={buttonAreaStyle}>
          <Button data-small autoFocus data-variant="primary" onClick={confirm}>
            {confirmText}
          </Button>
        </div>
      )}
    </Modal>
  );
}

export default Dialog;