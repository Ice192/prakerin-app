<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InternshipPlacement;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class PlacementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $placements = InternshipPlacement::query()
            ->with(['student.user', 'industry', 'teacher.user'])
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Placements retrieved successfully.',
            'data' => $placements->map(fn (InternshipPlacement $placement): array => $this->transformPlacement($placement)),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $validated = $request->validate([
            'student_id' => ['required', 'integer', 'exists:students,id'],
            'industry_id' => ['required', 'integer', 'exists:industries,id'],
            'teacher_id' => ['required', 'integer', 'exists:teachers,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'status' => ['nullable', 'string', 'max:100'],
        ]);

        $placement = InternshipPlacement::create([
            ...$validated,
            'status' => $validated['status'] ?? 'assigned',
        ])->load(['student.user', 'industry', 'teacher.user']);

        return response()->json([
            'message' => 'Placement created successfully.',
            'data' => $this->transformPlacement($placement),
        ], 201);
    }

    public function update(Request $request, InternshipPlacement $placement): JsonResponse
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $validated = $request->validate([
            'student_id' => ['sometimes', 'integer', 'exists:students,id'],
            'industry_id' => ['sometimes', 'integer', 'exists:industries,id'],
            'teacher_id' => ['sometimes', 'integer', 'exists:teachers,id'],
            'start_date' => ['sometimes', 'date'],
            'end_date' => ['sometimes', 'date'],
            'status' => ['sometimes', 'string', 'max:100'],
        ]);

        $effectiveStartDate = $validated['start_date'] ?? $placement->start_date?->toDateString();
        $effectiveEndDate = $validated['end_date'] ?? $placement->end_date?->toDateString();

        if ($effectiveStartDate && $effectiveEndDate) {
            $startDate = Carbon::parse($effectiveStartDate);
            $endDate = Carbon::parse($effectiveEndDate);

            if ($endDate->lt($startDate)) {
                return response()->json([
                    'message' => 'The given data was invalid.',
                    'errors' => [
                        'end_date' => ['The end date must be a date after or equal to start date.'],
                    ],
                ], 422);
            }
        }

        $placement->update($validated);
        $placement->load(['student.user', 'industry', 'teacher.user']);

        return response()->json([
            'message' => 'Placement updated successfully.',
            'data' => $this->transformPlacement($placement),
        ]);
    }

    public function destroy(Request $request, InternshipPlacement $placement): JsonResponse
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $placement->delete();

        return response()->json([
            'message' => 'Placement deleted successfully.',
        ]);
    }

    private function ensureAdmin(Request $request): ?JsonResponse
    {
        if ($request->user()?->role !== User::ROLE_ADMIN) {
            return response()->json([
                'message' => 'Only admin can manage placements.',
            ], 403);
        }

        return null;
    }

    /**
     * @return array<string, mixed>
     */
    private function transformPlacement(InternshipPlacement $placement): array
    {
        return [
            'id' => $placement->id,
            'student_id' => $placement->student_id,
            'student_name' => $placement->student?->user?->name,
            'industry_id' => $placement->industry_id,
            'industry_name' => $placement->industry?->name,
            'teacher_id' => $placement->teacher_id,
            'supervising_teacher' => $placement->teacher?->user?->name,
            'internship_start_date' => $placement->start_date?->toDateString(),
            'internship_end_date' => $placement->end_date?->toDateString(),
            'status' => $placement->status,
            'created_at' => $placement->created_at?->toISOString(),
            'updated_at' => $placement->updated_at?->toISOString(),
        ];
    }
}
