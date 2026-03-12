<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PlacementController;

Route::prefix('auth')->group(function (): void {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', function (Request $request) {
            return response()->json([
                'data' => $request->user(),
            ]);
        });
    });
});

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/placements', [PlacementController::class, 'index']);
    Route::post('/placements', [PlacementController::class, 'store']);
    Route::put('/placements/{placement}', [PlacementController::class, 'update']);
    Route::delete('/placements/{placement}', [PlacementController::class, 'destroy']);
});
