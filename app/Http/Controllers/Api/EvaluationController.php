<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Evaluation;
use App\Models\Industry;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EvaluationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $query = Evaluation::query()
            ->with(['student.user', 'industry'])
            ->latest();

        if ($user->role === User::ROLE_ADMIN) {
            $evaluations = $query->get();
        } elseif ($user->role === User::ROLE_STUDENT) {
            $student = $user->student;

            if (! $student) {
                return response()->json([
                    'message' => 'Student profile not found.',
                ], 404);
            }

            $evaluations = $query
                ->where('student_id', $student->id)
                ->get();
        } elseif ($user->role === User::ROLE_INDUSTRY) {
            $industry = $this->resolveIndustryForUser($user);

            if (! $industry) {
                return response()->json([
                    'message' => 'Industry profile not found for this account.',
                ], 404);
            }

            $evaluations = $query
                ->where('industry_id', $industry->id)
                ->get();
        } else {
            return response()->json([
                'message' => 'You are not allowed to access evaluations.',
            ], 403);
        }

        return response()->json([
            'message' => 'Evaluations retrieved successfully.',
            'data' => $evaluations->map(fn (Evaluation $evaluation): array => $this->transformEvaluation($evaluation)),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user || ! in_array($user->role, [User::ROLE_ADMIN, User::ROLE_INDUSTRY], true)) {
            return response()->json([
                'message' => 'Only admin or industry can create evaluations.',
            ], 403);
        }

        $industryRule = $user->role === User::ROLE_ADMIN
            ? ['required', 'integer', 'exists:industries,id']
            : ['nullable', 'integer', 'exists:industries,id'];

        $validated = $request->validate([
            'student_id' => ['required', 'integer', 'exists:students,id'],
            'industry_id' => $industryRule,
            'discipline_score' => ['required', 'integer', 'between:0,100'],
            'teamwork_score' => ['required', 'integer', 'between:0,100'],
            'skill_score' => ['required', 'integer', 'between:0,100'],
            'responsibility_score' => ['required', 'integer', 'between:0,100'],
        ]);

        if ($user->role === User::ROLE_INDUSTRY) {
            $industry = $this->resolveIndustryForUser($user);

            if (! $industry) {
                return response()->json([
                    'message' => 'Industry profile not found for this account.',
                ], 404);
            }

            $validated['industry_id'] = $industry->id;
        }

        $evaluation = Evaluation::create([
            ...$validated,
            'final_score' => $this->calculateFinalScore($validated),
        ])->load(['student.user', 'industry']);

        return response()->json([
            'message' => 'Evaluation created successfully.',
            'data' => $this->transformEvaluation($evaluation),
        ], 201);
    }

    public function update(Request $request, Evaluation $evaluation): JsonResponse
    {
        $user = $request->user();

        if (! $user || ! in_array($user->role, [User::ROLE_ADMIN, User::ROLE_INDUSTRY], true)) {
            return response()->json([
                'message' => 'Only admin or industry can update evaluations.',
            ], 403);
        }

        if ($user->role === User::ROLE_INDUSTRY) {
            $industry = $this->resolveIndustryForUser($user);

            if (! $industry) {
                return response()->json([
                    'message' => 'Industry profile not found for this account.',
                ], 404);
            }

            if ((int) $evaluation->industry_id !== (int) $industry->id) {
                return response()->json([
                    'message' => 'You can only update evaluations from your own industry.',
                ], 403);
            }
        }

        $validated = $request->validate([
            'student_id' => ['sometimes', 'integer', 'exists:students,id'],
            'industry_id' => ['sometimes', 'integer', 'exists:industries,id'],
            'discipline_score' => ['sometimes', 'integer', 'between:0,100'],
            'teamwork_score' => ['sometimes', 'integer', 'between:0,100'],
            'skill_score' => ['sometimes', 'integer', 'between:0,100'],
            'responsibility_score' => ['sometimes', 'integer', 'between:0,100'],
        ]);

        if ($user->role === User::ROLE_INDUSTRY) {
            $validated['industry_id'] = $evaluation->industry_id;
        }

        $effectiveScores = [
            'discipline_score' => $validated['discipline_score'] ?? $evaluation->discipline_score,
            'teamwork_score' => $validated['teamwork_score'] ?? $evaluation->teamwork_score,
            'skill_score' => $validated['skill_score'] ?? $evaluation->skill_score,
            'responsibility_score' => $validated['responsibility_score'] ?? $evaluation->responsibility_score,
        ];

        $evaluation->update([
            ...$validated,
            'final_score' => $this->calculateFinalScore($effectiveScores),
        ]);
        $evaluation->load(['student.user', 'industry']);

        return response()->json([
            'message' => 'Evaluation updated successfully.',
            'data' => $this->transformEvaluation($evaluation),
        ]);
    }

    public function destroy(Request $request, Evaluation $evaluation): JsonResponse
    {
        if ($request->user()?->role !== User::ROLE_ADMIN) {
            return response()->json([
                'message' => 'Only admin can delete evaluations.',
            ], 403);
        }

        $evaluation->delete();

        return response()->json([
            'message' => 'Evaluation deleted successfully.',
        ]);
    }

    private function resolveIndustryForUser(User $user): ?Industry
    {
        return Industry::query()
            ->where('email', $user->email)
            ->first();
    }

    /**
     * @param array<string, mixed> $scores
     */
    private function calculateFinalScore(array $scores): float
    {
        $scoreKeys = [
            'discipline_score',
            'teamwork_score',
            'skill_score',
            'responsibility_score',
        ];

        $total = 0;
        foreach ($scoreKeys as $key) {
            $total += (float) ($scores[$key] ?? 0);
        }

        return round($total / count($scoreKeys), 2);
    }

    /**
     * @return array<string, mixed>
     */
    private function transformEvaluation(Evaluation $evaluation): array
    {
        return [
            'id' => $evaluation->id,
            'student_id' => $evaluation->student_id,
            'student_name' => $evaluation->student?->user?->name,
            'industry_id' => $evaluation->industry_id,
            'industry_name' => $evaluation->industry?->name,
            'discipline_score' => $evaluation->discipline_score,
            'teamwork_score' => $evaluation->teamwork_score,
            'skill_score' => $evaluation->skill_score,
            'responsibility_score' => $evaluation->responsibility_score,
            'final_score' => $evaluation->final_score,
            'created_at' => $evaluation->created_at?->toISOString(),
            'updated_at' => $evaluation->updated_at?->toISOString(),
        ];
    }
}
