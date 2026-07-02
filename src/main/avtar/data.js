const quickReactions = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const avatars = [
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Mimi',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Jasper',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Luna',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Zoe',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Charlie',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Sophia',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Oliver',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Emma',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Max',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Ava',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Leo',
  'https://api.dicebear.com/6.x/avataaars/svg?seed=Mia',
];

export { avatars };

export default function formatTimestamp(timestamp) {
  const now = Date.now();
  const messageTime = new Date(timestamp).getTime();
  const diff = now - messageTime;
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`
  return `${Math.floor(diff / 86400000)} days ago`
}