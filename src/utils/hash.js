
export const generateValidationHash = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `val-hash-${timestamp}-${randomStr}`;
};

export default generateValidationHash;