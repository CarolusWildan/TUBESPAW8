<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tiket', function (Blueprint $table) {
            $table->id('id_tiket');

            $table->unsignedBigInteger('id_transaksi');
            $table->unsignedBigInteger('id_kursi');

            $table->timestamps();

            $table->foreign('id_transaksi')
                ->references('id_transaksi')
                ->on('transaksi')
                ->onDelete('cascade');

            $table->foreign('id_kursi')
                ->references('id_kursi')
                ->on('kursi')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tiket');
    }
};
