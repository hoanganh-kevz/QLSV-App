# 👨‍💻 Developer Guide — StudentManagement

## Cấu trúc dự án

```
StudentManagement/
├── StudentManagement.API/               # Entry point
│   ├── Controllers/                     # API Controllers
│   ├── Configuration/                   # Serilog, HealthCheck, CORS, etc.
│   ├── Middleware/                       # JWT, Error handling
│   ├── Swagger/                         # Swagger config & examples
│   ├── Validation/                      # FluentValidation validators
│   └── Program.cs                       # App startup
│
├── StudentManagement.Core/             # Domain layer (no dependencies)
│   ├── Entities/                        # Domain entities (Student, Teacher, etc.)
│   ├── Enums/                           # Gender, StudentStatus, AccountRole
│   ├── DTOs/                            # Data Transfer Objects
│   └── Interfaces/                      # Repository & Service interfaces
│       ├── Repositories/                # IGenericRepository, IUnitOfWork
│       └── Services/                    # IStudentService, IGradeService, etc.
│
├── StudentManagement.Infrastructure/    # Data access
│   ├── Data/                            # AppDbContext, SeedData, Migrations
│   ├── Repositories/                    # GenericRepository, UnitOfWork
│   └── Configurations/                  # Fluent API entity configs
│
├── StudentManagement.Services/          # Business logic
│   ├── Services/                        # Service implementations
│   ├── Mappings/                        # AutoMapper profiles
│   └── Helpers/                         # JwtHelper, etc.
│
└── StudentManagement.Tests/             # Unit tests
    ├── Tests/                           # Test classes
    └── TestHelpers/                     # Mock setup, async helpers
```

## Coding Conventions

### Naming
- **Classes/Interfaces**: PascalCase (`StudentService`, `IUnitOfWork`)
- **Methods**: PascalCase async (`GetByIdAsync`, `CreateAsync`)
- **Variables**: camelCase (`studentId`, `totalCount`)
- **Constants**: PascalCase (`MaxPageSize`)

### Patterns
- **Repository + Unit of Work**: Tất cả data access qua `IUnitOfWork.Repository<T>()`
- **Service Layer**: Business logic trong `Services/`, không đặt trong Controller
- **DTOs**: Tách biệt với Entity, dùng AutoMapper
- **Dependency Injection**: Đăng ký trong `Program.cs`

## Thêm Feature mới

### 1. Tạo Entity
```csharp
// StudentManagement.Core/Entities/NewEntity.cs
public class NewEntity
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    // properties...
}
```

### 2. Tạo DTOs
```csharp
// StudentManagement.Core/DTOs/NewEntity/NewEntityDto.cs
public class NewEntityDto { ... }
public class CreateNewEntityDto { ... }
```

### 3. Tạo Service Interface + Implementation
```csharp
// Core/Interfaces/Services/INewEntityService.cs
public interface INewEntityService { ... }

// Services/Services/NewEntityService.cs
public class NewEntityService : INewEntityService { ... }
```

### 4. Tạo Controller
```csharp
// API/Controllers/NewEntitiesController.cs
[Route("api/[controller]")]
[ApiController]
public class NewEntitiesController : ControllerBase { ... }
```

### 5. Đăng ký DI
```csharp
// Program.cs
builder.Services.AddScoped<INewEntityService, NewEntityService>();
```

### 6. Thêm AutoMapper mapping
```csharp
// Services/Mappings/MappingProfile.cs
CreateMap<NewEntity, NewEntityDto>();
```

## Chạy Tests
```bash
dotnet test StudentManagement.Tests --verbosity normal
```

## Quy ước Git
- `feat/`: tính năng mới
- `fix/`: sửa lỗi
- `docs/`: tài liệu
- `refactor/`: tái cấu trúc
