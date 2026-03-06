BACKUP DATABASE [StudentManagementDB] TO  DISK = N'C:\Backups\StudentManagementDB_Full.bak' 
WITH NOFORMAT, 
NOINIT,  
NAME = N'StudentManagementDB-Full Database Backup', 
SKIP, 
NOREWIND, 
NOUNLOAD,  
STATS = 10
GO