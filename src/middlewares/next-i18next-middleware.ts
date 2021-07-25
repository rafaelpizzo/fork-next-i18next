import i18nextMiddleware from 'i18next-http-middleware/cjs';

export default function (nexti18next) {
    const { i18n } = nexti18next;

    const middleware = [];

    middleware.push(i18nextMiddleware.handle(i18n));

    return middleware;
}
