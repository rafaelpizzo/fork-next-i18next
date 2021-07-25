import { withTranslation, useTranslation, Trans } from 'react-i18next';
import hoistNonReactStatics from 'hoist-non-react-statics';

import { createConfig } from './config/create-config';
import createI18NextClient from './create-client';

import { appWithTranslation } from './hocs';
import { consoleMessage } from './utils';

import {
    AppWithTranslation,
    Config,
    InitConfig,
    Trans as TransType,
    I18n,
    InitPromise,
    UseTranslation,
    WithTranslationHocType,
} from '../types';

export { I18nContext, withTranslation } from 'react-i18next';

export default class NextI18Next {
    readonly Trans: TransType;
    readonly i18n: I18n;
    readonly initPromise: InitPromise;
    readonly config: Config;
    readonly useTranslation: UseTranslation;
    readonly withTranslation: WithTranslationHocType;
    readonly appWithTranslation: AppWithTranslation;

    readonly consoleMessage: () => void;
    readonly withNamespaces: () => void;

    constructor(userConfig: InitConfig) {
        this.config = createConfig(userConfig);
        this.consoleMessage = consoleMessage.bind(this);

        const { i18n, initPromise } = createI18NextClient(this.config);
        this.i18n = i18n;
        this.initPromise = initPromise;

        this.appWithTranslation = appWithTranslation.bind(this);
        this.withTranslation = (namespace, options) => (Component) =>
            hoistNonReactStatics(
                withTranslation(namespace, options)(Component),
                Component
            );

        /* Directly export `react-i18next` methods */
        this.Trans = Trans;
        this.useTranslation = useTranslation;
    }
}
