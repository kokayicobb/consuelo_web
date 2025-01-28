export const isTokenExpired = (expire: number): boolean => {
  const currentTime = Math.floor(Date.now() / 1000);

  return expire > currentTime ? false : true;
}
