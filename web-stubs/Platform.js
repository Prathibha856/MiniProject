// Stub for React Native Platform module on web
export default {
  OS: 'web',
  Version: 0,
  select: (obj) => obj.web || obj.default,
  isTV: false,
  isTesting: false,
};
