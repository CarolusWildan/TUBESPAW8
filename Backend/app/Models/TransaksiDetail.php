<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransaksiDetail extends Model
{
    use HasFactory;

    protected $table = 'transaksidetail';
    protected $primaryKey = 'id_transaksi_detail';
    public $timestamps = true;

    protected $fillable = [
        'id_transaksi',
        'id_tiket',
    ];
}
