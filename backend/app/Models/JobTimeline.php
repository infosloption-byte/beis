<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobTimeline extends Model
{
    use HasFactory;

    // 1. Tell Laravel these columns are safe to auto-fill
    protected $fillable = [
        'job_id',
        'user_id',
        'action_type',
        'description',
        'recorded_latitude',
        'recorded_longitude',
    ];

    // 2. Define the relationship back to the Job
    public function job()
    {
        return $this->belongsTo(Job::class);
    }

    // 3. Define the relationship to the User who made the change
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}