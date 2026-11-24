require('dotenv').config();
const jwt = require('jsonwebtoken');

for (const rol of ['ENCARGADO_PESEBRE', 'PASTOR']) {
  const token = jwt.sign({ sub: rol.toLowerCase(), rol }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
  console.log(`\n${rol}:\n${token}`);
}