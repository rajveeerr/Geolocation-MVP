import app from './app';
import { scheduleMonthlyReset } from './jobs/monthlyReset';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
  if (process.env.DISABLE_SCHEDULER !== 'true') {
    scheduleMonthlyReset();
    console.log('[scheduler]: Monthly reset scheduled.');
  }
});