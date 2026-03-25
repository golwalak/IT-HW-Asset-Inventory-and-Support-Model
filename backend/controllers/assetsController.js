const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { sendEmail, MAIL_PROVIDER } = require('../services/emailService');

// ─── helpers ────────────────────────────────────────────────────────────────

const SUPPORT_TIERS = {
  Tier1: { label: '7x24 OEM (Current)',          savePct: 0    },
  Tier2: { label: 'NBD Tier 2',                   savePct: 0.07 },
  Tier3: { label: 'No Extended Support (Tier 3)', savePct: 1.00 },
  Tier4: { label: '7x24 3rd Party (Tier 4)',      savePct: 0.80 },
};

function calcCostAvoidance(oemCost, tier) {
  const savePct = SUPPORT_TIERS[tier]?.savePct ?? 0;
  return Math.round(parseFloat(oemCost || 0) * savePct);
}

function assetRow(row) {
  if (!row) return null;
  return {
    ...row,
    notificationSent:  Boolean(row.notificationSent),
    ownerAcknowledged: Boolean(row.ownerAcknowledged),
    costAvoidance:     calcCostAvoidance(row.oemCostAnnual, row.supportTier),
    tierLabel:         SUPPORT_TIERS[row.supportTier]?.label || row.supportTier,
    savePct:           (SUPPORT_TIERS[row.supportTier]?.savePct ?? 0) * 100,
  };
}

const getAllAssets = (req, res) => {
  const { owner, application, type, status, supportTier, search } = req.query;
  const limit  = Math.min(parseInt(req.query.limit  || 500), 2000);
  const offset = parseInt(req.query.offset || 0);

  let sql    = 'SELECT * FROM assets WHERE 1=1';
  const params = [];

  if (owner)       { sql += ' AND lower(owner) LIKE ?';       params.push('%' + owner.toLowerCase() + '%'); }
  if (application) { sql += ' AND lower(application) LIKE ?'; params.push('%' + application.toLowerCase() + '%'); }
  if (type)        { sql += ' AND lower(type) = ?';           params.push(type.toLowerCase()); }
  if (status)      { sql += ' AND lower(status) LIKE ?';      params.push('%' + status.toLowerCase() + '%'); }
  if (supportTier) { sql += ' AND supportTier = ?';           params.push(supportTier); }
  if (search) {
    sql += ' AND (lower(assetTag) LIKE ? OR lower(name) LIKE ? OR lower(owner) LIKE ? OR lower(application) LIKE ?)';
    const s = '%' + search.toLowerCase() + '%';
    params.push(s, s, s, s);
  }

  const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) AS cnt');
  const total = db.prepare(countSql).get(...params)?.cnt ?? 0;
  sql += ' ORDER BY assetTag LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const rows = db.prepare(sql).all(...params).map(assetRow);
  res.json({ total, limit, offset, data: rows });
};

const getSummaryStats = (_req, res) => {
  const total = db.prepare('SELECT COUNT(*) AS cnt FROM assets').get().cnt;

  const groupBy = (col) =>
    Object.fromEntries(
      db.prepare('SELECT ' + col + ' AS key, COUNT(*) AS cnt FROM assets GROUP BY ' + col).all().map(r => [r.key, r.cnt])
    );

  const tierSavings = db.prepare(
    'SELECT supportTier, COUNT(*) AS cnt, SUM(oemCostAnnual) AS totalOem FROM assets GROUP BY supportTier'
  ).all().map(r => ({
    tier:      r.supportTier,
    label:     SUPPORT_TIERS[r.supportTier]?.label || r.supportTier,
    count:     r.cnt,
    totalOem:  Math.round(r.totalOem || 0),
    costAvoid: calcCostAvoidance(r.totalOem, r.supportTier),
  }));

  const expiringSoon = db.prepare(
    "SELECT COUNT(*) AS cnt FROM assets WHERE warrantyExpiry != '' AND date(warrantyExpiry) BETWEEN date('now') AND date('now', '+6 months')"
  ).get().cnt;

  const notifPending = db.prepare(
    "SELECT COUNT(*) AS cnt FROM assets WHERE warrantyExpiry != '' AND date(warrantyExpiry) BETWEEN date('now') AND date('now', '+6 months') AND notificationSent = 0"
  ).get().cnt;

  res.json({ total, expiringSoon, notifPending, byType: groupBy('type'), byStatus: groupBy('status'), byOwner: groupBy('owner'), byApplication: groupBy('application'), byTier: groupBy('supportTier'), tierSavings });
};

