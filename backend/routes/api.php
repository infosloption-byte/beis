<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DashboardController;

Broadcast::routes(['middleware' => ['auth:sanctum']]);

// Public Auth Routes
Route::post('/login', [AuthController::class, 'login']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']); // Get current user & their role

    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // Dashboard Routes
    Route::get('/dashboard/operations', [DashboardController::class, 'index']); // Admin
    Route::get('/dashboard/employee', [DashboardController::class, 'employee']); // Employee
    Route::get('/dashboard/client', [DashboardController::class, 'client']); // Client
    Route::get('/dashboard/general', [DashboardController::class, 'general']); // Reports

    Route::patch('jobs/{job}/status', [JobController::class, 'updateStatus']);

    // API Resource routes will automatically map index, store, show, update, destroy
    Route::apiResource('properties', PropertyController::class);
    Route::apiResource('jobs', JobController::class);
    Route::apiResource('users', UserController::class);
    
    // Custom endpoints for specific job actions we discussed
    Route::post('/jobs/{job}/status', [JobController::class, 'updateStatus']);
    Route::post('/jobs/{job}/assign', [JobController::class, 'assignTechnician']);

    Route::get('/reports/work-orders', [\App\Http\Controllers\ReportController::class, 'workOrders']);
    Route::get('/reports/technicians', [\App\Http\Controllers\ReportController::class, 'technicians']);
    Route::get('/reports/clients-sites', [\App\Http\Controllers\ReportController::class, 'clientsAndSites']);

    Route::get('/timesheets', [\App\Http\Controllers\TimesheetController::class, 'index']);
});