<?php

use App\Jobs\CheckMissingJournalJob;
use App\Jobs\SendInternshipScheduleReminderJob;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::job(new CheckMissingJournalJob)
    ->dailyAt('18:00')
    ->name('check-missing-journals');

Schedule::job(new SendInternshipScheduleReminderJob)
    ->dailyAt('07:00')
    ->name('send-internship-schedule-reminders');
