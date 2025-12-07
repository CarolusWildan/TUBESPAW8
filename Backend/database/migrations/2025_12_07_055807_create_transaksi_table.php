<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transaksi', function (Blueprint $table) {
            $table->id('id_transaksi');

            $table->unsignedBigInteger('id_user');
            $table->unsignedBigInteger('id_film');
            $table->unsignedBigInteger('id_jadwal');

            $table->integer('jumlah_tiket');
            $table->integer('total_harga');
            $table->enum('metode', ['cash', 'qris', 'transfer']);
            $table->timestamps();

            $table->foreign('id_user')
                ->references('id_user')
                ->on('users')
                ->onDelete('cascade');

            $table->foreign('id_film')
                ->references('id_film')
                ->on('film')
                ->onDelete('cascade');

            $table->foreign('id_jadwal')
                ->references('id_jadwal')
                ->on('jadwal')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaksi');
    }
};
