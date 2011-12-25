#include <stdio.h>
#include <stdlib.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <signal.h>

int serverfd;

void
termfunc(int signum)
{
	close(serverfd);
	printf("stop server\n");
	exit(0);
}

void
childfunc(int signum)
{
	waitpid(-1, (int *) 0, 0);
}

int
setupserver(int port, int backlog)
{
	int fd;
	struct sockaddr_in *addr;

	if ((fd = socket(PF_INET, SOCK_STREAM, 0)) < 0) {
		perror("socket error");
		return -1;
	}

	addr = (struct sockaddr_in *) malloc(sizeof (struct sockaddr_in));
	addr->sin_family = PF_INET;
	addr->sin_addr.s_addr = htonl(INADDR_ANY);
	addr->sin_port = htons(port);

	if (bind(fd, (struct sockaddr *) addr, sizeof (struct sockaddr)) < 0) {
		perror("bind error");
		free(addr);
		return -1;
	}
	free(addr);

	if (listen(fd, backlog) < 0) {
		perror("listen error");
		return -1;
	}

	signal(SIGTERM, termfunc);
	signal(SIGHUP, termfunc);
	signal(SIGINT, termfunc);
	signal(SIGCHLD, childfunc);

	return fd;
}

int
server(int port, int backlog)
{
	serverfd = setupserver(port, backlog);
	if (serverfd < 0) {
		printf("server setup error\n");
		return -1;
	}

	while (1) {
		struct sockaddr_in write_addr;
		int write_addr_len;
		int fd;
		int child;

		fd = accept(serverfd, (struct sockaddr *) &write_addr, &write_addr_len);
		if (fd < 0) {
			perror("accept error");
			return -1;
		}

		if ((child = fork()) == 0) {
			exit(worker(serverfd, fd));
		}

		close(fd);
	}

	/* not reached */
	return -1;
}
