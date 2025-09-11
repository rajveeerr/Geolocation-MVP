import app from './app';
import { scheduleMonthlyReset } from './jobs/monthlyReset';
import { scheduleDailyBirthdays } from './jobs/dailyBirthday';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
  if (process.env.DISABLE_SCHEDULER !== 'true') {
  scheduleMonthlyReset();
  scheduleDailyBirthdays();
  console.log('[scheduler]: Monthly reset scheduled.');
  console.log('[scheduler]: Daily birthdays scheduled.');
  }
});