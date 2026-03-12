<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Validation\Rule;

class AnnouncementController extends Controller
{
    public function store(Request $request, NotificationService $notificationService): JsonResponse
    {
        if ($request->user()?->role !== User::ROLE_ADMIN) {
            return response()->json([
                'message' => 'Only admin can send important announcements.',
            ], 403);
        }

        $validated = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
            'audience' => ['nullable', Rule::in(['all', 'students', 'teachers', 'admins'])],
        ]);

        $audience = $validated['audience'] ?? 'all';
        $users = $this->resolveAudienceUsers($audience);
        $sentCount = $notificationService->sendImportantAnnouncement(
            $users,
            $validated['subject'],
            $validated['message'],
        );

        return response()->json([
            'message' => 'Important announcement has been sent.',
            'data' => [
                'audience' => $audience,
                'recipient_count' => $users->count(),
                'sent_count' => $sentCount,
            ],
        ]);
    }

    /**
     * @return Collection<int, User>
     */
    private function resolveAudienceUsers(string $audience): Collection
    {
        return match ($audience) {
            'students' => User::query()
                ->where('role', User::ROLE_STUDENT)
                ->get(),
            'teachers' => User::query()
                ->whereHas('teacher')
                ->get(),
            'admins' => User::query()
                ->where('role', User::ROLE_ADMIN)
                ->get(),
            default => User::query()->get(),
        };
    }
}
