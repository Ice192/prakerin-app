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
use Illuminate\Support\Carbon;

class ReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        if ($request->user()?->role !== User::ROLE_ADMIN) {
            return response()->json([
                'message' => 'Only admin can access reports.',
            ], 403);
        }

        return response()->json([
            'message' => 'Reports retrieved successfully.',
            'data' => [
                'summary' => [
                    'students' => Student::count(),
                    'industries' => Industry::count(),
                    'placements' => InternshipPlacement::count(),
                    'journals' => Journal::count(),
                    'evaluations' => Evaluation::count(),
                ],
                'placements_by_status' => $this->placementsByStatus(),
                'journals_by_status' => $this->journalsByStatus(),
                'top_students' => $this->topStudents(),
                'monthly_placements' => $this->monthlyPlacements(),
            ],
        ]);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function placementsByStatus(): array
    {
        $counts = InternshipPlacement::query()
            ->select('status')
            ->get()
            ->countBy('status');

        return $counts
            ->map(fn (int $total, string $status): array => [
                'status' => $status,
                'total' => $total,
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function journalsByStatus(): array
    {
        $counts = Journal::query()
            ->select('verification_status')
            ->get()
            ->countBy('verification_status');

        return $counts
            ->map(fn (int $total, string $status): array => [
                'status' => $status,
                'total' => $total,
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function topStudents(): array
    {
        $averages = Evaluation::query()
            ->with('student.user')
            ->get()
            ->groupBy('student_id')
            ->map(function ($items, int $studentId): array {
                /** @var \Illuminate\Support\Collection<int, Evaluation> $items */
                $first = $items->first();

                return [
                    'student_id' => $studentId,
                    'student_name' => $first?->student?->user?->name,
                    'average_score' => round((float) $items->avg('final_score'), 2),
                    'evaluation_count' => $items->count(),
                ];
            })
            ->sortByDesc('average_score')
            ->take(5)
            ->values();

        return $averages->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function monthlyPlacements(): array
    {
        $start = Carbon::now()->startOfMonth()->subMonths(5);
        $placements = InternshipPlacement::query()
            ->whereDate('start_date', '>=', $start->toDateString())
            ->get(['start_date']);

        $labels = [];
        $cursor = $start->copy();
        for ($i = 0; $i < 6; $i++) {
            $labels[] = $cursor->format('Y-m');
            $cursor->addMonth();
        }

        return collect($labels)
            ->map(function (string $month) use ($placements): array {
                $count = $placements
                    ->filter(fn (InternshipPlacement $placement): bool => $placement->start_date?->format('Y-m') === $month)
                    ->count();

                return [
                    'month' => $month,
                    'total' => $count,
                ];
            })
            ->all();
    }
}
