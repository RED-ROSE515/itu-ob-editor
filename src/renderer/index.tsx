import * as ReactDOM from 'react-dom';
import React, { useState } from 'react';
import { NonIdealState } from '@blueprintjs/core';

import { LangConfigContext } from './app/localizer';

import {
  HomeScreen,
  IssueEditor,
  IssueScheduler,
  DataSynchronizer,
} from './app';

import '!style-loader!css-loader!@blueprintjs/datetime/lib/css/blueprint-datetime.css';
import '!style-loader!css-loader!@blueprintjs/core/lib/css/blueprint.css';
import '!style-loader!css-loader!./normalize.css';
import * as styles from './styles.scss';


// Electron Webpack skeleton guarantees that #app exists in index.html
const appRoot = document.getElementById('app') as HTMLElement;

appRoot.classList.add(styles.app);

const searchParams = new URLSearchParams(window.location.search);

const App: React.FC<{}> = function () {
  let component: JSX.Element;

  if (searchParams.get('c') === 'home') { 
    component = <HomeScreen />;

  } else if (searchParams.get('c') === 'issueScheduler') { 
    component = <IssueScheduler />;

  } else if (searchParams.get('c') === 'issueEditor') {
    component = <IssueEditor issueId={searchParams.get('issueId') || ''} />;

  } else if (searchParams.get('c') === 'dataSynchronizer') {
    component = <DataSynchronizer />;

  } else {
    component = <NonIdealState
      icon="error"
      title="Unknown component requested" />;
  }

  const [langConfig, setLangConfig] = useState({
    available: { en: 'English', zh: 'Chinese', ru: 'Russian' },
    default: 'en',
    selected: 'en',
    select: (langId: string) => {
      setLangConfig(langConfig => Object.assign({}, langConfig, { selected: langId }));
    },
  });

  return (
    <LangConfigContext.Provider value={langConfig}>
      {component}
    </LangConfigContext.Provider>
  );
};


ReactDOM.render(<App />, appRoot);


// } else if (searchParams.get('c') === 'translator') {
//   ReactDOM.render(
//     <Translator issueId={searchParams.get('issueId') || ''} />,
//     app);
