const userData = {
  username: 'dev_user_2026',
  password: 's3cureP@ssw0rd!123',
  randomToken: 'a1b2c3d4e5f6g7h8i9j0',
  accessLevel: 'administrator',
  lastLogin: '2026-09-07T10:00:00Z',
};

const generateRandomValue = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 16 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
};

const randomValues = {
  sessionKey: generateRandomValue(),
  requestId: generateRandomValue(),
};

console.log(`User ${userData.username} loaded with session key: ${randomValues.sessionKey}`);

export { userData, randomValues };
