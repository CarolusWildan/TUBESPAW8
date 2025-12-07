<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;

use Illuminate\Database\Eloquent\Model;

class Tiket extends Model
{
    protected $table = 'tiket';
    protected $primaryKey = 'id_tiket';

    protected $fillable = [
        'id_transaksi',
        'id_film',
        'id_user',
        'id_kursi',
        'id_jadwal',
        'tanggal_pemesanan',
        'jumlah_tiket',
        'harga_tiket'
    ];

    public function transaksi()
    {
        return $this->belongsTo(Transaksi::class, 'id_transaksi', 'id_transaksi');
    }

    public function jadwal()
    {
        return $this->belongsTo(Jadwal::class, 'id_jadwal', 'id_jadwal');
    }

    public function film() //nambahin relasi dari tiket ke film
    {
        return $this->belongsTo(Film::class, 'id_film', 'id_film');
    }


}
