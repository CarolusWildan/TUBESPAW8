<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Jadwal extends Model
{
    protected $table = 'jadwal';
    protected $primaryKey = 'id_jadwal';

    protected $fillable = [
        'id_film',
        'id_studio',
        'tanggal_tayang',
        'jam_tayang',
        'harga',
    ];

    public function film()
    {
        return $this->belongsTo(Film::class, 'id_film', 'id_film');
    }

    public function studio()
    {
        return $this->belongsTo(Studio::class, 'id_studio', 'id_studio');
    }

    public function tiket()
    {
        return $this->hasMany(Tiket::class, 'id_jadwal', 'id_jadwal');
    }

    public function kursiJadwal()
    {
        return $this->hasMany(KursiJadwal::class, 'id_jadwal', 'id_jadwal');
    }

    
}
