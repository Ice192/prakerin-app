<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Industry;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class IndustryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $industries = Industry::query()
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Industries retrieved successfully.',
            'data' => $industries->map(fn (Industry $industry): array => $this->transformIndustry($industry)),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string'],
            'contact_person' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:industries,email'],
        ]);

        $industry = Industry::create($validated);

        return response()->json([
            'message' => 'Industry created successfully.',
            'data' => $this->transformIndustry($industry),
        ], 201);
    }

    public function update(Request $request, Industry $industry): JsonResponse
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'address' => ['sometimes', 'string'],
            'contact_person' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('industries', 'email')->ignore($industry->id)],
        ]);

        $industry->update($validated);

        return response()->json([
            'message' => 'Industry updated successfully.',
            'data' => $this->transformIndustry($industry),
        ]);
    }

    public function destroy(Request $request, Industry $industry): JsonResponse
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $industry->delete();

        return response()->json([
            'message' => 'Industry deleted successfully.',
        ]);
    }

    private function ensureAdmin(Request $request): ?JsonResponse
    {
        if ($request->user()?->role !== User::ROLE_ADMIN) {
            return response()->json([
                'message' => 'Only admin can manage industries.',
            ], 403);
        }

        return null;
    }

    /**
     * @return array<string, mixed>
     */
    private function transformIndustry(Industry $industry): array
    {
        return [
            'id' => $industry->id,
            'name' => $industry->name,
            'address' => $industry->address,
            'contact_person' => $industry->contact_person,
            'email' => $industry->email,
            'created_at' => $industry->created_at?->toISOString(),
            'updated_at' => $industry->updated_at?->toISOString(),
        ];
    }
}
