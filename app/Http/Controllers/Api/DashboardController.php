<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Evaluation;
use App\Models\Industry;
use App\Models\InternshipPlacement;
use App\Models\Journal;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if ($user->role === User::ROLE_ADMIN) {
            return response()->json([
                'message' => 'Dashboard retrieved successfully.',
                'data' => $this->adminDashboard(),
            ]);
        }

        if ($user->role === User::ROLE_STUDENT) {
            $student = $user->student;

            if (! $student) {
                return response()->json([
                    'message' => 'Student profile not found.',
                ], 404);
            }

            return response()->json([
                'message' => 'Dashboard retrieved successfully.',
                'data' => $this->studentDashboard($student->id),
            ]);
        }

        if ($user->role === User::ROLE_INDUSTRY) {
            $industry = Industry::query()
                ->where('email', $user->email)
                ->first();

            if (! $industry) {
                return response()->json([
                    'message' => 'Industry profile not found for this account.',
                ], 404);
            }

            return response()->json([
                'message' => 'Dashboard retrieved successfully.',
                'data' => $this->industryDashboard($industry->id),
            ]);
        }

        return response()->json([
            'message' => 'Unsupported role.',
        ], 403);
    }

    /**
     * @return array<string, mixed>
     */
    private function adminDashboard(): array
    {
        $recentPlacements = InternshipPlacement::query()
            ->with(['student.user', 'industry'])
            ->latest()
            ->limit(5)
            ->get();

        return [
            'role' => User::ROLE_ADMIN,
            'cards' => [
                ['label' => 'Total Students', 'value' => Student::count()],
                ['label' => 'Total Industries', 'value' => Industry::count()],
                ['label' => 'Internship Placements', 'value' => InternshipPlacement::count()],
                ['label' => 'Pending Journals', 'value' => Journal::where('verification_status', 'pending')->count()],
                ['label' => 'Total Evaluations', 'value' => Evaluation::count()],
            ],
            'recent_placements' => $recentPlacements->map(function (InternshipPlacement $placement): array {
                return [
                    'id' => $placement->id,
                    'student_name' => $placement->student?->user?->name,
                    'industry_name' => $placement->industry?->name,
                    'status' => $placement->status,
                    'start_date' => $placement->start_date?->toDateString(),
                ];
            }),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function studentDashboard(int $studentId): array
    {
        $placementCount = InternshipPlacement::where('student_id', $studentId)->count();
        $journalCount = Journal::where('student_id', $studentId)->count();
        $verifiedJournalCount = Journal::where('student_id', $studentId)
            ->where('verification_status', 'verified')
            ->count();
        $averageEvaluationScore = Evaluation::where('student_id', $studentId)->avg('final_score');
        $recentJournals = Journal::where('student_id', $studentId)
            ->latest('date')
            ->latest()
            ->limit(5)
            ->get();

        return [
            'role' => User::ROLE_STUDENT,
            'cards' => [
                ['label' => 'Placements', 'value' => $placementCount],
                ['label' => 'Total Journals', 'value' => $journalCount],
                ['label' => 'Verified Journals', 'value' => $verifiedJournalCount],
                ['label' => 'Average Evaluation', 'value' => round((float) ($averageEvaluationScore ?? 0), 2)],
            ],
            'recent_journals' => $recentJournals->map(function (Journal $journal): array {
                return [
                    'id' => $journal->id,
                    'date' => $journal->date?->toDateString(),
                    'activity' => $journal->activity,
                    'verification_status' => $journal->verification_status,
                ];
            }),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function industryDashboard(int $industryId): array
    {
        $placements = InternshipPlacement::query()
            ->where('industry_id', $industryId)
            ->with(['student.user'])
            ->latest()
            ->limit(5)
            ->get();

        $evaluationCount = Evaluation::where('industry_id', $industryId)->count();
        $activePlacements = InternshipPlacement::where('industry_id', $industryId)
            ->where('status', 'active')
            ->count();

        return [
            'role' => User::ROLE_INDUSTRY,
            'cards' => [
                ['label' => 'Assigned Students', 'value' => InternshipPlacement::where('industry_id', $industryId)->count()],
                ['label' => 'Active Placements', 'value' => $activePlacements],
                ['label' => 'Evaluations Submitted', 'value' => $evaluationCount],
            ],
            'recent_students' => $placements->map(function (InternshipPlacement $placement): array {
                return [
                    'id' => $placement->id,
                    'student_name' => $placement->student?->user?->name,
                    'status' => $placement->status,
                    'start_date' => $placement->start_date?->toDateString(),
                    'end_date' => $placement->end_date?->toDateString(),
                ];
            }),
        ];
    }
}
