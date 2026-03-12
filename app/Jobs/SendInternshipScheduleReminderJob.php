<?php

namespace App\Jobs;

use App\Models\InternshipPlacement;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendInternshipScheduleReminderJob implements ShouldQueue
{
    use Queueable;

    public function handle(NotificationService $notificationService): void
    {
        $targetDate = now()->addDay()->toDateString();

        InternshipPlacement::query()
            ->with(['student.user', 'teacher.user', 'industry'])
            ->where(function ($query) use ($targetDate): void {
                $query
                    ->whereDate('start_date', $targetDate)
                    ->orWhereDate('end_date', $targetDate);
            })
            ->chunkById(100, function ($placements) use ($notificationService, $targetDate): void {
                foreach ($placements as $placement) {
                    if ($placement->start_date?->toDateString() === $targetDate) {
                        $notificationService->sendInternshipScheduleReminder($placement, 'start');
                    }

                    if ($placement->end_date?->toDateString() === $targetDate) {
                        $notificationService->sendInternshipScheduleReminder($placement, 'end');
                    }
                }
            });
    }
}
