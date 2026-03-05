namespace StudentManagement.Core.Interfaces.Repositories
{
    public interface IUnitOfWork
    {
        IGenericRepository<T> Repository<T>() where T : class;

        Task<int> SaveChangesAsync();
    }
} 