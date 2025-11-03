import { getDatabase } from "../database/db.js";
import { EmbedBuilder } from "discord.js";

const CYRILLIC_BONUS = 2;
const BASE_XP = 1;

const STREAK_MILESTONES = {
  10: 32,
  30: 64,
  180: 500,
  365: 1000,
};

export function getXPForLevel(level) {
  return Math.floor(50 * Math.pow(level, 1.5));
}

export function getLevelFromXP(xp) {
  let level = 0;
  let totalXPNeeded = 0;

  while (totalXPNeeded <= xp) {
    level++;
    totalXPNeeded += getXPForLevel(level);
  }

  return level - 1;
}

export function getXPProgress(xp) {
  const currentLevel = getLevelFromXP(xp);
  let xpForCurrentLevel = 0;

  for (let i = 1; i <= currentLevel; i++) {
    xpForCurrentLevel += getXPForLevel(i);
  }

  const xpIntoCurrentLevel = xp - xpForCurrentLevel;
  const xpNeededForNextLevel = getXPForLevel(currentLevel + 1);

  return {
    currentLevel,
    xpIntoCurrentLevel,
    xpNeededForNextLevel,
  };
}

function hasCyrillic(text) {
  return /[\u0400-\u04FF]/.test(text);
}

function getStreakBonus(streak) {
  if (streak === 1) return 2;
  if (streak === 2) return 3;
  if (streak === 3) return 4;
  if (streak >= 4) return 5;

  return 0;
}

function getMilestoneBonus(streak) {
  if (STREAK_MILESTONES[streak]) {
    return STREAK_MILESTONES[streak];
  }
  return 0;
}

export async function addXP(userId, guildId, messageContent) {
  const db = await getDatabase();
  const today = new Date()
    .toLocaleString("en-CA", {
      timeZone: "Europe/Sofia",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .split(",")[0];

  let user = await db.get(
    "SELECT * FROM user_xp WHERE user_id = ? AND guild_id = ?",
    [userId, guildId]
  );

  if (!user) {
    await db.run(
      "INSERT INTO user_xp (user_id, guild_id, leva, messages, level, last_message_date, streak) VALUES (?, ?, 0, 0, 0, NULL, 0)",
      [userId, guildId]
    );
    user = await db.get(
      "SELECT * FROM user_xp WHERE user_id = ? AND guild_id = ?",
      [userId, guildId]
    );
  }

  let xpGained = BASE_XP;

  if (hasCyrillic(messageContent)) {
    xpGained *= CYRILLIC_BONUS;
  }
  let isStreakMessage = false;
  let streakBonus = 0;
  let milestoneBonus = 0;
  let newStreak = user.streak;

  if (user.last_message_date) {
    const lastDate = new Date(user.last_message_date);
    const todayDate = new Date(today);
    const diffTime = todayDate - lastDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      newStreak = user.streak + 1;
      isStreakMessage = true;
      streakBonus = getStreakBonus(newStreak);
      milestoneBonus = getMilestoneBonus(newStreak);
    } else if (diffDays > 1) {
      newStreak = 1;
      isStreakMessage = true;
      streakBonus = 0;
    } else if (diffDays === 0) {
      newStreak = user.streak;
    }
  } else {
    newStreak = 1;
  }

  const totalXP = xpGained + streakBonus + milestoneBonus;
  const newLeva = user.leva + totalXP;
  const newMessages = user.messages + 1;
  const newLevel = getLevelFromXP(newLeva);

  await db.run(
    `UPDATE user_xp 
     SET leva = ?, messages = ?, level = ?, last_message_date = ?, streak = ?
     WHERE user_id = ? AND guild_id = ?`,
    [newLeva, newMessages, newLevel, today, newStreak, userId, guildId]
  );

  const leveledUp = newLevel > user.level;

  return {
    xpGained: totalXP,
    streakBonus,
    milestoneBonus,
    newStreak,
    isStreakMessage,
    leveledUp,
    newLevel,
    oldLevel: user.level,
    totalLeva: newLeva,
    hasCyrillic: hasCyrillic(messageContent),
  };
}

export async function getUserXP(userId, guildId) {
  const db = await getDatabase();
  const user = await db.get(
    "SELECT * FROM user_xp WHERE user_id = ? AND guild_id = ?",
    [userId, guildId]
  );

  if (!user) {
    return null;
  }

  const progress = getXPProgress(user.leva);

  return {
    ...user,
    ...progress,
  };
}

export async function sendStreakNotification(
  message,
  streak,
  levaGained,
  userAvatarURL
) {
  const embed = new EmbedBuilder()
    .setColor("#00966e")
    .setAuthor({
      name: `${streak} ден стрийк! 🔥`,
      iconURL: userAvatarURL,
    })
    .setDescription(`+${levaGained} лева`);

  const notificationMessage = await message.channel.send({
    content: `-# ${streak} ден стрийк +${levaGained} лева`,
    embeds: [embed],
  });

  setTimeout(() => {
    notificationMessage.delete().catch(() => {});
  }, 10000);
}
