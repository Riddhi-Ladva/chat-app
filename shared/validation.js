export const validateMessage = (msg) => {
  if (!msg.username || !msg.message) return false;
  if (!msg.type) return false;

  if (msg.type === "private" && !msg.to) return false;

  return true;
};