const functions = require('@google-cloud/functions-framework');
const postgres = require('postgres');

let sql;

function getSql() {
  if (!sql) {
    sql = postgres(process.env.DATABASE_URL, { max: 5 });
  }
  return sql;
}

functions.http('generateDaily', async (req, res) => {
  const sql = getSql();

  try {
    async function getNextGameId(tableName) {
      const result = await sql`
        SELECT COALESCE(MAX(game_id), 0) + 1 as next_game_id FROM ${sql(tableName)}
      `;
      return result[0].next_game_id;
    }

    async function createDailyClassic(date) {
      const existing = await sql`
        SELECT id FROM daily_classic WHERE date = ${date}::date
      `;
      if (existing.length === 0) {
        const nextGameId = await getNextGameId('daily_classic');
        const [brawler] = await sql`
          SELECT id as brawler_id FROM brawlers
          WHERE released = true
          ORDER BY RANDOM() LIMIT 1
        `;
        await sql`
          INSERT INTO daily_classic (game_id, date, brawler_id)
          VALUES (${nextGameId}, ${date}::date, ${brawler.brawler_id})
        `;
        console.log(`Created daily classic for ${date} with game_id ${nextGameId}`);
        return true;
      }
      return false;
    }

    async function createDailyGadget(date) {
      const existing = await sql`
        SELECT id FROM daily_gadget WHERE date = ${date}::date
      `;
      if (existing.length === 0) {
        const nextGameId = await getNextGameId('daily_gadget');
        const [gadget] = await sql`
          SELECT g.id as gadget_id
          FROM gadgets g
          JOIN brawlers b ON g.brawler_id = b.id
          WHERE b.released = true
          ORDER BY RANDOM() LIMIT 1
        `;
        await sql`
          INSERT INTO daily_gadget (game_id, date, gadget_id)
          VALUES (${nextGameId}, ${date}::date, ${gadget.gadget_id})
        `;
        console.log(`Created daily gadget for ${date} with game_id ${nextGameId}`);
        return true;
      }
      return false;
    }

    async function createDailyStarPower(date) {
      const existing = await sql`
        SELECT id FROM daily_star_power WHERE date = ${date}::date
      `;
      if (existing.length === 0) {
        const nextGameId = await getNextGameId('daily_star_power');
        const [starPower] = await sql`
          SELECT sp.id as star_power_id
          FROM star_powers sp
          JOIN brawlers b ON sp.brawler_id = b.id
          WHERE b.released = true
          ORDER BY RANDOM() LIMIT 1
        `;
        await sql`
          INSERT INTO daily_star_power (game_id, date, star_power_id)
          VALUES (${nextGameId}, ${date}::date, ${starPower.star_power_id})
        `;
        console.log(`Created daily star power for ${date} with game_id ${nextGameId}`);
        return true;
      }
      return false;
    }

    async function createDailyHypercharge(date) {
      const existing = await sql`
        SELECT id FROM daily_hypercharge WHERE date = ${date}::date
      `;
      if (existing.length === 0) {
        const nextGameId = await getNextGameId('daily_hypercharge');
        const [hypercharge] = await sql`
          SELECT h.id as hypercharge_id
          FROM hypercharges h
          JOIN brawlers b ON h.brawler_id = b.id
          WHERE b.released = true AND h.released = true
          ORDER BY RANDOM() LIMIT 1
        `;
        await sql`
          INSERT INTO daily_hypercharge (game_id, date, hypercharge_id)
          VALUES (${nextGameId}, ${date}::date, ${hypercharge.hypercharge_id})
        `;
        console.log(`Created daily hypercharge for ${date} with game_id ${nextGameId}`);
        return true;
      }
      return false;
    }

    async function createDailyPixel(date) {
      const existing = await sql`
        SELECT id FROM daily_pixel WHERE date = ${date}::date
      `;
      if (existing.length === 0) {
        const nextGameId = await getNextGameId('daily_pixel');
        const [brawler] = await sql`
          SELECT id as brawler_id FROM brawlers
          WHERE released = true
          ORDER BY RANDOM() LIMIT 1
        `;
        await sql`
          INSERT INTO daily_pixel (game_id, date, brawler_id)
          VALUES (${nextGameId}, ${date}::date, ${brawler.brawler_id})
        `;
        console.log(`Created daily pixel for ${date} with game_id ${nextGameId}`);
        return true;
      }
      return false;
    }

    async function createDailyEmoji(date) {
      const existing = await sql`
        SELECT id FROM daily_emoji WHERE date = ${date}::date
      `;
      if (existing.length === 0) {
        const nextGameId = await getNextGameId('daily_emoji');
        const [brawler] = await sql`
          SELECT b.id as brawler_id FROM brawlers b
          INNER JOIN brawler_emojis be ON be.brawler_id = b.id
          WHERE b.released = true
          GROUP BY b.id
          ORDER BY RANDOM() LIMIT 1
        `;
        await sql`
          INSERT INTO daily_emoji (game_id, date, brawler_id)
          VALUES (${nextGameId}, ${date}::date, ${brawler.brawler_id})
        `;
        console.log(`Created daily emoji for ${date} with game_id ${nextGameId}`);
        return true;
      }
      return false;
    }

    for (let i = 0; i < 3; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const formattedDate = date.toISOString().split('T')[0];

      await Promise.all([
        createDailyClassic(formattedDate),
        createDailyGadget(formattedDate),
        createDailyStarPower(formattedDate),
        createDailyHypercharge(formattedDate),
        createDailyPixel(formattedDate),
        createDailyEmoji(formattedDate),
      ]);
    }

    res.status(200).send('All daily challenges updated successfully');
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name,
    });
    res.status(500).send(`Error updating daily challenges: ${error.message}`);
  }
});
