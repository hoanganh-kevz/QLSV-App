using System.Linq.Expressions;

namespace StudentManagement.Core.Interfaces.Repositories
{
    public interface IGenericRepository<T> where T : class
    {
        Task<List<T>> GetAllAsync();

        Task<T?> GetByIdAsync(object id);

        Task<int> CountAsync();

        Task AddAsync(T entity);

        void Update(T entity);

        void Delete(T entity);

        Task<List<T>> FindAsync(Expression<Func<T, bool>> predicate);
    }
}