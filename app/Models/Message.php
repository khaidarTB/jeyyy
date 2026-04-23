<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = ['text', 'stickers', 'color'];
    
    protected $casts = [
        'stickers' => 'json',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
