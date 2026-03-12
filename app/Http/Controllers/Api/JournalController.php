<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Journal;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class JournalController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $student = $this->resolveStudent($request);

        if (! $student) {
            return response()->json([
                'message' => 'Only students can create journals.',
            ], 403);
        }

        $validated = $request->validate([
            'date' => ['required', 'date'],
            'activity' => ['required', 'string'],
        ]);

        $journal = Journal::create([
            'student_id' => $student->id,
            'date' => $validated['date'],
            'activity' => $validated['activity'],
            'verification_status' => 'pending',
        ])->load('student.user');

        return response()->json([
            'message' => 'Journal created successfully.',
            'data' => $this->transformJournal($journal),
        ], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $query = Journal::query()
            ->with('student.user')
            ->latest('date')
            ->latest();

        if ($this->isTeacher($request)) {
            $journals = $query->get();

            return response()->json([
                'message' => 'Journals retrieved successfully.',
                'data' => $journals->map(fn (Journal $journal): array => $this->transformJournal($journal)),
            ]);
        }

        $student = $this->resolveStudent($request);

        if (! $student) {
            return response()->json([
                'message' => 'Only students or teachers can view journals.',
            ], 403);
        }

        $journals = $query
            ->where('student_id', $student->id)
            ->get();

        return response()->json([
            'message' => 'Journals retrieved successfully.',
            'data' => $journals->map(fn (Journal $journal): array => $this->transformJournal($journal)),
        ]);
    }

    public function update(Request $request, Journal $journal): JsonResponse
    {
        $student = $this->resolveStudent($request);

        if (! $student) {
            return response()->json([
                'message' => 'Only students can edit journals.',
            ], 403);
        }

        if ((int) $journal->student_id !== (int) $student->id) {
            return response()->json([
                'message' => 'You can only edit your own journals.',
            ], 403);
        }

        $validated = $request->validate([
            'date' => ['required', 'date'],
            'activity' => ['required', 'string'],
        ]);

        $journal->update([
            'date' => $validated['date'],
            'activity' => $validated['activity'],
            'verification_status' => 'pending',
        ]);
        $journal->load('student.user');

        return response()->json([
            'message' => 'Journal updated successfully.',
            'data' => $this->transformJournal($journal),
        ]);
    }

    public function verify(Request $request, Journal $journal): JsonResponse
    {
        if (! $this->isTeacher($request)) {
            return response()->json([
                'message' => 'Only teachers can verify journals.',
            ], 403);
        }

        $validated = $request->validate([
            'verification_status' => ['required', Rule::in(['verified', 'rejected'])],
        ]);

        $journal->update([
            'verification_status' => $validated['verification_status'],
        ]);
        $journal->load('student.user');

        return response()->json([
            'message' => 'Journal verified successfully.',
            'data' => $this->transformJournal($journal),
        ]);
    }

    private function resolveStudent(Request $request): ?Student
    {
        $user = $request->user();

        if (! $user || $user->role !== User::ROLE_STUDENT) {
            return null;
        }

        return $user->student;
    }

    private function isTeacher(Request $request): bool
    {
        $user = $request->user();

        return $user !== null && $user->teacher()->exists();
    }

    /**
     * @return array<string, mixed>
     */
    private function transformJournal(Journal $journal): array
    {
        return [
            'id' => $journal->id,
            'student_id' => $journal->student_id,
            'student_name' => $journal->student?->user?->name,
            'date' => $journal->date?->toDateString(),
            'activity' => $journal->activity,
            'verification_status' => $journal->verification_status,
            'created_at' => $journal->created_at?->toISOString(),
            'updated_at' => $journal->updated_at?->toISOString(),
        ];
    }
}
