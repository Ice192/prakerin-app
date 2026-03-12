<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EvaluationController;
use App\Http\Controllers\Api\IndustryController;
use App\Http\Controllers\Api\JournalController;
use App\Http\Controllers\Api\LookupController;
use App\Http\Controllers\Api\PlacementController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\StudentController;

Route::prefix('auth')->group(function (): void {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
    });
});

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/lookups', [LookupController::class, 'index']);

    Route::apiResource('students', StudentController::class)->except(['show']);
    Route::apiResource('industries', IndustryController::class)->except(['show']);
    Route::apiResource('evaluations', EvaluationController::class)->except(['show']);
    Route::get('/reports', [ReportController::class, 'index']);

    Route::get('/placements', [PlacementController::class, 'index']);
    Route::post('/placements', [PlacementController::class, 'store']);
    Route::put('/placements/{placement}', [PlacementController::class, 'update']);
    Route::delete('/placements/{placement}', [PlacementController::class, 'destroy']);
    Route::post('/announcements/important', [AnnouncementController::class, 'store']);

    Route::post('/journals', [JournalController::class, 'store']);
    Route::get('/journals', [JournalController::class, 'index']);
    Route::put('/journals/{journal}', [JournalController::class, 'update']);
    Route::patch('/journals/{journal}/verify', [JournalController::class, 'verify']);
});
