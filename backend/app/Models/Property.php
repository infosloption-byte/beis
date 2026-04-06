<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Property extends Model
{
    use Auditable;

    protected $fillable = [
        'client_id', 'name', 'type', 'address', 'city', 'state', // <-- Added 'state' here
        'latitude', 'longitude', 'emergency_info', 
        'access_instructions', 'status',
        'street', 'block_number', 'floor_room', 'postal_code', 
        'google_map_link', 'contact_person', 'contact_number', 'image_path'
    ];

    public function client() {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function jobs() {
        return $this->hasMany(Job::class);
    }

    public function attachments() {
        return $this->morphMany(Attachment::class, 'attachable');
    }
}
