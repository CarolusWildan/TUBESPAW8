<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KursiJadwal extends Model
{
    protected $table = 'kursi_jadwal';
    protected $primaryKey = 'id_kursi_jadwal';

    protected $fillable = [
        'id_jadwal',
        'id_kursi',
        'status',
    ];

    public function jadwal()
    {
        return $this->belongsTo(Jadwal::class, 'id_jadwal', 'id_jadwal');
    }

    public function kursi()
    {
        return $this->belongsTo(Kursi::class, 'id_kursi', 'id_kursi');
    }
}
