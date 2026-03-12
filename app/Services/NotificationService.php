<?php

namespace App\Services;

use App\Mail\SystemNotificationMail;
use App\Models\EmailNotification;
use App\Models\InternshipPlacement;
use App\Models\Student;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\Mail;
use Throwable;

class NotificationService
{
    public const TYPE_PLACEMENT_ASSIGNED = 'placement_assigned';
    public const TYPE_MISSING_JOURNAL = 'missing_journal';
    public const TYPE_SCHEDULE_REMINDER = 'schedule_reminder';
    public const TYPE_IMPORTANT_ANNOUNCEMENT = 'important_announcement';

    public function sendPlacementAssignedNotification(InternshipPlacement $placement): void
    {
        $placement->loadMissing([
            'student.user',
            'teacher.user',
            'industry',
        ]);

        $industryName = $placement->industry?->name ?? 'the assigned industry';
        $startDate = $placement->start_date?->format('Y-m-d') ?? '-';
        $endDate = $placement->end_date?->format('Y-m-d') ?? '-';
        $teacherName = $placement->teacher?->user?->name ?? 'TBA';

        if ($placement->student?->user instanceof User) {
            $this->sendToUser(
                $placement->student->user,
                self::TYPE_PLACEMENT_ASSIGNED,
                'Internship Placement Assigned',
                "You have been assigned to {$industryName}.\n"
                ."Internship period: {$startDate} to {$endDate}.\n"
                ."Supervising teacher: {$teacherName}.",
            );
        }

        if ($placement->teacher?->user instanceof User) {
            $studentName = $placement->student?->user?->name ?? 'a student';

            $this->sendToUser(
                $placement->teacher->user,
                self::TYPE_PLACEMENT_ASSIGNED,
                'New Internship Placement Assignment',
                "{$studentName} has been assigned to {$industryName}.\n"
                ."Internship period: {$startDate} to {$endDate}.",
            );
        }
    }

    public function sendMissingJournalReminder(Student $student, CarbonInterface $journalDate): void
    {
        $student->loadMissing('user');

        if (! $student->user instanceof User) {
            return;
        }

        $this->sendToUser(
            $student->user,
            self::TYPE_MISSING_JOURNAL,
            'Daily Journal Reminder',
            'You have not submitted your internship journal for '
            .$journalDate->format('Y-m-d')
            .".\nPlease fill it in as soon as possible.",
        );
    }

    public function sendInternshipScheduleReminder(InternshipPlacement $placement, string $reminderType): void
    {
        $placement->loadMissing([
            'student.user',
            'teacher.user',
            'industry',
        ]);

        $reminderDate = $reminderType === 'end'
            ? $placement->end_date
            : $placement->start_date;

        if (! $reminderDate) {
            return;
        }

        $industryName = $placement->industry?->name ?? 'your assigned industry';
        $dateText = $reminderDate->format('Y-m-d');
        $studentUser = $placement->student?->user;
        $teacherUser = $placement->teacher?->user;

        if ($studentUser instanceof User) {
            $studentMessage = $reminderType === 'end'
                ? "Reminder: Your internship at {$industryName} is scheduled to end on {$dateText}."
                : "Reminder: Your internship at {$industryName} is scheduled to start on {$dateText}.";

            $this->sendToUser(
                $studentUser,
                self::TYPE_SCHEDULE_REMINDER,
                'Internship Schedule Reminder',
                $studentMessage,
            );
        }

        if ($teacherUser instanceof User) {
            $studentName = $studentUser?->name ?? 'a student';
            $teacherMessage = $reminderType === 'end'
                ? "Reminder: {$studentName}'s internship at {$industryName} is scheduled to end on {$dateText}."
                : "Reminder: {$studentName}'s internship at {$industryName} is scheduled to start on {$dateText}.";

            $this->sendToUser(
                $teacherUser,
                self::TYPE_SCHEDULE_REMINDER,
                'Internship Schedule Reminder',
                $teacherMessage,
            );
        }
    }

    /**
     * @param iterable<User> $users
     */
    public function sendImportantAnnouncement(iterable $users, string $subject, string $message): int
    {
        $successCount = 0;

        foreach ($users as $user) {
            if (! $user instanceof User) {
                continue;
            }

            $notification = $this->sendToUser(
                $user,
                self::TYPE_IMPORTANT_ANNOUNCEMENT,
                $subject,
                $message,
            );

            if ($notification->sent_status) {
                $successCount++;
            }
        }

        return $successCount;
    }

    private function sendToUser(User $user, string $notificationType, string $subject, string $message): EmailNotification
    {
        $sentStatus = false;
        $sentAt = null;
        $errorMessage = null;

        try {
            Mail::to($user->email)->send(
                new SystemNotificationMail(
                    recipientName: $user->name,
                    subjectLine: $subject,
                    messageBody: $message,
                ),
            );

            $sentStatus = true;
            $sentAt = now();
        } catch (Throwable $exception) {
            report($exception);
            $errorMessage = $exception->getMessage();
        }

        return EmailNotification::create([
            'user_id' => $user->id,
            'notification_type' => $notificationType,
            'subject' => $subject,
            'message' => $message,
            'sent_status' => $sentStatus,
            'sent_at' => $sentAt,
            'error_message' => $errorMessage,
        ]);
    }
}
