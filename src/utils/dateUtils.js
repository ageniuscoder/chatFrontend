// utils/time.js

// Safely parse timestamps from DB or API
const safeParseDate = (ts) => {
  if (!ts) return null;

  // Normalize MySQL-style format: "YYYY-MM-DD HH:mm:ss"
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(ts)) {
    ts = ts.replace(" ", "T") + "Z";
  }

  const d = new Date(ts);
  return isNaN(d.getTime()) ? null : d;
};

export const formatMessageTime = (timestamp) => {
  const date = safeParseDate(timestamp);
  if (!date) return "";

  const now = new Date();
  const diff = now - date;

  // Less than 1 minute
  if (diff < 60000) {
    return "now";
  }

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m`;
  }

  // Same day
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  // This week
  if (diff < 604800000) {
    return date.toLocaleDateString([], { weekday: "short" });
  }

  // Older
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

export const formatLastSeen = (timestamp) => {
  const date = safeParseDate(timestamp);
  if (!date) return "offline";

  const now = new Date();
  const diff = now - date;

  if (diff < 60000) {
    return "online";
  }

  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `last seen ${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }

  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `last seen ${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  const days = Math.floor(diff / 86400000);
  return `last seen ${days} day${days > 1 ? "s" : ""} ago`;
};

export const isToday = (timestamp) => {
  const date = safeParseDate(timestamp);
  if (!date) return false;

  const today = new Date();
  return date.toDateString() === today.toDateString();
};
