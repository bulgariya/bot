import { ActivityType } from "discord.js";

const STATUSES = [
  "Listening to Azis",
  "Helping learners",
  "ах морето",
  "отворихме нов басейн",
  "Learning Bulgarian",
];

const ROTATION_INTERVAL = 10 * 60 * 1000; 

let currentStatusIndex = 0;

export function startStatusRotation(client) {
  updateStatus(client);

  setInterval(() => {
    updateStatus(client);
  }, ROTATION_INTERVAL);
}

function updateStatus(client) {
  const status = STATUSES[currentStatusIndex];

  client.user.setPresence({
    activities: [
      {
        name: status,
        type: ActivityType.Custom,
      },
    ],
    status: "online",
  });

  console.log(`Status updated to: ${status}`);

  currentStatusIndex = (currentStatusIndex + 1) % STATUSES.length;
}
