import React from 'react';
import { Position, Menu } from '@blueprintjs/core';
import { Select, ItemPredicate, ItemRenderer, ItemListRenderer, renderFilteredItems } from '@blueprintjs/select';

import { Index, QuerySet } from 'sse/storage/query';
import { openWindow } from 'sse/api/renderer';
import { AddCardTriggerButton } from 'sse/renderer/widgets/editable-card-list';
import * as editableCardListStyles from 'sse/renderer/widgets/editable-card-list/styles.scss';

import { Publication } from 'models/publications';
import { OBIssue } from 'models/issues';
import { getRunningAnnexesForIssue } from 'models/running-annexes';

import { NewItemPromptProps } from './new-item-menu';
import * as styles from '../styles.scss';


const MAX_MENU_ITEMS_TO_SHOW = 7;


type NewAnnexPromptProps = NewItemPromptProps & {
  issueId: number,
  issueIndex: Index<OBIssue>,
  disabledPublicationIDs: string[],
  publicationIndex: Index<Publication>,
}
export const NewAnnexPrompt: React.FC<NewAnnexPromptProps> = function (props) {
  const runningAnnexes = getRunningAnnexesForIssue(
    props.issueId,
    props.issueIndex,
    props.publicationIndex);

  const annexedPublicationIds = runningAnnexes.map(item => item.publication.id);
  const nonAnnexedPublications = new QuerySet<Publication>(props.publicationIndex).
    filter((item: [string, Publication]) => annexedPublicationIds.indexOf(item[0]) < 0).all();

  const items = [...runningAnnexes.map(annex => { return {
    title: annex.publication.title.en,
    id: annex.publication.id,
    position: annex.publication.positionOn,
  }}), ...nonAnnexedPublications.map(pub => { return {
    title: pub.title.en,
    id: pub.id,
    position: null,
  }})];

  function createAnnex(pub: AnnexablePublication) {
    return pub.id;
  }

  return (
    <NewAnnexSelector
      popoverProps={{
        wrapperTagName: 'div',
        targetTagName: 'div',
        position: Position.LEFT,
        minimal: true,
        boundary: "viewport",
      }}
      className={editableCardListStyles.addCardTriggerContainer}
      initialContent={filterUsageTip}
      items={items}
      itemRenderer={NewAnnexMenuItemRenderer}
      itemListRenderer={NewAnnexMenuRenderer}
      itemPredicate={NewAnnexMenuItemFilter}
      itemDisabled={(item) => {
        return props.disabledPublicationIDs.indexOf(item.id) >= 0;
      }}
      onItemSelect={(pub: AnnexablePublication) =>
        props.onCreate(createAnnex(pub))}
    ><AddCardTriggerButton highlight={props.highlight} label="Annex service publication" /></NewAnnexSelector>
  );
};


const noResultsMessage = (
  <Menu.Item disabled={true} text="No matching publications!" />
);

const filterUsageTip = (
  <Menu.Item disabled={true} text="Type publication title or rec. ID…" />
);

interface AnnexablePublication {
  title: string,
  id: string,
  position: Date | null,
}

const NewAnnexMenuRenderer: ItemListRenderer<AnnexablePublication> =
    function (props) {

  const hasExactMatch = props.filteredItems.
    find(i => i.id.toLowerCase() === props.query.trim().toLowerCase()) !== undefined;
  const filteredItems = props.filteredItems.slice(0, MAX_MENU_ITEMS_TO_SHOW);

  return (
    <Menu ulRef={props.itemsParentRef} className={styles.newItemMenu}>
      {renderFilteredItems({
        ...props,
        filteredItems: filteredItems,
      }, noResultsMessage, filterUsageTip)}

      {props.query !== '' && hasExactMatch === false
        ? renderLaunchPublicationCreator(props.query)
        : null}
    </Menu>
  );
};

const NewAnnexMenuItemRenderer: ItemRenderer<AnnexablePublication> =
    function (pub, { handleClick, modifiers, query }) {

  return (
    <Menu.Item
      key={pub.id}
      text={pub.title}
      onClick={handleClick}
      active={modifiers.active}
      title={modifiers.disabled ? `Publication was annexed to or amended in this edition` : undefined}
      disabled={modifiers.disabled} />
  );
};

const NewAnnexMenuItemFilter: ItemPredicate<AnnexablePublication> =
    function (query, pub, _index, exactMatch) {

  const normalizedTitle: string = pub.title.toLowerCase();
  const normalizedId: string = pub.id.toLowerCase();
  const normalizedQuery: string = query.toLowerCase();

  if (exactMatch) {
    return normalizedTitle === normalizedQuery;
  } else {
    return `${normalizedId} ${normalizedTitle}`.indexOf(normalizedQuery) >= 0;
  }
};

const renderLaunchPublicationCreator = function (query: string) {
  const MAX_ID_LENGTH_IN_PROMPT = 5;

  return (
    <Menu.Item
      icon="add"
      text={`Use “${(query.length > MAX_ID_LENGTH_IN_PROMPT) ? query.substr(0, MAX_ID_LENGTH_IN_PROMPT - 1) + '…' : query}” as new ID`}
      title="Define new publication with this ID"
      onClick={() => launchPublicationEditor(query)}
    />
  );
}

function launchPublicationEditor(forPublicationWithId: string) {
  openWindow('publication-editor', { pubId: forPublicationWithId });
}

const NewAnnexSelector = Select.ofType<AnnexablePublication>();