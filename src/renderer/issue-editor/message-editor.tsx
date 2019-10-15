import React from 'react';
import { Classes, Dialog } from '@blueprintjs/core';

import { Workspace } from 'main/storage';

import { OBIssue } from 'models/issues';
import {
  Message,
  isApprovedRecommendations,
  isServiceRestrictions,
  isRunningAnnexes,
  isAmendment,
  isTelephoneServiceV2,
} from 'models/messages';

import { ApprovedRecommendationsEditor } from './messages/approved_recommendations';
import { MessageEditor as RunningAnnexesEditor } from './messages/running_annexes';
import { TelephoneServiceMessageEditorV2 } from './messages/telephone_service_2';
import { AmendmentEditor } from './messages/amendment';
import { MessageEditor as ServiceRestrictionsMessageEditor } from './messages/service_restrictions';
import * as styles from './styles.scss';


/* New message prompt props. */

export interface NewMessagePromptProps {
  idx: number,
  issue: OBIssue,
  handleNewMessage: (msg: Message, atIndex: number) => void,
}


/* Message editor spec.

   Editor implementations (React functional components) are given a ``message``
   and are expected to call ``onChange`` with updated message after user edits it.

   They are also provided ``workspace`` and ``issue`` for messages that involve
   other messages within current OB edition, or data from past editions. */

export interface MessageEditorProps {
  workspace: Workspace,
  issue: OBIssue,
  message: Message,
  onChange: (updatedMessage: any) => void,
}

export function getMessageEditor(msg: Message): React.FC<MessageEditorProps> {
  if (isApprovedRecommendations(msg)) {
    return ApprovedRecommendationsEditor;
  } else if (isRunningAnnexes(msg)) {
    return RunningAnnexesEditor;
  } else if (isTelephoneServiceV2(msg)) {
    return TelephoneServiceMessageEditorV2;
  } else if (isServiceRestrictions(msg)) {
    return ServiceRestrictionsMessageEditor;
  } else if (isAmendment(msg)) {
    return AmendmentEditor;
  } else {
    return () => <p>Messages of type {msg.type} aren’t supported.</p>
    //throw new Error("Unknown message type");
  }
}

interface MessageEditorDialogProps {
  isOpen: boolean,
  onClose: () => void,
  key?: string,
  title?: string,
  width?: string,
  saveButton?: JSX.Element,
  className?: string,
}
export const MessageEditorDialog: React.FC<MessageEditorDialogProps> = function (props) {
  return (
    <Dialog
        key={props.key || "dialog"}
        title={props.title || undefined}
        isOpen={props.isOpen}
        className={props.className || styles.messageEditorDialog}
        onClose={props.onClose}
        style={props.width ? { width: props.width } : {}}
      >
      <div className={Classes.DIALOG_BODY}>
        {props.children}
      </div>

      {props.saveButton
        ? <div className={Classes.DIALOG_FOOTER}>
            {props.saveButton}
          </div>
        : ''}
    </Dialog>
  );
};