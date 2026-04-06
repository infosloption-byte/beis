<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Attachment extends Model
{
    use Auditable;

    protected $fillable = ['attachable_id', 'attachable_type', 'file_path', 'file_name', 'mime_type'];

    public function attachable()
    {
        return $this->morphTo();
    }
}