const getExpiringSoon = (req, res) => {
  const months = parseInt(req.query.months || 6);
  const rows = db.prepare(
    "SELECT * FROM assets WHERE warrantyExpiry != '' AND date(warrantyExpiry) BETWEEN date('now') AND date('now', '+" + months + " months') ORDER BY warrantyExpiry ASC"
  ).all().map(assetRow);
  res.json(rows);
};

const getAssetById = (req, res) => {
  const row = db.prepare('SELECT * FROM assets WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ message: 'Asset not found' });
  res.json(assetRow(row));
};

const createAsset = (req, res) => {
  const b = req.body;
  if (!b.assetTag || !b.name || !b.type) {
    return res.status(400).json({ message: 'assetTag, name, and type are required' });
  }
  const tier = SUPPORT_TIERS[b.supportTier] ? b.supportTier : 'Tier1';
  const id = uuidv4();
  const now = new Date().toISOString();
  db.prepare(
    'INSERT INTO assets (id,assetTag,name,type,manufacturer,model,serialNumber,owner,ownerEmail,manager,managerEmail,application,status,recordStatus,location,purchaseDate,warrantyExpiry,warrantyStart,supportGroup,project,poNumber,ageMonths,inTcsScope,supportTier,oemCostAnnual,notes,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
  ).run(id,b.assetTag,b.name,b.type,b.manufacturer||'',b.model||'',b.serialNumber||'',b.owner||'',b.ownerEmail||'',b.manager||'',b.managerEmail||'',b.application||'',b.status||'Active',b.recordStatus||'',b.location||'',b.purchaseDate||'',b.warrantyExpiry||'',b.warrantyStart||'',b.supportGroup||'',b.project||'',b.poNumber||'',parseInt(b.ageMonths||0),b.inTcsScope||'',tier,parseFloat(b.oemCostAnnual||0),b.notes||'',now,now);
  res.status(201).json(assetRow(db.prepare('SELECT * FROM assets WHERE id = ?').get(id)));
};

const updateAsset = (req, res) => {
  const existing = db.prepare('SELECT * FROM assets WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Asset not found' });
  const allowed = ['assetTag','name','type','manufacturer','model','serialNumber','owner','ownerEmail','manager','managerEmail','application','status','recordStatus','location','purchaseDate','warrantyExpiry','warrantyStart','supportGroup','project','poNumber','ageMonths','inTcsScope','supportTier','oemCostAnnual','notes','ownerAcknowledged','acknowledgedDate'];
  const updates = {};
  for (const key of allowed) { if (req.body[key] !== undefined) updates[key] = req.body[key]; }
  updates.updatedAt = new Date().toISOString();
  const setClauses = Object.keys(updates).map(k => k + ' = ?').join(', ');
  db.prepare('UPDATE assets SET ' + setClauses + ' WHERE id = ?').run(...Object.values(updates), req.params.id);
  res.json(assetRow(db.prepare('SELECT * FROM assets WHERE id = ?').get(req.params.id)));
};

const updateSupportTier = (req, res) => {
  const { supportTier } = req.body;
  if (!SUPPORT_TIERS[supportTier]) {
    return res.status(400).json({ message: 'Invalid tier. Choose: ' + Object.keys(SUPPORT_TIERS).join(', ') });
  }
  const existing = db.prepare('SELECT * FROM assets WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Asset not found' });
  const now = new Date().toISOString();
  db.prepare('UPDATE assets SET supportTier = ?, ownerAcknowledged = 1, acknowledgedDate = ?, updatedAt = ? WHERE id = ?').run(supportTier, now, now, req.params.id);
  res.json(assetRow(db.prepare('SELECT * FROM assets WHERE id = ?').get(req.params.id)));
};

const reassignOwner = (req, res) => {
  const { owner, ownerEmail, manager, managerEmail } = req.body;
  if (!owner) return res.status(400).json({ message: 'owner is required' });
  const existing = db.prepare('SELECT * FROM assets WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Asset not found' });
  const now = new Date().toISOString();
  db.prepare('UPDATE assets SET owner = ?, ownerEmail = ?, manager = ?, managerEmail = ?, updatedAt = ? WHERE id = ?').run(owner, ownerEmail||'', manager||'', managerEmail||'', now, req.params.id);
  res.json(assetRow(db.prepare('SELECT * FROM assets WHERE id = ?').get(req.params.id)));
};

