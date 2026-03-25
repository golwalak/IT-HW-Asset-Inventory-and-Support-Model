const { ClientSecretCredential } = require('@azure/identity');
const { Client } = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');
const db = require('../db/database');

const DIRECTORY_PROVIDER = (process.env.DIRECTORY_PROVIDER || 'mock').toLowerCase();

function createGraphClient() {
  const tenantId = process.env.GRAPH_TENANT_ID;
  const clientId = process.env.GRAPH_CLIENT_ID;
  const clientSecret = process.env.GRAPH_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error('Graph is not configured. Set GRAPH_TENANT_ID, GRAPH_CLIENT_ID, GRAPH_CLIENT_SECRET.');
  }

  const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

  return Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => {
        const token = await credential.getToken('https://graph.microsoft.com/.default');
        return token.token;
      },
    },
  });
}

function mapGraphUser(u) {
  return {
    id: u.id,
    displayName: u.displayName || '',
    mail: u.mail || '',
    userPrincipalName: u.userPrincipalName || '',
    department: u.department || '',
    jobTitle: u.jobTitle || '',
  };
}

async function searchUsersGraph(query, limit = 10) {
  const client = createGraphClient();

  const q = (query || '').replace(/"/g, '').trim();
  if (!q) return [];

  const resp = await client
    .api('/users')
    .header('ConsistencyLevel', 'eventual')
    .query({
      $count: 'true',
      $top: String(Math.min(Number(limit) || 10, 25)),
      $search: `"displayName:${q}" OR "mail:${q}" OR "userPrincipalName:${q}"`,
      $select: 'id,displayName,mail,userPrincipalName,department,jobTitle',
    })
    .get();

  return (resp.value || []).map(mapGraphUser);
}

async function getManagerGraph(userIdOrUpn) {
  const client = createGraphClient();
  const mgr = await client.api(`/users/${encodeURIComponent(userIdOrUpn)}/manager`).query({ $select: 'id,displayName,mail,userPrincipalName,department,jobTitle' }).get();
  return mapGraphUser(mgr);
}

function searchUsersMock(query, limit = 10) {
  const q = `%${String(query || '').toLowerCase()}%`;
  if (q === '%%') return [];

  const rows = db.prepare(
    `SELECT DISTINCT owner AS displayName, ownerEmail AS mail, manager AS managerName, managerEmail AS managerEmail
     FROM assets
     WHERE lower(owner) LIKE ? OR lower(ownerEmail) LIKE ?
     ORDER BY owner
     LIMIT ?`
  ).all(q, q, Math.min(Number(limit) || 10, 25));

  return rows.map((r, idx) => ({
    id: `mock-${idx}-${r.displayName}`,
    displayName: r.displayName || '',
    mail: r.mail || '',
    userPrincipalName: r.mail || '',
    department: '',
    jobTitle: '',
    managerName: r.managerName || '',
    managerEmail: r.managerEmail || '',
  }));
}

async function getManagerMock(userOrEmail) {
  const rows = db.prepare(
    `SELECT manager AS displayName, managerEmail AS mail
     FROM assets
     WHERE owner = ? OR ownerEmail = ?
     AND manager != ''
     LIMIT 1`
  ).all(userOrEmail, userOrEmail);

  const row = rows[0];
  if (!row) return null;

  return {
    id: `mock-manager-${row.displayName}`,
    displayName: row.displayName || '',
    mail: row.mail || '',
    userPrincipalName: row.mail || '',
    department: '',
    jobTitle: '',
  };
}

async function searchUsers(query, limit = 10) {
  if (DIRECTORY_PROVIDER === 'graph') {
    return searchUsersGraph(query, limit);
  }
  return searchUsersMock(query, limit);
}

async function getManager(userIdOrUpn) {
  if (DIRECTORY_PROVIDER === 'graph') {
    return getManagerGraph(userIdOrUpn);
  }
  return getManagerMock(userIdOrUpn);
}

module.exports = {
  searchUsers,
  getManager,
  DIRECTORY_PROVIDER,
};
