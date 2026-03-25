export const createMessage = ({
  username,
  message,
  type,
  to = null,
  room = "general"
}) => {
  return {
    id: Date.now(),
    username,
    message,
    type,
    to,
    room,
    time: new Date().toISOString()
  };
};
// MESSAGE FORMAT
// {
//   id: number,
//   username: string,
//   message: string,
//   type: "group" | "broadcast" | "private",
//   to: string | null,
//   room: string,
//   time: string
// }