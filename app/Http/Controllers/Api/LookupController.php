<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Industry;
use App\Models\Student;
use App\Models\Teacher;
use Illuminate\Http\JsonResponse;

class LookupController extends Controller
{
    public function index(): JsonResponse
    {
        $students = Student::query()
            ->with('user')
            ->orderBy('id')
            ->get()
            ->map(fn (Student $student): array => [
                'id' => $student->id,
                'name' => $student->user?->name,
                'nis' => $student->nis,
                'class' => $student->class,
                'major' => $student->major,
            ]);

        $industries = Industry::query()
            ->orderBy('name')
            ->get()
            ->map(fn (Industry $industry): array => [
                'id' => $industry->id,
                'name' => $industry->name,
                'email' => $industry->email,
            ]);

        $teachers = Teacher::query()
            ->with('user')
            ->orderBy('id')
            ->get()
            ->map(fn (Teacher $teacher): array => [
                'id' => $teacher->id,
                'name' => $teacher->user?->name,
                'position' => $teacher->position,
            ]);

        return response()->json([
            'message' => 'Lookup data retrieved successfully.',
            'data' => [
                'students' => $students,
                'industries' => $industries,
                'teachers' => $teachers,
                'placement_statuses' => ['assigned', 'active', 'completed', 'cancelled'],
                'journal_statuses' => ['pending', 'verified', 'rejected'],
            ],
        ]);
    }
}
