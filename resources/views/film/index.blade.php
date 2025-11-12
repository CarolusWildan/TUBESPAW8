<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Films - TIXIFY</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        .navbar-brand {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .logo-icon {
            font-size: 1.8rem;
        }
        body {
            background: linear-gradient(135deg, #ffffff);
            min-height: 100vh;
        }
        .content-card {
            border: none;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            background: rgba(255, 255, 255, 0.95);
        }
        .btn-action {
            border-radius: 8px;
            transition: all 0.3s ease;
        }
        .btn-action:hover {
            transform: translateY(-2px);
        }
        .table th {
            border-top: none;
            background: #f8f9fa;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container">
            <a class="navbar-brand text-primary fw-bold" href="/">
                <i class="fas fa-film logo-icon"></i>
                <span class="fs-3">TIXIFY</span>
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="/">Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="{{ route('users.index') }}">Users</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link active" href="{{ route('films.index') }}">Films</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="container mt-4">
        <div class="card content-card">
            <div class="card-header bg-transparent border-bottom-0 pt-4">
                <div class="d-flex justify-content-between align-items-center">
                    <h2 class="card-title mb-0 text-primary">
                        <i class="fas fa-film me-2"></i>Film Management
                    </h2>
                    <a href="{{ route('films.create') }}" class="btn btn-primary btn-action">
                        <i class="fas fa-plus me-2"></i>Add Film
                    </a>
                </div>
            </div>

            <div class="card-body">
                @if(session('success'))
                    <div class="alert alert-success alert-dismissible fade show" role="alert">
                        <i class="fas fa-check-circle me-2"></i>
                        {{ session('success') }}
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                @endif

                @if(session('error'))
                    <div class="alert alert-danger alert-dismissible fade show" role="alert">
                        <i class="fas fa-exclamation-circle me-2"></i>
                        {{ session('error') }}
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                @endif

                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Judul</th>
                                <th>Genre</th>
                                <th>Durasi</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($films as $film)
                            <tr>
                                <td>{{ $film->id_film }}</td>
                                <td>{{ $film->judul }}</td>
                                <td>{{ $film->genre }}</td>
                                <td>{{ substr($film->durasi_film, 0, 5) }}</td>
                                <td>{{ \Carbon\Carbon::parse($film->start_date)->format('d-m-Y') }}</td>
                                <td>{{ \Carbon\Carbon::parse($film->end_date)->format('d-m-Y') }}</td>
                                <td>
                                    <span class="badge {{ $film->status == 'showing' ? 'bg-success' : 'bg-warning' }}">
                                        {{ $film->status == 'showing' ? 'Showing' : 'Coming Soon' }}
                                    </span>
                                </td>
                                <td>
                                    <div class="btn-group" role="group">
                                        <a href="{{ route('films.edit', $film->id_film) }}" class="btn btn-warning btn-sm btn-action">
                                            <i class="fas fa-edit"></i>
                                        </a>
                                        <form action="{{ route('films.destroy', $film->id_film) }}" method="POST" style="display: inline-block;">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="btn btn-danger btn-sm btn-action" onclick="return confirm('Are you sure you want to delete {{ $film->judul }}?')">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>