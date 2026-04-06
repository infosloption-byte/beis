<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Job extends Model
{
    use Auditable;

    protected $fillable = [
        'property_id', 'client_id', 'requested_by', 'assigned_to', 'title', 
        'description', 'status', 'priority', 'scheduled_at', 
        'started_at', 'completed_at', 'start_date', 'end_date' // <-- Added new fields
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'start_date' => 'datetime', // <-- Cast to datetime
        'end_date' => 'datetime',   // <-- Cast to datetime
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function technician()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function timeline() 
    {
        return $this->hasMany(JobTimeline::class);
    }

    public function attachments() 
    {
        return $this->morphMany(Attachment::class, 'attachable');
    }
}