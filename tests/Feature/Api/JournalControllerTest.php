<?php

namespace Tests\Feature\Api;

use App\Models\Journal;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JournalControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_create_a_daily_journal(): void
    {
        [$studentUser, $student] = $this->createStudent('001');

        $response = $this
            ->actingAs($studentUser, 'sanctum')
            ->postJson('/api/journals', [
                'student_id' => 9999,
                'date' => '2026-03-12',
                'activity' => 'Build API endpoint for journals.',
            ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.student_id', $student->id)
            ->assertJsonPath('data.date', '2026-03-12')
            ->assertJsonPath('data.verification_status', 'pending');

        $this->assertDatabaseHas('journals', [
            'student_id' => $student->id,
            'activity' => 'Build API endpoint for journals.',
            'verification_status' => 'pending',
        ]);
    }

    public function test_student_can_only_view_their_own_journals(): void
    {
        [$studentUserA, $studentA] = $this->createStudent('002');
        [, $studentB] = $this->createStudent('003');

        Journal::create([
            'student_id' => $studentA->id,
            'date' => '2026-03-11',
            'activity' => 'Journal A.',
            'verification_status' => 'pending',
        ]);

        Journal::create([
            'student_id' => $studentB->id,
            'date' => '2026-03-11',
            'activity' => 'Journal B.',
            'verification_status' => 'pending',
        ]);

        $response = $this
            ->actingAs($studentUserA, 'sanctum')
            ->getJson('/api/journals');

        $response
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.student_id', $studentA->id);
    }

    public function test_student_cannot_edit_another_students_journal(): void
    {
        [$studentUserA] = $this->createStudent('004');
        [, $studentB] = $this->createStudent('005');

        $journalB = Journal::create([
            'student_id' => $studentB->id,
            'date' => '2026-03-11',
            'activity' => 'Original activity.',
            'verification_status' => 'pending',
        ]);

        $this
            ->actingAs($studentUserA, 'sanctum')
            ->putJson("/api/journals/{$journalB->id}", [
                'date' => '2026-03-12',
                'activity' => 'Unauthorized edit.',
            ])
            ->assertForbidden();

        $this->assertDatabaseHas('journals', [
            'id' => $journalB->id,
            'activity' => 'Original activity.',
        ]);
    }

    public function test_teacher_can_view_and_verify_student_journals(): void
    {
        $teacherUser = $this->createTeacher('006');
        [, $student] = $this->createStudent('007');

        $journal = Journal::create([
            'student_id' => $student->id,
            'date' => '2026-03-11',
            'activity' => 'Initial daily report.',
            'verification_status' => 'pending',
        ]);

        $this
            ->actingAs($teacherUser, 'sanctum')
            ->getJson('/api/journals')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this
            ->actingAs($teacherUser, 'sanctum')
            ->patchJson("/api/journals/{$journal->id}/verify", [
                'verification_status' => 'verified',
            ])
            ->assertOk()
            ->assertJsonPath('data.verification_status', 'verified');

        $this->assertDatabaseHas('journals', [
            'id' => $journal->id,
            'verification_status' => 'verified',
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

    private function createTeacher(string $suffix): User
    {
        $user = User::factory()->create([
            'email' => "teacher{$suffix}@example.com",
            'role' => User::ROLE_ADMIN,
        ]);

        Teacher::create([
            'user_id' => $user->id,
            'position' => 'Supervisor',
        ]);

        return $user;
    }
}
