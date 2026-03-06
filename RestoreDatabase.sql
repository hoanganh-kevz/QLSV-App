USE master;
GO

ALTER DATABASE StudentManagementDB 
SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
GO

RESTORE DATABASE StudentManagementDB
FROM DISK = 'C:\Backups\StudentManagementDB_Backup.bak'
WITH REPLACE;
GO

ALTER DATABASE StudentManagementDB 
SET MULTI_USER;
GO
