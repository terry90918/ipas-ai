import { test } from 'node:test';
import assert from 'node:assert/strict';
import { siteIdentity } from '../lib/site-identity.ts';

const owner = { email: 'owner@example.com', userId: 'private-owner-id' };
test('private Site owner remains signed in when dispatch supplies email without a user ID', () => {
 assert.equal(siteIdentity(new Headers({'oai-authenticated-user-email': owner.email}), owner)?.userId, owner.userId);
});
test('private owner compatibility does not authenticate anonymous or other visitors', () => {
 assert.equal(siteIdentity(new Headers(), owner), null);
 assert.equal(siteIdentity(new Headers({'oai-authenticated-user-email':'other@example.com'}), owner), null);
 assert.equal(siteIdentity(new Headers({'oai-authenticated-user-email':owner.email})), null);
});
test('stable Site user ID takes precedence and requires authenticated email', () => {
 assert.equal(siteIdentity(new Headers({'oai-authenticated-user-email':owner.email,'oai-authenticated-user-id':'site-user-id'}), owner)?.userId, 'site-user-id');
 assert.equal(siteIdentity(new Headers({'oai-authenticated-user-id':'site-user-id'}), owner), null);
});
