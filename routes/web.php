<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\FormController;
use App\Http\Controllers\PublicFormController;
use App\Http\Controllers\ProfileController;

Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [LoginController::class, 'login'])->name('login.post');
    Route::get('/forgot-password', [PasswordResetController::class, 'showLinkRequestForm'])->name('password.request');
    Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLinkEmail'])->name('password.email');
    Route::get('/reset-password/{token}', [PasswordResetController::class, 'showResetForm'])->name('password.reset');
    Route::post('/reset-password', [PasswordResetController::class, 'reset'])->name('password.update');
});

Route::prefix('public/form')->name('public.')->group(function () {
    Route::get('/{token}', [PublicFormController::class, 'show'])->name('form.show');
    Route::post('/{token}/submit', [PublicFormController::class, 'submit'])->name('form.submit');
    Route::get('/{token}/validate', [PublicFormController::class, 'validateLink'])->name('form.validate');
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [LogoutController::class, 'logout'])->name('logout');
    Route::post('/switch-role', [UserController::class, 'switchRole'])->name('switch-role');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('/dashboard/filtered-stats', [DashboardController::class, 'getFilteredStats'])->name('dashboard.filtered-stats');
    Route::get('/', fn() => redirect()->route('dashboard'));

    Route::middleware('role:manager')->prefix('users')->name('users.')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('index');
        Route::get('/create', [UserController::class, 'create'])->name('create');
        Route::post('/', [UserController::class, 'store'])->name('store');
        Route::get('/{user}/edit', [UserController::class, 'edit'])->name('edit');
        Route::put('/{user}', [UserController::class, 'update'])->name('update');
        Route::delete('/{user}', [UserController::class, 'destroy'])->name('destroy');
        Route::post('/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('toggle-status');
        Route::post('/{user}/reset-password', [UserController::class, 'resetPassword'])->name('reset-password');
        Route::get('/generate-password', [UserController::class, 'generatePassword'])->name('generate-password');
        Route::post('/check-email', [UserController::class, 'checkEmail'])->name('check-email');
    });

    Route::prefix('forms')->name('forms.')->group(function () {
        Route::get('/', [FormController::class, 'index'])->name('index');
        Route::get('/create', [FormController::class, 'create'])->name('create');
        Route::post('/', [FormController::class, 'store'])->name('store');
        Route::get('/{insuranceRequest}', [FormController::class, 'show'])->name('show');
        Route::get('/{insuranceRequest}/edit', [FormController::class, 'edit'])->name('edit');
        Route::put('/{insuranceRequest}', [FormController::class, 'update'])->name('update');
        Route::delete('/{insuranceRequest}', [FormController::class, 'destroy'])->name('destroy');
        Route::post('/{insuranceRequest}/publish', [FormController::class, 'publish'])->name('publish');
        Route::post('/{insuranceRequest}/unpublish', [FormController::class, 'unpublish'])->name('unpublish');
        Route::post('/{insuranceRequest}/archive', [FormController::class, 'archive'])->name('archive');
        Route::get('/{insuranceRequest}/public-link', [FormController::class, 'getPublicLink'])->name('public-link');
        Route::post('/{insuranceRequest}/participants', [FormController::class, 'addParticipant'])->name('participants.store');
        Route::delete('/participants/{participant}', [FormController::class, 'deleteParticipant'])->name('participants.destroy');
        Route::get('/{insuranceRequest}/export', [FormController::class, 'exportExcel'])->name('export');
        Route::post('/{insuranceRequest}/generate-eml', [FormController::class, 'generateEml'])->name('generate-eml');
        Route::get('/{insuranceRequest}/download-eml', [FormController::class, 'downloadEml'])->name('download-eml');
    });

    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/', [ProfileController::class, 'edit'])->name('edit');
        Route::put('/', [ProfileController::class, 'update'])->name('update');
        Route::put('/password', [ProfileController::class, 'updatePassword'])->name('password.update');
    });
});
