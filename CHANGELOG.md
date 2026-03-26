# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-03-26

### Added
- **Week 1**: Clean Architecture setup, EF Core + SQL Server, JWT Authentication, BCrypt password hashing
- **Week 2**: GenericRepository + UnitOfWork, Student CRUD API, Class CRUD API with student management
- **Week 3**: Grade management API with auto-calculation, Dashboard statistics API, Teacher CRUD API
- **Week 4**: Excel export (EPPlus), PDF export (QuestPDF), Advanced search & filter, User management API, Profile management
- **Week 5**: xUnit + Moq unit tests (32/32 passing), AsNoTracking optimization, Serilog logging, Code cleanup
- **Week 6**: Docker deployment, production configuration, expanded seed data, documentation (README, Developer Guide, User Guide)

### Technical Details
- 11 API Controllers with full CRUD support
- 13 Service implementations
- 32 unit tests covering StudentService, GradeService, AuthService, and Grade entity logic
- AutoMapper for DTO mapping
- FluentValidation for request validation
- Swagger/OpenAPI documentation
