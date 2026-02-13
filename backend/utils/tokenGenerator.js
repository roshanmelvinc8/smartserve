const getNextToken = (db, service) => {
  const prefixes = {
    Bonafide: 'B',
    Transfer: 'T',
    Fee: 'F'
  };

  if (!prefixes[service]) {
    throw new Error('invalid service');
  }

  const prefix = prefixes[service];

  // Find recent tokens for this service
  const tokens = db.findTokens({ service });
  let maxNum = 0;

  tokens.forEach(t => {
    const tn = t.token_number || '';
    try {
      const num = parseInt(tn.split('-')[1]);
      if (num > maxNum) {
        maxNum = num;
      }
    } catch (e) {
      // ignore parsing errors
    }
  });

  const nextNum = maxNum + 1;
  return `${prefix}-${nextNum}`;
};

module.exports = { getNextToken };
