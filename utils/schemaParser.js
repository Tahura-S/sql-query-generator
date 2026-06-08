const parseSchema = (schemaText) => {
  const tables = [];
  const tableRegex = /CREATE\s+TABLE\s+(\w+)\s*\((.*?)\)(?:;|(?=CREATE))/gis;

  let match;
  while ((match = tableRegex.exec(schemaText)) !== null) {
    const tableName = match[1];
    const columnsDef = match[2];

    const columns = columnsDef
      .split(',')
      .map(col => col.trim())
      .filter(col => col && !col.toUpperCase().startsWith('CONSTRAINT'))
      .map(col => {
        const parts = col.split(/\s+/);
        return {
          name: parts[0],
          type: parts.slice(1).join(' ')
        };
      });

    tables.push({
      name: tableName,
      columnCount: columns.length,
      columns: columns,
      hasPrimaryKey: columnsDef.toUpperCase().includes('PRIMARY KEY')
    });
  }

  return {
    isValid: tables.length > 0,
    tables: tables,
    warnings: getWarnings(tables, schemaText)
  };
};

const getWarnings = (tables, schemaText) => {
  const warnings = [];

  if (tables.length === 0) {
    warnings.push("No tables found in schema. Use CREATE TABLE syntax.");
  }

  tables.forEach(table => {
    if (!table.hasPrimaryKey) {
      warnings.push(`Table "${table.name}" has no PRIMARY KEY defined.`);
    }
    if (table.columnCount === 0) {
      warnings.push(`Table "${table.name}" has no columns.`);
    }
  });

  return warnings;
};

module.exports = { parseSchema };
