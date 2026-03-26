using AutoMapper;
using Moq;
using StudentManagement.Core.Interfaces.Repositories;
using StudentManagement.Services.Mappings;

namespace StudentManagement.Tests.TestHelpers
{
    /// <summary>
    /// Shared helper for creating mocked dependencies used across all test classes.
    /// </summary>
    public static class MockSetup
    {
        /// <summary>
        /// Creates an IMapper instance using the production MappingProfile.
        /// </summary>
        public static IMapper CreateMapper()
        {
            MapperConfiguration config = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile<MappingProfile>();
            });
            return config.CreateMapper();
        }

        /// <summary>
        /// Creates a Mock IUnitOfWork with a typed repository mock pre-configured.
        /// </summary>
        public static (Mock<IUnitOfWork> unitOfWork, Mock<IGenericRepository<T>> repository) CreateUnitOfWorkWithRepo<T>() where T : class
        {
            Mock<IUnitOfWork> mockUnitOfWork = new Mock<IUnitOfWork>();
            Mock<IGenericRepository<T>> mockRepository = new Mock<IGenericRepository<T>>();

            mockUnitOfWork.Setup(u => u.Repository<T>()).Returns(mockRepository.Object);
            mockUnitOfWork.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);
            mockUnitOfWork.Setup(u => u.BeginTransactionAsync()).Returns(Task.CompletedTask);
            mockUnitOfWork.Setup(u => u.CommitTransactionAsync()).Returns(Task.CompletedTask);
            mockUnitOfWork.Setup(u => u.RollbackTransactionAsync()).Returns(Task.CompletedTask);

            return (mockUnitOfWork, mockRepository);
        }
    }
}
