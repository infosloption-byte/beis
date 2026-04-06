<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Laravel\Sanctum\HasApiTokens;
use App\Traits\Auditable;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles, Auditable;

    protected $fillable = [
        'name', 'email', 'password', 'phone', 'is_active',
        'employee_number', 'passport_number', 'profession', 'skills', 'avatar_path'
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'skills' => 'array', // Automatically handles JSON conversion
            'is_active' => 'boolean'
        ];
    }

    // --- ADDED MISSING RELATIONSHIPS ---

    /**
     * Relationship for Employees/Technicians 
     * (Matches the 'assigned_to' column in jobs table)
     */
    public function jobs()
    {
        return $this->hasMany(Job::class, 'assigned_to');
    }

    /**
     * Relationship for Clients 
     * (Matches the 'client_id' column in jobs table)
     */
    public function clientJobs()
    {
        return $this->hasMany(Job::class, 'client_id');
    }

    /**
     * Relationship for Clients
     * (Matches the 'client_id' column in properties table)
     */
    public function properties()
    {
        return $this->hasMany(Property::class, 'client_id');
    }
}