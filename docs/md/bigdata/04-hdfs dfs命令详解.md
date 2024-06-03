# 04-hdfs dfs命令详解

Hadoop 分布式文件系统 (HDFS) 的命令行工具，用于在 HDFS 上执行文件系统操作。以下是 `hdfs dfs` 命令的一些常见用法和解释：

1. **查看文件或目录内容：**
   - `hdfs dfs -ls <path>`：列出指定路径下的文件和目录信息。
   - `hdfs dfs -ls -h <path>`：以人类可读的格式列出文件和目录信息。
2. **创建目录或文件：**
   - `hdfs dfs -mkdir <path>`：创建一个新目录。
   - `hdfs dfs -touchz <path>`：创建一个空文件。
   - `hdfs dfs -copyFromLocal <local-src> <hdfs-dest>`：将本地文件复制到 HDFS。
3. **删除目录或文件：**
   - `hdfs dfs -rm <path>`：删除指定的文件。
   - `hdfs dfs -rmdir <dir>`：删除指定的目录。
4. **移动或重命名文件或目录：**
   - `hdfs dfs -mv <src> <dest>`：将文件或目录从一个路径移动到另一个路径，也可用于重命名。
   - `hdfs dfs -cp <src> <dest>`：复制文件或目录到另一个路径。
5. **上传和下载文件：**
   - `hdfs dfs -put <local-src> <hdfs-dest>`：上传本地文件到 HDFS。
   - `hdfs dfs -get <hdfs-src> <local-dest>`：从 HDFS 下载文件到本地。
6. **查看文件内容：**
   - `hdfs dfs -cat <path>`：显示文件内容。
   - `hdfs dfs -tail <path>`：显示文件末尾内容。
7. **权限管理：**
   - `hdfs dfs -chmod <permissions> <path>`：设置文件或目录的权限。
   - `hdfs dfs -chown <owner>:<group> <path>`：设置文件或目录的所有者和组。
8. **其他常用命令：**
   - `hdfs dfs -du <path>`：显示指定路径的磁盘使用情况。
   - `hdfs dfs -count <path>`：统计文件或目录的大小和数量。
   - `hdfs dfs -expunge`：永久删除回收站中的文件。

这些命令可以帮助您在 HDFS 上执行各种文件系统操作，管理数据和资源，确保数据的安全和可靠性。