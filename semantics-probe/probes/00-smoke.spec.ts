import { test } from '../lib/probe';

test.use({ viewport: { width: 390, height: 844 } });

test('smoke: arranque, login y layout ON vs OFF', async ({ app, page }) => {
    await app.boot();
    const dLogin = await app.compareWithOn('smoke-login');
    await app.login();
    const dHome = await app.compareWithOn('smoke-home');
    await app.go('/market', 'market_list_view');
    const dMarket = await app.compareWithOn('smoke-market');
    const off = await app.offStillOff('smoke');
    const pm = await app.postMortem();
    const ids = (await app.ids()).length;
    app.rec('smoke', { dLogin, dHome, dMarket, off, pm, ids, url: app.path() });
    console.log({ dLogin, dHome, dMarket, off, pm, ids, url: app.path(), chromium: page.context().browser()?.version() });
});
