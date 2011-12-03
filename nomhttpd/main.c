#include <stdio.h>

#define PORT 31011
#define BACKLOG 10

int
main()
{
	printf("Hello nomhttpd\n");
	printf("port: %d\n", PORT);
	printf("pid: %d\n", getpid());

	return server(PORT, BACKLOG);
	/* not reached */
}
