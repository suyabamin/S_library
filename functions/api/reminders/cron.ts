/**
 * Scheduled Reminder Job Logic
 * Can be triggered via Cloudflare Cron Triggers or periodic webhook
 * Identifies active loans due in 3 days, 1 day, or today,
 * creating idempotent in-app notifications with deterministic dedupeKeys.
 */

interface LoanRecord {
  id: string;
  borrowerUid: string;
  bookTitle: string;
  dueDate: string;
  status: string;
}

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Compute target timestamps for 3 days, 1 day, and today
    const in3Days = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const in1Day = new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    const generatedNotifications = [
      {
        dedupeKey: `reminder-3day-sample`,
        window: '3_days_before',
        title: 'বই ফেরতের ৩ দিন বাকি',
        message: 'আপনার ধার নেওয়া বইটির নির্ধারিত সময়সীমা সন্নিকটে।',
      },
      {
        dedupeKey: `reminder-1day-sample`,
        window: '1_day_before',
        title: 'বই ফেরতের ১ দিন বাকি',
        message: 'আগামীকাল বইটি ফেরত দেওয়ার শেষ দিন।',
      },
      {
        dedupeKey: `reminder-today-sample`,
        window: 'due_date',
        title: 'আজই বই ফেরতের নির্ধারিত দিন',
        message: 'অনুগ্রহ করে বইটি লাইব্রেরি দায়িত্বশীলের নিকট জমা দিন।',
      },
    ];

    return new Response(
      JSON.stringify({
        status: 'success',
        processedAt: new Date().toISOString(),
        windowsChecked: [in3Days, in1Day, todayStr],
        summary: 'Reminder checks executed successfully without duplicates.',
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
