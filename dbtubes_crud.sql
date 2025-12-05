-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 02 Des 2025 pada 02.15
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dbtubes_crud`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `film`
--

CREATE TABLE `film` (
  `id_film` bigint(20) UNSIGNED NOT NULL,
  `judul` varchar(255) NOT NULL,
  `genre` varchar(255) NOT NULL,
  `durasi_film` time NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('coming soon','showing') NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `film`
--

INSERT INTO `film` (`id_film`, `judul`, `genre`, `durasi_film`, `start_date`, `end_date`, `status`, `created_at`, `updated_at`) VALUES
(13, 'Conjuring 2', 'Horror', '01:30:04', '2025-12-02', '2025-12-06', 'showing', '2025-12-01 16:57:54', '2025-12-01 17:04:14'),
(15, 'Avengers', 'Action', '01:30:00', '2025-12-03', '2025-12-15', 'coming soon', '2025-12-01 17:03:34', '2025-12-01 17:03:34'),
(16, 'Ipar Adalah Maut', 'Horror', '01:40:00', '2025-12-04', '2025-12-23', 'coming soon', '2025-12-01 17:05:47', '2025-12-01 17:05:47'),
(17, 'Agak Laen 2', 'Comedy', '02:30:00', '2025-12-02', '2025-12-10', 'showing', '2025-12-01 17:24:24', '2025-12-01 17:24:24');

-- --------------------------------------------------------

--
-- Struktur dari tabel `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000001_create_cache_table', 1),
(2, '0001_01_01_000002_create_jobs_table', 1),
(3, '2025_11_08_162512_create_personal_access_tokens_table', 1),
(4, '2025_11_08_163332_create_film_table', 1),
(5, '2025_11_08_163433_create_users_table', 1);

-- --------------------------------------------------------

