import i18nextMiddleware from 'i18next-http-middleware/cjs';

import {
    addSubpath,
    lngFromReq,
    redirectWithoutCache,
    subpathFromLng,
    subpathIsPresent,
    subpathIsRequired,
} from '../utils';

export default function (nexti18next) {
    const { i18n } = nexti18next;

    const middleware = [];

    middleware.push(i18nextMiddleware.handle(i18n));

    return middleware;
}
