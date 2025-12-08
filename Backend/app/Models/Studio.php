<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Studio extends Model
{
    use HasFactory;

    protected $primaryKey = "id_studio";
    protected $table = 'studio';

    protected $fillable = [
        'nomor_studio',
        'kapasitas',
        'tipe',
    ];

    public function kursi()
    {
        return $this->hasMany(Kursi::class, 'id_studio', 'id_studio');
    }

    public function jadwal()
    {
        return $this->hasMany(Jadwal::class, 'id_studio', 'id_studio');
    }
}
