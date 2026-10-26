interface DiscordAlertField {
  name: string;
  value: string;
  inline?: boolean;
}

interface DiscordAlert {
  title: string;
  description: string;
  color: number;
  fields?: DiscordAlertField[];
}

export const DiscordAlertColor = {
  success: 0x57f287,
  info: 0x5865f2,
  warning: 0xfee75c,
  error: 0xed4245,
} as const;

/**
 * Posts one embed to HOT_NEWS_DISCORD_WEBHOOK_URL. A no-op when that env
 * var is unset (local/dev — the cron job it's called from must keep
 * working without it), and this never throws: a failed Discord delivery
 * must never fail or interrupt the job reporting on. Only ever logs a
 * generic failure reason, never the webhook URL itself.
 */
export async function sendDiscordAlert(alert: DiscordAlert): Promise<void> {
  const webhookUrl = process.env.HOT_NEWS_DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [
          {
            title: alert.title,
            description: alert.description,
            color: alert.color,
            fields: alert.fields,
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });
    if (!res.ok) {
      console.error(`Discord alert delivery failed with status ${res.status}`);
    }
  } catch (error) {
    console.error(
      "Discord alert delivery failed:",
      error instanceof Error ? error.message : error,
    );
  }
}
