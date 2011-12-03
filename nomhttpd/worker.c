#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define READ_BUF_SIZE 512

static int
sockwrite(int fd, char *buf)
{
	return write(fd, buf, strlen(buf));
}

int
cgi(int fd) {
	FILE *fp;
	char *buf;
	int i;
	char c;

	if ((fp = popen("./test.cgi", "r")) == NULL) {
		return -1;
	}

	buf = (char *) malloc(sizeof (char) * READ_BUF_SIZE);
	for (i = 0; (i < READ_BUF_SIZE - 1) && ((c = fgetc(fp)) != EOF); i++) {
		buf[i] = c;
	}
	buf[i] = '\0';

	pclose(fp);

	sockwrite(fd, buf);
	free(buf);

	return 0;
}

int
staticfile(int fd)
{
	sockwrite(fd, "Content-type: text/html\r\n\r\n");
	sockwrite(fd, "<h1>Index</h1>\n");
	return 0;
}

int
worker(int serverfd, int fd)
{
	char read_buf[READ_BUF_SIZE];

	read(fd, read_buf, READ_BUF_SIZE);

	sockwrite(fd, "HTTP/1.0 200 OK\r\n");
	staticfile(fd);
	/*
	cgi(fd);
	*/

	close(fd);
	close(serverfd);

	return 0;
}

