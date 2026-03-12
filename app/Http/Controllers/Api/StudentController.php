<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class StudentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $students = Student::query()
            ->with('user')
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Students retrieved successfully.',
            'data' => $students->map(fn (Student $student): array => $this->transformStudent($student)),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'nis' => ['required', 'string', 'max:255', 'unique:students,nis'],
            'class' => ['required', 'string', 'max:255'],
            'major' => ['required', 'string', 'max:255'],
        ]);

        $student = DB::transaction(function () use ($validated): Student {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => $validated['password'],
                'role' => User::ROLE_STUDENT,
            ]);

            return Student::create([
                'user_id' => $user->id,
                'nis' => $validated['nis'],
                'class' => $validated['class'],
                'major' => $validated['major'],
            ]);
        });

        $student->load('user');

        return response()->json([
            'message' => 'Student created successfully.',
            'data' => $this->transformStudent($student),
        ], 201);
    }

    public function update(Request $request, Student $student): JsonResponse
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($student->user_id),
            ],
            'password' => ['nullable', 'string', 'min:8'],
            'nis' => ['sometimes', 'string', 'max:255', Rule::unique('students', 'nis')->ignore($student->id)],
            'class' => ['sometimes', 'string', 'max:255'],
            'major' => ['sometimes', 'string', 'max:255'],
        ]);

        DB::transaction(function () use ($student, $validated): void {
            $userPayload = array_filter([
                'name' => $validated['name'] ?? null,
                'email' => $validated['email'] ?? null,
                'password' => $validated['password'] ?? null,
            ], fn ($value): bool => $value !== null && $value !== '');

            if ($userPayload !== []) {
                $student->user()->update($userPayload);
            }

            $studentPayload = array_filter([
                'nis' => $validated['nis'] ?? null,
                'class' => $validated['class'] ?? null,
                'major' => $validated['major'] ?? null,
            ], fn ($value): bool => $value !== null);

            if ($studentPayload !== []) {
                $student->update($studentPayload);
            }
        });

        $student->load('user');

        return response()->json([
            'message' => 'Student updated successfully.',
            'data' => $this->transformStudent($student),
        ]);
    }

    public function destroy(Request $request, Student $student): JsonResponse
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        DB::transaction(function () use ($student): void {
            if ($student->user()->exists()) {
                $student->user()->delete();

                return;
            }

            $student->delete();
        });

        return response()->json([
            'message' => 'Student deleted successfully.',
        ]);
    }

    private function ensureAdmin(Request $request): ?JsonResponse
    {
        if ($request->user()?->role !== User::ROLE_ADMIN) {
            return response()->json([
                'message' => 'Only admin can manage students.',
            ], 403);
        }

        return null;
    }

    /**
     * @return array<string, mixed>
     */
    private function transformStudent(Student $student): array
    {
        return [
            'id' => $student->id,
            'user_id' => $student->user_id,
            'name' => $student->user?->name,
            'email' => $student->user?->email,
            'nis' => $student->nis,
            'class' => $student->class,
            'major' => $student->major,
            'created_at' => $student->created_at?->toISOString(),
            'updated_at' => $student->updated_at?->toISOString(),
        ];
    }
}
