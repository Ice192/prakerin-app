<?php

namespace App\Jobs;

use App\Models\Student;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class CheckMissingJournalJob implements ShouldQueue
{
    use Queueable;

    public function handle(NotificationService $notificationService): void
    {
        $journalDate = now()->subDay()->toDateString();

        Student::query()
            ->with('user')
            ->whereHas('internshipPlacements', function ($query) use ($journalDate): void {
                $query
                    ->whereDate('start_date', '<=', $journalDate)
                    ->whereDate('end_date', '>=', $journalDate);
            })
            ->whereDoesntHave('journals', function ($query) use ($journalDate): void {
                $query->whereDate('date', $journalDate);
            })
            ->chunkById(100, function ($students) use ($notificationService): void {
                foreach ($students as $student) {
                    $notificationService->sendMissingJournalReminder(
                        $student,
                        now()->subDay(),
                    );
                }
            });
    }
}
