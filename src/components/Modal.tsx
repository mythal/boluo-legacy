import React from 'react';
import { Portal } from './Portal';
import Icon from './Icon';
import { cls } from '../utils';

interface Props {
  open: boolean;
  dismiss: () => void;
  children: React.ReactNode;
}

function Modal({ open, dismiss, children }: Props) {
  return (
    <Portal>
      <div
        className={cls(
          'modal-mask transition-all duration-300 z-20',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={dismiss}
      />
      {open && (
        <div className="modal">
          <button className="btn-sized btn-icon float-right text-sm m-2 p-0 w-6 h-6 circles" onClick={dismiss}>
            <Icon name="times" />
          </button>
          {children}
        </div>
      )}
    </Portal>
  );
}

export default React.memo(Modal);