/**
 * @OnlyCurrentDoc
 * PLANNED / NOT_RUN. Optional read-only capture for a NEW synthetic bound project.
 * No Drive, Calendar, external requests, copying, writes, or triggers.
 * Run captureAT28 only in one of the three exact synthetic file titles below.
 * Copy each execution log to a different local stage file; do not overwrite.
 */
function captureAT28() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  const titles = ['SOURCE', 'BACKUP', 'RESTORED'].map(s => 'AT28-MULTI-20261107-' + s);
  if (!book || titles.indexOf(book.getName()) < 0) throw new Error('Synthetic file title guard failed');
  const sheets = book.getSheets();
  if (sheets.length !== 3 || !book.getSheetByName('Inputs') || !book.getSheetByName('Calc') ||
      book.getSheetByName('Inputs').getRange('A2').getValue() !== 'SYN-MULTI-20261107') {
    throw new Error('Synthetic contents guard failed');
  }
  const a1 = r => r.getSheet().getName() + '!' + r.getA1Notation();
  const serial = v => {
    if (v instanceof Date) return {iso: v.toISOString()};
    if (Array.isArray(v)) return v.map(serial);
    if (v && typeof v.getA1Notation === 'function') return {range: a1(v)};
    if (v && typeof v === 'object') return String(v);
    return v;
  };
  const validation = rule => rule ? {
    criteria: String(rule.getCriteriaType()), values: serial(rule.getCriteriaValues()),
    allowInvalid: rule.getAllowInvalid(), helpText: rule.getHelpText()
  } : null;
  const protection = (p, type) => ({
    type: type, range: a1(p.getRange()), description: p.getDescription(),
    warningOnly: p.isWarningOnly(), currentUserCanEdit: p.canEdit(),
    // Do not log names or emails. UI must confirm the actual permitted editor.
    editorCount: p.getEditors().length, domainCanEdit: p.canDomainEdit(),
    unprotectedRanges: type === 'SHEET' ? p.getUnprotectedRanges().map(a1) : []
  });
  const result = {
    schemaVersion: 1, experiment: 'AT28-MULTI-20261107',
    status: 'OBSERVED_SNAPSHOT_ONLY', observedAt: new Date().toISOString(),
    file: {id: book.getId(), title: book.getName(), url: book.getUrl()},
    workbook: {locale: book.getSpreadsheetLocale(), timeZone: book.getSpreadsheetTimeZone(),
      recalculationInterval: String(book.getRecalculationInterval())},
    namedRanges: book.getNamedRanges().map(n => ({name: n.getName(), range: a1(n.getRange())}))
      .sort((a, b) => a.name.localeCompare(b.name)),
    sheets: sheets.map(s => {
      const sample = s.getRange(s.getName() === 'Inputs' ? 'A1:E4' : 'A1:B4');
      return {
        name: s.getName(), sheetId: s.getSheetId(), index1Based: s.getIndex(),
        sampleRange: sample.getA1Notation(), formulas: sample.getFormulas(),
        values: serial(sample.getValues()), displayValues: sample.getDisplayValues(),
        numberFormats: sample.getNumberFormats(), fontWeights: sample.getFontWeights(),
        frozenRows: s.getFrozenRows(), columnBWidthPx: s.getColumnWidth(2), row2HeightPx: s.getRowHeight(2),
        dataValidation: sample.getDataValidations().map(row => row.map(validation)),
        conditionalRules: s.getConditionalFormatRules().map(r => {
          const condition = r.getBooleanCondition();
          return {ranges: r.getRanges().map(a1), boolean: condition ? {
            criteria: String(condition.getCriteriaType()), values: serial(condition.getCriteriaValues()),
            background: condition.getBackground()
          } : null, gradientPresent: r.getGradientCondition() !== null};
        }),
        protections: s.getProtections(SpreadsheetApp.ProtectionType.RANGE).map(p => protection(p, 'RANGE'))
          .concat(s.getProtections(SpreadsheetApp.ProtectionType.SHEET).map(p => protection(p, 'SHEET')))
      };
    }),
    limitations: ['No access-denial test for another user', 'No app pointer switch', 'No Calendar test',
      'Conditional formatting appearance must also be observed in the UI']
  };
  console.log(JSON.stringify(result));
  return result;
}
