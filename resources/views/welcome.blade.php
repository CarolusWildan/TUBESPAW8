<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome - TIXIFY</title>
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
        .welcome-card {
            border: none;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            background: rgba(255, 255, 255, 0.95);
        }
        .btn-menu {
            padding: 20px;
            font-size: 1.2rem;
            font-weight: 500;
            transition: all 0.3s ease;
            border-radius: 10px;
        }
        .btn-menu:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
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
                        <a class="nav-link active" href="/">Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="{{ route('users.index') }}">Users</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="{{ route('films.index') }}">Films</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="card welcome-card">
                    <div class="card-body text-center p-5">
                        <div class="mb-4">
                            <i class="fas fa-film fa-4x text-primary mb-3"></i>
                            <h1 class="display-5 fw-bold text-primary">TIXIFY</h1>
                            <p class="text-muted">Movie Management System</p>
                        </div>
                        
                        <div class="d-grid gap-3">
                            <a href="{{ route('users.index') }}" class="btn btn-primary btn-menu">
                                <i class="fas fa-users me-2"></i>
                                Manage Users
                            </a>
                            <a href="{{ route('films.index') }}" class="btn btn-success btn-menu">
                                <i class="fas fa-film me-2"></i>
                                Manage Films
                            </a>
                        </div>

                        <div class="mt-4 pt-3 border-top">
                            <small class="text-muted">Welcome to TIXIFY Management System</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>