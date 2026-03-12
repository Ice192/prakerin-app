<?php

namespace Tests\Feature;

use App\Jobs\CheckMissingJournalJob;
use App\Jobs\SendInternshipScheduleReminderJob;
use App\Mail\SystemNotificationMail;
use App\Models\Industry;
use App\Models\InternshipPlacement;
use App\Models\Journal;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class NotificationEngineTest extends TestCase
{
    use RefreshDatabase;

    public function test_placement_creation_sends_assignment_notifications_and_logs(): void
    {
        Mail::fake();

        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
        ]);
        [$studentUser, $student] = $this->createStudent('101');
        [$teacherUser, $teacher] = $this->createTeacher('101');
        $industry = $this->createIndustry('101');

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/placements', [
                'student_id' => $student->id,
                'industry_id' => $industry->id,
                'teacher_id' => $teacher->id,
                'start_date' => now()->toDateString(),
                'end_date' => now()->addDays(30)->toDateString(),
            ])
            ->assertCreated();

        Mail::assertSent(SystemNotificationMail::class, 2);
        Mail::assertSent(SystemNotificationMail::class, fn (SystemNotificationMail $mail): bool => $mail->hasTo($studentUser->email));
        Mail::assertSent(SystemNotificationMail::class, fn (SystemNotificationMail $mail): bool => $mail->hasTo($teacherUser->email));

        $this->assertDatabaseCount('email_notifications', 2);
        $this->assertDatabaseHas('email_notifications', [
            'user_id' => $studentUser->id,
            'notification_type' => NotificationService::TYPE_PLACEMENT_ASSIGNED,
            'sent_status' => true,
        ]);
    }

    public function test_missing_journal_job_sends_reminder_to_students_without_daily_journal(): void
    {
        Mail::fake();

        [$studentUserWithoutJournal, $studentWithoutJournal] = $this->createStudent('201');
        [$studentUserWithJournal, $studentWithJournal] = $this->createStudent('202');
        [, $teacher] = $this->createTeacher('201');
        $industry = $this->createIndustry('201');

        InternshipPlacement::create([
            'student_id' => $studentWithoutJournal->id,
            'industry_id' => $industry->id,
            'teacher_id' => $teacher->id,
            'start_date' => now()->subDays(7)->toDateString(),
            'end_date' => now()->addDays(7)->toDateString(),
            'status' => 'assigned',
        ]);

        InternshipPlacement::create([
            'student_id' => $studentWithJournal->id,
            'industry_id' => $industry->id,
            'teacher_id' => $teacher->id,
            'start_date' => now()->subDays(7)->toDateString(),
            'end_date' => now()->addDays(7)->toDateString(),
            'status' => 'assigned',
        ]);

        Journal::create([
            'student_id' => $studentWithJournal->id,
            'date' => now()->subDay()->toDateString(),
            'activity' => 'Completed activity',
            'verification_status' => 'pending',
        ]);

        (new CheckMissingJournalJob)->handle(app(NotificationService::class));

        Mail::assertSent(SystemNotificationMail::class, fn (SystemNotificationMail $mail): bool => $mail->hasTo($studentUserWithoutJournal->email));
        Mail::assertNotSent(SystemNotificationMail::class, fn (SystemNotificationMail $mail): bool => $mail->hasTo($studentUserWithJournal->email));

        $this->assertDatabaseHas('email_notifications', [
            'user_id' => $studentUserWithoutJournal->id,
            'notification_type' => NotificationService::TYPE_MISSING_JOURNAL,
            'sent_status' => true,
        ]);
    }

    public function test_schedule_reminder_job_sends_reminders_for_tomorrows_internship_events(): void
    {
        Mail::fake();

        [$studentUser, $student] = $this->createStudent('301');
        [$teacherUser, $teacher] = $this->createTeacher('301');
        $industry = $this->createIndustry('301');

        InternshipPlacement::create([
            'student_id' => $student->id,
            'industry_id' => $industry->id,
            'teacher_id' => $teacher->id,
            'start_date' => now()->addDay()->toDateString(),
            'end_date' => now()->addDays(45)->toDateString(),
            'status' => 'assigned',
        ]);

        (new SendInternshipScheduleReminderJob)->handle(app(NotificationService::class));

        Mail::assertSent(SystemNotificationMail::class, 2);
        Mail::assertSent(SystemNotificationMail::class, fn (SystemNotificationMail $mail): bool => $mail->hasTo($studentUser->email));
        Mail::assertSent(SystemNotificationMail::class, fn (SystemNotificationMail $mail): bool => $mail->hasTo($teacherUser->email));

        $this->assertDatabaseHas('email_notifications', [
            'user_id' => $studentUser->id,
            'notification_type' => NotificationService::TYPE_SCHEDULE_REMINDER,
            'sent_status' => true,
        ]);
    }

    public function test_admin_can_send_important_announcement_to_students(): void
    {
        Mail::fake();

        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
        ]);
        [$studentUserA] = $this->createStudent('401');
        [$studentUserB] = $this->createStudent('402');
        $this->createTeacher('401');

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/announcements/important', [
                'subject' => 'System Maintenance',
                'message' => 'System will be under maintenance tonight at 22:00.',
                'audience' => 'students',
            ])
            ->assertOk()
            ->assertJsonPath('data.recipient_count', 2)
            ->assertJsonPath('data.sent_count', 2);

        Mail::assertSent(SystemNotificationMail::class, 2);
        Mail::assertSent(SystemNotificationMail::class, fn (SystemNotificationMail $mail): bool => $mail->hasTo($studentUserA->email));
        Mail::assertSent(SystemNotificationMail::class, fn (SystemNotificationMail $mail): bool => $mail->hasTo($studentUserB->email));

        $this->assertDatabaseCount('email_notifications', 2);
        $this->assertDatabaseHas('email_notifications', [
            'user_id' => $studentUserA->id,
            'notification_type' => NotificationService::TYPE_IMPORTANT_ANNOUNCEMENT,
            'sent_status' => true,
        ]);
    }

    /**
     * @return array{0: User, 1: Student}
     */
    private function createStudent(string $suffix): array
    {
        $user = User::factory()->create([
            'email' => "student{$suffix}@example.com",
            'role' => User::ROLE_STUDENT,
        ]);

        $student = Student::create([
            'user_id' => $user->id,
            'nis' => "NIS{$suffix}",
            'class' => 'XII RPL',
            'major' => 'RPL',
        ]);

        return [$user, $student];
    }

    /**
     * @return array{0: User, 1: Teacher}
     */
    private function createTeacher(string $suffix): array
    {
        $user = User::factory()->create([
            'email' => "teacher{$suffix}@example.com",
            'role' => User::ROLE_ADMIN,
        ]);

        $teacher = Teacher::create([
            'user_id' => $user->id,
            'position' => 'Supervisor',
        ]);

        return [$user, $teacher];
    }

    private function createIndustry(string $suffix): Industry
    {
        return Industry::create([
            'name' => "Industry {$suffix}",
            'address' => "Address {$suffix}",
            'contact_person' => 'Contact Person',
            'email' => "industry{$suffix}@example.com",
        ]);
    }
}
