import dataSource from './data-source';

async function runMigrations() {
  try {
    console.log('Initializing database connection...');
    await dataSource.initialize();
    
    console.log('Running pending migrations...');
    const migrations = await dataSource.runMigrations();
    
    if (migrations.length === 0) {
      console.log('No pending migrations to run.');
    } else {
      console.log(`Successfully ran ${migrations.length} migration(s):`);
      migrations.forEach((migration) => {
        console.log(`  - ${migration.name}`);
      });
    }
    
    await dataSource.destroy();
    console.log('Migration process completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

runMigrations();
