/**
 * Asset data model / schema
 * Represents a single row from the IT HW inventory CSV.
 */
class Asset {
  constructor(data = {}) {
    // --- Identity ---
    /** @type {string} Human-readable asset name */
    this.assetName = data['Asset Name'] || '';
    /** @type {string} Unique asset number (used as ID) */
    this.assetNumber = data['Asset Number'] || '';
    this.serialNumber = data['Serial Number'] || '';
    this.tag = data['Tag'] || '';

    // --- Hardware details ---
    this.materialName = data['Material Name'] || '';
    /** @type {string} Hardware type (e.g., Server, Switch, Storage) */
    this.type = data['Type'] || '';
    this.manufacturer = data['Manufacturer'] || '';
    this.model = data['Model'] || '';
    this.materialSubtypeName = data['Material Subtype Name'] || '';
    this.materialCategoryName = data['Material Category Name'] || '';
    this.etsStdHwCategory = data['ETS Std HW Category'] || '';

    // --- Status & Location ---
    this.recordStatus = data['Record Status'] || '';
    this.cabinetName = data['Cabinet Name'] || '';
    this.cabinetUNumber = data['Cabinet U Number'] || '';
    /** @type {string} Physical location / site (e.g., Alhambra, Irvine) */
    this.location = data['Location'] || '';

    // --- Dates ---
    this.creationDate = data['Creation Date'] || '';
    this.operationalDate = data['Operational Date'] || '';
    this.decommissionDate = data['Decommission Date'] || '';

    // --- Support & Scope ---
    this.inTcsScope = data['In TCS Scope'] || '';
    this.supportGroupName = data['Support Group Name'] || '';
    this.ruCategory = data['RU Category'] || '';
    this.ruGroup = data['RU Group'] || '';
    this.ups = data['UPS'] || '';

    // --- Project / Procurement ---
    this.project = data['Project'] || '';
    this.poNumber = data['PO Number'] || '';
    this.warrantyStartDate = data['Warranty Start Date'] || '';
    /** @type {string} Warranty end date — used for warranty-expiry reports */
    this.warrantyEndDate = data['Warranty End Date'] || '';

    // --- Non-standard support ---
    this.etsNonStdSupport = data['ETS Non std support'] || '';
    this.nonEtsStdHwSupportDetails = data['Non ETS Std HW Support details'] || '';
    this.ringFenced = data['Ring Fenced'] || '';

    // --- Computed / Mock fields ---
    /** @type {number|string} Age in months */
    this.ageMonths = data['age (mo)'] || '';
    /** @type {string} AUTHORITATIVE — application this asset belongs to */
    this.application = data['application (mock)'] || '';
    /** @type {string} AUTHORITATIVE — business owner of this asset */
    this.owner = data['Owner (mock)'] || '';
    /** @type {string} prod or nonprod */
    this.status = data['status (prod or nonprod) (mock)'] || '';

    // --- Cost / Support tier (manually populated) ---
    /** @type {number|string} 7x24 OEM annual cost in USD */
    this.oemCostAnnual = data['7x24 OEM $ / 365 days (mock)'] || '';
    this.tier1_7x24 = data['7x24 Tier1 (yes/no?)'] || '';
    this.tier2_nbdSave7pct = data['NBD Tier 2, 7% save (yes / no)'] || '';
    this.tier3_noneSave100pct = data['None Tier 3, 100% save (yes/on)'] || '';
    this.tier4_3rdPartySave80pct = data['7x24 3rd Party Tier 4, 80% save (yes/no)'] || '';
    /** @type {number|string} Calculated cost avoidance if not on Tier 1 */
    this.costAvoidance = data['cost avoidance ($) if not Tier 1'] || '';
  }

  /**
   * Derive the active support tier label from boolean fields.
   * @returns {'Tier1'|'Tier2'|'Tier3'|'Tier4'|'Unknown'}
   */
  getSupportTier() {
    const yes = (v) => String(v).toLowerCase() === 'yes';
    if (yes(this.tier1_7x24)) return 'Tier1';
    if (yes(this.tier2_nbdSave7pct)) return 'Tier2';
    if (yes(this.tier3_noneSave100pct)) return 'Tier3';
    if (yes(this.tier4_3rdPartySave80pct)) return 'Tier4';
    return 'Unknown';
  }
}

module.exports = Asset;
