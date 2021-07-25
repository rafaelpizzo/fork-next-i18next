import { defaultConfig } from './default-config';
import { isServer, isCIMode } from '../utils';

const deepMergeObjects = ['backend', 'detection'];
const dedupe = (names: string[]) =>
    names.filter((v, i) => names.indexOf(v) === i);

export const createConfig = (userConfig) => {
    // Initial merge of default and user-provided config
    const combinedConfig = {
        ...defaultConfig,
        ...userConfig,
    };

    // Sensible defaults to prevent user duplication
    combinedConfig.allLanguages = dedupe(
        combinedConfig.otherLanguages.concat([combinedConfig.defaultLanguage])
    );
    // https://github.com/i18next/i18next/blob/master/CHANGELOG.md#1950
    combinedConfig.supportedLngs = combinedConfig.allLanguages;
    // temporal backwards compatibility WHITELIST REMOVAL
    combinedConfig.whitelist = combinedConfig.allLanguages;
    // end temporal backwards compatibility WHITELIST REMOVAL

    const {
        allLanguages,
        defaultLanguage,
        localeExtension,
        localePath,
        localeStructure,
    } = combinedConfig;

    /**
     * Skips translation file resolution while in cimode
     * https://github.com/isaachinman/next-i18next/pull/851#discussion_r503113620
     */
    if (isCIMode(defaultLanguage)) {
        return combinedConfig;
    }

    if (isServer()) {
        combinedConfig.preload = allLanguages;

        const hasCustomBackend =
            userConfig.use && userConfig.use.find((b) => b.type === 'backend');
        if (!hasCustomBackend) {
            const fs = eval("require('fs')");
            const path = require('path');
            let serverLocalePath = localePath;

            if (typeof combinedConfig.defaultNS === 'string') {
                const defaultFile = `/${defaultLanguage}/${combinedConfig.defaultNS}.${localeExtension}`;
                const defaultNSPath = path.join(localePath, defaultFile);
                const defaultNSExists = fs.existsSync(defaultNSPath);

                if (!defaultNSExists) {
                    throw new Error(
                        `Default namespace not found at ${defaultNSPath}`
                    );
                }
            }

            // Set server side backend
            combinedConfig.backend = {
                loadPath: path.resolve(
                    process.cwd(),
                    `${serverLocalePath}/${localeStructure}.${localeExtension}`
                ),
                addPath: path.resolve(
                    process.cwd(),
                    `${serverLocalePath}/${localeStructure}.missing.${localeExtension}`
                ),
            };

            // Set server side preload (namespaces)
            if (!combinedConfig.ns) {
                const getAllNamespaces = (p) =>
                    fs
                        .readdirSync(p)
                        .map((file) => file.replace(`.${localeExtension}`, ''));
                combinedConfig.ns = getAllNamespaces(
                    path.resolve(
                        process.cwd(),
                        `${serverLocalePath}/${defaultLanguage}`
                    )
                );
            }
        }
    } else {
        let clientLocalePath = localePath;

        // Remove public prefix from client site config
        if (localePath.startsWith('/public/')) {
            clientLocalePath = localePath.replace(/^\/public/, '');
        }

        // Set client side backend
        combinedConfig.backend = {
            loadPath: `${clientLocalePath}/${localeStructure}.${localeExtension}`,
            addPath: `${clientLocalePath}/${localeStructure}.missing.${localeExtension}`,
        };

        combinedConfig.ns = [combinedConfig.defaultNS];
    }

    // Set fallback language to defaultLanguage in production
    if (!userConfig.fallbackLng) {
        combinedConfig.fallbackLng =
            process.env.NODE_ENV === 'production'
                ? combinedConfig.defaultLanguage
                : false;
    }

    // Deep merge with overwrite - goes last
    deepMergeObjects.forEach((obj) => {
        if (userConfig[obj]) {
            combinedConfig[obj] = {
                ...defaultConfig[obj],
                ...userConfig[obj],
            };
        }
    });

    return combinedConfig;
};
