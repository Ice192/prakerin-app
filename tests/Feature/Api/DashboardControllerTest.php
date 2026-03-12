<?php

namespace Tests\Feature\Api;

use App\Models\Industry;
use App\Models\InternshipPlacement;
use App\Models\Journal;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class DashboardControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_dashboard_returns_required_metrics_and_chart_data(): void
    {
        Carbon::setTestNow('2026-03-12 09:00:00');

        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
        ]);

        $teacherUser = User::factory()->create([
            'role' => User::ROLE_ADMIN,
        ]);

        $teacher = Teacher::create([
            'user_id' => $teacherUser->id,
            'position' => 'Internship Supervisor',
        ]);

        $industryA = Industry::create([
            'name' => 'Industry A',
            'email' => 'industry-a@example.com',
            'address' => 'Address A',
            'contact_person' => 'Person A',
        ]);

        $industryB = Industry::create([
            'name' => 'Industry B',
            'email' => 'industry-b@example.com',
            'address' => 'Address B',
            'contact_person' => 'Person B',
        ]);

        [, $studentA] = $this->createStudent('001');
        [, $studentB] = $this->createStudent('002');
        [, $studentC] = $this->createStudent('003');

        InternshipPlacement::create([
            'student_id' => $studentA->id,
            'industry_id' => $industryA->id,
            'teacher_id' => $teacher->id,
            'start_date' => '2026-03-01',
            'end_date' => '2026-04-30',
            'status' => 'active',
        ]);

        InternshipPlacement::create([
            'student_id' => $studentB->id,
            'industry_id' => $industryB->id,
            'teacher_id' => $teacher->id,
            'start_date' => '2026-03-01',
            'end_date' => '2026-04-30',
            'status' => 'active',
        ]);

        InternshipPlacement::create([
            'student_id' => $studentC->id,
            'industry_id' => $industryA->id,
            'teacher_id' => $teacher->id,
            'start_date' => '2026-03-01',
            'end_date' => '2026-04-30',
            'status' => 'assigned',
        ]);

        Journal::create([
            'student_id' => $studentA->id,
            'date' => '2026-03-12',
            'activity' => 'Worked on dashboard cards.',
            'verification_status' => 'pending',
        ]);

        // Same student should only be counted once for submitted journals today.
        Journal::create([
            'student_id' => $studentA->id,
            'date' => '2026-03-12',
            'activity' => 'Updated dashboard charts.',
            'verification_status' => 'pending',
        ]);

        Journal::create([
            'student_id' => $studentB->id,
            'date' => '2026-03-11',
            'activity' => 'Yesterday journal.',
            'verification_status' => 'pending',
        ]);

        $response = $this
            ->actingAs($admin, 'sanctum')
            ->getJson('/api/dashboard');

        $response
            ->assertOk()
            ->assertJsonPath('data.role', User::ROLE_ADMIN)
            ->assertJsonPath('data.today', '2026-03-12')
            ->assertJsonPath('data.cards.0.label', 'Total Students in Internship')
            ->assertJsonPath('data.cards.0.value', 2)
            ->assertJsonPath('data.cards.1.label', 'Total Industries')
            ->assertJsonPath('data.cards.1.value', 2)
            ->assertJsonPath('data.cards.2.label', 'Students Submitted Journal Today')
            ->assertJsonPath('data.cards.2.value', 1)
            ->assertJsonPath('data.cards.3.label', 'Students Missing Journal Today')
            ->assertJsonPath('data.cards.3.value', 1)
            ->assertJsonPath('data.charts.internship_overview.0.label', 'Students in Internship')
            ->assertJsonPath('data.charts.internship_overview.0.value', 2)
            ->assertJsonPath('data.charts.internship_overview.1.label', 'Total Industries')
            ->assertJsonPath('data.charts.internship_overview.1.value', 2)
            ->assertJsonPath('data.charts.journal_today_overview.0.label', 'Submitted Today')
            ->assertJsonPath('data.charts.journal_today_overview.0.value', 1)
            ->assertJsonPath('data.charts.journal_today_overview.1.label', 'Missing Today')
            ->assertJsonPath('data.charts.journal_today_overview.1.value', 1);

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
}
