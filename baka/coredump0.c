int main()
{
	int *a;
	a = (int *) 0xc0000000;
	*a = 0;
	return 0;
}
