import React from 'react';
import { Map } from 'immutable';
import { Id } from '../../utils';
import { MessageItem } from './MessageItem';
import { DayDivider } from './DayDivider';
import { ChatItem } from '../../reducers/chat';

interface Props {
  item: ChatItem;
  colorMap: Map<Id, string>;
  prevItemTime?: Date;
}

export const ChatListItem = React.memo<Props>(({ item, colorMap, prevItemTime }) => {
  if (prevItemTime && item.date.getDate() !== prevItemTime.getDate()) {
    return (
      <>
        <DayDivider date={item.date} />
        <ChatListItem item={item} colorMap={colorMap} />
      </>
    );
  }
  if (item.type === 'MESSAGE') {
    const {
      id,
      text,
      entities,
      name,
      isAction,
      isMaster,
      inGame,
      seed,
      created,
      folded,
      mediaId,
      senderId,
    } = item.message;
    const color = colorMap.get(item.message.senderId);
    return (
      <MessageItem
        id={id}
        isPreview={false}
        text={text}
        entities={entities}
        name={name}
        isAction={isAction}
        isMaster={isMaster}
        inGame={inGame}
        color={color}
        seed={seed}
        time={created}
        folded={folded}
        mediaId={mediaId}
        senderId={senderId}
      />
    );
  } else if (item.type === 'PREVIEW') {
    if (item.preview.text === '') {
      return null;
    }
    const { id, text, entities, name, isAction, isMaster, inGame, start, senderId } = item.preview;
    const color = colorMap.get(item.preview.senderId);
    return (
      <MessageItem
        id={id}
        isPreview={true}
        text={text ?? ''}
        entities={entities}
        name={name}
        isAction={isAction}
        isMaster={isMaster}
        inGame={inGame}
        color={color}
        time={start}
        folded={false}
        mediaId={null}
        senderId={senderId}
      />
    );
  } else {
    return null;
  }
});