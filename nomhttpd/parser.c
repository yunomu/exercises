
#define READ_BUF_SIZE 512

int
parse(int fd)
{
	char read_buf[READ_BUF_SIZE];

	read(fd, read_buf, READ_BUF_SIZE);

	return 0;
}

