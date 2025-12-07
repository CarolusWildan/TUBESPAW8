<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kursi extends Model
{
    protected $table = 'kursi';
    protected $primaryKey = 'id_kursi';
    
    protected $fillable = [
        'id_studio',
        'nomor_kursi',
        'status'
    ];

    // Relasi: Kursi dimiliki 1 Studio
    public function studio()
    {
        return $this->belongsTo(Studio::class, 'id_studio', 'id_studio');
    }

    // Relasi: Kursi dipakai banyak tiket
    public function tiket()
    {
        return $this->hasMany(Tiket::class, 'id_kursi', 'id_kursi');
    }
}
