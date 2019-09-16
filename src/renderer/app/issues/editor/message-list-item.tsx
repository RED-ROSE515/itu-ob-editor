import React from 'react';
import { SimpleEditableCard } from 'sse/renderer/widgets/editable-card-list';
import { Message } from 'models/messages';
import { getMessageTypeTitle, getMessageSubtitle } from './messages';


interface MessageItemProps {
  selected: boolean,
  message: Message,
  onSelect: () => void,
  onDelete: () => void,
}
export function MessageItem(props: MessageItemProps) {
  return (
    <SimpleEditableCard
        selected={props.selected}
        onSelect={props.onSelect}
        onDelete={props.onDelete}>
      {getMessageTypeTitle(props.message.type)}
      &emsp;
      <small>{getMessageSubtitle(props.message)}</small>
    </SimpleEditableCard>
  );
};
