import mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

async function initializeDatabase() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'impulse_db',
  };

  console.log('Connecting to MySQL server...');
  console.log(`Host: ${dbConfig.host}`);
  console.log(`User: ${dbConfig.user}`);
  console.log(`Database: ${dbConfig.database}`);

  // First, connect without database to create it
  const connection = await mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    multipleStatements: true,
  });

  try {
    // Create database if it doesn't exist
    console.log(`\nCreating database '${dbConfig.database}' if it doesn't exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✓ Database '${dbConfig.database}' is ready`);

    // Switch to the database
    await connection.query(`USE \`${dbConfig.database}\``);
    console.log(`✓ Using database '${dbConfig.database}'`);

    // Read and execute schema file
    const schemaPath = path.join(process.cwd(), 'lib', 'schema.sql');
    console.log(`\nReading schema file: ${schemaPath}`);
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }

    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    console.log(`\nExecuting schema SQL...`);

    // Execute the entire schema file (mysql2 supports multiple statements)
    try {
      await connection.query(schema);
      console.log(`  ✓ Schema executed successfully`);
      
      // List all tables to confirm
      const [tables] = await connection.query<Array<{Tables_in_impulse_db: string}>>('SHOW TABLES');
      console.log(`\nCreated tables:`);
      tables.forEach((row) => {
        const tableName = Object.values(row)[0];
        console.log(`  ✓ ${tableName}`);
      });
    } catch (error: any) {
      // If it's a table already exists error, that's okay
      if (error.message.includes('already exists')) {
        console.log(`  ⚠ Some tables may already exist (this is okay)`);
      } else {
        throw error;
      }
    }

    console.log('\n✅ Database initialization completed successfully!');
    console.log('\nYou can now start your Next.js application with: npm run dev');
  } catch (error: any) {
    console.error('\n❌ Database initialization failed:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

initializeDatabase();