const deleteAsset = (req, res) => {
  const existing = db.prepare('SELECT * FROM assets WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Asset not found' });
  db.prepare('DELETE FROM assets WHERE id = ?').run(req.params.id);
  res.json({ message: 'Asset deleted', asset: assetRow(existing) });
};

const PORTAL_URL = process.env.PORTAL_URL || 'http://localhost:3000';

function buildEmailBody(asset, months) {
  return 'Dear ' + asset.owner + ',\n\nYour IT hardware asset listed below has a support/warranty expiry within the next ' + months + ' months.\nPlease log in to the IT Asset Portal and confirm or update the support model.\n\n  Asset:           ' + asset.name + '\n  Asset Tag:       ' + asset.assetTag + '\n  Location:        ' + asset.location + '\n  Warranty Expiry: ' + asset.warrantyExpiry + '\n  Current Tier:    ' + asset.supportTier + '\n\n  Support Options:\n  Tier 1 - 7x24 OEM (Current)           No savings\n  Tier 2 - Next Business Day            ~7% savings\n  Tier 3 - No Extended Support         ~100% savings\n  Tier 4 - 7x24 3rd Party             ~80% savings\n\nAction required: ' + PORTAL_URL + '/assets/' + asset.id + '\n\nTo reassign ownership use the portal link above.\nThis note is CC\'d to your manager (' + (asset.manager || 'on file') + ').\n\nIT Enterprise Technology Services\n';
}

const sendNotifications = async (req, res) => {
  const months = parseInt(req.query.months || 6);
  const due = db.prepare(
    "SELECT * FROM assets WHERE warrantyExpiry != '' AND date(warrantyExpiry) BETWEEN date('now') AND date('now', '+" + months + " months') AND notificationSent = 0"
  ).all();
  const sent = [];
  const failed = [];
  const now = new Date().toISOString();
  for (const asset of due) {
    const notifId = uuidv4();
    const toEmail = asset.ownerEmail || (asset.owner ? asset.owner.replace(/\s+/g, '.') + '@company.com' : '');
    const ccEmail = asset.managerEmail || (asset.manager ? asset.manager.replace(/\s+/g, '.') + '@company.com' : '');
    const subject = '[Action Required] Support Decision Due — ' + asset.name + ' (' + asset.assetTag + ')';
    const body    = buildEmailBody(asset, months);

    try {
      const emailResult = await sendEmail({ to: toEmail, cc: ccEmail, subject, text: body });
      db.prepare('INSERT INTO notifications (id,assetId,assetTag,assetName,toEmail,ccEmail,subject,body,sentAt,status) VALUES (?,?,?,?,?,?,?,?,?,?)').run(notifId, asset.id, asset.assetTag, asset.name, toEmail, ccEmail, subject, body, now, 'sent');
      db.prepare('UPDATE assets SET notificationSent = 1, notificationDate = ?, updatedAt = ? WHERE id = ?').run(now, now, asset.id);
      sent.push({ assetId: asset.id, assetTag: asset.assetTag, to: toEmail, cc: ccEmail, provider: emailResult.provider || MAIL_PROVIDER });
    } catch (error) {
      db.prepare('INSERT INTO notifications (id,assetId,assetTag,assetName,toEmail,ccEmail,subject,body,sentAt,status) VALUES (?,?,?,?,?,?,?,?,?,?)').run(notifId, asset.id, asset.assetTag, asset.name, toEmail, ccEmail, subject, body, now, 'failed');
      failed.push({ assetId: asset.id, assetTag: asset.assetTag, to: toEmail, cc: ccEmail, error: error.message });
    }
  }
  res.json({ provider: MAIL_PROVIDER, sent: sent.length, failed: failed.length, notifications: sent, failures: failed });
};

const getNotifications = (_req, res) => {
  const rows = db.prepare('SELECT * FROM notifications ORDER BY sentAt DESC LIMIT 200').all();
  res.json(rows);
};

module.exports = { getAllAssets, getSummaryStats, getExpiringSoon, getAssetById, createAsset, updateAsset, updateSupportTier, reassignOwner, deleteAsset, sendNotifications, getNotifications };
