import React from 'react';
import ChatItemToolbarButton from '../ChatItemToolbarButton';
import paperPlane from '../../../assets/icons/paper-plane.svg';
import { isMac } from '../../../utils/browser';
import { useSelector } from '../../../store';
import { inGameAtom, inputNameAtom, sendingAtom, sourceAtom } from './state';
import { useChannelId } from '../../../hooks/useChannelId';
import { useAtom } from 'jotai';
import { useAtomValue } from 'jotai/utils';
import { useSendPreview } from './useSendPreview';
import { whyCannotSend } from './useOnSend';

interface Props {
  onSend: () => void;
}

export const SendButton = ({ onSend }: Props) => {
  const channelId = useChannelId();
  const source = useAtomValue(sourceAtom, channelId);
  const enterSend = useSelector((state) => state.profile!.settings.enterSend);
  const inputName = useAtomValue(inputNameAtom, channelId).trim();
  const inGame = useAtomValue(inGameAtom, channelId);
  const [sending] = useAtom(sendingAtom, channelId);
  useSendPreview();
  let sendButtonInfo = isMac ? '⌘ + ⏎' : 'Ctrl + ⏎';
  if (enterSend) {
    sendButtonInfo = '⏎';
  }
  const cannotSendReason = whyCannotSend(inGame, inputName, source);
  sendButtonInfo = cannotSendReason || sendButtonInfo;
  return (
    <ChatItemToolbarButton
      loading={sending}
      sprite={paperPlane}
      onClick={onSend}
      disabled={cannotSendReason !== null}
      title="发送"
      size="large"
      info={sendButtonInfo}
      x="left"
    />
  );
};