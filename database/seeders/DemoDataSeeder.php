<?php

namespace Database\Seeders;

use App\Models\Evaluation;
use App\Models\Industry;
use App\Models\InternshipPlacement;
use App\Models\Journal;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $adminUser = User::updateOrCreate(
            ['email' => 'admin@mail.com'],
            [
                'name' => 'Admin Demo',
                'password' => 'password123',
                'role' => User::ROLE_ADMIN,
            ],
        );

        $teacherUser = User::updateOrCreate(
            ['email' => 'teacher@mail.com'],
            [
                'name' => 'Teacher Demo',
                'password' => 'password123',
                'role' => User::ROLE_ADMIN,
            ],
        );

        $studentUserA = User::updateOrCreate(
            ['email' => 'student@mail.com'],
            [
                'name' => 'Student Demo',
                'password' => 'password123',
                'role' => User::ROLE_STUDENT,
            ],
        );

        $studentUserB = User::updateOrCreate(
            ['email' => 'student2@mail.com'],
            [
                'name' => 'Student Demo 2',
                'password' => 'password123',
                'role' => User::ROLE_STUDENT,
            ],
        );

        User::updateOrCreate(
            ['email' => 'industry@mail.com'],
            [
                'name' => 'Industry Demo User',
                'password' => 'password123',
                'role' => User::ROLE_INDUSTRY,
            ],
        );

        Teacher::updateOrCreate(
            ['user_id' => $teacherUser->id],
            ['position' => 'Internship Supervisor'],
        );

        $teacher = Teacher::where('user_id', $teacherUser->id)->firstOrFail();

        $studentA = Student::updateOrCreate(
            ['user_id' => $studentUserA->id],
            [
                'nis' => 'SIS-2026-001',
                'class' => 'XII RPL 1',
                'major' => 'Software Engineering',
            ],
        );

        $studentB = Student::updateOrCreate(
            ['user_id' => $studentUserB->id],
            [
                'nis' => 'SIS-2026-002',
                'class' => 'XII RPL 2',
                'major' => 'Software Engineering',
            ],
        );

        $industryA = Industry::updateOrCreate(
            ['email' => 'industry@mail.com'],
            [
                'name' => 'PT Inovasi Digital Nusantara',
                'address' => 'Jl. AP Pettarani No. 88, Makassar',
                'contact_person' => 'Rina Pratama',
            ],
        );

        $industryB = Industry::updateOrCreate(
            ['email' => 'partner@mail.com'],
            [
                'name' => 'CV Solusi Teknologi',
                'address' => 'Jl. Perintis Kemerdekaan No. 21, Makassar',
                'contact_person' => 'Ari Wibowo',
            ],
        );

        InternshipPlacement::updateOrCreate(
            ['student_id' => $studentA->id],
            [
                'industry_id' => $industryA->id,
                'teacher_id' => $teacher->id,
                'start_date' => '2026-03-01',
                'end_date' => '2026-06-30',
                'status' => 'active',
            ],
        );

        InternshipPlacement::updateOrCreate(
            ['student_id' => $studentB->id],
            [
                'industry_id' => $industryB->id,
                'teacher_id' => $teacher->id,
                'start_date' => '2026-02-15',
                'end_date' => '2026-05-31',
                'status' => 'assigned',
            ],
        );

        Journal::updateOrCreate(
            ['student_id' => $studentA->id, 'date' => '2026-03-09'],
            [
                'activity' => 'Built frontend components for internship dashboard and fixed validation issues.',
                'verification_status' => 'verified',
            ],
        );

        Journal::updateOrCreate(
            ['student_id' => $studentA->id, 'date' => '2026-03-10'],
            [
                'activity' => 'Implemented API integration and tested authentication using Sanctum tokens.',
                'verification_status' => 'pending',
            ],
        );

        Journal::updateOrCreate(
            ['student_id' => $studentB->id, 'date' => '2026-03-10'],
            [
                'activity' => 'Prepared internship report draft and discussed evaluation criteria with mentor.',
                'verification_status' => 'rejected',
            ],
        );

        Evaluation::updateOrCreate(
            ['student_id' => $studentA->id, 'industry_id' => $industryA->id],
            [
                'discipline_score' => 88,
                'teamwork_score' => 90,
                'skill_score' => 87,
                'responsibility_score' => 92,
                'final_score' => $this->finalScore(88, 90, 87, 92),
            ],
        );

        Evaluation::updateOrCreate(
            ['student_id' => $studentB->id, 'industry_id' => $industryB->id],
            [
                'discipline_score' => 80,
                'teamwork_score' => 82,
                'skill_score' => 79,
                'responsibility_score' => 85,
                'final_score' => $this->finalScore(80, 82, 79, 85),
            ],
        );

        $this->command?->info('Demo users/data seeded.');
        $this->command?->line('Admin: admin@mail.com / password123');
        $this->command?->line('Student: student@mail.com / password123');
        $this->command?->line('Industry: industry@mail.com / password123');
        $this->command?->line('Teacher helper account: teacher@mail.com / password123');
        $this->command?->line(sprintf('Admin user id: %d', $adminUser->id));
    }

    private function finalScore(int $discipline, int $teamwork, int $skill, int $responsibility): float
    {
        return round(($discipline + $teamwork + $skill + $responsibility) / 4, 2);
    }
}
