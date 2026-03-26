using AutoMapper;
using StudentManagement.Core.DTOs.User;
using StudentManagement.Core.Entities;
using StudentManagement.Core.Interfaces.Repositories;
using StudentManagement.Core.Interfaces.Services;

namespace StudentManagement.Services.Services
{
    public class UserProfileService : IUserProfileService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public UserProfileService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<UserProfileDto> GetProfileAsync(string userId)
        {
            Account? account = await _unitOfWork.Repository<Account>()
                .FirstOrDefaultAsync((Account a) => a.AccountID == userId);

            if (account == null)
                throw new KeyNotFoundException("User not found");

            Person? person = await _unitOfWork.Repository<Person>()
                .FirstOrDefaultAsync((Person p) => p.AccountID == userId);

            if (person == null)
                throw new KeyNotFoundException("Person data not found");

            return new UserProfileDto
            {
                UserID = account.AccountID,
                Username = account.Username,
                Role = account.Role.ToString(),
                FullName = person.FullName,
                Email = person.Email,
                PhoneNumber = person.PhoneNumber,
                Address = person.Address,
                DateOfBirth = person.DateOfBirth,
                Gender = person.Gender.ToString(),
                Avatar = GetAvatarUrl(person),
                LastLogin = account.LastLogin,
                CreatedAt = account.CreatedAt
            };
        }

        public async Task<UserProfileDto> UpdateProfileAsync(string userId, UpdateProfileDto updateDto)
        {
            Person? person = await _unitOfWork.Repository<Person>()
                .FirstOrDefaultAsync((Person p) => p.AccountID == userId);

            if (person == null)
                throw new KeyNotFoundException("Person not found");

            // Update person info via domain method
            person.UpdatePersonInfo(
                updateDto.FullName,
                updateDto.Email,
                updateDto.PhoneNumber,
                person.DateOfBirth,
                person.Gender
            );

            await _unitOfWork.Repository<Person>().UpdateAsync(person);
            await _unitOfWork.SaveChangesAsync();

            return await GetProfileAsync(userId);
        }

        public async Task<bool> ChangePasswordAsync(string userId, ChangePasswordDto changePasswordDto)
        {
            Account? account = await _unitOfWork.Repository<Account>()
                .FirstOrDefaultAsync((Account a) => a.AccountID == userId);

            if (account == null)
                throw new KeyNotFoundException("Account not found");

            if (!account.VerifyPassword(changePasswordDto.CurrentPassword))
                throw new UnauthorizedAccessException("Current password is incorrect");

            account.SetPassword(changePasswordDto.NewPassword);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }

        public async Task<bool> UpdateAvatarAsync(string userId, string avatarUrl)
        {
            Person? person = await _unitOfWork.Repository<Person>()
                .FirstOrDefaultAsync((Person p) => p.AccountID == userId);

            if (person == null)
                return false;

            // Update avatar based on person type
            if (person is Student student)
            {
                student.SetAvatar(avatarUrl);
            }

            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        private string? GetAvatarUrl(Person person)
        {
            if (person is Student student)
                return student.Avatar;

            return null;
        }
    }
}