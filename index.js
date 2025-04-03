import express from 'express';
import bodyParser from 'body-parser';
import redis from 'redis';
import QRCode from 'qrcode';
import axios from 'axios';
import pg from 'pg';
import fetch from 'node-fetch';
import 'dotenv/config';
import validator from 'validator';
import cron from 'node-cron';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import ipgeolocation from 'ipgeolocation';
puppeteer.use(StealthPlugin());

const port=process.env.PORT;
const db = new pg.Client({
    user: "deepakgarg",
    host: "dpg-cvn43t9r0fns738gu63g-a.oregon-postgres.render.com",
    database: "deepji",
    password: "JfvFE0opEjqTPzYHVe4CjzsuYqaLumWU",
    port: 5432,
    ssl: {
        rejectUnauthorized: false, // Required for secure cloud DB connections
        require: true // Ensures SSL is strictly required
    }
});

cron.schedule('0 0 * * *', async () => {
  console.log('Running cleanup job for expired URLs...');
  try {
      // 1. Insert expired URLs into the url_expired table
      await db.query(`
          INSERT INTO expired_url(id,short_code, long_url, expiration_time,created_at,moved_at)
          SELECT id,short_code, long_url, expiration_time,created_at,current_timestamp
          FROM urls
          WHERE expiration_time < NOW();
      `);

      // 2. Delete expired URLs from the original table
      await db.query(`
          DELETE FROM urls 
          WHERE expiration_time < NOW();
      `);

      console.log('Expired URLs cleaned up successfully.');
  } catch (err) {
      console.error('Error during cleanup:', err);
  }
});
// const redisClient = redis.createClient();
// redisClient.connect();
// redisClient.on('connect', () => console.log('Redis connected!'));
// redisClient.on('error', (err) => console.error('Redis error:', err));

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

db.connect();

app.get('/', (req, res) => {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS name (
        id SERIAL PRIMARY KEY,
        sirname VARCHAR(40)
      );
    `
  
    db.query(createTableQuery)
      .then(() => {
        res.send('Table created (if it did not exist already)!');
      })
      .catch((err) => {
        res.status(500).send('Error creating table: ' + err);
      });
  });
  
  async function hook(url) {
    // Step 1: Validate the URL format
    if (!validator.isURL(url, { require_protocol: true, allow_underscores: true, validate_length: false })) {
 
 
      return false; // Invalid URL format
    }
  
    try {
      // Step 2: Try to fetch the URL
      const response = await fetch(url, { 
       //Follow up to 5 redirects by default
       redirect: 'follow',
       headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
    },
      
      });
  
      // Step 3: Check if the response is successful (status code in range 200-299)
      if (!response.ok) {
        console.error(`URL '${url}' returned status code ${response.status}`);
        return false; // Not reachable (404, 500, etc.)
      }
  
      return true; // URL is valid and reachable
  
    } catch (error) {
      // Step 4: Catch network or DNS issues
      console.error(`Error fetching URL '${url}':`, error);
      
      // Handle specific errors
      if (error.code === 'ENOTFOUND' || error.code === 'ENOENT' || error.code === 'ECONNREFUSED') {
        return false; // Network error: unreachable URL
      }
  
      // Generic catch for any other issues
      return false; 
    }
  }
   
  app.post('/api/shorten', async (req, res) => {
    console.log("hello");
      const { longUrl, customUrl, expirationTime } = req.body;
         if (!longUrl) return res.status(400).json({ error: 'Long URL is required' });
        let custurlvalid=true;
        let shortCode;
        
         if(!customUrl){
          shortCode=Math.random().toString(36).substr(2, 8);
          custurlvalid=true;
         }
         else{
         shortCode = customUrl.trim();
  
          if (!/^[a-zA-Z0-9\s-]*$/.test(shortCode)) {
            console.log("No special char allowed");
            custurlvalid=false;
           
        }
          // Step 2: Replace spaces with '-'
          shortCode = shortCode.replace(/\s+/g, '-');
        
          // Step 3: Replace multiple consecutive '-' with a single '-'
          shortCode = shortCode.replace(/-+/g, '-');
        
          // Step 4: Check if it starts or ends with '-'
          if (/^-|-$/.test(shortCode)) {
             console.log("pls no - in starting or ending");
              custurlvalid=false;
             
          }
          
         }
     
     
     
      const isVal = await hook(longUrl);
    if (isVal && custurlvalid ) {
      // Store the URL in the database 
      console.log("Valid URL:", longUrl); 
      try {
        // const shortCode = customUrl;
        const expiration = expirationTime || null;

        // Store in DB
        await db.query(
            `INSERT INTO urls (short_code, long_url, expiration_time) VALUES ($1, $2, $3)`,
            [shortCode, longUrl, expiration]
        );

        const qrCodeUrl = await QRCode.toDataURL(`${req.hostname}/${shortCode}`);

        res.status(201).json({ shortUrl: `${req.hostname}/${shortCode}`, qrCode: qrCodeUrl });
         
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
   
   
    } else {
    
      console.error("Invalid URL:", longUrl,"or Invalid custurl"); 
      res.status(422).json({error:'invalid lond or custum url'});
    }
  

  

    
  
    
});



async function logClick(shortCode, ip,id) {
  try {
    let url='https://ipinfo.io/json?token=f0aeb46a0acb29';
    const metadata = await fetch(url); 
    const response= await metadata.json();
    console.log(response);
    const now= new Date();
    await db.query(
      `INSERT INTO metrics (url_id, ip_address, city, region, country, clicked_at) 
      VALUES ($1, $2, $3, $4, $5, $6)`,
     [id, ip, response.city, response.region, response.country, now]
    );
  } catch (error) {
    console.error('Error logging click:', error);
    // Handle potential errors (e.g., database connection issues, IP lookup failures)
    // You might want to log the error to a file or send an alert
  }
}



app.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    console.log("Received shortCode:", shortCode); // Debugging

    const Result = await db.query(
      `SELECT id, long_url FROM urls WHERE LOWER(short_code) = LOWER($1) 
      AND (expiration_time IS NULL OR expiration_time > NOW())`,
      [shortCode]
    );

    console.log("Database Query Result:", Result.rows); // Debugging

    if (Result.rows.length === 0) {
      console.log("Short code not found or expired");
      return res.status(404).json({ error: 'URL not found or expired' });
    }

    const { id, long_url: longUrl } = Result.rows[0];

    console.log("Redirecting to:", longUrl); // Debugging

    // await logClick(shortCode, userIp, id);

    res.redirect(longUrl);
  } catch (err) {
    console.error("Error handling short URL:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});





app.listen(port,()=>{
    console.log("welcome sir");
})