--
-- Struktur dari tabel `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\User', 1, 'Personal Access Token', 'e10bba22550f077f5e422c889d3cb1e7cbc33caffe77f23140d1192515631681', '[\"*\"]', '2025-11-09 03:03:13', NULL, '2025-11-09 02:24:12', '2025-11-09 03:03:13'),
(2, 'App\\Models\\User', 3, 'Personal Access Token', '9e97b71213efb9d4a7754ae209c7913ef87f14a0714a59b4857256510d90ba92', '[\"*\"]', '2025-11-12 07:24:34', NULL, '2025-11-12 06:56:14', '2025-11-12 07:24:34'),
(3, 'App\\Models\\User', 4, 'Personal Access Token', '2d425b0f2d7bee622f034063427260ef9b3bbf3400d30f53fea5d17d01a979d0', '[\"*\"]', '2025-11-12 08:12:16', NULL, '2025-11-12 08:00:59', '2025-11-12 08:12:16'),
(4, 'App\\Models\\User', 5, 'Personal Access Token', '68bfbc34b5416454c735f36bc3de5fa2e156be104ce14bb40332832fa0ccb13f', '[\"*\"]', '2025-11-12 08:26:31', NULL, '2025-11-12 08:19:53', '2025-11-12 08:26:31'),
(5, 'App\\Models\\User', 6, 'Personal Access Token', '7ebd08a51003fad3537c5efda538595517f299ea896c810461071d45d3ddb600', '[\"*\"]', '2025-11-12 08:29:27', NULL, '2025-11-12 08:28:40', '2025-11-12 08:29:27'),
(6, 'App\\Models\\User', 7, 'Personal Access Token', '8b04f549e865fddb87a236c012fedc83846cf043e7a60b2293559f87cfaaa088', '[\"*\"]', '2025-11-12 08:30:41', NULL, '2025-11-12 08:30:29', '2025-11-12 08:30:41'),
(7, 'App\\Models\\User', 7, 'Personal Access Token', 'dd45c08469a3d9e98d4914cf67dd077c313988c6ac6e2880a756ead0ca7d4583', '[\"*\"]', '2025-11-12 08:32:52', NULL, '2025-11-12 08:31:18', '2025-11-12 08:32:52'),
(8, 'App\\Models\\User', 8, 'Personal Access Token', '5e7a88d6b0fd9b2c1a88c6424345dee0f09aee2b20d1604f515138748f5b4d2c', '[\"*\"]', NULL, NULL, '2025-11-27 22:03:58', '2025-11-27 22:03:58'),
(9, 'App\\Models\\User', 8, 'Personal Access Token', 'c4182df1e67cbdec29046acd38f4dbdd593964fb757fe945058cd2ccc513f9d1', '[\"*\"]', NULL, NULL, '2025-11-27 22:05:23', '2025-11-27 22:05:23'),
(10, 'App\\Models\\User', 9, 'Personal Access Token', '53401cb6174a164046c75be5eb76a4b9f3d2da9cec5f8a1efc3cd336d64bf7b0', '[\"*\"]', NULL, NULL, '2025-11-27 22:06:39', '2025-11-27 22:06:39'),
(11, 'App\\Models\\User', 10, 'Personal Access Token', '11e2d885aa6516bf5f0825269cf41284069103469bb8f4560788272436c08c99', '[\"*\"]', NULL, NULL, '2025-11-27 22:18:14', '2025-11-27 22:18:14'),
(12, 'App\\Models\\User', 10, 'Personal Access Token', 'c7204546d2bd89d579225cc9cf71f124db8ba954d00ee581fe740f88808f9f84', '[\"*\"]', NULL, NULL, '2025-11-27 22:20:21', '2025-11-27 22:20:21'),
(13, 'App\\Models\\User', 11, 'Personal Access Token', '71f04099ded950f01a03c97ca352b9388a52b614a260866b5ba36cf8fcce2987', '[\"*\"]', NULL, NULL, '2025-11-29 12:07:52', '2025-11-29 12:07:52'),
(14, 'App\\Models\\User', 12, 'Personal Access Token', '479b01af6580633c045ae590f8fc68495c294a125730ff200dd009f1877c3767', '[\"*\"]', NULL, NULL, '2025-11-29 12:31:20', '2025-11-29 12:31:20'),
(15, 'App\\Models\\User', 13, 'Personal Access Token', '0ef49ee9c5fe5719a538c7717cd773a827dfdec869f89d920426820b9b466eeb', '[\"*\"]', NULL, NULL, '2025-11-29 12:33:47', '2025-11-29 12:33:47'),
(16, 'App\\Models\\User', 12, 'Personal Access Token', '2dba10ce6deb72ed754ce37fd6e068e9739d86918a7fe835f3ca140c22857ac7', '[\"*\"]', NULL, NULL, '2025-11-29 12:42:52', '2025-11-29 12:42:52'),
(17, 'App\\Models\\User', 13, 'Personal Access Token', '92f5009c1001aaad73d12949a117805a3ed35aa91ce84ff8205fdbecf35b3d30', '[\"*\"]', '2025-11-29 13:57:17', NULL, '2025-11-29 12:43:21', '2025-11-29 13:57:17'),
(18, 'App\\Models\\User', 14, 'Personal Access Token', '265a9a3d90a8d16ac5dff381729d8cdd7c56c932904b1b804fb2d83b32b7dfed', '[\"*\"]', NULL, NULL, '2025-11-30 14:04:12', '2025-11-30 14:04:12'),
(19, 'App\\Models\\User', 15, 'Personal Access Token', 'c9bbb035a96627525f35e94c05eb02daca13c0731441be0c910a269d6e7462ca', '[\"*\"]', NULL, NULL, '2025-11-30 14:08:06', '2025-11-30 14:08:06'),
(20, 'App\\Models\\User', 16, 'Personal Access Token', '8be025e5d31966f6c43bead494045f8746153213383ca527564d7c37824388a8', '[\"*\"]', NULL, NULL, '2025-12-01 05:58:32', '2025-12-01 05:58:32'),
(21, 'App\\Models\\User', 16, 'Personal Access Token', '06014e4b1bea9f3918ecf9fe206b543cdc8a34b4a36c873fbd5cd51cabbbc098', '[\"*\"]', '2025-12-01 09:12:22', NULL, '2025-12-01 06:45:13', '2025-12-01 09:12:22'),
(22, 'App\\Models\\User', 16, 'Personal Access Token', 'cbe66694c91211060130e3b2f386d725b7729d2119e02c73c4235e1467f27525', '[\"*\"]', '2025-12-01 12:00:17', NULL, '2025-12-01 11:09:41', '2025-12-01 12:00:17'),
(23, 'App\\Models\\User', 16, 'Personal Access Token', '0a0e9853e7f0a07edd75fb2f11f6b0c4cb9e36a8d643fc39ce7f70b52b1a0b19', '[\"*\"]', NULL, NULL, '2025-12-01 12:15:00', '2025-12-01 12:15:00'),
(24, 'App\\Models\\User', 17, 'Personal Access Token', '641c04b5be4e0666e5d07678c4c64ad365b0a55c740fdf6487ce76e5e362fe17', '[\"*\"]', NULL, NULL, '2025-12-01 12:17:18', '2025-12-01 12:17:18'),
(25, 'App\\Models\\User', 17, 'Personal Access Token', '3bc83e97e637e264566623a60271da6f0652a0221c0f6c101c74d493e6e1b701', '[\"*\"]', NULL, NULL, '2025-12-01 12:18:36', '2025-12-01 12:18:36'),
(26, 'App\\Models\\User', 17, 'Personal Access Token', 'bcce5af36ab5b9d511d3ad2cf2824489601048b97dfebec4588bc177a69d8e9f', '[\"*\"]', NULL, NULL, '2025-12-01 12:23:26', '2025-12-01 12:23:26'),
(27, 'App\\Models\\User', 17, 'Personal Access Token', 'dd6427f816bbf5e4024a170c826b82d60c0ddd05756a2d83f90ede5cb4326578', '[\"*\"]', NULL, NULL, '2025-12-01 12:27:59', '2025-12-01 12:27:59'),
(28, 'App\\Models\\User', 17, 'Personal Access Token', '021f9634cbff8ba5de269307653c3328344437f41ccfd9302887c0235b715dd0', '[\"*\"]', NULL, NULL, '2025-12-01 12:29:01', '2025-12-01 12:29:01'),
(29, 'App\\Models\\User', 16, 'Personal Access Token', '884ddc4a9b287495292c03934169d7dc692fb58ecd713b1581031c24fd3551f8', '[\"*\"]', NULL, NULL, '2025-12-01 12:29:26', '2025-12-01 12:29:26'),
(30, 'App\\Models\\User', 16, 'Personal Access Token', 'd824169026ed86d67ffac2b882d4f187c6ae915d8c65ff63dbad45728d0e1548', '[\"*\"]', NULL, NULL, '2025-12-01 12:41:06', '2025-12-01 12:41:06'),
(31, 'App\\Models\\User', 16, 'Personal Access Token', 'b4b32cc9fda7bd1e84ddd08c510c41d23e565a6f4a3b219e5f57e5287b79b135', '[\"*\"]', '2025-12-01 17:08:26', NULL, '2025-12-01 12:41:45', '2025-12-01 17:08:26'),
(32, 'App\\Models\\User', 16, 'Personal Access Token', '1fab59e6c7085cdebfc2a3068067e3f2a9f162fc4f59d64fe516c8f1a1821215', '[\"*\"]', '2025-12-01 17:44:49', NULL, '2025-12-01 17:09:07', '2025-12-01 17:44:49');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id_user` bigint(20) UNSIGNED NOT NULL,
  `nama` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','user') NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id_user`, `nama`, `email`, `password`, `role`, `created_at`, `updated_at`) VALUES
(16, 'dinar', 'dinar@gmail.com', '$2y$12$p3MFPpJE6rg6LclqiXO1F.j9W2UjPivzyF6H9TkTFlasdwNB8QSE6', 'admin', '2025-12-01 05:58:21', '2025-12-01 05:58:21'),
(17, 'ezra', 'ezra@gmail.com', '$2y$12$RbgVPF/R/vsWYacd4.hX1uyDQM5icbihFzHrtLlJE4Sv1DZ/OjBgS', 'user', '2025-12-01 12:17:04', '2025-12-01 12:17:04');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indeks untuk tabel `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indeks untuk tabel `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indeks untuk tabel `film`
--
ALTER TABLE `film`
  ADD PRIMARY KEY (`id_film`);

--
-- Indeks untuk tabel `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indeks untuk tabel `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_user`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `film`
--
ALTER TABLE `film`
  MODIFY `id_film` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT untuk tabel `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id_user` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
