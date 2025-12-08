<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Film extends Model
{
    use HasFactory;

    protected $primaryKey = "id_film";
    protected $table = 'film';

    protected $fillable = [
        'judul',
        'genre',
        'durasi_film',
        'start_date',
        'end_date',
        'status',
        'cover_path',
    ];

    public function jadwal()
    {
        return $this->hasMany(Jadwal::class, 'id_film', 'id_film');
    }

}
